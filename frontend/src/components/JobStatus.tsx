import { JobStatusResponse } from '../services/api';

interface Props {
  status: JobStatusResponse | null;
  loading: boolean;
}

export function JobStatus({ status, loading }: Props) {
  const statusTone =
    status?.status === 'COMPLETED'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : status?.status === 'FAILED'
        ? 'bg-red-100 text-red-700 border-red-200'
        : 'bg-amber-100 text-amber-700 border-amber-200';

  return (
    <div className="glass-card fade-in rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Job Status</h2>
        {status && (
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}>
            {status.status}
          </span>
        )}
      </div>
      {loading && <p className="mt-3 text-sm text-slate-600">Refreshing status...</p>}
      {!status ? (
        <p className="mt-3 text-sm text-slate-600">No status available.</p>
      ) : (
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <p>
            <span className="font-semibold text-slate-700">Status:</span> {status.status}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Total Flagged:</span> {status.totalFlagged}
          </p>
          {status.error && <p className="sm:col-span-2 text-red-600">{status.error}</p>}
        </div>
      )}
    </div>
  );
}
