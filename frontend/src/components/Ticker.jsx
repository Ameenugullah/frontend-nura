import { useEffect, useRef } from 'react';

export default function Ticker({
  items = [],
  bgClass   = 'bg-stone-100',
  textClass = 'text-charcoal-700/60',
}) {
  const defaultItems = [
    'Handcrafted Nigerian fashion',
    'Authentic boubous & gowns',
    'Secure payment via Paystack',
    'Delivered nationwide',
    'New arrivals every week',
  ];

  const list   = items.length ? items : defaultItems;
  // Triple-duplicate so the seamless loop never shows a blank gap
  const tripled = [...list, ...list, ...list];

  return (
    <div className={`overflow-hidden py-3 ${bgClass} border-y border-stone-200`}>
      <div className="ticker-track">
        {tripled.map((item, i) => (
          <span
            key={i}
            className={`font-body text-xs tracking-[0.2em] uppercase ${textClass} shrink-0 px-8`}
          >
            {item} <span className="mx-4 text-stone-400">○</span>
          </span>
        ))}
      </div>
    </div>
  );
}
