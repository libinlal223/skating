import { collection, query, where, orderBy, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type PaymentStatus = 'paid' | 'pending';

export interface FeeRecord {
  studentId: string;
  branchId: string;
  month: string;      // YYYY-MM
  total: number;
  paid: number;
  balance: number;
  status: PaymentStatus;
  updatedBy: string;
  updatedAt: string;
}

/**
 * CREATE OR UPDATE FEE RECORD
 * Simple monthly fee: total, paid, balance, status.
 */
export const updateStudentFee = async (
  studentId: string,
  branchId: string,
  month: string,
  total: number,
  paid: number,
  updatedBy: string
) => {
  const balance = total - paid;
  const status: PaymentStatus = balance <= 0 ? 'paid' : 'pending';

  const feeData: FeeRecord = {
    studentId,
    branchId,
    month,
    total,
    paid,
    balance,
    status,
    updatedBy,
    updatedAt: new Date().toISOString()
  };

  const docRef = doc(db, 'student_fees', `${studentId}_${month}`);
  await setDoc(docRef, feeData, { merge: true });

  return feeData;
};

/**
 * FETCH STUDENT FEE HISTORY
 * Returns all monthly fee records sorted latest first.
 */
export const getStudentFeeHistory = async (studentId: string) => {
  const feesRef = collection(db, 'student_fees');
  
  const q = query(
    feesRef, 
    where('studentId', '==', studentId), 
    orderBy('month', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  const history = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (FeeRecord & { id: string })[];

  return history;
};
