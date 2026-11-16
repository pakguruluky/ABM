import React, { useEffect, useState } from 'react';
import { Clock, GraduationCap, Hourglass, LogOut, ShieldAlert } from 'lucide-react';
import { AssessmentSettings, InstitutionSettings, StudentRecord } from '../types/abm';
import { formatIndonesianDate } from '../utils/pdfExport';
import { AbmReportAnalysisSections } from './AbmReportAnalysisSections';

interface StudentResultPageProps {
  student: StudentRecord;
  institution: InstitutionSettings;
  assessmentSettings: AssessmentSettings;
  onLogout: () => void;
}

function getCountdownParts(targetMs: number, nowMs: number) {
  const diff = Math.max(0, targetMs - nowMs);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export const StudentResultPage: React.FC<StudentResultPageProps> = ({
  student,
  institution,
  assessmentSettings,
  onLogout,
}) => {
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Proteksi CSS strict agar siswa hanya bisa melihat di layar tanpa mencetak/ekspor PDF
  useEffect(() => {
    document.body.classList.add('student-results-protected');
    return () => {
      document.body.classList.remove('student-results-protected');
    };
  }, []);

  // Tick real-time setiap detik ketika mode scheduled aktif
  useEffect(() => {
    if (assessmentSettings.mode !== 'scheduled') return;
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, [assessmentSettings.mode]);

  let gateState: 'unlocked' | 'scheduled_waiting' | 'scheduled_closed' | 'pending_review' =
    'unlocked';

  let startMs = 0;
  let endMs = 0;

  if (assessmentSettings.mode === 'manual_review') {
    if (student.reviewStatus !== 'approved') {
      gateState = 'pending_review';
    }
  } else if (assessmentSettings.mode === 'scheduled') {
    startMs = assessmentSettings.releaseStart
      ? new Date(assessmentSettings.releaseStart).getTime()
      : 0;
    endMs = assessmentSettings.releaseEnd
      ? new Date(assessmentSettings.releaseEnd).getTime()
      : 0;

    if (!startMs || Number.isNaN(startMs) || nowMs < startMs) {
      gateState = 'scheduled_waiting';
    } else if (endMs && !Number.isNaN(endMs) && nowMs > endMs) {
      gateState = 'scheduled_closed';
    } else {
      gateState = 'unlocked';
    }
  }

  const countdown = startMs ? getCountdownParts(startMs, nowMs) : null;

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Proteksi CSS langsung pada halaman hasil siswa */}
      <style>{`@media print { body { display: none !important; } }`}</style>

      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {institution.logoBase64 ? (
              <img
                src={institution.logoBase64}
                alt={`Logo ${institution.name}`}
                className="w-8 h-8 object-contain rounded shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-display font-bold text-sm sm:text-base text-slate-900 truncate">
                {institution.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                Portal Hasil Siswa · Tampilan Layar (View-Only)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs sm:text-sm font-medium text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {gateState === 'pending_review' && (
          <div className="max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <Hourglass className="w-7 h-7" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-950">
              Menunggu Verifikasi Guru BK / Admin
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Hasil asesmen Anda sedang dalam proses verifikasi/review oleh Admin atau Guru BK.
              Halaman ini akan terbuka secara otomatis begitu Admin menyetujui rilis hasil Anda.
            </p>
            <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p>
                Peserta: <strong className="text-slate-800">{student.fullName}</strong> (
                {student.classMajor})
              </p>
              <p>
                Waktu Selesai Tes:{' '}
                <strong className="text-slate-800">
                  {student.completedAt ? formatIndonesianDate(student.completedAt) : '-'}
                </strong>
              </p>
            </div>
          </div>
        )}

        {gateState === 'scheduled_waiting' && (
          <div className="max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-950">
              Hasil Asesmen Terjadwal untuk Dirilis
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {assessmentSettings.releaseStart
                ? `Hasil asesmen Anda dapat diakses mulai ${new Date(
                    assessmentSettings.releaseStart
                  ).toLocaleString('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}.`
                : 'Jadwal rilis hasil sedang diatur oleh Administrator lembaga.'}
            </p>

            {countdown && (
              <div className="mt-6 grid grid-cols-4 gap-3">
                {[
                  { label: 'Hari', val: countdown.days },
                  { label: 'Jam', val: countdown.hours },
                  { label: 'Menit', val: countdown.minutes },
                  { label: 'Detik', val: countdown.seconds },
                ].map((box) => (
                  <div
                    key={box.label}
                    className="rounded-lg bg-slate-50 border border-slate-200 py-3 px-2"
                  >
                    <p className="font-mono text-2xl font-bold text-indigo-900 tabular-nums">
                      {String(box.val).padStart(2, '0')}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{box.label}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-6 text-xs text-slate-500">
              Halaman ini akan menampilkan laporan hasil Anda secara otomatis ketika hitungan
              mundur selesai.
            </p>
          </div>
        )}

        {gateState === 'scheduled_closed' && (
          <div className="max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="font-display text-xl font-bold text-slate-950">
              Periode Akses Hasil Telah Berakhir
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Batas waktu akses mandiri untuk melihat hasil asesmen telah ditutup pada{' '}
              {new Date(assessmentSettings.releaseEnd).toLocaleString('id-ID', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
              . Silakan hubungi Guru BK atau Admin {institution.name} untuk konsultasi hasil.
            </p>
          </div>
        )}

        {gateState === 'unlocked' && (
          <div className="space-y-8">
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    Laporan Rapor Asesmen Bakat &amp; Minat
                  </p>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 mt-1">
                    {student.fullName}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    {student.classMajor} · {student.schoolOrigin} · Selesai pada{' '}
                    {student.completedAt ? formatIndonesianDate(student.completedAt) : '-'}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Mode Tampilan Layar (View-Only)</p>
                  <p className="mt-0.5">
                    Dokumen resmi cetak hanya tersedia melalui Guru BK / Admin.
                  </p>
                </div>
              </div>
            </section>

            <AbmReportAnalysisSections student={student} />
          </div>
        )}
      </main>
    </div>
  );
};
