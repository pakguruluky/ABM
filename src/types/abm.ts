export type AptitudeKey =
  | 'spasial'
  | 'verbal'
  | 'penalaran'
  | 'klerikal'
  | 'mekanik'
  | 'kuantitatif'
  | 'bahasa';

export type InterestKey =
  | 'kesenian'
  | 'menolong'
  | 'keteknikan'
  | 'pengelolaan_data'
  | 'fasilitasi_sosial'
  | 'pengelolaan'
  | 'kerja_lapangan'
  | 'detail_bisnis'
  | 'kerja_ilmiah'
  | 'sains_sosial'
  | 'analisis_finansial'
  | 'pengaruh'
  | 'sistem_bisnis'
  | 'kerja_manual'
  | 'kendali_kualitas'
  | 'keteknisian'
  | 'pelayanan_pribadi'
  | 'layanan_dasar';

export type AptitudeCategory = 'Tinggi' | 'Sedang' | 'Rendah';

export type InterestType = 'Minat Dasar' | 'Minat Metodis' | 'Minat Praktis';

export type ReleaseMode = 'immediate' | 'scheduled' | 'manual_review';

export type TestStatus = 'registered' | 'in_progress' | 'completed';

export type ReviewStatus = 'pending_review' | 'approved';

export interface InstitutionSettings {
  name: string;
  subtitle: string;
  npsn: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  principalName: string;
  principalNip: string;
  logoBase64: string;
  updatedAt: string;
}

export interface AssessmentSettings {
  mode: ReleaseMode;
  releaseStart: string;
  releaseEnd: string;
  updatedAt: string;
}

export interface MajorEvaluationItem {
  majorName: string;
  alignmentScore: number;
  status: 'Sangat Selaras' | 'Cukup Selaras' | 'Perlu Penguatan';
  notes: string;
}

export interface AptitudeInterestMatch {
  interestKey: InterestKey;
  interestName: string;
  interestType: InterestType;
  interestScore: number;
  supportingAptitudes: string[];
  avgSupportingAptitude: number;
  compatibilityLabel: 'Sangat Selaras' | 'Cukup Selaras' | 'Perlu Penguatan';
}

export interface MajorAlignmentResult {
  choice1: MajorEvaluationItem;
  choice2: MajorEvaluationItem;
  matches: AptitudeInterestMatch[];
  recommendedClusters: string[];
  dominantMethodicalPractical?: InterestKey[];
  dominantBasicFallback?: InterestKey[];
}

export interface StudentRecord {
  id: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  classMajor: string;
  schoolOrigin: string;
  address: string;
  studentPhone: string;
  parentPhone: string;
  majorChoice1: string;
  majorChoice2: string;
  username: string;
  password: string;
  testStatus: TestStatus;
  reviewStatus: ReviewStatus;
  registeredAt: string;
  completedAt: string;
  aptitudeAnswers: Record<string, number>;
  interestAnswers: Record<string, number>;
  aptitudeScores: Record<AptitudeKey, number>;
  interestScores: Record<InterestKey, number>;
  dominantInterests: InterestKey[];
  majorAlignment: MajorAlignmentResult;
}

export interface AptitudeDimensionMeta {
  key: AptitudeKey;
  code: string;
  name: string;
  shortDesc: string;
  detailDesc: string;
  interpretations: {
    Tinggi: string;
    Sedang: string;
    Rendah: string;
  };
}

export interface InterestDimensionMeta {
  key: InterestKey;
  name: string;
  englishName: string;
  interestType: InterestType;
  cluster: 'Sains & Teknik' | 'Bisnis & Data' | 'Sosial & Layanan' | 'Kreatif & Lapangan';
  shortDesc: string;
  careers: string[];
  supportingAptitudes: AptitudeKey[];
}

export interface AptitudeQuestion {
  id: string;
  dimension: AptitudeKey;
  prompt: string;
  options: string[];
  correctIndex: number;
  diagramId?:
    | 'spasial_cube_1'
    | 'spasial_rotate_2'
    | 'spasial_mirror_3'
    | 'spasial_blocks_4'
    | 'spasial_fold_5'
    | 'mekanik_pulley_1'
    | 'mekanik_gear_2'
    | 'mekanik_lever_3'
    | 'mekanik_balance_4'
    | 'mekanik_water_5';
}

export interface InterestStatement {
  id: string;
  dimension: InterestKey;
  statement: string;
}

export type StudentRegistrationInput = {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  classMajor: string;
  schoolOrigin: string;
  address: string;
  studentPhone: string;
  parentPhone: string;
  majorChoice1: string;
  majorChoice2: string;
  username: string;
  password: string;
};

export interface CounselorAccount {
  id: string;
  fullName: string;
  nip: string;
  username: string;
  password: string;
  isActive: boolean;
  createdAt: string;
}

export interface CounselorCreateInput {
  fullName: string;
  nip: string;
  username: string;
  password: string;
}
