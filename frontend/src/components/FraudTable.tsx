import { FlaggedTx } from '../services/api';

interface Props {
  rows: FlaggedTx[];
  page: number;
  total: number;
  limit: number;
  loading: boolean;
  error: string | null;
  onPageChange: (next: number) => void;
}

export function FraudTable({ rows, page, total, limit, loading, error, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="glass-card fade-in rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Flagged Transactions</h2>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Page {page} / {totalPages}
        </p>
      </div>

      {loading && <p className="mb-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">Loading results...</p>}
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-amber-50 text-left text-slate-700">
              <th className="p-3 font-semibold">Transaction ID</th>
              <th className="p-3 font-semibold">User ID</th>
              <th className="p-3 font-semibold">Reason</th>
              <th className="p-3 font-semibold">Timestamp</th>
              <th className="p-3 font-semibold">Location</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.transactionId}-${row.timestamp}`} className="border-b border-slate-100 transition hover:bg-orange-50/40">
                <td className="p-3 font-medium text-slate-800">{row.transactionId}</td>
                <td className="p-3">{row.userId}</td>
                <td className="p-3 text-rose-700">{row.reasons.join(' | ')}</td>
                <td className="p-3 whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                <td className="p-3">{row.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && rows.length === 0 && (
        <p className="mt-3 text-sm text-slate-600">No flagged transactions yet.</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
