migrate(function(app) {

  // Live orders rules had drifted from intent in two ways:
  //  - viewRule still required @request.auth.email match, so the guest
  //    checkout /order/:id/verifying page (unauthenticated) got 403/404
  //    when polling payment status.
  //  - updateRule/deleteRule were "@request.auth.id != ''" — ANY signed-up
  //    user, not just admins, could directly PATCH/DELETE any order. Since
  //    users can self-register, this let any customer set their own (or
  //    someone else's) paymentStatus to "paid" via the API, bypassing
  //    pb_hooks entirely.
  // listRule is intentionally left as the original email-scoped rule (not
  // locked to superusers) — the "My Orders" page (Orders.jsx, via
  // getOrdersByEmail) depends on logged-in customers listing their own
  // orders by matching @request.auth.email.
  var orders = app.findCollectionByNameOrId("orders");

  orders.listRule   = "email = @request.auth.email || @request.auth.collectionName = '_superusers'";
  orders.viewRule   = ""; // public — required for unauthenticated payment-status polling by id
  orders.createRule = "";
  orders.updateRule = "@request.auth.collectionName = '_superusers'";
  orders.deleteRule = "@request.auth.collectionName = '_superusers'";

  app.save(orders);

}, function(app) {
  var orders = app.findCollectionByNameOrId("orders");

  orders.listRule   = "email = @request.auth.email || @request.auth.collectionName = '_superusers'";
  orders.viewRule   = "email = @request.auth.email || @request.auth.collectionName = '_superusers'";
  orders.createRule = "";
  orders.updateRule = "@request.auth.id != ''";
  orders.deleteRule = "@request.auth.id != ''";

  app.save(orders);
});
