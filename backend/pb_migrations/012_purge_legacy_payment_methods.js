migrate(function(app) {

  // Checkout is Paystack-only (migration 004 already restricted the select's
  // *future* values to ["paystack"]), but existing rows created before that
  // fix — paymentMethod "online" or "whatsapp" from the pre-Paystack test
  // period — were never deleted from the live DB, so they still surface in
  // the admin "Recent Orders" dashboard even though no code path can create
  // them anymore. Purge them here instead of relying on manual Admin UI
  // deletion, so this is reproducible across every environment.
  // NOTE: sort is intentionally "" (not "-created") — orders has no
  // created/updated autodate fields (same gap as products before migration
  // 011), and sorting by a field that doesn't exist errors out the query.
  var orders = app.findCollectionByNameOrId("orders");
  var stale  = app.findRecordsByFilter(
    orders,
    'paymentMethod != "paystack"',
    '',
    0,
    0,
  );

  for (var i = 0; i < stale.length; i++) {
    app.delete(stale[i]);
  }

}, function(app) {
  // Irreversible data purge — nothing to restore on rollback.
});
