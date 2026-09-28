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
  Lock,
  Bell,
  CheckSquare,
  Play,
  RotateCcw,
  Copy,
  ExternalLink
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

// Stage 4: Tasks & Notifications
interface PaymentTaskItem {
  id: string;
  protection_id: string;
  customer_id: string;
  customer_number_id: string;
  company_id: string;
  task_number: number;
  task_type: string;
  amount: number;
  currency: string;
  scheduled_at: string;
  due_at: string;
  status: string;
  completed_at?: string | null;
  completed_by?: string | null;
  execution_note?: string | null;
  source_task_interval_days: number;
  created_at: string;
  phone_number?: string;
  company_name?: string;
}

interface NotificationItem {
  id: string;
  user_id?: string;
  notification_type?: string;
  title: string;
  body: string;
  related_request_id?: string;
  related_protection_id?: string;
  related_task_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
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
  { id: 'pm1', name_ar: 'بنك الكريمي للتمويل الأصغر الإسلامي', code: 'KURAIMI', account_name: 'خدمة أمان لحماية الأرقام', account_identifier: '300123456', instructions: 'إيداع أو تحويل لحساب أمان عبر تطبيق كريمي جوال أو أقرب فرع.', display_order: 1 },
  { id: 'pm2', name_ar: 'بنك القطيبي الإسلامي للتمويل الأصغر', code: 'QUTAIBI', account_name: 'أمان لخدمات الاتصالات', account_identifier: '120889900', instructions: 'تحويل عبر تطبيق قطيبي لحظات متاح 24/7.', display_order: 2 },
  { id: 'pm3', name_ar: 'محفظة ون كاش (OneCash)', code: 'ONECASH', account_name: 'محفظة أمان الرسمية', account_identifier: '770001122', instructions: 'تحويل مباشر من محفظتك إلى رقم محفظة الخدمة.', display_order: 3 },
  { id: 'pm4', name_ar: 'محفظة جوالي (Jawwali)', code: 'JAWWALI', account_name: 'إدارة أمان لحماية الأرقام', account_identifier: '730002233', instructions: 'تحويل سريع عبر تطبيق جوالي التابع لبنك اليمن والكويت.', display_order: 4 }
];

