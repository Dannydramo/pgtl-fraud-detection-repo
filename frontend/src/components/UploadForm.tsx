import { FormEvent, useState } from 'react';

interface Props {
  onSubmit: (file: File) => Promise<void>;
}

export function UploadForm({ onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please choose a JSON file.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(file);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card fade-in space-y-5 rounded-2xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900">Upload Transactions JSON</h2>
      <p className="text-sm text-slate-600">
        Supports large JSON arrays. Processing runs in the background immediately after upload.
      </p>
      <input
        type="file"
        accept=".json,application/json"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
      />
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center rounded-xl bg-orange-700 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Uploading...' : 'Start Fraud Check'}
      </button>
    </form>
  );
}
