import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Upload, Instagram, GripVertical, X } from 'lucide-react';
import {
  getInstagramPosts,
  createInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
} from '../../lib/api';

export default function AdminInstagramGrid() {
  const [posts,       setPosts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [confirm,     setConfirm]     = useState(null);
  const [saving,      setSaving]      = useState(false);

  const emptyForm = { caption: '', link: '', order: '' };
  const [form,         setForm]         = useState(emptyForm);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await getInstagramPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditTarget(null);
    setForm({ caption: '', link: '', order: String(posts.length + 1) });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (post) => {
    setEditTarget(post);
    setForm({ caption: post.caption, link: post.link, order: String(post.sort_order || '') });
    setImageFile(null);
    setImagePreview(post.image);
    setShowForm(true);
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editTarget && !imageFile) {
      alert('Please select an image.');
      return;
    }
    setSaving(true);
    try {
      const data = {
        caption:   form.caption,
        link:      form.link,
        order:     Number(form.order) || 0,
        imageFile: imageFile || undefined,
      };
      if (editTarget) await updateInstagramPost(editTarget.id, data);
      else             await createInstagramPost(data);
      setShowForm(false);
      await load();
    } catch (err) {
      alert('Error saving post: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteInstagramPost(id);
      setConfirm(null);
      await load();
    } catch (err) {
      alert('Error deleting post: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light font-display text-charcoal-800">Instagram Grid</h1>
          <p className="mt-1 text-xs font-body text-stone-400">Manage the 6 photos shown in the homepage @NuraBaharNigeria section.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load}
            className="flex items-center gap-2 text-xs transition-colors font-body text-stone-500 hover:text-charcoal-800">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {posts.length < 6 && (
            <button onClick={openNew} className="flex items-center gap-2 py-2 btn-primary">
              <Plus size={15} /> Add Post
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-stone-200 aspect-square animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {posts.map((post, idx) => (
              <div key={post.id} className="relative group">
                <div className="relative overflow-hidden aspect-square bg-stone-100">
                  {post.image ? (
                    <img src={post.image} alt={post.caption || `Post ${idx + 1}`}
                      className="object-cover w-full h-full" loading="lazy" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-stone-200">
                      <Instagram size={20} className="text-stone-400" />
                    </div>
                  )}
                  <span className="absolute top-1.5 left-1.5 bg-charcoal-900/80 text-white font-body text-[9px] px-1.5 py-0.5">
                    #{post.sort_order || idx + 1}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200 opacity-0 bg-charcoal-900/50 group-hover:opacity-100">
                    <button onClick={() => openEdit(post)}
                      className="flex items-center justify-center w-8 h-8 transition-colors bg-white text-charcoal-800 hover:bg-stone-100">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setConfirm(post.id)}
                      className="flex items-center justify-center w-8 h-8 transition-colors bg-white text-blush-500 hover:bg-blush-50">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {post.caption && (
                  <p className="mt-1 font-body text-[10px] text-stone-400 truncate">{post.caption}</p>
                )}
              </div>
            ))}

            {Array.from({ length: Math.max(0, 6 - posts.length) }).map((_, i) => (
              <button key={`empty-${i}`} onClick={openNew}
                className="flex flex-col items-center justify-center gap-2 transition-colors border-2 border-dashed border-stone-200 aspect-square hover:border-charcoal-700 hover:bg-stone-50 group">
                <Plus size={18} className="transition-colors text-stone-300 group-hover:text-charcoal-700" />
                <span className="font-body text-[10px] text-stone-300 group-hover:text-charcoal-700 transition-colors">Add photo</span>
              </button>
            ))}
          </div>

          {posts.length === 0 && (
            <p className="py-6 text-xs text-center font-body text-stone-400">
              No posts yet. Click "Add Post" or any empty slot to upload your first photo.
            </p>
          )}
        </>
      )}

      <div className="flex items-start gap-3 p-4 border bg-stone-50 border-stone-200">
        <GripVertical size={15} className="text-stone-400 mt-0.5 shrink-0" />
        <div className="space-y-1 text-xs font-body text-stone-500">
          <p>Use the <strong>Order</strong> field (1–6) to control which position each photo appears in on the homepage.</p>
          <p>The <strong>Link</strong> field should be the full URL to the Instagram post (e.g. <span className="font-mono">https://instagram.com/p/abc123</span>).</p>
          <p>Photos are displayed at 1:1 square ratio — portrait photos work best.</p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-charcoal-900/60">
          <div className="w-full max-w-md p-6 my-8 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-light font-display text-charcoal-800">
                {editTarget ? 'Edit Post' : 'Add Instagram Post'}
              </h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-stone-400" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label-xs">Photo {!editTarget && '*'}</label>
                {imagePreview ? (
                  <div className="relative mt-1 group aspect-square max-w-[200px]">
                    <img src={imagePreview} alt="Preview"
                      className="object-cover w-full h-full border border-stone-200" />
                    <button type="button"
                      onClick={() => { if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview); setImageFile(null); setImagePreview(null); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-charcoal-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={11} />
                    </button>
                    <label className="absolute bottom-0 left-0 right-0 py-1.5 text-center cursor-pointer bg-charcoal-900/70 font-body text-[10px] text-white hover:bg-charcoal-900 transition-colors">
                      Change photo
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImagePick} />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 py-8 mt-1 transition-colors border-2 border-dashed cursor-pointer border-stone-300 hover:border-charcoal-700 hover:bg-stone-50">
                    <Upload size={20} className="text-stone-400" />
                    <span className="text-xs font-body text-stone-400">Click to upload photo</span>
                    <span className="font-body text-[10px] text-stone-300">JPG, PNG, WEBP · square crops best</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImagePick} />
                  </label>
                )}
              </div>

              <div>
                <label className="label-xs">Instagram Post Link</label>
                <input type="url" value={form.link}
                  onChange={e => setForm(f => ({...f, link: e.target.value}))}
                  className="text-sm input-field"
                  placeholder="https://instagram.com/p/abc123" />
              </div>

              <div>
                <label className="label-xs">Caption (optional)</label>
                <input type="text" value={form.caption}
                  onChange={e => setForm(f => ({...f, caption: e.target.value}))}
                  className="text-sm input-field"
                  placeholder="New arrivals just dropped!" />
              </div>

              <div>
                <label className="label-xs">Order (1–6)</label>
                <input type="number" min={1} max={6} value={form.order}
                  onChange={e => setForm(f => ({...f, order: e.target.value}))}
                  className="w-24 text-sm input-field"
                  placeholder="1" />
                <p className="font-body text-[10px] text-stone-400 mt-1">Controls which position this photo appears in (1 = first).</p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="btn-primary flex-1 py-2.5 disabled:opacity-60">
                  {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Post'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60">
          <div className="w-full max-w-sm p-6 text-center bg-white">
            <Trash2 size={24} className="mx-auto mb-3 text-blush-500" />
            <h3 className="mb-2 text-sm font-semibold font-body text-charcoal-800">Remove this post?</h3>
            <p className="mb-5 text-xs font-body text-stone-400">It will be removed from the homepage grid.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirm)} className="flex-1 py-2 btn-blush">Remove</button>
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
