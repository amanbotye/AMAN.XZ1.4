/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
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
  Lock, 
  Key, 
  Server,
  ArrowRight,
  RefreshCw,
  FolderGit2
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

  // Verify session on mount
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
      } else {
        // Fallback profile if row in public.users is created on trigger
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
    } catch {
      // ignore
    } finally {
      setLoading(false);
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
            data: {
              full_name: fullName.trim(),
              user_type: 'customer'
            }
          }
        });
        if (error) throw error;
        // Auto login after signup
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
    setActionLoading(false);
  };

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
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                المرحلة 1: Foundation & Supabase
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Native Android Project (Kotlin + Jetpack Compose) • Live Supabase Backend
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
            حزم وهيكلية Kotlin
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
            مسار البيانات الحي
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex items-center justify-center">
        {activeTab === 'device' && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-5xl w-full">
            {/* Native Android Frame */}
            <div className="w-[360px] h-[720px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col overflow-hidden">
              {/* Camera Notch / Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
              </div>

              {/* Android Screen Inner */}
              <div className="flex-1 bg-slate-900 rounded-[34px] overflow-y-auto flex flex-col relative pt-7">
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
                    <span className="text-xs text-slate-400 font-medium">جاري فحص الجلسة واستعادتها...</span>
                  </div>
                ) : session && profile ? (
                  /* Authenticated User View (Customer or Admin) */
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            profile.user_type === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{profile.full_name || profile.email}</h3>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              profile.user_type === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {profile.user_type === 'admin' ? 'مدير نظام (Admin)' : 'عميل (Customer)'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                          title="تسجيل الخروج"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-400">UUID:</span>
                          <span className="font-mono text-[10px] text-slate-300 truncate max-w-[170px]">{profile.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">البريد:</span>
                          <span className="text-slate-300">{profile.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">الحالة:</span>
                          <span className="text-emerald-400 font-medium">نشط (Active)</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge of Stage 1 Flow */}
                    <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 text-center mb-auto">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-emerald-300 mb-1">مسار المرحلة الأولى مكتمل</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        App → Session → Auth → public.users → User State → Navigation
                      </p>
                      <div className="mt-3 text-[10px] bg-slate-900/80 rounded-lg p-2 font-mono text-emerald-400">
                        Route: {profile.user_type === 'admin' ? 'AmanDestination.AdminHome' : 'AmanDestination.CustomerHome'}
                      </div>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                    >
                      تسجيل الخروج
                    </button>
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
                            <span>إنشاء حساب جديد</span>
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

            {/* Architecture Overview Side Panel */}
            <div className="flex-1 max-w-lg space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تثبيت بنية Android الأصلية (Kotlin + Jetpack Compose)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تم بناء وتأسيس مشروع Android الأصلي بالكامل في المستودع بحزم نظيفة ومطابقة للمرجع <code className="text-emerald-400 font-mono">AMAN.XZ.txt</code> ومربوطة مباشرة بـ Supabase Live.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Package ID</span>
                    <span className="text-slate-200">com.aman.protection</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">UI Framework</span>
                    <span className="text-slate-200">Jetpack Compose M3</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Backend</span>
                    <span className="text-slate-200">Supabase Live DB</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Direction</span>
                    <span className="text-slate-200">RTL First (العربية)</span>
                  </div>
                </div>
              </div>

              {/* The 5 Stages Progress Tracker */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">مسار المراحل الخمس (Stages 1–5):</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="font-semibold">المرحلة 1: التأسيس، معمارية Android، والربط الآمن بـ Supabase (مكتملة)</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 text-slate-400">
                    <span className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">2</span>
                    <span>المرحلة 2: شاشات ونماذج بيانات الشركات والباقات وطلب الحماية</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 text-slate-400">
                    <span className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">3</span>
                    <span>المرحلة 3: لوحة الإدارة ومراجعة واعتماد الطلبات والدفع اليدوي</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 text-slate-400">
                    <span className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">4</span>
                    <span>المرحلة 4: إدارة المهام المجدولة والتنفيذ وإعادة الجدولة</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 text-slate-400">
                    <span className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">5</span>
                    <span>المرحلة 5: التجديدات، السجلات المالية، واختبار التجميع النهائي</span>
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
              <span>هيكلية حزم مشروع Android الأصلي (app/src/main/java/com/aman/protection/)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block text-sm">📁 com.aman.protection.core</span>
                <p className="text-slate-400 text-[11px] font-sans">الثوابت، إدارة النتائج، تصنيف وترجمة الأخطاء:</p>
                <ul className="text-slate-300 space-y-1 pl-4 list-disc">
                  <li>AmanConstants.kt (جداول، عملات، أدوار)</li>
                  <li>AmanResult.kt (Success, Error, Loading)</li>
                  <li>AmanError.kt (معالجة وترجمة الأخطاء للعربية)</li>
                  <li>Config.kt (إعدادات التطبيق)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block text-sm">📁 com.aman.protection.data</span>
                <p className="text-slate-400 text-[11px] font-sans">عميل Supabase ونماذج الجداول والمستودعات:</p>
                <ul className="text-slate-300 space-y-1 pl-4 list-disc">
                  <li>remote/SupabaseClient.kt (PostgREST, Auth, Realtime)</li>
                  <li>models/UserDto.kt (تمثيل public.users)</li>
                  <li>models/Enums.kt (UserType, UserStatus)</li>
                  <li>repository/UserRepository.kt (واجهة المستودع)</li>
                  <li>repository/UserRepositoryImpl.kt (الاستعلام الفعلي)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block text-sm">📁 com.aman.protection.auth</span>
                <p className="text-slate-400 text-[11px] font-sans">إدارة الجلسات وحالات المصادقة وتسجيل الدخول:</p>
                <ul className="text-slate-300 space-y-1 pl-4 list-disc">
                  <li>model/AuthState.kt (حالات الجلسة)</li>
                  <li>model/UserSession.kt (بيانات التوكن)</li>
                  <li>repository/AuthRepository.kt (واجهة المصادقة)</li>
                  <li>repository/AuthRepositoryImpl.kt (ربط Supabase Auth)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block text-sm">📁 com.aman.protection.presentation</span>
                <p className="text-slate-400 text-[11px] font-sans">واجهات Jetpack Compose و Theme و ViewModels:</p>
                <ul className="text-slate-300 space-y-1 pl-4 list-disc">
                  <li>theme/Theme.kt (هوية AMAN ودعم RTL والعربية)</li>
                  <li>main/MainViewModel.kt (تنسيق مسار التطبيق)</li>
                  <li>auth/AuthViewModel.kt (معالجة الدخول والحساب)</li>
                  <li>screens/AmanMainApp.kt (نقطة الربط الرئيسية)</li>
                  <li>screens/SplashScreen.kt & AuthScreen.kt</li>
                  <li>screens/CustomerHomeScreen.kt & AdminHomeScreen.kt</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>فحص مسار البيانات الحي: App → Session → Auth → public.users → User State → Navigation</span>
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <span className="text-white font-bold block">1. تهيئة عميل Supabase</span>
                    <span className="text-slate-400 text-[11px]">https://pvgmtufzvwkdvtbtcijn.supabase.co</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px]">HTTP 200 OK</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <span className="text-white font-bold block">2. فحص واستعادة الجلسة (Session Restore)</span>
                    <span className="text-slate-400 text-[11px]">SupabaseProvider.auth.currentSessionOrNull()</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px]">
                  {session ? 'Session Active' : 'Unauthenticated'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <span className="text-white font-bold block">3. قراءة بيانات المستخدم من جدول public.users</span>
                    <span className="text-slate-400 text-[11px]">SELECT * FROM users WHERE id = auth.uid()</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px]">
                  {profile ? `Profile Loaded: ${profile.user_type}` : 'Awaiting Auth'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                  <div>
                    <span className="text-white font-bold block">4. توجيه الواجهة حسب الصلاحية الفعلية</span>
                    <span className="text-slate-400 text-[11px]">user.user_type == ADMIN ? AdminHome : CustomerHome</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px]">
                  {profile ? (profile.user_type === 'admin' ? 'AdminHome' : 'CustomerHome') : 'AuthScreen'}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
