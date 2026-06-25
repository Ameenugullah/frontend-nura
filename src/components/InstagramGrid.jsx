import { useState, useEffect, useRef, useCallback } from 'react';
import { Instagram } from 'lucide-react';
import { getInstagramPosts } from '../lib/api';

// ── InstagramGrid ─────────────────────────────────────────────────────────────
// Desktop: 6-column grid
// Mobile:  touch-enabled swipe carousel (no external library)
// Images pulled from PocketBase instagram_grid collection via getInstagramPosts()
// which uses pb.files.getUrl() for correct URL construction.

export default function InstagramGrid() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  // Carousel state (mobile only)
  const [activeIdx,  setActiveIdx]  = useState(0);
  const trackRef   = useRef(null);
  const startXRef  = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getInstagramPosts()
      .then(items => {
        if (cancelled) return;
        setPosts(items);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── touch / mouse carousel handlers ────────────────────────────────────────
  const goTo = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(posts.length - 1, idx));
    setActiveIdx(clamped);
  }, [posts.length]);

  const onTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const onTouchEnd = (e) => {
    if (!isDragging.current || startXRef.current === null) return;
    const diff = startXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(activeIdx + (diff > 0 ? 1 : -1));
    }
    isDragging.current = false;
    startXRef.current = null;
  };

  // ── skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden grid-cols-6 gap-1 sm:grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-stone-200 aspect-square animate-pulse" />
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="sm:hidden">
          <div className="rounded bg-stone-200 aspect-square animate-pulse" />
        </div>
      </>
    );
  }

  // ── empty / error ───────────────────────────────────────────────────────────
  if (error || posts.length === 0) {
    return (
      <>
        <div className="hidden grid-cols-6 gap-1 sm:grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative flex items-center justify-center bg-stone-100 aspect-square">
              <Instagram size={20} className="text-stone-300" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center sm:hidden aspect-square bg-stone-100">
          <Instagram size={32} className="text-stone-300" />
        </div>
      </>
    );
  }

  // ── desktop grid ────────────────────────────────────────────────────────────
  const PostItem = ({ post }) => (
    <a
      href={post.link || 'https://instagram.com/nurabaharnigeria'}
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
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-stone-200">
          <Instagram size={20} className="text-stone-300" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 bg-black/40 group-hover:opacity-100">
        <Instagram size={22} className="text-white" />
      </div>
    </a>
  );

  return (
    <>
      {/* ── Desktop: grid ──────────────────────────────────────────────── */}
      <div className="hidden grid-cols-6 gap-1 sm:grid">
        {posts.map(post => <PostItem key={post.id} post={post} />)}
        {/* Fill remaining slots if fewer than 6 */}
        {Array.from({ length: Math.max(0, 6 - posts.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex items-center justify-center bg-stone-100 aspect-square">
            <Instagram size={16} className="text-stone-200" />
          </div>
        ))}
      </div>

      {/* ── Mobile: touch carousel ─────────────────────────────────────── */}
      <div className="sm:hidden">
        <div
          className="relative overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Track */}
          <div
            ref={trackRef}
            className="flex transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(-${activeIdx * 100}%)` }}
          >
            {posts.map(post => (
              <div key={post.id} className="flex-shrink-0 min-w-full aspect-square">
                <PostItem post={post} />
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        {posts.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to post ${i + 1}`}
                className={`transition-all duration-200 rounded-full ${
                  i === activeIdx ? 'w-5 h-1.5 bg-charcoal-800' : 'w-1.5 h-1.5 bg-stone-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}