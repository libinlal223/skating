import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { normalizeBranchId } from './studentService';
import { auth, db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'instructor' | 'student';

/**
 * The application-level user object returned by every auth function.
 * Merges Firebase Auth identity with Firestore /users/{uid} data.
 */
export interface AppUser {
  uid: string;
  email: string | null;
  role: UserRole;
  /** Present for students and instructors; undefined for admins. */
  branchId?: string;
  /** Present only for students. */
  studentId?: string;
  /** Populated for students by a secondary fetch into the students collection. */
  name?: string;
}

// ─── Internal helper ──────────────────────────────────────────────────────────

/**
 * Fetches /users/{uid} from Firestore and merges it with the Auth user.
 * Throws a descriptive error if the document is missing or malformed.
 */
async function buildAppUser(firebaseUser: FirebaseUser): Promise<AppUser> {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userSnap   = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    throw new Error(
      `No Firestore document found for uid "${firebaseUser.uid}". ` +
      'Ensure a /users/{uid} document exists with at least a "role" field.'
    );
  }

  const data = userSnap.data();

  if (!data.role) {
    throw new Error(
      `Firestore document for uid "${firebaseUser.uid}" is missing the required "role" field.`
    );
  }

  let studentName: string | undefined = undefined;
  let fetchedBranchId: string | undefined = undefined;
  let fetchedStudentId: string | undefined = undefined;

  if (data.role === 'student') {
    const sId = data.studentId || firebaseUser.uid;
    try {
      const studentSnap = await getDoc(doc(db, 'students', sId));
      if (studentSnap.exists()) {
        const p = studentSnap.data();
        studentName = p.name;
        fetchedBranchId = p.branchId;
        fetchedStudentId = p.studentId || sId;
      } else {
        console.warn(`[buildAppUser] Warning: /students/${sId} not found.`);
      }
    } catch (err) {
      console.error(`[buildAppUser] Error fetching /students/${sId}:`, err);
    }
  }

  let finalBranchId = data.branchId ?? fetchedBranchId ?? undefined;
  
  if (finalBranchId) {
    try {
      const branchSnap = await getDocs(collection(db, 'branches'));
      const branches = branchSnap.docs.map(d => ({ id: d.id, name: (d.data() as any).name || '' }));
      finalBranchId = normalizeBranchId(finalBranchId, branches);
    } catch (err) {
      console.error('[buildAppUser] Error fetching branches to normalize:', err);
    }
  }

  return {
    uid:       firebaseUser.uid,
    email:     firebaseUser.email,
    role:      data.role      as UserRole,
    branchId:  finalBranchId,
    studentId: data.studentId ?? fetchedStudentId ?? undefined,
    name:      studentName    || (data.role === 'student' ? 'Unknown Student' : undefined),
  };
}

// ─── login ────────────────────────────────────────────────────────────────────

/**
 * Signs in the user with email and password, then fetches their Firestore
 * document to build and return a typed `AppUser`.
 *
 * @throws {Error} With a user-friendly message for common auth failures.
 */
export async function login(email: string, password: string): Promise<AppUser> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return await buildAppUser(credential.user);
  } catch (error: any) {
    // Map Firebase Auth error codes → readable messages
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        throw new Error('Invalid email or password. Please try again.');

      case 'auth/invalid-email':
        throw new Error('The email address entered is not valid.');

      case 'auth/user-disabled':
        throw new Error('This account has been disabled. Contact your administrator.');

      case 'auth/too-many-requests':
        throw new Error('Too many failed login attempts. Please wait a moment and try again.');

      default:
        // Firestore "document not found" errors or any other unknown error pass through as-is
        throw error;
    }
  }
}

// ─── logout ───────────────────────────────────────────────────────────────────

/**
 * Signs out the currently authenticated user from Firebase Auth.
 *
 * @throws {Error} Re-throws any signOut failure for the caller to handle.
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('[authService] logout failed:', error);
    throw error;
  }
}

// ─── getCurrentUser ───────────────────────────────────────────────────────────

/**
 * Resolves the currently signed-in user as an `AppUser` (Auth + Firestore data),
 * or `null` if no user is authenticated.
 *
 * Uses `onAuthStateChanged` internally to safely handle Next.js page rehydration
 * where `auth.currentUser` may momentarily be `null`.
 */
export function getCurrentUser(): Promise<AppUser | null> {
  return new Promise((resolve, reject) => {
    // Unsubscribe immediately after the first emission (one-shot read)
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        unsubscribe();

        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          const appUser = await buildAppUser(firebaseUser);
          resolve(appUser);
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}
