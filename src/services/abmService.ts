import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase.js';
import { getBackendProvider } from '../supabase';
import {
  approveAllCompletedStudentsSupabase,
  checkUsernameAvailableSupabase,
  createCounselorSupabase,
  deleteCounselorSupabase,
  deleteStudentSupabase,
  loginCounselorSupabase,
  loginStudentSupabase,
  registerStudentSupabase,
  saveAssessmentSettingsSupabase,
  saveInstitutionSettingsSupabase,
  saveStudentProgressSupabase,
  subscribeAssessmentSettingsSupabase,
  subscribeCounselorByIdSupabase,
  subscribeCounselorsSupabase,
  subscribeInstitutionSupabase,
  subscribeStudentByIdSupabase,
  subscribeStudentsSupabase,
  submitStudentAssessmentSupabase,
  updateCounselorSupabase,
  updateStudentByAdminSupabase,
  updateStudentReviewStatusSupabase,
} from './supabaseAbmService';
import {
  AssessmentSettings,
  CounselorAccount,
  CounselorCreateInput,
  InstitutionSettings,
  ReviewStatus,
  StudentRecord,
  StudentRegistrationInput,
} from '../types/abm';
import {
  getEmptyAptitudeScores,
  getEmptyInterestScores,
  getEmptyMajorAlignment,
  computeAssessmentResults,
} from '../utils/scoring';

export const DEFAULT_INSTITUTION: InstitutionSettings = {
  name: 'SMA Negeri Harapan Bangsa',
  subtitle: 'Unit Bimbingan dan Konseling · Dinas Pendidikan Provinsi',
  npsn: '20109988',
  address: 'Jl. Pendidikan Raya No. 45, Kebayoran Baru',
  city: 'Jakarta Selatan',
  phone: '(021) 720-4512',
  email: 'bk@smanharapanbangsa.sch.id',
  website: 'https://smanharapanbangsa.sch.id',
  principalName: 'Drs. H. Ahmad Fauzan, M.Pd.',
  principalNip: '19680514 199403 1 008',
  logoBase64: '',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_ASSESSMENT: AssessmentSettings = {
  mode: 'immediate',
  releaseStart: '',
  releaseEnd: '',
  updatedAt: new Date().toISOString(),
};

const useSupabase = () => getBackendProvider() === 'supabase';

export function subscribeInstitution(
  onData: (data: InstitutionSettings) => void
): () => void {
  if (useSupabase()) {
    return subscribeInstitutionSupabase(DEFAULT_INSTITUTION, onData);
  }
  const ref = doc(db, 'settings', 'institution');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as InstitutionSettings);
      } else {
        onData(DEFAULT_INSTITUTION);
        // Seed initial institution settings once if missing
        setDoc(ref, DEFAULT_INSTITUTION).catch((err) => {
          console.warn('Inisialisasi profil lembaga tertunda:', err);
        });
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, 'settings/institution')
  );
}

export function subscribeAssessmentSettings(
  onData: (data: AssessmentSettings) => void
): () => void {
  if (useSupabase()) {
    return subscribeAssessmentSettingsSupabase(DEFAULT_ASSESSMENT, onData);
  }
  const ref = doc(db, 'settings', 'assessment');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as AssessmentSettings);
      } else {
        onData(DEFAULT_ASSESSMENT);
        setDoc(ref, DEFAULT_ASSESSMENT).catch((err) => {
          console.warn('Inisialisasi pengaturan asesmen tertunda:', err);
        });
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, 'settings/assessment')
  );
}

export function subscribeStudents(
  onData: (students: StudentRecord[]) => void
): () => void {
  if (useSupabase()) {
    return subscribeStudentsSupabase(onData);
  }
  const colRef = collection(db, 'students');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as StudentRecord);
      list.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'students')
  );
}

export function subscribeStudentById(
  studentId: string,
  onData: (student: StudentRecord | null) => void
): () => void {
  if (useSupabase()) {
    return subscribeStudentByIdSupabase(studentId, onData);
  }
  const ref = doc(db, 'students', studentId);
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as StudentRecord);
      } else {
        onData(null);
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, `students/${studentId}`)
  );
}

export async function saveInstitutionSettings(
  data: Omit<InstitutionSettings, 'updatedAt'>
): Promise<void> {
  if (useSupabase()) {
    return saveInstitutionSettingsSupabase(data);
  }
  const payload: InstitutionSettings = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'settings', 'institution'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/institution');
  }
}

export async function saveAssessmentSettings(
  data: Omit<AssessmentSettings, 'updatedAt'>
): Promise<void> {
  if (useSupabase()) {
    return saveAssessmentSettingsSupabase(data);
  }
  const payload: AssessmentSettings = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'settings', 'assessment'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/assessment');
  }
}

