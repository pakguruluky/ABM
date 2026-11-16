import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { APTITUDE_DIMENSIONS, INTEREST_DIMENSIONS } from '../data/abmCatalog';
import { AssessmentSettings, InstitutionSettings } from '../types/abm';
import heroCounselingImg from '../assets/images/hero_abm_counseling_1794793922530.jpg';

interface LandingPageProps {
  institution: InstitutionSettings;
  assessmentSettings: AssessmentSettings;
  onStartRegister: () => void;
  onStartLogin: () => void;
  onOpenAdmin: () => void;
  onOpenCounselor: () => void;
}

const CLUSTER_TABS = [
  'Semua',
  'Sains & Teknik',
  'Bisnis & Data',
  'Sosial & Layanan',
  'Kreatif & Lapangan',
] as const;

export const LandingPage: React.FC<LandingPageProps> = ({
  institution,
  assessmentSettings,
  onStartRegister,
  onStartLogin,
  onOpenAdmin,
  onOpenCounselor,
}) => {
  const [selectedCluster, setSelectedCluster] =
    useState<(typeof CLUSTER_TABS)[number]>('Semua');
  const [heroImgError, setHeroImgError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredInterests =
    selectedCluster === 'Semua'
      ? INTEREST_DIMENSIONS
      : INTEREST_DIMENSIONS.filter((item) => item.cluster === selectedCluster);

  const releaseModeLabel =
    assessmentSettings.mode === 'immediate'
      ? 'Rilis hasil langsung setelah selesai tes'
      : assessmentSettings.mode === 'scheduled'
        ? 'Rilis hasil terjadwal oleh lembaga'
        : 'Hasil diverifikasi oleh Guru BK / Admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation — 3-Zone Contract + Tablet/Mobile Drawer */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4 lg:gap-8">
          {/* Zone 1: Brand Wordmark / Logo */}
          <a
            href="#beranda"
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-700 rounded-md"
          >
            {institution.logoBase64 ? (
              <img
                src={institution.logoBase64}
                alt={`Logo ${institution.name}`}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-md shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-900 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            <span className="font-display font-bold text-sm sm:text-base lg:text-lg tracking-tight text-slate-900 whitespace-nowrap truncate max-w-[145px] sm:max-w-[230px] lg:max-w-xs">
              {institution.name}
            </span>
          </a>

          {/* Zone 2: Concise Nav Links (Laptop & Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a
              href="#tentang"
              className="hover:text-indigo-800 transition-colors whitespace-nowrap shrink-0"
            >
              Tentang ABM
            </a>
            <a
              href="#aspek-bakat"
              className="hover:text-indigo-800 transition-colors whitespace-nowrap shrink-0"
            >
              7 Aspek Bakat
            </a>
            <a
              href="#aspek-minat"
              className="hover:text-indigo-800 transition-colors whitespace-nowrap shrink-0"
            >
              18 Aspek Minat
            </a>
            <a
              href="#alur-tes"
              className="hover:text-indigo-800 transition-colors whitespace-nowrap shrink-0"
            >
              Alur Pengerjaan
            </a>
          </nav>

          {/* Zone 3: Primary Action + Discreet Counselor/Admin + Mobile/Tablet Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenCounselor}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Portal Guru BK
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              Portal Admin
            </button>
            <button
              type="button"
              onClick={onStartRegister}
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 min-h-[38px] text-xs sm:text-sm font-semibold text-white bg-indigo-800 hover:bg-indigo-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="sm:hidden">Mulai Tes</span>
              <span className="hidden sm:inline">Daftar &amp; Mulai Tes</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Drawer (< lg) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4">
            <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm font-medium text-slate-700">
              <a
                href="#tentang"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-center"
              >
                Tentang ABM
              </a>
              <a
                href="#aspek-bakat"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-center"
              >
                7 Aspek Bakat
              </a>
              <a
                href="#aspek-minat"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-center"
              >
                18 Aspek Minat
              </a>
              <a
                href="#alur-tes"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-center"
              >
                Alur Tes
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStartLogin();
                }}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-700" />
                Login Siswa (Lihat Hasil)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCounselor();
                }}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-indigo-800" />
                Portal Guru BK
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-700" />
                Portal Admin
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="beranda" className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              <div className="lg:col-span-7 flex flex-col justify-center">
                <p className="text-xs sm:text-sm font-medium text-indigo-800 mb-3">
                  {institution.subtitle} · {institution.city}
                </p>
                <h1 className="font-display text-2xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-950 leading-[1.18] sm:leading-[1.15] [text-wrap:balance]">
                  Petakan Potensi Diri dengan Asesmen Bakat dan Minat Terpadu
                </h1>
                <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Instrumen evaluasi psikometrik komprehensif yang mengukur 7 dimensi bakat kognitif
                  dan 18 klaster minat karier untuk membantu peserta didik menentukan jurusan
                  perguruan tinggi serta rencana karier secara objektif.
                </p>

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={onStartRegister}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[46px] text-sm font-semibold text-white bg-indigo-800 hover:bg-indigo-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Daftar &amp; Mulai Tes
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onStartLogin}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[46px] text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    Login Siswa (Lihat Hasil)
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{releaseModeLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>NPSN/Kode: {institution.npsn || '-'}</span>
                  <span aria-hidden="true">·</span>
                  <span>Durasi Tes Bakat 25 Menit</span>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col">
                <div className="relative flex-1 min-h-[260px] lg:min-h-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  {!heroImgError ? (
                    <img
                      src={heroCounselingImg}
                      alt="Suasana ruang bimbingan dan konseling akademik modern"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white">
                      <Compass className="w-12 h-12 text-emerald-400 mb-3" />
                      <p className="font-display font-semibold text-lg">
                        Asesmen Bakat &amp; Minat
                      </p>
                      <p className="text-xs text-indigo-200 mt-1">{institution.name}</p>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-5 text-white">
                    <p className="text-xs font-medium text-emerald-300">
                      Layanan Bimbingan Konseling Akademik
                    </p>
                    <p className="text-sm font-semibold mt-0.5">
                      Penyelarasan Profil Kognitif dan Pilihan Program Studi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Column Summary Strip */}
            <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="font-mono text-2xl font-bold text-indigo-900 tabular-nums">
                  07 Dimensi
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">Aspek Bakat Kognitif</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Spasial, Verbal, Penalaran, Klerikal, Mekanik, Kuantitatif, Bahasa
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                  18 Dimensi
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">Aspek Minat Karier</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemetaan aktivitas kerja di 4 rumpun klaster profesional
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-indigo-900 tabular-nums">
                  71 Butir
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">Instrumen Terstandar</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  35 soal pilihan ganda bakat &amp; 36 skala Likert minat
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                  Real-Time
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">Matriks Kesesuaian</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluasi otomatis keselarasan Pilihan Jurusan 1 &amp; 2
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tentang ABM & Manfaat */}
        <section id="tentang" className="py-14 lg:py-18 border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5">
                <p className="text-xs font-semibold tracking-wider text-indigo-800 uppercase">
                  Landasan Asesmen
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 mt-2 [text-wrap:balance]">
                  Mengapa Asesmen Bakat dan Minat Penting Sebelum Memilih Jurusan?
                </h2>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Kesalahan memilih jurusan kuliah sering terjadi karena keputusan diambil hanya
                  berdasarkan tren sesaat tanpa mempertimbangkan kapasitas kognitif (bakat) dan
                  preferensi aktivitas kerja (minat) secara berimbang.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-slate-900">
                    Objektivitas Potensi Akademik
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Mengidentifikasi kecakapan alami peserta didik pada 7 domain kemampuan dasar
                    yang menjadi prasyarat keberhasilan studi lanjut.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-slate-900">
                    Pemetaan Minat Spesifik
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Mengukur ketertarikan intrinsik terhadap 18 spektrum aktivitas kerja sehingga
                    karier masa depan selaras dengan kepuasan belajar.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-slate-900">
                    Validasi Pilihan Jurusan PTN/PTS
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Membandingkan profil hasil tes dengan tuntutan kompetensi Pilihan Jurusan 1 dan
                    Pilihan Jurusan 2 yang diminati siswa.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-slate-900">
                    Dasar Konseling BK Terarah
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Menyediakan laporan terstruktur bagi Guru BK, orang tua, dan siswa untuk
                    berdiskusi mengambil keputusan pendidikan lanjutan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7 Aspek Bakat */}
        <section id="aspek-bakat" className="py-14 lg:py-18 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wider text-indigo-800 uppercase">
                Bagian A · Kemampuan Kognitif
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 mt-2">
                Rincian 7 Aspek Bakat
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Setiap peserta mengerjakan soal pilihan ganda terukur yang dikonversi ke skala
                0–100 dengan klasifikasi Tinggi (≥70), Sedang (40–69), dan Rendah (&lt;40).
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {APTITUDE_DIMENSIONS.map((dim, idx) => (
                <article
                  key={dim.key}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-indigo-800 mb-3">
                      <span>0{idx + 1}. {dim.code}</span>
                      <span className="text-slate-500">Skala 0–100</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{dim.name}</h3>
                    <p className="mt-2 text-sm font-medium text-slate-700">{dim.shortDesc}</p>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">{dim.detailDesc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 18 Aspek Minat */}
        <section id="aspek-minat" className="py-14 lg:py-18 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                  Bagian B · Preferensi Aktivitas Kerja
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 mt-2">
                  Rincian 18 Aspek Minat &amp; Contoh Karier
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-600">
                  Skala Likert 1–5 memetakan intensitas ketertarikan pada 18 bidang minat. Skor di
                  atas 50 dikategorikan sebagai Minat Dominan.
                </p>
              </div>

              {/* Interactive Cluster Filter */}
              <div
                className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg shrink-0"
                role="tablist"
                aria-label="Filter klaster minat"
              >
                {CLUSTER_TABS.map((cluster) => (
                  <button
                    key={cluster}
                    type="button"
                    onClick={() => setSelectedCluster(cluster)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCluster === cluster
                        ? 'bg-white text-indigo-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cluster}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInterests.map((item, idx) => (
                <article
                  key={item.key}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="font-mono text-indigo-800 font-semibold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.cluster}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900">{item.name}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.shortDesc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-700">
                    <span className="font-semibold text-emerald-800">Contoh karier: </span>
                    <span>{item.careers.join(' · ')}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Panduan 4 Langkah Alur Pengerjaan Tes */}
        <section id="alur-tes" className="py-14 lg:py-18 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wider text-indigo-800 uppercase">
                Panduan Peserta
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 mt-2">
                4 Langkah Alur Pengerjaan Asesmen
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Registrasi Biodata',
                  desc: 'Isi biodata lengkap, asal sekolah, nomor kontak, dua pilihan jurusan kuliah, serta buat username unik dan password.',
                },
                {
                  step: '02',
                  title: 'Pengerjaan Asesmen',
                  desc: 'Selesaikan Bagian A (35 soal 7 dimensi bakat berbatas waktu 25 menit) dilanjutkan Bagian B (36 pernyataan minat skala 1–5).',
                },
                {
                  step: '03',
                  title: 'Pemrosesan & Review',
                  desc: 'Sistem menghitung skor 0–100, menentukan minat dominan, dan mencocokkan keselarasan dengan pilihan jurusan Anda.',
                },
                {
                  step: '04',
                  title: 'Lihat Hasil & Konseling',
                  desc: 'Masuk kembali ke akun siswa untuk melihat profil rapor asesmen secara langsung sesuai jadwal atau persetujuan Guru BK.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col"
                >
                  <span className="font-mono text-2xl font-bold text-indigo-800 tabular-nums">
                    {item.step}
                  </span>
                  <h3 className="font-display text-base font-bold text-slate-900 mt-3">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-xl bg-indigo-950 text-white p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold">
                  Siap Mengetahui Peta Bakat dan Minat Anda?
                </h3>
                <p className="mt-2 text-sm text-indigo-200 max-w-xl">
                  Pastikan Anda berada dalam kondisi fokus dan memiliki koneksi internet stabil
                  sebelum memulai sesi tes bakat berbatas waktu.
                </p>
              </div>
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onStartRegister}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 min-h-[44px] text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Daftar &amp; Mulai Tes
                </button>
                <button
                  type="button"
                  onClick={onStartLogin}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 min-h-[44px] text-sm font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Login Siswa
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
            <div className="md:col-span-6">
              <p className="font-display text-lg font-bold text-white">{institution.name}</p>
              <p className="text-xs text-slate-400 mt-1">{institution.subtitle}</p>
              <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    {institution.address}
                    {institution.city ? `, ${institution.city}` : ''}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{institution.phone || '-'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{institution.email || '-'}</span>
                </p>
              </div>
            </div>

            <div className="md:col-span-3 text-xs space-y-2">
              <p className="font-semibold text-white">Navigasi Portal</p>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={onStartRegister}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Pendaftaran Peserta Baru
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onStartLogin}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Login Siswa &amp; Cek Hasil
                  </button>
                </li>
                <li>
                  <a href="#aspek-bakat" className="hover:text-white transition-colors">
                    7 Aspek Bakat
                  </a>
                </li>
                <li>
                  <a href="#aspek-minat" className="hover:text-white transition-colors">
                    18 Aspek Minat
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 text-xs space-y-3">
              <p className="font-semibold text-white">Akses Pengelola</p>
              <p className="text-slate-400">
                Khusus Koordinator Bimbingan Konseling dan Administrator Lembaga.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenCounselor}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Portal Guru BK
                </button>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Portal Admin
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} {institution.name}. Sistem Asesmen Bakat dan Minat.
            </p>
            <p>NPSN / Kode Lembaga: {institution.npsn || '-'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
