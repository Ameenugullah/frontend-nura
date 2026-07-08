/// <reference path="../pb_data/types.d.ts" />

function sendOrderConfirmationEmail(record) {
  const BUSINESS_EMAIL = "Nuraarabi@yahoo.com";
  const SITE_URL       = $os.getenv("VITE_SITE_URL") || "https://frontend-nura-production.up.railway.app";

  let items = [];
  try { items = JSON.parse(record.getString("items") || "[]"); } catch (_) {}

  const orderId   = record.id;
  const orderRef  = "NB-" + orderId.slice(-6).toUpperCase();
  const createdAt = new Date().toLocaleString("en-NG", {
    dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lagos",
  });

  const isPickup = record.getString("address") === "STORE PICKUP";
  const shipping = Number(record.getFloat("shipping") || 0);
  const subtotal = Number(record.getFloat("subtotal") || 0);
  const total    = Number(record.getFloat("total")    || 0);

  const d = {
    orderRef,
    orderId,
    createdAt,
    customerName:  record.getString("customerName"),
    customerEmail: record.getString("email"),
    customerPhone: record.getString("phone") || "N/A",
    paymentMethod: record.getString("paymentMethod") || "Paystack",
    paymentRef:    record.getString("paymentRef")    || "N/A",
    isPickup,
    address: record.getString("address"),
    city:    record.getString("city"),
    state:   record.getString("state"),
    items,
    subtotal,
    shipping,
    total,
    adminUrl: SITE_URL + "/admin/orders",
  };

  try {
    $app.newMailClient().send({
      from:    { name: "Nura Bahar Nigeria", address: BUSINESS_EMAIL },
      to:      [{ address: BUSINESS_EMAIL }],
      subject: "✅ New Order " + orderRef + " — ₦" + total.toLocaleString("en-NG"),
      html:    buildHtmlEmail(d),
      text:    buildPlainEmail(d),
    });
    $app.logger().info("Order email sent", "orderId", orderId, "ref", orderRef);
  } catch (err) {
    $app.logger().error("Order email failed", "orderId", orderId, "error", String(err));
  }
}

