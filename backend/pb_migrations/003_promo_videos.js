migrate(function(app) {

  // ── promo_videos ───────────────────────────────────────────────────────────
  // Stores up to 2 promotional videos (slot 1 and slot 2) displayed on the
  // homepage video showcase. Publicly readable so the frontend can fetch them
  // without authentication. Write access is superadmin-only.
  var promoVideos = new Collection({
    name:       "promo_videos",
    type:       "base",
    listRule:   "",
    viewRule:   "",
    createRule: "@request.auth.collectionName = '_superusers'",
    updateRule: "@request.auth.collectionName = '_superusers'",
    deleteRule: "@request.auth.collectionName = '_superusers'",
    fields: [
      { name: "slot",  type: "number", required: true  },
      { name: "title", type: "text",   required: false },
      {
        name: "video", type: "file", required: false,
        options: { maxSelect: 1, maxSize: 209715200 },
      },
    ],
  });
  app.save(promoVideos);

}, function(app) {
  try {
    var col = app.findCollectionByNameOrId("promo_videos");
    app.delete(col);
  } catch (_) {}
});
