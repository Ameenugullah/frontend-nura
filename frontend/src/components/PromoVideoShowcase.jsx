import { useState, useEffect, useRef } from 'react';
import { getPromoVideos } from '../lib/api';

export default function PromoVideoShowcase() {
  const [videos,    setVideos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
    let cancelled = false;
    getPromoVideos()
      .then(v  => { if (!cancelled) { setVideos(v); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // When two videos exist, start the next one playing before fading it in
  // so there is no black frame between clips.
  const handleEnded = () => {
    if (videos.length < 2) return;
    const nextIdx = (activeIdx + 1) % videos.length;
    const nextVid = videoRefs.current[nextIdx];
    if (nextVid) {
      nextVid.currentTime = 0;
      nextVid.play().catch(() => {});
    }
    setActiveIdx(nextIdx);
  };

  if (loading || videos.length === 0) return null;

  const isSingle = videos.length === 1;

  return (
    <section className="py-16 bg-stone-50">
      <div className="px-6 mx-auto max-w-4xl">

        <div className="mb-8 text-center">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-2">Our Collection</p>
          <h2 className="text-3xl italic font-light font-display sm:text-4xl text-charcoal-800">In Motion</h2>
        </div>

        {/* Video container — 16:9, both videos stacked in DOM for zero-gap fade */}
        <div className="relative overflow-hidden w-full h-[70vh] bg-stone-900 shadow-soft">
          {videos.map((v, i) => (
            <video
              key={v.id}
              ref={el => { videoRefs.current[i] = el; }}
              src={v.video}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-700"
              style={{ opacity: i === activeIdx ? 1 : 0 }}
              autoPlay={i === 0}
              muted
              playsInline
              loop={isSingle}
              preload={i === 0 ? 'auto' : 'metadata'}
              onEnded={!isSingle ? handleEnded : undefined}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ))}
        </div>

        {/* Dot indicators — only when two videos exist */}
        {!isSingle && (
          <div className="flex justify-center gap-2 mt-5">
            {videos.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIdx
                    ? 'w-6 h-1.5 bg-charcoal-800'
                    : 'w-1.5 h-1.5 bg-stone-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
