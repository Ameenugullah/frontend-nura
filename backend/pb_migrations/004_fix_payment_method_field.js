migrate(function(app) {
  try {
    var orders = app.findCollectionByNameOrId("orders");

    var fields = orders.fields;
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].name === "paymentMethod") {
        fields[i].type    = "text";
        fields[i].options = {};
        break;
      }
    }

    app.save(orders);
    $app.logger().info("Migration 004: paymentMethod field converted to text");
  } catch (err) {
    $app.logger().error("Migration 004 failed", "error", String(err));
    throw err;
  }
}, function(app) {
  // no rollback needed
});