export function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-]/g, '');
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  if (useSupabase()) {
    return checkUsernameAvailableSupabase(username);
  }
  const clean = normalizeUsername(username);
  if (!clean) return false;
  try {
    const usernameDoc = await getDoc(doc(db, 'usernames', clean));
    if (usernameDoc.exists()) return false;

    const q = query(collection(db, 'students'), where('username', '==', clean));
    const snap = await getDocs(q);
    return snap.empty;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `usernames/${clean}`);
    return false;
  }
}

export async function registerStudent(
  input: StudentRegistrationInput
): Promise<StudentRecord> {
  if (useSupabase()) {
    return registerStudentSupabase(input);
  }
  const cleanUsername = normalizeUsername(input.username);
  if (cleanUsername.length < 3) {
    throw new Error('Username minimal 3 karakter (huruf, angka, garis bawah, atau tanda hubung).');
  }

  const available = await checkUsernameAvailable(cleanUsername);
  if (!available) {
    throw new Error(`Username "${cleanUsername}" sudah digunakan peserta lain. Silakan pilih username berbeda.`);
  }

  const studentId = `std_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const record: StudentRecord = {
    id: studentId,
    fullName: input.fullName.trim(),
    birthPlace: input.birthPlace.trim(),
    birthDate: input.birthDate.trim(),
    classMajor: input.classMajor.trim(),
    schoolOrigin: input.schoolOrigin.trim(),
    address: input.address.trim(),
    studentPhone: input.studentPhone.trim(),
    parentPhone: input.parentPhone.trim(),
    majorChoice1: input.majorChoice1.trim(),
    majorChoice2: input.majorChoice2.trim(),
    username: cleanUsername,
    password: input.password,
    testStatus: 'registered',
    reviewStatus: 'pending_review',
    registeredAt: now,
    completedAt: '',
    aptitudeAnswers: {},
    interestAnswers: {},
    aptitudeScores: getEmptyAptitudeScores(),
    interestScores: getEmptyInterestScores(),
    dominantInterests: [],
    majorAlignment: getEmptyMajorAlignment(),
  };

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'students', studentId), record);
    batch.set(doc(db, 'usernames', cleanUsername), {
      studentId,
      createdAt: now,
    });
    await batch.commit();
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `students/${studentId}`);
    throw error;
  }
}

export async function loginStudent(
  username: string,
  password: string
): Promise<StudentRecord> {
  if (useSupabase()) {
    return loginStudentSupabase(username, password);
  }
  const clean = normalizeUsername(username);
  if (!clean || !password) {
    throw new Error('Username dan password wajib diisi.');
  }

  try {
    const q = query(collection(db, 'students'), where('username', '==', clean));
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error('Akun tidak ditemukan. Periksa kembali username Anda atau lakukan pendaftaran.');
    }
    const student = snap.docs[0].data() as StudentRecord;
    if (student.password !== password) {
      throw new Error('Password yang Anda masukkan tidak sesuai.');
    }
    return student;
  } catch (error) {
    if (error instanceof Error && !error.message.includes('permission')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.LIST, 'students');
    throw error;
  }
}

export async function saveStudentProgress(
  studentId: string,
  aptitudeAnswers: Record<string, number>,
  interestAnswers: Record<string, number>
): Promise<void> {
  if (useSupabase()) {
    return saveStudentProgressSupabase(studentId, aptitudeAnswers, interestAnswers);
  }
  try {
    await updateDoc(doc(db, 'students', studentId), {
      testStatus: 'in_progress',
      aptitudeAnswers,
      interestAnswers,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `students/${studentId}`);
  }
}

export async function submitStudentAssessment(
  student: StudentRecord,
  aptitudeAnswers: Record<string, number>,
  interestAnswers: Record<string, number>
): Promise<StudentRecord> {
  if (useSupabase()) {
    return submitStudentAssessmentSupabase(student, aptitudeAnswers, interestAnswers);
  }
  const computed = computeAssessmentResults(
    aptitudeAnswers,
    interestAnswers,
    student.majorChoice1,
    student.majorChoice2
  );
  const completedAt = new Date().toISOString();

  const updatedFields = {
    testStatus: 'completed' as const,
    completedAt,
    aptitudeAnswers,
    interestAnswers,
    aptitudeScores: computed.aptitudeScores,
    interestScores: computed.interestScores,
    dominantInterests: computed.dominantInterests,
    majorAlignment: computed.majorAlignment,
  };

  try {
    await updateDoc(doc(db, 'students', student.id), updatedFields);
    return {
      ...student,
      ...updatedFields,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `students/${student.id}`);
    throw error;
  }
}

export async function updateStudentReviewStatus(
  studentId: string,
  reviewStatus: ReviewStatus
): Promise<void> {
  if (useSupabase()) {
    return updateStudentReviewStatusSupabase(studentId, reviewStatus);
  }
  try {
    await updateDoc(doc(db, 'students', studentId), { reviewStatus });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `students/${studentId}`);
  }
}

export async function approveAllCompletedStudents(
  students: StudentRecord[]
): Promise<number> {
  if (useSupabase()) {
    return approveAllCompletedStudentsSupabase(students);
  }
  const targets = students.filter(
    (s) => s.testStatus === 'completed' && s.reviewStatus !== 'approved'
  );
  if (targets.length === 0) return 0;

  try {
    const batch = writeBatch(db);
    targets.forEach((s) => {
      batch.update(doc(db, 'students', s.id), { reviewStatus: 'approved' });
    });
    await batch.commit();
    return targets.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'students');
    return 0;
  }
}

export async function updateStudentByAdmin(
  studentId: string,
  updates: Pick<
    StudentRecord,
    | 'fullName'
    | 'birthPlace'
    | 'birthDate'
    | 'classMajor'
    | 'schoolOrigin'
    | 'address'
    | 'studentPhone'
    | 'parentPhone'
    | 'majorChoice1'
    | 'majorChoice2'
    | 'reviewStatus'
    | 'testStatus'
  >
): Promise<void> {
  if (useSupabase()) {
    return updateStudentByAdminSupabase(studentId, updates);
  }
  try {
    await updateDoc(doc(db, 'students', studentId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `students/${studentId}`);
  }
}

export async function deleteStudent(student: StudentRecord): Promise<void> {
  if (useSupabase()) {
    return deleteStudentSupabase(student);
  }
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'students', student.id));
    if (student.username) {
      batch.delete(doc(db, 'usernames', student.username));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `students/${student.id}`);
  }
}

// === AKUN GURU BK (HANYA LIHAT HASIL) ===

export function subscribeCounselors(
  onData: (counselors: CounselorAccount[]) => void
): () => void {
  if (useSupabase()) {
    return subscribeCounselorsSupabase(onData);
  }
  const colRef = collection(db, 'counselors');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as CounselorAccount);
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'counselors')
  );
}

export function subscribeCounselorById(
  counselorId: string,
  onData: (counselor: CounselorAccount | null) => void
): () => void {
  if (useSupabase()) {
    return subscribeCounselorByIdSupabase(counselorId, onData);
  }
  const ref = doc(db, 'counselors', counselorId);
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as CounselorAccount);
      } else {
        onData(null);
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, `counselors/${counselorId}`)
  );
}

export async function createCounselor(
  input: CounselorCreateInput
): Promise<CounselorAccount> {
  if (useSupabase()) {
    return createCounselorSupabase(input);
  }
  const cleanUsername = normalizeUsername(input.username);
  if (cleanUsername.length < 3) {
    throw new Error('Username Guru BK minimal 3 karakter (huruf, angka, _ atau -).');
  }
  if (!input.fullName.trim()) {
    throw new Error('Nama lengkap Guru BK wajib diisi.');
  }
  if (input.password.length < 4) {
    throw new Error('Password minimal 4 karakter.');
  }

  try {
    const existingQ = query(
      collection(db, 'counselors'),
      where('username', '==', cleanUsername)
    );
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) {
      throw new Error(`Username "${cleanUsername}" sudah digunakan oleh akun Guru BK lain.`);
    }

    const id = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const record: CounselorAccount = {
      id,
      fullName: input.fullName.trim(),
      nip: input.nip.trim(),
      username: cleanUsername,
      password: input.password,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'counselors', id), record);
    return record;
  } catch (error) {
    if (error instanceof Error && !error.message.includes('permission')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.CREATE, 'counselors');
    throw error;
  }
}

export async function updateCounselor(
  counselorId: string,
  updates: Pick<CounselorAccount, 'fullName' | 'nip' | 'password' | 'isActive'>
): Promise<void> {
  if (useSupabase()) {
    return updateCounselorSupabase(counselorId, updates);
  }
  try {
    await updateDoc(doc(db, 'counselors', counselorId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `counselors/${counselorId}`);
  }
}

export async function deleteCounselor(counselorId: string): Promise<void> {
  if (useSupabase()) {
    return deleteCounselorSupabase(counselorId);
  }
  try {
    await deleteDoc(doc(db, 'counselors', counselorId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `counselors/${counselorId}`);
  }
}

export async function loginCounselor(
  username: string,
  password: string
): Promise<CounselorAccount> {
  if (useSupabase()) {
    return loginCounselorSupabase(username, password);
  }
  const clean = normalizeUsername(username);
  if (!clean || !password) {
    throw new Error('Username dan password Guru BK wajib diisi.');
  }

  try {
    const q = query(collection(db, 'counselors'), where('username', '==', clean));
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error('Akun Guru BK tidak ditemukan. Hubungi Admin untuk pembuatan akun.');
    }
    const counselor = snap.docs[0].data() as CounselorAccount;
    if (counselor.password !== password) {
      throw new Error('Password yang Anda masukkan tidak sesuai.');
    }
    if (!counselor.isActive) {
      throw new Error('Akun Guru BK ini sedang dinonaktifkan oleh Admin.');
    }
    return counselor;
  } catch (error) {
    if (error instanceof Error && !error.message.includes('permission')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.LIST, 'counselors');
    throw error;
  }
}
