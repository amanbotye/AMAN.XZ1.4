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
  PhoneCall,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Building2,
  Calendar,
  Lock
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

interface ProtectionPlan {
  id: string;
  company_id: string;
  name_ar: string;
  name_en?: string;
  description?: string;
  price: number;
  currency: string;
  duration_days: number;
  is_active: boolean;
  is_visible: boolean;
}

interface PaymentMethod {
  id: string;
  name_ar: string;
  code: string;
  instructions?: string;
  account_name?: string;
  account_identifier?: string;
  display_order: number;
}

interface ProtectionRequestItem {
  id: string;
  customer_id: string;
  customer_number_id: string;
  company_id: string;
  package_id: string;
  payment_method_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_price: number;
  requested_currency: string;
  requested_duration_days: number;
  payment_transfer_reference?: string;
  customer_note?: string;
  rejection_reason?: string;
  created_at: string;
  phone_number?: string;
  package_name?: string;
  payment_method_name?: string;
}

interface ProtectionItem {
  id: string;
  customer_id: string;
  customer_number_id: string;
  company_id: string;
  package_name_snapshot: string;
  price_snapshot: number;
  currency_snapshot: string;
  duration_days_snapshot: number;
  start_at: string;
  end_at: string;
  status: string;
  phone_number?: string;
}

