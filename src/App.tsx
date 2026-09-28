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
  Info,
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
  RotateCcw,
  ExternalLink,
  Loader2,
  Home,
  Users,
  Settings,
  Activity,
  Menu
} from 'lucide-react';

import {
  UserProfile,
  CustomerNumberItem,
  ProtectionPlan,
  PaymentMethod,
  ProtectionRequestItem,
  ProtectionItem,
  PaymentTaskItem,
  NotificationItem,
  AuditLogItem,
  TelecomProvider,
  TelecomProviderPrefix,
  CompanyTaskSettingItem,
  SystemSettingItem
} from './types/aman';

// Auth Screens (01 - 03)
import { LoginScreen } from './components/auth/LoginScreen';
import { CreateAccountScreen } from './components/auth/CreateAccountScreen';
import { PasswordRecoveryScreen } from './components/auth/PasswordRecoveryScreen';

// Customer Screens (04 - 10)
import { CustomerHomeScreen } from './components/customer/CustomerHomeScreen';
import { CustomerNumbersScreen } from './components/customer/CustomerNumbersScreen';
import { CustomerProtectionRequestsScreen } from './components/customer/CustomerProtectionRequestsScreen';
import { CustomerProtectionsScreen } from './components/customer/CustomerProtectionsScreen';
import { CustomerNotificationsScreen } from './components/customer/CustomerNotificationsScreen';
import { CustomerAccountScreen } from './components/customer/CustomerAccountScreen';

// Admin Screens (11 - 21)
import { AdminDashboardScreen } from './components/admin/AdminDashboardScreen';
import { AdminCustomersScreen } from './components/admin/AdminCustomersScreen';
import { AdminCustomerNumbersScreen } from './components/admin/AdminCustomerNumbersScreen';
import { AdminProtectionRequestsScreen } from './components/admin/AdminProtectionRequestsScreen';
import { AdminProtectionsScreen } from './components/admin/AdminProtectionsScreen';
import { AdminPaymentTasksScreen } from './components/admin/AdminPaymentTasksScreen';
import { AdminTelecomProvidersScreen } from './components/admin/AdminTelecomProvidersScreen';
import { AdminPaymentMethodsScreen } from './components/admin/AdminPaymentMethodsScreen';
import { AdminNotificationsScreen } from './components/admin/AdminNotificationsScreen';
import { AdminAuditLogsScreen } from './components/admin/AdminAuditLogsScreen';
import { AdminSystemSettingsScreen } from './components/admin/AdminSystemSettingsScreen';

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

// Default seed data for offline/fallback stability
const DEFAULT_PLANS: ProtectionPlan[] = [
  { id: 'p1', company_id: '4262d66c-f6b2-437b-9f45-02123e2306d4', name_ar: 'باقة الحماية الشهرية — يمن موبايل', price: 2500, currency: 'YER', duration_days: 30, is_active: true, is_visible: true },
  { id: 'p2', company_id: '4262d66c-f6b2-437b-9f45-02123e2306d4', name_ar: 'باقة الحماية الربع سنوية — يمن موبايل', price: 7000, currency: 'YER', duration_days: 90, is_active: true, is_visible: true },
  { id: 'p3', company_id: '193c9f07-2781-44e0-96f6-eead97fca93a', name_ar: 'باقة الحماية الشهرية — يو', price: 2500, currency: 'YER', duration_days: 30, is_active: true, is_visible: true },
  { id: 'p4', company_id: 'cdeb5fe5-4733-4732-b678-9dd101f11d88', name_ar: 'باقة الحماية الشهرية — سبأفون', price: 2500, currency: 'YER', duration_days: 30, is_active: true, is_visible: true },
  { id: 'p5', company_id: '69a82a6d-345f-44a1-b46a-33e8098b8c64', name_ar: 'باقة الحماية الشهرية — واي', price: 2500, currency: 'YER', duration_days: 30, is_active: true, is_visible: true }
];

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm1', name_ar: 'بنك الكريمي للتمويل الأصغر الإسلامي', code: 'KURAIMI', account_name: 'خدمة أمان لحماية الأرقام', account_identifier: '300123456', instructions: 'إيداع أو تحويل لحساب أمان عبر تطبيق كريمي جوال أو أقرب فرع.', display_order: 1, is_active: true },
  { id: 'pm2', name_ar: 'بنك القطيبي الإسلامي للتمويل الأصغر', code: 'QUTAIBI', account_name: 'أمان لخدمات الاتصالات', account_identifier: '120889900', instructions: 'تحويل عبر تطبيق قطيبي لحظات متاح 24/7.', display_order: 2, is_active: true },
  { id: 'pm3', name_ar: 'محفظة ون كاش (OneCash)', code: 'ONECASH', account_name: 'محفظة أمان الرسمية', account_identifier: '770001122', instructions: 'تحويل مباشر من محفظتك إلى رقم محفظة الخدمة.', display_order: 3, is_active: true },
  { id: 'pm4', name_ar: 'محفظة جوالي (Jawwali)', code: 'JAWWALI', account_name: 'إدارة أمان لحماية الأرقام', account_identifier: '730002233', instructions: 'تحويل سريع عبر تطبيق جوالي التابع لبنك اليمن والكويت.', display_order: 4, is_active: true }
];

