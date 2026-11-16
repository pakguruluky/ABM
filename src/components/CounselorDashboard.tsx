import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Loader2,
  LogOut,
  Search,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  loginCounselor,
  subscribeCounselorById,
  subscribeStudents,
} from '../services/abmService';
import { CounselorAccount, InstitutionSettings, StudentRecord } from '../types/abm';
import { formatIndonesianDate } from '../utils/pdfExport';
import { AbmReportAnalysisSections } from './AbmReportAnalysisSections';
import { AdminAnalyticsCharts } from './AdminAnalyticsCharts';

interface CounselorDashboardProps {
  institution: InstitutionSettings;
  onBackHome: () => void;
}

const COUNSELOR_SESSION_KEY = 'abm_counselor_id';

export const CounselorDashboard: React.FC<CounselorDashboardProps> = ({
  institution,
  onBackHome,
}) => {
  const [counselorId, setCounselorId] = useState<string | null>(() =>
    sessionStorage.getItem(COUNSELOR_SESSION_KEY)
  );
  const [counselor, setCounselor] = useState<CounselorAccount | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // Read-only monitoring filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterTestStatus, setFilterTestStatus] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Pantau status aktif akun Guru BK secara real-time
  useEffect(() => {
    if (!counselorId) {
      setCounselor(null);
      return;
    }
    const unsub = subscribeCounselorById(counselorId, (acc) => {
      if (!acc || !acc.isActive) {
        sessionStorage.removeItem(COUNSELOR_SESSION_KEY);
        setCounselorId(null);
        setCounselor(null);
        if (acc && !acc.isActive) {
          setAuthError('Akun Guru BK Anda telah dinonaktifkan oleh Admin.');
        }
        return;
      }
      setCounselor(acc);
    });
    return () => unsub();
  }, [counselorId]);

  // Pantau hasil seluruh siswa secara real-time ketika Guru BK login
  useEffect(() => {
    if (!counselor) return;
    const unsub = subscribeStudents(setStudents);
    return () => unsub();
  }, [counselor]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoggingIn(true);
    try {
      const account = await loginCounselor(usernameInput, passwordInput);
      sessionStorage.setItem(COUNSELOR_SESSION_KEY, account.id);
      setCounselorId(account.id);
      setCounselor(account);
      setUsernameInput('');
      setPasswordInput('');
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Gagal masuk ke akun Guru BK.'
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(COUNSELOR_SESSION_KEY);
    setCounselorId(null);
    setCounselor(null);
    setSelectedStudent(null);
    onBackHome();
  };

  const uniqueClasses = useMemo(() => {
    const set = new Set(students.map((s) => s.classMajor).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.schoolOrigin.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q);
      const matchesClass = filterClass === 'ALL' || s.classMajor === filterClass;
      const matchesTest = filterTestStatus === 'ALL' || s.testStatus === filterTestStatus;
      return matchesSearch && matchesClass && matchesTest;
    });
  }, [students, searchTerm, filterClass, filterTestStatus]);

  const stats = useMemo(() => {
    const total = students.length;
    const completed = students.filter((s) => s.testStatus === 'completed').length;
    const inProgress = students.filter((s) => s.testStatus === 'in_progress').length;
    const approved = students.filter(
      (s) => s.testStatus === 'completed' && s.reviewStatus === 'approved'
    ).length;
    return { total, completed, inProgress, approved };
  }, [students]);

  // Layar Login Guru BK
  if (!counselor) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-900 mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </button>

          <div className="w-11 h-11 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-4">
            <UserCheck className="w-5 h-5" />
          </div>
          <h1 className="font-display text-xl font-bold text-slate-950">
            Portal Guru BK (Lihat Hasil)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Masuk menggunakan akun Guru BK yang didaftarkan oleh Admin untuk melihat laporan dan
            analitik hasil asesmen peserta didik.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username Guru BK
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_\-]/g, ''));
                  setAuthError('');
                }}
                placeholder="Masukkan username Guru BK"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="Masukkan password"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Tampilkan atau sembunyikan password"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && <p className="text-xs text-red-700 mt-2">{authError}</p>}
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {loggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              Masuk ke Portal Guru BK
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Guru BK (Strictly Read-Only) */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {institution.logoBase64 ? (
              <img
                src={institution.logoBase64}
                alt={`Logo ${institution.name}`}
                className="w-9 h-9 object-contain rounded shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-display font-bold text-sm sm:text-base text-slate-950 truncate">
                {institution.name} — Portal Guru BK
              </p>
              <p className="text-xs text-slate-500 truncate">
                {counselor.fullName}
                {counselor.nip ? ` · NIP ${counselor.nip}` : ''} · Akses Hanya Lihat Hasil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs sm:text-sm font-medium text-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Ringkasan Angka Real-Time */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Total Peserta Terdaftar</p>
            <p className="font-mono text-2xl font-bold text-slate-950 mt-1 tabular-nums">
              {stats.total}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Selesai Tes</p>
            <p className="font-mono text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Sedang Mengerjakan</p>
            <p className="font-mono text-2xl font-bold text-indigo-800 mt-1 tabular-nums">
              {stats.inProgress}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Disetujui Admin</p>
            <p className="font-mono text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {stats.approved}
            </p>
          </div>
        </div>

        {/* Analitik Recharts untuk Guru BK */}
        <AdminAnalyticsCharts allStudents={students} filteredStudents={filteredStudents} />

        {/* Filter & Pencarian Peserta */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama siswa, sekolah, username..."
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs sm:text-sm focus:border-emerald-700 focus:outline-none"
              />
            </div>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white focus:border-emerald-700 focus:outline-none"
            >
              <option value="ALL">Semua Kelas / Jurusan</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select
              value={filterTestStatus}
              onChange={(e) => setFilterTestStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white focus:border-emerald-700 focus:outline-none"
            >
              <option value="ALL">Semua Status Tes</option>
              <option value="completed">Selesai Tes</option>
              <option value="in_progress">Sedang Mengerjakan</option>
              <option value="registered">Baru Terdaftar</option>
            </select>
          </div>
        </div>

        {/* Tabel Hasil Peserta (Read-Only) */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-display font-semibold text-slate-800">
                Belum Ada Data Peserta Ditampilkan
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Data hasil siswa akan muncul secara real-time begitu siswa mendaftar dan
                menyelesaikan asesmen.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Peserta Didik</th>
                    <th className="py-3 px-4">Kelas &amp; Sekolah</th>
                    <th className="py-3 px-4">Pilihan Jurusan</th>
                    <th className="py-3 px-4">Status Tes</th>
                    <th className="py-3 px-4 text-right">Lihat Hasil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{student.fullName}</p>
                        <p className="text-xs font-mono text-slate-500">@{student.username}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{student.classMajor}</p>
                        <p className="text-xs text-slate-500">{student.schoolOrigin}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        <p>1. {student.majorChoice1}</p>
                        <p className="text-slate-500">2. {student.majorChoice2}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {student.testStatus === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Selesai
                          </span>
                        ) : student.testStatus === 'in_progress' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">
                            <Clock className="w-3.5 h-3.5" />
                            Sedang Mengerjakan
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Baru Terdaftar</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Lihat Hasil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Lihat Hasil Siswa (Strictly View-Only untuk Guru BK) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-950">
                  Hasil Asesmen: {selectedStudent.fullName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedStudent.classMajor} · {selectedStudent.schoolOrigin} · Terdaftar{' '}
                  {formatIndonesianDate(selectedStudent.registeredAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-slate-500">Tempat, Tanggal Lahir</p>
                  <p className="font-semibold text-slate-900">
                    {selectedStudent.birthPlace},{' '}
                    {formatIndonesianDate(selectedStudent.birthDate)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Kontak Siswa / Orang Tua</p>
                  <p className="font-mono text-slate-900">
                    {selectedStudent.studentPhone} / {selectedStudent.parentPhone}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Pilihan Jurusan</p>
                  <p className="font-semibold text-slate-900">
                    1. {selectedStudent.majorChoice1} · 2. {selectedStudent.majorChoice2}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Alamat</p>
                  <p className="text-slate-800">{selectedStudent.address}</p>
                </div>
              </div>

              {selectedStudent.testStatus === 'completed' ? (
                <AbmReportAnalysisSections student={selectedStudent} />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    Siswa Ini Belum Menyelesaikan Asesmen
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Laporan skor 7 bakat, 18 minat, dan keselarasan jurusan akan tersedia segera
                    setelah siswa menekan tombol Selesai &amp; Kirim Jawaban.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
