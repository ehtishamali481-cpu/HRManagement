import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import api from '../services/api';
import {
  TrendingUp,
  Award,
  Users,
  AlertCircle,
  CalendarCheck,
  CreditCard,
  Settings,
  Building2,
  X,
  ChevronRight,
  Download,
  PlusCircle,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Target,
  ShieldCheck,
  FileText,
  Clock,
  Layers,
  ChevronDown,
  Compass,
  Check,
} from 'lucide-react';

export default function Performance() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [divisionFilter, setDivisionFilter] = useState('All Divisions');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [sendingReminders, setSendingReminders] = useState(false);

  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchingCycle, setLaunchingCycle] = useState(false);
  const [launchForm, setLaunchForm] = useState({
    cycle_name: 'Q1 2027 Comprehensive Talent & OKR Assessment',
    start_date: 'Jan 05, 2027',
    end_date: 'Feb 20, 2027',
  });

  const [showNominateModal, setShowNominateModal] = useState(false);
  const [nominating, setNominating] = useState(false);
  const [nominateForm, setNominateForm] = useState({
    employee_name: '',
    current_role: '',
    proposed_role: '',
    department: 'Engineering',
    rating: 4.8,
  });

  const fetchPerformance = async () => {
    try {
      const res = await api.get('/api/company/performance');
      setPerformanceData(res.data);
    } catch (err) {
      addToast('Failed to load performance metrics from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const handleApprovePromotion = async (candidateId, candName) => {
    setActionLoadingId(candidateId);
    try {
      await api.post(`/api/company/performance/promotions/${candidateId}/approve`);
      addToast(`Promotion approved for ${candName}!`, 'success');
      await fetchPerformance();
    } catch (err) {
      addToast('Failed to approve promotion.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const res = await api.post('/api/company/performance/reminders/send');
      addToast(res.data.message || 'Reminders dispatched to reviewers.', 'success');
    } catch (err) {
      addToast('Failed to send reminders.', 'error');
    } finally {
      setSendingReminders(false);
    }
  };

  const handleLaunchCycleSubmit = async (e) => {
    e.preventDefault();
    setLaunchingCycle(true);
    try {
      await api.post('/api/company/performance/cycles/launch', launchForm);
      addToast('New 360 review cycle launched successfully!', 'success');
      setShowLaunchModal(false);
      await fetchPerformance();
    } catch (err) {
      addToast('Failed to launch review cycle.', 'error');
    } finally {
      setLaunchingCycle(false);
    }
  };

  const handleNominateSubmit = async (e) => {
    e.preventDefault();
    if (!nominateForm.employee_name.trim() || !nominateForm.proposed_role.trim()) {
      addToast('Please complete all candidate fields.', 'error');
      return;
    }
    setNominating(true);
    try {
      await api.post('/api/company/performance/promotions/nominate', nominateForm);
      addToast(`${nominateForm.employee_name} nominated for promotion review!`, 'success');
      setShowNominateModal(false);
      setNominateForm({
        employee_name: '',
        current_role: '',
        proposed_role: '',
        department: 'Engineering',
        rating: 4.8,
      });
      await fetchPerformance();
    } catch (err) {
      addToast('Failed to nominate candidate.', 'error');
    } finally {
      setNominating(false);
    }
  };

  const activeCycle = performanceData?.active_cycle;
  const ratingTiers = performanceData?.rating_tiers || [];
  const deptPerformances = performanceData?.department_performances || [];
  const candidates = performanceData?.promotion_candidates || [];
  const skills = performanceData?.skill_matrix || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased">
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
                onClick={() => navigate('/payroll')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 text-left transition-all"
              >
                <CreditCard size={16} />
                <span>Payroll</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 text-left transition-all"
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

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-white/[0.03]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-slate-400 font-medium">System Operational</span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          companyName={user?.company_name}
          onEmployeeAdded={() => fetchPerformance()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>TALENT HUB</span>
                <span>/</span>
                <span>PERFORMANCE</span>
                <span>/</span>
                <span className="text-indigo-600 font-extrabold">Q4 REVIEW CYCLE</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  Q4 Active Stage
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Organization Performance & Reviews
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Track company-wide OKR achievements, manage 360 review cycles, identify high performers, and monitor promotion pipelines across all operating divisions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => addToast('Exporting comprehensive performance metrics (CSV/PDF)...', 'info')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <Download size={15} />
                <span>Export Performance Metrics</span>
              </button>

              <button
                onClick={() => setShowLaunchModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
              >
                <PlusCircle size={15} />
                <span>+ Launch Review Cycle</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  COMPANY OKR ATTAINMENT
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <Compass size={17} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {performanceData ? `${performanceData.company_okr_attainment}%` : '78.4%'}
                  </span>
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <ArrowUpRight size={13} className="mr-0.5" />
                    {performanceData?.okr_change_pct || '+2.18%'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  vs last month • +3.4% target performance
                </p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${performanceData?.company_okr_attainment || 78.4}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  REVIEWS COMPLETED (ANNUAL)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                  85% Completion
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {performanceData ? performanceData.reviews_completed_count : '442'}
                  </span>
                  <span className="text-base font-bold text-slate-400">
                    / {performanceData ? performanceData.total_reviews_target : '520'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1">
                  <span>Overall Submission: 85%</span>
                  <span className="text-amber-600 font-semibold">24 pending from mgrs</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  PROMOTION CANDIDATES
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Across All Depts
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {candidates.length > 0 ? `${candidates.length} Staff` : '34 Staff'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                      alt=""
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                      alt=""
                    />
                    <img
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=80"
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                      alt=""
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Queued for review</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  AT-RISK / PIP FLAGGED
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                  Action Req.
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-rose-600">
                    {performanceData ? `${performanceData.at_risk_flags_count} Flags` : '12 Flags'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Below target & mentor alerts
                </p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '22%' }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Departmental Performance & Rating Distribution
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Calibrated against Q4 business competencies and normalized calibration benchmarks.
                    </p>
                  </div>
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                    {['All Divisions', 'My Team', 'Tenure View'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setDivisionFilter(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          divisionFilter === tab
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {ratingTiers.map((tier, idx) => {
                      const isHigh = idx === 0;
                      const isMid = idx === 1;
                      return (
                        <div
                          key={tier.tier_name}
                          className={`rounded-xl p-4 border transition-all ${
                            isHigh
                              ? 'bg-indigo-50/40 border-indigo-200/70'
                              : isMid
                              ? 'bg-blue-50/30 border-blue-200/70'
                              : 'bg-amber-50/40 border-amber-200/70'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                isHigh ? 'text-indigo-700' : isMid ? 'text-blue-700' : 'text-amber-700'
                              }`}
                            >
                              {tier.tier_name}
                            </span>
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                                isHigh
                                  ? 'bg-indigo-600 text-white'
                                  : isMid
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-amber-600 text-white'
                              }`}
                            >
                              {tier.percentage}%
                            </span>
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-slate-900">
                            {tier.staff_count} Staff
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-1">
                            {tier.rating_label} • {tier.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-800 tracking-tight">
                          Normalized Rating Curve vs Target Distribution
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Bell curve normalization across verified manager feedback
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                          <span>Actual Curve</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-slate-400"></span>
                          <span>Target Benchmark</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative w-full h-36 flex items-center justify-center">
                      <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 600 120"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line
                          x1="0"
                          y1="110"
                          x2="600"
                          y2="110"
                          stroke="#E2E8F0"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M 20 110 C 150 110, 220 20, 300 20 C 380 20, 450 110, 580 110"
                          fill="url(#curveGradient)"
                        />
                        <path
                          d="M 20 110 C 150 110, 220 20, 300 20 C 380 20, 450 110, 580 110"
                          fill="none"
                          stroke="#4F46E5"
                          strokeWidth="2.5"
                        />
                        <path
                          d="M 20 110 C 160 110, 240 38, 300 38 C 360 38, 440 110, 580 110"
                          fill="none"
                          stroke="#94A3B8"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <circle cx="300" cy="20" r="4" fill="#4F46E5" />
                        <circle cx="180" cy="65" r="3.5" fill="#4F46E5" />
                        <circle cx="420" cy="65" r="3.5" fill="#4F46E5" />
                      </svg>
                    </div>

                    <div className="grid grid-cols-5 text-center text-[10.5px] font-bold text-slate-500 pt-1 border-t border-slate-200/60">
                      <div>1.0 Minimal</div>
                      <div>2.0 Needs Support</div>
                      <div className="text-indigo-600 font-extrabold">3.0 Median</div>
                      <div>4.0 Exceeds</div>
                      <div className="text-emerald-600 font-extrabold">5.0 Exceptional</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 pb-3">
                          <th className="pb-3 font-extrabold">Department</th>
                          <th className="pb-3 font-extrabold text-center">Staff Count</th>
                          <th className="pb-3 font-extrabold">OKR Progress</th>
                          <th className="pb-3 font-extrabold text-center">Avg Rating</th>
                          <th className="pb-3 font-extrabold text-center">Promo Ready</th>
                          <th className="pb-3 font-extrabold text-right">Perf Vector</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {deptPerformances.map((dept) => (
                          <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                              {dept.department_name}
                            </td>
                            <td className="py-3.5 text-center font-medium text-slate-600">
                              {dept.staff_count} staff
                            </td>
                            <td className="py-3.5 min-w-[130px]">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-indigo-600 h-full rounded-full"
                                    style={{ width: `${dept.okr_progress}%` }}
                                  ></div>
                                </div>
                                <span className="font-bold text-slate-700 text-[11px]">
                                  {dept.okr_progress}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 text-center font-bold text-slate-900">
                              <span className="text-indigo-600 font-extrabold">{dept.avg_rating}</span> / 5.0
                            </td>
                            <td className="py-3.5 text-center font-semibold text-slate-700">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                                {dept.promo_ready_count} candidates
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-extrabold text-emerald-600">
                              <span className="inline-flex items-center gap-0.5">
                                <ArrowUpRight size={13} />
                                {dept.perf_vector}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarCheck size={18} className="text-indigo-600" />
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Active 360° Review Cycles & Milestones
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tracking feedback collection stages, cross-functional peer reviews, and sign-offs.
                    </p>
                  </div>

                  <button
                    onClick={handleSendReminders}
                    disabled={sendingReminders}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200/60 disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{sendingReminders ? 'Sending...' : 'Send Reminder to 78 Remaining'}</span>
                  </button>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">
                          {activeCycle?.cycle_name || 'Q4 2026 Annual Talent Assessment'}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {activeCycle?.status || 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Timeline: {activeCycle?.start_date || 'Nov 01, 2026'} -{' '}
                        {activeCycle?.end_date || 'Dec 15, 2026'} ({activeCycle?.days_left || 14} days left)
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-700">85% Completed</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">1. Peer Reviews</span>
                        <span className="text-xs font-black text-emerald-600">
                          {activeCycle?.peer_reviews_pct || 94}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${activeCycle?.peer_reviews_pct || 94}%` }}
                        ></div>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-medium mt-1.5">
                        488 of 520 submitted
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">2. Upward Feedback</span>
                        <span className="text-xs font-black text-emerald-600">
                          {activeCycle?.upward_feedback_pct || 100}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${activeCycle?.upward_feedback_pct || 100}%` }}
                        ></div>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-medium mt-1.5">
                        520 of 520 submitted
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">3. Manager Sign-off</span>
                        <span className="text-xs font-black text-indigo-600">
                          {activeCycle?.manager_signoff_pct || 76}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${activeCycle?.manager_signoff_pct || 76}%` }}
                        ></div>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-medium mt-1.5">
                        395 of 520 signoffs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-900 font-medium">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="text-cyan-600 shrink-0" />
                      <span>{activeCycle?.overdue_note || 'Late submission actions open for 11 Engineering.'}</span>
                    </div>
                    <button
                      onClick={() => addToast('Opening overdue reviewer reports.', 'info')}
                      className="text-cyan-800 hover:text-cyan-950 font-bold underline shrink-0 text-[11px]"
                    >
                      Report overdue reviewers
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Promotion Pipeline
                    </h3>
                    <p className="text-xs text-slate-500">
                      High-performers flagged for committee review
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[11px]">
                      {candidates.length} Total
                    </span>
                    <button
                      onClick={() => setShowNominateModal(true)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-indigo-600 transition-colors"
                      title="Nominate candidate"
                    >
                      <PlusCircle size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {candidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all bg-slate-50/40 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              cand.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">
                                {cand.employee_name}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-50 text-emerald-700">
                                ★ {cand.rating}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {cand.current_role} → <span className="font-bold text-indigo-700">{cand.proposed_role}</span>
                            </p>
                          </div>
                        </div>

                        {cand.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <Check size={12} />
                            Approved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApprovePromotion(cand.id, cand.employee_name)}
                            disabled={actionLoadingId === cand.id}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                          >
                            {actionLoadingId === cand.id ? '...' : 'Approve'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10.5px] text-slate-400 font-medium">
                        <span>{cand.department}</span>
                        <button
                          onClick={() => addToast(`Opening Dossier for ${cand.employee_name}`, 'info')}
                          className="text-slate-600 hover:text-indigo-600 font-semibold underline"
                        >
                          Review Dossier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addToast('Opening full promotion candidate dossiers.', 'info')}
                  className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-2 block"
                >
                  View All {candidates.length} Candidates & Dossiers →
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Skill Matrix Health
                    </h3>
                    <p className="text-xs text-slate-500">
                      Aggregated 360 assessment radar
                    </p>
                  </div>
                  <Target size={16} className="text-indigo-600" />
                </div>

                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{skill.skill_name}</span>
                        <span className="font-black text-indigo-700">{skill.level_label}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${skill.score_percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Retention & HiPo Health
                  </h3>
                  <p className="text-xs text-slate-500">
                    Predictive turnover analytics
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      FLIGHT RISK
                    </span>
                    <div className="text-lg font-black text-emerald-600 mt-1">
                      {performanceData?.flight_risk_label || 'Low'}
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-medium">
                      {performanceData?.retention_index || '94.2% retention index'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      BENCH DEPTH
                    </span>
                    <div className="text-lg font-black text-indigo-600 mt-1">
                      {performanceData?.talent_bench_count || 58} Staff
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-medium">
                      {performanceData?.successors_ready_pct || 78}% successors ready
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/70 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-indigo-900">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>Strategic Recommendation</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-slate-600">
                    {performanceData?.strategic_recommendation ||
                      'Engineering leadership depth has increased by +12% since Q2. Suggest grooming more Associate Engineering Leads before the candidate promotion cycle next month.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showLaunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Launch New 360 Review Cycle</h3>
                <p className="text-xs text-slate-500">
                  Deploy formal peer evaluations, self-ratings, and upward feedback
                </p>
              </div>
              <button
                onClick={() => setShowLaunchModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLaunchCycleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cycle Title</label>
                <input
                  type="text"
                  required
                  value={launchForm.cycle_name}
                  onChange={(e) => setLaunchForm({ ...launchForm, cycle_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="text"
                    required
                    value={launchForm.start_date}
                    onChange={(e) => setLaunchForm({ ...launchForm, start_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="text"
                    required
                    value={launchForm.end_date}
                    onChange={(e) => setLaunchForm({ ...launchForm, end_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
                Launching this cycle automatically notifies all staff, generates 360 feedback forms, and links departmental calibration curves into the PostgreSQL database.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={launchingCycle}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {launchingCycle ? 'Deploying...' : 'Launch Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNominateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Nominate Promotion Candidate</h3>
                <p className="text-xs text-slate-500">
                  Submit candidate to the executive review board
                </p>
              </div>
              <button
                onClick={() => setShowNominateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleNominateSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Julianna Varga"
                  value={nominateForm.employee_name}
                  onChange={(e) => setNominateForm({ ...nominateForm, employee_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fullstack Engineer"
                    value={nominateForm.current_role}
                    onChange={(e) => setNominateForm({ ...nominateForm, current_role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Software Architect"
                    value={nominateForm.proposed_role}
                    onChange={(e) => setNominateForm({ ...nominateForm, proposed_role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={nominateForm.department}
                    onChange={(e) => setNominateForm({ ...nominateForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="People & Ops">People & Ops</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">360 Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={nominateForm.rating}
                    onChange={(e) => setNominateForm({ ...nominateForm, rating: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNominateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={nominating}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {nominating ? 'Submitting...' : 'Nominate Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
