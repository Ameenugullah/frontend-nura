import { useState } from 'react';
import { Search, CheckCircle, RefreshCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminCustomers() {
  const { users, refreshUsers } = useAdmin();
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-light font-display text-charcoal-800">Customers</h1>
        <button onClick={refreshUsers}
          className="flex items-center gap-2 text-xs transition-colors font-body text-stone-500 hover:text-charcoal-800">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <div className="relative max-w-sm">
        <Search size={14} className="absolute -translate-y-1/2 left-3 top-1/2 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search customers…" className="text-sm input-field pl-9" />
      </div>
      <div className="overflow-x-auto bg-white border border-stone-200">
        <table className="w-full min-w-[540px]">
          <thead className="border-b bg-stone-50 border-stone-200">
            <tr className="text-left font-body text-[10px] tracking-[0.15em] uppercase text-stone-400">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Verified</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="transition-colors border-t border-stone-100 hover:bg-stone-50">
                <td className="px-5 py-3 text-xs font-medium font-body text-charcoal-800">{u.name || '—'}</td>
                <td className="px-5 py-3 text-xs font-body text-charcoal-700">{u.email}</td>
                <td className="px-5 py-3 text-xs font-body text-stone-400">{u.created ? new Date(u.created).toLocaleDateString('en-NG') : '—'}</td>
                <td className="px-5 py-3">
                  {u.verified
                    ? <span className="text-green-500"><CheckCircle size={13} /></span>
                    : <span className="font-body text-[10px] text-stone-400">—</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="py-10 text-xs text-center font-body text-stone-400">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
