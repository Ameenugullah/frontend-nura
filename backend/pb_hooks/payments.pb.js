/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────────────────────────
// pb_hooks/payments.pb.js — Webhook handler for Paystack
//
// Required env var (set in Railway → divine-gratitude → Variables):
//   PAYSTACK_SECRET_KEY  — sk_live_xxx  from Paystack dashboard
//
// Security model:
//   1. HMAC-SHA512 signature verified before any action.
//   2. updateOrderPayment is idempotent — duplicate webhooks are no-ops.
//   3. Email and notification are called directly here (not via onRecord* hooks)
//      so they fire exactly once, only after a verified successful payment.
//   4. The frontend never marks orders as paid.
//
// Note: emails.pb.js is loaded before this file (alphabetical order) so
// sendOrderConfirmationEmail() is already defined when this file runs.
// ─────────────────────────────────────────────────────────────────────────────

routerAdd("POST", "/api/pb-hooks/paystack-webhook", function(e) {
  var secret = $os.getenv("PAYSTACK_SECRET_KEY");
  if (!secret) {
    $app.logger().warn("PAYSTACK_SECRET_KEY not set — rejecting webhook");
    return e.json(500, { error: "server misconfiguration" });
  }

  var bodyStr = "";
  try { bodyStr = toString(e.request.body); } catch (_) {
    return e.json(400, { error: "cannot read body" });
  }

  var sig      = e.request.header.get("x-paystack-signature") || "";
  var expected = $security.hs512(secret, bodyStr);
  if (sig !== expected) {
    $app.logger().warn("Paystack webhook: invalid signature");
    return e.json(401, { error: "invalid signature" });
  }

  var payload;
  try { payload = JSON.parse(bodyStr); } catch (_) {
    return e.json(400, { error: "invalid JSON" });
  }

  var event     = payload.event              || "";
  var reference = (payload.data && payload.data.reference) || "";

  $app.logger().info("Paystack webhook received", "event", event, "ref", reference);

  if (event.indexOf("charge.") !== 0) return e.json(200, { status: "ignored" });
  if (reference.indexOf("NB_")  !== 0) return e.json(200, { status: "ignored" });

  var orderId       = reference.slice(3);
  var paymentStatus = event === "charge.success" ? "paid" : "failed";
  updateOrderPayment(orderId, paymentStatus, reference);
  return e.json(200, { status: "ok" });
});

// ── Payment updater ───────────────────────────────────────────────────────────
function updateOrderPayment(orderId, paymentStatus, reference) {
  var order;
  try {
    order = $app.findRecordById("orders", orderId);
  } catch (_) {
    $app.logger().warn("Webhook: order not found", "orderId", orderId);
    return;
  }

  // Idempotency guard — safe against Paystack duplicate webhook delivery
  if (order.getString("paymentStatus") === paymentStatus) {
    $app.logger().info("Webhook: order already in target state, skipped",
      "orderId", orderId, "status", paymentStatus);
    return;
  }

  order.set("paymentStatus", paymentStatus);
  order.set("paymentRef",    reference);
  if (paymentStatus === "paid") {
    order.set("status", "processing");
  }

  try {
    $app.save(order);
    $app.logger().info("Order updated", "orderId", orderId, "status", paymentStatus);
  } catch (err) {
    $app.logger().error("Failed to save order", "orderId", orderId, "error", String(err));
    return;
  }

  if (paymentStatus === "paid") {
    // Call directly — not via hook — guarantees exactly-once delivery
    createOrderNotification(order);
    sendOrderConfirmationEmail(order); // defined in emails.pb.js (loads first)
  }
}

// ── Notification writer ───────────────────────────────────────────────────────
function createOrderNotification(order) {
  try {
    var col = $app.findCollectionByNameOrId("notifications");
    var rec = new Record(col);
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
    // Non-fatal — payment confirmation must not depend on notification success
    $app.logger().error("Failed to create notification", "orderId", order.id, "error", String(err));
  }
}
