import { Link } from 'react-router-dom';

export default function FAQ() {
  return (
    <div className="min-h-screen pt-6 bg-stone-50">
      <div className="px-6 mx-auto max-w-6xl">
        <h1 className="text-3xl italic font-display mb-4">FAQ</h1>
        <p className="text-sm text-stone-500 mb-6">Answers to common questions about orders, shipping, returns and sizing.</p>

        <section className="bg-white p-6 border border-stone-100 mb-4">
          <h2 className="text-lg font-semibold mb-2">Shipping & delivery</h2>
          <p className="text-sm text-stone-600">We ship across Nigeria via our selected courier partners. Orders over ₦500,000 qualify for free shipping.</p>
        </section>

        <section className="bg-white p-6 border border-stone-100 mb-4">
          <h2 className="text-lg font-semibold mb-2">Returns & refunds</h2>
          <p className="text-sm text-stone-600">If you're unhappy with your purchase, please contact support within 7 days with your order reference for return instructions.</p>
        </section>

        <section className="bg-white p-6 border border-stone-100 mb-4">
          <h2 className="text-lg font-semibold mb-2">Size guide</h2>
          <p className="text-sm text-stone-600 mb-3">We provide a size guide per product where applicable — check the product detail page's size options. For assistance, contact support.</p>
          <Link to="/contact" className="btn-outline">Contact support</Link>
        </section>
      </div>
    </div>
  );
}
