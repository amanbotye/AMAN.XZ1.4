/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import {
  Shield,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  User as UserIcon,
  Layers,
  Database,
  Phone,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  RefreshCw,
  FolderGit2,
  Info,
  X,
  PhoneCall
} from 'lucide-react';

const SUPABASE_URL = 'https://pvgmtufzvwkdvtbtcijn.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Z210dWZ6dndrZHZ0YnRjaWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDgwMTYsImV4cCI6MjEwNjAyNDAxNn0.Pbn4vm5Zk2evWEhzEiV5buq4g9yLbu8t1orziq5UDeo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  user_type: 'customer' | 'admin';
  status: 'active' | 'suspended' | 'disabled';
  is_deleted: boolean;
  created_at: string;
}

interface CustomerNumberItem {
  id: string;
  customer_id: string;
  phone_number: string;
  normalized_phone_number: string;
  company_id: string;
  detected_prefix: string;
  status: string;
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  company_name_ar?: string;
  company_code?: string;
}

const KNOWN_OPERATORS: Record<string, { nameAr: string; code: string; bg: string; text: string }> = {
  '77': { nameAr: 'يمن موبايل', code: 'YM', bg: 'bg-rose-500/20', text: 'text-rose-400' },
  '78': { nameAr: 'يمن موبايل', code: 'YM', bg: 'bg-rose-500/20', text: 'text-rose-400' },
  '73': { nameAr: 'يو للاتصالات', code: 'YOU', bg: 'bg-amber-500/20', text: 'text-amber-400' },
  '71': { nameAr: 'سبأفون', code: 'SABAFON', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  '70': { nameAr: 'واي', code: 'Y', bg: 'bg-emerald-500/20', text: 'text-emerald-400' }
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'device' | 'architecture' | 'logs'>('device');

  // Customer Numbers State (Stage 2)
  const [customerView, setCustomerView] = useState<'list' | 'add'>('list');
  const [numbers, setNumbers] = useState<CustomerNumberItem[]>([]);
  const [numbersLoading, setNumbersLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [detectedOp, setDetectedOp] = useState<{
    prefix: string;
    nameAr: string;
    code: string;
    isValid: boolean;
    error?: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCode, setFilterCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingNumber, setEditingNumber] = useState<CustomerNumberItem | null>(null);
  const [editNotesText, setEditNotesText] = useState('');

  // 1. Session and Profile verification
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setNumbers([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      } else {
        setProfile({
          id: userId,
          email: session?.user?.email || null,
          username: null,
          full_name: (session?.user?.user_metadata as any)?.full_name || 'مستخدم مسجل',
          user_type: (session?.user?.user_metadata as any)?.user_type === 'admin' ? 'admin' : 'customer',
          status: 'active',
          is_deleted: false,
          created_at: new Date().toISOString()
        });
      }
      fetchCustomerNumbers(userId);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerNumbers = async (userId: string) => {
    setNumbersLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_numbers')
        .select('*')
        .eq('customer_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const enriched = (data as CustomerNumberItem[]).map((item) => {
          const op = KNOWN_OPERATORS[item.detected_prefix] || {
            nameAr: `بادئة ${item.detected_prefix}`,
            code: 'OP'
          };
          return {
            ...item,
            company_name_ar: op.nameAr,
            company_code: op.code
          };
        });
        setNumbers(enriched);
      }
    } catch {
      // ignore
    } finally {
      setNumbersLoading(false);
    }
  };

  // Real-time phone detection (Stage 2)
  const handlePhoneInputChange = async (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length > 9) return;
    setPhoneInput(digits);
    setFeedback(null);

    if (digits.length >= 2) {
      const prefix = digits.substring(0, 2);
      const known = KNOWN_OPERATORS[prefix];

      if (known) {
        const isValid = digits.length === 9;
        setDetectedOp({
          prefix,
          nameAr: known.nameAr,
          code: known.code,
          isValid,
          error: isValid ? undefined : `طول الرقم غير مكتمل (${digits.length}/9 أرقام)`
        });
      } else {
        setDetectedOp({
          prefix,
          nameAr: 'شركة غير مدعومة',
          code: 'UNKNOWN',
          isValid: false,
          error: `البادئة (${prefix}) غير مدعومة في نظام AMAN`
        });
      }
    } else {
      setDetectedOp(null);
    }
  };

  // Submit Add Customer Number via RPC
  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detectedOp?.isValid) {
      setFeedback({ type: 'error', message: 'يرجى إدخال رقم صحيح مكون من 9 أرقام يبدأ ببادئة مدعومة' });
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    try {
      const { data, error } = await supabase.rpc('rpc_add_customer_number', {
        p_phone_number: phoneInput
      });

      if (error) throw error;

      const res = data as any;
      if (res?.success) {
        setFeedback({
          type: 'success',
          message: 'تم حفظ الرقم بنجاح في حسابك دون إنشاء حماية تلقائيًا.'
        });
        setPhoneInput('');
        setDetectedOp(null);
        setCustomerView('list');
        if (session?.user) {
          fetchCustomerNumbers(session.user.id);
        }
      } else {
        const errMap: Record<string, string> = {
          DUPLICATE_OPERATION: 'هذا الرقم مسجل مسبقاً في حسابك',
          COMPANY_NOT_FOUND: 'بادئة الرقم غير تابعة لأي شركة اتصالات مدعومة',
          INVALID_PHONE_LENGTH: 'طول الرقم غير صحيح (يجب أن يكون 9 أرقام)',
          INVALID_PHONE: 'صيغة الرقم غير صالحة',
          FORBIDDEN: 'الحساب غير مؤهل لإضافة أرقام',
          UNAUTHORIZED: 'يجب تسجيل الدخول'
        };
        const msg = errMap[res?.error_code] || res?.message || 'تعذر إضافة الرقم';
        setFeedback({ type: 'error', message: msg });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ أثناء حفظ الرقم' });
    } finally {
      setActionLoading(false);
    }
  };

  // Edit notes
  const handleSaveNotes = async () => {
    if (!editingNumber) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('rpc_update_customer_number_notes', {
        p_customer_number_id: editingNumber.id,
        p_notes: editNotesText.trim()
      });

      if (!error && (data as any)?.success) {
        setFeedback({ type: 'success', message: 'تم تحديث ملاحظات الرقم' });
        setEditingNumber(null);
        if (session?.user) fetchCustomerNumbers(session.user.id);
      } else {
        setFeedback({ type: 'error', message: 'فشل تحديث الملاحظات' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ' });
    } finally {
      setActionLoading(false);
    }
  };

  // Soft delete number
  const handleDeleteNumber = async (numberId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرقم من حسابك؟')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('customer_numbers')
        .update({ is_deleted: true, status: 'inactive' })
        .eq('id', numberId)
        .eq('customer_id', session?.user?.id);

      if (!error) {
        setFeedback({ type: 'success', message: 'تم حذف الرقم بنجاح' });
        if (session?.user) fetchCustomerNumbers(session.user.id);
      } else {
        setFeedback({ type: 'error', message: error.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setActionLoading(true);

    try {
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              user_type: 'customer'
            }
          }
        });
        if (error) throw error;
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
      }
    } catch (err: any) {
      setAuthError(err.message || 'حدث خطأ في عملية المصادقة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    setActionLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setNumbers([]);
    setActionLoading(false);
  };

  // Filtered numbers
  const filteredNumbers = numbers.filter((n) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      n.phone_number.includes(searchQuery) ||
      n.normalized_phone_number.includes(searchQuery) ||
      (n.notes && n.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = filterCode === null || n.company_code === filterCode;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">AMAN.XZ1</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                المرحلة 2: Customer Identity & Phone Numbers
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kotlin Native + Jetpack Compose • Live Supabase RPCs & Data Binding
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-sm">
          <button
            onClick={() => setActiveTab('device')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition ${
              activeTab === 'device'
                ? 'bg-emerald-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            شاشة جهاز Android
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition ${
              activeTab === 'architecture'
                ? 'bg-emerald-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            بنية المرحلة 2 (Kotlin)
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition ${
              activeTab === 'logs'
                ? 'bg-emerald-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            فحص مسار البيانات
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex items-center justify-center">
        {activeTab === 'device' && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-5xl w-full">
            {/* Native Android Frame */}
            <div className="w-[380px] h-[740px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col overflow-hidden">
              {/* Camera Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
              </div>

              {/* Android Screen Inner */}
              <div className="flex-1 bg-slate-900 rounded-[34px] overflow-hidden flex flex-col relative pt-7">
                {/* Top Status Bar */}
                <div className="px-5 py-2 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
                  <span>12:00</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>5G • 100%</span>
                  </div>
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">جاري فحص الجلسة...</span>
                  </div>
                ) : session && profile ? (
                  /* Authenticated Customer View with Phone Numbers */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Customer Top Bar */}
                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white truncate max-w-[140px]">
                            {profile.full_name || profile.email}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {numbers.length} أرقام مسجلة
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (session?.user) fetchCustomerNumbers(session.user.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                          title="تحديث"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          title="خروج"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Feedback Toast */}
                    {feedback && (
                      <div
                        className={`mx-3 mt-2 p-2 rounded-xl text-xs flex items-center justify-between ${
                          feedback.type === 'success'
                            ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                        }`}
                      >
                        <span className="text-[11px] leading-tight">{feedback.message}</span>
                        <button onClick={() => setFeedback(null)}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* View Switcher: Add Number Form vs Numbers List */}
                    {customerView === 'add' ? (
                      /* Add Phone Number Screen */
                      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Phone className="w-4 h-4 text-emerald-400" />
                            <span>إضافة رقم هاتف جديد</span>
                          </h3>
                          <button
                            onClick={() => {
                              setCustomerView('list');
                              setPhoneInput('');
                              setDetectedOp(null);
                            }}
                            className="text-[11px] text-slate-400 hover:text-white"
                          >
                            إلغاء
                          </button>
                        </div>

                        <form onSubmit={handleAddNumber} className="space-y-3">
                          <div>
                            <label className="block text-[11px] text-slate-300 mb-1">
                              أدخل رقم الهاتف المحمول (اليمن)
                            </label>
                            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-emerald-500">
                              <span className="text-xs font-mono font-bold text-slate-400 pl-2 border-l border-slate-800">
                                🇾🇪 +967
                              </span>
                              <input
                                type="text"
                                required
                                value={phoneInput}
                                onChange={(e) => handlePhoneInputChange(e.target.value)}
                                placeholder="77XXXXXXX"
                                className="w-full bg-transparent px-2 text-xs font-mono font-bold text-white focus:outline-none"
                              />
                              <span className="text-[10px] text-slate-500 font-mono">
                                {phoneInput.length}/9
                              </span>
                            </div>
                          </div>

                          {/* Operator Detection Card */}
                          {detectedOp && (
                            <div
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                detectedOp.isValid
                                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    KNOWN_OPERATORS[detectedOp.prefix]?.bg || 'bg-slate-800'
                                  } ${KNOWN_OPERATORS[detectedOp.prefix]?.text || 'text-slate-400'}`}
                                >
                                  {detectedOp.nameAr}
                                </span>
                                <span className="text-[11px]">بادئة: {detectedOp.prefix}</span>
                              </div>
                              {detectedOp.isValid ? (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>صالح</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-rose-400">
                                  {detectedOp.error || 'غير مكتمل'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* AMAN Reference Notice */}
                          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                            <span>
                              وفق المرجع: إضافة الرقم تؤدي إلى حفظه فقط في حسابك دون إنشاء حماية تلقائيًا.
                            </span>
                          </div>

                          <button
                            type="submit"
                            disabled={actionLoading || !detectedOp?.isValid}
                            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white transition flex items-center justify-center gap-2 mt-4"
                          >
                            {actionLoading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>حفظ الرقم في الحساب</span>
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    ) : (
                      /* Customer Numbers List View */
                      <div className="flex-1 p-3 flex flex-col overflow-hidden">
                        {/* Action Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">أرقام هواتفي</span>
                          <button
                            onClick={() => {
                              setCustomerView('add');
                              setPhoneInput('');
                              setDetectedOp(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة رقم</span>
                          </button>
                        </div>

                        {/* Search & Operator Chips */}
                        <div className="mb-2 space-y-1.5">
                          <div className="relative">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="بحث في الأرقام أو الملاحظات..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pr-7 pl-2 text-[11px] text-white focus:outline-none focus:border-emerald-500"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute top-2 right-2" />
                          </div>

                          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                            <button
                              onClick={() => setFilterCode(null)}
                              className={`px-2 py-0.5 rounded-full font-medium transition ${
                                filterCode === null
                                  ? 'bg-slate-200 text-slate-900 font-bold'
                                  : 'bg-slate-950 text-slate-400'
                              }`}
                            >
                              الكل
                            </button>
                            <button
                              onClick={() => setFilterCode('YM')}
                              className={`px-2 py-0.5 rounded-full font-medium transition ${
                                filterCode === 'YM'
                                  ? 'bg-rose-500 text-white font-bold'
                                  : 'bg-slate-950 text-slate-400'
                              }`}
                            >
                              يمن موبايل
                            </button>
                            <button
                              onClick={() => setFilterCode('YOU')}
                              className={`px-2 py-0.5 rounded-full font-medium transition ${
                                filterCode === 'YOU'
                                  ? 'bg-amber-500 text-slate-900 font-bold'
                                  : 'bg-slate-950 text-slate-400'
                              }`}
                            >
                              يو
                            </button>
                            <button
                              onClick={() => setFilterCode('SABAFON')}
                              className={`px-2 py-0.5 rounded-full font-medium transition ${
                                filterCode === 'SABAFON'
                                  ? 'bg-blue-500 text-white font-bold'
                                  : 'bg-slate-950 text-slate-400'
                              }`}
                            >
                              سبأفون
                            </button>
                            <button
                              onClick={() => setFilterCode('Y')}
                              className={`px-2 py-0.5 rounded-full font-medium transition ${
                                filterCode === 'Y'
                                  ? 'bg-emerald-500 text-white font-bold'
                                  : 'bg-slate-950 text-slate-400'
                              }`}
                            >
                              واي
                            </button>
                          </div>
                        </div>

                        {/* Numbers Scroll List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                          {numbersLoading ? (
                            <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                              <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                              <span>جاري تحميل الأرقام...</span>
                            </div>
                          ) : filteredNumbers.length === 0 ? (
                            <div className="py-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                              <PhoneCall className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                              <div className="text-xs font-bold text-slate-300">
                                {numbers.length === 0
                                  ? 'لا توجد أرقام مسجلة حتى الآن'
                                  : 'لا توجد نتائج مطابقة'}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                {numbers.length === 0
                                  ? 'أضف أول رقم هاتف لبدء إدارته وحمايته وفق النظام.'
                                  : 'جرب تغيير كلمة البحث أو إزالة التصفية.'}
                              </p>
                              {numbers.length === 0 && (
                                <button
                                  onClick={() => setCustomerView('add')}
                                  className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold inline-flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>إضافة رقمك الآن</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            filteredNumbers.map((num) => {
                              const op = KNOWN_OPERATORS[num.detected_prefix] || {
                                nameAr: 'مشغل',
                                bg: 'bg-slate-800',
                                text: 'text-slate-300'
                              };

                              return (
                                <div
                                  key={num.id}
                                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 transition flex items-center justify-between"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-xs text-white">
                                        {num.normalized_phone_number}
                                      </span>
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${op.bg} ${op.text}`}
                                      >
                                        {num.company_name_ar || op.nameAr}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                                      <span>بادئة: {num.detected_prefix}</span>
                                      {num.notes && (
                                        <span className="text-slate-400 font-sans truncate max-w-[120px]">
                                          • {num.notes}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingNumber(num);
                                        setEditNotesText(num.notes || '');
                                      }}
                                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                      title="تعديل الملاحظات"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNumber(num.id)}
                                      className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                                      title="حذف الرقم"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* Edit Notes Modal Dialog */}
                    {editingNumber && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-full max-w-[320px] shadow-2xl">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                            <span className="text-xs font-bold text-white">تعديل ملاحظة الرقم</span>
                            <button onClick={() => setEditingNumber(null)}>
                              <X className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>

                          <div className="mb-3 text-xs font-mono font-bold text-emerald-400">
                            {editingNumber.normalized_phone_number} ({editingNumber.company_name_ar})
                          </div>

                          <textarea
                            value={editNotesText}
                            onChange={(e) => setEditNotesText(e.target.value)}
                            placeholder="اكتب ملاحظة للرقم (مثل: رقم العمل، رقم الوالد...)"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500 h-20"
                          />

                          <div className="flex justify-end gap-2 mt-3">
                            <button
                              onClick={() => setEditingNumber(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                            >
                              إلغاء
                            </button>
                            <button
                              onClick={handleSaveNotes}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                            >
                              {actionLoading ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Auth Screen (Login / Register) */
                  <div className="flex-1 p-5 flex flex-col justify-center">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h2 className="text-lg font-bold text-white">AMAN — أمان</h2>
                      <p className="text-xs text-slate-400">خدمة تجارية لحماية أرقام الهاتف المحمول</p>
                    </div>

                    {authError && (
                      <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="space-y-3">
                      {authMode === 'signup' && (
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">الاسم الكامل</label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="محمد علي"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">البريد الإلكتروني</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">كلمة المرور</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition flex items-center justify-center gap-2 mt-4"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : authMode === 'signin' ? (
                          <>
                            <LogIn className="w-4 h-4" />
                            <span>تسجيل الدخول</span>
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-4 h-4" />
                            <span>إنشاء حساب عميل جديد</span>
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-4 text-center">
                      <button
                        onClick={() => {
                          setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                          setAuthError(null);
                        }}
                        className="text-xs text-emerald-400 hover:underline"
                      >
                        {authMode === 'signin'
                          ? 'ليس لديك حساب؟ إنشاء حساب عميل'
                          : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stage 2 Side Architecture Panel */}
            <div className="flex-1 max-w-lg space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>المرحلة 2: هوية العميل وأرقام الهواتف (مكتملة ومربوطة)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تم تنفيذ نماذج Domain و Data، ومستودعات العميل وأرقام الهواتف، وخدمة التحقق من البادئة المعتمدة واستنتاج شركة الاتصالات، وربط إضافة الرقم بالإجراء الموثوق <code className="text-emerald-400 font-mono">rpc_add_customer_number</code> بحيث يؤدي إلى حفظه فقط دون إنشاء حماية تلقائيًا.
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Trusted RPC</span>
                    <span className="text-emerald-400 truncate block">rpc_add_customer_number</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Detection RPC</span>
                    <span className="text-emerald-400 truncate block">detect_company_from_phone</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Table Target</span>
                    <span className="text-slate-200">public.customer_numbers</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Auto Protection</span>
                    <span className="text-amber-400">None (Save Only)</span>
                  </div>
                </div>
              </div>

              {/* Supported Companies Info */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-white mb-2">شركات الاتصالات والبادئات المعتمدة:</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                    <span className="font-bold text-rose-300">يمن موبايل</span>
                    <span className="font-mono text-[10px] text-rose-400">77, 78 (9 أرقام)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <span className="font-bold text-amber-300">يو للاتصالات</span>
                    <span className="font-mono text-[10px] text-amber-400">73 (9 أرقام)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                    <span className="font-bold text-blue-300">سبأفون</span>
                    <span className="font-mono text-[10px] text-blue-400">71 (9 أرقام)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <span className="font-bold text-emerald-300">واي للاتصالات</span>
                    <span className="font-mono text-[10px] text-emerald-400">70 (9 أرقام)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-emerald-400" />
              <span>ملفات وحزم المرحلة 2 في مشروع Android الأصلي</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block text-sm">📁 domain/models/</span>
                <p className="text-slate-400 text-[11px] font-sans">نماذج النطاق النظيفة الخالية من التبعيات:</p>
                <ul className="text-slate-300 space-y-1 pl-4 list-disc">
                  <li>User.kt & Customer.kt (كيان العميل)</li>
                  <li>CustomerNumber.kt (كيان الرقم وتنسيقه)</li>
                  <li>Company.kt (كيان شركة الاتصالات)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block text-sm">📁 data/repository/ & service/</span>
                <p className="text-slate-400 text-[11px] font-sans">مستودعات البيانات وخدمة فحص الأرقام:</p>
                <ul className="text-slate-300 space-y-1 pl-4 list-disc">
                  <li>CustomerRepository.kt (بيانات العميل)</li>
                  <li>CustomerNumberRepository.kt (إضافة، تعديل، حذف)</li>
                  <li>PhoneValidationService.kt (التحقق والبادئات)</li>
                  <li>CustomerNumberDto.kt & CompanyDto.kt</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block text-sm">📁 presentation/customer/</span>
                <p className="text-slate-400 text-[11px] font-sans">واجهات شاشات العميل ومكوناتها:</p>
                <ul className="text-slate-300 space-y-1 pl-4 list-disc">
                  <li>CustomerViewModel.kt & CustomerUiState.kt</li>
                  <li>screens/CustomerNumbersScreen.kt</li>
                  <li>screens/AddNumberScreen.kt</li>
                  <li>components/PhoneInputField.kt</li>
                  <li>components/CompanyBadge.kt & NumberItemCard.kt</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block text-sm">📁 navigation/ & app/</span>
                <p className="text-slate-400 text-[11px] font-sans">ربط التنقل والتسجيل المركزي:</p>
                <ul className="text-slate-300 space-y-1 pl-4 list-disc">
                  <li>AmanDestination.kt (CustomerNumbers, AddNumber)</li>
                  <li>AmanApplication.kt (تسجيل المستودعات)</li>
                  <li>MainActivity.kt & AmanMainApp.kt</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>فحص مسار المرحلة 2: تسجيل الدخول → بيانات العميل → أرقام العميل → التحقق من الرقم → حفظ الرقم → عرض الرقم</span>
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">1. تسجيل الدخول وبيانات العميل</span>
                  <span className="text-slate-400 text-[11px]">Auth → SELECT * FROM users WHERE id = auth.uid()</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px]">
                  {profile ? `Logged in: ${profile.user_type}` : 'Unauthenticated'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">2. التحقق اللحظي من بادئة الرقم</span>
                  <span className="text-slate-400 text-[11px]">RPC: detect_company_from_phone(p_normalized_phone)</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px]">
                  HTTP 200 OK
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">3. حفظ الرقم الموثوق دون إنشاء حماية</span>
                  <span className="text-slate-400 text-[11px]">RPC: rpc_add_customer_number(p_phone_number)</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px]">
                  Save Only Verified
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">4. قراءة وعرض أرقام العميل النشطة</span>
                  <span className="text-slate-400 text-[11px]">SELECT * FROM customer_numbers WHERE is_deleted = false</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px]">
                  {numbers.length} Numbers Loaded
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
