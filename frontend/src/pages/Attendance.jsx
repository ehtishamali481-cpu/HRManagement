import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Header from '../components/Header';
import {
  Users,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  Settings,
  Search,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Wifi,
  Download,
  Filter,
  Plus,
  Send,
  HelpCircle,
  FileText,
  UserCheck,
  MapPin,
  Laptop,
} from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leaveFilter, setLeaveFilter] = useState('All');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employee_id: '',
    leave_type: 'Annual',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    days_count: 3,
    reason: '',
    is_urgent: false,
  });

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/api/company/attendance');
      setAttendanceData(res.data);
    } catch (err) {
      addToast('Failed to load attendance records from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleApproveLeave = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await api.post(`/api/company/leave-requests/${requestId}/approve`);
      addToast('Leave request approved successfully.', 'success');
      await fetchAttendance();
    } catch (err) {
      addToast('Failed to approve leave request.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectLeave = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await api.post(`/api/company/leave-requests/${requestId}/reject`);
      addToast('Leave request declined.', 'info');
      await fetchAttendance();
    } catch (err) {
      addToast('Failed to decline leave request.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClockToggle = async (empId, currentStatus) => {
    try {
      const nextAction = currentStatus === 'absent' || !currentStatus ? 'clock_in' : 'clock_out';
      await api.post('/api/company/attendance/clock', {
        employee_id: empId,
        action: nextAction,
        location: 'HQ - San Francisco',
      });
      addToast(`Attendance status updated for employee in database.`, 'success');
      await fetchAttendance();
    } catch (err) {
      addToast('Failed to record attendance punch.', 'error');
    }
  };

  const handleCreateLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      addToast('Please provide a reason for the leave application.', 'error');
      return;
    }

    setSubmittingLeave(true);
    try {
      await api.post('/api/company/leave-requests', leaveForm);
      addToast('Leave request submitted and logged in PostgreSQL.', 'success');
      setShowLeaveModal(false);
      setLeaveForm({
        employee_id: '',
        leave_type: 'Annual',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        days_count: 3,
        reason: '',
        is_urgent: false,
      });
      await fetchAttendance();
    } catch (err) {
      addToast('Failed to submit leave request.', 'error');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!attendanceData?.records) return [];
    return attendanceData.records.filter((rec) => {
      const matchesSearch =
        searchQuery === '' ||
        rec.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.employee_role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'On Time' && rec.status === 'on_time') ||
        (statusFilter === 'Late' && rec.status === 'late') ||
        (statusFilter === 'Remote' && rec.status === 'remote') ||
        (statusFilter === 'On Leave' && rec.status === 'on_leave') ||
        (statusFilter === 'Absent' && rec.status === 'absent');

      return matchesSearch && matchesStatus;
    });
  }, [attendanceData, searchQuery, statusFilter]);

  const filteredLeaveRequests = useMemo(() => {
    if (!attendanceData?.leave_requests) return [];
    return attendanceData.leave_requests.filter((lr) => {
      if (leaveFilter === 'All') return lr.status === 'pending';
      return lr.status === 'pending' && lr.leave_type.toLowerCase().includes(leaveFilter.toLowerCase());
    });
  }, [attendanceData, leaveFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading attendance & leave records from PostgreSQL...</p>
      </div>
    );
  }

  const policy = attendanceData?.leave_policy_balance

  const pendingLeavesCount = attendanceData?.leave_requests
    ? attendanceData.leave_requests.filter((lr) => lr.status === 'pending').length
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased overflow-x-hidden">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0D1127] border-r border-slate-800/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M2 12L12 17L22 12" stroke="#A5B4FC" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-white tracking-tight">NexusHR</span>
              <span className="text-[10px] font-mono font-bold bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">
                v3.4
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="bg-[#151B38] border border-white/5 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div className="min-w-0 pr-2">
              <p className="text-[9.5px] font-extrabold tracking-wider text-slate-400 uppercase">
                CURRENT WORKSPACE
              </p>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {user?.company_name || 'Acme Global Corp'}
              </p>
            </div>
            <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
              <Building2 size={13} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              MAIN OPERATIONS
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 text-left transition-all"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigate('/employees')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 text-left transition-all"
              >
                <Users size={16} />
                <span>Employees & Onboarding</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 text-left transition-all"
              >
                <CalendarCheck size={16} />
                <span>Attendance & Leaves</span>
              </button>

              <button
                onClick={() => navigate('/payroll')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 text-left transition-all"
              >
                <CreditCard size={16} />
                <span>Payroll</span>
              </button>

              <button
                onClick={() => navigate('/performance')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 text-left transition-all"
              >
                <TrendingUp size={16} />
                <span>Performance</span>
              </button>
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              ADMINISTRATION
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 text-left transition-all"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>System Operational</span>
          </div>
          <button
            onClick={() => addToast('System status: 99.98% uptime in US-East-1', 'info')}
            className="text-slate-400 hover:text-slate-300"
          >
            <ShieldCheck size={14} />
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          totalStaff={attendanceData?.total_records ?? 0}
          companyName={user?.company_name}
          onEmployeeAdded={() => fetchAttendance()}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>HUMAN ASSETS</span>
                <span>/</span>
                <span>TIME AND COMPLIANCE</span>
                <span>/</span>
                <span className="text-indigo-600">Staff Rights Schedule</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Attendance & Leave Management
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
                <Calendar size={14} className="text-indigo-600" />
                <span>Today: 14-11-2026, 13:00</span>
              </div>

              <button
                onClick={() => addToast('Workforce attendance schedule exported as CSV.', 'success')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all"
              >
                <Download size={14} />
                <span>Export Schedule</span>
              </button>

              <button
                onClick={() => setShowLeaveModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={14} />
                <span>Request Leave / Action</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  AVERAGE CHECK-IN
                </p>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {attendanceData?.average_check_in || '09:12 AM'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    On schedule
                  </span>
                  <span className="text-[11px] text-slate-400">3% earlier than avg</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  LATE ARRIVALS TODAY
                </p>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {attendanceData?.late_arrivals_today ?? 0}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Action required
                  </span>
                  <span className="text-[11px] text-slate-400">Average delay: +14 mins</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  REMOTE SESSIONS RATIO
                </p>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Laptop size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {attendanceData?.remote_sessions_count ?? 0}
                </p>
                <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{
                      width: `${attendanceData?.total_records
                          ? Math.round(
                            ((attendanceData?.remote_sessions_count || 0) /
                              attendanceData.total_records) *
                            100
                          )
                          : 40
                        }%`,
                    }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Remote connection active</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  ON PLANNED LEAVE
                </p>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {attendanceData?.on_leave_count ?? 0}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    High priority
                  </span>
                  <span className="text-[11px] text-slate-400">Approved leaves active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setActiveTab('daily')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'daily'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      Daily Attendance Log
                    </button>
                    <button
                      onClick={() => setActiveTab('monthly')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'monthly'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      Monthly Timesheet
                    </button>
                    <button
                      onClick={() => setActiveTab('policy')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'policy'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      Attendance Policy
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">STATUS:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700"
                    >
                      <option value="All">All Statuses</option>
                      <option value="On Time">On Time</option>
                      <option value="Late">Late</option>
                      <option value="Remote">Remote</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter employee by name, role, department or NX ID..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Employee</th>
                        <th className="py-3.5 px-3">Check In</th>
                        <th className="py-3.5 px-3">Check Out</th>
                        <th className="py-3.5 px-3">Total Hours</th>
                        <th className="py-3.5 px-3">Status</th>
                        <th className="py-3.5 px-3">Location</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            <Clock size={32} className="mx-auto text-slate-300 mb-2" />
                            No attendance records found matching filters.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((rec) => {
                          const isOnTime = rec.status === 'on_time';
                          const isLate = rec.status === 'late';
                          const isRemote = rec.status === 'remote';
                          const isOnLeave = rec.status === 'on_leave';
                          const isAbsent = rec.status === 'absent';

                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  {rec.avatar_url ? (
                                    <img
                                      src={rec.avatar_url}
                                      alt={rec.employee_name}
                                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-100 text-indigo-600 font-bold flex items-center justify-center ring-2 ring-slate-100 shrink-0">
                                      {rec.employee_name.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-slate-900">{rec.employee_name}</p>
                                    <p className="text-[11px] text-slate-400">
                                      {rec.department} • {rec.employee_code}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-3 font-semibold text-slate-800">
                                {rec.check_in || '--'}
                              </td>

                              <td className="py-3.5 px-3 font-semibold text-slate-800">
                                {rec.check_out || '--'}
                              </td>

                              <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                                {rec.total_hours || '0h 00m'}
                              </td>

                              <td className="py-3.5 px-3">
                                {isOnTime && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    On Time
                                  </span>
                                )}
                                {isLate && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    Late (+15m)
                                  </span>
                                )}
                                {isRemote && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Remote
                                  </span>
                                )}
                                {isOnLeave && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                    On Leave
                                  </span>
                                )}
                                {isAbsent && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                    Absent
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                                <span className="flex items-center gap-1">
                                  <MapPin size={11} className="text-slate-400" />
                                  {rec.location}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => handleClockToggle(rec.employee_id, rec.status)}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors"
                                >
                                  {rec.check_in && !rec.check_out ? 'Clock Out' : 'Punch In'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <p>
                    Showing <span className="font-bold text-slate-800">{filteredRecords.length}</span> of{' '}
                    <span className="font-bold text-slate-800">
                      {attendanceData?.total_records ?? 0}
                    </span>{' '}
                    records
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled
                      className="px-3 py-1 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed text-xs font-semibold"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold text-slate-700">Page 1 of 1</span>
                    <button
                      disabled
                      className="px-3 py-1 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed text-xs font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></div>
                    <h2 className="text-sm font-bold text-slate-900">Approval Action Center</h2>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {pendingLeavesCount} pending
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
                  <button
                    onClick={() => setLeaveFilter('All')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${leaveFilter === 'All'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    All ({pendingLeavesCount})
                  </button>
                  <button
                    onClick={() => setLeaveFilter('Annual')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${leaveFilter === 'Annual'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setLeaveFilter('Sick')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${leaveFilter === 'Sick'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    Sick
                  </button>
                  <button
                    onClick={() => setLeaveFilter('Emergency')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${leaveFilter === 'Emergency'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    Emergency
                  </button>
                </div>

                <div className="space-y-3.5">
                  {filteredLeaveRequests.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      <Check size={28} className="mx-auto text-emerald-400 mb-1" />
                      No pending approvals in this category.
                    </div>
                  ) : (
                    filteredLeaveRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {req.avatar_url ? (
                              <img
                                src={req.avatar_url}
                                alt={req.employee_name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                                {req.employee_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                {req.employee_name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {req.employee_role} • {req.department}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${req.leave_type === 'Annual'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : req.leave_type === 'Sick Leave'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                          >
                            {req.leave_type} ({req.days_count}d)
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          <p className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-700">
                            <Calendar size={12} className="text-slate-400" />
                            <span>
                              {req.start_date} - {req.end_date} ({req.days_count} Days)
                            </span>
                          </p>
                          {req.reason && (
                            <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200/60 leading-relaxed">
                              "{req.reason}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleApproveLeave(req.id)}
                            disabled={actionLoadingId === req.id}
                            className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Check size={13} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectLeave(req.id)}
                            disabled={actionLoadingId === req.id}
                            className="py-1.5 px-3 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-lg border border-slate-200 hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Leave Policy Balance</h3>
                  <HelpCircle size={14} className="text-slate-400 cursor-pointer" />
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Company policy coverage remaining (FY) allocated per Tier-1 HQ.
                </p>

                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-600"
                        strokeDasharray={`${policy.percent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-xs font-extrabold text-slate-900">
                      {policy.percent}%
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {policy.avg_remaining_days} Days Avg Remaining
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Across enterprise workforce available {policy.total_allowance}/staff
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Standard Annual (PTO)</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {policy.standard_annual_left} / {policy.standard_annual_total} days left
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{
                          width: `${(policy.standard_annual_left / policy.standard_annual_total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Floating Holiday</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {policy.floating_holiday_left} / {policy.floating_holiday_total} days left
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{
                          width: `${(policy.floating_holiday_left / policy.floating_holiday_total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Sick & Wellness Quota</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {policy.sick_wellness_left} / {policy.sick_wellness_total} days left
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{
                          width: `${(policy.sick_wellness_left / policy.sick_wellness_total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => addToast('Opening company policy framework guidelines.', 'info')}
                  className="w-full py-2 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  View detailed policy framework guidelines
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowLeaveModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <CalendarCheck size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Leave</h3>
                <p className="text-xs text-slate-500">Submit employee leave authorization request</p>
              </div>
            </div>

            <form onSubmit={handleCreateLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leaveForm.employee_id}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employee_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="">Select Employee (Default First)</option>
                  {attendanceData?.records?.map((r) => (
                    <option key={r.employee_id} value={r.employee_id}>
                      {r.employee_name} ({r.employee_code} • {r.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Leave Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="Annual">Annual Leave (PTO)</option>
                  <option value="Sick Leave">Sick & Medical Leave</option>
                  <option value="Emergency">Emergency Family Care</option>
                  <option value="Parental">Parental Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Number of Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={leaveForm.days_count}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, days_count: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason / Coverage Plan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Attending family commitment, team handover prepared."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={leaveForm.is_urgent}
                  onChange={(e) => setLeaveForm({ ...leaveForm, is_urgent: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="urgent" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark as urgent request
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingLeave ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
