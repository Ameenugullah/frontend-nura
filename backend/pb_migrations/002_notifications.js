migrate((app) => {

  // ── Fix orders access rules ─────────────────────────────────────────────────
  // Previous viewRule allowed ANY authenticated user to read any order by ID.
  // This tightens it: customers can only access their own orders.
  try {
    const orders = app.findCollectionByNameOrId("orders");
    orders.listRule = "email = @request.auth.email || @request.auth.collectionName = '_superusers'";
    orders.viewRule = "email = @request.auth.email || @request.auth.collectionName = '_superusers'";
    app.saveCollection(orders);
  } catch (err) {
    console.error("002_notifications: failed to update orders rules:", String(err));
  }

  // ── notifications ──────────────────────────────────────────────────────────
  // Admin-only. Created exclusively by the payments.pb.js webhook hook via
  // $app.save(), which bypasses API rules. The frontend reads this collection
  // to power the admin notification bell.
  const notifications = new Collection({
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
  app.saveCollection(notifications);

}, (app) => {
  try {
    const col = app.findCollectionByNameOrId("notifications");
    app.deleteCollection(col);
  } catch (_) {}
});
