import { supabase } from '../supabase';
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
  computeAssessmentResults,
  getEmptyAptitudeScores,
  getEmptyInterestScores,
  getEmptyMajorAlignment,
} from '../utils/scoring';

interface SupabaseStudentRow {
  id: string;
  full_name: string;
  birth_place: string;
  birth_date: string;
  class_major: string;
  school_origin: string;
  address: string;
  student_phone: string;
  parent_phone: string;
  major_choice_1: string;
  major_choice_2: string;
  username: string;
  password: string;
  test_status: StudentRecord['testStatus'];
  review_status: StudentRecord['reviewStatus'];
  registered_at: string;
  completed_at: string;
  aptitude_answers: Record<string, number>;
  interest_answers: Record<string, number>;
  aptitude_scores: StudentRecord['aptitudeScores'];
  interest_scores: StudentRecord['interestScores'];
  dominant_interests: StudentRecord['dominantInterests'];
  major_alignment: StudentRecord['majorAlignment'];
}

interface SupabaseCounselorRow {
  id: string;
  full_name: string;
  nip: string;
  username: string;
  password: string;
  is_active: boolean;
  created_at: string;
}

function getClient() {
  if (!supabase) {
    throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

function toFriendlySupabaseError(error: { code?: string; message?: string }): Error {
  const msg = error?.message || 'Terjadi kesalahan koneksi Supabase.';
  if (
    error?.code === 'PGRST205' ||
    msg.includes('Could not find the table') ||
    msg.includes('does not exist')
  ) {
    return new Error(
      'Tabel database di Supabase belum dibuat. Jalankan skrip /supabase/schema.sql melalui SQL Editor di Dashboard Supabase terlebih dahulu.'
    );
  }
  return new Error(msg);
}

function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-]/g, '');
}

function mapStudentRowToRecord(row: SupabaseStudentRow): StudentRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    birthPlace: row.birth_place,
    birthDate: row.birth_date,
    classMajor: row.class_major,
    schoolOrigin: row.school_origin,
    address: row.address,
    studentPhone: row.student_phone,
    parentPhone: row.parent_phone,
    majorChoice1: row.major_choice_1,
    majorChoice2: row.major_choice_2,
    username: row.username,
    password: row.password,
    testStatus: row.test_status,
    reviewStatus: row.review_status,
    registeredAt: row.registered_at,
    completedAt: row.completed_at || '',
    aptitudeAnswers: row.aptitude_answers || {},
    interestAnswers: row.interest_answers || {},
    aptitudeScores: row.aptitude_scores || getEmptyAptitudeScores(),
    interestScores: row.interest_scores || getEmptyInterestScores(),
    dominantInterests: row.dominant_interests || [],
    majorAlignment: row.major_alignment || getEmptyMajorAlignment(),
  };
}

function mapRecordToStudentRow(record: StudentRecord): SupabaseStudentRow {
  return {
    id: record.id,
    full_name: record.fullName,
    birth_place: record.birthPlace,
    birth_date: record.birthDate,
    class_major: record.classMajor,
    school_origin: record.schoolOrigin,
    address: record.address,
    student_phone: record.studentPhone,
    parent_phone: record.parentPhone,
    major_choice_1: record.majorChoice1,
    major_choice_2: record.majorChoice2,
    username: record.username,
    password: record.password,
    test_status: record.testStatus,
    review_status: record.reviewStatus,
    registered_at: record.registeredAt,
    completed_at: record.completedAt || '',
    aptitude_answers: record.aptitudeAnswers,
    interest_answers: record.interestAnswers,
    aptitude_scores: record.aptitudeScores,
    interest_scores: record.interestScores,
    dominant_interests: record.dominantInterests,
    major_alignment: record.majorAlignment,
  };
}

