migrate(function(app) {
  var collection = app.findCollectionByNameOrId("orders");

  var existing = collection.fields.getByName("paymentMethod");
  if (existing && existing.type !== "text") {
    collection.fields.removeByName("paymentMethod");
    collection.fields.add({
      type:     "text",
      name:     "paymentMethod",
      required: false,
    });
    app.save(collection);
  }
}, function(app) {
  // no rollback
});
