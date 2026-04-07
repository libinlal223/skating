'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, DollarSign, GitBranch, LogOut, Plus, Search, Edit, Trash2, Check, X, ChevronDown, ChevronUp, Menu, LayoutDashboard, FileText, CreditCard, Pencil } from 'lucide-react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCurrentUser, logout as authLogout } from '@/lib/authService';
import { getAllStudents, saveStudent, deleteStudent, StudentProfile, createStudentAccount, CreatedStudentCredentials } from '@/lib/studentService';
import { updateBranch, deleteBranch as deleteBranchFS, BranchProfile } from '@/lib/branchService';
import { getStudentFees, updateStudentFee, FeeRecord, updateFee, deleteFeeRecord, payMultipleMonths } from '@/lib/feeService';

type Tab = 'overview' | 'students' | 'fees' | 'branches';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  
  const [students, setStudents] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [visibleRecent, setVisibleRecent] = useState(5);

  // Fee management state
  const [expandedFeeStudent, setExpandedFeeStudent] = useState<string | null>(null);
  const [allFees, setAllFees] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ studentId: '', month: '', total: '', paid: '', duration: '1', customDuration: '2' });
  const [feeBranchFilter, setFeeBranchFilter] = useState('');
  const [feeHistoryLimit, setFeeHistoryLimit] = useState(5);

  // Edit-fee-row modal state
  const [showEditFeeModal, setShowEditFeeModal] = useState(false);
  const [editFeeForm, setEditFeeForm] = useState({ studentId: '', month: '', total: '', paid: '' });
  const [editFeeStudentName, setEditFeeStudentName] = useState('');

  const [studentForm, setStudentForm] = useState({ id: '', name: '', branch: '', age: '', phone: '', password: '', monthlyFee: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Credentials modal — shown after a new student is successfully created
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newCredentials, setNewCredentials] = useState<CreatedStudentCredentials | null>(null);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [branchForm, setBranchForm] = useState({ id: '', name: '', location: '', coach: '', phone: '' });
  const [isEditingBranch, setIsEditingBranch] = useState(false);
  const [isSavingBranch, setIsSavingBranch] = useState(false);
  const [branchSaveError, setBranchSaveError] = useState<string | null>(null);

  // Sync data on load
  useEffect(() => {
    const init = async () => {
      try {
        const appUser = await getCurrentUser();
        if (!appUser || appUser.role !== 'admin') {
          router.push('/admin/login');
          return;
        }
        await refreshAll();
      } catch (err) {
        console.error('Admin auth init failed:', err);
        router.push('/admin/login');
      }
    };
    init();
  }, [router]);

  const fetchBranches = async () => {
    try {
      const snap = await getDocs(collection(db, 'branches'));
      const branchList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBranches(branchList);
      return branchList;
    } catch (err) {
      console.error('Error fetching branches:', err);
      return [];
    }
  };

  const refreshAll = async () => {
    const [studentList, branchList] = await Promise.all([getAllStudents(), fetchBranches()]);
    // Sort students by newest first based on createdAt
    const sortedStudents = studentList.sort((a, b) => {
      const getMs = (val: any) => {
        if (!val) return 0;
        if (typeof val === 'string') return new Date(val).getTime();
        if (val.toMillis) return val.toMillis();
        if (val.seconds) return val.seconds * 1000;
        return 0;
      };
      return getMs(b.createdAt) - getMs(a.createdAt);
    });
    setStudents(sortedStudents);
    await refreshFees(sortedStudents);
  };

  const refreshFees = async (studentList?: any[]) => {
    const list = studentList || students;
    const allFeeArrays = await Promise.all(list.map(s => getStudentFees(s.id)));
    setAllFees(allFeeArrays.flat());
  };

  const openStudentModal = (student: any = null) => {
    if (student) {
      setIsEditing(true);
      setStudentForm({ id: student.id, name: student.name, branch: student.branchId || student.branch, age: student.age || '', phone: student.phone || '', password: student.password || '', monthlyFee: student.monthlyFee ? String(student.monthlyFee) : '' });
    } else {
      setIsEditing(false);
      setStudentForm({ id: '', name: '', branch: '', age: '', phone: '', password: '', monthlyFee: '' });
    }
    setShowStudentModal(true);
  };

  const handleSaveStudent = async () => {
    setCreateError(null);
    const selectedBranch = branches.find((b: any) => b.id === studentForm.branch);
    const branchName = selectedBranch ? selectedBranch.name : studentForm.branch;

    if (isEditing) {
      // --- EDIT existing student (no Auth change needed) ---
      const existing = students.find((s: any) => s.id === studentForm.id || s.studentId === studentForm.id);
      const uid = existing?.uid || studentForm.id;
      const studentToSave: Partial<StudentProfile> & { uid: string } = {
        uid,
        role: 'student',
        studentId: studentForm.id,
        name: studentForm.name || 'New Student',
        email: existing?.email || `${studentForm.id}@smartwheels.com`,
        branchId: studentForm.branch || '',
        branch: branchName || '',
        age: studentForm.age,
        phone: studentForm.phone,
        monthlyFee: parseInt(studentForm.monthlyFee) || 6000,
      };
      await saveStudent(studentToSave);
      await refreshAll();
      setShowStudentModal(false);
      return;
    }

    // --- CREATE new student via Firebase Auth ---
    if (!studentForm.phone) { setCreateError('Phone number is required to generate the student email.'); return; }
    if (!studentForm.password || studentForm.password.length < 6) { setCreateError('Password must be at least 6 characters.'); return; }
    if (!studentForm.id) { setCreateError('Student ID is required.'); return; }
    if (!studentForm.name) { setCreateError('Student name is required.'); return; }

    setIsCreatingStudent(true);
    try {
      const credentials = await createStudentAccount({
        studentId: studentForm.id,
        name: studentForm.name,
        phone: studentForm.phone,
        password: studentForm.password,
        branchId: studentForm.branch || '',
        branch: branchName || '',
        age: studentForm.age,
        monthlyFee: parseInt(studentForm.monthlyFee) || 6000,
      });

      await refreshAll();
      setShowStudentModal(false);
      setNewCredentials(credentials);
      setShowCredentialsModal(true);
    } catch (err: any) {
      console.error('[handleSaveStudent] Firebase error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setCreateError(`A student with phone ${studentForm.phone} already has an account.`);
      } else if (err.code === 'auth/weak-password') {
        setCreateError('Password is too weak. Use at least 6 characters.');
      } else {
        setCreateError(err.message || 'Failed to create student account. Please try again.');
      }
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleDeleteStudent = async (student: any) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteStudent(student.uid, student.id || student.studentId);
      const updated = await getAllStudents();
      setStudents(updated);
    }
  };

  const openBranchModal = (branch: any = null) => {
    if (branch) {
      setIsEditingBranch(true);
      setBranchForm({ id: branch.id, name: branch.name, location: branch.location || '', coach: branch.coach || '', phone: branch.phone || '' });
    } else {
      setIsEditingBranch(false);
      setBranchForm({ id: '', name: '', location: '', coach: '', phone: '' });
    }
    setBranchSaveError(null);
    setShowBranchModal(true);
  };

  const handleCreateBranch = async () => {
    // Validate
    if (!branchForm.name.trim()) {
      setBranchSaveError('Branch name is required.');
      return;
    }
    setBranchSaveError(null);
    setIsSavingBranch(true);
    try {
      if (isEditingBranch) {
        // UPDATE existing branch
        await updateBranch({
          id: branchForm.id,
          name: branchForm.name.trim(),
          location: branchForm.location,
          coach: branchForm.coach,
          phone: branchForm.phone,
        });
      } else {
        // CREATE new branch via Firestore inline call per requirements
        await addDoc(collection(db, "branches"), {
          name: branchForm.name.trim(),
          location: branchForm.location,
          coach: branchForm.coach,
          phone: branchForm.phone,
        });
      }
      
      // Close modal & clear form
      setShowBranchModal(false);
      setBranchForm({ id: '', name: '', location: '', coach: '', phone: '' });
      
      // Refresh branch list (call fetchBranches())
      await fetchBranches();
    } catch (err: any) {
      console.error('[handleCreateBranch] Firestore error:', err);
      setBranchSaveError(err.message || 'Failed to save branch. Please try again.');
    } finally {
      setIsSavingBranch(false);
    }
  };

  const handleDeleteBranch = async (e: any, branchId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this branch?')) {
      await deleteBranchFS(branchId);
      await fetchBranches();
    }
  };

  // --- Fee helpers ---
  const getCurrentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatMonthLabel = (m: string) => {
    const [y, mo] = m.split('-');
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${months[parseInt(mo) - 1]} ${y}`;
  };

  const getStudentCurrentMonthFee = (studentId: string) => {
    const currentMonth = getCurrentMonth();
    const fee = allFees.find(f => f.studentId === studentId && f.month === currentMonth);
    return fee || null;
  };

  const getStudentFeeHistory = (studentId: string) => {
    const currentMonth = getCurrentMonth();
    const [cy, cm] = currentMonth.split('-').map(Number);
    const sObj = students.find(s => s.id === studentId);
    const feeAmount = sObj?.monthlyFee || 6000;
    
    const allMonthsToShow = new Set<string>();
    
    // Add all months from Launch (April 2026) to Current Month
    const d = new Date(2026, 3, 1);
    const end = new Date(cy, cm - 1, 1);
    while (d.getTime() <= end.getTime()) {
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      allMonthsToShow.add(m);
      d.setMonth(d.getMonth() + 1);
    }
    
    allMonthsToShow.add(currentMonth);

    const studentFeesList = allFees.filter(f => f.studentId === studentId);
    studentFeesList.forEach(f => {
      if (f.month > currentMonth) {
        allMonthsToShow.add(f.month);
      }
    });

    const history = Array.from(allMonthsToShow).map(m => {
      const record = studentFeesList.find(f => f.month === m);
      return record || { month: m, total: feeAmount, paid: 0, status: 'pending' };
    });

    return history.sort((a, b) => b.month.localeCompare(a.month));
  };

  const openPaymentModal = (studentId: string) => {
    const currentMonth = getCurrentMonth();
    const existing = allFees.find((f: any) => f.studentId === studentId && f.month === currentMonth);
    const sObj = students.find(s => s.id === studentId);
    setPaymentForm({
      studentId,
      month: currentMonth,
      total: existing ? String(existing.total) : String(sObj?.monthlyFee || 6000),
      paid: '',
      duration: '1',
      customDuration: '2'
    });
    setShowPaymentModal(true);
  };

  const getMonthsFromStart = (startMonth: string, count: number) => {
    const [y, m] = startMonth.split('-').map(Number);
    const months: string[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(y, m - 1 + i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
  };

  const handleAddPayment = async () => {
    const rawTotal = parseInt(paymentForm.total);
    const parsedTotal = !isNaN(rawTotal) ? rawTotal : undefined;
    const addPaid = parseInt(paymentForm.paid) || 0;
    const durationOffset = paymentForm.duration === 'custom' ? parseInt(paymentForm.customDuration) : parseInt(paymentForm.duration);
    const duration = durationOffset || 1;
    const months = getMonthsFromStart(paymentForm.month, duration);
    const studentId = paymentForm.studentId;
    const student = students.find((s: any) => s.id === studentId || s.studentId === studentId);
    const branchId = student?.branchId || student?.branch || '';

    if (duration > 1) {
      const monthlyFeeForBulk = parsedTotal !== undefined ? parsedTotal : (student?.monthlyFee || 6000);
      await payMultipleMonths(studentId, branchId, paymentForm.month, duration, monthlyFeeForBulk);
    } else {
      await updateFee(studentId, paymentForm.month, addPaid, parsedTotal);
    }

    await refreshFees();
    setShowPaymentModal(false);
  };

  const handleMarkAsPaid = async (studentId: string) => {
    const currentMonth = getCurrentMonth();
    const existing = allFees.find((f: any) => f.studentId === studentId && f.month === currentMonth);
    const student = students.find((s: any) => s.uid === studentId || s.studentId === studentId);
    const resolvedStudentId = student?.studentId || student?.id || studentId;
    const branchId = student?.branchId || '';
    const total = existing ? existing.total : (student?.monthlyFee || 6000);
    await updateStudentFee(resolvedStudentId, branchId, currentMonth, total, total);
    await refreshFees();
  };

  const openEditFeeModal = (e: React.MouseEvent, studentId: string, studentName: string, feeRow: any) => {
    e.stopPropagation();
    setEditFeeStudentName(studentName);
    setEditFeeForm({
      studentId,
      month: feeRow.month,
      total: String(feeRow.total || 0),
      paid: String(feeRow.paid || 0),
    });
    setShowEditFeeModal(true);
  };

  const handleSaveEditFee = async () => {
    const total = parseInt(editFeeForm.total) || 0;
    const paid = parseInt(editFeeForm.paid) || 0;
    const student = students.find((s: any) => s.uid === editFeeForm.studentId || s.studentId === editFeeForm.studentId);
    const resolvedStudentId = student?.studentId || student?.id || editFeeForm.studentId;
    const branchId = student?.branchId || '';
    await updateStudentFee(resolvedStudentId, branchId, editFeeForm.month, total, paid);
    await refreshFees();
    setShowEditFeeModal(false);
  };

  const handleDeleteFeeRow = async (e: React.MouseEvent, studentId: string, feeRow: any) => {
    e.stopPropagation();
    const student = students.find((s: any) => s.uid === studentId || s.studentId === studentId);
    const resolvedStudentId = student?.studentId || student?.id || studentId;
    if (window.confirm(`Delete ${formatMonthLabel(feeRow.month)} fee record from database?`)) {
      await deleteFeeRecord(resolvedStudentId, feeRow.month);
      await refreshFees();
    }
  };

  const handleLogout = async () => {
    try { await authLogout(); } catch (_) {}
    router.push('/admin/login');
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'branches', label: 'Branches', icon: GitBranch },
  ];

  const totalStudents = students.length;
  const pendingFees = allFees.reduce((a: number, f: any) => a + (f.balance || 0), 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ 
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50, 
        width: 260, background: 'var(--bg-secondary)', borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: 'var(--space-4)',
      }}>
        {/* Sidebar Content: Logo + Menu */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0 }}>Smart Wheels</h2>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Academy Admin</div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md-hidden" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setIsSidebarOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', 
              background: tab === t.id ? 'var(--accent-red)' : 'transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.2s',
              textAlign: 'left',
              boxShadow: tab === t.id ? '0 4px 20px rgba(225, 6, 0, 0.3)' : 'none'
            }}>
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        {/* Topbar */}
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'var(--bg-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button onClick={() => setIsSidebarOpen(true)} className="menu-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <Menu size={24} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.8rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Admin <span className="gradient-text">Dashboard</span></h1>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px', gap: 8 }}>
            <LogOut size={16} /> <span className="hide-on-mobile">Logout</span>
          </button>
        </header>

        <div style={{ padding: 'var(--space-4)', flex: 1, overflowX: 'hidden' }}>
          {/* Overview Tab */}
          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                {[
                  { label: 'Total Students', value: totalStudents, icon: Users, color: '#E10600', action: () => setTab('students') },
                  { label: 'Branches', value: branches.length, icon: GitBranch, color: '#C0C0C0', action: () => setTab('branches') },
                ].map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    onClick={m.action}
                    className="card hover-card-grow" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)', background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <m.icon size={24} color={m.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>{m.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Action Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => openStudentModal()} style={{ fontSize: '0.85rem' }}><Plus size={16} /> Add Student</button>
                <button className="btn btn-secondary" onClick={() => setTab('branches')} style={{ fontSize: '0.85rem' }}><Plus size={16} /> Create Batch</button>
                <button className="btn btn-secondary" onClick={() => setTab('fees')} style={{ fontSize: '0.85rem' }}><DollarSign size={16} /> Update Fees</button>
              </div>

              {/* Recent students table */}
              <div className="card" style={{ padding: 'var(--space-4)', overflowX: 'auto' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>Recent Students</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr>
                      {['ID', 'Name', 'Branch', 'Age', 'Phone Number', 'Password'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 8px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, visibleRecent).map(s => (
                      <tr key={s.id} className="hover-row" style={{ transition: 'background 0.2s', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: 'var(--accent-red)', fontWeight: 600 }}>{s.id}</td>
                        <td style={{ padding: '14px 8px', fontSize: '0.85rem' }}>{s.name}</td>
                        <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.branch}</td>
                        <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.age || 'N/A'}</td>
                        <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.phone}</td>
                        <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.password || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {students.length > visibleRecent && (
                  <div style={{ padding: 'var(--space-3)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button 
                      onClick={() => setVisibleRecent(students.length)} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ChevronDown size={16} /> Load All {students.length} Students
                    </button>
                  </div>
                )}
                {visibleRecent > 5 && (
                  <div style={{ padding: 'var(--space-3)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button 
                      onClick={() => setVisibleRecent(5)} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ChevronUp size={16} /> Show Less
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Students Tab */}
          {tab === 'students' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                  </div>
                  <select className="form-input" value={branchFilter} onChange={e => setBranchFilter(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={() => openStudentModal()} style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}><Plus size={16} /> Add Student</button>
              </div>

              <div className="card" style={{ padding: 'var(--space-4)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                  <thead>
                    <tr>
                      {['ID', 'Name', 'Branch', 'Age', 'Phone', 'Fee', 'Password', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 8px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter(s => {
                        console.log("Student:", s.name, s.branchId);
                        if (!branchFilter) return true;
                        const filterBranchName = branches.find((b: any) => b.id === branchFilter)?.name;
                        return s.branchId === branchFilter || 
                               s.branchId === filterBranchName || 
                               (s.branch && filterBranchName && s.branch.toLowerCase() === filterBranchName.toLowerCase());
                      })
                      .filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.id || '').toLowerCase().includes(search.toLowerCase()))
                      .map(s => (
                        <tr key={s.id} className="hover-row" style={{ transition: 'background 0.2s', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: 'var(--accent-red)', fontWeight: 600 }}>{s.id}</td>
                          <td style={{ padding: '14px 8px', fontSize: '0.85rem' }}>{s.name}</td>
                          <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.branch}</td>
                          <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.age || 'N/A'}</td>
                          <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.phone}</td>
                          <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#4CAF50', fontWeight: 600 }}>₹{(s.monthlyFee || 6000).toLocaleString()}</td>
                          <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.password || 'N/A'}</td>
                          <td style={{ padding: '14px 8px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => openStudentModal(s)} style={{ background: 'rgba(255,212,0,0.1)', border: '1px solid rgba(255,212,0,0.2)', color: '#FFD400', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-btn-yellow"><Edit size={14} /></button>
                              <button onClick={() => handleDeleteStudent(s)} style={{ background: 'rgba(225,6,0,0.1)', border: '1px solid rgba(225,6,0,0.2)', color: '#E10600', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-btn-red"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}



          {/* Fees Tab */}
          {tab === 'fees' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Branch filter */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                <select className="form-input" value={feeBranchFilter} onChange={e => setFeeBranchFilter(e.target.value)} style={{ width: 'auto', minWidth: 200 }}>
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {students
                  .filter(s => {
                    if (!feeBranchFilter) return true;
                    const filterBranchName = branches.find((b: any) => b.id === feeBranchFilter)?.name;
                    return s.branchId === feeBranchFilter || 
                           s.branchId === filterBranchName || 
                           (s.branch && filterBranchName && s.branch.toLowerCase() === filterBranchName.toLowerCase());
                  })
                  .map((s, i) => {
                    const currentFee = getStudentCurrentMonthFee(s.id);
                    const isPaid = currentFee ? currentFee.status === 'paid' : false;
                    const pendingAmt = currentFee ? Math.max(0, (currentFee.total || 0) - (currentFee.paid || 0)) : 0;
                    const isExpanded = expandedFeeStudent === s.id;
                    const history = getStudentFeeHistory(s.id);

                    return (
                      <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        {/* Student Row */}
                        <div
                          onClick={() => { setExpandedFeeStudent(isExpanded ? null : s.id); setFeeHistoryLimit(5); }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 20px', cursor: 'pointer',
                            background: isExpanded ? 'rgba(225,6,0,0.06)' : 'var(--bg-secondary)',
                            border: isExpanded ? '1px solid rgba(225,6,0,0.2)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: isExpanded ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(225,6,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-red)' }}>
                              {(s.name || '?')[0]}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.id} · {s.branch || s.branchId}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            {!currentFee ? (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No fee record</span>
                            ) : isPaid ? (
                              <span style={{ padding: '4px 14px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(76,175,80,0.15)', color: '#4CAF50', letterSpacing: '0.06em' }}>PAID</span>
                            ) : (
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ padding: '4px 14px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(225,6,0,0.15)', color: '#E10600', letterSpacing: '0.06em' }}>PENDING</span>
                                <div style={{ fontSize: '0.78rem', color: '#E10600', marginTop: 4, fontWeight: 600 }}>₹{pendingAmt.toLocaleString()} pending</div>
                              </div>
                            )}
                            {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                          </div>
                        </div>

                        {/* Expanded Card */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid rgba(225,6,0,0.2)', borderTop: 'none',
                              borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                              padding: '20px',
                            }}
                          >
                            {/* Current Month Details */}
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', letterSpacing: '0.06em', marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
                                {formatMonthLabel(getCurrentMonth())} — Current Month
                              </h4>
                              {currentFee ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
                                  {[
                                    { label: 'Total Fee', value: `₹${currentFee.total.toLocaleString()}`, color: 'var(--text-primary)' },
                                    { label: 'Paid', value: `₹${currentFee.paid.toLocaleString()}`, color: '#4CAF50' },
                                    { label: 'Balance', value: `₹${Math.max(0, (currentFee.total || 0) - (currentFee.paid || 0)).toLocaleString()}`, color: ((currentFee.total || 0) - (currentFee.paid || 0)) > 0 ? '#E10600' : 'var(--text-muted)' },
                                    { label: 'Status', value: currentFee.status === 'paid' ? 'PAID' : 'PENDING', color: currentFee.status === 'paid' ? '#4CAF50' : '#E10600' },
                                  ].map((item, idx) => (
                                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                                      <div style={{ fontSize: '1rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>No fee record for this month yet.</div>
                              )}
                            </div>

                            {/* Monthly Fee History */}
                            {history.length > 0 && (
                              <div style={{ marginBottom: 'var(--space-4)' }}>
                                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', letterSpacing: '0.06em', marginBottom: 'var(--space-2)', color: 'var(--text-muted)' }}>Monthly Fee History <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'inherit', fontWeight: 400 }}>({history.length})</span></h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {history.slice(0, feeHistoryLimit).map((h: any) => {
                                    const isFuture = h.month > getCurrentMonth();
                                    return (
                                      <div key={h.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: isFuture ? 'rgba(76,175,80,0.04)' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{formatMonthLabel(h.month)}</span>
                                          {isFuture && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#4CAF50', textTransform: 'uppercase', background: 'rgba(76,175,80,0.1)', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>Upcoming</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{h.total > 0 ? `₹${h.total.toLocaleString()}` : '₹0'}</span>
                                          <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, background: h.status === 'paid' ? 'rgba(76,175,80,0.15)' : 'rgba(225,6,0,0.15)', color: h.status === 'paid' ? '#4CAF50' : '#E10600', whiteSpace: 'nowrap' }}>{h.status === 'paid' ? 'PAID' : 'PENDING'}</span>
                                          {/* Edit button */}
                                          <button
                                            onClick={(e) => openEditFeeModal(e, s.id, s.name, h)}
                                            title="Edit fee record"
                                            style={{ background: 'rgba(255,212,0,0.1)', border: '1px solid rgba(255,212,0,0.2)', color: '#FFD400', borderRadius: 'var(--radius-sm)', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                                            className="hover-btn-yellow"
                                          ><Pencil size={12} /></button>
                                          {/* Delete/Reset button */}
                                          <button
                                            onClick={(e) => handleDeleteFeeRow(e, s.id, h)}
                                            title="Reset fee record"
                                            style={{ background: 'rgba(225,6,0,0.1)', border: '1px solid rgba(225,6,0,0.2)', color: '#E10600', borderRadius: 'var(--radius-sm)', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                                            className="hover-btn-red"
                                          ><Trash2 size={12} /></button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {feeHistoryLimit < history.length && (
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setFeeHistoryLimit(prev => prev + 5); }}
                                    style={{ width: '100%', marginTop: 8, padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                                    Load More ({history.length - feeHistoryLimit} remaining)
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                              <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); openPaymentModal(s.id); }} style={{ fontSize: '0.8rem', padding: '10px 18px' }}>
                                <Plus size={14} /> Add Payment
                              </button>
                              {currentFee && currentFee.status !== 'paid' && (
                                <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(s.id); }} style={{ fontSize: '0.8rem', padding: '10px 18px', borderColor: 'rgba(76,175,80,0.3)', color: '#4CAF50' }}>
                                  <Check size={14} /> Mark as Paid
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* Branches Tab */}
          {tab === 'branches' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
                <button className="btn btn-primary" onClick={() => openBranchModal()} style={{ fontSize: '0.8rem', padding: '8px 16px', gap: 6 }}><Plus size={14} /> Add Branch</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-3)' }}>
                {branches.map((b, i) => (
                  <motion.div key={b.id} className="card hover-card-grow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} 
                    onClick={() => { setBranchFilter(b.name); setTab('students'); }}
                    style={{ padding: 'var(--space-4)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '0.06em' }}>{b.name}</h4>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={(e) => handleDeleteBranch(e, b.id)} style={{ background: 'rgba(225,6,0,0.1)', border: '1px solid rgba(225,6,0,0.2)', color: 'var(--accent-red)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', transition: 'all 0.2s' }}><Trash2 size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); openBranchModal(b); }} style={{ background: 'rgba(255,212,0,0.1)', border: '1px solid rgba(255,212,0,0.2)', color: '#FFD400', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-btn-yellow"><Edit size={14} /></button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>{b.location || 'No location'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>{b.phone || ''}</div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <div><span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--accent-red)' }}>{students.filter(s => s.branch === b.name).length}</span><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>Students</span></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Student Assign Modal */}
        {showStudentModal && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
            onClick={() => setShowStudentModal(false)}
          >
            {/* Backdrop */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 0 }} />
            {/* Modal Card — uses modal-card class to disable card hover transforms */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card modal-card"
              onClick={(e: any) => e.stopPropagation()}
              style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 500, background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'visible' }}
            >
              {/* All content wrapped at z-index 1 to sit above card::before */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'var(--space-3)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>{isEditing ? 'Edit Student' : 'Add Student'}</h3>
                  <button type="button" onClick={() => { setShowStudentModal(false); setCreateError(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', zIndex: 2 }}><X size={20} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveStudent(); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student ID</label>
                    <input autoFocus={!isEditing} type="text" className="form-input" placeholder="e.g. SW-1001" value={studentForm.id} onChange={e => setStudentForm({...studentForm, id: e.target.value})} disabled={isEditing} required={!isEditing} style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1, opacity: isEditing ? 0.6 : 1, cursor: isEditing ? 'not-allowed' : 'text' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Name</label>
                    <input type="text" className="form-input" placeholder="Enter full name" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} required style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age</label>
                      <input type="number" className="form-input" placeholder="Enter age" value={studentForm.age} onChange={e => setStudentForm({...studentForm, age: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
                      <input type="text" className="form-input" placeholder="Enter phone number" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />

                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                      <input type="password" className="form-input" placeholder="Enter password" value={studentForm.password} onChange={e => setStudentForm({...studentForm, password: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Branch</label>
                      <select className="form-input" value={studentForm.branch} onChange={e => setStudentForm({...studentForm, branch: e.target.value})} required style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
                        <option value="">Select branch</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Fee (₹)</label>
                    <input type="number" className="form-input" placeholder="e.g. 6000" value={studentForm.monthlyFee} onChange={e => setStudentForm({...studentForm, monthlyFee: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />
                  </div>
                  {/* Error Banner */}
                  {createError && (
                    <div style={{ background: 'rgba(225,6,0,0.1)', border: '1px solid rgba(225,6,0,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.82rem', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: 8 }}>
                      ⚠️ {createError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isCreatingStudent}
                    style={{ marginTop: 'var(--space-3)', width: '100%', padding: '14px', position: 'relative', zIndex: 1, opacity: isCreatingStudent ? 0.7 : 1, cursor: isCreatingStudent ? 'not-allowed' : 'pointer' }}
                  >
                    {isCreatingStudent ? '⏳ Creating Account...' : isEditing ? 'Save Changes' : 'Create Student Account'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Fee Row Modal */}
        {showEditFeeModal && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
            onClick={() => setShowEditFeeModal(false)}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 0 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card modal-card"
              onClick={(e: any) => e.stopPropagation()}
              style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'visible' }}
            >
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'var(--space-3)' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '0.05em', margin: 0 }}>Edit Fee Record</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{editFeeStudentName} · {formatMonthLabel(editFeeForm.month)}</div>
                  </div>
                  <button type="button" onClick={() => setShowEditFeeModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center' }}><X size={20} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEditFee(); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee Total (₹)</label>
                    <input autoFocus type="number" className="form-input" placeholder="e.g. 6000" value={editFeeForm.total} onChange={e => setEditFeeForm({ ...editFeeForm, total: e.target.value })} required style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Paid (₹)</label>
                    <input type="number" className="form-input" placeholder="e.g. 6000" value={editFeeForm.paid} onChange={e => setEditFeeForm({ ...editFeeForm, paid: e.target.value })} required style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  {/* Preview */}
                  {editFeeForm.total && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.82rem' }}>
                      Balance: <strong style={{ color: (parseInt(editFeeForm.total)||0) - (parseInt(editFeeForm.paid)||0) > 0 ? '#E10600' : '#4CAF50' }}>
                        ₹{((parseInt(editFeeForm.total)||0) - (parseInt(editFeeForm.paid)||0)).toLocaleString()}
                      </strong>
                      &nbsp;·&nbsp;Status: <strong style={{ color: (parseInt(editFeeForm.total)||0) - (parseInt(editFeeForm.paid)||0) <= 0 ? '#4CAF50' : '#E10600' }}>
                        {(parseInt(editFeeForm.total)||0) - (parseInt(editFeeForm.paid)||0) <= 0 ? 'PAID' : 'PENDING'}
                      </strong>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-2)', width: '100%', padding: '14px' }}>Save Changes</button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Payment Modal */}
        {showPaymentModal && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
            onClick={() => setShowPaymentModal(false)}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 0 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card modal-card"
              onClick={(e: any) => e.stopPropagation()}
              style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'visible' }}
            >
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'var(--space-3)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>Add Payment</h3>
                  <button type="button" onClick={() => setShowPaymentModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', zIndex: 2 }}><X size={20} /></button>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                  Student: <strong style={{ color: 'var(--text-primary)' }}>{students.find(s => s.id === paymentForm.studentId)?.name || paymentForm.studentId}</strong>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleAddPayment(); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                      {[{ label: 'Monthly', val: '1' }, { label: 'Quarterly', val: '3' }, { label: 'Yearly', val: '12' }, { label: 'Custom', val: 'custom' }].map(opt => (
                        <button key={opt.val} type="button" onClick={() => setPaymentForm({ ...paymentForm, duration: opt.val })}
                          style={{
                            padding: '8px 4px', fontSize: '0.72rem', fontWeight: 600, borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            border: paymentForm.duration === opt.val ? '1px solid var(--accent-red)' : '1px solid rgba(255,255,255,0.1)',
                            background: paymentForm.duration === opt.val ? 'rgba(225,6,0,0.15)' : 'rgba(255,255,255,0.03)',
                            color: paymentForm.duration === opt.val ? 'var(--accent-red)' : 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                          }}
                        >{opt.label}</button>
                      ))}
                    </div>
                    {paymentForm.duration === 'custom' && (
                      <input type="number" min="2" max="24" className="form-input" placeholder="Number of months" value={paymentForm.customDuration} onChange={e => setPaymentForm({...paymentForm, customDuration: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', marginTop: 8 }} />
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starting Month</label>
                    <select className="form-input" value={paymentForm.month} onChange={e => {
                      const newMonth = e.target.value;
                      const existing = allFees.find((f: any) => f.studentId === paymentForm.studentId && f.month === newMonth);
                      setPaymentForm({ ...paymentForm, month: newMonth, total: existing ? String(existing.total) : '6000' });
                    }} style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
                      {(() => {
                        const minStart = new Date(2026, 2, 1);
                        const now = new Date();
                        const months: string[] = [];
                        const d = new Date(now);
                        while (months.length < 12 && d >= minStart) {
                          months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                          d.setMonth(d.getMonth() - 1);
                        }
                        return months.map(val => <option key={val} value={val}>{formatMonthLabel(val)}</option>);
                      })()}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee Per Month (₹)</label>
                    <input type="number" className="form-input" placeholder="e.g. 6000" value={paymentForm.total} onChange={e => setPaymentForm({...paymentForm, total: e.target.value})} required style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />
                  </div>
                  {paymentForm.duration === '1' && (
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Amount (₹)</label>
                      <input autoFocus type="number" className="form-input" placeholder="Amount being paid now" value={paymentForm.paid} onChange={e => setPaymentForm({...paymentForm, paid: e.target.value})} required style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />
                    </div>
                  )}
                  {(() => {
                    const activeDuration = paymentForm.duration === 'custom' ? parseInt(paymentForm.customDuration) || 1 : parseInt(paymentForm.duration) || 1;
                    return (
                      <>
                        {activeDuration > 1 && (
                          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{activeDuration} months</strong> will be marked as <strong style={{ color: '#4CAF50' }}>PAID</strong>
                            <br /><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatMonthLabel(paymentForm.month)} → {formatMonthLabel(getMonthsFromStart(paymentForm.month, activeDuration).slice(-1)[0] || paymentForm.month)}</span>
                            <br /><span style={{ color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: 600, marginTop: 4, display: 'inline-block' }}>Total: ₹{((parseInt(paymentForm.total) || 0) * activeDuration).toLocaleString()}</span>
                          </div>
                        )}
                        <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-2)', width: '100%', padding: '14px', position: 'relative', zIndex: 1 }}>
                          {activeDuration > 1 ? `Pay ${activeDuration} Months` : 'Record Payment'}
                        </button>
                      </>
                    );
                  })()}
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Branch Modal */}
        {showBranchModal && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
            onClick={() => setShowBranchModal(false)}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 0 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card modal-card"
              onClick={(e: any) => e.stopPropagation()}
              style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 500, background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'visible' }}
            >
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'var(--space-3)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>{isEditingBranch ? 'Edit Branch' : 'Add Branch'}</h3>
                  <button type="button" onClick={() => setShowBranchModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', zIndex: 2 }}><X size={20} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateBranch(); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Branch Name</label>
                    <input autoFocus type="text" className="form-input" placeholder="Enter branch name" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} required style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                    <input type="text" className="form-input" placeholder="Enter location" value={branchForm.location} onChange={e => setBranchForm({...branchForm, location: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-3)', width: '100%', padding: '14px', position: 'relative', zIndex: 1 }}>{isEditingBranch ? 'Update Branch' : 'Create Branch'}</button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { margin-left: 0; }
          .menu-btn, .md-hidden { display: block !important; }
        }
        @media (min-width: 1025px) {
          .admin-sidebar { transform: translateX(0); }
          .admin-main { margin-left: 260px !important; }
          .menu-btn, .md-hidden { display: none !important; }
        }
        @media (max-width: 640px) {
          .hide-on-mobile { display: none; }
        }
        .hover-row:hover { background: rgba(255,255,255,0.03); }
        .hover-btn-yellow:hover { background: rgba(255,212,0,0.2) !important; }
        .hover-btn-red:hover { background: rgba(225,6,0,0.2) !important; }
        .hover-card-grow:active { transform: translateY(-4px) scale(0.98); }
      `}} />
    </div>
  );
}