// Helper: Resolve Task Status (UPCOMING → DUE_SOON → DUE → OVERDUE → COMPLETED / CANCELLED)
function resolveTaskStatus(status: string, dueAtStr: string) {
  if (status === 'completed') return { code: 'COMPLETED', label: 'مكتملة', bg: 'bg-emerald-500/20', text: 'text-emerald-400' };
  if (status === 'cancelled') return { code: 'CANCELLED', label: 'ملغاة', bg: 'bg-slate-500/20', text: 'text-slate-400' };

  const now = new Date().getTime();
  const due = new Date(dueAtStr).getTime();
  const diffHours = (due - now) / (1000 * 3600);

  if (diffHours < 0) {
    return { code: 'OVERDUE', label: 'متأخرة', bg: 'bg-red-500/20', text: 'text-red-400' };
  } else if (diffHours <= 24) {
    return { code: 'DUE', label: 'مستحقة الآن', bg: 'bg-amber-500/20', text: 'text-amber-400' };
  } else if (diffHours <= 72) {
    return { code: 'DUE_SOON', label: 'مستحقة قريباً', bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
  }
  return { code: 'UPCOMING', label: 'قادمة / مجدولة', bg: 'bg-sky-500/20', text: 'text-sky-400' };
}

// Helper: Calculate Renewal Health (🟢 آمن → 🟡 قريب → 🔴 خطر → ⚫ منتهي)
function calculateRenewalHealth(endAtStr: string) {
  if (!endAtStr) return { health: 'EXPIRED', symbol: '⚫', label: 'منتهي', days: 0, color: 'text-slate-400', bg: 'bg-slate-800' };
  const now = new Date().getTime();
  const end = new Date(endAtStr).getTime();
  const days = Math.ceil((end - now) / (1000 * 86400));

  if (days <= 0) {
    return { health: 'EXPIRED', symbol: '⚫', label: 'منتهي', days: 0, color: 'text-slate-400', bg: 'bg-slate-800' };
  } else if (days < 7) {
    return { health: 'DANGER', symbol: '🔴', label: 'خطر', days, color: 'text-red-400', bg: 'bg-red-950/60' };
  } else if (days <= 14) {
    return { health: 'SOON', symbol: '🟡', label: 'قريب', days, color: 'text-amber-400', bg: 'bg-amber-950/60' };
  }
  return { health: 'SAFE', symbol: '🟢', label: 'آمن', days, color: 'text-emerald-400', bg: 'bg-emerald-950/60' };
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'device' | 'architecture' | 'logs'>('device');

  // Customer State
  const [customerNavTab, setCustomerNavTab] = useState<'numbers' | 'protections' | 'plans' | 'payments' | 'notifications'>('numbers');
  const [numbers, setNumbers] = useState<CustomerNumberItem[]>([]);
  const [plans, setPlans] = useState<ProtectionPlan[]>(DEFAULT_PLANS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [requests, setRequests] = useState<ProtectionRequestItem[]>([]);
  const [protections, setProtections] = useState<ProtectionItem[]>([]);
  const [clientNotifications, setClientNotifications] = useState<NotificationItem[]>([]);

  // Stage 4: Tasks
  const [adminTasks, setAdminTasks] = useState<PaymentTaskItem[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'due' | 'overdue' | 'upcoming' | 'completed'>('all');
  const [taskSearch, setTaskSearch] = useState('');
  const [executingTask, setExecutingTask] = useState<PaymentTaskItem | null>(null);
  const [executionNote, setExecutionNote] = useState('');
  const [reschedulingTask, setReschedulingTask] = useState<PaymentTaskItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

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
  const [adminNavTab, setAdminNavTab] = useState<'requests' | 'tasks' | 'notifications'>('requests');
  const [pendingRequestsAdmin, setPendingRequestsAdmin] = useState<ProtectionRequestItem[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<NotificationItem[]>([]);
  const [rejectModalReq, setRejectModalReq] = useState<ProtectionRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // General Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        .eq('is_deleted', false)
        .order('display_order', { ascending: true });
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

    // 5. Notifications
    try {
      const { data: notifData } = await supabase
        .from('client_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (notifData) setClientNotifications(notifData);
    } catch {}

    // 6. Admin Data
    try {
      const { data: adminReqs } = await supabase
        .from('protection_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (adminReqs) setPendingRequestsAdmin(adminReqs);
    } catch {}

    try {
      const { data: tasksData } = await supabase
        .from('protection_tasks')
        .select('*')
        .order('due_at', { ascending: true });
      if (tasksData) setAdminTasks(tasksData);
    } catch {}

    try {
      const { data: aNotifData } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (aNotifData) setAdminNotifications(aNotifData);
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
    if (!targetNumber || !selectedPlanId || !selectedPmId || !transferRef.trim()) return;

    setActionLoading(true);
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
          message: 'تم إرسال طلب الحماية بنجاح بحالة (PENDING) وإشعار الإدارة لمراجعة التحويل.'
        });
        setShowRequestModal(false);
        setCustomerNavTab('protections');
        if (session?.user) loadAllData(session.user.id);
      } else {
        setFeedback({ type: 'error', message: res?.message || res?.error_code || 'فشل تقديم الطلب' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ أثناء تقديم الطلب' });
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Approve Request
  const handleApproveRequest = async (reqId: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('rpc_approve_protection_request', {
        p_request_id: reqId
      });
      if (error) throw error;
      const res = data as any;
      if (res?.success) {
        setFeedback({
          type: 'success',
          message: 'تم اعتماد الطلب بنجاح، وتفعيل الحماية، وإنشاء المهمة التشغيلية الأولى تلقائياً.'
        });
        if (session?.user) loadAllData(session.user.id);
      } else {
        setFeedback({ type: 'error', message: res?.message || res?.error_code || 'فشل الاعتماد' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ أثناء الاعتماد' });
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Reject Request
  const handleRejectRequest = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setFeedback({ type: 'success', message: 'تم رفض الطلب وتوثيق السبب وإشعار العميل.' });
        setRejectModalReq(null);
        setRejectionReason('');
        if (session?.user) loadAllData(session.user.id);
      } else {
        setFeedback({ type: 'error', message: res?.message || res?.error_code || 'فشل الرفض' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ أثناء الرفض' });
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 4: Admin Execute Task
  const handleExecuteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executingTask) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('rpc_execute_task', {
        p_task_id: executingTask.id,
        p_execution_note: executionNote.trim() || null
      });
      if (error) throw error;
      const res = data as any;
      if (res?.success) {
        setFeedback({
          type: 'success',
          message: 'تم تنفيذ المهمة التشغيلية بنجاح، وتسجيل القيد المالي، وإنشاء المهمة الدورية التالية.'
        });
        setExecutingTask(null);
        setExecutionNote('');
        if (session?.user) loadAllData(session.user.id);
      } else {
        setFeedback({ type: 'error', message: res?.error_code || 'تعذر تنفيذ المهمة' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ أثناء التنفيذ' });
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 4: Admin Reschedule Task
  const handleRescheduleTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingTask || !rescheduleDate) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('rpc_reschedule_task', {
        p_task_id: reschedulingTask.id,
        p_new_scheduled_at: new Date(rescheduleDate).toISOString(),
        p_reason: rescheduleReason.trim() || null
      });
      if (error) throw error;
      const res = data as any;
      if (res?.success) {
        setFeedback({
          type: 'success',
          message: 'تمت إعادة جدولة المهمة وتحديث الخطط المستقبلية وتوثيق السجل بنجاح.'
        });
        setReschedulingTask(null);
        setRescheduleDate('');
        setRescheduleReason('');
        if (session?.user) loadAllData(session.user.id);
      } else {
        setFeedback({ type: 'error', message: res?.error_code || 'تعذر إعادة الجدولة' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ أثناء إعادة الجدولة' });
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 4: Mark Notification Read
  const handleMarkNotificationRead = async (notifId: string, isAdmin: boolean) => {
    try {
      const rpcName = isAdmin ? 'rpc_mark_admin_notification_read' : 'rpc_mark_notification_read';
      await supabase.rpc(rpcName, { p_notification_id: notifId });
      if (isAdmin) {
        setAdminNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)));
      } else {
        setClientNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)));
      }
    } catch {}
  };

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setActionLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        setFeedback({ type: 'success', message: 'تم إنشاء الحساب بنجاح، مرحباً بك في أمان.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || 'فشلت عملية المصادقة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter tasks
  const filteredTasks = adminTasks.filter((t) => {
    const statusObj = resolveTaskStatus(t.status, t.due_at);
    if (taskFilter === 'due' && statusObj.code !== 'DUE' && statusObj.code !== 'DUE_SOON') return false;
    if (taskFilter === 'overdue' && statusObj.code !== 'OVERDUE') return false;
    if (taskFilter === 'upcoming' && statusObj.code !== 'UPCOMING') return false;
    if (taskFilter === 'completed' && statusObj.code !== 'COMPLETED') return false;

    if (taskSearch.trim()) {
      const q = taskSearch.trim().toLowerCase();
      const matchPhone = t.phone_number?.toLowerCase().includes(q);
      const matchComp = t.company_name?.toLowerCase().includes(q);
      const matchNum = t.task_number.toString() === q;
      if (!matchPhone && !matchComp && !matchNum) return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden dir-rtl" dir="rtl">
      {/* Sidebar Controls */}
      <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide flex items-center gap-2">
                AMAN.XZ1
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  STAGE 4
                </span>
              </h1>
              <p className="text-xs text-slate-400">نظام حماية أرقام الهواتف المحمولة</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => setActiveTab('device')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'device' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-medium' : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>واجهة محاكي التطبيق (Android)</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'architecture' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-medium' : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>مخطط النطاق و RPCs (Stage 4)</span>
            </button>
          </div>

          {session && (
            <div className="mt-6 p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-slate-400">المستخدم الحالي:</span>
                <span className="font-medium text-slate-200">{profile?.full_name || session.user.email}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">الصلاحية:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${profile?.user_type === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {profile?.user_type === 'admin' ? 'مشرف ADMIN' : 'عميل CUSTOMER'}
                </span>
              </div>
              {profile?.user_type === 'admin' && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">عرض واجهة:</label>
                  <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setAdminViewMode('customer')}
                      className={`py-1 text-xs rounded transition-all ${adminViewMode === 'customer' ? 'bg-emerald-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      بوابة العميل
                    </button>
                    <button
                      onClick={() => setAdminViewMode('admin')}
                      className={`py-1 text-xs rounded transition-all ${adminViewMode === 'admin' ? 'bg-amber-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      بوابة الإدارة
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          {session ? (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-red-400 bg-red-950/20 border border-red-900/30 hover:bg-red-900/40 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 text-center">
              نظام مصادقة مباشر متصل بقاعدة بيانات Supabase Live
            </div>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Top Status Bar */}
        <div className="h-12 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Supabase Live Connected:</span>
            <code className="text-slate-300 font-mono text-[11px]">pvgmtufzvwkdvtbtcijn.supabase.co</code>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              RPC: rpc_execute_task & rpc_reschedule_task
            </span>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div className={`px-4 py-2 text-xs flex items-center justify-between ${feedback.type === 'success' ? 'bg-emerald-950 border-b border-emerald-800 text-emerald-200' : 'bg-red-950 border-b border-red-800 text-red-200'}`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start">
          {activeTab === 'device' && (
            <div className="w-[420px] h-[820px] bg-slate-900 rounded-[40px] border-4 border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
              {/* Phone Speaker Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* In-Phone Screen Content */}
              <div className="flex-1 flex flex-col pt-7 overflow-hidden bg-slate-950 text-slate-100">
                {!session ? (
                  /* Auth Screen */
                  <div className="flex-1 p-6 flex flex-col justify-center">
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950 mb-3">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-white">خدمة أمان — حماية الأرقام</h2>
                      <p className="text-xs text-slate-400 mt-1">سجل الدخول لإدارة أرقامك أو المهام التشغيلية</p>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-3">
                      {authMode === 'signup' && (
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">الاسم الكامل</label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            placeholder="محمد عبد الله"
                            required
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">البريد الإلكتروني</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          placeholder="user@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">كلمة المرور</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      {authError && <div className="text-red-400 text-xs p-2 rounded-lg bg-red-950/30 border border-red-900/40">{authError}</div>}

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
                      >
                        {actionLoading ? 'جاري التحقق...' : authMode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
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
                        {authMode === 'signin' ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                      </button>
                    </div>
                  </div>
                ) : profile?.user_type === 'admin' && adminViewMode === 'admin' ? (
                  /* Admin Interface */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Admin Header */}
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                          ADM
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white leading-none">{profile.full_name || 'مشرف النظام'}</div>
                          <div className="text-[10px] text-amber-400 mt-0.5">لوحة متابعة العمليات والمهام</div>
                        </div>
                      </div>
                      <button onClick={() => loadAllData(session.user.id)} className="p-1.5 text-slate-400 hover:text-white">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Admin Tabs */}
                    <div className="flex border-b border-slate-800 bg-slate-900/40 text-xs">
                      <button
                        onClick={() => setAdminNavTab('requests')}
                        className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${adminNavTab === 'requests' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-transparent text-slate-400'}`}
                      >
                        طلبات الحماية ({pendingRequestsAdmin.length})
                      </button>
                      <button
                        onClick={() => setAdminNavTab('tasks')}
                        className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${adminNavTab === 'tasks' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400'}`}
                      >
                        المهام التشغيلية ({adminTasks.length})
                      </button>
                      <button
                        onClick={() => setAdminNavTab('notifications')}
                        className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${adminNavTab === 'notifications' ? 'border-sky-500 text-sky-400 bg-sky-500/10' : 'border-transparent text-slate-400'}`}
                      >
                        الإشعارات ({adminNotifications.filter((n) => !n.is_read).length})
                      </button>
                    </div>

                    {/* Admin Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {adminNavTab === 'requests' && (
                        <>
                          <div className="text-xs font-semibold text-slate-300 mb-2">طلبات الحماية المعلقة (Pending)</div>
                          {pendingRequestsAdmin.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs">لا توجد طلبات معلقة بانتظار الاعتماد</div>
                          ) : (
                            pendingRequestsAdmin.map((req) => (
                              <div key={req.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-xs font-bold text-white">{req.phone_number || 'رقم هاتف'}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    PENDING
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400">مرجع الحوالة: <span className="font-mono text-slate-200">{req.payment_transfer_reference}</span></div>
                                <div className="text-[11px] text-slate-400">المبلغ: <span className="text-emerald-400 font-bold">{req.requested_price} YER</span></div>
                                <div className="flex gap-2 pt-2 border-t border-slate-800">
                                  <button
                                    onClick={() => handleApproveRequest(req.id)}
                                    disabled={actionLoading}
                                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                                  >
                                    اعتماد وتفعيل
                                  </button>
                                  <button
                                    onClick={() => setRejectModalReq(req)}
                                    className="flex-1 py-1.5 rounded-lg bg-red-950/40 border border-red-900/40 text-red-400 hover:bg-red-900/40 text-xs font-medium"
                                  >
                                    رفض الطلب
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </>
                      )}

                      {adminNavTab === 'tasks' && (
                        <>
                          {/* Task Filters */}
                          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
                            {(['all', 'due', 'overdue', 'upcoming', 'completed'] as const).map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setTaskFilter(tab)}
                                className={`px-2.5 py-1 rounded-lg shrink-0 ${taskFilter === tab ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                              >
                                {tab === 'all' ? 'الكل' : tab === 'due' ? 'مستحقة' : tab === 'overdue' ? 'متأخرة' : tab === 'upcoming' ? 'مجدولة' : 'مكتملة'}
                              </button>
                            ))}
                          </div>

                          {/* Search */}
                          <input
                            type="text"
                            value={taskSearch}
                            onChange={(e) => setTaskSearch(e.target.value)}
                            placeholder="بحث برقم الهاتف أو الشركة..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                          />

                          {filteredTasks.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs">لا توجد مهام تشغيلية مطابقة</div>
                          ) : (
                            filteredTasks.map((t) => {
                              const s = resolveTaskStatus(t.status, t.due_at);
                              return (
                                <div key={t.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-5 h-5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                                        #{t.task_number}
                                      </span>
                                      <span className="text-xs font-bold text-white">{t.phone_number || 'رقم محمي'}</span>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${s.bg} ${s.text}`}>
                                      {s.label}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg">
                                    <div>الاستحقاق: <span className="text-slate-200">{t.due_at?.substring(0, 10)}</span></div>
                                    <div>المبلغ: <span className="text-emerald-400 font-bold">{t.amount} {t.currency}</span></div>
                                  </div>
                                  {t.status === 'completed' && t.execution_note && (
                                    <div className="text-[10px] text-slate-400 bg-slate-800/40 p-1.5 rounded">
                                      ملاحظة: {t.execution_note}
                                    </div>
                                  )}
                                  {t.status !== 'completed' && (
                                    <div className="flex gap-2 pt-1 border-t border-slate-800">
                                      <button
                                        onClick={() => setExecutingTask(t)}
                                        className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center gap-1"
                                      >
                                        <Play className="w-3 h-3" />
                                        <span>تنفيذ المهمة</span>
                                      </button>
                                      <button
                                        onClick={() => setReschedulingTask(t)}
                                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>إعادة جدولة</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </>
                      )}

                      {adminNavTab === 'notifications' && (
                        <div className="space-y-2">
                          {adminNotifications.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs">لا توجد إشعارات للإدارة</div>
                          ) : (
                            adminNotifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleMarkNotificationRead(notif.id, true)}
                                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${notif.is_read ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-900 border-amber-500/40 text-slate-200'}`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-white">{notif.title}</span>
                                  {!notif.is_read && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                                </div>
                                <div className="text-[11px] text-slate-300">{notif.body}</div>
                                <div className="text-[10px] text-slate-500 mt-1">{notif.created_at?.substring(0, 16).replace('T', ' ')}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Customer Interface */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Customer Header */}
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {profile?.full_name?.substring(0, 2) || 'أمان'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white leading-none">{profile?.full_name || 'حساب العميل'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">بوابة العميل الرسمية</div>
                        </div>
                      </div>
                      <button onClick={() => loadAllData(session.user.id)} className="p-1.5 text-slate-400 hover:text-white">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Customer Tabs */}
                    <div className="flex border-b border-slate-800 bg-slate-900/40 text-[11px]">
                      <button
                        onClick={() => setCustomerNavTab('numbers')}
                        className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${customerNavTab === 'numbers' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400'}`}
                      >
                        أرقامي ({numbers.length})
                      </button>
                      <button
                        onClick={() => setCustomerNavTab('protections')}
                        className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${customerNavTab === 'protections' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400'}`}
                      >
                        الحمايات ({protections.length})
                      </button>
                      <button
                        onClick={() => setCustomerNavTab('plans')}
                        className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${customerNavTab === 'plans' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400'}`}
                      >
                        الباقات
                      </button>
                      <button
                        onClick={() => setCustomerNavTab('payments')}
                        className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${customerNavTab === 'payments' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400'}`}
                      >
                        الدفع
                      </button>
                      <button
                        onClick={() => setCustomerNavTab('notifications')}
                        className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${customerNavTab === 'notifications' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-400'}`}
                      >
                        الإشعارات {clientNotifications.filter((n) => !n.is_read).length > 0 && `(${clientNotifications.filter((n) => !n.is_read).length})`}
                      </button>
                    </div>

                    {/* Customer Tab Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {customerNavTab === 'numbers' && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-300">قائمة الأرقام المسجلة</span>
                            <button
                              onClick={() => setIsAddingNumber(!isAddingNumber)}
                              className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>إضافة رقم</span>
                            </button>
                          </div>

                          {isAddingNumber && (
                            <form onSubmit={handleAddNumber} className="p-3 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-2">
                              <label className="text-[11px] text-slate-300 block">أدخل رقم الهاتف اليمني (9 أرقام):</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={phoneInput}
                                  onChange={(e) => handlePhoneInputChange(e.target.value)}
                                  placeholder="770000000"
                                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                                  maxLength={9}
                                  required
                                />
                                {detectedOp && (
                                  <span className={`text-[10px] px-2 py-1 rounded font-bold ${detectedOp.isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {detectedOp.nameAr}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  type="submit"
                                  disabled={actionLoading || !detectedOp?.isValid}
                                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold"
                                >
                                  حفظ الرقم في الحساب
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsAddingNumber(false)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </form>
                          )}

                          {numbers.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs">لا توجد أرقام مسجلة، ابدأ بإضافة رقم جديد</div>
                          ) : (
                            numbers.map((num) => {
                              const activeProt = protections.find((p) => p.customer_number_id === num.id && p.status === 'active');
                              const pendingReq = requests.find((r) => r.customer_number_id === num.id && r.status === 'pending');
                              return (
                                <div key={num.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-emerald-400" />
                                      <span className="font-mono text-sm font-bold text-white">{num.phone_number}</span>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                      {num.company_name_ar}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800/60">
                                    {activeProt ? (
                                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        محمي حتى {activeProt.end_at.substring(0, 10)}
                                      </span>
                                    ) : pendingReq ? (
                                      <span className="text-amber-400 font-medium">طلب قيد المراجعة</span>
                                    ) : (
                                      <span className="text-slate-500">غير محمي</span>
                                    )}

                                    {!activeProt && !pendingReq && (
                                      <button
                                        onClick={() => openCreateRequestModal(num)}
                                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5"
                                      >
                                        <span>طلب حماية</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </>
                      )}

                      {customerNavTab === 'protections' && (
                        <>
                          <div className="text-xs font-semibold text-slate-300 mb-2">الحمايات النشطة وحالة التجديد</div>
                          {protections.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-xs">لا توجد حمايات نشطة حالياً</div>
                          ) : (
                            protections.map((prot) => {
                              const health = calculateRenewalHealth(prot.end_at);
                              return (
                                <div key={prot.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-mono text-xs font-bold text-white">{prot.phone_number || 'رقم محمي'}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 ${health.bg} ${health.color}`}>
                                      <span>{health.symbol}</span>
                                      <span>{health.label} ({health.days} يوم)</span>
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400">{prot.package_name_snapshot} ({prot.duration_days_snapshot} يوم)</div>
                                  <div className="text-[10px] text-slate-500">
                                    الصلاحية: من {prot.start_at.substring(0, 10)} إلى {prot.end_at.substring(0, 10)}
                                  </div>
                                  {(health.health === 'SOON' || health.health === 'DANGER') && (
                                    <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center">
                                      <span className="text-[10px] text-amber-400">اقترب موعد التجديد الدوري</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-300 font-bold">
                                        جاهز للتمديد
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}

                          <div className="text-xs font-semibold text-slate-300 mt-4 mb-2">طلبات الحماية السابقة</div>
                          {requests.length === 0 ? (
                            <div className="text-center py-4 text-slate-500 text-xs">لا توجد طلبات سابقة</div>
                          ) : (
                            requests.map((req) => (
                              <div key={req.id} className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg flex justify-between items-center text-xs">
                                <div>
                                  <div className="font-mono text-slate-200">{req.phone_number || 'طلب حماية'}</div>
                                  <div className="text-[10px] text-slate-500">{req.created_at.substring(0, 10)} • مرجع {req.payment_transfer_reference}</div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : req.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                  {req.status.toUpperCase()}
                                </span>
                              </div>
                            ))
                          )}
                        </>
                      )}

                      {customerNavTab === 'plans' && (
                        <div className="space-y-2.5">
                          <div className="text-xs font-semibold text-slate-300 mb-1">دليل باقات الحماية المعتمدة</div>
                          {plans.map((p) => (
                            <div key={p.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                              <div>
                                <div className="text-xs font-bold text-white">{p.name_ar}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">المدة: {p.duration_days} يوماً • تجديد ومتابعة منتظمة</div>
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-bold text-emerald-400">{p.price}</div>
                                <div className="text-[9px] text-slate-500 uppercase">{p.currency}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {customerNavTab === 'payments' && (
                        <div className="space-y-3">
                          <div className="text-xs font-semibold text-slate-300 mb-1">حسابات وطرق التحويل المعتمدة</div>
                          {paymentMethods.map((pm) => (
                            <div key={pm.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="text-xs font-bold text-white">{pm.name_ar}</div>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{pm.code}</span>
                              </div>
                              {pm.account_identifier && (
                                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800">
                                  <div>
                                    <div className="text-[9px] text-slate-500">رقم الحساب / المحفظة:</div>
                                    <div className="text-xs font-mono font-bold text-emerald-400">{pm.account_identifier}</div>
                                    {pm.account_name && <div className="text-[10px] text-slate-400">{pm.account_name}</div>}
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(pm.account_identifier!)}
                                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                                  >
                                    {copiedId === pm.account_identifier ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedId === pm.account_identifier ? 'تم النسخ' : 'نسخ'}</span>
                                  </button>
                                </div>
                              )}
                              {pm.instructions && <div className="text-[10px] text-slate-400 leading-relaxed">{pm.instructions}</div>}
                            </div>
                          ))}
                        </div>
                      )}

                      {customerNavTab === 'notifications' && (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-300 mb-1">مركز إشعارات الحماية والتنبيهات</div>
                          {clientNotifications.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs">لا توجد إشعارات جديدة</div>
                          ) : (
                            clientNotifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => handleMarkNotificationRead(notif.id, false)}
                                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${notif.is_read ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-900 border-emerald-500/40 text-slate-200'}`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-white">{notif.title}</span>
                                  {!notif.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                                </div>
                                <div className="text-[11px] text-slate-300">{notif.body}</div>
                                <div className="text-[10px] text-slate-500 mt-1">{notif.created_at?.substring(0, 16).replace('T', ' ')}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-xs text-slate-300 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <span>المعمارية وقاعدة البيانات في المرحلة الرابعة (Stage 4)</span>
              </h2>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400">1. الجداول والمخططات المعتمدة في Stage 4:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><code className="text-white">payment_methods</code>: طرق الدفع، تعليمات التحويل، الحسابات الرسمية.</li>
                  <li><code className="text-white">protection_tasks</code>: المهام التشغيلية، التواريخ، المبالغ، الحالات (scheduled, due, overdue, completed).</li>
                  <li><code className="text-white">task_reschedule_history</code>: توثيق عمليات إعادة الجدولة، التواريخ السابقة، والأسباب.</li>
                  <li><code className="text-white">client_notifications</code> & <code className="text-white">admin_notifications</code>: إشعارات التنبيه والتجديد.</li>
                  <li><code className="text-white">transactions</code>: القيود المالية للإيرادات والمصروفات الناتجة عن تنفيذ المهام.</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400">2. الإجراءات المخزنة الموثوقة (RPCs):</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><code className="text-amber-300">rpc_execute_task(p_task_id, p_execution_note)</code>: تنفيذ المهمة، تسجيل القيد المالي، والجدولة التلقائية.</li>
                  <li><code className="text-amber-300">rpc_reschedule_task(p_task_id, p_new_scheduled_at, p_reason)</code>: إعادة الجدولة وتحديث الخطط المستقبلية.</li>
                  <li><code className="text-amber-300">rpc_mark_notification_read(p_notification_id)</code>: تأكيد قراءة إشعار العميل.</li>
                  <li><code className="text-amber-300">rpc_mark_admin_notification_read(p_notification_id)</code>: تأكيد قراءة إشعار المشرف.</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-sky-400">3. محددات حالات التجديد وصحة الحماية (Renewal Health):</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="font-bold text-emerald-400">🟢 آمن (Safe):</span> أكثر من 14 يوماً متبقية.
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="font-bold text-amber-400">🟡 قريب (Soon):</span> بين 7 إلى 14 يوماً متبقية.
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="font-bold text-red-400">🔴 خطر (Danger):</span> أقل من 7 أيام متبقية.
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="font-bold text-slate-400">⚫ منتهي (Expired):</span> 0 يوم أو منتهي الصلاحية.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Execute Task Modal */}
      {executingTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">توثيق تنفيذ المهمة #{executingTask.task_number}</h3>
              <button onClick={() => setExecutingTask(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div>الرقم: <span className="font-bold text-white">{executingTask.phone_number || 'رقم محمي'}</span></div>
              <div>المبلغ: <span className="font-bold text-emerald-400">{executingTask.amount} {executingTask.currency}</span></div>
              <div className="text-[10px] text-slate-500 pt-1">سيؤدي التنفيذ إلى تسجيل مصروف مالي وإنشاء المهمة التالية تلقائياً إذا كانت ضمن فترة الحماية.</div>
            </div>
            <form onSubmit={handleExecuteTask} className="space-y-3">
              <textarea
                value={executionNote}
                onChange={(e) => setExecutionNote(e.target.value)}
                placeholder="ملاحظات التنفيذ (اختياري)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 h-20 resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {actionLoading ? 'جاري التنفيذ...' : 'تأكيد التنفيذ'}
                </button>
                <button
                  type="button"
                  onClick={() => setExecutingTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Task Modal */}
      {reschedulingTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">إعادة جدولة المهمة #{reschedulingTask.task_number}</h3>
              <button onClick={() => setReschedulingTask(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleRescheduleTask} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">تاريخ الاستحقاق الجديد:</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">سبب إعادة الجدولة:</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="طلب العميل / عطل فني في المشغل..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {actionLoading ? 'جاري الحفظ...' : 'حفظ الجدولة'}
                </button>
                <button
                  type="button"
                  onClick={() => setReschedulingTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Protection Request Modal */}
      {showRequestModal && targetNumber && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">طلب حماية رقم</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
              <span className="font-mono font-bold text-emerald-400">{targetNumber.phone_number}</span>
              <span className="text-slate-400">{targetNumber.company_name_ar}</span>
            </div>

            {conflictWarning && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/40 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{conflictWarning}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProtectionRequest} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">اختر باقة الحماية:</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_ar} ({p.price} {p.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">طريقة التحويل / الدفع:</label>
                <select
                  value={selectedPmId}
                  onChange={(e) => setSelectedPmId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                >
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name_ar} {pm.account_identifier ? `(${pm.account_identifier})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">رقم مرجع الحوالة / الإشعار:</label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="مثال: 987654321"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ملاحظة للطلب (اختياري):</label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="أي ملاحظة أو توجيه..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading || !!conflictWarning}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs"
                >
                  {actionLoading ? 'جاري الإرسال...' : 'إرسال طلب الحماية'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {rejectModalReq && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">رفض طلب الحماية</h3>
              <button onClick={() => setRejectModalReq(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleRejectRequest} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">سبب الرفض (إلزامي):</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="سبب الرفض: مرجع الحوالة غير مطابق / الحساب غير مكتمل..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 h-24 resize-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs"
                >
                  {actionLoading ? 'جاري الرفض...' : 'تأكيد الرفض'}
                </button>
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
