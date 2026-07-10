migrate(function(app) {

  // products was created via JS migration without explicit "created"/"updated"
  // autodate fields (same root cause previously found on "notifications" in
  // 005_notifications_autodate.js). Any future query that sorts by -created
  // (e.g. an admin "newest first" view) fails with a 400 until this exists.
  var products = app.findCollectionByNameOrId("products");

  if (!products.fields.getByName("created")) {
    products.fields.add(new AutodateField({
      name:     "created",
      onCreate: true,
      onUpdate: false,
    }));
  }
  if (!products.fields.getByName("updated")) {
    products.fields.add(new AutodateField({
      name:     "updated",
      onCreate: true,
      onUpdate: true,
    }));
  }

  app.save(products);

}, function(app) {
  try {
    var products = app.findCollectionByNameOrId("products");
    products.fields.removeByName("created");
    products.fields.removeByName("updated");
    app.save(products);
  } catch (_) {}
});