function buildHtmlEmail(d) {
  var itemRows = d.items.map(function(i) {
    var variant = [i.color, i.size && i.size !== "One Size" ? i.size : ""]
      .filter(Boolean).join(" / ");
    var lineTotal = (Number(i.price) * Number(i.quantity)).toLocaleString("en-NG");
    return "<tr>" +
      "<td style='padding:10px 0;border-bottom:1px solid #f5f3ef;font-size:13px;color:#2d2d2d;vertical-align:top;'>" +
        "<strong>" + escHtml(i.name) + "</strong>" +
        (variant ? "<br/><span style='color:#a09080;font-size:11px;'>" + escHtml(variant) + "</span>" : "") +
        "<br/><span style='color:#a09080;font-size:11px;'>Qty: " + Number(i.quantity) + "</span>" +
      "</td>" +
      "<td style='padding:10px 0;border-bottom:1px solid #f5f3ef;font-size:13px;color:#2d2d2d;text-align:right;vertical-align:top;font-weight:600;'>" +
        "₦" + lineTotal +
      "</td>" +
    "</tr>";
  }).join("");

  var deliveryHtml = d.isPickup
    ? "<p style='font-size:13px;color:#1a1a1a;'>Store Pickup — Kano</p>"
    : "<p style='font-size:13px;color:#1a1a1a;'>Home Delivery</p>" +
      "<p style='font-size:13px;color:#7a7068;margin-top:4px;'>" + escHtml(d.address) + ", " + escHtml(d.city) + (d.state ? ", " + escHtml(d.state) : "") + "</p>";

  var shippingDisplay = d.shipping === 0
    ? "<span style='color:#22c55e;font-weight:600;'>FREE</span>"
    : "₦" + d.shipping.toLocaleString("en-NG");

  return "<!DOCTYPE html><html lang='en'><head>" +
    "<meta charset='utf-8'/>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'/>" +
    "<title>New Order — Nura Bahar Nigeria</title>" +
    "<style>" +
      "*{box-sizing:border-box;margin:0;padding:0}" +
      "body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f4f0;color:#2d2d2d}" +
      ".w{max-width:600px;margin:32px auto;background:#fff;border:1px solid #e5e1d8}" +
      ".hdr{background:#1a1a1a;padding:32px 40px;text-align:center}" +
      ".logo{color:#fff;font-size:26px;font-weight:300;letter-spacing:.2em}" +
      ".sub{color:#a09080;font-size:10px;letter-spacing:.3em;text-transform:uppercase;margin-top:6px}" +
      ".badge{display:inline-block;background:#22c55e;color:#fff;padding:6px 18px;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin-top:20px;border-radius:2px}" +
      ".sec{padding:24px 40px;border-bottom:1px solid #f0ede8}" +
      ".sec-title{font-size:10px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:#b4a89a;margin-bottom:14px}" +
      ".row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:9px}" +
      ".lbl{font-size:13px;color:#7a7068;flex-shrink:0;margin-right:12px}" +
      ".val{font-size:13px;color:#1a1a1a;font-weight:500;text-align:right;word-break:break-word}" +
      ".items-tbl{width:100%;border-collapse:collapse}" +
      ".items-tbl th{font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#b4a89a;padding:0 0 10px;border-bottom:1px solid #ede9e4}" +
      ".totals{background:#faf9f7;padding:20px 40px}" +
      ".tr{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#7a7068}" +
      ".grand{color:#1a1a1a;font-size:16px;font-weight:700;padding-top:13px;margin-top:9px;border-top:1px solid #e5e1d8}" +
      ".ftr{padding:24px 40px;text-align:center;background:#faf9f7;border-top:1px solid #ede9e4}" +
      ".ftr a{color:#1a1a1a;text-decoration:none;font-size:13px;font-weight:600;border-bottom:1px solid #1a1a1a;padding-bottom:1px}" +
      ".ftr address{font-size:11px;color:#b4a89a;margin-top:14px;font-style:normal;line-height:1.7}" +
      "@media(max-width:480px){.sec,.totals,.ftr,.hdr{padding-left:20px;padding-right:20px}}" +
    "</style></head><body>" +
    "<div class='w'>" +
      "<div class='hdr'>" +
        "<p class='sub'>New Paid Order</p>" +
        "<div class='logo'>Nura Bahar</div>" +
        "<div class='badge'>✓ Payment Confirmed</div>" +
      "</div>" +
      "<div class='sec'><p class='sec-title'>Order Details</p>" +
        "<div class='row'><span class='lbl'>Reference</span><span class='val'><strong>" + escHtml(d.orderRef) + "</strong></span></div>" +
        "<div class='row'><span class='lbl'>Date &amp; Time</span><span class='val'>" + escHtml(d.createdAt) + "</span></div>" +
        "<div class='row'><span class='lbl'>Payment Method</span><span class='val'>" + escHtml(d.paymentMethod) + "</span></div>" +
        "<div class='row'><span class='lbl'>Payment Ref</span><span class='val' style='font-size:11px;color:#a09080;'>" + escHtml(d.paymentRef) + "</span></div>" +
      "</div>" +
      "<div class='sec'><p class='sec-title'>Customer</p>" +
        "<div class='row'><span class='lbl'>Name</span><span class='val'>" + escHtml(d.customerName) + "</span></div>" +
        "<div class='row'><span class='lbl'>Email</span><span class='val'>" + escHtml(d.customerEmail) + "</span></div>" +
        "<div class='row'><span class='lbl'>Phone</span><span class='val'>" + escHtml(d.customerPhone) + "</span></div>" +
      "</div>" +
      "<div class='sec'><p class='sec-title'>Delivery</p>" + deliveryHtml + "</div>" +
      "<div class='sec'><p class='sec-title'>Items Ordered</p>" +
        "<table class='items-tbl'><thead><tr>" +
          "<th style='text-align:left'>Product</th>" +
          "<th style='text-align:right'>Amount</th>" +
        "</tr></thead><tbody>" + itemRows + "</tbody></table>" +
      "</div>" +
      "<div class='totals'>" +
        "<div class='tr'><span>Subtotal</span><span>₦" + d.subtotal.toLocaleString("en-NG") + "</span></div>" +
        "<div class='tr'><span>Shipping</span><span>" + shippingDisplay + "</span></div>" +
        "<div class='tr grand'><span>Total Paid</span><span style='color:#c94f7a;'>₦" + d.total.toLocaleString("en-NG") + "</span></div>" +
      "</div>" +
      "<div class='ftr'>" +
        "<a href='" + escHtml(d.adminUrl) + "'>View Order in Dashboard →</a>" +
        "<address>Maiduguri Road, Opposite Chicken Flavour<br/>Kwanar Maggi, Dangyatin Plaza, Shop No. 7<br/>Kano, Nigeria</address>" +
      "</div>" +
    "</div>" +
  "</body></html>";
}

function buildPlainEmail(d) {
  var sep = "────────────────────────────────────────────────";
  var itemLines = d.items.map(function(i) {
    var variant = [i.color, i.size && i.size !== "One Size" ? i.size : ""].filter(Boolean).join(" / ");
    return "• " + i.name + (variant ? " (" + variant + ")" : "") + " × " + i.quantity +
           " — ₦" + (Number(i.price) * Number(i.quantity)).toLocaleString("en-NG");
  }).join("\n");

  var deliveryLine = d.isPickup
    ? "Store Pickup (customer will collect from Kano store)"
    : "Home Delivery\n  " + d.address + ", " + d.city + (d.state ? ", " + d.state : "");

  return [
    "NEW PAID ORDER — NURA BAHAR NIGERIA", sep, "",
    "Reference:    " + d.orderRef,
    "Order ID:     " + d.orderId,
    "Date & Time:  " + d.createdAt,
    "Payment:      PAID  (" + d.paymentMethod + ")",
    "Payment Ref:  " + d.paymentRef, "",
    sep, "CUSTOMER", sep,
    "Name:   " + d.customerName,
    "Email:  " + d.customerEmail,
    "Phone:  " + d.customerPhone, "",
    sep, "DELIVERY", sep,
    deliveryLine, "",
    sep, "ITEMS", sep,
    itemLines || "No items recorded", "",
    sep, "TOTALS", sep,
    "Subtotal: ₦" + d.subtotal.toLocaleString("en-NG"),
    "Shipping: " + (d.shipping === 0 ? "FREE" : "₦" + d.shipping.toLocaleString("en-NG")),
    "TOTAL:    ₦" + d.total.toLocaleString("en-NG"), "",
    sep,
    "Nura Bahar Nigeria",
    "Maiduguri Road, Opposite Chicken Flavour",
    "Kwanar Maggi, Dangyatin Plaza, Shop No. 7",
    "Kano, Nigeria",
  ].join("\n");
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
