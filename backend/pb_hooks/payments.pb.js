/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/pb-hooks/paystack-webhook", (e) => {
  const secret = $os.getenv("PAYSTACK_SECRET_KEY");
  if (!secret) {
    $app.logger().warn("PAYSTACK_SECRET_KEY not set");
    return e.json(200, { status: "ok" });
  }

  let bodyStr = "";
  try { bodyStr = toString(e.request.body); } catch (_) {
    return e.json(400, { error: "cannot read body" });
  }

  const paystackSig = e.request.header.get("x-paystack-signature") || "";
  const expectedSig = $security.hs512(secret, bodyStr);
  if (paystackSig !== expectedSig) {
    return e.json(401, { error: "invalid signature" });
  }

  let payload;
  try { payload = JSON.parse(bodyStr); } catch (_) {
    return e.json(400, { error: "invalid JSON" });
  }

  const event = payload.event || "";
  const data = payload.data || {};
  const reference = data.reference || "";

  if (!event.startsWith("charge.") || !reference.startsWith("NB_")) {
    return e.json(200, { status: "ignored" });
  }

  const orderId = reference.slice(3);
  let order;
  try {
    order = $app.findRecordById("orders", orderId);
  } catch (_) {
    return e.json(200, { status: "order_not_found" });
  }

  if (event === "charge.success") {
    order.set("paymentStatus", "paid");
    order.set("status", "processing");
    order.set("paymentRef", reference);
  } else {
    order.set("paymentStatus", "failed");
  }

  try { $app.save(order); } catch (err) {
    return e.json(500, { error: "failed to update order" });
  }

  return e.json(200, { status: "ok" });
});