const DEFAULT_PROVIDERS: TelecomProvider[] = [
  { id: '4262d66c-f6b2-437b-9f45-02123e2306d4', name_ar: 'يمن موبايل', code: 'YM', display_order: 1, is_active: true, prefixes: ['77', '78'] },
  { id: '193c9f07-2781-44e0-96f6-eead97fca93a', name_ar: 'يو للاتصالات', code: 'YOU', display_order: 2, is_active: true, prefixes: ['73'] },
  { id: 'cdeb5fe5-4733-4732-b678-9dd101f11d88', name_ar: 'سبأفون', code: 'SABAFON', display_order: 3, is_active: true, prefixes: ['71'] },
  { id: '69a82a6d-345f-44a1-b46a-33e8098b8c64', name_ar: 'واي للاتصالات', code: 'Y', display_order: 4, is_active: true, prefixes: ['70'] }
];

const DEFAULT_PREFIXES: TelecomProviderPrefix[] = [
  { id: 'px1', company_id: '4262d66c-f6b2-437b-9f45-02123e2306d4', prefix: '77', number_length: 9, is_active: true },
  { id: 'px2', company_id: '4262d66c-f6b2-437b-9f45-02123e2306d4', prefix: '78', number_length: 9, is_active: true },
  { id: 'px3', company_id: '193c9f07-2781-44e0-96f6-eead97fca93a', prefix: '73', number_length: 9, is_active: true },
  { id: 'px4', company_id: 'cdeb5fe5-4733-4732-b678-9dd101f11d88', prefix: '71', number_length: 9, is_active: true },
  { id: 'px5', company_id: '69a82a6d-345f-44a1-b46a-33e8098b8c64', prefix: '70', number_length: 9, is_active: true }
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'device' | 'screens' | 'architecture'>('device');

  // Navigation
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [customerTab, setCustomerTab] = useState<'home' | 'numbers' | 'requests' | 'protections' | 'notifications' | 'account'>('home');
  const [adminTab, setAdminTab] = useState<
    | 'dashboard'
    | 'customers'
    | 'numbers'
    | 'requests'
    | 'protections'
    | 'tasks'
    | 'providers'
    | 'payment_methods'
    | 'notifications'
    | 'audit'
    | 'settings'
  >('dashboard');

  // Direct Screen Jump Selector for prompt verification
  const [screenJump, setScreenJump] = useState<number | null>(null);

  // Data Store
  const [numbers, setNumbers] = useState<CustomerNumberItem[]>([]);
  const [requests, setRequests] = useState<ProtectionRequestItem[]>([]);
  const [protections, setProtections] = useState<ProtectionItem[]>([]);
  const [clientNotifications, setClientNotifications] = useState<NotificationItem[]>([]);
  const [plans, setPlans] = useState<ProtectionPlan[]>(DEFAULT_PLANS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);

  // Admin Data Store
  const [adminCustomers, setAdminCustomers] = useState<UserProfile[]>([]);
  const [allNumbersAdmin, setAllNumbersAdmin] = useState<CustomerNumberItem[]>([]);
  const [allRequestsAdmin, setAllRequestsAdmin] = useState<ProtectionRequestItem[]>([]);
  const [allProtectionsAdmin, setAllProtectionsAdmin] = useState<ProtectionItem[]>([]);
  const [allTasksAdmin, setAllTasksAdmin] = useState<PaymentTaskItem[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [providers, setProviders] = useState<TelecomProvider[]>(DEFAULT_PROVIDERS);
  const [prefixes, setPrefixes] = useState<TelecomProviderPrefix[]>(DEFAULT_PREFIXES);
  const [taskSettings, setTaskSettings] = useState<CompanyTaskSettingItem[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettingItem[]>([]);

  // Modals / deep link navigation
  const [preselectedNumberForRequest, setPreselectedNumberForRequest] = useState<string | null>(null);

  // Feedback toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [authInitialError, setAuthInitialError] = useState<string | null>(null);

  // Lifecycle & Session restoration
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT' || !session?.user) {
        setProfile(null);
        setLoading(false);
      } else if (session?.user) {
        fetchUserProfile(session.user.id);
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
        const userRec = data as UserProfile;

        // Check if account status is invalid or suspended
        if (userRec.is_deleted || userRec.status === 'suspended' || userRec.status === 'disabled') {
          const statusMsg = userRec.status === 'suspended'
            ? 'الحساب معطل أو موقوف، يرجى مراجعة الإدارة'
            : userRec.status === 'disabled'
            ? 'تم تعطيل هذا الحساب نهائياً، يرجى التواصل مع الإدارة'
            : 'هذا الحساب تم حذفه من النظام، يرجى التواصل مع الإدارة';

          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
          setAuthInitialError(statusMsg);
          setFeedback({
            type: 'error',
            message: statusMsg
          });
          return;
        }

        if (userRec.user_type !== 'admin' && userRec.user_type !== 'customer') {
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
          setAuthInitialError('نوع الحساب غير صالح، لا يمكن تحديد مسار الوصول');
          return;
        }

        setAuthInitialError(null);
        setProfile(userRec);
        loadCustomerData(userId);
        if (userRec.user_type === 'admin') {
          loadAdminData();
        }
      } else {
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        setAuthInitialError('لم يتم العثور على بيانات المستخدم في النظام');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerData = async (userId: string) => {
    try {
      // 1. Customer Numbers
      const { data: numData } = await supabase
        .from('customer_numbers')
        .select('*')
        .eq('customer_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (numData) setNumbers(numData as CustomerNumberItem[]);

      // 2. Customer Requests
      const { data: reqData } = await supabase
        .from('protection_requests')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (reqData) {
        const enrichedReqs = (reqData as any[]).map((r) => {
          const matchedNum = (numData || []).find((n: any) => n.id === r.customer_number_id);
          const matchedPlan = plans.find((p) => p.id === r.package_id);
          const matchedPm = paymentMethods.find((pm) => pm.id === r.payment_method_id);
          return {
            ...r,
            phone_number: matchedNum?.phone_number,
            package_name: matchedPlan?.name_ar,
            payment_method_name: matchedPm?.name_ar
          };
        });
        setRequests(enrichedReqs);
      }

      // 3. Customer Protections
      const { data: protData } = await supabase
        .from('protections')
        .select('*')
        .eq('customer_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (protData) {
        const enrichedProts = (protData as any[]).map((p) => {
          const matchedNum = (numData || []).find((n: any) => n.id === p.customer_number_id);
          return {
            ...p,
            phone_number: matchedNum?.phone_number
          };
        });
        setProtections(enrichedProts);
      }

      // 4. Customer Notifications
      const { data: notifData } = await supabase
        .from('client_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (notifData) setClientNotifications(notifData as NotificationItem[]);

      // 5. Payment Methods
      const { data: pmData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('display_order', { ascending: true });

      if (pmData && pmData.length > 0) setPaymentMethods(pmData as PaymentMethod[]);

      // 6. Packages
      const { data: pkgData } = await supabase
        .from('company_packages')
        .select('*')
        .eq('is_active', true)
        .eq('is_visible', true)
        .eq('is_deleted', false);

      if (pkgData && pkgData.length > 0) setPlans(pkgData as ProtectionPlan[]);
    } catch {
      // ignore
    }
  };

  const loadAdminData = async () => {
    try {
      // 1. Users
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'customer')
        .order('created_at', { ascending: false });
      if (userData) setAdminCustomers(userData as UserProfile[]);

      // 2. All Numbers
      const { data: numData } = await supabase
        .from('customer_numbers')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (numData) setAllNumbersAdmin(numData as CustomerNumberItem[]);

      // 3. All Requests
      const { data: reqData } = await supabase
        .from('protection_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (reqData) {
        const enriched = (reqData as any[]).map((r) => {
          const num = (numData || []).find((n: any) => n.id === r.customer_number_id);
          const matchedPlan = plans.find((p) => p.id === r.package_id);
          const matchedPm = paymentMethods.find((pm) => pm.id === r.payment_method_id);
          return {
            ...r,
            phone_number: num?.phone_number,
            package_name: matchedPlan?.name_ar,
            payment_method_name: matchedPm?.name_ar
          };
        });
        setAllRequestsAdmin(enriched);
      }

      // 4. All Protections
      const { data: protData } = await supabase
        .from('protections')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (protData) {
        const enriched = (protData as any[]).map((p) => {
          const num = (numData || []).find((n: any) => n.id === p.customer_number_id);
          return {
            ...p,
            phone_number: num?.phone_number
          };
        });
        setAllProtectionsAdmin(enriched);
      }

      // 5. Payment Tasks
      const { data: taskData } = await supabase
        .from('protection_tasks')
        .select('*')
        .order('due_at', { ascending: true });
      if (taskData) {
        const enriched = (taskData as any[]).map((t) => {
          const num = (numData || []).find((n: any) => n.id === t.customer_number_id);
          return {
            ...t,
            phone_number: num?.phone_number
          };
        });
        setAllTasksAdmin(enriched);
      }

      // 6. Admin Notifications
      const { data: notifData } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (notifData) setAdminNotifications(notifData as NotificationItem[]);

      // 7. Audit Logs
      const { data: auditData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (auditData) setAuditLogs(auditData as AuditLogItem[]);

      // 8. Companies
      const { data: compData } = await supabase
        .from('companies')
        .select('*')
        .eq('is_deleted', false)
        .order('display_order', { ascending: true });
      if (compData && compData.length > 0) setProviders(compData as TelecomProvider[]);

      // 9. Prefixes
      const { data: prefixData } = await supabase
        .from('company_prefixes')
        .select('*')
        .eq('is_deleted', false);
      if (prefixData && prefixData.length > 0) setPrefixes(prefixData as TelecomProviderPrefix[]);

      // 10. Task Settings
      const { data: tsData } = await supabase
        .from('company_task_settings')
        .select('*');
      if (tsData) setTaskSettings(tsData as CompanyTaskSettingItem[]);

      // 11. System Settings
      const { data: sysData } = await supabase
        .from('system_settings')
        .select('*');
      if (sysData) setSystemSettings(sysData as SystemSettingItem[]);
    } catch {
      // ignore
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      setSession(null);
      setProfile(null);
      setAuthView('login');
      setCustomerTab('home');
      setAdminTab('dashboard');
      setNumbers([]);
      setRequests([]);
      setProtections([]);
      setClientNotifications([]);
      setFeedback({ type: 'success', message: 'تم تسجيل الخروج بنجاح من النظام' });
    }
  };

  const handleLoginSuccess = (userProf: UserProfile, targetRoute: '/customer/home' | '/admin/home') => {
    setProfile(userProf);
    if (userProf.user_type === 'admin') {
      setAdminTab('dashboard');
      loadAdminData();
    } else {
      setCustomerTab('home');
      loadCustomerData(userProf.id);
    }
  };

  // 21 Screen Navigator Map
  const SCREEN_LIST = [
    { id: 1, name: 'SCREEN 01 — تسجيل الدخول (Login)', type: 'auth', view: 'login' },
    { id: 2, name: 'SCREEN 02 — إنشاء حساب جديد (Sign Up)', type: 'auth', view: 'signup' },
    { id: 3, name: 'SCREEN 03 — استعادة كلمة المرور (Recovery)', type: 'auth', view: 'forgot_password' },
    { id: 4, name: 'SCREEN 04 — تغيير كلمة المرور (Change Pass)', type: 'customer', tab: 'account' },
    { id: 5, name: 'SCREEN 05 — الرئيسية للعميل (Customer Home)', type: 'customer', tab: 'home' },
    { id: 6, name: 'SCREEN 06 — أرقامي المسجلة (Customer Numbers)', type: 'customer', tab: 'numbers' },
    { id: 7, name: 'SCREEN 07 — طلبات الحماية (Protection Requests)', type: 'customer', tab: 'requests' },
    { id: 8, name: 'SCREEN 08 — حماياتي (Protections)', type: 'customer', tab: 'protections' },
    { id: 9, name: 'SCREEN 09 — إشعارات العميل (Notifications)', type: 'customer', tab: 'notifications' },
    { id: 10, name: 'SCREEN 10 — حسابي (Customer Account)', type: 'customer', tab: 'account' },
    { id: 11, name: 'SCREEN 11 — لوحة تحكم الإدارة (Admin Dashboard)', type: 'admin', tab: 'dashboard' },
    { id: 12, name: 'SCREEN 12 — إدارة العملاء (Admin Customers)', type: 'admin', tab: 'customers' },
    { id: 13, name: 'SCREEN 13 — أرقام المشتركين (Admin Numbers)', type: 'admin', tab: 'numbers' },
    { id: 14, name: 'SCREEN 14 — مراجعة الطلبات (Admin Requests)', type: 'admin', tab: 'requests' },
    { id: 15, name: 'SCREEN 15 — إدارة الحمايات (Admin Protections)', type: 'admin', tab: 'protections' },
    { id: 16, name: 'SCREEN 16 — المهام التشغيلية (Payment Tasks)', type: 'admin', tab: 'tasks' },
    { id: 17, name: 'SCREEN 17 — مشغلو الاتصالات (Telecom Providers)', type: 'admin', tab: 'providers' },
    { id: 18, name: 'SCREEN 18 — وسائل الدفع (Payment Methods)', type: 'admin', tab: 'payment_methods' },
    { id: 19, name: 'SCREEN 19 — إشعارات الإدارة (Admin Notifications)', type: 'admin', tab: 'notifications' },
    { id: 20, name: 'SCREEN 20 — سجل التدقيق (Audit Log)', type: 'admin', tab: 'audit' },
    { id: 21, name: 'SCREEN 21 — إعدادات النظام والمهام (System Settings)', type: 'admin', tab: 'settings' }
  ];

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden select-none" dir="rtl">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top App Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-950/60">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">AMAN — أمان</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  منظومة الحماية الشاملة (21 شاشة)
                </span>
              </div>
            </div>
          </div>

          {/* Top Bar Switchers */}
          <div className="flex items-center gap-2">
            {/* Screen Selector Dropdown */}
            <select
              value={screenJump || ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                setScreenJump(id);
                const target = SCREEN_LIST.find((s) => s.id === id);
                if (target) {
                  if (target.type === 'auth') {
                    setAuthView(target.view as any);
                  } else if (target.type === 'customer') {
                    setCustomerTab(target.tab as any);
                  } else if (target.type === 'admin') {
                    setAdminTab(target.tab as any);
                  }
                }
              }}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-emerald-300 font-medium focus:outline-none"
            >
              <option value="">الانتقال السريع لأي شاشة (1 - 21)...</option>
              {SCREEN_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* View Mode Tabs (Device frame vs Screen Directory) */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('device')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'device' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                شاشة الهاتف (App)
              </button>
              <button
                onClick={() => setActiveTab('screens')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'screens' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                دليل الـ 21 شاشة
              </button>
            </div>
          </div>
        </header>

        {/* Global Toast Feedback */}
        {feedback && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-3 duration-200">
            <div
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold shadow-xl flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-red-950 border-red-500 text-red-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          </div>
        )}

        {/* Tab 1: Device Viewport */}
        {activeTab === 'device' && (
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-slate-950">
            {/* Phone Mockup Frame */}
            <div className="w-[410px] h-[780px] max-h-full bg-slate-900 border-[6px] border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative">
              {/* Speaker notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* Status bar */}
              <div className="h-7 bg-slate-950/90 text-[10px] text-slate-400 flex items-center justify-between px-6 z-20 shrink-0 select-none">
                <span>09:41</span>
                <span className="font-mono">AMAN 4G</span>
                <span>100%</span>
              </div>

              {/* Phone Content Screen */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100 relative">
                {loading ? (
                  /* Splash Screen */
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none" dir="rtl">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 p-0.5 shadow-xl shadow-emerald-950/60 mb-4 animate-pulse">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        <Shield className="w-8 h-8 text-emerald-400" />
                      </div>
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">AMAN — أمان</h2>
                    <p className="text-xs text-slate-400 mb-5">جاري التحقق من الجلسة والصلاحيات...</p>
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                  </div>
                ) : !session || !profile ? (
                  /* AUTH STAGE (Screens 01 - 03) */
                  authView === 'login' ? (
                    <LoginScreen
                      supabase={supabase}
                      initialError={authInitialError}
                      onLoginSuccess={handleLoginSuccess}
                      onNavigateToSignUp={() => {
                        setAuthInitialError(null);
                        setAuthView('signup');
                      }}
                      onNavigateToForgotPassword={() => {
                        setAuthInitialError(null);
                        setAuthView('forgot_password');
                      }}
                    />
                  ) : authView === 'signup' ? (
                    <CreateAccountScreen
                      supabase={supabase}
                      onNavigateToLogin={() => setAuthView('login')}
                      onSignUpSuccess={(prof) => handleLoginSuccess(prof, '/customer/home')}
                    />
                  ) : (
                    <PasswordRecoveryScreen
                      supabase={supabase}
                      onNavigateToLogin={() => setAuthView('login')}
                    />
                  )
                ) : profile.user_type === 'admin' ? (
                  /* ADMIN STAGE (Screens 11 - 21) */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Admin Sub-navigation header */}
                    <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-xs shrink-0">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>لوحة المدير</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={loadAdminData}
                          className="p-1 rounded-lg text-slate-400 hover:text-white"
                          title="تحديث البيانات"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>خروج</span>
                        </button>
                      </div>
                    </div>

                    {/* Admin Screen Container */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {adminTab === 'dashboard' && (
                        <AdminDashboardScreen
                          customers={adminCustomers}
                          allNumbers={allNumbersAdmin}
                          allRequests={allRequestsAdmin}
                          allProtections={allProtectionsAdmin}
                          allTasks={allTasksAdmin}
                          adminNotifications={adminNotifications}
                          onNavigateTab={(t) => setAdminTab(t)}
                        />
                      )}
                      {adminTab === 'customers' && (
                        <AdminCustomersScreen
                          customers={adminCustomers}
                          allNumbers={allNumbersAdmin}
                          allRequests={allRequestsAdmin}
                          allProtections={allProtectionsAdmin}
                          allTasks={allTasksAdmin}
                        />
                      )}
                      {adminTab === 'numbers' && (
                        <AdminCustomerNumbersScreen
                          numbers={allNumbersAdmin}
                          customers={adminCustomers}
                          protections={allProtectionsAdmin}
                          requests={allRequestsAdmin}
                        />
                      )}
                      {adminTab === 'requests' && (
                        <AdminProtectionRequestsScreen
                          supabase={supabase}
                          requests={allRequestsAdmin}
                          customers={adminCustomers}
                          onRefresh={loadAdminData}
                        />
                      )}
                      {adminTab === 'protections' && (
                        <AdminProtectionsScreen
                          protections={allProtectionsAdmin}
                          customers={adminCustomers}
                        />
                      )}
                      {adminTab === 'tasks' && (
                        <AdminPaymentTasksScreen
                          supabase={supabase}
                          tasks={allTasksAdmin}
                          customers={adminCustomers}
                          onRefresh={loadAdminData}
                        />
                      )}
                      {adminTab === 'providers' && (
                        <AdminTelecomProvidersScreen
                          supabase={supabase}
                          providers={providers}
                          prefixes={prefixes}
                          onRefresh={loadAdminData}
                        />
                      )}
                      {adminTab === 'payment_methods' && (
                        <AdminPaymentMethodsScreen
                          supabase={supabase}
                          paymentMethods={paymentMethods}
                          onRefresh={loadAdminData}
                        />
                      )}
                      {adminTab === 'notifications' && (
                        <AdminNotificationsScreen
                          supabase={supabase}
                          notifications={adminNotifications}
                          onRefresh={loadAdminData}
                          onNavigateTab={(t) => setAdminTab(t)}
                        />
                      )}
                      {adminTab === 'audit' && (
                        <AdminAuditLogsScreen logs={auditLogs} />
                      )}
                      {adminTab === 'settings' && (
                        <AdminSystemSettingsScreen
                          supabase={supabase}
                          providers={providers}
                          taskSettings={taskSettings}
                          systemSettings={systemSettings}
                          onRefresh={loadAdminData}
                        />
                      )}
                    </div>

                    {/* Admin Bottom Nav Bar */}
                    <div className="h-14 bg-slate-900 border-t border-slate-800 grid grid-cols-5 items-center px-1 shrink-0 z-10 text-[10px]">
                      <button
                        onClick={() => setAdminTab('dashboard')}
                        className={`flex flex-col items-center gap-1 ${
                          adminTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        <span>الرئيسية</span>
                      </button>
                      <button
                        onClick={() => setAdminTab('requests')}
                        className={`flex flex-col items-center gap-1 relative ${
                          adminTab === 'requests' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>الطلبات</span>
                        {allRequestsAdmin.filter((r) => r.status === 'pending').length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-0 right-3" />
                        )}
                      </button>
                      <button
                        onClick={() => setAdminTab('tasks')}
                        className={`flex flex-col items-center gap-1 ${
                          adminTab === 'tasks' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>المهام</span>
                      </button>
                      <button
                        onClick={() => setAdminTab('customers')}
                        className={`flex flex-col items-center gap-1 ${
                          adminTab === 'customers' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>العملاء</span>
                      </button>
                      <button
                        onClick={() => setAdminTab('settings')}
                        className={`flex flex-col items-center gap-1 ${
                          adminTab === 'settings' || adminTab === 'providers' || adminTab === 'payment_methods'
                            ? 'text-amber-400 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>الإعدادات</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* CUSTOMER STAGE (Screens 04 - 10) */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Customer Screen Container */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {customerTab === 'home' && (
                        <CustomerHomeScreen
                          profile={profile}
                          numbers={numbers}
                          protections={protections}
                          requests={requests}
                          notifications={clientNotifications}
                          onNavigateTab={(t) => setCustomerTab(t)}
                          onOpenAddNumber={() => setCustomerTab('numbers')}
                          onOpenNewRequest={() => setCustomerTab('requests')}
                        />
                      )}
                      {customerTab === 'numbers' && (
                        <CustomerNumbersScreen
                          supabase={supabase}
                          numbers={numbers}
                          protections={protections}
                          requests={requests}
                          onRefresh={() => loadCustomerData(profile.id)}
                          onRequestProtectionForNumber={(n) => {
                            setPreselectedNumberForRequest(n.id);
                            setCustomerTab('requests');
                          }}
                        />
                      )}
                      {customerTab === 'requests' && (
                        <CustomerProtectionRequestsScreen
                          supabase={supabase}
                          requests={requests}
                          numbers={numbers}
                          plans={plans}
                          paymentMethods={paymentMethods}
                          protections={protections}
                          onRefresh={() => loadCustomerData(profile.id)}
                          preselectedNumberId={preselectedNumberForRequest}
                        />
                      )}
                      {customerTab === 'protections' && (
                        <CustomerProtectionsScreen
                          supabase={supabase}
                          protections={protections}
                          plans={plans}
                          paymentMethods={paymentMethods}
                          onRefresh={() => loadCustomerData(profile.id)}
                          onOpenNewRequest={() => setCustomerTab('requests')}
                        />
                      )}
                      {customerTab === 'notifications' && (
                        <CustomerNotificationsScreen
                          supabase={supabase}
                          notifications={clientNotifications}
                          onRefresh={() => loadCustomerData(profile.id)}
                          onNavigateTab={(t) => setCustomerTab(t)}
                        />
                      )}
                      {customerTab === 'account' && (
                        <CustomerAccountScreen
                          supabase={supabase}
                          profile={profile}
                          onRefreshProfile={() => fetchUserProfile(profile.id)}
                          onSignOut={handleSignOut}
                        />
                      )}
                    </div>

                    {/* Customer Bottom Navigation Bar */}
                    <div className="h-14 bg-slate-900 border-t border-slate-800 grid grid-cols-5 items-center px-1 shrink-0 z-10 text-[10px]">
                      <button
                        onClick={() => setCustomerTab('home')}
                        className={`flex flex-col items-center gap-1 ${
                          customerTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        <span>الرئيسية</span>
                      </button>
                      <button
                        onClick={() => setCustomerTab('numbers')}
                        className={`flex flex-col items-center gap-1 ${
                          customerTab === 'numbers' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>أرقامي</span>
                      </button>
                      <button
                        onClick={() => setCustomerTab('requests')}
                        className={`flex flex-col items-center gap-1 ${
                          customerTab === 'requests' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                        <span>الطلبات</span>
                      </button>
                      <button
                        onClick={() => setCustomerTab('notifications')}
                        className={`flex flex-col items-center gap-1 relative ${
                          customerTab === 'notifications' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                        <span>الإشعارات</span>
                        {clientNotifications.filter((n) => !n.is_read).length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-0 right-3" />
                        )}
                      </button>
                      <button
                        onClick={() => setCustomerTab('account')}
                        className={`flex flex-col items-center gap-1 ${
                          customerTab === 'account' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>حسابي</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Phone Bar */}
              <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
                <div className="w-24 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: All 21 Screens Directory View */}
        {activeTab === 'screens' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4" dir="rtl">
            <div>
              <h2 className="text-lg font-bold text-white">فهرس الشاشات الـ 21 لنظام AMAN</h2>
              <p className="text-xs text-slate-400 mt-1">
                تغطية شاملة لكافة متطلبات المواصفة المرجعية AMAN.XZ1.4 والربط الحقيقي مع Supabase.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SCREEN_LIST.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => {
                    setActiveTab('device');
                    setScreenJump(sc.id);
                    if (sc.type === 'auth') {
                      setAuthView(sc.view as any);
                    } else if (sc.type === 'customer') {
                      setCustomerTab(sc.tab as any);
                    } else if (sc.type === 'admin') {
                      setAdminTab(sc.tab as any);
                    }
                  }}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 group-hover:text-emerald-300">
                      #{sc.id.toString().padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        sc.type === 'auth'
                          ? 'bg-purple-500/20 text-purple-300'
                          : sc.type === 'customer'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {sc.type === 'auth' ? 'المصادقة' : sc.type === 'customer' ? 'واجهة العميل' : 'واجهة الإدارة'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white group-hover:text-emerald-200">
                    {sc.name}
                  </h3>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span>انقر لتشغيل الشاشة في الهاتف</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
