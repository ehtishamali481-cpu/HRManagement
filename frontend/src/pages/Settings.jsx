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
  Settings as SettingsIcon,
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
  Save,
  Globe,
  MapPin,
  Calendar,
  Lock,
  Smartphone,
  Shield,
  MoreVertical,
  Sliders,
  Key,
  Database,
  ExternalLink,
  Edit2,
  RefreshCw,
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Organization & Policies');

  const [settingsData, setSettingsData] = useState(null);
  const [form, setForm] = useState({
    legal_name: 'Acme Global Technologies Inc.',
    domain: 'acmeglobal.com',
    hq_address: 'San Francisco, CA (HQ Tower - 500 Howard St)',
    timezone: '(GMT-08:00) Pacific Time (US & Canada)',
    currency: 'USD ($) - United States Dollar',
    fiscal_year: 'January 01 - December 31 (Calendar Year)',
    annual_pto_rate: '1.75 days per month (21 days/year equivalent)',
    max_carryover: '5.0 accrued days',
    geofence_enforced: true,
    medical_cert_required: true,
    sso_enforced: true,
    session_timeout: '8 hours of inactivity',
    two_factor_mandatory: true,
    two_factor_grace: true,
  });

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    full_name: '',
    role_label: 'Leave Approver • HR Admin',
  });

  const [showRateModal, setShowRateModal] = useState(false);
  const [rateInput, setRateInput] = useState('');

  const [showCarryoverModal, setShowCarryoverModal] = useState(false);
  const [carryoverInput, setCarryoverInput] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/company/settings');
      setSettingsData(res.data);
      if (res.data?.settings) {
        setForm({
          legal_name: res.data.settings.legal_name,
          domain: res.data.settings.domain,
          hq_address: res.data.settings.hq_address,
          timezone: res.data.settings.timezone,
          currency: res.data.settings.currency,
          fiscal_year: res.data.settings.fiscal_year,
          annual_pto_rate: res.data.settings.annual_pto_rate,
          max_carryover: res.data.settings.max_carryover,
          geofence_enforced: res.data.settings.geofence_enforced,
          medical_cert_required: res.data.settings.medical_cert_required,
          sso_enforced: res.data.settings.sso_enforced,
          session_timeout: res.data.settings.session_timeout,
          two_factor_mandatory: res.data.settings.two_factor_mandatory,
          two_factor_grace: res.data.settings.two_factor_grace,
        });
      }
    } catch (err) {
      addToast('Failed to load workspace settings from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/api/company/settings', form);
      addToast('All workspace configurations updated & synchronized!', 'success');
      await fetchSettings();
    } catch (err) {
      addToast('Failed to save settings changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    setForm((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInviteAdminSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.full_name.trim()) {
      addToast('Please enter administrator full name.', 'error');
      return;
    }
    setInviting(true);
    try {
      await api.post('/api/company/settings/admins', inviteForm);
      addToast(`Administrative privileges granted to ${inviteForm.full_name}!`, 'success');
      setShowInviteModal(false);
      setInviteForm({ full_name: '', role_label: 'Leave Approver • HR Admin' });
      await fetchSettings();
    } catch (err) {
      addToast('Failed to invite administrator.', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleSaveRate = async () => {
    if (!rateInput.trim()) return;
    setForm((prev) => ({ ...prev, annual_pto_rate: rateInput }));
    try {
      await api.put('/api/company/settings', { ...form, annual_pto_rate: rateInput });
      addToast('Annual PTO accrual rate updated.', 'success');
      setShowRateModal(false);
      await fetchSettings();
    } catch (err) {
      addToast('Failed to update accrual rate.', 'error');
    }
  };

  const handleSaveCarryover = async () => {
    if (!carryoverInput.trim()) return;
    setForm((prev) => ({ ...prev, max_carryover: carryoverInput }));
    try {
      await api.put('/api/company/settings', { ...form, max_carryover: carryoverInput });
      addToast('Maximum carryover policy updated.', 'success');
      setShowCarryoverModal(false);
      await fetchSettings();
    } catch (err) {
      addToast('Failed to update carryover policy.', 'error');
    }
  };

  const admins = settingsData?.admins || [];
  const auditLogs = settingsData?.audit_logs || [];
  const integrations = settingsData?.integrations || [];
  const settingsObj = settingsData?.settings;

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
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 text-left transition-all"
              >
                <SettingsIcon size={16} />
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
          onEmployeeAdded={() => fetchSettings()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>ENTERPRISE CONFIGURATION</span>
                <span>/</span>
                <span className="text-indigo-600 font-extrabold">SYSTEM ADMINISTRATION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                HR & Workspace Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Configure organizational policies, work schedules, role-based access permissions, audit logs, and integration webhooks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold shadow-xs">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>All settings synchronized & live</span>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saving ? 'Saving Changes...' : 'Save Configuration Changes'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'Organization & Policies', label: 'Organization & Policies', icon: Building2 },
              { id: 'Work Schedules & Holidays', label: 'Work Schedules & Holidays', icon: Calendar },
              { id: 'Roles & Permissions (RBAC)', label: 'Roles & Permissions (RBAC)', icon: Key },
              { id: 'Compliance & Audit Trail', label: 'Compliance & Audit Trail', icon: ShieldCheck },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <IconComp size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Building2 size={17} />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 tracking-tight">
                        Company Information & Headquarters
                      </h2>
                      <p className="text-xs text-slate-500">
                        Global entity registry, corporate domain, and HQ geofence.
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Primary Legal Entity
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      COMPANY LEGAL NAME
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.legal_name}
                        onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Building2 size={15} className="absolute right-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      ORGANIZATION DOMAIN
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.domain}
                        onChange={(e) => setForm({ ...form, domain: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Globe size={15} className="absolute right-3.5 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    PRIMARY HQ REGISTERED ADDRESS
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.hq_address}
                      onChange={(e) => setForm({ ...form, hq_address: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <MapPin size={15} className="absolute right-3.5 top-3 text-slate-400" />
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white shadow-inner">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">
                            San Francisco HQ • {settingsObj?.office_staff_count || 380}/
                            {settingsObj?.total_staff_count || 520} Office Staff
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Geofence Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Lat {settingsObj?.geofence_lat || '37.7897° N'}, Long {settingsObj?.geofence_lng || '122.3969° W'} • {settingsObj?.geofence_radius || '500m'} Radius
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => addToast('Calibrating precise GPS polygon coordinates.', 'info')}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all self-start sm:self-auto"
                    >
                      Recalibrate
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      DEFAULT TIMEZONE
                    </label>
                    <select
                      value={form.timezone}
                      onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="(GMT-08:00) Pacific Time (US & Canada)">
                        (GMT-08:00) Pacific Time (US & Canada)
                      </option>
                      <option value="(GMT-05:00) Eastern Time (US & Canada)">
                        (GMT-05:00) Eastern Time (US & Canada)
                      </option>
                      <option value="(GMT+00:00) UTC / London">
                        (GMT+00:00) UTC / London
                      </option>
                      <option value="(GMT+05:00) Islamabad, Karachi, Tashkent">
                        (GMT+05:00) Islamabad, Karachi, Tashkent
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      BASE CURRENCY
                    </label>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="USD ($) - United States Dollar">USD ($) - United States Dollar</option>
                      <option value="EUR (€) - European Euro">EUR (€) - European Euro</option>
                      <option value="GBP (£) - British Pound">GBP (£) - British Pound</option>
                      <option value="PKR (Rs) - Pakistani Rupee">PKR (Rs) - Pakistani Rupee</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {form.fiscal_year}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Next Financial Closing cycle initiates Dec 31, 23:59 PST
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => addToast('Opening fiscal period settings.', 'info')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline self-start sm:self-auto"
                  >
                    Adjust Period
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Shield size={17} />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 tracking-tight">
                        Leave & Attendance Governance Policies
                      </h2>
                      <p className="text-xs text-slate-500">
                        Statutory entitlements, rollover rules, geofencing, and validation gates.
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Strict Enforcement Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Annual PTO Accrual Rate</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          Pro-rated Monthly
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {form.annual_pto_rate} credited on 1st of each calendar month.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setRateInput(form.annual_pto_rate);
                        setShowRateModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 self-start sm:self-auto shadow-xs"
                    >
                      <Edit2 size={13} />
                      <span>Edit Rate</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Maximum Carryover Policy</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
                          Auto-expiry Dec 31
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {form.max_carryover} roll over into next cycle. Remaining excess balances auto-forfeited or cashed out.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCarryoverInput(form.max_carryover);
                        setShowCarryoverModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 self-start sm:self-auto shadow-xs"
                    >
                      <Edit2 size={13} />
                      <span>Modify</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Geofence Check-in Verification</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Enforced
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Requires GPS match within 500m of registered office or authenticated corporate VPN for remote shifts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('geofence_enforced')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.geofence_enforced ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          form.geofence_enforced ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Medical Certificate Requirement</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          3+ Days
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mandatory official doctor note or physician signature for sick leaves exceeding 2 consecutive calendar days.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('medical_cert_required')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.medical_cert_required ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          form.medical_cert_required ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Lock size={17} />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 tracking-tight">
                        Security & Access Protocols
                      </h2>
                      <p className="text-xs text-slate-500">
                        SSO identity federation, enterprise session durations, and MFA enforcement.
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                    SOC2 Type II Compliant
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Enterprise Single Sign-On (SSO)
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Active & Enforced
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Okta SAML 2.0 & Google Workspace OAuth active
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('sso_enforced')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.sso_enforced ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          form.sso_enforced ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Okta Directory Sync: Connected
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Google Workspace IdP: Connected
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      Session Timeout Duration
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Terminates idle browser sessions to mitigate unauthorized hijacking.
                    </p>
                    <select
                      value={form.session_timeout}
                      onChange={(e) => setForm({ ...form, session_timeout: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="4 hours of inactivity">4 hours of inactivity</option>
                      <option value="8 hours of inactivity">8 hours of inactivity</option>
                      <option value="12 hours of inactivity">12 hours of inactivity</option>
                      <option value="24 hours of inactivity">24 hours of inactivity</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Mandatory 2FA Policy</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Enforce TOTP authenticator app or hardware FIDO2 keys for all 520 workforce.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-[11px] font-bold text-slate-600">
                        Grace period for new hires: 48h
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggle('two_factor_grace')}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          form.two_factor_grace ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            form.two_factor_grace ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      HR Administrator Access
                    </h3>
                    <p className="text-xs text-slate-500">
                      Personnel with elevated governance rights.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[11px]">
                    {admins.length} Active
                  </span>
                </div>

                <div className="space-y-3">
                  {admins.map((adm) => (
                    <div
                      key={adm.id}
                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/40 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            adm.avatar_url ||
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80'
                          }
                          alt=""
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {adm.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {adm.role_label}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => addToast(`Opening permissions for ${adm.full_name}`, 'info')}
                        className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowInviteModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-indigo-300 text-indigo-600 text-xs font-bold hover:bg-indigo-50/50 transition-all"
                >
                  <PlusCircle size={15} />
                  <span>+ Invite New Admin</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Audit Trail & Compliance
                    </h3>
                    <p className="text-xs text-slate-500">
                      Immutable administrative action history
                    </p>
                  </div>
                  <ShieldCheck size={18} className="text-indigo-600" />
                </div>

                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-medium">
                        <span>{log.created_at}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-snug">
                        <span className="font-bold text-slate-900">{log.actor_name}</span>{' '}
                        {log.action_text}
                      </p>
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          {log.tag_label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addToast('Downloading signed immutable audit log (CSV)...', 'info')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs"
                >
                  <Download size={14} />
                  <span>Download Full Audit Log (.CSV)</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      System Integrations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Active data pipelines & bot hooks
                    </p>
                  </div>
                  <Sparkles size={16} className="text-indigo-600" />
                </div>

                <div className="space-y-3">
                  {integrations.map((integ) => (
                    <div
                      key={integ.id}
                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/40 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{integ.name}</p>
                        <p className="text-[11px] text-slate-500">{integ.subtext}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {integ.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addToast('Opening API keys and webhook manager.', 'info')}
                  className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-1 block"
                >
                  Configure Webhooks & API Keys →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Invite HR Administrator</h3>
                <p className="text-xs text-slate-500">
                  Grant elevated role-based permissions
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteAdminSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrator Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Lin"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Role</label>
                <select
                  value={inviteForm.role_label}
                  onChange={(e) => setInviteForm({ ...inviteForm, role_label: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="HR Director • Super Admin">HR Director • Super Admin</option>
                  <option value="VP People Ops • Super Admin">VP People Ops • Super Admin</option>
                  <option value="Staff Eng Lead • Leave Approver">Staff Eng Lead • Leave Approver</option>
                  <option value="Compensation Officer • Payroll Approver">Compensation Officer • Payroll Approver</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
                Admins receive secure invitations with MFA setup instructions and audit-logged privilege delegation.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {inviting ? 'Granting...' : 'Invite Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Edit Annual PTO Accrual Rate</h3>
              <button onClick={() => setShowRateModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Accrual Formula</label>
              <input
                type="text"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRateModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRate}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                Save Rate
              </button>
            </div>
          </div>
        </div>
      )}

      {showCarryoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Modify Carryover Policy</h3>
              <button onClick={() => setShowCarryoverModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Allowed Days</label>
              <input
                type="text"
                value={carryoverInput}
                onChange={(e) => setCarryoverInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCarryoverModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCarryover}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
