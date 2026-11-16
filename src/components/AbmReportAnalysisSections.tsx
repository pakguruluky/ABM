import React from 'react';
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Info,
  Lightbulb,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  APTITUDE_DIMENSIONS,
  ASSESSMENT_PREAMBLE,
  DOMINANT_INTEREST_RULE_NOTE,
  INTEREST_DIMENSIONS,
  INTEREST_TYPE_META,
  MATRIX_ROW_ORDER,
  PEDOMAN_PEMAHAMAN,
} from '../data/abmCatalog';
import { InterestKey, StudentRecord } from '../types/abm';
import { getAptitudeCategory } from '../utils/scoring';

interface AbmReportAnalysisSectionsProps {
  student: StudentRecord;
}

export const AbmReportAnalysisSections: React.FC<AbmReportAnalysisSectionsProps> = ({
  student,
}) => {
  const getInterestScore = (key: InterestKey) => student.interestScores?.[key] ?? 0;

  // Hitung minat dominan berdasarkan aturan BP3:
  // Prioritaskan Minat Metodis & Praktis dengan skor > 50; jika tidak ada, lihat Minat Dasar > 50
  const methodicalPracticalDominant = INTEREST_DIMENSIONS.filter(
    (d) =>
      (d.interestType === 'Minat Metodis' || d.interestType === 'Minat Praktis') &&
      getInterestScore(d.key) > 50
  ).sort((a, b) => getInterestScore(b.key) - getInterestScore(a.key));

  const basicDominant = INTEREST_DIMENSIONS.filter(
    (d) => d.interestType === 'Minat Dasar' && getInterestScore(d.key) > 50
  ).sort((a, b) => getInterestScore(b.key) - getInterestScore(a.key));

  const effectivePrimaryInterests =
    methodicalPracticalDominant.length > 0 ? methodicalPracticalDominant : basicDominant;

  const matrixRows = MATRIX_ROW_ORDER.map((key, index) => {
    const dim = INTEREST_DIMENSIONS.find((d) => d.key === key)!;
    const score = getInterestScore(key);
    return {
      no: index + 1,
      dim,
      score,
      isDominant: score > 50,
    };
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Pengantar & Evaluasi Pilihan Jurusan */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-800 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{ASSESSMENT_PREAMBLE}</p>
        </div>

        {/* Petunjuk Singkat Cara Membaca Laporan */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-950">
            <BookOpen className="w-4 h-4 text-indigo-700 shrink-0" />
            <h2 className="font-display text-sm sm:text-base font-bold">
              Petunjuk Cara Membaca Laporan Hasil ABM
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs leading-relaxed">
            <div className="rounded-lg bg-white border border-slate-200 p-3.5">
              <p className="font-bold text-indigo-900">1. Baca 7 Skor Bakat</p>
              <p className="text-slate-600 mt-1">
                Skor <strong>≥ 70 (Tinggi)</strong> menandakan kekuatan utama,{' '}
                <strong>40–69 (Sedang)</strong> memadai untuk dikembangkan, dan{' '}
                <strong>&lt; 40 (Rendah)</strong> memerlukan latihan penguatan terarah.
              </p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 p-3.5">
              <p className="font-bold text-emerald-800">2. Cek Minat Dominan</p>
              <p className="text-slate-600 mt-1">
                Prioritaskan <strong>Minat Metodis &amp; Praktis</strong> dengan skor{' '}
                <strong>&gt; 50</strong> sebagai minat karier utama. Jika belum ada yang &gt; 50,
                gunakan <strong>Minat Dasar (&gt; 50)</strong> sebagai rujukan.
              </p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 p-3.5">
              <p className="font-bold text-slate-900">3. Pahami Matriks 18 × 7</p>
              <p className="text-slate-600 mt-1">
                Cari baris yang disorot hijau. Tanda <strong>✓</strong> berarti minat dominan sudah
                didukung bakat <strong>≥ 40</strong>, sedangkan <strong>×</strong> berarti bakat
                prasyarat masih <strong>&lt; 40</strong>.
              </p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 p-3.5">
              <p className="font-bold text-amber-800">4. Evaluasi Jurusan &amp; Konsultasi</p>
              <p className="text-slate-600 mt-1">
                Bandingkan tingkat keselarasan Pilihan 1 &amp; 2, rumpun rekomendasi sistem, serta
                nilai rapor sekolah lalu konsultasikan bersama <strong>Guru BK</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Pilihan Jurusan 1 (Utama)
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold ${
                  student.majorAlignment?.choice1?.status === 'Sangat Selaras'
                    ? 'text-emerald-700'
                    : student.majorAlignment?.choice1?.status === 'Cukup Selaras'
                      ? 'text-indigo-800'
                      : 'text-amber-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {student.majorAlignment?.choice1?.status} (
                {student.majorAlignment?.choice1?.alignmentScore ?? 0}%)
              </span>
            </div>
            <p className="font-display text-base sm:text-lg font-bold text-slate-950 mt-1">
              {student.majorChoice1}
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {student.majorAlignment?.choice1?.notes}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Pilihan Jurusan 2 (Alternatif)
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold ${
                  student.majorAlignment?.choice2?.status === 'Sangat Selaras'
                    ? 'text-emerald-700'
                    : student.majorAlignment?.choice2?.status === 'Cukup Selaras'
                      ? 'text-indigo-800'
                      : 'text-amber-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {student.majorAlignment?.choice2?.status} (
                {student.majorAlignment?.choice2?.alignmentScore ?? 0}%)
              </span>
            </div>
            <p className="font-display text-base sm:text-lg font-bold text-slate-950 mt-1">
              {student.majorChoice2}
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {student.majorAlignment?.choice2?.notes}
            </p>
          </div>
        </div>
      </section>

      {/* Hasil Asesmen Bakat (7 Dimensi) */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <Award className="w-5 h-5 text-indigo-800" />
          <div>
            <h2 className="font-display text-xl font-bold text-slate-950">
              Hasil Asesmen Bakat (7 Dimensi Kognitif)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Klasifikasi Skor: Tinggi / Baik (≥70) · Sedang (40–69) · Rendah / Perlu Pengembangan (&lt;40)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {APTITUDE_DIMENSIONS.map((dim) => {
            const score = student.aptitudeScores?.[dim.key] ?? 0;
            const category = getAptitudeCategory(score);
            const barColor =
              category === 'Tinggi'
                ? 'bg-emerald-600'
                : category === 'Sedang'
                  ? 'bg-indigo-700'
                  : 'bg-amber-600';
            const textColor =
              category === 'Tinggi'
                ? 'text-emerald-700'
                : category === 'Sedang'
                  ? 'text-indigo-800'
                  : 'text-amber-700';

            return (
              <article
                key={dim.key}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs text-slate-500">{dim.code}</span>
                    <h3 className="font-display text-base font-bold text-slate-900">{dim.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums">
                      {score}
                    </span>
                    <p className={`text-xs font-bold ${textColor}`}>({category.toUpperCase()})</p>
                  </div>
                </div>

                <div className="mt-3 h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
                </div>

                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {dim.interpretations[category]}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Hasil Asesmen Minat (18 Dimensi dengan Klasifikasi Minat Dasar / Metodis / Praktis) */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-indigo-800" />
          <div>
            <h2 className="font-display text-xl font-bold text-slate-950">
              Hasil Asesmen Minat (18 Aspek Karier)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pengelompokan berdasarkan Minat Dasar, Minat Metodis, dan Minat Praktis.
            </p>
          </div>
        </div>

        {/* Ringkasan Minat Dominan Sesuai Aturan BP3 */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
          <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            Kesimpulan Minat Dominan ({methodicalPracticalDominant.length > 0 ? 'Basis Minat Metodis & Praktis > 50' : 'Basis Minat Dasar > 50'})
          </p>
          <p className="mt-1.5 text-sm font-semibold text-slate-900">
            {effectivePrimaryInterests.length > 0
              ? effectivePrimaryInterests
                  .map((d) => `${d.name} (${getInterestScore(d.key)})`)
                  .join('  ·  ')
              : 'Belum ada aspek minat dengan skor di atas 50; perhatikan 3 aspek dengan skor tertinggi di bawah.'}
          </p>
          {methodicalPracticalDominant.length > 0 && basicDominant.length > 0 && (
            <p className="mt-1.5 text-xs text-slate-700">
              <strong className="text-indigo-900">Minat Dasar Penunjang (&gt;50):</strong>{' '}
              {basicDominant.map((d) => `${d.name} (${getInterestScore(d.key)})`).join(' · ')}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-600">{DOMINANT_INTEREST_RULE_NOTE}</p>
        </div>

        {/* Daftar 18 Aspek Minat per Urutan Resmi dengan Bar & Warna Tipe Minat */}
        <div className="space-y-3">
          {INTEREST_DIMENSIONS.map((item) => {
            const score = getInterestScore(item.key);
            const isDominant = score > 50;
            const meta = INTEREST_TYPE_META[item.interestType];

            return (
              <div
                key={item.key}
                className="rounded-lg border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold" style={{ color: meta.hex }}>
                      {item.interestType}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.cluster}</span>
                    {isDominant && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-bold text-emerald-700">Skor Dominan (&gt;50)</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 mt-0.5">
                    {item.name}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      ({item.englishName})
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {item.shortDesc}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Mendukung karier: {item.careers.join(' · ')}
                  </p>
                </div>

                <div className="md:w-52 shrink-0">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Skor</span>
                    <span className="font-mono font-bold text-base text-slate-950 tabular-nums">
                      {score}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${score}%`,
                        backgroundColor: meta.hex,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Keterangan 3 Jenis Minat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          {(['Minat Dasar', 'Minat Metodis', 'Minat Praktis'] as const).map((t) => {
            const info = INTEREST_TYPE_META[t];
            return (
              <div key={t} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold" style={{ color: info.hex }}>
                  ● {info.title}
                </p>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{info.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Matriks Kesesuaian Bakat dan Minat (Tabel 18 x 7 + Ringkasan) */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-950">
              Matriks Kesesuaian Bakat dan Minat (18 × 7)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Centang (<span className="font-semibold text-emerald-700">✓</span>) hanya diberikan
              pada aspek minat dominan (&gt;50) yang didukung skor bakat kognitif memadai (≥40 /
              Sedang–Tinggi).
            </p>
          </div>
        </div>

        {/* Keterangan Simbol Matriks */}
        <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 sm:px-4 py-2.5 text-xs text-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-emerald-600 text-white shrink-0">
              <Check className="w-3 h-3" />
            </span>
            <span>Selaras Kuat (Minat &gt; 50 &amp; Bakat ≥ 70)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
              <Check className="w-3 h-3" />
            </span>
            <span>Sesuai / Memadai (Minat &gt; 50 &amp; Bakat 40–69)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-amber-50 text-amber-700 border border-amber-300 shrink-0">
              <X className="w-3 h-3" />
            </span>
            <span>Prasyarat Bakat Perlu Penguatan (Bakat &lt; 40)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0">
              ○
            </span>
            <span>Referensi Matriks Umum (Minat ≤ 50)</span>
          </span>
        </div>

        <p className="md:hidden text-[11px] font-medium text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
          Geser tabel ke samping untuk melihat seluruh 7 kolom bakat kognitif →
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-indigo-950 text-white">
                <th className="py-2.5 px-2 sm:px-3 font-semibold text-center w-9 sm:w-10">No</th>
                <th className="py-2.5 px-2.5 sm:px-3 font-semibold min-w-[165px] sm:min-w-0">
                  Aspek Minat
                </th>
                <th className="py-2.5 px-2 sm:px-3 font-semibold text-center">Skor</th>
                {APTITUDE_DIMENSIONS.map((apt) => (
                  <th key={apt.key} className="py-2.5 px-2.5 font-semibold text-center">
                    <span className="block">{apt.name.replace('Kemampuan ', '')}</span>
                    <span className="font-mono text-[11px] text-emerald-300 tabular-nums">
                      ({student.aptitudeScores?.[apt.key] ?? 0})
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {matrixRows.map(({ no, dim, score, isDominant }) => (
                <tr
                  key={dim.key}
                  className={isDominant ? 'bg-emerald-50/70' : 'bg-white hover:bg-slate-50'}
                >
                  <td className="py-2 px-3 text-center font-mono text-slate-500 tabular-nums">
                    {no}
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-semibold text-slate-900">{dim.name}</span>{' '}
                    <span className="text-slate-500">({dim.englishName})</span>
                  </td>
                  <td className="py-2 px-3 text-center font-mono font-bold tabular-nums">
                    <span className={isDominant ? 'text-emerald-700' : 'text-slate-600'}>
                      {score}
                    </span>
                  </td>
                  {APTITUDE_DIMENSIONS.map((apt) => {
                    const required = dim.supportingAptitudes.includes(apt.key);
                    const studentAptScore = student.aptitudeScores?.[apt.key] ?? 0;
                    const isMatched = isDominant && studentAptScore >= 40;
                    const isUnmetAptitude = isDominant && studentAptScore < 40;
                    return (
                      <td key={apt.key} className="py-2 px-2.5 text-center">
                        {!required ? (
                          <span className="text-slate-300">-</span>
                        ) : isMatched ? (
                          <span
                            title={`Sesuai: ${dim.name} (${score}) didukung ${apt.name} (${studentAptScore})`}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded ${
                              studentAptScore >= 70
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : isUnmetAptitude ? (
                          <span
                            title={`Perlu Penguatan: ${dim.name} (${score}) membutuhkan ${apt.name}, namun skor siswa ${studentAptScore} (< 40)`}
                            className="inline-flex items-center justify-center w-5 h-5 rounded bg-amber-50 text-amber-700 border border-amber-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span
                            title={`Referensi Matriks Umum: ${dim.name} membutuhkan ${apt.name} (skor minat ${score} ≤ 50)`}
                            className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-slate-400 text-[11px] font-bold"
                          >
                            ○
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ringkasan Keselarasan Minat Dominan */}
        {(student.majorAlignment?.matches || []).length > 0 && (
          <div className="pt-2">
            <h3 className="font-display text-sm font-bold text-slate-900 mb-3">
              Ringkasan Keseimbangan Bakat Pendukung pada Minat Teratas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                    <th className="py-2.5 pr-4">Aspek Minat</th>
                    <th className="py-2.5 px-4 text-right">Skor Minat</th>
                    <th className="py-2.5 px-4">Bakat Pendukung</th>
                    <th className="py-2.5 pl-4 text-right">Keselarasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {student.majorAlignment.matches.map((match) => (
                    <tr key={match.interestKey}>
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        {match.interestName}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-900 tabular-nums">
                        {match.interestScore}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {match.supportingAptitudes.join(' · ')}
                      </td>
                      <td className="py-3 pl-4 text-right font-semibold whitespace-nowrap">
                        <span
                          className={
                            match.compatibilityLabel === 'Sangat Selaras'
                              ? 'text-emerald-700'
                              : match.compatibilityLabel === 'Cukup Selaras'
                                ? 'text-indigo-800'
                                : 'text-amber-700'
                          }
                        >
                          {match.compatibilityLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {student.majorAlignment?.recommendedClusters?.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rumpun Program Studi Paling Direkomendasikan
            </p>
            <p className="mt-1.5 text-sm sm:text-base font-semibold text-indigo-950">
              {student.majorAlignment.recommendedClusters.join('  ·  ')}
            </p>
          </div>
        )}
      </section>

      {/* Pedoman Pemahaman & Saran Konseling */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-indigo-800" />
          <div>
            <h2 className="font-display text-xl font-bold text-slate-950">
              Pedoman Pemahaman &amp; Saran Tindak Lanjut
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Panduan membaca hasil Asesmen Bakat dan Minat untuk perencanaan studi dan karier.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <h3 className="font-display text-sm font-bold text-indigo-900">
              Menginterpretasi Hasil Tes Bakat
            </h3>
            <p className="text-xs font-semibold text-slate-800">
              {PEDOMAN_PEMAHAMAN.bakat[0].title}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {PEDOMAN_PEMAHAMAN.bakat[0].body}
            </p>
            <p className="text-xs font-semibold text-slate-800 pt-1">
              {PEDOMAN_PEMAHAMAN.bakat[1].title}
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
              {PEDOMAN_PEMAHAMAN.bakat[1].items?.map((li, i) => (
                <li key={i}>{li}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <h3 className="font-display text-sm font-bold text-emerald-800">
              Menginterpretasi Hasil Tes Minat
            </h3>
            <p className="text-xs font-semibold text-slate-800">
              {PEDOMAN_PEMAHAMAN.minat[0].title}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {PEDOMAN_PEMAHAMAN.minat[0].body}
            </p>
            <p className="text-xs font-semibold text-slate-800 pt-1">
              {PEDOMAN_PEMAHAMAN.minat[1].title}
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
              {PEDOMAN_PEMAHAMAN.minat[1].items?.map((li, i) => (
                <li key={i}>{li}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Menggabungkan Bakat &amp; Minat
            </h3>
            {PEDOMAN_PEMAHAMAN.gabungan.map((g, i) => (
              <div key={i} className="space-y-1">
                <p className="text-xs font-semibold text-slate-800">{g.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{g.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5">
          <div className="flex items-center gap-2 text-indigo-950 font-display font-bold text-sm mb-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            Saran Konseling Lanjutan
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc pl-5 leading-relaxed">
            {PEDOMAN_PEMAHAMAN.saran.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
