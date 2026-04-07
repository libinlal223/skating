import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { initializeApp, deleteApp as deleteFirebaseApp } from 'firebase/app';
import { db } from './firebase';
import { serverTimestamp } from 'firebase/firestore';

// ─── Helper: normalize branchId ───────────────────────────────────────────────
// Old students had branchId stored as the branch display name ("kochi").
// New students have branchId stored as the Firestore doc ID.
// Given a list of branch documents, resolve name→docId when needed.
export const normalizeBranchId = (
  rawBranchId: string,
  branches: { id: string; name: string }[]
): string => {
  if (!rawBranchId) return rawBranchId;
  // If there's already a branch doc with this id, it's valid — return as-is.
  const byId = branches.find(b => b.id === rawBranchId);
  if (byId) return rawBranchId;
  const byName = branches.find(b => b.name.toLowerCase() === rawBranchId.toLowerCase());
  if (byName) {
    console.log(`[normalizeBranchId] Resolved legacy branchId "${rawBranchId}" → "${byName.id}"`);
    return byName.id;
  }
  // Return as-is if we can't resolve it.
  return rawBranchId;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentProfile {
  uid: string;          // Firebase Auth UID = Firestore users/{uid}
  studentId: string;    // e.g. "SW-1001"
  role: 'student';
  name: string;
  email: string;
  branchId: string;
  branch?: string;      // branch name (display)
  age?: string;
  phone?: string;
  monthlyFee?: number;
  batch?: string;
  id?: string;
  createdAt?: any;
  password?: string;
}

export interface InstructorProfile {
  uid: string;
  role: 'instructor';
  name?: string;
  email?: string;
  branchId?: string;
}

// ─── getStudentProfile ────────────────────────────────────────────────────────
// Fetch a single student document from /users/{uid}.

export const getStudentProfile = async (uid: string): Promise<StudentProfile | null> => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { uid, ...snap.data() } as StudentProfile;
  } catch (error) {
    console.error('[getStudentProfile] Firestore error:', error);
    throw error;
  }
};

// ─── getAllStudents ───────────────────────────────────────────────────────────
// Fetch all documents from /students collection.
// Maps Firestore fields to the shape expected by the UI (studentId → id).

export const getAllStudents = async (): Promise<StudentProfile[]> => {
  try {
    // Fetch branches in parallel so we can normalize legacy branchId (name→docId)
    const [studentSnap, branchSnap] = await Promise.all([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'branches')),
    ]);
    const branches = branchSnap.docs.map(d => ({ id: d.id, name: (d.data() as any).name || '' }));
    console.log('[getAllStudents] Branches for normalization:', branches.map(b => `${b.name}=${b.id}`));
    console.log('[getAllStudents] Fetched data length:', studentSnap.docs.length);

    return studentSnap.docs.map(d => {
      const data = d.data();
      const rawBranchId = data.branchId || '';
      const resolvedBranchId = normalizeBranchId(rawBranchId, branches);
      const branchName = branches.find(b => b.id === resolvedBranchId)?.name || data.branch || rawBranchId;
      console.log(`[getAllStudents] Student ${data.studentId || d.id}: branchId "${rawBranchId}" → "${resolvedBranchId}"`);
      return {
        uid: data.uid || d.id,
        studentId: data.studentId || d.id,
        // UI accesses students via s.id — map studentId → id
        id: data.studentId || d.id,
        role: 'student' as const,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        branchId: resolvedBranchId,
        branch: branchName,
        age: data.age || '',
        monthlyFee: data.monthlyFee || 6000,
        password: data.password || '',
        batch: data.batch || '',
        createdAt: data.createdAt || '',
      };
    });
  } catch (error) {
    console.error('[getAllStudents] Firestore error:', error);
    throw error;
  }
};

// ─── saveStudent ──────────────────────────────────────────────────────────────
// Upsert a student document in both /students/{studentId} and /users/{uid}.

export const saveStudent = async (student: Partial<StudentProfile> & { uid: string }): Promise<void> => {
  try {
    const { uid, ...data } = student;
    const studentId = data.studentId || uid;

    // Update /users/{uid} (used by auth lookup)
    await setDoc(doc(db, 'users', uid), { role: 'student', uid, ...data }, { merge: true });

    // Update /students/{studentId} (primary students collection)
    await setDoc(doc(db, 'students', studentId), { role: 'student', uid, ...data }, { merge: true });
  } catch (error) {
    console.error('[saveStudent] Firestore error:', error);
    throw error;
  }
};

// ─── createStudentAccount ────────────────────────────────────────────────────
// Creates a Firebase Auth account for the student WITHOUT signing the admin out.
// Uses a secondary (temporary) Firebase App instance for isolation.
// Also writes the student profile to /students/{studentId} AND /users/{uid}.

export interface CreateStudentInput {
  studentId: string;   // e.g. "SW-1001" (used as Firestore doc ID key)
  name: string;
  phone: string;
  password: string;
  branchId?: string;
  branch?: string;
  age?: string;
  monthlyFee?: number;
}

export interface CreatedStudentCredentials {
  uid: string;
  email: string;
  password: string;
  name: string;
  studentId: string;
}

export const createStudentAccount = async (
  input: CreateStudentInput
): Promise<CreatedStudentCredentials> => {
  const { studentId, name, phone, password, branchId, branch, age, monthlyFee } = input;

  // 1. Generate email from phone number
  const email = `${studentId}@smartwheels.com`;

  // 2. Create a temporary secondary Firebase app so admin stays signed in
  const secondaryAppName = `secondary-${Date.now()}`;
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  let uid: string;
  try {
    // 3. Create Firebase Auth account
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    uid = credential.user.uid;
  } finally {
    // Always clean up the secondary app regardless of success/failure
    await deleteFirebaseApp(secondaryApp).catch(() => { });
  }

  // 4. Save student profile in /students/{studentId}
  //    uid is included as a field so the Auth account can be linked back.
  const studentData = {
    uid,
    studentId,
    role: 'student' as const,
    name,
    email,
    phone,
    branchId: branchId || '',
    branch: branch || branchId || '',
    age: age || '',
    monthlyFee: monthlyFee || 6000,
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'students', studentId), studentData);

  // 5. Save user role in /users/{uid}
  await setDoc(doc(db, 'users', uid), {
    uid,
    studentId,
    role: 'student',
    name,
    email,
    phone,
    branchId: branchId || '',
    branch: branch || branchId || '',
    age: age || '',
    monthlyFee: monthlyFee || 6000,
    createdAt: serverTimestamp(),
  });

  return { uid, email, password, name, studentId };
};

// ─── deleteStudent ────────────────────────────────────────────────────────────
// Remove student from both /students/{studentId} and /users/{uid}.

export const deleteStudent = async (uid: string, studentId?: string): Promise<void> => {
  try {
    // Delete from /users/{uid}
    await deleteDoc(doc(db, 'users', uid));

    // Delete from /students/{studentId} (studentId === doc ID in that collection)
    const docId = studentId || uid;
    await deleteDoc(doc(db, 'students', docId));
  } catch (error) {
    console.error('[deleteStudent] Firestore error:', error);
    throw error;
  }
};
