import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json';

/**
 * Konfigurasi Firebase untuk Sistem Asesmen Bakat dan Minat (ABM).
 * Nilai di bawah otomatis terhubung ke proyek Firebase yang telah diprovisikan,
 * atau Anda dapat mengganti nilai properti berikut dengan kredensial proyek Firebase Anda sendiri:
 * - apiKey: API Key aplikasi web Firebase
 * - authDomain: Domain autentikasi Firebase (<project-id>.firebaseapp.com)
 * - databaseURL: URL Realtime Database (opsional jika menggunakan Realtime DB: https://<project-id>-default-rtdb.firebaseio.com)
 * - projectId: ID Proyek Firebase
 * - storageBucket: Bucket penyimpanan Firebase (<project-id>.firebasestorage.app)
 * - messagingSenderId: Sender ID Firebase Cloud Messaging
 * - appId: App ID aplikasi web Firebase
 * - firestoreDatabaseId: ID Database Cloud Firestore (default atau database khusus)
 */
export const firebaseConfig = {
  apiKey: appletConfig.apiKey, // Ganti dengan API Key Firebase Anda jika menggunakan proyek eksternal
  authDomain: appletConfig.authDomain, // Ganti dengan Auth Domain proyek Anda
  databaseURL: `https://${appletConfig.projectId}-default-rtdb.firebaseio.com`, // URL Realtime Database
  projectId: appletConfig.projectId, // Ganti dengan Project ID Anda
  storageBucket: appletConfig.storageBucket, // Ganti dengan Storage Bucket Anda
  messagingSenderId: appletConfig.messagingSenderId, // Ganti dengan Messaging Sender ID Anda
  appId: appletConfig.appId, // Ganti dengan App ID Anda
  firestoreDatabaseId: appletConfig.firestoreDatabaseId, // ID instance Firestore
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Koneksi Firebase terputus atau konfigurasi belum valid.');
    }
  }
}

testFirestoreConnection();
