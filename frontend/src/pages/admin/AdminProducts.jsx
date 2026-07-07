import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Upload, Eye, Package, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ALL_CATEGORIES, CATEGORIES_GROUPED, isFragranceCategory } from '../../lib/categories';

export default function AdminProducts() {
  const { adminProducts, addProduct, editProduct, deleteProduct, updateStock } = useAdmin();
  const [search,     setSearch]     = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirm,    setConfirm]    = useState(null);
  const [saving,     setSaving]     = useState(false);

  const emptyForm = {
    name: '', category: ALL_CATEGORIES[0], gender: '',
    price: '', originalPrice: '', description: '',
    colors: '', sizes: '', badge: '', stock: '10', featured: false,
  };

  const [form,          setForm]          = useState(emptyForm);
  const [imageFiles,    setImageFiles]    = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const openNew = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setImageFiles([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      ...p,
      gender: p.gender || '',
      colors: Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || ''),
      sizes:  Array.isArray(p.sizes)  ? p.sizes.join(', ')  : (p.sizes  || ''),
      price:         String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      stock:         String(p.stock ?? 10),
    });
    setImageFiles([]);
    setImagePreviews(p.images || []);
    setShowForm(true);
  };

  const handleImagePick = (e) => {
    const picked = Array.from(e.target.files);
    if (!picked.length) return;
    const combined = [...imageFiles, ...picked].slice(0, 6);
    setImageFiles(combined);
    const previews = combined.map((f, i) =>
      i < imageFiles.length ? imagePreviews[i] : URL.createObjectURL(f)
    );
    setImagePreviews(previews);
    e.target.value = '';
  };

  const removeImage = (i) => {
    if (imagePreviews[i]?.startsWith('blob:')) URL.revokeObjectURL(imagePreviews[i]);
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fragranceSelected = isFragranceCategory(form.category);
      const data = {
        ...form,
        gender:        fragranceSelected ? '' : (form.gender || 'women'),
        price:         Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock:         Number(form.stock),
        colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
        sizes:  form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
      };
      if (editTarget) await editProduct(editTarget.id, data);
      else await addProduct(data);
      setShowForm(false);
    } catch (err) {
      alert('Error saving product: ' + (err.message || 'Unknown error. Check console.'));
    } finally {
      setSaving(false);
    }
  };

  const filtered = adminProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-light font-display text-charcoal-800">Products</h1>
        <button onClick={openNew} className="flex items-center gap-2 py-2 btn-primary">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute -translate-y-1/2 left-3 top-1/2 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products…" className="text-sm input-field pl-9" />
      </div>

      <div className="overflow-x-auto bg-white border border-stone-200">
        <table className="w-full min-w-[640px]">
          <thead className="border-b bg-stone-50 border-stone-200">
            <tr className="text-left font-body text-[10px] tracking-[0.15em] uppercase text-stone-400">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="transition-colors border-t border-stone-100 hover:bg-stone-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} loading="lazy"
                        className="object-cover w-10 h-10 border border-stone-200 shrink-0"
                        onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder-product.svg'; }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 border bg-stone-100 border-stone-200 shrink-0">
                        <Package size={14} className="text-stone-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium font-body text-charcoal-800">{p.name}</p>
                      <p className="font-body text-[10px] text-stone-400">{p.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs font-body text-charcoal-700">{p.category}</td>
                <td className="px-5 py-3 text-xs font-body text-charcoal-700">₦{p.price.toLocaleString('en-NG')}</td>
                <td className="px-5 py-3">
                  <input type="number" min={0} value={p.stock ?? 10}
                    onChange={e => updateStock(p.id, e.target.value)}
                    className="w-16 py-1 text-xs text-center border border-stone-200 font-body focus:outline-none focus:border-charcoal-700" />
                </td>
                <td className="px-5 py-3">
                  <span className={`font-body text-[10px] tracking-wider uppercase px-2 py-0.5 border ${
                    (p.stock ?? 10) <= 0 ? 'bg-red-50 text-red-600 border-red-200'
                    : (p.stock ?? 10) <= 5 ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-green-50 text-green-600 border-green-200'
                  }`}>
                    {(p.stock ?? 10) <= 0 ? 'Out of Stock' : (p.stock ?? 10) <= 5 ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/products/${p.id}`} target="_blank"
                      className="flex items-center justify-center transition-colors w-7 h-7 text-stone-400 hover:text-charcoal-800">
                      <Eye size={13} />
                    </Link>
                    <button onClick={() => openEdit(p)}
                      className="flex items-center justify-center transition-colors w-7 h-7 text-stone-400 hover:text-charcoal-800">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setConfirm(p.id)}
                      className="flex items-center justify-center transition-colors w-7 h-7 text-stone-400 hover:text-blush-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-xs text-center font-body text-stone-400">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-charcoal-900/60">
          <div className="w-full max-w-lg p-6 my-8 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-light font-display text-charcoal-800">{editTarget ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-stone-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label-xs">Name *</label>
                  <input required value={form.name}
                    onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="text-sm input-field" placeholder="Luna Dress" />
                </div>
                <div>
                  <label className="label-xs">Category</label>
                  <select value={form.category}
                    onChange={e => {
                      const nextCategory = e.target.value;
                      setForm(f => ({
                        ...f,
                        category: nextCategory,
                        gender: isFragranceCategory(nextCategory) ? '' : (f.gender || 'women'),
                      }));
                    }}
                    className="text-sm input-field">
                    {CATEGORIES_GROUPED.map(group => (
                      <optgroup key={group.group} label={`── ${group.group} ──`}>
                        {group.items.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {!isFragranceCategory(form.category) ? (
                  <div>
                    <label className="label-xs">Gender</label>
                    <select value={form.gender || 'women'}
                      onChange={e => setForm(f => ({...f, gender: e.target.value}))}
                      className="text-sm input-field">
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-end">
                    <p className="font-body text-[10px] text-stone-400 bg-stone-50 border border-stone-200 p-2.5 leading-relaxed">
                      Fragrance products don't need a gender — they only appear in the Fragrance section.
                    </p>
                  </div>
                )}
                <div>
                  <label className="label-xs">Price (₦) *</label>
                  <input required type="number" min={0} value={form.price}
                    onChange={e => setForm(f => ({...f, price: e.target.value}))}
                    className="text-sm input-field" placeholder="45000" />
                </div>
                <div>
                  <label className="label-xs">Original Price (₦)</label>
                  <input type="number" min={0} value={form.originalPrice}
                    onChange={e => setForm(f => ({...f, originalPrice: e.target.value}))}
                    className="text-sm input-field" placeholder="Leave blank if no discount" />
                </div>
                <div>
                  <label className="label-xs">Stock</label>
                  <input type="number" min={0} value={form.stock}
                    onChange={e => setForm(f => ({...f, stock: e.target.value}))}
                    className="text-sm input-field" />
                </div>
                <div>
                  <label className="label-xs">Badge</label>
                  <select value={form.badge}
                    onChange={e => setForm(f => ({...f, badge: e.target.value}))}
                    className="text-sm input-field">
                    {['', 'New', 'Bestseller', 'Sale', 'Luxury', 'Bridal', 'Premium'].map(b => (
                      <option key={b} value={b}>{b || '— None —'}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Colors (comma-separated)</label>
                  <input value={form.colors}
                    onChange={e => setForm(f => ({...f, colors: e.target.value}))}
                    className="text-sm input-field" placeholder="Blush, Ivory, Champagne" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Sizes (comma-separated)</label>
                  <input value={form.sizes}
                    onChange={e => setForm(f => ({...f, sizes: e.target.value}))}
                    className="text-sm input-field" placeholder="XS, S, M, L, XL" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Description</label>
                  <textarea rows={3} value={form.description}
                    onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    className="text-sm resize-none input-field" />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <input type="checkbox" id="featured" checked={form.featured}
                    onChange={e => setForm(f => ({...f, featured: e.target.checked}))}
                    className="accent-charcoal-900" />
                  <label htmlFor="featured" className="text-xs font-body text-charcoal-700">Featured on homepage</label>
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Product Images (up to 6)</label>
                  <label className="mt-1 flex flex-col items-center justify-center gap-1.5 border border-dashed border-stone-300 py-5 cursor-pointer hover:border-charcoal-700 hover:bg-stone-50 transition-colors">
                    <Upload size={18} className="text-stone-400" />
                    <span className="text-xs font-body text-stone-400">Click to upload images</span>
                    <span className="font-body text-[10px] text-stone-300">JPG, PNG, WEBP · max 6 photos</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                      onChange={handleImagePick} disabled={imagePreviews.length >= 6} />
                  </label>
                  {imagePreviews.length > 0 && (
                    <>
                      <div className="grid grid-cols-6 gap-2 mt-3">
                        {imagePreviews.map((src, i) => (
                          <div key={i} className="relative group aspect-square">
                            <img src={src} alt={`Preview ${i + 1}`}
                              className="object-cover w-full h-full border border-stone-200"
                              onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder-product.svg'; }} />
                            {i === 0 && (
                              <span className="absolute bottom-0 left-0 right-0 bg-charcoal-900/80 text-white text-[8px] font-body text-center py-0.5">MAIN</span>
                            )}
                            <button type="button" onClick={() => removeImage(i)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-charcoal-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="font-body text-[10px] text-stone-400 mt-1.5">
                        {imagePreviews.length}/6 photos · hover to remove · first image is main
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 disabled:opacity-60">
                  {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Product'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60">
          <div className="w-full max-w-sm p-6 text-center bg-white">
            <Trash2 size={24} className="mx-auto mb-3 text-blush-500" />
            <h3 className="mb-2 text-sm font-semibold font-body text-charcoal-800">Delete this product?</h3>
            <p className="mb-5 text-xs font-body text-stone-400">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { deleteProduct(confirm); setConfirm(null); }} className="flex-1 py-2 btn-blush">Delete</button>
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
