import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentStatus = 'paid' | 'pending' | 'partial';

export interface FeeRecord {
  id?: string;
  studentId: string;
  branchId?: string;
  month: string;       // YYYY-MM
  total: number;
  paid: number;
  status: PaymentStatus;
  updatedBy?: string;
  updatedAt?: string;
  balance?: number;
}

// ─── getStudentFees ───────────────────────────────────────────────────────────
// Fetch all fee documents for a student, sorted by month descending (latest first).

export const getStudentFees = async (studentId: string): Promise<FeeRecord[]> => {
  try {
    const feesRef = collection(db, 'student_fees');
    const q = query(
      feesRef,
      where('studentId', '==', studentId),
      orderBy('month', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data,
        balance: Math.max((data.total || 0) - (data.paid || 0), 0)
      } as FeeRecord;
    });
  } catch (error) {
    console.error('[getStudentFees] Firestore error:', error);
    throw error;
  }
};

// ─── updateFeeStatus ─────────────────────────────────────────────────────────
// Quick status-only update (e.g. admin marks month as paid/pending).
// If record exists → update status field only.
// If record does not exist → create a minimal document.

export const updateFeeStatus = async (
  studentId: string,
  month: string,
  status: PaymentStatus,
  total: number = 0,
  paid: number = 0
): Promise<void> => {
  try {
    const docRef = doc(db, 'student_fees', `${studentId}_${month}`);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      // UPDATE — only touch status and updatedAt
      await updateDoc(docRef, {
        status,
        paid,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // CREATE — minimal new record
      const calculatedBalance = total - paid;
      await setDoc(docRef, {
        studentId,
        month,
        total,
        paid,
        status: calculatedBalance <= 0 ? 'paid' : status,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('[updateFeeStatus] Firestore error:', error);
    throw error;
  }
};

// ─── updateStudentFee ─────────────────────────────────────────────────────────
// Full upsert — use when updating total + paid amounts (admin fee management).

export const updateStudentFee = async (
  studentId: string,
  branchId: string,
  month: string,
  total: number,
  paid: number,
  updatedBy: string = 'admin'
): Promise<FeeRecord> => {
  try {
    const calculatedBalance = total - paid;
    const status: PaymentStatus = calculatedBalance <= 0 ? 'paid' : 'pending';

    const feeData: FeeRecord = {
      studentId,
      branchId,
      month,
      total,
      paid,
      status,
      updatedBy,
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'student_fees', `${studentId}_${month}`);
    await setDoc(docRef, feeData, { merge: true });

    return feeData;
  } catch (error) {
    console.error('[updateStudentFee] Firestore error:', error);
    throw error;
  }
};

// ─── getStudentFeeHistory (alias for getStudentFees, kept for compatibility) ──
export const getStudentFeeHistory = getStudentFees;

// ─── deleteFeeRecord ──────────────────────────────────────────────────────────
export const deleteFeeRecord = async (studentId: string, month: string): Promise<void> => {
  try {
    const docRef = doc(db, 'student_fees', `${studentId}_${month}`);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('[deleteFeeRecord] Firestore error:', error);
    throw error;
  }
};

// ─── updateFee ────────────────────────────────────────────────────────────────
// Increment payment utilizing exact logic specified by the prompt
export const updateFee = async (studentId: string, month: string, amount: number, providedTotal?: number): Promise<void> => {
  try {
    const docId = `${studentId}_${month}`;
    const docRef = doc(db, 'student_fees', docId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const existing = snap.data() as FeeRecord;
      const total = providedTotal !== undefined ? providedTotal : existing.total;
      
      // Calculate newPaid and prevent overpayment
      let newPaid = existing.paid + amount;
      if (newPaid > total) {
        newPaid = total;
      }
      
      // Calculate status based on updated newPaid limit
      let newStatus: PaymentStatus = 'pending';
      if (newPaid >= total) {
        newStatus = 'paid';
      } else if (newPaid > 0) {
        newStatus = 'partial';
      }

      await updateDoc(docRef, {
        total,
        paid: newPaid,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } else {
      // IF NOT EXISTS: fetch student for branchId & monthlyFee
      const studentSnap = await getDoc(doc(db, 'students', studentId));
      let branchId = '';
      let monthlyFee = 6000;

      if (studentSnap.exists()) {
        const sData = studentSnap.data();
        branchId = sData.branchId || sData.branch || '';
        monthlyFee = sData.monthlyFee || 6000;
      }

      const activeTotal = providedTotal !== undefined ? providedTotal : monthlyFee;

      // Prevent overpayment on create too
      let newPaid = amount;
      if (newPaid > activeTotal) {
        newPaid = activeTotal;
      }

      let newStatus: PaymentStatus = 'pending';
      if (newPaid >= activeTotal) {
        newStatus = 'paid';
      } else if (newPaid > 0) {
        newStatus = 'partial';
      }

      await setDoc(docRef, {
        studentId,
        branchId,
        month,
        total: activeTotal,
        paid: newPaid,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[updateFee] Firestore error:', error);
    throw error;
  }
};

// ─── Multi-Month Fee Payment ──────────────────────────────────────────────────

export const addMonths = (monthStr: string, i: number): string => {
  const [yearStr, mStr] = monthStr.split('-');
  const date = new Date(parseInt(yearStr), parseInt(mStr) - 1 + i, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const payMultipleMonths = async (
  studentId: string,
  branchId: string,
  startMonth: string,
  duration: number,
  monthlyFee: number
): Promise<void> => {
  try {
    for (let i = 0; i < duration; i++) {
      const currentMonth = addMonths(startMonth, i);
      const docId = `${studentId}_${currentMonth}`;
      const docRef = doc(db, 'student_fees', docId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const existing = snap.data() as FeeRecord;
        const totalToUse = existing.total || monthlyFee;
        await updateDoc(docRef, {
          paid: totalToUse,
          status: 'paid',
          updatedAt: new Date().toISOString()
        });
      } else {
        await setDoc(docRef, {
          studentId,
          branchId,
          month: currentMonth,
          total: monthlyFee,
          paid: monthlyFee,
          status: 'paid',
          createdAt: serverTimestamp(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('[payMultipleMonths] Firestore error:', error);
    throw error;
  }
};
