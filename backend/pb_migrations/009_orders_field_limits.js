migrate(function(app) {

  // Checkout text fields (customerName, phone, address, city, state, notes) had no
  // max length, so an anonymous client could submit an arbitrarily large payload
  // (createRule is public, by design, for guest checkout) — cheap storage-bloat /
  // request-size abuse vector. Bounds are generous enough for any real address/name.
  var orders = app.findCollectionByNameOrId("orders");
  var limits = {
    customerName: 200,
    phone:        30,
    address:      500,
    city:         100,
    state:        100,
    country:      60,
    notes:        2000,
  };

  for (var name in limits) {
    var field = orders.fields.getByName(name);
    if (field) field.max = limits[name];
  }

  app.save(orders);

}, function(app) {
  var orders = app.findCollectionByNameOrId("orders");
  var names  = ["customerName", "phone", "address", "city", "state", "country", "notes"];
  for (var i = 0; i < names.length; i++) {
    var field = orders.fields.getByName(names[i]);
    if (field) field.max = 0;
  }
  app.save(orders);
});