function mapCounselorRowToRecord(row: SupabaseCounselorRow): CounselorAccount {
  return {
    id: row.id,
    fullName: row.full_name,
    nip: row.nip || '',
    username: row.username,
    password: row.password,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

export function subscribeInstitutionSupabase(
  defaultInstitution: InstitutionSettings,
  onData: (data: InstitutionSettings) => void
): () => void {
  const client = getClient();

  const fetchLatest = async () => {
    const { data, error } = await client
      .from('settings')
      .select('data, updated_at')
      .eq('id', 'institution')
      .maybeSingle();

    if (error) {
      if (error.code !== 'PGRST205') {
        console.error('Supabase settings/institution error:', error.message);
      }
      onData(defaultInstitution);
      return;
    }

    if (data?.data) {
      onData({
        ...defaultInstitution,
        ...(data.data as Partial<InstitutionSettings>),
        updatedAt: data.updated_at || defaultInstitution.updatedAt,
      });
    } else {
      onData(defaultInstitution);
      await client.from('settings').upsert({
        id: 'institution',
        data: defaultInstitution,
        updated_at: new Date().toISOString(),
      });
    }
  };

  void fetchLatest();

  const channel = client
    .channel('abm-settings-institution')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.institution' },
      () => {
        void fetchLatest();
      }
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export function subscribeAssessmentSettingsSupabase(
  defaultAssessment: AssessmentSettings,
  onData: (data: AssessmentSettings) => void
): () => void {
  const client = getClient();

  const fetchLatest = async () => {
    const { data, error } = await client
      .from('settings')
      .select('data, updated_at')
      .eq('id', 'assessment')
      .maybeSingle();

    if (error) {
      if (error.code !== 'PGRST205') {
        console.error('Supabase settings/assessment error:', error.message);
      }
      onData(defaultAssessment);
      return;
    }

    if (data?.data) {
      onData({
        ...defaultAssessment,
        ...(data.data as Partial<AssessmentSettings>),
        updatedAt: data.updated_at || defaultAssessment.updatedAt,
      });
    } else {
      onData(defaultAssessment);
      await client.from('settings').upsert({
        id: 'assessment',
        data: defaultAssessment,
        updated_at: new Date().toISOString(),
      });
    }
  };

  void fetchLatest();

  const channel = client
    .channel('abm-settings-assessment')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.assessment' },
      () => {
        void fetchLatest();
      }
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export function subscribeStudentsSupabase(
  onData: (students: StudentRecord[]) => void
): () => void {
  const client = getClient();

  const fetchList = async () => {
    const { data, error } = await client
      .from('students')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Supabase subscribeStudents error:', error.message);
      return;
    }
    onData((data as SupabaseStudentRow[]).map(mapStudentRowToRecord));
  };

  void fetchList();

  const channel = client
    .channel('abm-students-all')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'students' },
      () => {
        void fetchList();
      }
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export function subscribeStudentByIdSupabase(
  studentId: string,
  onData: (student: StudentRecord | null) => void
): () => void {
  const client = getClient();

  const fetchOne = async () => {
    const { data, error } = await client
      .from('students')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();

    if (error) {
      console.error('Supabase subscribeStudentById error:', error.message);
      return;
    }
    onData(data ? mapStudentRowToRecord(data as SupabaseStudentRow) : null);
  };

  void fetchOne();

  const channel = client
    .channel(`abm-student-${studentId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'students', filter: `id=eq.${studentId}` },
      () => {
        void fetchOne();
      }
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export async function saveInstitutionSettingsSupabase(
  data: Omit<InstitutionSettings, 'updatedAt'>
): Promise<void> {
  const client = getClient();
  const updatedAt = new Date().toISOString();
  const payload: InstitutionSettings = { ...data, updatedAt };
  const { error } = await client.from('settings').upsert({
    id: 'institution',
    data: payload,
    updated_at: updatedAt,
  });
  if (error) throw toFriendlySupabaseError(error);
}

export async function saveAssessmentSettingsSupabase(
  data: Omit<AssessmentSettings, 'updatedAt'>
): Promise<void> {
  const client = getClient();
  const updatedAt = new Date().toISOString();
  const payload: AssessmentSettings = { ...data, updatedAt };
  const { error } = await client.from('settings').upsert({
    id: 'assessment',
    data: payload,
    updated_at: updatedAt,
  });
  if (error) throw toFriendlySupabaseError(error);
}

export async function checkUsernameAvailableSupabase(username: string): Promise<boolean> {
  const clean = normalizeUsername(username);
  if (!clean) return false;
  const client = getClient();
  const { data, error } = await client
    .from('students')
    .select('id')
    .eq('username', clean)
    .maybeSingle();

  if (error) throw toFriendlySupabaseError(error);
  return !data;
}

export async function registerStudentSupabase(
  input: StudentRegistrationInput
): Promise<StudentRecord> {
  const cleanUsername = normalizeUsername(input.username);
  if (cleanUsername.length < 3) {
    throw new Error('Username minimal 3 karakter (huruf, angka, garis bawah, atau tanda hubung).');
  }

  const available = await checkUsernameAvailableSupabase(cleanUsername);
  if (!available) {
    throw new Error(
      `Username "${cleanUsername}" sudah digunakan peserta lain. Silakan pilih username berbeda.`
    );
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

  const client = getClient();
  const { error } = await client.from('students').insert(mapRecordToStudentRow(record));
  if (error) throw toFriendlySupabaseError(error);
  return record;
}

export async function loginStudentSupabase(
  username: string,
  password: string
): Promise<StudentRecord> {
  const clean = normalizeUsername(username);
  if (!clean || !password) {
    throw new Error('Username dan password wajib diisi.');
  }

  const client = getClient();
  const { data, error } = await client
    .from('students')
    .select('*')
    .eq('username', clean)
    .maybeSingle();

  if (error) throw toFriendlySupabaseError(error);
  if (!data) {
    throw new Error('Akun tidak ditemukan. Periksa kembali username Anda atau lakukan pendaftaran.');
  }

  const student = mapStudentRowToRecord(data as SupabaseStudentRow);
  if (student.password !== password) {
    throw new Error('Password yang Anda masukkan tidak sesuai.');
  }
  return student;
}

export async function saveStudentProgressSupabase(
  studentId: string,
  aptitudeAnswers: Record<string, number>,
  interestAnswers: Record<string, number>
): Promise<void> {
  const client = getClient();
  const { error } = await client
    .from('students')
    .update({
      test_status: 'in_progress',
      aptitude_answers: aptitudeAnswers,
      interest_answers: interestAnswers,
    })
    .eq('id', studentId);

  if (error) throw new Error(error.message);
}

export async function submitStudentAssessmentSupabase(
  student: StudentRecord,
  aptitudeAnswers: Record<string, number>,
  interestAnswers: Record<string, number>
): Promise<StudentRecord> {
  const computed = computeAssessmentResults(
    aptitudeAnswers,
    interestAnswers,
    student.majorChoice1,
    student.majorChoice2
  );
  const completedAt = new Date().toISOString();

  const client = getClient();
  const { error } = await client
    .from('students')
    .update({
      test_status: 'completed',
      completed_at: completedAt,
      aptitude_answers: aptitudeAnswers,
      interest_answers: interestAnswers,
      aptitude_scores: computed.aptitudeScores,
      interest_scores: computed.interestScores,
      dominant_interests: computed.dominantInterests,
      major_alignment: computed.majorAlignment,
    })
    .eq('id', student.id);

  if (error) throw new Error(error.message);

  return {
    ...student,
    testStatus: 'completed',
    completedAt,
    aptitudeAnswers,
    interestAnswers,
    aptitudeScores: computed.aptitudeScores,
    interestScores: computed.interestScores,
    dominantInterests: computed.dominantInterests,
    majorAlignment: computed.majorAlignment,
  };
}

export async function updateStudentReviewStatusSupabase(
  studentId: string,
  reviewStatus: ReviewStatus
): Promise<void> {
  const client = getClient();
  const { error } = await client
    .from('students')
    .update({ review_status: reviewStatus })
    .eq('id', studentId);
  if (error) throw new Error(error.message);
}

export async function approveAllCompletedStudentsSupabase(
  students: StudentRecord[]
): Promise<number> {
  const targets = students
    .filter((s) => s.testStatus === 'completed' && s.reviewStatus !== 'approved')
    .map((s) => s.id);
  if (targets.length === 0) return 0;

  const client = getClient();
  const { error } = await client
    .from('students')
    .update({ review_status: 'approved' })
    .in('id', targets);

  if (error) throw new Error(error.message);
  return targets.length;
}

export async function updateStudentByAdminSupabase(
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
  const client = getClient();
  const { error } = await client
    .from('students')
    .update({
      full_name: updates.fullName,
      birth_place: updates.birthPlace,
      birth_date: updates.birthDate,
      class_major: updates.classMajor,
      school_origin: updates.schoolOrigin,
      address: updates.address,
      student_phone: updates.studentPhone,
      parent_phone: updates.parentPhone,
      major_choice_1: updates.majorChoice1,
      major_choice_2: updates.majorChoice2,
      review_status: updates.reviewStatus,
      test_status: updates.testStatus,
    })
    .eq('id', studentId);

  if (error) throw new Error(error.message);
}

export async function deleteStudentSupabase(student: StudentRecord): Promise<void> {
  const client = getClient();
  const { error } = await client.from('students').delete().eq('id', student.id);
  if (error) throw new Error(error.message);
}

export function subscribeCounselorsSupabase(
  onData: (counselors: CounselorAccount[]) => void
): () => void {
  const client = getClient();

  const fetchList = async () => {
    const { data, error } = await client
      .from('counselors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase subscribeCounselors error:', error.message);
      return;
    }
    onData((data as SupabaseCounselorRow[]).map(mapCounselorRowToRecord));
  };

  void fetchList();

  const channel = client
    .channel('abm-counselors-all')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'counselors' },
      () => {
        void fetchList();
      }
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export function subscribeCounselorByIdSupabase(
  counselorId: string,
  onData: (counselor: CounselorAccount | null) => void
): () => void {
  const client = getClient();

  const fetchOne = async () => {
    const { data, error } = await client
      .from('counselors')
      .select('*')
      .eq('id', counselorId)
      .maybeSingle();

    if (error) {
      console.error('Supabase subscribeCounselorById error:', error.message);
      return;
    }
    onData(data ? mapCounselorRowToRecord(data as SupabaseCounselorRow) : null);
  };

  void fetchOne();

  const channel = client
    .channel(`abm-counselor-${counselorId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'counselors', filter: `id=eq.${counselorId}` },
      () => {
        void fetchOne();
      }
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export async function createCounselorSupabase(
  input: CounselorCreateInput
): Promise<CounselorAccount> {
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

  const client = getClient();
  const { data: existing, error: checkErr } = await client
    .from('counselors')
    .select('id')
    .eq('username', cleanUsername)
    .maybeSingle();

  if (checkErr) throw toFriendlySupabaseError(checkErr);
  if (existing) {
    throw new Error(`Username "${cleanUsername}" sudah digunakan oleh akun Guru BK lain.`);
  }

  const id = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();

  const record: CounselorAccount = {
    id,
    fullName: input.fullName.trim(),
    nip: input.nip.trim(),
    username: cleanUsername,
    password: input.password,
    isActive: true,
    createdAt,
  };

  const { error } = await client.from('counselors').insert({
    id: record.id,
    full_name: record.fullName,
    nip: record.nip,
    username: record.username,
    password: record.password,
    is_active: record.isActive,
    created_at: record.createdAt,
  });

  if (error) throw toFriendlySupabaseError(error);
  return record;
}

export async function updateCounselorSupabase(
  counselorId: string,
  updates: Pick<CounselorAccount, 'fullName' | 'nip' | 'password' | 'isActive'>
): Promise<void> {
  const client = getClient();
  const { error } = await client
    .from('counselors')
    .update({
      full_name: updates.fullName,
      nip: updates.nip,
      password: updates.password,
      is_active: updates.isActive,
    })
    .eq('id', counselorId);
  if (error) throw toFriendlySupabaseError(error);
}

export async function deleteCounselorSupabase(counselorId: string): Promise<void> {
  const client = getClient();
  const { error } = await client.from('counselors').delete().eq('id', counselorId);
  if (error) throw toFriendlySupabaseError(error);
}

export async function loginCounselorSupabase(
  username: string,
  password: string
): Promise<CounselorAccount> {
  const clean = normalizeUsername(username);
  if (!clean || !password) {
    throw new Error('Username dan password Guru BK wajib diisi.');
  }

  const client = getClient();
  const { data, error } = await client
    .from('counselors')
    .select('*')
    .eq('username', clean)
    .maybeSingle();

  if (error) throw toFriendlySupabaseError(error);
  if (!data) {
    throw new Error('Akun Guru BK tidak ditemukan. Hubungi Admin untuk pembuatan akun.');
  }

  const counselor = mapCounselorRowToRecord(data as SupabaseCounselorRow);
  if (counselor.password !== password) {
    throw new Error('Password yang Anda masukkan tidak sesuai.');
  }
  if (!counselor.isActive) {
    throw new Error('Akun Guru BK ini sedang dinonaktifkan oleh Admin.');
  }
  return counselor;
}
