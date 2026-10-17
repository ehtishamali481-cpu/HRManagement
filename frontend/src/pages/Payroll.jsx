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
  Download,
  Plus,
  Send,
  Lock,
  FileText,
  DollarSign,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
  Play,
  Layers,
} from 'lucide-react';

export default function Payroll() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cycleTab, setCycleTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [showRunModal, setShowRunModal] = useState(false);
  const [runningPayroll, setRunningPayroll] = useState(false);
  const [runForm, setRunForm] = useState({
    period_start: 'Nov 16, 2026',
    period_end: 'Nov 30, 2026',
    pay_date: 'Nov 30, 2026',
  });

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimForm, setClaimForm] = useState({
    amount: '195.00',
    category: 'Product Engineering',
    description: 'Cloud Infrastructure Tooling',
  });

  const fetchPayroll = async () => {
    try {
      const res = await api.get('/api/company/payroll');
      setPayrollData(res.data);
    } catch (err) {
      addToast('Failed to load payroll data from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleToggleChecklist = async (itemId, currentVal) => {
    try {
      await api.post('/api/company/payroll/checklist/toggle', {
        item_id: itemId,
        is_completed: !currentVal,
      });
      await fetchPayroll();
    } catch (err) {
      addToast('Failed to update checklist item in database.', 'error');
    }
  };

  const handleApproveClaim = async (claimId) => {
    setActionLoadingId(claimId);
    try {
      await api.post(`/api/company/payroll/claims/${claimId}/approve`);
      addToast('Expense claim approved and queued for payout.', 'success');
      await fetchPayroll();
    } catch (err) {
      addToast('Failed to approve expense claim.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveAllClaims = async () => {
    const pendingClaims = payrollData?.claims?.filter((c) => c.status === 'pending') || [];
    if (pendingClaims.length === 0) {
      addToast('No pending expense claims to approve.', 'info');
      return;
    }

    try {
      for (const cl of pendingClaims) {
        await api.post(`/api/company/payroll/claims/${cl.id}/approve`);
      }
      addToast(`Approved all ${pendingClaims.length} expense claims.`, 'success');
      await fetchPayroll();
    } catch (err) {
      addToast('Error during batch approval.', 'error');
    }
  };

  const handleRunPayrollSubmit = async (e) => {
    e.preventDefault();
    setRunningPayroll(true);
    try {
      await api.post('/api/company/payroll/run', runForm);
      addToast(`Payroll cycle disbursed successfully for ${runForm.pay_date}!`, 'success');
      setShowRunModal(false);
      await fetchPayroll();
    } catch (err) {
      addToast('Failed to execute payroll cycle.', 'error');
    } finally {
      setRunningPayroll(false);
    }
  };

  const handleCreateClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimForm.description.trim()) {
      addToast('Please enter a description for the claim.', 'error');
      return;
    }

    setSubmittingClaim(true);
    try {
      await api.post('/api/company/payroll/claims', claimForm);
      addToast('Expense claim recorded in database.', 'success');
      setShowClaimModal(false);
      setClaimForm({
        amount: '195.00',
        category: 'Product Engineering',
        description: '',
      });
      await fetchPayroll();
    } catch (err) {
      addToast('Failed to record expense claim.', 'error');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const filteredCycles = useMemo(() => {
    if (!payrollData?.cycles) return [];
    return payrollData.cycles.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        c.period_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.pay_date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.gross_total.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        cycleTab === 'All' ||
        (cycleTab === 'Upcoming' && c.status === 'ready') ||
        (cycleTab === 'Processing' && c.status === 'processing') ||
        (cycleTab === 'Archived' && c.status === 'paid');

      return matchesSearch && matchesTab;
    });
  }, [payrollData, searchQuery, cycleTab]);

  const readyChecklistCount = payrollData?.checklist
    ? payrollData.checklist.filter((it) => it.is_completed).length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading enterprise payroll ledger from PostgreSQL...</p>
      </div>
    );
  }

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
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 text-left transition-all"
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
          totalStaff={payrollData?.department_breakdown?.reduce((acc, d) => acc + d.headcount, 0) || 0}
          companyName={user?.company_name}
          onEmployeeAdded={() => fetchPayroll()}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>ENTERPRISE FINANCE</span>
                <span>/</span>
                <span>TOTAL REWARDS</span>
                <span>/</span>
                <span className="text-indigo-600">PAYROLL CYCLES</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Payroll & Compensation Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage organization-wide salary disbursements, tax withholdings, bonuses, and upcoming payroll cycles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => addToast('Payroll Summary Statement downloaded as PDF.', 'success')}
                className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all"
              >
                <Download size={14} />
                <span>Download Summary Report</span>
              </button>

              <button
                onClick={() => setShowRunModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={15} />
                <span>Run Payroll Cycle</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  TOTAL NET PAYROLL (THIS MONTH)
                </p>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {payrollData?.total_net_payroll || '$1,485,200'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                    <TrendingUp size={12} />
                    {payrollData?.net_payroll_change || '+2.8% vs last month'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  DISBURSEMENT STATUS
                </p>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {payrollData?.disbursement_status || 'Pending Approval'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Next: {payrollData?.next_pay_date || 'Nov 15, 2026'} scheduled
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  TAXES & DEDUCTIONS WITHHELD
                </p>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {payrollData?.taxes_withheld || '$342,800'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Federal & State statutory withholdings
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  EXPENSE CLAIMS
                </p>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <FileText size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {payrollData?.expense_claims_count ?? 0} Claims
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {payrollData?.expense_claims_subtext || 'Reimbursements & claims'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setCycleTab('All')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        cycleTab === 'All'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Cycles
                    </button>
                    <button
                      onClick={() => setCycleTab('Upcoming')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        cycleTab === 'Upcoming'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Upcoming ({payrollData?.cycles?.filter((c) => c.status === 'ready').length || 0})
                    </button>
                    <button
                      onClick={() => setCycleTab('Processing')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        cycleTab === 'Processing'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Processing
                    </button>
                    <button
                      onClick={() => setCycleTab('Archived')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        cycleTab === 'Archived'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Archived
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter cycles or invoices..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none text-slate-800"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">PAY PERIOD</th>
                        <th className="py-3.5 px-3">PAY DATE</th>
                        <th className="py-3.5 px-3">HEADCOUNT</th>
                        <th className="py-3.5 px-3">GROSS TOTAL</th>
                        <th className="py-3.5 px-3">NET DISBURSEMENT</th>
                        <th className="py-3.5 px-3">STATUS</th>
                        <th className="py-3.5 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredCycles.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-10 text-center text-slate-400">
                            No payroll cycles matching filters.
                          </td>
                        </tr>
                      ) : (
                        filteredCycles.map((c) => {
                          const isReady = c.status === 'ready';
                          const isPaid = c.status === 'paid';
                          const isProc = c.status === 'processing';

                          return (
                            <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900">{c.period_text}</div>
                                <div className="text-[10px] text-slate-400">Semi-Monthly Regular</div>
                              </td>
                              <td className="py-3.5 px-3 font-semibold text-slate-800">
                                {c.pay_date}
                              </td>
                              <td className="py-3.5 px-3 font-semibold text-slate-700">
                                {c.headcount} Staff
                              </td>
                              <td className="py-3.5 px-3 font-bold text-slate-900">
                                {c.gross_total}
                              </td>
                              <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                                {c.net_disbursement}
                              </td>
                              <td className="py-3.5 px-3">
                                {isReady && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    Ready to Run
                                  </span>
                                )}
                                {isPaid && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Paid Out
                                  </span>
                                )}
                                {isProc && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Processing
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {isReady ? (
                                  <button
                                    onClick={() => {
                                      setRunForm({
                                        period_start: c.period_start,
                                        period_end: c.period_end,
                                        pay_date: c.pay_date,
                                      });
                                      setShowRunModal(true);
                                    }}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                  >
                                    Execute
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => addToast(`Opening cycle report for ${c.period_text}`, 'info')}
                                    className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                                  >
                                    View Slip
                                  </button>
                                )}
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
                    Showing <span className="font-bold text-slate-800">{filteredCycles.length}</span> of{' '}
                    <span className="font-bold text-slate-800">{payrollData?.cycles?.length || 0}</span> cycles
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled
                      className="px-3 py-1 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed text-xs font-semibold"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold text-slate-700">1</span>
                    <button
                      disabled
                      className="px-3 py-1 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed text-xs font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Departmental Salary Breakdown</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Assessment of monthly payroll volume by core organizational functional unit.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-xl">
                    Next Cycle Projected
                  </span>
                </div>

                <div className="space-y-3.5 pt-2">
                  {payrollData?.department_breakdown?.map((dept, idx) => {
                    const colors = [
                      'bg-indigo-600',
                      'bg-blue-600',
                      'bg-cyan-600',
                      'bg-amber-600',
                      'bg-emerald-600',
                    ];
                    const colorClass = colors[idx % colors.length];

                    return (
                      <div key={dept.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">
                            {dept.name} <span className="font-normal text-slate-400">({dept.headcount} staff)</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {dept.monthly_salary} <span className="text-slate-400 font-normal">({dept.percent}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`${colorClass} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(dept.percent, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-slate-500 uppercase tracking-wider text-[11px]">
                    Total Allocated Monthly Disbursal:
                  </span>
                  <span className="font-mono text-slate-900 text-sm">
                    {payrollData?.total_monthly_allocated || '$770,000.00 USD'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Approval Checklist</h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    {readyChecklistCount} of 4 Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Verify statutory prerequisites before executing ACH Direct Deposit disbursal.
                </p>

                <div className="space-y-3">
                  {payrollData?.checklist?.map((it) => (
                    <label
                      key={it.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        it.is_completed
                          ? 'border-indigo-100 bg-indigo-50/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={it.is_completed}
                        onChange={() => handleToggleChecklist(it.id, it.is_completed)}
                        className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${it.is_completed ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {it.title}
                        </p>
                        <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">
                          {it.subtitle}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => {
                    addToast('Initiating ACH Direct Deposit batch batch transmission to Silicon Bank.', 'info');
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock size={14} />
                  <span>Initiate Direct Deposits (ACH)</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Expense Claims Queue</h3>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      {payrollData?.claims?.filter((c) => c.status === 'pending').length || 0} pending payout additions
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowClaimModal(true)}
                      className="text-xs font-bold text-indigo-600 hover:underline p-1"
                      title="Add Claim"
                    >
                      + Add
                    </button>
                    <button
                      onClick={handleApproveAllClaims}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 p-1"
                    >
                      Approve All
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {payrollData?.claims?.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {claim.avatar_url ? (
                            <img
                              src={claim.avatar_url}
                              alt={claim.employee_name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                              {claim.employee_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">
                              {claim.employee_name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {claim.department} • {claim.category}
                            </p>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-xs text-slate-900">
                          {claim.amount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {claim.description}
                        </p>
                        {claim.status === 'pending' ? (
                          <button
                            onClick={() => handleApproveClaim(claim.id)}
                            disabled={actionLoadingId === claim.id}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-bold shadow-xs transition-colors"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Approved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Tax Compliance & Bank Gateway</h3>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">W-2/941 Compliance</p>
                    <p className="text-[10.5px] text-slate-400">IRS & State filings up to date</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 size={12} /> 100% compliant
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Silicon Valley Bank ACH</p>
                    <p className="text-[10.5px] text-slate-400">Direct deposit clearing: 48h</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 text-center pt-1">
                  Audit log active • SOC2 Type II Certified • File monthly
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showRunModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowRunModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Run Payroll Cycle</h3>
                <p className="text-xs text-slate-500">Calculate and disburse statutory salaries</p>
              </div>
            </div>

            <form onSubmit={handleRunPayrollSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Period Start <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={runForm.period_start}
                    onChange={(e) => setRunForm({ ...runForm, period_start: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Period End <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={runForm.period_end}
                    onChange={(e) => setRunForm({ ...runForm, period_end: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pay Disbursal Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={runForm.pay_date}
                  onChange={(e) => setRunForm({ ...runForm, pay_date: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Target Headcount:</span>
                  <span className="font-bold text-slate-800">
                    {payrollData?.department_breakdown?.reduce((acc, d) => acc + d.headcount, 0) || 14} Employees
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Estimate:</span>
                  <span className="font-bold text-slate-800">$742,600.00</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRunModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={runningPayroll}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {runningPayroll ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Play size={13} />
                      <span>Execute Disbursement</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">New Expense Claim</h3>
                <p className="text-xs text-slate-500">Record a reimbursement addition for next payroll</p>
              </div>
            </div>

            <form onSubmit={handleCreateClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Claim Amount ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 240.00"
                  value={claimForm.amount}
                  onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category / Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={claimForm.category}
                  onChange={(e) => setClaimForm({ ...claimForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="Product Engineering">Product Engineering</option>
                  <option value="Design & Operations">Design & Operations</option>
                  <option value="Marketing & Growth">Marketing & Growth</option>
                  <option value="Sales & Accounts">Sales & Accounts</option>
                  <option value="General Admin">General Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Purpose <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Software tooling license renewal"
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingClaim ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Log Claim</span>
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
