import React, { useEffect, useState } from 'react';
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
  Bell,
  HelpCircle,
  Plus,
  Download,
  Building2,
  ChevronRight,
  LogOut,
  Calendar,
  Send,
  ShieldCheck,
  Check,
  X,
  Menu,
  Clock,
  Briefcase,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingEmp, setSubmittingEmp] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [newEmp, setNewEmp] = useState({
    full_name: '',
    email: '',
    department_name: 'Engineering',
    role_title: '',
    attendance_status: 'present_office',
  });

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/company/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      addToast('Failed to load company workspace data from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    addToast('You have signed out.', 'info');
    navigate('/login');
  };

  const handleApproveLeave = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      await api.post(`/api/company/leave-requests/${requestId}/approve`);
      addToast('Leave request approved successfully.', 'success');
      await fetchDashboard();
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
      addToast('Leave request rejected.', 'info');
      await fetchDashboard();
    } catch (err) {
      addToast('Failed to reject leave request.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmp.full_name.trim() || !newEmp.email.trim()) {
      addToast('Please enter full name and email address.', 'error');
      return;
    }
    setSubmittingEmp(true);
    try {
      await api.post('/api/company/employees', newEmp);
      addToast(`Employee ${newEmp.full_name} added to database!`, 'success');
      setShowAddModal(false);
      setNewEmp({
        full_name: '',
        email: '',
        department_name: 'Engineering',
        role_title: '',
        attendance_status: 'present_office',
      });
      await fetchDashboard();
    } catch (err) {
      addToast('Failed to add employee.', 'error');
    } finally {
      setSubmittingEmp(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading enterprise workspace from PostgreSQL...</p>
      </div>
    );
  }

  const company = dashboardData?.company;
  const metrics = dashboardData;
  const firstName = dashboardData?.user_name ? dashboardData.user_name.split(' ')[0] : 'Sarah';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased">
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
                {company?.name || 'Acme Global Corp'}
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
              MAIN SECTIONS
            </p>
            <nav className="space-y-1">
              <button
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 text-left transition-all"
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
                onClick={() => navigate('/attendance')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 text-left transition-all"
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
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]"></span>
            <span>System Operational</span>
          </div>
          <ShieldCheck size={14} className="text-slate-500" />
        </div>
      </aside>
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          totalStaff={metrics?.total_employees ?? 0}
          companyName={company?.name}
          onEmployeeAdded={() => fetchDashboard()}
        />
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                {company?.hq_location || 'WRITE THE COMPANY LOCATION'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                {getGreeting()}, {firstName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Here is what is happening across your{' '}
                <strong className="text-slate-800">{metrics?.total_employees} team members</strong> today.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => addToast('Summary Report generated (PDF download simulated).', 'success')}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/90 shadow-2xs transition-all"
              >
                <Download size={14} />
                <span>Download Summary Report</span>
              </button>
              <button
                onClick={() => addToast('Quick Actions modal triggered.', 'info')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                <Plus size={14} />
                <span>Quick Action</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  TOTAL EMPLOYEES
                </span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users size={14} />
                </div>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {metrics?.total_employees}
                  </span>
                  <span className="inline-flex items-center text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded-full">
                    +2.4%
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-400 mt-0.5">
                  +{metrics?.new_hires_count || 12} hires this month
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex -space-x-2 overflow-hidden">
                  {metrics?.recent_avatars?.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="New joiner"
                      className="inline-block w-6 h-6 rounded-full ring-2 ring-white object-cover"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-slate-400">New joiners</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  PRESENT TODAY
                </span>
                <span className="text-[10.5px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                  On Track
                </span>
              </div>
              <div className="my-2 flex items-center justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {metrics?.present_today}
                  </span>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    {metrics?.attendance_rate}% attendance rate
                  </p>
                </div>
                <div className="w-11 h-11 rounded-full border-3 border-indigo-600 border-t-slate-200 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                  {Math.round(metrics?.attendance_rate)}%
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(metrics?.attendance_rate || 90, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ON LEAVE
                </span>
                <span className="text-[10.5px] font-bold text-purple-600 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full">
                  Scheduled
                </span>
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {metrics?.on_leave_today}
                </span>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  {metrics?.leave_breakdown?.annual || 16} Annual • {metrics?.leave_breakdown?.sick || 5} Sick • {metrics?.leave_breakdown?.parental || 3} Parental
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5">
                <div className="flex-1 bg-indigo-500 h-2 rounded-l-full"></div>
                <div className="w-6 bg-emerald-500 h-2"></div>
                <div className="w-4 bg-purple-500 h-2 rounded-r-full"></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl py-5 px-2 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase ">
                  PENDING APPROVALS
                </span>
                <span className="text-[10.5px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                  Requires Action
                </span>
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
                  {metrics?.pending_approvals}
                </span>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  {metrics?.pending_breakdown?.leaves} Leaves • {metrics?.pending_breakdown?.expenses} Expenses • {metrics?.pending_breakdown?.overtime} Overtime
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-rose-600">
                <span className="flex items-center gap-1">
                  <AlertCircle size={12} /> Urgent: 2hr pending
                </span>
                <button
                  onClick={() => addToast('Reviewing all pending supervisor tickets.', 'info')}
                  className="text-indigo-600 hover:underline"
                >
                  Review All →
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Live Workforce Attendance
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real-time status across organizational divisions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                      Today, Nov 14
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {metrics?.departments?.map((dept) => (
                    <div key={dept.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          {dept.name} • <span className="font-normal text-slate-400">{dept.total_staff} staff</span>
                        </span>
                        <span className="font-bold text-slate-700">
                          {dept.rate_percent}%{' '}
                          <span className="font-normal text-slate-400">
                            ({dept.present_staff}/{dept.total_staff})
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${dept.rate_percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-5 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      REMOTE SESSIONS
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {metrics?.attendance_stats?.remote_sessions || 312}
                    </p>
                  </div>
                  <div className="border-x border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      IN OFFICE (SF HQ)
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {metrics?.attendance_stats?.in_office || 170}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      AVERAGE SIGN-IN
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {metrics?.attendance_stats?.avg_sign_in || '08:48 AM'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Recent Employee Activity & Onboarding
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Active onboarding pipeline tracking for Q4 arrivals
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/employees')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto"
                  >
                    View Directory
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                        <th className="pb-3 font-semibold">Employee</th>
                        <th className="pb-3 font-semibold">Department</th>
                        <th className="pb-3 font-semibold">Start Date</th>
                        <th className="pb-3 font-semibold">Checklist Progress</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {metrics?.recent_onboarding?.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="py-3.5 pr-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={emp.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                alt={emp.full_name}
                                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                              />
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {emp.full_name}
                                </p>
                                <p className="text-[11px] text-slate-400">{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-200/60">
                              {emp.department}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-medium text-slate-600 whitespace-nowrap">
                            {emp.start_date}
                          </td>
                          <td className="py-3.5 px-3 min-w-[140px]">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${emp.onboarding_progress === 100
                                    ? 'bg-emerald-600'
                                    : 'bg-indigo-600'
                                    }`}
                                  style={{ width: `${emp.onboarding_progress}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-slate-700 text-[11px]">
                                {emp.onboarding_progress}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 pl-3 text-right">
                            <button
                              onClick={() => addToast(`Opening profile for ${emp.full_name}`, 'info')}
                              className="text-slate-400 hover:text-indigo-600 p-1"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]"></span>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Leave Approvals
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                    {metrics?.leave_approvals?.length || 2} Urgent
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Requires immediate supervisor authorization
                </p>

                <div className="space-y-4">
                  {metrics?.leave_approvals?.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={req.avatar_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'}
                            alt={req.employee_name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">
                              {req.employee_name}
                            </p>
                            <p className="text-[11px] text-slate-400">{req.employee_role}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                          {req.leave_type}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 font-medium">
                        <p className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{req.dates_text} ({req.days_count} Days)</span>
                        </p>
                        {req.reason && (
                          <p className="text-[11.5px] text-slate-500 italic mt-1 bg-white p-2 rounded-lg border border-slate-200/60">
                            "{req.reason}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleApproveLeave(req.id)}
                          disabled={actionLoadingId === req.id}
                          className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectLeave(req.id)}
                          disabled={actionLoadingId === req.id}
                          className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!metrics?.leave_approvals || metrics.leave_approvals.length === 0) && (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No pending leave approvals right now.
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">This Week</h2>
                  <Calendar size={15} className="text-slate-400" />
                </div>

                <div className="space-y-3">
                  {metrics?.this_week_events?.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/40 flex items-center gap-3.5 hover:bg-slate-50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-center shrink-0">
                        <span className="text-[9px] font-bold text-indigo-600 uppercase leading-none">
                          {ev.badge_date}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{ev.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{ev.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
                <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">
                  Quick HR Shortcuts
                </h2>

                <div className="space-y-2.5">
                  <button
                    onClick={() => addToast('Opening Mid-Month Payroll workflow.', 'info')}
                    className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-indigo-200 bg-white hover:bg-indigo-50/30 flex items-center justify-between text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Run Mid-Month Payroll</p>
                        <p className="text-[10.5px] text-slate-400">Scheduled cycle for Nov 15</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-indigo-600" />
                  </button>

                  <button
                    onClick={() => addToast('Composing All-Hands broadcast memo.', 'info')}
                    className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-blue-200 bg-white hover:bg-blue-50/30 flex items-center justify-between text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Send size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Send All-Hands Memo</p>
                        <p className="text-[10.5px] text-slate-400">Broadcast to {metrics?.total_employees} workers</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-blue-600" />
                  </button>

                  <button
                    onClick={() => addToast('Loading SOC2 Audit compliance checklists.', 'info')}
                    className="w-full p-3 rounded-xl border border-slate-200/80 hover:border-emerald-200 bg-white hover:bg-emerald-50/30 flex items-center justify-between text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">SOC2 Compliance Audit</p>
                        <p className="text-[10.5px] text-slate-400">3 sign-offs pending review</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-emerald-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-fade-in">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Employee</h3>
                <p className="text-xs text-slate-500">Insert real workforce member into database</p>
              </div>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Anderson"
                  value={newEmp.full_name}
                  onChange={(e) => setNewEmp({ ...newEmp, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="liam.a@acme.corp"
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={newEmp.department_name}
                  onChange={(e) => setNewEmp({ ...newEmp, department_name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing & Growth">Marketing & Growth</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Sales & Accounts">Sales & Accounts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Systems Engineer"
                  value={newEmp.role_title}
                  onChange={(e) => setNewEmp({ ...newEmp, role_title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attendance Mode
                </label>
                <select
                  value={newEmp.attendance_status}
                  onChange={(e) => setNewEmp({ ...newEmp, attendance_status: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                >
                  <option value="present_office">In-Office (SF HQ)</option>
                  <option value="present_remote">Remote Session</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEmp}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {submittingEmp ? 'Saving...' : 'Add to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
