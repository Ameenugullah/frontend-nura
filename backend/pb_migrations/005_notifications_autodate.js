migrate(function(app) {

  // notifications was created via JS migration without explicit "created"/"updated"
  // autodate fields, so it never got them (unlike collections made through the Admin
  // UI wizard, which adds them by default). The admin bell UI sorts by -created,
  // which PocketBase rejects with 400 when the field doesn't exist.
  var notifications = app.findCollectionByNameOrId("notifications");

  if (!notifications.fields.getByName("created")) {
    notifications.fields.add(new AutodateField({
      name:     "created",
      onCreate: true,
      onUpdate: false,
    }));
  }
  if (!notifications.fields.getByName("updated")) {
    notifications.fields.add(new AutodateField({
      name:     "updated",
      onCreate: true,
      onUpdate: true,
    }));
  }

  app.save(notifications);

}, function(app) {
  try {
    var notifications = app.findCollectionByNameOrId("notifications");
    notifications.fields.removeByName("created");
    notifications.fields.removeByName("updated");
    app.save(notifications);
  } catch (_) {}
});
