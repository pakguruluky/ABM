import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import {
  APTITUDE_DIMENSIONS,
  INTEREST_DIMENSIONS,
  INTEREST_TYPE_META,
} from '../data/abmCatalog';
import { StudentRecord } from '../types/abm';
import { getAptitudeCategory } from '../utils/scoring';

interface AdminAnalyticsChartsProps {
  allStudents: StudentRecord[];
  filteredStudents: StudentRecord[];
}

export const AdminAnalyticsCharts: React.FC<AdminAnalyticsChartsProps> = ({
  allStudents,
  filteredStudents,
}) => {
  const [scope, setScope] = useState<'all' | 'filtered'>('all');
  const [aptChartMode, setAptChartMode] = useState<'avg' | 'distribution'>('avg');

  const completedStudents = useMemo(() => {
    const source = scope === 'all' ? allStudents : filteredStudents;
    return source.filter((s) => s.testStatus === 'completed');
  }, [allStudents, filteredStudents, scope]);

  const aptitudeChartData = useMemo(() => {
    const count = completedStudents.length;
    return APTITUDE_DIMENSIONS.map((dim) => {
      let sum = 0;
      let tinggi = 0;
      let sedang = 0;
      let rendah = 0;

      completedStudents.forEach((s) => {
        const val = s.aptitudeScores?.[dim.key] ?? 0;
        sum += val;
        const cat = getAptitudeCategory(val);
        if (cat === 'Tinggi') tinggi += 1;
        else if (cat === 'Sedang') sedang += 1;
        else rendah += 1;
      });

      const avg = count > 0 ? Math.round(sum / count) : 0;
      return {
        code: dim.code,
        name: dim.name.replace('Kemampuan ', ''),
        fullName: dim.name,
        rataRata: avg,
        Tinggi: tinggi,
        Sedang: sedang,
        Rendah: rendah,
      };
    });
  }, [completedStudents]);

  const interestChartData = useMemo(() => {
    const count = completedStudents.length;
    return INTEREST_DIMENSIONS.map((dim) => {
      const sum = completedStudents.reduce(
        (acc, s) => acc + (s.interestScores?.[dim.key] ?? 0),
        0
      );
      const avg = count > 0 ? Math.round(sum / count) : 0;
      const dominantCount = completedStudents.filter(
        (s) => (s.interestScores?.[dim.key] ?? 0) > 50
      ).length;
      return {
        key: dim.key,
        name: dim.name,
        interestType: dim.interestType,
        rataRata: avg,
        dominantCount,
        color: INTEREST_TYPE_META[dim.interestType].hex,
      };
    }).sort((a, b) => b.rataRata - a.rataRata);
  }, [completedStudents]);

  const alignmentChartData = useMemo(() => {
    const statuses = ['Sangat Selaras', 'Cukup Selaras', 'Perlu Penguatan'] as const;
    return statuses.map((status) => ({
      status,
      'Pilihan 1': completedStudents.filter(
        (s) => s.majorAlignment?.choice1?.status === status
      ).length,
      'Pilihan 2': completedStudents.filter(
        (s) => s.majorAlignment?.choice2?.status === status
      ).length,
    }));
  }, [completedStudents]);

  if (allStudents.filter((s) => s.testStatus === 'completed').length === 0) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="font-display font-semibold text-sm text-slate-800">
          Visualisasi Distribusi Bakat &amp; Minat Belum Tersedia
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Grafik sebaran skor rata-rata 7 bakat, 18 minat, dan keselarasan jurusan akan tampil
          otomatis setelah minimal satu siswa menyelesaikan asesmen.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-950">
            Analitik Visual Distribusi Bakat &amp; Minat Peserta
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Menampilkan agregasi real-time dari{' '}
            <strong className="text-slate-800 font-mono tabular-nums">
              {completedStudents.length}
            </strong>{' '}
            peserta yang telah menyelesaikan tes.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <div className="grid grid-cols-2 sm:inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap text-center ${
                scope === 'all'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="sm:hidden">Semua Selesai</span>
              <span className="hidden sm:inline">Seluruh Peserta Selesai</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('filtered')}
              className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap text-center ${
                scope === 'filtered'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="sm:hidden">
                Filter ({filteredStudents.filter((s) => s.testStatus === 'completed').length})
              </span>
              <span className="hidden sm:inline">
                Sesuai Filter Tabel ({filteredStudents.filter((s) => s.testStatus === 'completed').length})
              </span>
            </button>
          </div>
        </div>
      </div>

      {completedStudents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
          Tidak ada peserta selesai tes pada cakupan filter saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
          {/* Chart 1: Distribusi 7 Aspek Bakat (Bar / Stacked Category) */}
          <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Distribusi Skor 7 Dimensi Bakat
                </h3>
                <p className="text-xs text-slate-500">
                  {aptChartMode === 'avg'
                    ? 'Rata-rata skor (0–100) per dimensi kognitif'
                    : 'Jumlah peserta per kategori (Tinggi ≥70, Sedang 40–69, Rendah <40)'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
                <button
                  type="button"
                  onClick={() => setAptChartMode('avg')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    aptChartMode === 'avg'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Rata-Rata
                </button>
                <button
                  type="button"
                  onClick={() => setAptChartMode('distribution')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    aptChartMode === 'distribution'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Sebaran Kategori
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {aptChartMode === 'avg' ? (
                  <BarChart
                    data={aptitudeChartData}
                    margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="code"
                      tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`${value ?? 0} / 100`, 'Rata-rata']}
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.fullName || String(label)
                      }
                    />
                    <ReferenceLine y={70} stroke="#059669" strokeDasharray="4 4" />
                    <ReferenceLine y={40} stroke="#d97706" strokeDasharray="4 4" />
                    <Bar dataKey="rataRata" name="Rata-rata Skor" radius={[6, 6, 0, 0]} maxBarSize={42}>
                      {aptitudeChartData.map((entry) => (
                        <Cell
                          key={entry.code}
                          fill={
                            entry.rataRata >= 70
                              ? '#059669'
                              : entry.rataRata >= 40
                                ? '#3730a3'
                                : '#d97706'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart
                    data={aptitudeChartData}
                    margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="code"
                      tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.fullName || String(label)
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Tinggi" stackId="cat" fill="#059669" maxBarSize={42} />
                    <Bar dataKey="Sedang" stackId="cat" fill="#4338ca" maxBarSize={42} />
                    <Bar
                      dataKey="Rendah"
                      stackId="cat"
                      fill="#d97706"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Radar Profil Bakat Angkatan */}
          <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col">
            <div className="mb-2">
              <h3 className="font-display text-sm font-bold text-slate-900">
                Peta Radar Profil Bakat Kolektif
              </h3>
              <p className="text-xs text-slate-500">
                Keseimbangan rata-rata kapasitas kognitif seluruh peserta pada 7 aspek.
              </p>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="66%" data={aptitudeChartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#334155', fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [`${value ?? 0} / 100`, 'Rata-rata']}
                  />
                  <Radar
                    name="Rata-rata Bakat"
                    dataKey="rataRata"
                    stroke="#3730a3"
                    fill="#4338ca"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Peringkat Rata-Rata 18 Aspek Minat */}
          <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Distribusi Rata-Rata 18 Aspek Minat Peserta
                </h3>
                <p className="text-xs text-slate-500">
                  Garis putus-putus menandai ambang batas Minat Dominan (&gt; 50).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                <span className="text-indigo-800">● Minat Dasar</span>
                <span className="text-amber-700">● Minat Metodis</span>
                <span className="text-emerald-700">● Minat Praktis</span>
              </div>
            </div>

            <div className="h-[440px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={interestChartData}
                  margin={{ top: 4, right: 14, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={116}
                    tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value, _name, item) => [
                      `${value ?? 0} / 100 (${item?.payload?.dominantCount ?? 0} siswa skor > 50)`,
                      item?.payload?.interestType || 'Skor Minat',
                    ]}
                  />
                  <ReferenceLine x={50} stroke="#0f172a" strokeDasharray="4 4" />
                  <Bar dataKey="rataRata" radius={[0, 4, 4, 0]} barSize={16}>
                    {interestChartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Keselarasan Pilihan Jurusan 1 & 2 */}
          <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                Sebaran Keselarasan Pilihan Jurusan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan tingkat kecocokan Pilihan 1 dan Pilihan 2 peserta terhadap profil
                bakat-minat.
              </p>
            </div>

            <div className="h-64 sm:h-72 w-full my-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={alignmentChartData}
                  margin={{ top: 10, right: 8, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="status"
                    interval={0}
                    tick={{ fontSize: 10, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Pilihan 1" fill="#3730a3" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Pilihan 2" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              <p>
                Peserta <strong className="text-emerald-700">Sangat Selaras</strong> pada Pilihan 1:{' '}
                <span className="font-mono font-bold tabular-nums">
                  {alignmentChartData[0]?.['Pilihan 1'] ?? 0}
                </span>{' '}
                siswa
              </p>
              <p>
                Peserta <strong className="text-amber-700">Perlu Penguatan</strong> pada Pilihan 1:{' '}
                <span className="font-mono font-bold tabular-nums">
                  {alignmentChartData[2]?.['Pilihan 1'] ?? 0}
                </span>{' '}
                siswa
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
