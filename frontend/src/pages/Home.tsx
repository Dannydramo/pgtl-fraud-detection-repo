import { useNavigate } from 'react-router-dom';
import { UploadForm } from '../components/UploadForm';
import { uploadFraudFile } from '../services/api';

export function Home() {
  const navigate = useNavigate();

  const handleUpload = async (file: File) => {
    const response = await uploadFraudFile(file);
    navigate(`/job/${response.jobId}`);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <section className="fade-in mb-8 rounded-3xl border border-orange-200/60 bg-white/70 p-8 shadow-xl sm:p-10">
        <p className="inline-block rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-700">
          Risk Intelligence
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
          Fraud Detection Command Center
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-700 sm:text-lg">
          Upload your transaction file and monitor fraud analysis in real time.
        </p>
      </section>
      <UploadForm onSubmit={handleUpload} />
    </main>
  );
}
