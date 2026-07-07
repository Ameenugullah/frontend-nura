/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────────────────────────
// pb_hooks/payments.pb.js — Webhook handler for Paystack
//
// Required env var (set in Railway → divine-gratitude → Variables):
//   PAYSTACK_SECRET_KEY  — sk_live_xxx  from Paystack dashboard
// ─────────────────────────────────────────────────────────────────────────────

// ── Paystack webhook ──────────────────────────────────────────────────────────
routerAdd("POST", "/api/pb-hooks/paystack-webhook", (e) => {
  const secret = $os.getenv("PAYSTACK_SECRET_KEY");
  if (!secret) {
    $app.logger().warn("PAYSTACK_SECRET_KEY not set — skipping verification");
    return e.json(200, { status: "ok" });
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

  const event     = payload.event     || "";
  const reference = payload.data?.reference || "";

  $app.logger().info("Paystack webhook", "event", event, "ref", reference);

  if (!event.startsWith("charge.")) return e.json(200, { status: "ignored" });
  if (!reference.startsWith("NB_"))  return e.json(200, { status: "ignored" });

  const orderId = reference.slice(3);
  return updateOrderPayment(orderId, event === "charge.success" ? "paid" : "failed", reference);
});

// ── Shared helper ─────────────────────────────────────────────────────────────
function updateOrderPayment(orderId, paymentStatus, reference) {
  let order;
  try {
    order = $app.findRecordById("orders", orderId);
  } catch (_) {
    $app.logger().warn("Webhook: order not found", "orderId", orderId);
    return { json: (code, body) => null };
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
    $app.logger().error("Failed to save order", "error", String(err));
    return { json: (code, body) => null };
  }

  return null;
}