const KNOWN_OPERATORS: Record<string, { nameAr: string; code: string; bg: string; text: string }> = {
  '77': { nameAr: 'يمن موبايل', code: 'YM', bg: 'bg-rose-500/20', text: 'text-rose-400' },
  '78': { nameAr: 'يمن موبايل', code: 'YM', bg: 'bg-rose-500/20', text: 'text-rose-400' },
  '73': { nameAr: 'يو للاتصالات', code: 'YOU', bg: 'bg-amber-500/20', text: 'text-amber-400' },
  '71': { nameAr: 'سبأفون', code: 'SABAFON', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  '70': { nameAr: 'واي', code: 'Y', bg: 'bg-emerald-500/20', text: 'text-emerald-400' }
};

const DEFAULT_PLANS: ProtectionPlan[] = [
  { id: 'p1', company_id: '4262d66c-f6b2-437b-9f45-02123e2306d4', name_ar: 'باقة الحماية الشهرية — يمن موبايل', price: 2500, currency: 'YER', duration_days: 30, is_active: true, is_visible: true },
  { id: 'p2', company_id: '4262d66c-f6b2-437b-9f45-02123e2306d4', name_ar: 'باقة الحماية الربع سنوية — يمن موبايل', price: 7000, currency: 'YER', duration_days: 90, is_active: true, is_visible: true },
  { id: 'p3', company_id: '193c9f07-2781-44e0-96f6-eead97fca93a', name_ar: 'باقة الحماية الشهرية — يو', price: 2500, currency: 'YER', duration_days: 30, is_active: true, is_visible: true },
  { id: 'p4', company_id: 'cdeb5fe5-4733-4732-b678-9dd101f11d88', name_ar: 'باقة الحماية الشهرية — سبأفون', price: 2500, currency: 'YER', duration_days: 30, is_active: true, is_visible: true },
  { id: 'p5', company_id: '69a82a6d-345f-44a1-b46a-33e8098b8c64', name_ar: 'باقة الحماية الشهرية — واي', price: 2500, currency: 'YER', duration_days: 30, is_active: true, is_visible: true }
];

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm1', name_ar: 'حساب الكريمي (Kuraimi)', code: 'KURAIMI', account_identifier: '121456789', instructions: 'إيداع أو تحويل لحساب أمان في بنك الكريمي', display_order: 1 },
  { id: 'pm2', name_ar: 'حساب القطيبي (Qutaibi)', code: 'QUTAIBI', account_identifier: '987654321', instructions: 'تحويل عبر بنك القطيبي الإسلامي', display_order: 2 },
  { id: 'pm3', name_ar: 'محفظة ون كاش (OneCash)', code: 'ONECASH', account_identifier: '771234567', instructions: 'تحويل مباشر لمحفظة ون كاش', display_order: 3 },
  { id: 'pm4', name_ar: 'محفظة جوالي (Jawali)', code: 'JAWALI', account_identifier: '781234567', instructions: 'تحويل فوري عبر تطبيق جوالي', display_order: 4 }
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'device' | 'architecture' | 'logs'>('device');

  // Customer State
  const [customerNavTab, setCustomerNavTab] = useState<'numbers' | 'plans' | 'requests'>('numbers');
  const [numbers, setNumbers] = useState<CustomerNumberItem[]>([]);
  const [plans, setPlans] = useState<ProtectionPlan[]>(DEFAULT_PLANS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [requests, setRequests] = useState<ProtectionRequestItem[]>([]);
  const [protections, setProtections] = useState<ProtectionItem[]>([]);

  // Add Number
  const [isAddingNumber, setIsAddingNumber] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [detectedOp, setDetectedOp] = useState<any>(null);

  // Create Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [targetNumber, setTargetNumber] = useState<CustomerNumberItem | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPmId, setSelectedPmId] = useState('');
  const [transferRef, setTransferRef] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Admin View State
  const [adminViewMode, setAdminViewMode] = useState<'customer' | 'admin'>('customer');
  const [pendingRequestsAdmin, setPendingRequestsAdmin] = useState<ProtectionRequestItem[]>([]);
  const [rejectModalReq, setRejectModalReq] = useState<ProtectionRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // General Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

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
        if (data.user_type === 'admin') setAdminViewMode('admin');
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
      loadAllData(userId);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async (userId: string) => {
    // 1. Numbers
    try {
      const { data: numData } = await supabase
        .from('customer_numbers')
        .select('*')
        .eq('customer_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (numData) {
        const enriched = numData.map((item: any) => ({
          ...item,
          company_name_ar: KNOWN_OPERATORS[item.detected_prefix]?.nameAr || `بادئة ${item.detected_prefix}`,
          company_code: KNOWN_OPERATORS[item.detected_prefix]?.code || 'OP'
        }));
        setNumbers(enriched);
      }
    } catch {}

    // 2. Plans & Payment Methods
    try {
      const { data: planData } = await supabase
        .from('company_packages')
        .select('*')
        .eq('is_active', true)
        .eq('is_visible', true)
        .eq('is_deleted', false);
      if (planData && planData.length) setPlans(planData);
    } catch {}

    try {
      const { data: pmData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .eq('is_deleted', false);
      if (pmData && pmData.length) setPaymentMethods(pmData);
    } catch {}

    // 3. Protection Requests
    try {
      const { data: reqData } = await supabase
        .from('protection_requests')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });
      if (reqData) setRequests(reqData);
    } catch {}

    // 4. Protections
    try {
      const { data: protData } = await supabase
        .from('protections')
        .select('*')
        .eq('customer_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (protData) setProtections(protData);
    } catch {}

    // 5. Admin Pending Requests
    try {
      const { data: adminReqs } = await supabase
        .from('protection_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (adminReqs) setPendingRequestsAdmin(adminReqs);
    } catch {}
  };

  // Real-time phone detection (Stage 2)
  const handlePhoneInputChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length > 9) return;
    setPhoneInput(digits);
    if (digits.length >= 2) {
      const prefix = digits.substring(0, 2);
      const known = KNOWN_OPERATORS[prefix];
      if (known) {
        const isValid = digits.length === 9;
        setDetectedOp({ prefix, nameAr: known.nameAr, code: known.code, isValid });
      } else {
        setDetectedOp({ prefix, nameAr: 'غير مدعوم', code: 'UNKNOWN', isValid: false });
      }
    } else {
      setDetectedOp(null);
    }
  };

  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detectedOp?.isValid) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('rpc_add_customer_number', {
        p_phone_number: phoneInput
      });
      if (error) throw error;
      const res = data as any;
      if (res?.success) {
        setFeedback({ type: 'success', message: 'تم حفظ الرقم بنجاح دون إنشاء حماية تلقائياً.' });
        setPhoneInput('');
        setDetectedOp(null);
        setIsAddingNumber(false);
        if (session?.user) loadAllData(session.user.id);
      } else {
        setFeedback({ type: 'error', message: res?.message || res?.error_code || 'تعذر إضافة الرقم' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Request Modal with Conflict Verification
  const openCreateRequestModal = (num: CustomerNumberItem) => {
    setTargetNumber(num);
    const hasActive = protections.some((p) => p.customer_number_id === num.id && p.status === 'active');
    const hasPending = requests.some((r) => r.customer_number_id === num.id && r.status === 'pending');

    if (hasActive) {
      setConflictWarning('هذا الرقم محمي بالفعل بحماية نشطة ولا يحتاج لطلب حماية جديد.');
    } else if (hasPending) {
      setConflictWarning('يوجد طلب حماية قيد المراجعة (PENDING) لهذا الرقم حالياً.');
    } else {
      setConflictWarning(null);
    }

    const matchingPlans = plans.filter((p) => p.company_id === num.company_id);
    setSelectedPlanId(matchingPlans[0]?.id || plans[0]?.id || '');
    setSelectedPmId(paymentMethods[0]?.id || '');
    setTransferRef('');
    setCustomerNote('');
    setShowRequestModal(true);
  };

  // Submit Protection Request via RPC
  const handleSubmitProtectionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictWarning || !targetNumber || !selectedPlanId || !selectedPmId || !transferRef.trim()) return;

    setActionLoading(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase.rpc('rpc_create_protection_request', {
        p_customer_number_id: targetNumber.id,
        p_package_id: selectedPlanId,
        p_payment_method_id: selectedPmId,
        p_transfer_reference: transferRef.trim(),
        p_customer_note: customerNote.trim() || null
      });

      if (error) throw error;
      const res = data as any;
      if (res?.success) {
        setFeedback({
          type: 'success',
          message: 'تم إرسال طلب الحماية بنجاح، وهو الآن بحالة (قيد المراجعة PENDING) لدى الإدارة.'
        });
        setShowRequestModal(false);
        setCustomerNavTab('requests');
        if (session?.user) loadAllData(session.user.id);
      } else {
        setFeedback({ type: 'error', message: res?.message || res?.error_code || 'تعذر إرسال الطلب' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ أثناء إرسال الطلب' });
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Actions: Approve Request
  const handleApproveRequest = async (reqId: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('rpc_approve_protection_request', {
        p_request_id: reqId
      });
      if (error) throw error;
      const res = data as any;
      if (res?.success) {
        setFeedback({ type: 'success', message: 'تم قبول طلب الحماية وتفعيل الحماية للرقم بنجاح.' });
        if (session?.user) loadAllData(session.user.id);
      } else {
        setFeedback({ type: 'error', message: res?.message || 'فشل قبول الطلب' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ' });
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Actions: Reject Request
  const handleRejectRequest = async () => {
    if (!rejectModalReq || !rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('rpc_reject_protection_request', {
        p_request_id: rejectModalReq.id,
        p_rejection_reason: rejectionReason.trim()
      });
      if (error) throw error;
      const res = data as any;
      if (res?.success) {
        setFeedback({ type: 'success', message: 'تم رفض طلب الحماية وتوثيق السبب.' });
        setRejectModalReq(null);
        setRejectionReason('');
        if (session?.user) loadAllData(session.user.id);
      } else {
        setFeedback({ type: 'error', message: res?.message || 'فشل رفض الطلب' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ' });
    } finally {
      setActionLoading(false);
    }
  };

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
            data: { full_name: fullName.trim(), user_type: 'customer' }
          }
        });
        if (error) throw error;
        await supabase.auth.signInWithPassword({ email: email.trim(), password });
      }
    } catch (err: any) {
      setAuthError(err.message || 'خطأ في المصادقة');
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">AMAN.XZ1</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                المرحلة 3: Protection Plans & Requests
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kotlin Native + Jetpack Compose • Live RPC: rpc_create_protection_request / approve / reject
            </p>
          </div>
        </div>

        {/* View and Mode Selector */}
        <div className="flex items-center gap-2">
          {session && (
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setAdminViewMode('customer')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  adminViewMode === 'customer' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                بوابة العميل
              </button>
              <button
                onClick={() => setAdminViewMode('admin')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  adminViewMode === 'admin' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                لوحة الإدارة ({pendingRequestsAdmin.length})
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-sm">
            <button
              onClick={() => setActiveTab('device')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition ${
                activeTab === 'device' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              جهاز Android
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition ${
                activeTab === 'architecture' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
              }`}
            >
              <Layers className="w-4 h-4" />
              بنية المرحلة 3
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition ${
                activeTab === 'logs' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
              }`}
            >
              <Database className="w-4 h-4" />
              فحص المسار الحي
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex items-center justify-center">
        {activeTab === 'device' && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-5xl w-full">
            {/* Native Android Frame */}
            <div className="w-[390px] h-[750px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col overflow-hidden">
              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
              </div>

              {/* Android Screen Inner */}
              <div className="flex-1 bg-slate-900 rounded-[34px] overflow-hidden flex flex-col relative pt-7">
                {/* Status Bar */}
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
                  adminViewMode === 'admin' ? (
                    /* ADMIN PORTAL SCREEN */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                            ADM
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">إدارة طلبات الحماية</div>
                            <div className="text-[10px] text-amber-400 font-mono">
                              {pendingRequestsAdmin.length} طلبات قيد الانتظار (PENDING)
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => { if (session?.user) loadAllData(session.user.id); }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {feedback && (
                        <div className={`mx-3 mt-2 p-2 rounded-xl text-xs flex items-center justify-between ${
                          feedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                        }`}>
                          <span className="text-[11px]">{feedback.message}</span>
                          <button onClick={() => setFeedback(null)}><X className="w-3.5 h-3.5" /></button>
                        </div>
                      )}

                      {/* Admin Pending Requests List */}
                      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                        {pendingRequestsAdmin.length === 0 ? (
                          <div className="py-12 text-center text-slate-500 text-xs">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                            <div className="font-bold text-slate-300">لا توجد طلبات معلقة حالياً</div>
                            <p className="text-[10px] mt-1 text-slate-500">كافة طلبات الحماية تم مراجعتها واعتمادها.</p>
                          </div>
                        ) : (
                          pendingRequestsAdmin.map((req) => (
                            <div key={req.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-slate-400">طلب: #{req.id.slice(0, 8)}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                                  PENDING
                                </span>
                              </div>

                              <div className="text-xs text-white">
                                <span className="font-bold block text-emerald-400 font-mono">
                                  {req.requested_price} {req.requested_currency} ({req.requested_duration_days} يوماً)
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  مرجع الحوالة: <strong className="text-white font-mono">{req.payment_transfer_reference || '-'}</strong>
                                </span>
                              </div>

                              {req.customer_note && (
                                <div className="text-[10px] text-slate-400 bg-slate-900 p-1.5 rounded-lg">
                                  ملاحظة: {req.customer_note}
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => setRejectModalReq(req)}
                                  disabled={actionLoading}
                                  className="flex-1 py-1.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-950/30 text-xs font-bold transition flex items-center justify-center gap-1"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>رفض الطلب</span>
                                </button>
                                <button
                                  onClick={() => handleApproveRequest(req.id)}
                                  disabled={actionLoading}
                                  className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>قبول واعتماد</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    /* CUSTOMER PORTAL SCREEN */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Customer Top Bar */}
                      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white truncate max-w-[130px]">
                              {profile.full_name || profile.email}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {protections.length} حماية نشطة • {requests.length} طلبات
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { if (session?.user) loadAllData(session.user.id); }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={handleSignOut} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Customer Top Navigation Tabs */}
                      <div className="flex items-center border-b border-slate-800 bg-slate-950 text-[11px] font-bold">
                        <button
                          onClick={() => setCustomerNavTab('numbers')}
                          className={`flex-1 py-2 text-center transition border-b-2 ${
                            customerNavTab === 'numbers' ? 'border-emerald-500 text-emerald-400 bg-slate-900/50' : 'border-transparent text-slate-400'
                          }`}
                        >
                          أرقامي ({numbers.length})
                        </button>
                        <button
                          onClick={() => setCustomerNavTab('requests')}
                          className={`flex-1 py-2 text-center transition border-b-2 ${
                            customerNavTab === 'requests' ? 'border-emerald-500 text-emerald-400 bg-slate-900/50' : 'border-transparent text-slate-400'
                          }`}
                        >
                          الطلبات والحمايات
                        </button>
                        <button
                          onClick={() => setCustomerNavTab('plans')}
                          className={`flex-1 py-2 text-center transition border-b-2 ${
                            customerNavTab === 'plans' ? 'border-emerald-500 text-emerald-400 bg-slate-900/50' : 'border-transparent text-slate-400'
                          }`}
                        >
                          دليل الباقات
                        </button>
                      </div>

                      {/* Toast Feedback */}
                      {feedback && (
                        <div className={`mx-3 mt-2 p-2 rounded-xl text-xs flex items-center justify-between ${
                          feedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                        }`}>
                          <span className="text-[11px] leading-tight">{feedback.message}</span>
                          <button onClick={() => setFeedback(null)}><X className="w-3.5 h-3.5" /></button>
                        </div>
                      )}

                      {/* Tab 1: Numbers & Request Protection Button */}
                      {customerNavTab === 'numbers' && (
                        <div className="flex-1 p-3 overflow-y-auto flex flex-col">
                          {isAddingNumber ? (
                            /* Add Number Form */
                            <form onSubmit={handleAddNumber} className="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-3 mb-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">إضافة رقم هاتف جديد</span>
                                <button onClick={() => setIsAddingNumber(false)} className="text-[11px] text-slate-400">إلغاء</button>
                              </div>
                              <input
                                type="text"
                                value={phoneInput}
                                onChange={(e) => handlePhoneInputChange(e.target.value)}
                                placeholder="77XXXXXXX"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
                              />
                              {detectedOp && (
                                <div className="text-[10px] flex items-center justify-between">
                                  <span className="text-emerald-400">{detectedOp.nameAr}</span>
                                  <span>{detectedOp.isValid ? 'رقم صالح' : 'غير مكتمل'}</span>
                                </div>
                              )}
                              <button
                                type="submit"
                                disabled={actionLoading || !detectedOp?.isValid}
                                className="w-full py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                              >
                                حفظ الرقم
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-white">أرقام الهواتف المسجلة</span>
                              <button
                                onClick={() => setIsAddingNumber(true)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>إضافة رقم</span>
                              </button>
                            </div>
                          )}

                          <div className="space-y-2 flex-1">
                            {numbers.length === 0 ? (
                              <div className="py-10 text-center text-slate-500 text-xs">
                                لا توجد أرقام مسجلة. اضغط "إضافة رقم" للبدء.
                              </div>
                            ) : (
                              numbers.map((num) => {
                                const hasActive = protections.some((p) => p.customer_number_id === num.id && p.status === 'active');
                                const hasPending = requests.some((r) => r.customer_number_id === num.id && r.status === 'pending');

                                return (
                                  <div key={num.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-xs text-white">
                                          {num.normalized_phone_number}
                                        </span>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                          {num.company_name_ar}
                                        </span>
                                      </div>
                                      {hasActive ? (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                                          <Shield className="w-3 h-3" />
                                          <span>محمي</span>
                                        </span>
                                      ) : hasPending ? (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                                          طلب قيد المراجعة
                                        </span>
                                      ) : (
                                        <span className="text-[9px] text-slate-500">غير محمي</span>
                                      )}
                                    </div>

                                    {/* Action to Request Protection */}
                                    <button
                                      onClick={() => openCreateRequestModal(num)}
                                      className="w-full py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                                    >
                                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>طلب باقة حماية لهذا الرقم</span>
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Requests & Protections Status */}
                      {customerNavTab === 'requests' && (
                        <div className="flex-1 p-3 overflow-y-auto space-y-3">
                          {/* Active Protections */}
                          <div>
                            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-emerald-400" />
                              <span>الحمايات النشطة ({protections.length})</span>
                            </h4>
                            {protections.length === 0 ? (
                              <div className="p-3 bg-slate-950/60 rounded-xl text-center text-[11px] text-slate-500">
                                لا توجد حمايات نشطة حالياً.
                              </div>
                            ) : (
                              protections.map((p) => (
                                <div key={p.id} className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl mb-1.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-emerald-300">{p.package_name_snapshot}</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">ACTIVE</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                    صالح حتى: {p.end_at ? p.end_at.slice(0, 10) : '-'}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Submitted Requests */}
                          <div>
                            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>طلبات الحماية المقدمة ({requests.length})</span>
                            </h4>
                            {requests.length === 0 ? (
                              <div className="p-3 bg-slate-950/60 rounded-xl text-center text-[11px] text-slate-500">
                                لا توجد طلبات سابقة.
                              </div>
                            ) : (
                              requests.map((r) => {
                                const [bg, text, label] = r.status === 'pending'
                                  ? ['bg-amber-500/20', 'text-amber-400', 'قيد المراجعة PENDING']
                                  : r.status === 'approved'
                                  ? ['bg-emerald-500/20', 'text-emerald-400', 'معتمد APPROVED']
                                  : ['bg-rose-500/20', 'text-rose-400', 'مرفوض REJECTED'];

                                return (
                                  <div key={r.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl mb-1.5 space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-white">{r.requested_price} {r.requested_currency}</span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${bg} ${text}`}>{label}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      مرجع التحويل: {r.payment_transfer_reference || '-'}
                                    </div>
                                    {r.rejection_reason && (
                                      <div className="text-[10px] text-rose-400 bg-rose-950/30 p-1 rounded">
                                        سبب الرفض: {r.rejection_reason}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Plans Catalog */}
                      {customerNavTab === 'plans' && (
                        <div className="flex-1 p-3 overflow-y-auto space-y-2">
                          <span className="text-xs font-bold text-white block mb-1">دليل باقات الحماية المعتمدة</span>
                          {plans.map((pl) => (
                            <div key={pl.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                              <div>
                                <h5 className="text-xs font-bold text-white">{pl.name_ar}</h5>
                                <span className="text-[10px] text-slate-400 block mt-0.5">المدة: {pl.duration_days} يوماً</span>
                              </div>
                              <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded-lg">
                                {pl.price} {pl.currency}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  /* Auth Form */
                  <div className="flex-1 p-5 flex flex-col justify-center">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h2 className="text-lg font-bold text-white">AMAN — أمان</h2>
                      <p className="text-xs text-slate-400">خدمة تجارية لحماية أرقام الهاتف المحمول</p>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-3">
                      {authMode === 'signup' && (
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="الاسم الكامل"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      )}
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="البريد الإلكتروني"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="كلمة المرور"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 font-bold text-xs text-white"
                      >
                        {authMode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                      </button>
                    </form>
                    <button
                      onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                      className="mt-4 text-xs text-emerald-400 text-center"
                    >
                      {authMode === 'signin' ? 'ليس لديك حساب؟ إنشاء حساب' : 'لديك حساب؟ تسجيل الدخول'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Side Architecture Overview for Stage 3 */}
            <div className="flex-1 max-w-lg space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>المرحلة 3: باقات الحماية ودورة طلبات الحماية (مكتملة وموثقة)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تم بناء دورة طلب الحماية المتكاملة بالكامل: فحص التعارضات، اختيار باقة المشغل، إدخال مرجع الحوالة اليدوية، إرسال الطلب بحالة PENDING عبر <code className="text-emerald-400 font-mono">rpc_create_protection_request</code>، ومراجعة واعتماد الطلب من قبل المشرف عبر <code className="text-emerald-400 font-mono">rpc_approve_protection_request</code> لتفعيل الحماية الفورية وإنشاء مهام الحماية وسجل المعاملة.
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Create RPC</span>
                    <span className="text-emerald-400 truncate block">rpc_create_protection_request</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Approve RPC</span>
                    <span className="text-emerald-400 truncate block">rpc_approve_protection_request</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Reject RPC</span>
                    <span className="text-rose-400 truncate block">rpc_reject_protection_request</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Status Flow</span>
                    <span className="text-amber-400">PENDING → APPROVED</span>
                  </div>
                </div>
              </div>

              {/* Conflict Prevention Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-white mb-2">قواعد منع التعارض المحققة في المرحلة 3:</h3>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  <li>منع تقديم طلب حماية إذا كان الرقم يمتلك حماية نشطة بالفعل (<code className="text-emerald-400 font-mono">ACTIVE_PROTECTION_EXISTS</code>).</li>
                  <li>منع إنشاء طلب جديد لنفس الرقم إذا وجد طلب سابق قيد المراجعة (<code className="text-amber-400 font-mono">PENDING</code>).</li>
                  <li>إلغاء ورفض أي طلبات منافسة لنفس الرقم تلقائياً عند قبول أحد الطلبات.</li>
                  <li>حفظ لقطات الأسعار والمدد (<code className="text-emerald-400 font-mono">price_snapshot, duration_days_snapshot</code>) لحماية العمليات المالية من التغييرات المستقبلية.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: Create Protection Request */}
        {showRequestModal && targetNumber && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">طلب باقة حماية جديدة</span>
                </div>
                <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {conflictWarning ? (
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300 space-y-2 mb-4">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>تنبيه تعارض في الطلب:</span>
                  </div>
                  <p>{conflictWarning}</p>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="w-full py-1.5 bg-slate-800 rounded-lg text-white font-bold"
                  >
                    حسناً، فهمت
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitProtectionRequest} className="space-y-3">
                  <div className="p-2.5 bg-slate-950 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-white">{targetNumber.normalized_phone_number}</span>
                    <span className="text-slate-400">{targetNumber.company_name_ar}</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">اختر باقة الحماية:</label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name_ar} — {p.price} {p.currency} ({p.duration_days} يوماً)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">وسيلة التحويل والدفع:</label>
                    <select
                      value={selectedPmId}
                      onChange={(e) => setSelectedPmId(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {paymentMethods.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                          {pm.name_ar} ({pm.account_identifier})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">رقم مرجع الحوالة أو إشعار الإيداع:</label>
                    <input
                      type="text"
                      required
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="رقم إشعار الحوالة الصادر من البنك/المحفظة"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">ملاحظة للمشرف (اختياري):</label>
                    <input
                      type="text"
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="أي توضيحات للتحويل..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || !transferRef.trim()}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                    >
                      {actionLoading ? 'جاري الإرسال...' : 'إرسال طلب الحماية (PENDING)'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal 2: Admin Reject Dialog */}
        {rejectModalReq && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold text-rose-400">رفض طلب الحماية</span>
                <button onClick={() => setRejectModalReq(null)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                يرجى كتابة سبب الرفض لتوضيحه للعميل في الإشعار وحالة الطلب:
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="مثال: رقم الحوالة غير مطابق، أو المبلغ غير كافٍ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 h-24 mb-3"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRejectModalReq(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleRejectRequest}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {actionLoading ? 'جاري الرفض...' : 'تأكيد الرفض'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
