import { useState, useEffect, useRef, useCallback } from 'react';
import { Instagram, Play } from 'lucide-react';
import { getInstagramPosts } from '../lib/api';

// Renders up to 6 Instagram posts (image OR video) from PocketBase.
// Desktop: 6-column grid.
// Mobile:  touch swipe carousel with dot indicators.

export default function InstagramGrid() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const startX = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getInstagramPosts()
      .then(items => { if (!cancelled) setPosts(items); })
      .catch(()   => { if (!cancelled) setError(true);  })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const goTo = useCallback((i) => {
    setActiveIdx(Math.max(0, Math.min((posts.length || 1) - 1, i)));
  }, [posts.length]);

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(activeIdx + (diff > 0 ? 1 : -1));
    startX.current = null;
  };

  // ── loading skeleton ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-stone-200 aspect-square animate-pulse" />
      ))}
    </div>
  );

  // ── empty / error ──────────────────────────────────────────────────────────
  if (error || posts.length === 0) return (
    <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center bg-stone-100 aspect-square">
          <Instagram size={20} className="text-stone-300" />
        </div>
      ))}
    </div>
  );

  // ── single post tile ───────────────────────────────────────────────────────
  const PostTile = ({ post, className = '' }) => {
    const isVideo = post.mediaType === 'video';
    const href    = post.link || 'https://instagram.com/nurabaharnigeria';

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative overflow-hidden aspect-square group bg-stone-100 block ${className}`}
        title={post.caption}
      >
        {isVideo && post.video ? (
          <>
            <video
              src={post.video}
              className="object-cover w-full h-full"
              muted
              loop
              playsInline
              preload="metadata"
              onMouseEnter={e => e.target.play()}
              onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
            />
            {/* play badge */}
            <span className="absolute flex items-center justify-center rounded-full top-2 right-2 w-7 h-7 bg-black/50">
              <Play size={12} className="text-white fill-white ml-0.5" />
            </span>
          </>
        ) : post.image ? (
          <img
            src={post.image}
            alt={post.caption || 'Nura Bahar Nigeria'}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-stone-200">
            <Instagram size={20} className="text-stone-300" />
          </div>
        )}

        {/* hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-black/35">
          <Instagram size={22} className="text-white" />
        </div>
      </a>
    );
  };

  return (
    <>
      {/* ── Desktop: 6-column grid ──────────────────────────────────── */}
      <div className="hidden grid-cols-6 gap-1 sm:grid">
        {posts.map(post => <PostTile key={post.id} post={post} />)}
        {Array.from({ length: Math.max(0, 6 - posts.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex items-center justify-center bg-stone-100 aspect-square">
            <Instagram size={16} className="text-stone-200" />
          </div>
        ))}
      </div>

      {/* ── Mobile: touch carousel ───────────────────────────────────── */}
      <div className="sm:hidden">
        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(-${activeIdx * 100}%)` }}
          >
            {posts.map(post => (
              <div key={post.id} className="flex-shrink-0 min-w-full">
                <PostTile post={post} />
              </div>
            ))}
          </div>
        </div>

        {/* dot indicators */}
        {posts.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Post ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  i === activeIdx
                    ? 'w-5 h-1.5 bg-charcoal-800'
                    : 'w-1.5 h-1.5 bg-stone-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}