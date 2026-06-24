import { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';
import pb from '../lib/pocketbase';

// Fetches up to 6 records from the `instagram_grid` PocketBase collection.
// Each record should have:
//   - image  (file field)
//   - caption (text, optional)
//   - link    (url to Instagram post, optional)
//   - order   (number, for manual sorting)

export default function InstagramGrid() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    pb.collection('instagram_grid')
      .getList(1, 6, { sort: 'order,created' })
      .then(res => {
        if (cancelled) return;
        const items = (res.items || []).map(record => ({
          id:      record.id,
          image:   record.image ? pb.files.getUrl(record, record.image) : null,
          caption: record.caption || '',
          link:    record.link    || 'https://instagram.com/nurabaharnigeria',
        }));
        setPosts(items);
      })
      .catch(() => { if (!cancelled) setPosts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Skeleton while loading
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-stone-200 aspect-square animate-pulse" />
        ))}
      </div>
    );
  }

  // Empty state — show placeholders with a hint for the admin
  if (posts.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="relative flex items-center justify-center bg-stone-100 aspect-square group">
            <Instagram size={20} className="text-stone-300" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
      {posts.map(post => (
        <a
          key={post.id}
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative overflow-hidden aspect-square group bg-stone-100"
          title={post.caption}
        >
          {post.image ? (
            <img
              src={post.image}
              alt={post.caption || 'Nura Bahar Nigeria'}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-stone-200">
              <Instagram size={20} className="text-stone-300" />
            </div>
          )}

          {/* hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 bg-charcoal-900/40 group-hover:opacity-100">
            <Instagram size={22} className="text-white" />
          </div>
        </a>
      ))}
    </div>
  );
}