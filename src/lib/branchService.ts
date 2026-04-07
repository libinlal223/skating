import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  runTransaction,
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
// Generates a sequential ID (B1, B2...) using a Firestore transaction.
// Returns the new BranchProfile with the generated id.

export const createBranch = async (
  data: Omit<BranchProfile, 'id'>
): Promise<BranchProfile> => {
  try {
    const counterRef = doc(db, 'meta', 'counters');
    
    // Utilize a transaction to safely increment the branch counter
    const newDocId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let nextCounter = 1;

      if (counterDoc.exists()) {
        const docData = counterDoc.data();
        if (typeof docData.branchCounter === 'number') {
          nextCounter = docData.branchCounter + 1;
        }
      }

      // Automatically construct safe, sequential IDs: B1, B2, B3...
      const branchId = `B${nextCounter}`;
      
      const newBranchRef = doc(db, 'branches', branchId);
      
      // Update the counter doc
      transaction.set(counterRef, { branchCounter: nextCounter }, { merge: true });
      
      // Create the new branch at 'branches/B{x}'
      transaction.set(newBranchRef, data);
      
      return branchId;
    });

    return { id: newDocId, ...data };
  } catch (error) {
    console.error('[createBranch] Firestore transaction error:', error);
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
