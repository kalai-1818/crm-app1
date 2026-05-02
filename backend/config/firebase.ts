import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function initFirebaseAdmin() {
  if (getApps().length > 0) return getApp();

  // On Railway: set FIREBASE_SERVICE_ACCOUNT to the full JSON string of your service account key
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return initializeApp({ credential: cert(serviceAccount) });
    } catch (e) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT env var. Must be valid JSON.');
    }
  }

  // Locally: set GOOGLE_APPLICATION_CREDENTIALS to the path of your service account JSON file
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp();
  }

  throw new Error(
    'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT (JSON string) or GOOGLE_APPLICATION_CREDENTIALS (file path).'
  );
}

const app = initFirebaseAdmin();

const DB_ID = process.env.FIRESTORE_DATABASE_ID || '(default)';
export const db = getFirestore(app, DB_ID);
export const auth = getAuth(app);

export default { db, auth };
