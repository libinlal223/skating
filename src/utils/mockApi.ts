// src/utils/mockApi.ts
// A complete mock data system for testing full app flow locally without a backend.
// It uses localStorage for persistence with an in-memory fallback state.

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type Role = 'admin' | 'instructor' | 'student';

export interface User {
  id: string;
  role: Role;
  email: string;
  password?: string;
  name?: string;
  branchId?: string;
  monthlyFee?: number;
}

export interface Branch {
  id: string;
  name: string;
  location?: string;
  coach?: string;
  phone?: string;
  students?: number;
  batches?: string[];
}

export interface AttendanceRecord {
  id?: string;
  branchId: string;
  month: string; // YYYY-MM
  sessionNumber: number; // 1-8
  date: string; // YYYY-MM-DD
  attendance: { studentId: string; status: 'present' | 'absent' }[];
}

export interface StudentFee {
  id?: string;
  studentId: string;
  month: string; // YYYY-MM
  total: number;
  paid: number;
  balance: number;
  status: 'paid' | 'pending';
}

// ==========================================
// 2. INITIAL SEED DATA
// ==========================================

const SEED_USERS: User[] = [
  { id: "ADMIN001", role: "admin", email: "admin@test.com", password: "1234", name: "System Admin" },
  { id: "INS001", role: "instructor", branchId: "B1", email: "ins@test.com", password: "1234", name: "Instructor One" },
  { id: "SW001", role: "student", branchId: "B1", name: "Aarav Sharma", email: "stu@test.com", password: "1234" }
];

const SEED_BRANCHES: Branch[] = [
  { id: "B1", name: "Mumbai Central", location: "Mumbai, Maharashtra", coach: "Coach Raj", phone: "+91 98765 43210", students: 1, batches: ["Morning Batch", "Evening Batch"] },
  { id: "B2", name: "Pune Branch", location: "Pune, Maharashtra", coach: "Coach Priya", phone: "+91 98765 43211", students: 0, batches: ["Weekend Batch"] }
];

const SEED_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "ATT_B1_2026-03_1",
    branchId: "B1",
    month: "2026-03",
    sessionNumber: 1,
    date: "2026-03-01",
    attendance: [
      { studentId: "SW001", status: "present" }
    ]
  }
];

const SEED_FEES: StudentFee[] = [
  { id: "FEE_SW001_2026-03", studentId: "SW001", month: "2026-03", total: 6000, paid: 6000, balance: 0, status: "paid" },
  { id: "FEE_SW001_2026-04", studentId: "SW001", month: "2026-04", total: 6000, paid: 6000, balance: 0, status: "paid" },
  { id: "FEE_SW001_2026-05", studentId: "SW001", month: "2026-05", total: 6000, paid: 3000, balance: 3000, status: "pending" },
];

// ==========================================
// 3. STORAGE HELPERS
// ==========================================

const isBrowser = typeof window !== 'undefined';

const loadData = <T>(key: string, seed: T): T => {
  if (!isBrowser) return seed;
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
    
    // If empty -> seed mock data
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return seed;
  }
};

const saveData = <T>(key: string, data: T): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

// ==========================================
// 4. MOCK API HELPER FUNCTIONS
// ==========================================

// --- USERS ---
export const getUsers = (): User[] => {
  return loadData<User[]>('mock_users', SEED_USERS);
};

export const loginUser = (email: string, password?: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.email === email && (!password || u.password === password));
  return user || null;
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...user };
  } else {
    users.unshift(user);
  }
  saveData('mock_users', users);
};

export const deleteUser = (userId: string) => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId);
  saveData('mock_users', filtered);
};

// --- BRANCHES ---
export const getBranches = (): Branch[] => {
  return loadData<Branch[]>('mock_branches', SEED_BRANCHES);
};

export const saveBranch = (branch: Branch) => {
  const branches = getBranches();
  const existingIndex = branches.findIndex(b => b.id === branch.id);
  if (existingIndex >= 0) {
    branches[existingIndex] = { ...branches[existingIndex], ...branch };
  } else {
    branches.unshift(branch);
  }
  saveData('mock_branches', branches);
};

export const deleteBranch = (branchId: string) => {
  const branches = getBranches();
  const filtered = branches.filter(b => b.id !== branchId);
  saveData('mock_branches', filtered);
};

// --- ATTENDANCE ---
export const getAttendance = (): AttendanceRecord[] => {
  return loadData<AttendanceRecord[]>('mock_attendance', SEED_ATTENDANCE);
};

export const getAttendanceByMonth = (branchId: string, month: string): AttendanceRecord[] => {
  const records = getAttendance();
  return records.filter(r => r.branchId === branchId && r.month === month);
};

export const saveAttendance = (branchId: string, date: string, attendanceArray: { studentId: string; status: 'present' | 'absent' }[]) => {
  const records = getAttendance();
  const month = date.slice(0, 7); // Extracts "YYYY-MM"
  
  const monthRecords = records.filter(r => r.branchId === branchId && r.month === month);
  const existingRecordIndex = records.findIndex(r => r.branchId === branchId && r.date === date);

  if (existingRecordIndex >= 0) {
    // Update existing session
    records[existingRecordIndex].attendance = attendanceArray;
  } else {
    // Add new session
    const nextSessionNumber = monthRecords.length + 1;
    const newRecord: AttendanceRecord = {
      id: `ATT_${branchId}_${month}_${nextSessionNumber}_${Date.now()}`,
      branchId,
      month,
      sessionNumber: nextSessionNumber, // increments based on records in current month
      date,
      attendance: attendanceArray
    };
    records.push(newRecord);
  }

  saveData('mock_attendance', records);
};

// --- FEES ---
export const getAllFees = (): StudentFee[] => {
  return loadData<StudentFee[]>('mock_fees', SEED_FEES);
};

export const getStudentFees = (studentId: string): StudentFee[] => {
  const fees = getAllFees();
  // Return fees sorted by month descending (latest first)
  return fees.filter(f => f.studentId === studentId).sort((a, b) => b.month.localeCompare(a.month));
};

export const updateFees = (studentId: string, month: string, data: Partial<StudentFee>) => {
  const fees = getAllFees();
  const existingIndex = fees.findIndex(f => f.studentId === studentId && f.month === month);

  const baseTotal = existingIndex >= 0 ? fees[existingIndex].total : 0;
  const basePaid = existingIndex >= 0 ? fees[existingIndex].paid : 0;
  
  const total = data.total !== undefined ? data.total : baseTotal;
  const paid = data.paid !== undefined ? data.paid : basePaid;
  
  const balance = total - paid;
  const status: 'paid' | 'pending' = balance <= 0 ? 'paid' : 'pending';

  if (existingIndex >= 0) {
    fees[existingIndex] = { ...fees[existingIndex], ...data, total, paid, balance, status };
  } else {
    const newFee: StudentFee = {
      id: `FEE_${studentId}_${month}_${Date.now()}`,
      studentId,
      month,
      total,
      paid,
      balance,
      status,
    };
    fees.push(newFee);
  }

  saveData('mock_fees', fees);
};
