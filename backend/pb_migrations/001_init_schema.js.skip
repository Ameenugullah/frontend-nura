migrate((app) => {

  // ── products ──────────────────────────────────────────────────────────────
  const products = new Collection({
    name:        "products",
    type:        "base",
    listRule:    "",
    viewRule:    "",
    createRule:  "@request.auth.collectionName = '_superusers'",
    updateRule:  "@request.auth.collectionName = '_superusers'",
    deleteRule:  "@request.auth.collectionName = '_superusers'",
    fields: [
      { name: "name",          type: "text",   required: true  },
      { name: "category",      type: "text",   required: true  },
      { name: "gender",        type: "text",   required: false },
      { name: "price",         type: "number", required: true  },
      { name: "originalPrice", type: "number", required: false },
      { name: "description",   type: "text",   required: false },
      { name: "badge",         type: "text",   required: false },
      { name: "featured",      type: "bool",   required: false },
      { name: "stock",         type: "number", required: false },
      { name: "rating",        type: "number", required: false },
      { name: "colors",        type: "json",   required: false },
      { name: "sizes",         type: "json",   required: false },
      { name: "images",        type: "file",   required: false, options: { maxSelect: 6, maxSize: 10485760 } },
    ],
  });
  app.saveCollection(products);

  // ── orders ────────────────────────────────────────────────────────────────
  const orders = new Collection({
    name:        "orders",
    type:        "base",
    listRule:    "@request.auth.collectionName = '_superusers'",
    viewRule:    "@request.auth.id != '' || @request.auth.collectionName = '_superusers'",
    createRule:  "",
    updateRule:  "@request.auth.collectionName = '_superusers'",
    deleteRule:  "@request.auth.collectionName = '_superusers'",
    fields: [
      { name: "customerName",  type: "text",   required: true  },
      { name: "email",         type: "email",  required: true  },
      { name: "phone",         type: "text",   required: false },
      { name: "address",       type: "text",   required: true  },
      { name: "city",          type: "text",   required: true  },
      { name: "state",         type: "text",   required: false },
      { name: "country",       type: "text",   required: false },
      { name: "items",         type: "json",   required: true  },
      { name: "subtotal",      type: "number", required: true  },
      { name: "shipping",      type: "number", required: false },
      { name: "tax",           type: "number", required: false },
      { name: "total",         type: "number", required: true  },
      { name: "paymentMethod", type: "text",   required: false },
      { name: "paymentRef",    type: "text",   required: false },
      { name: "paymentStatus", type: "text",   required: false },
      { name: "status",        type: "text",   required: false },
      { name: "notes",         type: "text",   required: false },
    ],
  });
  app.saveCollection(orders);

  // ── newsletter ────────────────────────────────────────────────────────────
  const newsletter = new Collection({
    name:        "newsletter",
    type:        "base",
    listRule:    "@request.auth.collectionName = '_superusers'",
    viewRule:    "@request.auth.collectionName = '_superusers'",
    createRule:  "",
    updateRule:  "@request.auth.collectionName = '_superusers'",
    deleteRule:  "@request.auth.collectionName = '_superusers'",
    fields: [
      { name: "email", type: "email", required: true },
    ],
  });
  app.saveCollection(newsletter);

  // ── instagram_grid ────────────────────────────────────────────────────────
  const instagram = new Collection({
    name:        "instagram_grid",
    type:        "base",
    listRule:    "",
    viewRule:    "",
    createRule:  "@request.auth.collectionName = '_superusers'",
    updateRule:  "@request.auth.collectionName = '_superusers'",
    deleteRule:  "@request.auth.collectionName = '_superusers'",
    fields: [
      { name: "image",      type: "file",   required: true,  options: { maxSelect: 1, maxSize: 10485760 } },
      { name: "video",      type: "file",   required: false, options: { maxSelect: 1, maxSize: 52428800 } },
      { name: "caption",    type: "text",   required: false },
      { name: "link",       type: "url",    required: false },
      { name: "media_type", type: "text",   required: false },
      { name: "sort_order", type: "number", required: false },
    ],
  });
  app.saveCollection(instagram);

}, (app) => {
  for (const name of ["instagram_grid", "newsletter", "orders", "products"]) {
    try {
      const col = app.findCollectionByNameOrId(name);
      app.deleteCollection(col);
    } catch (_) {}
  }
});
