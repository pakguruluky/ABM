import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import {
  createCounselor,
  deleteCounselor,
  updateCounselor,
} from '../services/abmService';
import { CounselorAccount } from '../types/abm';
import { formatIndonesianDate } from '../utils/pdfExport';

interface AdminCounselorManagerProps {
  counselors: CounselorAccount[];
  onNotify: (msg: string) => void;
}

export const AdminCounselorManager: React.FC<AdminCounselorManagerProps> = ({
  counselors,
  onNotify,
}) => {
  const [fullName, setFullName] = useState('');
  const [nip, setNip] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingCounselor, setEditingCounselor] = useState<CounselorAccount | null>(null);
  const [editPassVisible, setEditPassVisible] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CounselorAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      const created = await createCounselor({
        fullName,
        nip,
        username,
        password,
      });
      setFullName('');
      setNip('');
      setUsername('');
      setPassword('');
      onNotify(`Akun Guru BK "${created.fullName}" (@${created.username}) berhasil dibuat.`);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Gagal membuat akun Guru BK.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (c: CounselorAccount) => {
    await updateCounselor(c.id, {
      fullName: c.fullName,
      nip: c.nip,
      password: c.password,
      isActive: !c.isActive,
    });
    onNotify(
      !c.isActive
        ? `Akun Guru BK ${c.fullName} diaktifkan kembali.`
        : `Akun Guru BK ${c.fullName} dinonaktifkan.`
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCounselor) return;
    if (editingCounselor.password.length < 4) return;
    setSavingEdit(true);
    try {
      await updateCounselor(editingCounselor.id, {
        fullName: editingCounselor.fullName.trim(),
        nip: editingCounselor.nip.trim(),
        password: editingCounselor.password,
        isActive: editingCounselor.isActive,
      });
      onNotify(`Data akun Guru BK ${editingCounselor.fullName} berhasil diperbarui.`);
      setEditingCounselor(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCounselor(deleteTarget.id);
      onNotify(`Akun Guru BK ${deleteTarget.fullName} telah dihapus.`);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Tambah Akun Guru BK */}
      <form
        onSubmit={handleCreate}
        className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 space-y-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-slate-950">
              Tambah Akun Guru BK Baru
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Akun Guru BK memiliki hak akses khusus <strong>Hanya Lihat Hasil</strong> (read-only)
              untuk memantau analitik dan laporan hasil asesmen siswa tanpa dapat mengubah data atau
              pengaturan sistem.
            </p>
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Lengkap &amp; Gelar Guru BK *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Dra. Siti Aminah, M.Pd."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              NIP / NUPTK (Opsional)
            </label>
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Contoh: 19790312 200501 2 009"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-indigo-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username Login Guru BK *
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_\-]/g, ''))
              }
              placeholder="Contoh: bk_sitiaminah"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-indigo-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password Login *
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-indigo-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={creating}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Tambahkan Akun Guru BK
          </button>
        </div>
      </form>

      {/* Daftar Akun Guru BK: Card pada HP/Tablet Kecil, Tabel pada Tablet Besar/Laptop/PC */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-950">
              Daftar Akun Guru BK Terdaftar
            </h3>
            <p className="text-xs text-slate-500">
              Total {counselors.length} akun pengawas hasil (hanya lihat hasil).
            </p>
          </div>
        </div>

        {counselors.length === 0 ? (
          <div className="p-8 sm:p-10 text-center">
            <UserCheck className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <p className="font-display font-semibold text-sm text-slate-800">
              Belum Ada Akun Guru BK
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan formulir di atas untuk menambahkan akun login Guru BK pertama.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile & Small Tablet Card Layout (< md) */}
            <div className="md:hidden divide-y divide-slate-200">
              {counselors.map((c) => (
                <div key={c.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{c.fullName}</p>
                      <p className="text-xs font-mono text-indigo-900">@{c.username}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        NIP: {c.nip || '-'} · Dibuat {formatIndonesianDate(c.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aktif
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">Nonaktif</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        c.isActive
                          ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {c.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCounselor(c);
                        setEditPassVisible(false);
                      }}
                      className="min-h-[38px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
                      className="min-h-[38px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop & Large Tablet Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Nama Guru BK</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">NIP</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Dibuat</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {counselors.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-900">{c.fullName}</td>
                      <td className="py-3 px-4 font-mono text-indigo-900">@{c.username}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{c.nip || '-'}</td>
                      <td className="py-3 px-4">
                        {c.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aktif
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500">Nonaktif</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {formatIndonesianDate(c.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(c)}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                              c.isActive
                                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                          >
                            {c.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCounselor(c);
                              setEditPassVisible(false);
                            }}
                            title="Edit / Reset Password"
                            className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-800 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            title="Hapus Akun Guru BK"
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
          </>
        )}
      </div>

      {/* Modal Edit Akun Guru BK */}
      {editingCounselor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <h3 className="font-display text-base font-bold text-slate-950 truncate">
                Edit Akun Guru BK (@{editingCounselor.username})
              </h3>
              <button
                type="button"
                onClick={() => setEditingCounselor(null)}
                aria-label="Tutup modal edit"
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editingCounselor.fullName}
                  onChange={(e) =>
                    setEditingCounselor({ ...editingCounselor, fullName: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIP</label>
                <input
                  type="text"
                  value={editingCounselor.nip}
                  onChange={(e) =>
                    setEditingCounselor({ ...editingCounselor, nip: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={editPassVisible ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={editingCounselor.password}
                    onChange={(e) =>
                      setEditingCounselor({ ...editingCounselor, password: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setEditPassVisible((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {editPassVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCounselor(null)}
                  className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="w-full sm:w-auto min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-800 text-white text-xs font-semibold cursor-pointer"
                >
                  {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Guru BK */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 sm:p-6">
            <h3 className="font-display text-lg font-bold text-slate-950">
              Hapus Akun Guru BK?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Akun milik <strong>{deleteTarget.fullName}</strong> (@{deleteTarget.username}) akan
              dihapus permanen dan tidak lagi dapat mengakses Portal Guru BK.
            </p>
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-semibold cursor-pointer"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
