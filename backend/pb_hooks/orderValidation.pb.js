/// <reference path="../pb_data/types.d.ts" />

// Recomputes order pricing server-side from the live products collection.
// Without this, a client can POST /api/collections/orders/records with a
// forged items/subtotal/shipping/total payload (createRule is public, by
// design, for guest checkout) and then only actually pay Paystack the
// tampered (lower) amount. The verify-payment/webhook amount check compares
// Paystack's charged amount against order.total — this hook is what makes
// that comparison meaningful, by making order.total untamperable.
//
// Keep SHIPPING_* in sync with frontend/src/lib/orderConstants.js.
var SHIPPING_FLAT_RATE   = 2500;
var SHIPPING_KANO_FREE   = 200000;
var SHIPPING_NG_FREE     = 300000;
var PRICE_EPSILON        = 1; // naira — tolerance for float rounding, not a fraud gap

onRecordCreate((e) => {
  $app.logger().info("Order create: validating pricing");

  // e.record here is the incoming, not-yet-saved record bound straight from the
  // HTTP request body. Unlike a record re-fetched after save (e.g. in
  // payments.pb.js/emails.pb.js, where getString("items") reliably returns the
  // raw JSON text), a JSON-type field on an unsaved incoming record may already
  // be bound as a native array/object rather than a string — handle both shapes.
  var itemsRaw = e.record.get("items");
  var items;
  if (Array.isArray(itemsRaw)) {
    items = itemsRaw;
  } else if (typeof itemsRaw === "string") {
    try {
      items = JSON.parse(itemsRaw || "[]");
    } catch (err) {
      $app.logger().error("Order create: could not parse items string", "raw", itemsRaw, "error", String(err));
      throw new BadRequestError("Invalid items payload.");
    }
  } else {
    $app.logger().error("Order create: unexpected items type", "type", typeof itemsRaw);
    throw new BadRequestError("Invalid items payload.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError("Order must contain at least one item.");
  }

  var computedSubtotal = 0;
  var correctedItems   = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i] || {};
    var qty  = Number(item.quantity);

    if (!item.id || !(qty > 0)) {
      throw new BadRequestError("Invalid item in order.");
    }

    var product;
    try {
      product = $app.findRecordById("products", item.id);
    } catch (err) {
      $app.logger().error("Order create: unknown product", "productId", item.id, "error", String(err));
      throw new BadRequestError("Unknown product in order: " + item.id);
    }

    var price = product.getFloat("price");
    computedSubtotal += price * qty;
    correctedItems.push({
      id:       item.id,
      name:     product.getString("name"),
      price:    price,
      color:    item.color || "",
      size:     item.size  || "",
      quantity: qty,
    });
  }

  var isPickup = e.record.getString("address") === "STORE PICKUP";
  var state    = (e.record.getString("state") || "").toLowerCase();

  var computedShipping = 0;
  if (!isPickup) {
    var freeThreshold = state === "kano" ? SHIPPING_KANO_FREE : SHIPPING_NG_FREE;
    computedShipping  = computedSubtotal >= freeThreshold ? 0 : SHIPPING_FLAT_RATE;
  }

  // No tax feature exists yet — force it to 0 rather than trust a client-supplied value.
  var computedTotal   = computedSubtotal + computedShipping;
  var submittedTotal  = e.record.getFloat("total");

  if (Math.abs(computedTotal - submittedTotal) > PRICE_EPSILON) {
    $app.logger().error("Order create: price mismatch, rejecting",
      "submittedTotal", submittedTotal, "computedTotal", computedTotal);
    throw new BadRequestError("Order total does not match current pricing. Please refresh and try again.");
  }

  // Persist server-computed truth even when the aggregate total already matched —
  // closes the gap where individual item prices are forged but happen to net out
  // to the same total.
  e.record.set("items",    JSON.stringify(correctedItems));
  e.record.set("subtotal", computedSubtotal);
  e.record.set("shipping", computedShipping);
  e.record.set("tax",      0);
  e.record.set("total",    computedTotal);

  e.next();
}, "orders");
