'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, Users, ChevronLeft, ChevronRight, Check, X, Save, MapPin, FileText } from 'lucide-react';
import { getBranches, getUsers, getAttendance, saveAttendance, AttendanceRecord, User } from '@/utils/mockApi';

export default function AttendanceSetup() {
  const router = useRouter();
  const [instructorBranchId, setInstructorBranchId] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null); // branch name
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // studentId -> 'present' | 'absent'
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent'>>({});
  const [saved, setSaved] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [reportDate, setReportDate] = useState<Date>(new Date());
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);

  const monthKey = `${reportDate.getFullYear()}-${(reportDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const monthName = reportDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Auth check & load instructor branch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const auth = localStorage.getItem('instructorAuth');
    if (auth !== 'true') {
      router.push('/admin/login');
      return;
    }
    const branchId = localStorage.getItem('instructorBranch') || '';
    setInstructorBranchId(branchId);

    // Set default date to today
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000).toISOString().split('T')[0];
    setSelectedDate(localDate);
  }, [router]);

  // Reload attendance from localStorage
  const refreshAttendance = () => {
    setAllAttendance(getAttendance());
  };

  useEffect(() => {
    setAllStudents(getUsers().filter(u => u.role === 'student'));
    refreshAttendance();
  }, []);

  // Students filtered by current branch — support both branchId as ID ("B1") and branchId as name ("Mumbai Central")
  const currentStudents = useMemo(() => {
    if (!selectedBranchId && !selectedBranch) return [];
    return allStudents.filter(s => {
      const stu = s as any;
      return (
        s.branchId === selectedBranchId ||       // matches if stored as ID
        s.branchId === selectedBranch ||          // matches if stored as name
        stu.branch === selectedBranch             // matches legacy 'branch' field
      );
    });
  }, [allStudents, selectedBranchId, selectedBranch]);

  // When branch selected, pre-fill attendance from saved data for selected date
  useEffect(() => {
    if (!selectedBranchId || !selectedDate) return;
    const dateRecord = allAttendance.find(
      r => r.branchId === selectedBranchId && r.date === selectedDate
    );
    const initial: Record<string, 'present' | 'absent'> = {};
    currentStudents.forEach(s => {
      if (dateRecord) {
        const found = dateRecord.attendance.find(a => a.studentId === s.id);
        if (found) initial[s.id] = found.status;
        // If no saved record for this student on this date, leave unselected
      }
      // New date with no records: leave empty — instructor must click
    });
    setAttendanceRecords(initial);
    setSaved(false);
  }, [selectedBranchId, selectedDate, currentStudents, allAttendance]);

  const handleLogout = () => {
    localStorage.removeItem('instructorAuth');
    localStorage.removeItem('instructorBranch');
    router.push('/admin/login');
  };

  const handleSetAttendance = (studentId: string, status: 'present' | 'absent') => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const markAll = (status: 'present' | 'absent') => {
    const updated: Record<string, 'present' | 'absent'> = {};
    currentStudents.forEach(s => { updated[s.id] = status; });
    setAttendanceRecords(updated);
    setSaved(false);
  };

  const handleSaveAttendance = () => {
    if (!selectedDate || !selectedBranchId) return;
    const attendanceArray = currentStudents.map(s => ({
      studentId: s.id,
      status: attendanceRecords[s.id] || 'absent',
    }));
    saveAttendance(selectedBranchId, selectedDate, attendanceArray);
    refreshAttendance();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleBack = () => {
    if (selectedBranch) {
      setSelectedBranch(null);
      setSelectedBranchId('');
    } else {
      router.push('/admin/login');
    }
  };

  // Build monthly report: for each student, for sessions 1-8 (by session number in month)
  const monthlyReportData = useMemo(() => {
    if (!selectedBranchId) return [];
    // Get all records for this branch in this month
    const monthRecords = allAttendance
      .filter(r => r.branchId === selectedBranchId && r.month === monthKey)
      .sort((a, b) => a.sessionNumber - b.sessionNumber);

    return currentStudents.map(student => {
      const sessions = Array.from({ length: 8 }, (_, i) => {
        const sessionNum = i + 1;
        const rec = monthRecords.find(r => r.sessionNumber === sessionNum);
        if (!rec) return null; // not conducted yet
        const found = rec.attendance.find(a => a.studentId === student.id);
        return found ? found.status : 'absent';
      });
      const presentCount = sessions.filter(s => s === 'present').length;
      return { student, sessions, presentCount };
    });
  }, [allAttendance, selectedBranchId, monthKey, currentStudents]);

  // Handle toggling a session in the monthly report edit mode
  const handleToggleSessionReport = (studentId: string, sessionIndex: number) => {
    const monthRecords = allAttendance
      .filter(r => r.branchId === selectedBranchId && r.month === monthKey)
      .sort((a, b) => a.sessionNumber - b.sessionNumber);

    const sessionNum = sessionIndex + 1;
    const rec = monthRecords.find(r => r.sessionNumber === sessionNum);
    if (!rec || !rec.date) return; // can't edit if session wasn't conducted

    // Find current status and toggle
    const updated = rec.attendance.map(a => {
      if (a.studentId === studentId) {
        return { ...a, status: (a.status === 'present' ? 'absent' : 'present') as 'present' | 'absent' };
      }
      return a;
    });
    saveAttendance(selectedBranchId, rec.date, updated);
    refreshAttendance();
  };

  const branches = getBranches();
  // Show all branches — instructor can mark attendance for any branch
  const availableBranches = branches;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button onClick={handleBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={20} /> <span style={{ fontSize: '0.9rem' }}>Back</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Attendance <span className="gradient-text">Setup</span></h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor Portal</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px', gap: 8 }}>
          <LogOut size={16} /> <span className="hide-on-mobile">Logout</span>
        </button>
      </header>

      <main style={{ padding: 'var(--space-5)', flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          {!selectedBranch ? (
            // Branch Selection
            <motion.div key="branch-selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', margin: 'auto' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,212,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                <MapPin size={36} color="var(--accent-yellow)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 'var(--space-2)' }}>Select Branch</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto var(--space-6)' }}>
                Choose the branch to mark attendance.
              </p>
              {availableBranches.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No branches found. Please add branches from the Admin panel.</div>
              ) : (
                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {availableBranches.map(branch => {
                    return (
                      <div key={branch.id} onClick={() => { setSelectedBranch(branch.name); setSelectedBranchId(branch.id); }} className="card hover-card-grow" style={{ padding: 'var(--space-5)', width: 260, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 4, color: 'var(--text-primary)' }}>{branch.name}</h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>{branch.location || ''}</div>
                        <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); setSelectedBranch(branch.name); setSelectedBranchId(branch.id); }} style={{ width: '100%', padding: '10px' }}>Select Branch</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

          ) : (
            // Attendance Grid
            <motion.div key="attendance-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-5)', gap: 'var(--space-4)' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', margin: 0 }}>Mark Attendance</h2>
                  <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '1.1rem' }}>Location: <strong style={{ color: 'var(--text-primary)' }}>{selectedBranch}</strong></p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => { setShowMonthlyReport(true); setReportDate(new Date()); }} className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                    <FileText size={16} /> View Monthly Report
                  </button>
                  <div className="card" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Calendar size={20} color="var(--accent-red)" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="form-input"
                      style={{ margin: 0, padding: '8px', minWidth: 180, WebkitAppearance: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {currentStudents.length === 0 ? (
                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Users size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                  <div style={{ fontSize: '1rem', marginBottom: 8 }}>No students found in this branch.</div>
                  <div style={{ fontSize: '0.85rem' }}>Add students to <strong style={{ color: 'var(--accent-yellow)' }}>{selectedBranch}</strong> from the Admin panel.</div>
                </div>
              ) : (
                <div className="card no-hover-card" style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>

                  {/* Actions Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <button onClick={() => markAll('present')} style={{ background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)', color: '#4CAF50', padding: '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Check size={16} /> Mark All Present
                      </button>
                      <button onClick={() => markAll('absent')} style={{ background: 'rgba(225, 6, 0, 0.1)', border: '1px solid rgba(225, 6, 0, 0.3)', color: '#E10600', padding: '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <X size={16} /> Mark All Absent
                      </button>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Total Students: <strong style={{ color: 'var(--text-primary)' }}>{currentStudents.length}</strong>
                      &nbsp;·&nbsp;
                      <strong style={{ color: '#4CAF50' }}>{Object.values(attendanceRecords).filter(v => v === 'present').length}</strong> Present
                      &nbsp;·&nbsp;
                      <strong style={{ color: '#E10600' }}>{Object.values(attendanceRecords).filter(v => v === 'absent').length}</strong> Absent
                      {Object.keys(attendanceRecords).length < currentStudents.length && (
                        <>&nbsp;·&nbsp;<strong style={{ color: 'var(--accent-yellow)' }}>{currentStudents.length - Object.keys(attendanceRecords).length}</strong> Unmarked</>
                      )}
                    </div>
                  </div>

                  {/* Student List */}
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
                          <th style={{ padding: 'var(--space-3)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Student Details</th>
                          <th style={{ padding: 'var(--space-3)', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentStudents.map((student) => {
                          const status = attendanceRecords[student.id]; // undefined = not yet marked
                          const isPresent = status === 'present';
                          const isAbsent = status === 'absent';
                          const isUnmarked = !status;
                          return (
                            <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s', background: isUnmarked ? 'rgba(255,212,0,0.02)' : 'transparent' }}>
                              <td style={{ padding: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: isPresent ? 'rgba(76,175,80,0.12)' : isAbsent ? 'rgba(225,6,0,0.12)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: isPresent ? '#4CAF50' : isAbsent ? '#E10600' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                                    {(student.name || '?')[0]}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 500, fontSize: '1.05rem' }}>{student.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{student.id} {(student as any).phone ? `• ${(student as any).phone}` : ''}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '10px' }}>
                                  <button
                                    onClick={() => handleSetAttendance(student.id, 'present')}
                                    style={{
                                      padding: '8px 18px', borderRadius: '8px',
                                      border: `1px solid ${isPresent ? '#4CAF50' : 'rgba(76,175,80,0.3)'}`,
                                      background: isPresent ? '#4CAF50' : 'rgba(76, 175, 80, 0.08)',
                                      color: isPresent ? '#FFF' : 'rgba(76,175,80,0.6)',
                                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                      fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s ease',
                                    }}
                                  >
                                    <Check size={14} /> Present
                                  </button>
                                  <button
                                    onClick={() => handleSetAttendance(student.id, 'absent')}
                                    style={{
                                      padding: '8px 18px', borderRadius: '8px',
                                      border: `1px solid ${isAbsent ? '#E10600' : 'rgba(225,6,0,0.3)'}`,
                                      background: isAbsent ? '#E10600' : 'rgba(225, 6, 0, 0.08)',
                                      color: isAbsent ? '#FFF' : 'rgba(225,6,0,0.6)',
                                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                      fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s ease',
                                    }}
                                  >
                                    <X size={14} /> Absent
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Save Button */}
                  <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                      onClick={handleSaveAttendance}
                      disabled={!selectedDate || Object.keys(attendanceRecords).length < currentStudents.length}
                      className="btn btn-primary"
                      style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', opacity: (!selectedDate || Object.keys(attendanceRecords).length < currentStudents.length) ? 0.5 : 1, cursor: (!selectedDate || Object.keys(attendanceRecords).length < currentStudents.length) ? 'not-allowed' : 'pointer' }}
                    >
                      {saved ? <Check size={20} /> : <Save size={20} />}
                      {saved ? 'Saved Successfully!' : 'Save Attendance'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
        input[type="date"] { color-scheme: dark; }
        .hide-on-mobile { }
        @media (max-width: 640px) {
          .hide-on-mobile { display: none; }
        }
      `}} />

      {/* Monthly Report Modal */}
      {showMonthlyReport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={() => { setShowMonthlyReport(false); setIsEditingReport(false); }} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 1000, maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', padding: 'var(--space-4)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'var(--space-3)', flexShrink: 0, flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', letterSpacing: '0.05em', color: 'var(--text-primary)', margin: 0 }}>Monthly Attendance Report</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{selectedBranch} · {currentStudents.length} students</p>
                </div>
                {/* Month Navigator */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '4px 8px' }}>
                  <button onClick={() => setReportDate(new Date(reportDate.getFullYear(), reportDate.getMonth() - 1, 1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}><ChevronLeft size={18} /></button>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, padding: '0 12px', minWidth: 130, textAlign: 'center' }}>{monthName}</span>
                  <button onClick={() => setReportDate(new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}><ChevronRight size={18} /></button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <button
                  onClick={() => setIsEditingReport(!isEditingReport)}
                  className={`btn ${isEditingReport ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                >
                  {isEditingReport ? 'Done Editing' : 'Edit Attendance'}
                </button>
                <button onClick={() => { setShowMonthlyReport(false); setIsEditingReport(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={24} /></button>
              </div>
            </div>

            {/* Sessions date legend */}
            {(() => {
              const monthRecords = allAttendance
                .filter(r => r.branchId === selectedBranchId && r.month === monthKey)
                .sort((a, b) => a.sessionNumber - b.sessionNumber);
              return monthRecords.length > 0 ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-3)', flexShrink: 0 }}>
                  {monthRecords.map(r => (
                    <span key={r.sessionNumber} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4, color: 'var(--text-muted)' }}>
                      S{r.sessionNumber}: {r.date}
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Table */}
            <div style={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'auto' }}>
              {monthlyReportData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                  No attendance records for {monthName}. Save attendance sessions to see them here.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>Student</th>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(session => (
                        <th key={session} style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>S{session}</th>
                      ))}
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyReportData.map(({ student, sessions, presentCount }) => (
                      <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                          <div>{student.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.id}</div>
                        </td>
                        {sessions.map((status, i) => (
                          <td key={i} style={{ padding: '12px 8px', textAlign: 'center' }}>
                            {status === null ? (
                              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>—</span>
                            ) : (
                              <button
                                onClick={() => isEditingReport && handleToggleSessionReport(student.id, i)}
                                disabled={!isEditingReport}
                                title={status === 'present' ? 'Present' : 'Absent'}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: 28, height: 28, borderRadius: '6px',
                                  background: status === 'present' ? 'rgba(76,175,80,0.15)' : 'rgba(225,6,0,0.15)',
                                  color: status === 'present' ? '#4CAF50' : '#E10600',
                                  border: isEditingReport ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                                  cursor: isEditingReport ? 'pointer' : 'default',
                                  transition: 'all 0.2s', padding: 0,
                                }}
                              >
                                {status === 'present' ? <Check size={14} /> : <X size={14} />}
                              </button>
                            )}
                          </td>
                        ))}
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: presentCount >= 6 ? '#4CAF50' : (presentCount >= 4 ? 'var(--accent-yellow)' : '#E10600') }}>
                          {presentCount} / {sessions.filter(s => s !== null).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
