migrate(function(app) {

  // The Instagram grid feature (homepage section + admin management page) was
  // removed from the codebase entirely — both frontend consumers were already
  // orphaned dead code with no working API calls behind them. Deleting the
  // collection removes its 6 records and their uploaded image/video files too.
  try {
    var instagram = app.findCollectionByNameOrId("instagram_grid");
    app.delete(instagram);
  } catch (_) { /* already gone — nothing to do */ }

}, function(app) {
  // Irreversible — deleting the collection also deletes its uploaded files
  // (the 5 photos + 1 video), which cannot be restored by a migration rollback.
});
