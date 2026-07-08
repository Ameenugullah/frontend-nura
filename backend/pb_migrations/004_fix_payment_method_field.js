migrate(function(app) {

  // Live DB still has paymentMethod as a "select" field restricted to the old
  // ["online", "whatsapp"] values (checkout is Paystack-only now). Earlier
  // attempts to remove+recreate this field as text were rejected by PocketBase
  // mid-migration, so instead we mutate the select's allowed values in place —
  // existing historical "online"/"whatsapp" rows are unaffected, only new writes
  // are restricted to "paystack".
  var collection = app.findCollectionByNameOrId("orders");
  var field = collection.fields.getByName("paymentMethod");

  if (field && Array.isArray(field.values)) {
    field.values = ["paystack"];
    app.save(collection);
  }

}, function(app) {
  var collection = app.findCollectionByNameOrId("orders");
  var field = collection.fields.getByName("paymentMethod");

  if (field && Array.isArray(field.values)) {
    field.values = ["online", "whatsapp"];
    app.save(collection);
  }
});
