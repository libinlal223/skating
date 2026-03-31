// Mock data for the application
export const mockStudents = [
  { id: 'SW001', name: 'Aarav Sharma', branch: 'Mumbai Central', coach: 'Coach Rajesh Kumar', batch: 'Morning 6AM-8AM', phone: '+91 98765 00001', email: 'aarav@email.com', joinDate: '2023-01-15', password: 'pass123' },
  { id: 'SW002', name: 'Priya Patel', branch: 'Pune Branch', coach: 'Coach Priya Sharma', batch: 'Evening 5PM-7PM', phone: '+91 98765 00002', email: 'priya@email.com', joinDate: '2023-03-20', password: 'pass123' },
  { id: 'SW003', name: 'Rohan Singh', branch: 'Delhi NCR', coach: 'Coach Amit Patel', batch: 'Morning 7AM-9AM', phone: '+91 98765 00003', email: 'rohan@email.com', joinDate: '2022-08-10', password: 'pass123' },
  { id: 'SW004', name: 'Ananya Reddy', branch: 'Bangalore', coach: 'Coach Sneha Reddy', batch: 'Afternoon 3PM-5PM', phone: '+91 98765 00004', email: 'ananya@email.com', joinDate: '2024-01-05', password: 'pass123' },
];

export const mockAttendance: Record<string, { date: string; status: 'present' | 'absent' | 'late' }[]> = {
  SW001: [
    { date: '2024-03-01', status: 'present' }, { date: '2024-03-02', status: 'present' },
    { date: '2024-03-03', status: 'absent' }, { date: '2024-03-04', status: 'present' },
    { date: '2024-03-05', status: 'late' }, { date: '2024-03-06', status: 'present' },
    { date: '2024-03-07', status: 'present' }, { date: '2024-03-08', status: 'present' },
    { date: '2024-03-09', status: 'absent' }, { date: '2024-03-10', status: 'present' },
  ],
  SW002: [
    { date: '2024-03-01', status: 'present' }, { date: '2024-03-02', status: 'late' },
    { date: '2024-03-03', status: 'present' },{ date: '2024-03-04', status: 'present' },
    { date: '2024-03-05', status: 'present' }, { date: '2024-03-06', status: 'absent' },
  ],
  SW003: [
    { date: '2024-03-01', status: 'present' }, { date: '2024-03-02', status: 'present' },
    { date: '2024-03-03', status: 'present' }, { date: '2024-03-04', status: 'late' },
  ],
  SW004: [
    { date: '2024-03-01', status: 'absent' }, { date: '2024-03-02', status: 'present' },
    { date: '2024-03-03', status: 'present' }, { date: '2024-03-04', status: 'present' },
    { date: '2024-03-05', status: 'present' },
  ],
};

export const mockFees: Record<string, { total: number; paid: number; payments: { date: string; amount: number; method: string }[] }> = {
  SW001: { total: 24000, paid: 18000, payments: [
    { date: '2024-01-05', amount: 6000, method: 'UPI' },
    { date: '2024-02-05', amount: 6000, method: 'Cash' },
    { date: '2024-03-05', amount: 6000, method: 'UPI' },
  ]},
  SW002: { total: 24000, paid: 24000, payments: [
    { date: '2024-01-10', amount: 12000, method: 'Bank Transfer' },
    { date: '2024-02-10', amount: 12000, method: 'UPI' },
  ]},
  SW003: { total: 30000, paid: 20000, payments: [
    { date: '2024-01-01', amount: 10000, method: 'Cash' },
    { date: '2024-02-01', amount: 10000, method: 'UPI' },
  ]},
  SW004: { total: 18000, paid: 6000, payments: [
    { date: '2024-01-15', amount: 6000, method: 'UPI' },
  ]},
};

export const mockSkills: Record<string, { speed: number; balance: number; technique: number }> = {
  SW001: { speed: 78, balance: 85, technique: 72 },
  SW002: { speed: 65, balance: 70, technique: 80 },
  SW003: { speed: 90, balance: 82, technique: 88 },
  SW004: { speed: 45, balance: 55, technique: 40 },
};

export const mockBranches = [
  { id: 'B001', name: 'Mumbai Central', location: 'Mahalaxmi Sports Complex', coach: 'Coach Rajesh Kumar', phone: '+91 98765 43210', students: 120, batches: ['Morning 6AM-8AM', 'Evening 5PM-7PM'] },
  { id: 'B002', name: 'Pune Branch', location: 'Shivaji Nagar Sports Arena', coach: 'Coach Priya Sharma', phone: '+91 98765 43211', students: 85, batches: ['Morning 7AM-9AM', 'Afternoon 3PM-5PM'] },
  { id: 'B003', name: 'Delhi NCR', location: 'Connaught Place Sports Hub', coach: 'Coach Amit Patel', phone: '+91 98765 43212', students: 150, batches: ['Morning 6AM-8AM', 'Evening 4PM-6PM'] },
  { id: 'B004', name: 'Bangalore', location: 'Koramangala Skating Rink', coach: 'Coach Sneha Reddy', phone: '+91 98765 43213', students: 95, batches: ['Morning 7AM-9AM', 'Evening 5PM-7PM'] },
  { id: 'B005', name: 'Hyderabad', location: 'Jubilee Hills Sports Academy', coach: 'Coach Vikram Singh', phone: '+91 98765 43214', students: 70, batches: ['Morning 6AM-8AM', 'Evening 4PM-6PM'] },
];

export const adminCredentials = { username: 'admin', password: 'admin123' };
