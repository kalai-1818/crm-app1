import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getIdToken,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase.ts';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Track auth readiness to avoid false redirects on page load
let authReady = false;
let authReadyResolve: () => void;
const authReadyPromise = new Promise<void>((resolve) => {
  authReadyResolve = resolve;
});

onAuthStateChanged(auth, () => {
  if (!authReady) {
    authReady = true;
    authReadyResolve();
    // Sync user to localStorage on state change
    if (auth.currentUser) {
      const stored = localStorage.getItem('user');
      if (!stored) {
        // Minimal sync so components can read name/email without async
        localStorage.setItem(
          'user',
          JSON.stringify({ id: auth.currentUser.uid, email: auth.currentUser.email })
        );
      }
    } else {
      localStorage.removeItem('user');
    }
  }
});

export const authService = {
  /** Wait for Firebase to restore auth state before routing decisions */
  waitForAuthReady(): Promise<void> {
    return authReadyPromise;
  },

  async register({ name, email, password }: any) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const profile = {
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, profile);
      localStorage.setItem('user', JSON.stringify({ id: firebaseUser.uid, ...profile }));
      return { user: { id: firebaseUser.uid, ...profile } };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async login({ email, password }: any) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      let userData: any;
      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        // Auto-create Firestore profile if missing (e.g. old account)
        userData = {
          name: firebaseUser.displayName || email.split('@')[0],
          email,
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, userData);
      }

      localStorage.setItem('user', JSON.stringify({ id: firebaseUser.uid, ...userData }));
      return { user: { id: firebaseUser.uid, ...userData } };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async logout() {
    await signOut(auth);
    localStorage.removeItem('user');
  },

  async getToken(): Promise<string | null> {
    if (!auth.currentUser) return null;
    return await getIdToken(auth.currentUser);
  },

  isAuthenticated(): boolean {
    // Safe to use after waitForAuthReady() has resolved
    return !!auth.currentUser;
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
