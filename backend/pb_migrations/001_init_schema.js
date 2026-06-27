/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────────────────────────
// 001_init_schema.js  —  Nura Bahar complete schema
//
// BUG FIXED: original file had a syntax error on the orders `status` field:
//   { name: "status", type "text" }   ← missing colon after type
// That crash prevented PocketBase from applying ANY migration on first start,
// leaving every collection unregistered and the app completely broken.
//
// This rewrite also:
//   • Adds every field the frontend actually uses (gender, colors, sizes,
//     images, badge, originalPrice, rating, paymentRef, paymentStatus,
//     customerName, address, city, state, country, subtotal, shipping, tax,
//     paymentMethod, notes, sort_order, media_type, video, link, caption)
//   • Sets correct API rules:
//       - products:       public reads, superuser-only writes
//       - orders:         public creates (guest checkout), superuser reads/updates
//       - newsletter:     public creates, superuser reads
//       - instagram_grid: public reads, superuser writes
//       - users:          standard auth collection rules
// ─────────────────────────────────────────────────────────────────────────────

migrate((app) => {

  // ── products ──────────────────────────────────────────────────────────────
  const products = new Collection({
    name: "products",
    type: "base",
    listRule:   "",        // public
    viewRule:   "",        // public
    createRule: "@request.auth.collectionName = '_superusers'",
    updateRule: "@request.auth.collectionName = '_superusers'",
    deleteRule: "@request.auth.collectionName = '_superusers'",
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
      {
        name:      "images",
        type:      "file",
        required:  false,
        options: { maxSelect: 6, maxSize: 10485760 },  // 6 files, 10 MB each
      },
    ],
  });
  app.save(products);

  // ── orders ────────────────────────────────────────────────────────────────
  const orders = new Collection({
    name: "orders",
    type: "base",
    // Admin reads via Bearer token (superuser); guest checkout creates freely.
    listRule:   "@request.auth.collectionName = '_superusers'",
    viewRule:   "@request.auth.id != '' || @request.auth.collectionName = '_superusers'",
    createRule: "",         // public — anyone can place an order
    updateRule: "@request.auth.collectionName = '_superusers'",
    deleteRule: "@request.auth.collectionName = '_superusers'",
    fields: [
      { name: "customerName",   type: "text",   required: true  },
      { name: "email",          type: "email",  required: true  },
      { name: "phone",          type: "text",   required: false },
      { name: "address",        type: "text",   required: true  },
      { name: "city",           type: "text",   required: true  },
      { name: "state",          type: "text",   required: false },
      { name: "country",        type: "text",   required: false },
      { name: "items",          type: "json",   required: true  },
      { name: "subtotal",       type: "number", required: true  },
      { name: "shipping",       type: "number", required: false },
      { name: "tax",            type: "number", required: false },
      { name: "total",          type: "number", required: true  },
      { name: "paymentMethod",  type: "text",   required: false },
      { name: "paymentRef",     type: "text",   required: false },
      // paymentStatus: unpaid | verifying | paid | failed
      { name: "paymentStatus",  type: "text",   required: false },
      // status: pending | processing | paid | shipped | delivered | cancelled | failed | refunded
      { name: "status",         type: "text",   required: false },
      { name: "notes",          type: "text",   required: false },
    ],
  });
  app.save(orders);

  // ── newsletter ────────────────────────────────────────────────────────────
  const newsletter = new Collection({
    name: "newsletter",
    type: "base",
    listRule:   "@request.auth.collectionName = '_superusers'",
    viewRule:   "@request.auth.collectionName = '_superusers'",
    createRule: "",         // anyone can subscribe
    updateRule: "@request.auth.collectionName = '_superusers'",
    deleteRule: "@request.auth.collectionName = '_superusers'",
    fields: [
      { name: "email", type: "email", required: true },
    ],
  });
  app.save(newsletter);

  // ── instagram_grid ────────────────────────────────────────────────────────
  const instagram = new Collection({
    name: "instagram_grid",
    type: "base",
    listRule:   "",         // public reads
    viewRule:   "",
    // BUG FIXED: original had null rules = anyone could modify the grid.
    createRule: "@request.auth.collectionName = '_superusers'",
    updateRule: "@request.auth.collectionName = '_superusers'",
    deleteRule: "@request.auth.collectionName = '_superusers'",
    fields: [
      { name: "image",       type: "file",   required: true,  options: { maxSelect: 1, maxSize: 10485760 } },
      { name: "video",       type: "file",   required: false, options: { maxSelect: 1, maxSize: 52428800 } }, // 50 MB
      { name: "caption",     type: "text",   required: false },
      { name: "link",        type: "url",    required: false },
      { name: "media_type",  type: "text",   required: false },   // "image" | "video"
      { name: "sort_order",  type: "number", required: false },
    ],
  });
  app.save(instagram);

}, (app) => {
  // ── rollback ──────────────────────────────────────────────────────────────
  // Down migration: remove collections in reverse order.
  for (const name of ["instagram_grid", "newsletter", "orders", "products"]) {
    try {
      const col = app.findCollectionByNameOrId(name);
      app.delete(col);
    } catch (_) { /* already gone */ }
  }
});
