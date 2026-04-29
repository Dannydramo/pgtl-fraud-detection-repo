import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FraudTable } from '../components/FraudTable';
import { JobStatus } from '../components/JobStatus';
import {
  FlaggedTx,
  JobStatusResponse,
  getJobResults,
  getJobStatus,
} from '../services/api';

const LIMIT = 20;

export function JobDetails() {
  const { jobId } = useParams();
  const [status, setStatus] = useState<JobStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [rows, setRows] = useState<FlaggedTx[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let active = true;
    let interval: number | undefined;

    const pullStatus = async () => {
      try {
        const next = await getJobStatus(jobId);
        if (!active) return;
        setStatus(next);
        if (next.status === 'COMPLETED' || next.status === 'FAILED') {
          if (interval) window.clearInterval(interval);
        }
      } finally {
        if (active) setStatusLoading(false);
      }
    };

    void pullStatus();
    interval = window.setInterval(() => void pullStatus(), 2000);

    return () => {
      active = false;
      if (interval) window.clearInterval(interval);
    };
  }, [jobId]);

  useEffect(() => {
    if (!jobId || status?.status !== 'COMPLETED') return;
    let active = true;
    setResultsLoading(true);
    setResultsError(null);

    getJobResults(jobId, page, LIMIT)
      .then((result) => {
        if (!active) return;
        setRows(result.data);
        setTotal(result.total);
      })
      .catch(() => {
        if (!active) return;
        setResultsError('Could not load flagged transactions.');
      })
      .finally(() => {
        if (active) setResultsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [jobId, page, status?.status]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <section className="fade-in rounded-3xl border border-orange-200/70 bg-white/70 p-6 shadow-xl sm:p-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Analysis Job Details</h1>
        <p className="mt-2 text-sm text-slate-600">
          Job ID: <span className="font-medium text-slate-800">{jobId}</span>
        </p>
      </section>
      <JobStatus status={status} loading={statusLoading} />
      {status?.status === 'COMPLETED' ? (
        <FraudTable
          rows={rows}
          page={page}
          total={total}
          limit={LIMIT}
          loading={resultsLoading}
          error={resultsError}
          onPageChange={setPage}
        />
      ) : (
        <div className="glass-card rounded-2xl p-5 text-sm text-slate-700">
          Results will appear automatically once processing is completed.
        </div>
      )}
    </main>
  );
}
