import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Send,
} from 'lucide-react';
import {
  APTITUDE_DIMENSIONS,
  APTITUDE_QUESTIONS,
  INTEREST_STATEMENTS,
  TEST_DURATION_SECONDS,
} from '../data/abmCatalog';
import { saveStudentProgress, submitStudentAssessment } from '../services/abmService';
import { InstitutionSettings, StudentRecord } from '../types/abm';
import { QuestionDiagram } from './QuestionDiagram';

interface AssessmentTestPageProps {
  student: StudentRecord;
  institution: InstitutionSettings;
  onCompleted: (updatedStudent: StudentRecord) => void;
  onLogout: () => void;
}

const LIKERT_OPTIONS = [
  { value: 1, label: 'Sangat Tidak Suka' },
  { value: 2, label: 'Tidak Suka' },
  { value: 3, label: 'Netral' },
  { value: 4, label: 'Suka' },
  { value: 5, label: 'Sangat Suka' },
];

export const AssessmentTestPage: React.FC<AssessmentTestPageProps> = ({
  student,
  institution,
  onCompleted,
  onLogout,
}) => {
  const [section, setSection] = useState<'A' | 'B'>('A');
  const [currentIndexA, setCurrentIndexA] = useState(0);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<string, number>>(
    student.aptitudeAnswers || {}
  );
  const [interestAnswers, setInterestAnswers] = useState<Record<string, number>>(
    student.interestAnswers || {}
  );
  const [secondsLeft, setSecondsLeft] = useState(TEST_DURATION_SECONDS);
  const [timeExpiredNotice, setTimeExpiredNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmFinishModal, setConfirmFinishModal] = useState(false);

  const totalA = APTITUDE_QUESTIONS.length;
  const totalB = INTEREST_STATEMENTS.length;
  const answeredACount = Object.keys(aptitudeAnswers).length;
  const answeredBCount = Object.keys(interestAnswers).length;
  const totalProgressPct = Math.round(
    ((answeredACount + answeredBCount) / (totalA + totalB)) * 100
  );

  // Countdown Timer untuk Bagian A (Tes Bakat)
  useEffect(() => {
    if (section !== 'A') return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setTimeExpiredNotice(true);
          setSection('B');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [section]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const persistProgress = useCallback(
    async (nextApt: Record<string, number>, nextInt: Record<string, number>) => {
      try {
        await saveStudentProgress(student.id, nextApt, nextInt);
      } catch {
        // Silent background save; submission handles critical persistence
      }
    },
    [student.id]
  );

  const handleSelectAptitude = (questionId: string, optionIndex: number) => {
    const next = { ...aptitudeAnswers, [questionId]: optionIndex };
    setAptitudeAnswers(next);
    if (Object.keys(next).length % 5 === 0) {
      persistProgress(next, interestAnswers);
    }
  };

  const handleSelectInterest = (statementId: string, value: number) => {
    const next = { ...interestAnswers, [statementId]: value };
    setInterestAnswers(next);
    if (Object.keys(next).length % 6 === 0) {
      persistProgress(aptitudeAnswers, next);
    }
  };

  const handleSwitchToSectionB = async () => {
    await persistProgress(aptitudeAnswers, interestAnswers);
    setSection('B');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitFinal = async () => {
    setErrorMsg('');
    if (answeredBCount < totalB) {
      const firstUnanswered = INTEREST_STATEMENTS.find(
        (s) => interestAnswers[s.id] === undefined
      );
      setErrorMsg(
        `Masih ada ${totalB - answeredBCount} pernyataan minat yang belum diisi. Mohon lengkapi seluruh skala minat terlebih dahulu.`
      );
      if (firstUnanswered) {
        const el = document.getElementById(`stmt-${firstUnanswered.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setConfirmFinishModal(false);
      return;
    }

    setSubmitting(true);
    try {
      const updated = await submitStudentAssessment(
        student,
        aptitudeAnswers,
        interestAnswers
      );
      onCompleted(updated);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menyimpan hasil tes. Silakan coba lagi.'
      );
      setConfirmFinishModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestionA = APTITUDE_QUESTIONS[currentIndexA];
  const currentDimensionMeta = useMemo(
    () => APTITUDE_DIMENSIONS.find((d) => d.key === currentQuestionA?.dimension),
    [currentQuestionA]
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Assessment Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {institution.name} · Asesmen Bakat &amp; Minat
              </p>
              <p className="font-display font-bold text-xs sm:text-base text-slate-900 truncate">
                {student.fullName} — {student.classMajor} ({student.schoolOrigin})
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {section === 'A' && (
                <div
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border font-mono text-xs sm:text-sm font-semibold tabular-nums ${
                    secondsLeft <= 60
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : secondsLeft <= 300
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{formatTime(secondsLeft)}</span>
                </div>
              )}

              <button
                type="button"
                onClick={async () => {
                  await persistProgress(aptitudeAnswers, interestAnswers);
                  onLogout();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="sm:hidden">Keluar</span>
                <span className="hidden sm:inline">Simpan &amp; Keluar</span>
              </button>
            </div>
          </div>

          {/* Progress Bar + Section Indicator */}
          <div className="mt-2.5 flex items-center gap-3 sm:gap-4">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${totalProgressPct}%` }}
              />
            </div>
            <span className="font-mono text-[11px] sm:text-xs font-semibold text-slate-700 tabular-nums whitespace-nowrap">
              {totalProgressPct}% ({answeredACount + answeredBCount}/{totalA + totalB})
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-8">
        {/* Section Switcher Tabs */}
        <div className="mb-5 sm:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg">
            <button
              type="button"
              disabled={secondsLeft === 0}
              onClick={() => setSection('A')}
              className={`min-h-[40px] px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap text-center ${
                section === 'A'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="sm:hidden">Bagian A ({answeredACount}/{totalA})</span>
              <span className="hidden sm:inline">
                Bagian A: Tes Bakat ({answeredACount}/{totalA})
              </span>
            </button>
            <button
              type="button"
              onClick={handleSwitchToSectionB}
              className={`min-h-[40px] px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap text-center ${
                section === 'B'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="sm:hidden">Bagian B ({answeredBCount}/{totalB})</span>
              <span className="hidden sm:inline">
                Bagian B: Tes Minat ({answeredBCount}/{totalB})
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Pilihan Jurusan: <strong className="text-slate-800">{student.majorChoice1}</strong> ·{' '}
            <strong className="text-slate-800">{student.majorChoice2}</strong>
          </p>
        </div>

        {timeExpiredNotice && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Waktu Bagian A (Tes Bakat) Telah Berakhir</p>
              <p className="text-xs mt-0.5 text-amber-800">
                Jawaban Bagian A Anda otomatis tersimpan. Silakan lanjutkan melengkapi Bagian B (Tes
                Minat) hingga selesai.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {section === 'A' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Main Question Card */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pb-3.5 sm:pb-4 border-b border-slate-100">
                <span className="font-semibold text-indigo-800">
                  Dimensi: {currentDimensionMeta?.name} ({currentDimensionMeta?.code})
                </span>
                <span className="font-mono font-semibold tabular-nums">
                  Soal {currentIndexA + 1} dari {totalA}
                </span>
              </div>

              <div className="mt-4 sm:mt-5">
                {currentQuestionA.diagramId && (
                  <QuestionDiagram diagramId={currentQuestionA.diagramId} />
                )}
                <p className="text-sm sm:text-lg font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                  {currentQuestionA.prompt}
                </p>
              </div>

              <div className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3">
                {currentQuestionA.options.map((opt, idx) => {
                  const selected = aptitudeAnswers[currentQuestionA.id] === idx;
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAptitude(currentQuestionA.id, idx)}
                      className={`w-full text-left rounded-lg border px-3.5 sm:px-4 py-3.5 min-h-[48px] text-sm transition-colors flex items-start gap-3 cursor-pointer ${
                        selected
                          ? 'border-indigo-700 bg-indigo-50/70 text-indigo-950 font-medium'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          selected
                            ? 'bg-indigo-800 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
                <button
                  type="button"
                  disabled={currentIndexA === 0}
                  onClick={() => setCurrentIndexA((i) => Math.max(0, i - 1))}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Sebelumnya
                </button>

                {currentIndexA < totalA - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndexA((i) => Math.min(totalA - 1, i + 1))}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-indigo-800 hover:bg-indigo-900 text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Soal Berikutnya
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSwitchToSectionB}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Lanjut ke Bagian B (Tes Minat)
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Question Navigator Palette */}
            <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Navigasi Soal Bakat (7 Dimensi)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Klik nomor soal untuk berpindah cepat.
              </p>

              <div className="mt-4 grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-7 gap-2">
                {APTITUDE_QUESTIONS.map((q, idx) => {
                  const isAnswered = aptitudeAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentIndexA;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndexA(idx)}
                      className={`h-10 sm:h-9 rounded-md font-mono text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-800 text-white ring-2 ring-indigo-300'
                          : isAnswered
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Terjawab</span>
                  <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                    {answeredACount} / {totalA}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Belum Dijawab</span>
                  <span className="font-mono font-semibold text-slate-700 tabular-nums">
                    {totalA - answeredACount}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSwitchToSectionB}
                className="mt-5 w-full min-h-[42px] py-2.5 px-4 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                Pindah ke Bagian B (Tes Minat) →
              </button>
            </aside>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
                Bagian B — Kuesioner Minat Karier (18 Dimensi)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Pilih tingkat ketertarikan Anda terhadap masing-masing aktivitas berikut pada skala
                1 (Sangat Tidak Suka) hingga 5 (Sangat Suka). Tidak ada jawaban benar atau salah.
              </p>
            </div>

            <div className="space-y-3.5 sm:space-y-4">
              {INTEREST_STATEMENTS.map((stmt, idx) => {
                const selectedVal = interestAnswers[stmt.id];
                return (
                  <div
                    key={stmt.id}
                    id={`stmt-${stmt.id}`}
                    className={`bg-white border rounded-xl p-4 sm:p-5 transition-colors ${
                      selectedVal !== undefined
                        ? 'border-slate-200'
                        : 'border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                        <span className="font-mono text-xs font-bold text-indigo-800 mr-2">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        {stmt.statement}
                      </p>
                      {selectedVal !== undefined && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </div>

                    <div className="sm:hidden flex items-center justify-between text-[11px] font-medium text-slate-500 mt-3 mb-1.5 px-0.5">
                      <span>1 = Sangat Tidak Suka</span>
                      <span>5 = Sangat Suka</span>
                    </div>

                    <div className="mt-1 sm:mt-4 grid grid-cols-5 gap-1.5 sm:gap-2">
                      {LIKERT_OPTIONS.map((opt) => {
                        const isSelected = selectedVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectInterest(stmt.id, opt.value)}
                            className={`min-h-[44px] py-2.5 px-1.5 sm:px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-800 border-indigo-800 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block font-mono text-sm font-bold tabular-nums">
                              {opt.value}
                            </span>
                            <span className="hidden sm:block text-[11px] mt-0.5 leading-tight">
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Status Pengisian: {answeredACount}/{totalA} Bakat · {answeredBCount}/{totalB} Minat
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pastikan seluruh pernyataan Bagian B terisi sebelum mengirim jawaban akhir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (answeredBCount < totalB) {
                    handleSubmitFinal();
                  } else {
                    setConfirmFinishModal(true);
                  }
                }}
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Selesai &amp; Kirim Jawaban
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {confirmFinishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 sm:p-6">
            <h3 className="font-display text-lg font-bold text-slate-950">
              Kirim Jawaban Asesmen?
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Anda telah menjawab <strong>{answeredACount} dari {totalA}</strong> soal bakat dan{' '}
              <strong>{answeredBCount} dari {totalB}</strong> pernyataan minat. Setelah dikirim,
              jawaban akan dikunci dan diproses menjadi laporan hasil asesmen.
            </p>
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setConfirmFinishModal(false)}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitFinal}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Ya, Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
