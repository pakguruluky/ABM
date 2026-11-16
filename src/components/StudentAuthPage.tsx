import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { POPULAR_MAJOR_SUGGESTIONS } from '../data/abmCatalog';
import {
  checkUsernameAvailable,
  loginStudent,
  normalizeUsername,
  registerStudent,
} from '../services/abmService';
import { InstitutionSettings, StudentRecord } from '../types/abm';

interface StudentAuthPageProps {
  initialTab: 'register' | 'login';
  institution: InstitutionSettings;
  onBackHome: () => void;
  onAuthenticated: (student: StudentRecord) => void;
}

export const StudentAuthPage: React.FC<StudentAuthPageProps> = ({
  initialTab,
  institution,
  onBackHome,
  onAuthenticated,
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Registration state
  const [fullName, setFullName] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [classMajor, setClassMajor] = useState('');
  const [schoolOrigin, setSchoolOrigin] = useState(institution.name || '');
  const [address, setAddress] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [majorChoice1, setMajorChoice1] = useState('');
  const [majorChoice2, setMajorChoice2] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  const handleUsernameBlur = async () => {
    const clean = normalizeUsername(username);
    if (!clean) {
      setUsernameStatus('idle');
      return;
    }
    if (clean.length < 3) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    try {
      const ok = await checkUsernameAvailable(clean);
      setUsernameStatus(ok ? 'available' : 'taken');
    } catch {
      setUsernameStatus('idle');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const requiredFields = [
      { label: 'Nama Lengkap Siswa', val: fullName },
      { label: 'Tempat Lahir', val: birthPlace },
      { label: 'Tanggal Lahir', val: birthDate },
      { label: 'Kelas / Jurusan', val: classMajor },
      { label: 'Asal Sekolah', val: schoolOrigin },
      { label: 'Alamat Lengkap', val: address },
      { label: 'Nomor HP Siswa', val: studentPhone },
      { label: 'Nomor HP Orang Tua / Wali', val: parentPhone },
      { label: 'Pilihan Jurusan 1', val: majorChoice1 },
      { label: 'Pilihan Jurusan 2', val: majorChoice2 },
      { label: 'Username', val: username },
      { label: 'Password', val: password },
    ];

    const missing = requiredFields.find((f) => !f.val.trim());
    if (missing) {
      setErrorMsg(`Mohon lengkapi kolom "${missing.label}".`);
      return;
    }

    const cleanUser = normalizeUsername(username);
    if (cleanUser.length < 3) {
      setErrorMsg('Username minimal 3 karakter (hanya huruf, angka, _ atau -).');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password minimal 4 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await registerStudent({
        fullName,
        birthPlace,
        birthDate,
        classMajor,
        schoolOrigin,
        address,
        studentPhone,
        parentPhone,
        majorChoice1,
        majorChoice2,
        username: cleanUser,
        password,
      });
      onAuthenticated(created);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal mendaftarkan peserta. Silakan coba lagi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginUsername.trim() || !loginPassword) {
      setErrorMsg('Masukkan username dan password Anda.');
      return;
    }

    setSubmitting(true);
    try {
      const student = await loginStudent(loginUsername, loginPassword);
      onAuthenticated(student);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Login gagal. Periksa kredensial Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-5 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 min-h-[40px] text-sm font-medium text-slate-600 hover:text-indigo-900 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
          <span className="text-xs font-medium text-slate-500 truncate max-w-[140px] sm:max-w-xs">
            {institution.name}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Header & Segmented Tabs */}
          <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-slate-200 bg-slate-50/70">
            <h1 className="font-display text-lg sm:text-2xl font-bold text-slate-950">
              Portal Peserta Asesmen Bakat &amp; Minat
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Daftarkan diri sebagai peserta baru untuk memulai tes atau masuk ke akun siswa guna
              melanjutkan tes dan melihat hasil.
            </p>

            <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-1 p-1 bg-slate-200/70 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 min-h-[42px] py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'register'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span className="sm:hidden">Daftar Baru</span>
                <span className="hidden sm:inline">Pendaftaran Peserta Baru</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 min-h-[42px] py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'login'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span className="sm:hidden">Login Siswa</span>
                <span className="hidden sm:inline">Login Siswa Terdaftar</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            {errorMsg && (
              <div
                role="alert"
                className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === 'register' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <datalist id="major-suggestions">
                  {POPULAR_MAJOR_SUGGESTIONS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>

                <div>
                  <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                    1. Biodata Peserta Didik
                  </h2>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Nama Lengkap Siswa *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Nadira Putri Maharani"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Tempat Lahir *
                      </label>
                      <input
                        type="text"
                        required
                        value={birthPlace}
                        onChange={(e) => setBirthPlace(e.target.value)}
                        placeholder="Contoh: Bandung"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Tanggal Lahir *
                      </label>
                      <input
                        type="date"
                        required
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Kelas / Jurusan *
                      </label>
                      <input
                        type="text"
                        required
                        value={classMajor}
                        onChange={(e) => setClassMajor(e.target.value)}
                        placeholder="Contoh: 12 IPA 1 atau 12 IPS 2"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Asal Sekolah *
                      </label>
                      <input
                        type="text"
                        required
                        value={schoolOrigin}
                        onChange={(e) => setSchoolOrigin(e.target.value)}
                        placeholder="Contoh: SMA Negeri 1 Jakarta"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Alamat Lengkap *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Nomor HP Siswa *
                      </label>
                      <input
                        type="tel"
                        required
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Nomor HP Orang Tua / Wali *
                      </label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="0813xxxxxxxx"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                    2. Peminatan Jurusan Perguruan Tinggi
                  </h2>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pilihan Jurusan 1 (Prioritas Utama) *
                      </label>
                      <input
                        type="text"
                        required
                        list="major-suggestions"
                        value={majorChoice1}
                        onChange={(e) => setMajorChoice1(e.target.value)}
                        placeholder="Contoh: Teknik Informatika"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pilihan Jurusan 2 (Alternatif) *
                      </label>
                      <input
                        type="text"
                        required
                        list="major-suggestions"
                        value={majorChoice2}
                        onChange={(e) => setMajorChoice2(e.target.value)}
                        placeholder="Contoh: Sistem Informasi"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                    3. Kredensial Akun Siswa
                  </h2>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Username (Unik) *
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_\-]/g, ''));
                          setUsernameStatus('idle');
                        }}
                        onBlur={handleUsernameBlur}
                        placeholder="contoh: nadira_12ipa1"
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      <div className="mt-1.5 min-h-[18px] text-xs">
                        {usernameStatus === 'checking' && (
                          <span className="text-slate-500">Memeriksa ketersediaan username...</span>
                        )}
                        {usernameStatus === 'available' && (
                          <span className="text-emerald-700 inline-flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Username tersedia
                          </span>
                        )}
                        {usernameStatus === 'taken' && (
                          <span className="text-red-700 font-medium">
                            Username sudah terpakai. Silakan pilih username lain.
                          </span>
                        )}
                        {usernameStatus === 'invalid' && (
                          <span className="text-amber-700">
                            Minimal 3 karakter (huruf, angka, _ atau -).
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPass ? 'text' : 'password'}
                          required
                          minLength={4}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 4 karakter"
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPass((v) => !v)}
                          aria-label="Tampilkan atau sembunyikan password"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        >
                          {showRegPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={submitting || usernameStatus === 'taken'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-800 hover:bg-indigo-900 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Simpan Biodata &amp; Mulai Tes
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto py-4 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username Siswa
                  </label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) =>
                      setLoginUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_\-]/g, ''))
                    }
                    placeholder="Masukkan username terdaftar"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPass ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass((v) => !v)}
                      aria-label="Tampilkan atau sembunyikan password"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      {showLoginPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-800 hover:bg-indigo-900 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Masuk ke Akun Siswa
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
