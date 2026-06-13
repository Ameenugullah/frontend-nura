// Figma-inspired scrolling ticker — "PAY WITH MULTIPLE CREDIT CARDS ○ 30% OFF IF YOU SPEND..."
export default function Ticker({ items = [], bgClass = 'bg-stone-100', textClass = 'text-charcoal-700/60' }) {
  const defaultItems = [
    'Free shipping on orders over ₦30,000',
    'Handcrafted Nigerian fashion',
    'Authentic boubous & gowns',
    'Pay via Paystack or WhatsApp',
    'Delivered nationwide',
    'New arrivals every week',
  ];

  const list = items.length ? items : defaultItems;
  // duplicate for seamless loop
  const doubled = [...list, ...list];

  return (
    <div className={`overflow-hidden py-3 ${bgClass} border-y border-stone-200`}>
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span key={i} className={`font-body text-xs tracking-[0.2em] uppercase ${textClass} shrink-0 px-8`}>
            {item} <span className="mx-4 text-stone-400">○</span>
          </span>
        ))}
      </div>
    </div>
  );
}
