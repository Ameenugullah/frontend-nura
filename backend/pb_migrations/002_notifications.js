migrate(function(app) {

  // ── Fix orders access rules ─────────────────────────────────────────────────
  // Tighten viewRule/listRule: previously any authenticated user could read
  // any order by ID. Now customers can only access their own orders.
  try {
    var orders = app.findCollectionByNameOrId("orders");
    orders.listRule = "email = @request.auth.email || @request.auth.collectionName = '_superusers'";
    orders.viewRule = "email = @request.auth.email || @request.auth.collectionName = '_superusers'";
    app.save(orders);
  } catch (err) {
    // Log but don't abort — the notifications collection is the critical part
    console.error("002_notifications: failed to update orders rules:", String(err));
  }

  // ── notifications ──────────────────────────────────────────────────────────
  // Admin-only. Written by payments.pb.js after verified Paystack payment.
  // The frontend admin panel subscribes to this collection for the bell UI.
  var notifications = new Collection({
    name:       "notifications",
    type:       "base",
    listRule:   "@request.auth.collectionName = '_superusers'",
    viewRule:   "@request.auth.collectionName = '_superusers'",
    createRule: "@request.auth.collectionName = '_superusers'",
    updateRule: "@request.auth.collectionName = '_superusers'",
    deleteRule: "@request.auth.collectionName = '_superusers'",
    fields: [
      { name: "orderId",       type: "text",   required: true  },
      { name: "orderRef",      type: "text",   required: true  },
      { name: "customerName",  type: "text",   required: false },
      { name: "customerEmail", type: "text",   required: false },
      { name: "amount",        type: "number", required: false },
      { name: "paymentMethod", type: "text",   required: false },
      { name: "read",          type: "bool",   required: false },
    ],
  });
  app.save(notifications);

}, function(app) {
  try {
    var col = app.findCollectionByNameOrId("notifications");
    app.delete(col);
  } catch (_) {}
});
