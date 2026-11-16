import React, { useEffect, useState } from 'react';
import {
  DEFAULT_ASSESSMENT,
  DEFAULT_INSTITUTION,
  subscribeAssessmentSettings,
  subscribeCounselors,
  subscribeInstitution,
  subscribeStudentById,
  subscribeStudents,
} from './services/abmService';
import {
  AssessmentSettings,
  CounselorAccount,
  InstitutionSettings,
  StudentRecord,
} from './types/abm';
import { LandingPage } from './components/LandingPage';
import { StudentAuthPage } from './components/StudentAuthPage';
import { AssessmentTestPage } from './components/AssessmentTestPage';
import { StudentResultPage } from './components/StudentResultPage';
import { AdminDashboard } from './components/AdminDashboard';
import { CounselorDashboard } from './components/CounselorDashboard';

type AppView =
  | 'landing'
  | 'student_register'
  | 'student_login'
  | 'student_test'
  | 'student_result'
  | 'counselor'
  | 'admin';

const STUDENT_SESSION_KEY = 'abm_active_student_id';

export function App() {
  const [view, setView] = useState<AppView>('landing');
  const [institution, setInstitution] = useState<InstitutionSettings>(DEFAULT_INSTITUTION);
  const [assessmentSettings, setAssessmentSettings] =
    useState<AssessmentSettings>(DEFAULT_ASSESSMENT);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [counselors, setCounselors] = useState<CounselorAccount[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(() =>
    sessionStorage.getItem(STUDENT_SESSION_KEY)
  );
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(null);

  // Real-time listeners untuk profil lembaga dan pengaturan rilis hasil
  useEffect(() => {
    const unsubInst = subscribeInstitution(setInstitution);
    const unsubAss = subscribeAssessmentSettings(setAssessmentSettings);
    return () => {
      unsubInst();
      unsubAss();
    };
  }, []);

  // Real-time listener untuk seluruh daftar siswa & akun Guru BK ketika berada di Admin Dashboard
  useEffect(() => {
    if (view !== 'admin') return;
    const unsubStudents = subscribeStudents(setStudents);
    const unsubCounselors = subscribeCounselors(setCounselors);
    return () => {
      unsubStudents();
      unsubCounselors();
    };
  }, [view]);

  // Real-time listener untuk siswa yang sedang login (agar perubahan review Admin langsung terlihat)
  useEffect(() => {
    if (!activeStudentId) {
      setActiveStudent(null);
      return;
    }
    const unsub = subscribeStudentById(activeStudentId, (student) => {
      if (!student) {
        sessionStorage.removeItem(STUDENT_SESSION_KEY);
        setActiveStudentId(null);
        setActiveStudent(null);
        return;
      }
      setActiveStudent(student);
      if (view === 'landing' || view === 'student_login' || view === 'student_register') {
        setView(student.testStatus === 'completed' ? 'student_result' : 'student_test');
      }
    });
    return () => unsub();
  }, [activeStudentId]);

  const handleStudentAuthenticated = (student: StudentRecord) => {
    sessionStorage.setItem(STUDENT_SESSION_KEY, student.id);
    setActiveStudentId(student.id);
    setActiveStudent(student);
    setView(student.testStatus === 'completed' ? 'student_result' : 'student_test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudentLogout = () => {
    sessionStorage.removeItem(STUDENT_SESSION_KEY);
    setActiveStudentId(null);
    setActiveStudent(null);
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (view === 'student_register' || view === 'student_login') {
    return (
      <StudentAuthPage
        initialTab={view === 'student_register' ? 'register' : 'login'}
        institution={institution}
        onBackHome={() => setView('landing')}
        onAuthenticated={handleStudentAuthenticated}
      />
    );
  }

  if (view === 'student_test' && activeStudent) {
    return (
      <AssessmentTestPage
        student={activeStudent}
        institution={institution}
        onCompleted={(updated) => {
          setActiveStudent(updated);
          setView('student_result');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={handleStudentLogout}
      />
    );
  }

  if (view === 'student_result' && activeStudent) {
    return (
      <StudentResultPage
        student={activeStudent}
        institution={institution}
        assessmentSettings={assessmentSettings}
        onLogout={handleStudentLogout}
      />
    );
  }

  if (view === 'counselor') {
    return (
      <CounselorDashboard
        institution={institution}
        onBackHome={() => setView('landing')}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminDashboard
        institution={institution}
        assessmentSettings={assessmentSettings}
        students={students}
        counselors={counselors}
        onBackHome={() => setView('landing')}
      />
    );
  }

  return (
    <LandingPage
      institution={institution}
      assessmentSettings={assessmentSettings}
      onStartRegister={() => {
        if (activeStudent) {
          setView(activeStudent.testStatus === 'completed' ? 'student_result' : 'student_test');
        } else {
          setView('student_register');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onStartLogin={() => {
        if (activeStudent) {
          setView(activeStudent.testStatus === 'completed' ? 'student_result' : 'student_test');
        } else {
          setView('student_login');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onOpenAdmin={() => {
        setView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onOpenCounselor={() => {
        setView('counselor');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    />
  );
}

export default App;
