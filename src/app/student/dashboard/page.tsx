'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, MapPin, Clock, Calendar, DollarSign, Check, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrentUser, logout as authLogout } from '@/lib/authService';
import { getStudentAttendance, StudentSession } from '@/lib/attendanceService';
import { getStudentFees, FeeRecord } from '@/lib/feeService';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [monthlySessions, setMonthlySessions] = useState<StudentSession[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [feeHistoryLimit, setFeeHistoryLimit] = useState(5);
  const [reportDate, setReportDate] = useState<Date>(new Date());

  const currentDate = new Date();
  const attendanceMonth = reportDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const attendanceMonthValue = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    const initStudent = async () => {
      try {
        const appUser = await getCurrentUser();
        if (!appUser || appUser.role !== 'student') {
          router.push('/student/login');
          return;
        }
        setStudent(appUser);

        // Fetch fees from Firestore
        setIsLoadingFees(true);
        try {
          // Changed to studentId specifically to match the admin dashboard keys and the Firestore student_fees collection.
          const firestoreFees = await getStudentFees(appUser.studentId || appUser.uid || '');
          setFees(firestoreFees);
        } catch (err) {
          console.error('Failed to load fees:', err);
        } finally {
          setIsLoadingFees(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/student/login');
      }
    };
    initStudent();
  }, [router]);

  useEffect(() => {
    if (!student) return;
    const branchId = student.branchId || '';
    const load = async () => {
      setIsLoadingAttendance(true);
      try {
        const studentIdToUse = String(student.studentId || student.uid || '').trim();
        const branchIdToUse = String(branchId).trim();
        const monthToUse = String(attendanceMonthValue).trim();
        
        console.log('[StudentDashboard] Fetching attendance with:', { studentId: studentIdToUse, branchId: branchIdToUse, month: monthToUse });
        
        const sessions = await getStudentAttendance(studentIdToUse, branchIdToUse, monthToUse);
        setMonthlySessions(sessions);
      } catch (err) {
        console.error('Failed to load student attendance:', err);
      } finally {
        setIsLoadingAttendance(false);
      }
    };
    load();
  }, [student, attendanceMonthValue]);

  if (!student) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }} />;

  const presentCount = monthlySessions.filter(a => a.status === 'present').length;
  const conductedSessions = monthlySessions.length;
  const attendPercent = conductedSessions === 0 ? 0 : Math.round((presentCount / conductedSessions) * 100);

  const handleLogout = async () => {
    try { await authLogout(); } catch (_) {}
    router.push('/student/login');
  };
  
  // Generate Fee History Data natively from Firestore query returns
  const feeHistoryData = fees;

  // Determine current fee state reliably (latest month)
  const currentFee = fees.length > 0 ? fees[0] : { total: student.monthlyFee || 6000, paid: 0, balance: student.monthlyFee || 6000, payments: [], month: currentMonthValue, status: 'pending' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 'var(--space-12)' }}>
      <div className="container" style={{ padding: 'var(--space-4)', maxWidth: 800, margin: '0 auto' }}>
        
        {/* Header Options */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)', paddingTop: 'var(--space-6)' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px', gap: 6 }}><LogOut size={14} /> Logout</button>
        </div>

        {/* Header Profile Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', margin: '0 0 var(--space-2) 0', lineHeight: 1 }}>{student?.name || 'Unknown Student'}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><strong style={{ color: 'var(--text-primary)' }}>ID:</strong> {student?.studentId || student?.uid || 'N/A'}</div>
            {student?.branchId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} color="var(--accent-red)"/> {student.branchId}</div>
            )}
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Attendance Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={24} color="var(--accent-red)" />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Monthly Attendance</h2>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '4px 8px' }}>
                <button onClick={() => setReportDate(new Date(reportDate.getFullYear(), reportDate.getMonth() - 1, 1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}><ChevronLeft size={18} /></button>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, padding: '0 12px', minWidth: 130, textAlign: 'center', color: 'var(--text-primary)' }}>{attendanceMonth}</span>
                <button onClick={() => setReportDate(new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}><ChevronRight size={18} /></button>
              </div>
            </div>
            
            {/* Summary */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-5)', background: 'rgba(255,255,255,0.02)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Sessions Attended</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>{presentCount} / {conductedSessions}</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Percentage</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: attendPercent >= 75 ? '#4CAF50' : 'var(--accent-red)' }}>{attendPercent}%</div>
              </div>
            </div>

            {/* Sessions Date Legend */}
            {monthlySessions.filter(s => s.date !== null).length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-3)', paddingLeft: '4px' }}>
                {monthlySessions.map((s, idx) => s.date ? (
                  <span key={idx} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4, color: 'var(--text-muted)' }}>
                    S{s.sessionNumber}: {s.date}
                  </span>
                ) : null)}
              </div>
            )}

            {/* List / Grid */}
            <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>Student</th>
                    {monthlySessions.length === 0 && (
                      <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>No Sessions</th>
                    )}
                    {monthlySessions.map(session => (
                      <th key={session.sessionNumber} style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>S{session.sessionNumber}</th>
                    ))}
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: 'none' }}>
                    <td style={{ padding: '16px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{student?.name ? student.name[0] : '?'}</div>
                        {student?.name || 'Unknown Student'}
                      </div>
                    </td>
                    {monthlySessions.length === 0 && (
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>—</td>
                    )}
                    {monthlySessions.map((sessionData, i) => {
                      const status = sessionData ? sessionData.status : null;
                      
                      return (
                        <td key={sessionData.sessionNumber || i} style={{ padding: '12px 8px', textAlign: 'center' }}>
                          {status === null ? (
                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>—</span>
                          ) : (
                            <div
                              title={status === 'present' ? 'Present' : 'Absent'}
                              style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 28, height: 28, borderRadius: '6px', margin: '0 auto',
                                background: status === 'present' ? 'rgba(76,175,80,0.15)' : 'rgba(225,6,0,0.15)',
                                color: status === 'present' ? '#4CAF50' : '#E10600',
                              }}
                            >
                              {status === 'present' ? <Check size={14} /> : <X size={14} />}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: presentCount >= 6 ? '#4CAF50' : (presentCount >= 4 ? 'var(--accent-yellow)' : '#E10600'), background: 'rgba(255,255,255,0.02)' }}>
                      {presentCount} / {conductedSessions}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Fees Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
              <DollarSign size={24} color="var(--accent-yellow)" />
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', margin: 0, letterSpacing: '0.05em' }}>Fee Details</h2>
            </div>
            
            {/* Current Month Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Fee / Month</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-primary)' }}>₹{currentFee.total.toLocaleString()}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Paid</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#4CAF50' }}>₹{currentFee.paid.toLocaleString()}</div>
              </div>
              <div className="fee-balance-card" style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Balance</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: (currentFee.balance || 0) > 0 ? '#E10600' : 'var(--text-primary)' }}>₹{(currentFee.balance || 0).toLocaleString()}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Status ({currentFee.month})</div>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: currentFee.status === 'paid' ? '#4CAF50' : '#E10600', fontSize: '0.75rem', fontWeight: 700, background: currentFee.status === 'paid' ? 'rgba(76,175,80,0.12)' : 'rgba(225,6,0,0.12)', padding: '6px 12px', borderRadius: '20px', textTransform: 'uppercase', border: currentFee.status === 'paid' ? '1px solid rgba(76,175,80,0.25)' : '1px solid rgba(225,6,0,0.25)' }}>
                    {currentFee.status === 'paid' ? <><Check size={14} /> Paid</> : <><X size={14} /> Pending</>}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Months Summary Banner */}
            {(() => {
              const pendingMonths = feeHistoryData.filter(p => p.status === 'pending' && p.month <= currentMonthValue);
              const totalPendingAmt = pendingMonths.reduce((sum, p) => sum + ((p.total || 0) - (p.paid || 0)), 0);
              return (
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', border: pendingMonths.length > 0 ? '1px solid rgba(225,6,0,0.3)' : '1px solid rgba(76,175,80,0.2)', background: pendingMonths.length > 0 ? 'rgba(225,6,0,0.07)' : 'rgba(76,175,80,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertCircle size={20} color={pendingMonths.length > 0 ? '#E10600' : '#4CAF50'} />
                    <div>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: pendingMonths.length > 0 ? '#E10600' : '#4CAF50', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>Months Pending</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: pendingMonths.length > 0 ? '#E10600' : '#4CAF50' }}>
                        {pendingMonths.length} <span style={{ fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 400, color: 'var(--text-muted)' }}>months</span>
                      </div>
                      {pendingMonths.length > 0 && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Total due: ₹{totalPendingAmt.toLocaleString()}</div>}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Monthly History Table */}
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)', letterSpacing: '0.05em', fontWeight: 600 }}>Monthly Breakdown <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'inherit', fontWeight: 400 }}>({feeHistoryData.length} months)</span></h3>
            <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {/* Table Header */}
              <div className="fee-table-header" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 130px', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                <span>Month</span>
                <span style={{ textAlign: 'right' }}>Fee/Month</span>
                <span className="fee-col-balance" style={{ textAlign: 'right' }}>Balance</span>
                <span className="fee-col-status" style={{ textAlign: 'right' }}>Status</span>
                <span className="fee-col-paid-mobile" style={{ textAlign: 'right' }}>Paid</span>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {feeHistoryData.slice(0, feeHistoryLimit).map((p, j) => {
                  const [yyyy, mm] = p.month.split('-');
                  const monthStr = new Date(parseInt(yyyy), parseInt(mm) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                  const isCurrent = p.month === currentMonthValue;
                  const isFuture = p.month > currentMonthValue;
                  const isPaid = p.status === 'paid';
                  return (
                    <div key={j} className="fee-table-row" style={{
                      display: 'grid', gridTemplateColumns: '1fr 100px 120px 130px',
                      padding: '13px 16px', alignItems: 'center',
                      borderBottom: j < Math.min(feeHistoryLimit, feeHistoryData.length) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                      background: isFuture ? 'rgba(76,175,80,0.04)' : isCurrent ? 'rgba(225,6,0,0.04)' : 'transparent',
                      transition: 'background 0.2s'
                    }}>
                      {/* Month Name */}
                      <div>
                        <div style={{ fontSize: '0.9rem', color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isCurrent ? 600 : 400 }}>{monthStr}</div>
                        {isCurrent && <div style={{ fontSize: '0.65rem', color: 'var(--accent-red)', textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>Current Month</div>}
                        {isFuture && <div style={{ fontSize: '0.65rem', color: '#4CAF50', textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>Upcoming</div>}
                      </div>
                      {/* Monthly Fee */}
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        ₹{p.total.toLocaleString()}
                      </div>
                      {/* Balance — hidden on mobile */}
                      <div className="fee-col-balance" style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: (p.balance || 0) > 0 ? '#E10600' : '#4CAF50' }}>
                        {(p.balance || 0) > 0 ? `₹${(p.balance || 0).toLocaleString()}` : '—'}
                      </div>
                      {/* Status Badge — hidden on mobile */}
                      <div className="fee-col-status" style={{ textAlign: 'right' }}>
                        {isPaid ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#4CAF50', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(76,175,80,0.12)', padding: '5px 10px', borderRadius: '20px', textTransform: 'uppercase', border: '1px solid rgba(76,175,80,0.25)' }}>
                            <Check size={12} /> Paid
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#E10600', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(225,6,0,0.12)', padding: '5px 10px', borderRadius: '20px', textTransform: 'uppercase', border: '1px solid rgba(225,6,0,0.25)' }}>
                            <X size={12} /> Pending
                          </span>
                        )}
                      </div>
                      {/* Paid — shown only on mobile */}
                      <div className="fee-col-paid-mobile" style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: '#4CAF50' }}>
                        ₹{p.paid.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
              {feeHistoryLimit < feeHistoryData.length && (
                <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <button type="button" onClick={() => setFeeHistoryLimit(prev => prev + 5)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    Load More ({feeHistoryData.length - feeHistoryLimit} remaining)
                  </button>
                </div>
              )}
            </div>

          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
