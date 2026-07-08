migrate(function(app) {

  // instagram_grid exists in the live DB (used by InstagramGrid.jsx, Footer.jsx,
  // AdminInstagramGrid.jsx, Contact.jsx) but was created directly via the Admin
  // UI and was never captured in a migration — a fresh DB rebuild would silently
  // drop it. Publicly readable, superuser-only writes (matches live rules).
  try {
    app.findCollectionByNameOrId("instagram_grid");
    return; // already exists, nothing to do
  } catch (_) { /* not found — create it below */ }

  var instagram = new Collection({
    name:     "instagram_grid",
    type:     "base",
    listRule: "",
    viewRule: "",
    fields: [
      {
        name: "image", type: "file", required: true,
        options: { maxSelect: 1, maxSize: 10485760 },
      },
      { name: "caption",    type: "text",   required: false },
      { name: "link",       type: "url",    required: false },
      { name: "sort_order", type: "number", required: false },
      { name: "media_type", type: "text",   required: false },
      {
        name: "video", type: "file", required: false,
        options: { maxSelect: 1, maxSize: 52428800, mimeTypes: ["video/webm", "video/mp4"] },
      },
    ],
  });
  app.save(instagram);

}, function(app) {
  try {
    var col = app.findCollectionByNameOrId("instagram_grid");
    app.delete(col);
  } catch (_) {}
});
