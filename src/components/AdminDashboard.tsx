import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Hourglass,
  Loader2,
  Lock,
  LogOut,
  Search,
  Settings,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  approveAllCompletedStudents,
  deleteStudent,
  saveAssessmentSettings,
  saveInstitutionSettings,
  updateStudentByAdmin,
  updateStudentReviewStatus,
} from '../services/abmService';
import {
  AssessmentSettings,
  CounselorAccount,
  InstitutionSettings,
  ReleaseMode,
  StudentRecord,
} from '../types/abm';
import {
  exportIndividualStudentPdf,
  exportRecapStudentsPdf,
  formatIndonesianDate,
} from '../utils/pdfExport';
import { AdminAnalyticsCharts } from './AdminAnalyticsCharts';
import { AbmReportAnalysisSections } from './AbmReportAnalysisSections';
import { AdminCounselorManager } from './AdminCounselorManager';

interface AdminDashboardProps {
  institution: InstitutionSettings;
  assessmentSettings: AssessmentSettings;
  students: StudentRecord[];
  counselors: CounselorAccount[];
  onBackHome: () => void;
}

const ADMIN_SESSION_KEY = 'abm_admin_authenticated';

function resizeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid.'));
      img.onload = () => {
        const maxDim = 240;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses kanvas gambar.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  institution,
  assessmentSettings,
  students,
  counselors,
  onBackHome,
}) => {
  const [isAuthed, setIsAuthed] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  );
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeMenu, setActiveMenu] = useState<
    'students' | 'institution' | 'release' | 'counselors'
  >('students');

  // Menu 1: Institution form state synced on edit
  const [instForm, setInstForm] = useState<Omit<InstitutionSettings, 'updatedAt'>>(() => ({
    name: institution.name,
    subtitle: institution.subtitle,
    npsn: institution.npsn,
    address: institution.address,
    city: institution.city,
    phone: institution.phone,
    email: institution.email,
    website: institution.website,
    principalName: institution.principalName,
    principalNip: institution.principalNip,
    logoBase64: institution.logoBase64,
  }));
  const [savingInst, setSavingInst] = useState(false);
  const [instSavedNotice, setInstSavedNotice] = useState('');

  // Menu 2: Assessment release state
  const [releaseForm, setReleaseForm] = useState<{
    mode: ReleaseMode;
    releaseStart: string;
    releaseEnd: string;
  }>(() => ({
    mode: assessmentSettings.mode,
    releaseStart: assessmentSettings.releaseStart || '',
    releaseEnd: assessmentSettings.releaseEnd || '',
  }));
  const [savingRelease, setSavingRelease] = useState(false);
  const [releaseSavedNotice, setReleaseSavedNotice] = useState('');

  // Menu 3: Students monitoring, search, filter & modals
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterTestStatus, setFilterTestStatus] = useState('ALL');
  const [filterReviewStatus, setFilterReviewStatus] = useState('ALL');
  const [bulkApproving, setBulkApproving] = useState(false);
  const [actionToast, setActionToast] = useState('');

  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<StudentRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<StudentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'bajuri39') {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsAuthed(true);
      setAuthError('');
      setAdminPasswordInput('');
    } else {
      setAuthError('Password Admin tidak valid. Silakan periksa kembali.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthed(false);
    onBackHome();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImageToBase64(file);
      setInstForm((prev) => ({ ...prev, logoBase64: base64 }));
      setInstSavedNotice('');
    } catch (err) {
      setInstSavedNotice(err instanceof Error ? err.message : 'Gagal memuat logo.');
    }
  };

  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInst(true);
    setInstSavedNotice('');
    try {
      await saveInstitutionSettings(instForm);
      setInstSavedNotice('Profil lembaga berhasil disimpan dan disinkronkan secara real-time.');
    } catch (err) {
      setInstSavedNotice(
        err instanceof Error ? err.message : 'Gagal menyimpan profil lembaga.'
      );
    } finally {
      setSavingInst(false);
    }
  };

  const handleSaveReleaseSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRelease(true);
    setReleaseSavedNotice('');
    try {
      await saveAssessmentSettings(releaseForm);
      setReleaseSavedNotice('Pengaturan rilis hasil asesmen berhasil diperbarui secara real-time.');
    } catch (err) {
      setReleaseSavedNotice(
        err instanceof Error ? err.message : 'Gagal menyimpan pengaturan rilis.'
      );
    } finally {
      setSavingRelease(false);
    }
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
      const matchesReview = filterReviewStatus === 'ALL' || s.reviewStatus === filterReviewStatus;
      return matchesSearch && matchesClass && matchesTest && matchesReview;
    });
  }, [students, searchTerm, filterClass, filterTestStatus, filterReviewStatus]);

  const stats = useMemo(() => {
    const total = students.length;
    const completed = students.filter((s) => s.testStatus === 'completed').length;
    const pendingReview = students.filter(
      (s) => s.testStatus === 'completed' && s.reviewStatus === 'pending_review'
    ).length;
    const approved = students.filter(
      (s) => s.testStatus === 'completed' && s.reviewStatus === 'approved'
    ).length;
    return { total, completed, pendingReview, approved };
  }, [students]);

  const showToast = (msg: string) => {
    setActionToast(msg);
    window.setTimeout(() => setActionToast(''), 4000);
  };

  const handleToggleReview = async (student: StudentRecord) => {
    const nextStatus = student.reviewStatus === 'approved' ? 'pending_review' : 'approved';
    await updateStudentReviewStatus(student.id, nextStatus);
    showToast(
      nextStatus === 'approved'
        ? `Hasil ${student.fullName} disetujui & dirilis.`
        : `Hasil ${student.fullName} ditahan kembali untuk review.`
    );
  };

  const handleApproveAll = async () => {
    setBulkApproving(true);
    try {
      const count = await approveAllCompletedStudents(students);
      showToast(
        count > 0
          ? `${count} peserta yang telah selesai tes berhasil disetujui.`
          : 'Tidak ada peserta selesai yang menunggu review.'
      );
    } finally {
      setBulkApproving(false);
    }
  };

  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDraft) return;
    setSavingEdit(true);
    try {
      await updateStudentByAdmin(editDraft.id, {
        fullName: editDraft.fullName,
        birthPlace: editDraft.birthPlace,
        birthDate: editDraft.birthDate,
        classMajor: editDraft.classMajor,
        schoolOrigin: editDraft.schoolOrigin,
        address: editDraft.address,
        studentPhone: editDraft.studentPhone,
        parentPhone: editDraft.parentPhone,
        majorChoice1: editDraft.majorChoice1,
        majorChoice2: editDraft.majorChoice2,
        reviewStatus: editDraft.reviewStatus,
        testStatus: editDraft.testStatus,
      });
      setSelectedStudent(editDraft);
      setEditMode(false);
      showToast(`Data ${editDraft.fullName} berhasil diperbarui.`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStudent(deleteTarget);
      if (selectedStudent?.id === deleteTarget.id) {
        setSelectedStudent(null);
      }
      showToast(`Data peserta ${deleteTarget.fullName} telah dihapus.`);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Password Gate Screen
  if (!isAuthed) {
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

          <div className="w-11 h-11 rounded-lg bg-indigo-900 text-white flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display text-xl font-bold text-slate-950">
            Portal Administrator &amp; Guru BK
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Masukkan kata sandi pengelola untuk mengakses pengaturan lembaga, kontrol rilis hasil,
            dan ekspor laporan PDF.
          </p>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password Admin
              </label>
              <div className="relative">
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  required
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="Masukkan password admin"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && <p className="text-xs text-red-700 mt-1.5">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-800 hover:bg-indigo-900 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Masuk ke Dasbor Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="lg:w-68 bg-slate-900 text-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Portal Pengelola ABM
          </p>
          <p className="font-display font-bold text-base text-white mt-1 truncate">
            {institution.name}
          </p>
          <p className="text-xs text-slate-400 truncate">{institution.city}</p>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          <button
            type="button"
            onClick={() => setActiveMenu('students')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeMenu === 'students'
                ? 'bg-indigo-700 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">Data Siswa &amp; Ekspor PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInstForm({
                name: institution.name,
                subtitle: institution.subtitle,
                npsn: institution.npsn,
                address: institution.address,
                city: institution.city,
                phone: institution.phone,
                email: institution.email,
                website: institution.website,
                principalName: institution.principalName,
                principalNip: institution.principalNip,
                logoBase64: institution.logoBase64,
              });
              setInstSavedNotice('');
              setActiveMenu('institution');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeMenu === 'institution'
                ? 'bg-indigo-700 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Pengaturan Lembaga</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReleaseForm({
                mode: assessmentSettings.mode,
                releaseStart: assessmentSettings.releaseStart || '',
                releaseEnd: assessmentSettings.releaseEnd || '',
              });
              setReleaseSavedNotice('');
              setActiveMenu('release');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeMenu === 'release'
                ? 'bg-indigo-700 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="truncate">Pengaturan Rilis Hasil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMenu('counselors')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeMenu === 'counselors'
                ? 'bg-indigo-700 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Akun Guru BK</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={onBackHome}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Lihat Landing Page
          </button>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-300 hover:bg-red-950/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Admin
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Dasbor Admin ABM</p>
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-950">
              {activeMenu === 'students' && 'Monitoring Peserta, Review & Ekspor PDF'}
              {activeMenu === 'institution' && 'Pengaturan Profil & Kop Surat Lembaga'}
              {activeMenu === 'release' && 'Kontrol Rilis Hasil Asesmen Siswa'}
              {activeMenu === 'counselors' && 'Kelola Akun Guru BK (Akses Lihat Hasil)'}
            </h1>
          </div>

          {actionToast && (
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionToast}</span>
            </div>
          )}
        </header>

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* MENU 1: PENGATURAN LEMBAGA */}
          {activeMenu === 'institution' && (
            <form
              onSubmit={handleSaveInstitution}
              className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6"
            >
              {instSavedNotice && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{instSavedNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Lembaga / Sekolah *
                  </label>
                  <input
                    type="text"
                    required
                    value={instForm.name}
                    onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sub-judul / Dinas / Yayasan
                  </label>
                  <input
                    type="text"
                    value={instForm.subtitle}
                    onChange={(e) => setInstForm({ ...instForm, subtitle: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    NPSN / Kode Lembaga
                  </label>
                  <input
                    type="text"
                    value={instForm.npsn}
                    onChange={(e) => setInstForm({ ...instForm, npsn: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kota / Kabupaten (Titik Mangsa Surat PDF) *
                  </label>
                  <input
                    type="text"
                    required
                    value={instForm.city}
                    onChange={(e) => setInstForm({ ...instForm, city: e.target.value })}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Alamat Lengkap Lembaga *
                  </label>
                  <input
                    type="text"
                    required
                    value={instForm.address}
                    onChange={(e) => setInstForm({ ...instForm, address: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nomor Telepon Lembaga
                  </label>
                  <input
                    type="text"
                    value={instForm.phone}
                    onChange={(e) => setInstForm({ ...instForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Resmi Lembaga
                  </label>
                  <input
                    type="email"
                    value={instForm.email}
                    onChange={(e) => setInstForm({ ...instForm, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Website Lembaga
                  </label>
                  <input
                    type="text"
                    value={instForm.website}
                    onChange={(e) => setInstForm({ ...instForm, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Kepala Lembaga / Koordinator BK
                  </label>
                  <input
                    type="text"
                    value={instForm.principalName}
                    onChange={(e) => setInstForm({ ...instForm, principalName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    NIP Kepala Lembaga / Koordinator BK
                  </label>
                  <input
                    type="text"
                    value={instForm.principalNip}
                    onChange={(e) => setInstForm({ ...instForm, principalNip: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                {/* Upload Logo Base64 */}
                <div className="md:col-span-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Logo Lembaga (Tersimpan sebagai Base64 untuk Header &amp; Kop PDF)
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                      {instForm.logoBase64 ? (
                        <img
                          src={instForm.logoBase64}
                          alt="Preview Logo Lembaga"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-400 text-center px-1">
                          Belum ada logo
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        Unggah Berkas Logo (PNG/JPG)
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {instForm.logoBase64 && (
                        <button
                          type="button"
                          onClick={() => setInstForm({ ...instForm, logoBase64: '' })}
                          className="px-3 py-2 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          Hapus Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingInst}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-800 hover:bg-indigo-900 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
                >
                  {savingInst && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Pengaturan Lembaga
                </button>
              </div>
            </form>
          )}

          {/* MENU 2: PENGATURAN RILIS HASIL */}
          {activeMenu === 'release' && (
            <form
              onSubmit={handleSaveReleaseSettings}
              className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 max-w-3xl"
            >
              {releaseSavedNotice && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{releaseSavedNotice}</span>
                </div>
              )}

              <div className="space-y-4">
                {[
                  {
                    value: 'immediate' as ReleaseMode,
                    title: 'Langsung Dikeluarkan (Immediate)',
                    desc: 'Siswa dapat langsung melihat laporan hasil asesmennya segera setelah selesai mengerjakan tes.',
                  },
                  {
                    value: 'scheduled' as ReleaseMode,
                    title: 'Terbatas Waktu (Scheduled)',
                    desc: 'Hasil ditahan hingga tanggal & jam mulai rilis tiba. Siswa akan melihat hitung mundur (countdown) real-time.',
                  },
                  {
                    value: 'manual_review' as ReleaseMode,
                    title: 'Menunggu Review Admin (Manual Approval)',
                    desc: 'Hasil ditahan dengan status verifikasi hingga Admin menekan tombol "Setujui / Rilis Hasil" untuk masing-masing siswa.',
                  },
                ].map((opt) => {
                  const selected = releaseForm.mode === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`block rounded-xl border p-5 cursor-pointer transition-colors ${
                        selected
                          ? 'border-indigo-700 bg-indigo-50/60'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="releaseMode"
                          value={opt.value}
                          checked={selected}
                          onChange={() => setReleaseForm({ ...releaseForm, mode: opt.value })}
                          className="mt-1 accent-indigo-800"
                        />
                        <div>
                          <p className="font-display font-bold text-sm sm:text-base text-slate-900">
                            {opt.title}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">{opt.desc}</p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {releaseForm.mode === 'scheduled' && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tanggal &amp; Jam Mulai Rilis *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={releaseForm.releaseStart}
                      onChange={(e) =>
                        setReleaseForm({ ...releaseForm, releaseStart: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono focus:border-indigo-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Batas Akhir Akses (Opsional)
                    </label>
                    <input
                      type="datetime-local"
                      value={releaseForm.releaseEnd}
                      onChange={(e) =>
                        setReleaseForm({ ...releaseForm, releaseEnd: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono focus:border-indigo-700 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingRelease}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-800 hover:bg-indigo-900 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
                >
                  {savingRelease && <Loader2 className="w-4 h-4 animate-spin" />}
                  Terapkan Pengaturan Rilis
                </button>
              </div>
            </form>
          )}

          {/* MENU 3: DATA SISWA, MONITORING & EKSPOR PDF */}
          {activeMenu === 'students' && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Total Peserta Terdaftar</p>
                  <p className="font-mono text-2xl font-bold text-slate-950 mt-1 tabular-nums">
                    {stats.total}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Selesai Mengerjakan</p>
                  <p className="font-mono text-2xl font-bold text-indigo-800 mt-1 tabular-nums">
                    {stats.completed}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Menunggu Review Admin</p>
                  <p className="font-mono text-2xl font-bold text-amber-700 mt-1 tabular-nums">
                    {stats.pendingReview}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Disetujui / Dirilis</p>
                  <p className="font-mono text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
                    {stats.approved}
                  </p>
                </div>
              </div>

              {/* Bird's-Eye Recharts Analytics */}
              <AdminAnalyticsCharts allStudents={students} filteredStudents={filteredStudents} />

              {/* Controls & Global Export */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={students.length === 0}
                      onClick={() => exportRecapStudentsPdf(students, institution)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-800 hover:bg-indigo-900 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Unduh Rekapitulasi Seluruh Siswa (PDF Landscape)
                    </button>

                    {stats.pendingReview > 0 && (
                      <button
                        type="button"
                        disabled={bulkApproving}
                        onClick={handleApproveAll}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {bulkApproving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Setujui Semua ({stats.pendingReview})
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    Mode rilis aktif:{' '}
                    <strong className="text-slate-800">
                      {assessmentSettings.mode === 'immediate'
                        ? 'Langsung Dikeluarkan'
                        : assessmentSettings.mode === 'scheduled'
                          ? 'Terbatas Waktu'
                          : 'Menunggu Review Admin'}
                    </strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari nama, sekolah, username..."
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs sm:text-sm focus:border-indigo-700 focus:outline-none"
                    />
                  </div>

                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white focus:border-indigo-700 focus:outline-none"
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
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white focus:border-indigo-700 focus:outline-none"
                  >
                    <option value="ALL">Semua Status Tes</option>
                    <option value="completed">Selesai Tes</option>
                    <option value="in_progress">Sedang Mengerjakan</option>
                    <option value="registered">Baru Terdaftar</option>
                  </select>

                  <select
                    value={filterReviewStatus}
                    onChange={(e) => setFilterReviewStatus(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white focus:border-indigo-700 focus:outline-none"
                  >
                    <option value="ALL">Semua Status Review</option>
                    <option value="pending_review">Menunggu Review</option>
                    <option value="approved">Disetujui / Dirilis</option>
                  </select>
                </div>
              </div>

              {/* Students Data Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {filteredStudents.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-display font-semibold text-slate-800">
                      {students.length === 0
                        ? 'Belum Ada Peserta Terdaftar'
                        : 'Tidak Ada Peserta Sesuai Filter'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {students.length === 0
                        ? 'Data peserta akan muncul secara real-time segera setelah siswa mendaftar.'
                        : 'Ubah kata kunci pencarian atau filter status untuk melihat data lainnya.'}
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
                          <th className="py-3 px-4">Status Review</th>
                          <th className="py-3 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900">{student.fullName}</p>
                              <p className="text-xs font-mono text-slate-500">
                                @{student.username}
                              </p>
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
                                  Berjalan
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">Terdaftar</span>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {student.reviewStatus === 'approved' ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                  <Check className="w-3.5 h-3.5" />
                                  Disetujui
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                                  <Hourglass className="w-3.5 h-3.5" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleReview(student)}
                                  title={
                                    student.reviewStatus === 'approved'
                                      ? 'Tahan hasil siswa'
                                      : 'Setujui / Rilis hasil siswa'
                                  }
                                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                                    student.reviewStatus === 'approved'
                                      ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                  }`}
                                >
                                  {student.reviewStatus === 'approved'
                                    ? 'Tahan'
                                    : 'Setujui / Rilis'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setEditDraft(student);
                                    setEditMode(false);
                                  }}
                                  title="Detail & Edit Data"
                                  className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-800 cursor-pointer"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  disabled={student.testStatus !== 'completed'}
                                  onClick={() => exportIndividualStudentPdf(student, institution)}
                                  title="Unduh Laporan PDF Individual (A4)"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 disabled:opacity-40 text-xs font-semibold cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  PDF
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(student)}
                                  title="Hapus Data Siswa"
                                  className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MENU 4: KELOLA AKUN GURU BK */}
          {activeMenu === 'counselors' && (
            <AdminCounselorManager counselors={counselors} onNotify={showToast} />
          )}
        </main>
      </div>

      {/* Modal Detail & Edit Siswa */}
      {selectedStudent && editDraft && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-950">
                  {editMode ? 'Edit Biodata Siswa' : `Detail Hasil: ${selectedStudent.fullName}`}
                </h3>
                <p className="text-xs text-slate-500">
                  @{selectedStudent.username} · Terdaftar{' '}
                  {formatIndonesianDate(selectedStudent.registeredAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Biodata
                  </button>
                )}
                {selectedStudent.testStatus === 'completed' && !editMode && (
                  <button
                    type="button"
                    onClick={() => exportIndividualStudentPdf(selectedStudent, institution)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-800 hover:bg-indigo-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh PDF A4
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null);
                    setEditMode(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {editMode ? (
                <form id="edit-student-form" onSubmit={handleSaveStudentEdit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        value={editDraft.fullName}
                        onChange={(e) => setEditDraft({ ...editDraft, fullName: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kelas / Jurusan
                      </label>
                      <input
                        type="text"
                        required
                        value={editDraft.classMajor}
                        onChange={(e) => setEditDraft({ ...editDraft, classMajor: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tempat Lahir
                      </label>
                      <input
                        type="text"
                        required
                        value={editDraft.birthPlace}
                        onChange={(e) => setEditDraft({ ...editDraft, birthPlace: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        required
                        value={editDraft.birthDate}
                        onChange={(e) => setEditDraft({ ...editDraft, birthDate: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Asal Sekolah
                      </label>
                      <input
                        type="text"
                        required
                        value={editDraft.schoolOrigin}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, schoolOrigin: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        No. HP Siswa
                      </label>
                      <input
                        type="text"
                        required
                        value={editDraft.studentPhone}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, studentPhone: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        No. HP Orang Tua / Wali
                      </label>
                      <input
                        type="text"
                        required
                        value={editDraft.parentPhone}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, parentPhone: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Status Review
                      </label>
                      <select
                        value={editDraft.reviewStatus}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft,
                            reviewStatus: e.target.value as StudentRecord['reviewStatus'],
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                      >
                        <option value="pending_review">Pending Review</option>
                        <option value="approved">Approved / Dirilis</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pilihan Jurusan 1
                      </label>
                      <input
                        type="text"
                        required
                        value={editDraft.majorChoice1}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, majorChoice1: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pilihan Jurusan 2
                      </label>
                      <input
                        type="text"
                        required
                        value={editDraft.majorChoice2}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, majorChoice2: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alamat Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        value={editDraft.address}
                        onChange={(e) => setEditDraft({ ...editDraft, address: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div>
                      <p className="text-slate-500">TTL &amp; Kelas</p>
                      <p className="font-semibold text-slate-900">
                        {selectedStudent.birthPlace},{' '}
                        {formatIndonesianDate(selectedStudent.birthDate)} ·{' '}
                        {selectedStudent.classMajor}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Asal Sekolah</p>
                      <p className="font-semibold text-slate-900">{selectedStudent.schoolOrigin}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Kontak Siswa / Ortu</p>
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
                  </div>

                  {selectedStudent.testStatus === 'completed' ? (
                    <AbmReportAnalysisSections student={selectedStudent} />
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      Siswa ini belum menyelesaikan seluruh rangkaian asesmen.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="font-display text-lg font-bold text-slate-950">Hapus Data Peserta?</h3>
            <p className="text-sm text-slate-600 mt-2">
              Data biodata dan hasil asesmen milik <strong>{deleteTarget.fullName}</strong> (@
              {deleteTarget.username}) akan dihapus permanen dari Firebase.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-semibold cursor-pointer"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
