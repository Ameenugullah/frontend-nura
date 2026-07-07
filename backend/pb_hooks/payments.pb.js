/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────────────────────────
// pb_hooks/payments.pb.js — Webhook handler for Paystack
//
// Required env var (set in Railway → divine-gratitude → Variables):
//   PAYSTACK_SECRET_KEY  — sk_live_xxx  from Paystack dashboard
//
// Security model:
//   1. Every inbound webhook is verified with HMAC-SHA512 before any action.
//   2. updateOrderPayment is idempotent — duplicate webhooks are safe.
//   3. Only "charge.success" events trigger payment confirmation.
//   4. Notifications are created server-side; the frontend never writes them.
// ─────────────────────────────────────────────────────────────────────────────

routerAdd("POST", "/api/pb-hooks/paystack-webhook", (e) => {
  const secret = $os.getenv("PAYSTACK_SECRET_KEY");
  if (!secret) {
    $app.logger().warn("PAYSTACK_SECRET_KEY not set — rejecting webhook");
    return e.json(500, { error: "server misconfiguration" });
  }

  let bodyStr = "";
  try { bodyStr = toString(e.request.body); } catch (_) {
    return e.json(400, { error: "cannot read body" });
  }

  const sig      = e.request.header.get("x-paystack-signature") || "";
  const expected = $security.hs512(secret, bodyStr);
  if (sig !== expected) {
    $app.logger().warn("Paystack webhook: invalid signature");
    return e.json(401, { error: "invalid signature" });
  }

  let payload;
  try { payload = JSON.parse(bodyStr); } catch (_) {
    return e.json(400, { error: "invalid JSON" });
  }

  const event     = payload.event          || "";
  const reference = payload.data?.reference || "";

  $app.logger().info("Paystack webhook received", "event", event, "ref", reference);

  if (!event.startsWith("charge.")) return e.json(200, { status: "ignored" });
  if (!reference.startsWith("NB_"))  return e.json(200, { status: "ignored" });

  const orderId      = reference.slice(3);
  const paymentStatus = event === "charge.success" ? "paid" : "failed";
  updateOrderPayment(orderId, paymentStatus, reference);
  return e.json(200, { status: "ok" });
});

// ── Shared helper ─────────────────────────────────────────────────────────────
function updateOrderPayment(orderId, paymentStatus, reference) {
  let order;
  try {
    order = $app.findRecordById("orders", orderId);
  } catch (_) {
    $app.logger().warn("Webhook: order not found", "orderId", orderId);
    return;
  }

  // Idempotency guard — prevents duplicate emails/notifications if Paystack
  // delivers the same webhook more than once.
  if (order.getString("paymentStatus") === paymentStatus) {
    $app.logger().info("Webhook: already in target state — skipped", "orderId", orderId, "status", paymentStatus);
    return;
  }

  order.set("paymentStatus", paymentStatus);
  order.set("paymentRef",    reference);
  if (paymentStatus === "paid") {
    order.set("status", "processing");
  }

  try {
    $app.save(order);
    $app.logger().info("Order payment updated", "orderId", orderId, "status", paymentStatus);
  } catch (err) {
    $app.logger().error("Failed to save order", "orderId", orderId, "error", String(err));
    return;
  }

  if (paymentStatus === "paid") {
    createOrderNotification(order);
  }
}

// ── Notification creation ─────────────────────────────────────────────────────
// Writes a record to the `notifications` collection (admin-only).
// The frontend reads this collection via PocketBase realtime to power the
// notification bell — it never directly observes raw order updates.
function createOrderNotification(order) {
  try {
    const col = $app.findCollectionByNameOrId("notifications");
    const rec = new Record(col);
    rec.set("orderId",       order.id);
    rec.set("orderRef",      "NB-" + order.id.slice(-6).toUpperCase());
    rec.set("customerName",  order.getString("customerName"));
    rec.set("customerEmail", order.getString("email"));
    rec.set("amount",        order.getFloat("total"));
    rec.set("paymentMethod", order.getString("paymentMethod") || "paystack");
    rec.set("read",          false);
    $app.save(rec);
    $app.logger().info("Notification created", "orderId", order.id);
  } catch (err) {
    // Non-fatal: notification failure must not affect payment confirmation
    $app.logger().error("Failed to create notification", "orderId", order.id, "error", String(err));
  }
}
