/// <reference path="../pb_data/types.d.ts" />

// Called by the frontend immediately after the Paystack inline popup reports
// success, so payment confirmation doesn't depend solely on the Paystack
// dashboard webhook being configured/delivered. The client only ever supplies
// orderId + reference — the actual paid/failed determination and the amount
// comparison happen here, server-side, against Paystack's own verify API.
routerAdd("POST", "/api/verify-payment", function(e) {
  $app.logger().info("verify-payment: request received");

  var secret = $os.getenv("PAYSTACK_SECRET_KEY");
  if (!secret) {
    $app.logger().warn("PAYSTACK_SECRET_KEY not set — rejecting verify request");
    return e.json(500, { error: "server misconfiguration" });
  }

  var data = {};
  try { e.bindBody(data); } catch (err) {
    return e.json(400, { error: "invalid body" });
  }

  var orderId   = String(data.orderId   || "");
  var reference = String(data.reference || "");

  if (!orderId || !reference || reference !== ("NB_" + orderId)) {
    $app.logger().warn("verify-payment: orderId/reference mismatch", "orderId", orderId, "reference", reference);
    return e.json(400, { error: "orderId/reference mismatch" });
  }

  var order;
  try {
    order = $app.findRecordById("orders", orderId);
  } catch (err) {
    return e.json(404, { error: "order not found" });
  }

  if (order.getString("paymentStatus") === "paid") {
    return e.json(200, { status: "paid" });
  }

  var res;
  try {
    res = $http.send({
      url:     "https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference),
      method:  "GET",
      headers: { "Authorization": "Bearer " + secret },
      timeout: 20,
    });
  } catch (err) {
    // Network/timeout calling Paystack — transient. Don't fail the order;
    // the verifying page's bounded polling (and/or the webhook) can still
    // resolve it later.
    $app.logger().error("verify-payment: Paystack request failed", "orderId", orderId, "error", String(err));
    return e.json(502, { error: "could not reach Paystack, will retry via polling" });
  }

  if (res.statusCode !== 200 || !res.json || res.json.status !== true) {
    $app.logger().warn("verify-payment: Paystack verify call unsuccessful", "orderId", orderId, "statusCode", res.statusCode);
    return e.json(502, { error: "paystack verify call unsuccessful" });
  }

  var txn           = res.json.data || {};
  var expectedKobo   = Math.round(order.getFloat("total") * 100);

  if (txn.status !== "success") {
    $app.logger().info("verify-payment: transaction not successful", "orderId", orderId, "txnStatus", txn.status);
    updateOrderPayment(orderId, "failed", reference);
    return e.json(200, { status: "failed" });
  }

  if (Number(txn.amount) !== expectedKobo) {
    $app.logger().error("verify-payment: amount mismatch", "orderId", orderId, "expected", expectedKobo, "got", txn.amount);
    return e.json(200, { status: "amount_mismatch" });
  }

  updateOrderPayment(orderId, "paid", reference);
  return e.json(200, { status: "paid" });
});

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

function updateOrderPayment(orderId, paymentStatus, reference) {
  var order;
  try {
    order = $app.findRecordById("orders", orderId);
  } catch (err) {
    $app.logger().warn("Webhook: order not found", "orderId", orderId, "error", String(err));
    return;
  }

  if (order.getString("paymentStatus") === paymentStatus) {
    $app.logger().info("Webhook: already in target state, skipped", "orderId", orderId, "status", paymentStatus);
    return;
  }

  order.set("paymentStatus", paymentStatus);
  order.set("paymentRef",    reference);
  if (paymentStatus === "paid") {
    order.set("status", "processing");
  }

  try {
    $app.save(order);
    $app.logger().info("Order updated", "orderId", orderId, "paymentStatus", paymentStatus);
  } catch (err) {
    $app.logger().error("Failed to save order", "orderId", orderId, "error", String(err));
    return;
  }

  if (paymentStatus === "paid") {
    createOrderNotification(order);
    sendOrderConfirmationEmail(order);
  }
}

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
    $app.logger().error("Failed to create notification", "orderId", order.id, "error", String(err));
  }
}
