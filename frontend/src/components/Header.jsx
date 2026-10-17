import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  Search,
  Plus,
  Bell,
  Building2,
  LogOut,
  Menu,
  X,
  Lock,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

export default function Header({
  onOpenMobileMenu,
  searchQuery,
  setSearchQuery,
  searchPlaceholder = 'Search employees, ID, team, or...',
  totalStaff = 0,
  companyName,
  onEmployeeAdded,
}) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([
    'Engineering',
    'Product & Design',
    'Sales & Marketing',
    'People & Ops',
  ]);

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

  const isOwner = user?.role === 'owner';

  const handleLogout = () => {
    logout();
    addToast('You have signed out.', 'info');
    navigate('/login');
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
      const res = await api.post('/api/company/employees', formData);
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
      if (onEmployeeAdded) {
        onEmployeeAdded(res.data);
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create employee profile.';
      addToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = user?.full_name || 'Sarah Jenkins';
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Staff';
  const displayCompany = companyName || user?.company_name || 'Acme Global Corp';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full max-w-md hidden sm:block">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery ?? ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-12 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-slate-800 placeholder-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 border border-slate-200 rounded">
              ⌘ K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <Building2 size={13} className="text-slate-400" />
            <span>{displayCompany}</span>
            {totalStaff > 0 && (
              <span className="text-[11px] font-normal text-slate-400">
                ({totalStaff} Staff)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Employee</span>
          </button>

          <button
            type="button"
            onClick={() => addToast('No unread notifications at this time.', 'info')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block"></div>

          <div className="flex items-center gap-2.5 pl-1">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-50 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-50 shrink-0">
                {initial}
              </div>
            )}
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400">
                {displayRole}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Add New Employee
                    </h3>
                    <p className="text-xs text-slate-500">
                      Create employment record and send system login invitation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddEmployeeSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                      1. BASIC PROFILE
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400">Step 1 of 4</span>
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
                      placeholder="e.g. Julianna Varga"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Work Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="j.varga@acmeglobal.com"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="+1 (555) 019-2834"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                      2. ROLE & DEPARTMENT
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400">Step 2 of 4</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Department <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.department_name}
                        onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Job Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.role_title}
                        onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                        placeholder="Senior Distributed Systems Eng"
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Employment Type
                      </label>
                      <select
                        value={formData.employment_type}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                      >
                        <option value="Full-Time">Full-Time (Direct Hire)</option>
                        <option value="Part-Time">Part-Time (Hourly)</option>
                        <option value="Contractor">Contractor (1099)</option>
                        <option value="Internship">Internship</option>
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
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      'Creating Employee...'
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Confirm & Send Invitation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
