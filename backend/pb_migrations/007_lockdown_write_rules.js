migrate(function(app) {

  // products and newsletter had drifted to "@request.auth.id != ''" (any
  // signed-up user) for write rules, instead of the intended superuser-only
  // access. Since users can self-register, any customer could create/edit/
  // delete products, or read/update/delete other people's newsletter rows.
  var products = app.findCollectionByNameOrId("products");
  products.createRule = "@request.auth.collectionName = '_superusers'";
  products.updateRule = "@request.auth.collectionName = '_superusers'";
  products.deleteRule = "@request.auth.collectionName = '_superusers'";
  app.save(products);

  var newsletter = app.findCollectionByNameOrId("newsletter");
  newsletter.listRule   = "@request.auth.collectionName = '_superusers'";
  newsletter.viewRule   = "@request.auth.collectionName = '_superusers'";
  newsletter.updateRule = "@request.auth.collectionName = '_superusers'";
  newsletter.deleteRule = "@request.auth.collectionName = '_superusers'";
  app.save(newsletter);

}, function(app) {
  var products = app.findCollectionByNameOrId("products");
  products.createRule = "@request.auth.id != ''";
  products.updateRule = "@request.auth.id != ''";
  products.deleteRule = "@request.auth.id != ''";
  app.save(products);

  var newsletter = app.findCollectionByNameOrId("newsletter");
  newsletter.listRule   = "@request.auth.id != ''";
  newsletter.viewRule   = "@request.auth.id != ''";
  newsletter.updateRule = "@request.auth.id != ''";
  newsletter.deleteRule = "@request.auth.id != ''";
  app.save(newsletter);
});
