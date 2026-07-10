migrate(function(app) {

  // Delivery fees/shipping charges have been removed from the app entirely —
  // checkout now only asks Pickup vs Delivery, with no fee calculation, so the
  // "shipping" column on orders is dead weight.
  var orders = app.findCollectionByNameOrId("orders");
  var field  = orders.fields.getByName("shipping");
  if (field) {
    orders.fields.removeByName("shipping");
    app.save(orders);
  }

}, function(app) {
  var orders = app.findCollectionByNameOrId("orders");
  if (!orders.fields.getByName("shipping")) {
    orders.fields.add(new NumberField({
      name:     "shipping",
      required: false,
    }));
    app.save(orders);
  }
});
