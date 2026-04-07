import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types (same shape the UI already expects) ───────────────────────────────

export interface AttendanceEntry {
  studentId: string;
  status: 'present' | 'absent';
}

export interface AttendanceRecord {
  id?: string;
  branchId: string;
  month: string;        // YYYY-MM
  sessionNumber: number;// auto-incremented within the month
  date: string;         // YYYY-MM-DD
  attendance: AttendanceEntry[];
  createdAt?: string;
}

const COLLECTION = 'attendance_records';


// ─── saveAttendance ───────────────────────────────────────────────────────────
// If a record already exists for this branchId + date → UPDATE it.
// Otherwise → CREATE a new document with an auto-incremented sessionNumber.

export const saveAttendance = async (
  branchId: string,
  date: string,
  attendanceArray: AttendanceEntry[]
): Promise<void> => {
  try {
    const month = date.slice(0, 7); // "YYYY-MM"
    const colRef = collection(db, COLLECTION);

    // Fetch all records for the selected branch & month
    const monthSnap = await getDocs(
      query(colRef, where('branchId', '==', branchId), where('month', '==', month))
    );
    const existingRecords = monthSnap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord));

    // Check if a record already exists for the same date
    const existingRecord = existingRecords.find(r => r.date === date);

    if (existingRecord) {
      // UPDATE — reuse its sessionNumber
      const existingDocRef = doc(db, COLLECTION, existingRecord.id!);
      await updateDoc(existingDocRef, { attendance: attendanceArray });
    } else {
      // CREATE — unlimited sessions allowed
      // Determine sessionNumber (existing count + 1)
      const sessionNumber = existingRecords.length + 1;

      await addDoc(colRef, {
        branchId,
        date,
        month,
        sessionNumber, // Dynamic (existing count + 1)
        attendance: attendanceArray,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('[saveAttendance] Firestore error:', error);
    throw error;
  }
};

// ─── getAttendanceByBranch ────────────────────────────────────────────────────
// Fetches ALL records for a given branch.
// Mirrors the old getAttendance() shape so existing useMemo filters keep working.

export const getAttendanceByBranch = async (
  branchId: string
): Promise<AttendanceRecord[]> => {
  try {
    const colRef = collection(db, COLLECTION);
    const snap = await getDocs(
      query(colRef, where('branchId', '==', branchId))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord));
  } catch (error) {
    console.error('[getAttendanceByBranch] Firestore error:', error);
    throw error;
  }
};

// ─── getStudentAttendance ─────────────────────────────────────────────────────
// Fetches attendance for a specific student in a branch+month.
// Returns a dynamic array of sessions based on conducted records only.

export interface StudentSession {
  sessionNumber: number;
  date: string;
  status: 'present' | 'absent';
}

export const getStudentAttendance = async (
  studentId: string,
  branchId: string,
  month: string   // YYYY-MM
): Promise<StudentSession[]> => {
  try {
    console.log(`[getStudentAttendance] Fetching for studentId: "${studentId}", branch: "${branchId}", month: "${month}"`);
    const colRef = collection(db, COLLECTION);
    const snap = await getDocs(
      query(
        colRef,
        where('branchId', '==', branchId),
        where('month', '==', month)
      )
    );

    // Extract all records and sort them by sessionNumber ascending
    const records = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as AttendanceRecord))
      .sort((a, b) => a.sessionNumber - b.sessionNumber);

    console.log(`[getStudentAttendance] Fetched ${records.length} documents for branch and month`);

    // Build the dynamic result only for sessions where student is explicitly found
    const sessions: StudentSession[] = [];
    
    for (const rec of records) {
      console.log(`[getStudentAttendance] Doc ${rec.id}: sessionNumber ${rec.sessionNumber}, attendance array length ${rec.attendance?.length || 0}`);
      
      if (!rec.attendance || !Array.isArray(rec.attendance)) continue;

      const entry = rec.attendance.find(a => {
        return String(a.studentId).trim() === String(studentId).trim();
      });

      if (entry) {
        console.log(`[getStudentAttendance] Matched student record in doc ${rec.id}:`, entry);
        sessions.push({
          sessionNumber: rec.sessionNumber,
          date: rec.date,
          status: entry.status
        });
      } else {
        console.log(`[getStudentAttendance] Student "${studentId}" not found in doc ${rec.id} attendance array.`);
      }
    }

    return sessions;
  } catch (error) {
    console.error('[getStudentAttendance] Firestore error:', error);
    throw error;
  }
};
