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
  Bell,
  Plus,
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
  Lock,
  Mail,
  Phone,
  User,
  DollarSign,
  MapPin,
  Layers,
  ChevronDown,
  Upload,
  UserCheck,
  Filter,
} from 'lucide-react';

export default function Employees() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [directoryData, setDirectoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    department_name: 'Engineering',
    role_title: '',
    employment_type: 'Full-Time',
    work_location: 'HQ - San Francisco',
    reports_to: 'Marcus Vance (Staff Architect)',
    base_salary: '115,000',
    currency: 'USD ($)',
    joining_date: new Date().toISOString().split('T')[0],
    assigned_role: 'employee',
    avatar_url: '',
  });

  const fetchDirectory = async () => {
    try {
      const res = await api.get('/api/company/employees');
      setDirectoryData(res.data);
    } catch (err) {
      addToast('Failed to load employee records from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setDrawerOpen(true);
    }
  }, []);

  const handleLogout = () => {
    logout();
    addToast('You have signed out.', 'info');
    navigate('/login');
  };

  const isOwner = (user?.role === 'owner') || (directoryData?.current_user_role === 'owner');

  const filteredEmployees = useMemo(() => {
    if (!directoryData?.employees) return [];
    return directoryData.employees.filter((emp) => {
      const matchesSearch =
        searchQuery === '' ||
        emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.employee_code && emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.role_title && emp.role_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept =
        selectedDept === 'All' || emp.department === selectedDept;

      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active' && emp.status === 'active') ||
        (selectedStatus === 'Onboarding' && (emp.status === 'onboarding' || emp.attendance_status === 'onboarding')) ||
        (selectedStatus === 'On Leave' && (emp.status === 'on_leave' || emp.attendance_status === 'leave'));

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [directoryData, searchQuery, selectedDept, selectedStatus]);

  const toggleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map((e) => e.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((item) => item !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, avatar_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      addToast('Please provide full name and work email address.', 'error');
      return;
    }

    if (!isOwner && (formData.assigned_role === 'owner' || formData.assigned_role === 'admin' || formData.assigned_role === 'hr')) {
      addToast('Non-owners can only assign the Employee role.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/company/employees', formData);
      addToast(`Employee profile created and invite sent to ${formData.email}`, 'success');
      setDrawerOpen(false);
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        department_name: 'Engineering',
        role_title: '',
        employment_type: 'Full-Time',
        work_location: 'HQ - San Francisco',
        reports_to: 'Marcus Vance (Staff Architect)',
        base_salary: '115,000',
        currency: 'USD ($)',
        joining_date: new Date().toISOString().split('T')[0],
        assigned_role: 'employee',
        avatar_url: '',
      });
      await fetchDirectory();
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create employee profile.';
      addToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading workforce directory from PostgreSQL...</p>
      </div>
    );
  }

  const deptList = directoryData?.departments_summary
    ? Object.entries(directoryData.departments_summary)
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased overflow-x-hidden">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0D1127] border-r border-slate-800/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
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
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 text-left transition-all"
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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalStaff={directoryData?.total_headcount ?? 0}
          companyName={user?.company_name}
          onEmployeeAdded={() => fetchDirectory()}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>PEOPLE OPERATIONS</span>
              <span>/</span>
              <span className="text-indigo-600">Staff Directory</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Employee Directory
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {directoryData?.total_headcount ?? 0} Active Employees
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage workforce records, operational permissions, onboarding workflows, and global assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  TOTAL HEADCOUNT
                </p>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {directoryData?.total_headcount ?? 0}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp size={13} />
                  +14 this month
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  IN ONBOARDING
                </p>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Send size={15} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {directoryData?.in_onboarding ?? 0}
                </span>
                <span className="text-xs font-semibold text-indigo-600">
                  84% task completion
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  ON LEAVE TODAY
                </p>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar size={15} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {directoryData?.on_leave_today ?? 0}
                </span>
                <span className="text-xs font-semibold text-amber-600">
                  4 scheduled
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, department or ID (e.g. NX-1042)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-2">
                  DEPARTMENT:
                </span>
                <button
                  onClick={() => setSelectedDept('All')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedDept === 'All'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({directoryData?.total_headcount ?? 0})
                </button>
                {deptList.map(([name, count]) => (
                  <button
                    key={name}
                    onClick={() => setSelectedDept(name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedDept === name
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {name} ({count})
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <button
                  onClick={() => setSelectedStatus(selectedStatus === 'Active' ? 'All' : 'Active')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                    selectedStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 font-bold' : ''
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Active</span>
                </button>
                <button
                  onClick={() => setSelectedStatus(selectedStatus === 'Onboarding' ? 'All' : 'Onboarding')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                    selectedStatus === 'Onboarding' ? 'bg-blue-50 text-blue-700 font-bold' : ''
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Onboarding</span>
                </button>
                <button
                  onClick={() => setSelectedStatus(selectedStatus === 'On Leave' ? 'All' : 'On Leave')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                    selectedStatus === 'On Leave' ? 'bg-amber-50 text-amber-700 font-bold' : ''
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>On Leave</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredEmployees.length > 0 &&
                          selectedEmployees.length === filteredEmployees.length
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">EMPLOYEE NAME</th>
                    <th className="py-3.5 px-4">EMPLOYEE ID</th>
                    <th className="py-3.5 px-4">DEPARTMENT & TITLE</th>
                    <th className="py-3.5 px-4">WORK EMAIL</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <Users size={32} className="mx-auto text-slate-300 mb-2" />
                        No employees found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const isSelected = selectedEmployees.includes(emp.id);
                      const isEmpActive = emp.status === 'active';
                      const isEmpOnboarding =
                        emp.status === 'onboarding' || emp.attendance_status === 'onboarding';
                      const isEmpOnLeave =
                        emp.status === 'on_leave' || emp.attendance_status === 'leave';

                      return (
                        <tr
                          key={emp.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(emp.id)}
                              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {emp.avatar_url ? (
                                <img
                                  src={emp.avatar_url}
                                  alt={emp.full_name}
                                  className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-slate-100 text-indigo-600 font-bold flex items-center justify-center ring-2 ring-slate-100">
                                  {emp.full_name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900">{emp.full_name}</p>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <MapPin size={10} />
                                  {emp.work_location || 'HQ - San Francisco'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {emp.employee_code || `NX-${1000 + emp.id}`}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800">{emp.role_title}</p>
                            <p className="text-[11px] text-slate-400">{emp.department}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {emp.email}
                          </td>
                          <td className="py-3.5 px-4">
                            {isEmpActive && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            )}
                            {isEmpOnboarding && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Onboarding
                              </span>
                            )}
                            {isEmpOnLeave && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                On Leave
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() =>
                                addToast(
                                  `Staff profile: ${emp.full_name} (${emp.employee_code || 'NX-1042'})`,
                                  'info'
                                )
                              }
                              className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              Details
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
                Showing <span className="font-bold text-slate-800">{filteredEmployees.length}</span> of{' '}
                <span className="font-bold text-slate-800">
                  {directoryData?.total_headcount ?? 0}
                </span>{' '}
                employees
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="px-3 py-1 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed text-xs font-semibold"
                >
                  Previous
                </button>
                <button
                  onClick={() => addToast('Page 1 of staff directory.', 'info')}
                  className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  1
                </button>
                <button
                  disabled
                  className="px-3 py-1 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed text-xs font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedEmployees.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
            <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-bold">
              {selectedEmployees.length}
            </span>
            <span className="text-xs font-semibold text-slate-300">selected</span>
          </div>

          <button
            onClick={() => {
              addToast(`Invitation setup email resent to ${selectedEmployees.length} employees.`, 'success');
              setSelectedEmployees([]);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Mail size={13} />
            <span>Resend Setup Email</span>
          </button>

          <button
            onClick={() => {
              addToast('Team re-assignment dialog opened.', 'info');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Layers size={13} />
            <span>Assign Team</span>
          </button>

          <button
            onClick={() => {
              addToast(`Deactivated ${selectedEmployees.length} staff records.`, 'info');
              setSelectedEmployees([]);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={13} />
            <span>Deactivate</span>
          </button>

          <button
            onClick={() => setSelectedEmployees([])}
            className="text-slate-500 hover:text-slate-300 p-1"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg md:max-w-xl bg-white shadow-2xl flex flex-col">
              <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                    <h2 className="text-lg font-bold text-slate-900">Add New Employee</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Create profile, assign department and send invite
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddEmployeeSubmit} className="flex-1 overflow-y-auto p-6 space-y-7">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                      1. PERSONAL INFORMATION
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400">Step 1 of 4</span>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    {formData.avatar_url ? (
                      <img
                        src={formData.avatar_url}
                        alt="Avatar Preview"
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
                        <User size={24} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Profile Photo</p>
                      <p className="text-[11px] text-slate-400">PNG, JPG or WebP (Max 2MB)</p>
                      <div className="flex items-center gap-2 mt-2">
                        <label className="cursor-pointer px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-all">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                        {formData.avatar_url && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, avatar_url: '' }))}
                            className="px-2 py-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Kevin Kowalski"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Work Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="kevin.k@acmeglobal.corp"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="+1 (415) 892-3021"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                      2. EMPLOYMENT DETAILS
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400">Step 2 of 4</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.department_name}
                      onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                    >
                      <option value="Engineering">Product Engineering</option>
                      <option value="Product & Design">Design & Ops</option>
                      <option value="Marketing & Growth">Marketing & Growth</option>
                      <option value="Sales & Rev">Sales & Revenue</option>
                      <option value="Finance & Tax">Finance & Tax</option>
                      <option value="People & Culture">People & Culture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Designation / Job Role <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.role_title}
                      onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                      placeholder="Senior Frontend Engineer"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Employment Type
                      </label>
                      <select
                        value={formData.employment_type}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                      >
                        <option value="Full-Time">Full-time</option>
                        <option value="Part-Time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Work Location
                      </label>
                      <select
                        value={formData.work_location}
                        onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                      >
                        <option value="HQ - San Francisco">HQ - San Francisco</option>
                        <option value="Berlin, DE (Remote)">Berlin, DE (Remote)</option>
                        <option value="London, UK (Hybrid)">London, UK (Hybrid)</option>
                        <option value="Toronto, CA (Hybrid)">Toronto, CA (Hybrid)</option>
                        <option value="Tokyo, JP (Remote)">Tokyo, JP (Remote)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reports to Manager
                    </label>
                    <select
                      value={formData.reports_to}
                      onChange={(e) => setFormData({ ...formData, reports_to: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                    >
                      <option value="Marcus Vance (Staff Architect)">Marcus Vance (Staff Architect)</option>
                      <option value="Elena Rostova (Lead Product Designer)">Elena Rostova (Lead Product Designer)</option>
                      <option value="Devonte Washington (Director of Growth)">Devonte Washington (Director of Growth)</option>
                      <option value="Priya Natarajan (VP Sales)">Priya Natarajan (VP Sales)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                      3. COMPENSATION & CONTRACT
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400">Step 3 of 4</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Annual Base Salary <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.base_salary}
                        onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                        placeholder="115,000"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                      >
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                        <option value="PKR (Rs)">PKR (Rs)</option>
                        <option value="CAD ($)">CAD ($)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Joining Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                      4. ROLE PERMISSIONS & ACCESS
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400">Step 4 of 4</span>
                  </div>

                  <div className="space-y-2.5">
                    <label
                      className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                        !isOwner
                          ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                          : formData.assigned_role === 'admin'
                          ? 'border-indigo-600 bg-indigo-50/30'
                          : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="assigned_role"
                        value="admin"
                        disabled={!isOwner}
                        checked={formData.assigned_role === 'admin'}
                        onChange={(e) => setFormData({ ...formData, assigned_role: e.target.value })}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">Organization Admin</p>
                          {!isOwner && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <Lock size={10} /> Owner only
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Full control over billing, compliance records, and global user permissions.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                        !isOwner
                          ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                          : formData.assigned_role === 'hr'
                          ? 'border-indigo-600 bg-indigo-50/30'
                          : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="assigned_role"
                        value="hr"
                        disabled={!isOwner}
                        checked={formData.assigned_role === 'hr'}
                        onChange={(e) => setFormData({ ...formData, assigned_role: e.target.value })}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">HR / People Partner</p>
                          {!isOwner && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <Lock size={10} /> Owner only
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Manages staff records, onboarding, leave approvals, and employee evaluations.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        formData.assigned_role === 'employee'
                          ? 'border-indigo-600 bg-indigo-50/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="assigned_role"
                        value="employee"
                        checked={formData.assigned_role === 'employee'}
                        onChange={(e) => setFormData({ ...formData, assigned_role: e.target.value })}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">Employee</p>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Default Standard Access
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Standard staff portal access to personal records, leave requests, and company directory.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-2">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Invite & Create Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
