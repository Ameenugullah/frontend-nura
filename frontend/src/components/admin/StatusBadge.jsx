export const STATUS_STYLES = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  paid:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
  failed:     'bg-red-50 text-red-700 border-red-200',
  refunded:   'bg-stone-100 text-stone-600 border-stone-300',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 font-body text-[10px] tracking-wider uppercase border ${STATUS_STYLES[status] || 'bg-stone-50 text-stone-600 border-stone-200'}`}>
      {status}
    </span>
  );
}
