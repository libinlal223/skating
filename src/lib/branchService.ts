import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BranchProfile {
  id: string;        // Firestore document ID (auto-generated on create)
  name: string;
  location?: string;
  coach?: string;
  phone?: string;
}

// ─── getAllBranches ───────────────────────────────────────────────────────────
// Fetch all documents from the "branches" collection and store in state.

export const getAllBranches = async (): Promise<BranchProfile[]> => {
  try {
    const snap = await getDocs(collection(db, 'branches'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BranchProfile));
  } catch (error) {
    console.error('[getAllBranches] Firestore error:', error);
    throw error;
  }
};

// ─── createBranch ─────────────────────────────────────────────────────────────
// Adds a new branch document using addDoc (auto-generated Firestore ID).
// Returns the new BranchProfile with the generated id.

export const createBranch = async (
  data: Omit<BranchProfile, 'id'>
): Promise<BranchProfile> => {
  try {
    const docRef = await addDoc(collection(db, 'branches'), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('[createBranch] Firestore error:', error);
    throw error;
  }
};

// ─── updateBranch ─────────────────────────────────────────────────────────────
// Updates an existing branch document using setDoc with merge.

export const updateBranch = async (branch: BranchProfile): Promise<void> => {
  try {
    const { id, ...data } = branch;
    await setDoc(doc(db, 'branches', id), data, { merge: true });
  } catch (error) {
    console.error('[updateBranch] Firestore error:', error);
    throw error;
  }
};

// ─── saveBranch ───────────────────────────────────────────────────────────────
// Convenience upsert: use updateBranch when id is known, createBranch otherwise.
// Kept for backward-compatibility with existing callers.

export const saveBranch = async (branch: BranchProfile): Promise<BranchProfile> => {
  if (branch.id) {
    await updateBranch(branch);
    return branch;
  }
  return createBranch(branch);
};

// ─── deleteBranch ─────────────────────────────────────────────────────────────

export const deleteBranch = async (branchId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'branches', branchId));
  } catch (error) {
    console.error('[deleteBranch] Firestore error:', error);
    throw error;
  }
};
