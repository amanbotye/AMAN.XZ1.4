/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Shield,
  Mail,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  UserPlus
} from 'lucide-react';
import { UserProfile, AuthSubView, AuthStatus } from '../types/auth';

interface AuthScreenProps {
  supabase: SupabaseClient;
  onLoginSuccess: (profile: UserProfile, targetRoute: '/customer/home' | '/admin/home') => void;
  initialError?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  supabase,
  onLoginSuccess,
  initialError
}) => {
  // Navigation / Sub-view within AUTH
  const [subView, setSubView] = useState<AuthSubView>('login');

  // Input states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Field-specific validation errors
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Global / General status & errors
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [generalError, setGeneralError] = useState<string | null>(initialError || null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password Recovery state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  // Validation function
  const validateForm = (): boolean => {
    let isValid = true;
    setIdentifierError(null);
    setPasswordError(null);
    setGeneralError(null);

    const trimmedId = identifier.trim();

    if (!trimmedId) {
      setIdentifierError('البريد الإلكتروني أو اسم المستخدم مطلوب');
      isValid = false;
    } else if (trimmedId.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedId)) {
        setIdentifierError('يرجى إدخال بريد إلكتروني صالح (مثال: name@domain.com)');
        isValid = false;
      }
    } else if (trimmedId.length < 3) {
      setIdentifierError('اسم المستخدم يجب ألا يقل عن 3 أحرف');
      isValid = false;
    }

    if (!password) {
      setPasswordError('كلمة المرور مطلوبة');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('كلمة المرور يجب ألا تقل عن 6 خانات');
      isValid = false;
    }

    return isValid;
  };

  // Sign In Handler (AUTH-01)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return; // Prevent duplicate execution

    if (!validateForm()) {
      setAuthStatus('validating');
      return;
    }

    setLoading(true);
    setAuthStatus('signing_in');
    setGeneralError(null);
    setSuccessMessage(null);

    const trimmedId = identifier.trim();

    try {
      // 1. Authenticate against Supabase GoTrue
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedId,
        password: password
      });

      if (authError || !authData.user) {
        const errorMsg = authError?.message?.toLowerCase() || '';
        if (
          errorMsg.includes('invalid login') ||
          errorMsg.includes('invalid_credentials') ||
          errorMsg.includes('grant_error') ||
          authError?.status === 400
        ) {
          setAuthStatus('invalid_credentials');
          setGeneralError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else if (
          errorMsg.includes('network') ||
          errorMsg.includes('fetch') ||
          errorMsg.includes('failed to fetch') ||
          errorMsg.includes('timeout')
        ) {
          setAuthStatus('network_error');
          setGeneralError('تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت');
        } else {
          setAuthStatus('server_error');
          setGeneralError('حدث خطأ أثناء الاتصال بنظام المصادقة. يرجى المحاولة لاحقاً');
        }
        return;
      }

      // 2. Auth succeeded, now fetch functional user profile from public.users using auth.uid()
      const userId = authData.user.id;
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('id, email, username, full_name, user_type, status, role_id, is_deleted, created_at')
        .eq('id', userId)
        .single();

      if (userError || !userRecord) {
        // Auth succeeded in GoTrue but no record in public.users
        await supabase.auth.signOut();
        setAuthStatus('user_not_found');
        setGeneralError('لم يتم العثور على سجل مستخدم مطابق في النظام. يرجى مراجعة الدعم الفني.');
        return;
      }

      const profile = userRecord as UserProfile;

      // 3. Business rule checks
      if (profile.is_deleted) {
        await supabase.auth.signOut();
        setAuthStatus('account_disabled');
        setGeneralError('هذا الحساب تم حذفه من النظام، يرجى التواصل مع الإدارة.');
        return;
      }

      if (profile.status === 'suspended') {
        await supabase.auth.signOut();
        setAuthStatus('account_suspended');
        setGeneralError('الحساب معطل أو موقوف، يرجى مراجعة الإدارة');
        return;
      }

      if (profile.status === 'disabled') {
        await supabase.auth.signOut();
        setAuthStatus('account_disabled');
        setGeneralError('تم تعطيل هذا الحساب نهائياً، يرجى التواصل مع الإدارة.');
        return;
      }

      if (profile.status !== 'active') {
        await supabase.auth.signOut();
        setAuthStatus('account_suspended');
        setGeneralError('حالة الحساب لا تسمح بالدخول، يرجى مراجعة إدارة النظام.');
        return;
      }

      if (profile.user_type !== 'customer' && profile.user_type !== 'admin') {
        await supabase.auth.signOut();
        setAuthStatus('invalid_user_type');
        setGeneralError('نوع الحساب غير صالح أو غير معتمد في النظام.');
        return;
      }

      // 4. Authentication and verification complete -> Route to appropriate home
      setAuthStatus('success');
      setSuccessMessage('تم التحقق بنجاح، جاري الدخول...');

      const targetRoute = profile.user_type === 'admin' ? '/admin/home' : '/customer/home';
      onLoginSuccess(profile, targetRoute);
    } catch (err: any) {
      setAuthStatus('server_error');
      setGeneralError('حدث خطأ غير متوقع أثناء معالجة تسجيل الدخول.');
    } finally {
      setLoading(false);
    }
  };

  // Password Recovery Handler (Forgot Password)
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryLoading) return;

    const emailTrimmed = recoveryEmail.trim();
    if (!emailTrimmed) {
      setRecoveryError('البريد الإلكتروني مطلوب لاستعادة كلمة المرور');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setRecoveryError('يرجى إدخال بريد إلكتروني صالح (مثال: name@domain.com)');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError(null);
    setRecoverySuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailTrimmed);
      if (error) {
        setRecoveryError(error.message || 'تعذر إرسال طلب استعادة كلمة المرور حالياً');
      } else {
        setRecoverySuccess('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح.');
      }
    } catch {
      setRecoveryError('حدث خطأ أثناء إرسال طلب الاستعادة، يرجى المحاولة لاحقاً');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col justify-center select-none" dir="rtl">
      {/* Brand Identity Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 p-0.5 shadow-xl shadow-emerald-950/60 mb-3">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white tracking-wide">AMAN — أمان</h1>
        <p className="text-xs text-slate-400 mt-1">
          {subView === 'login'
            ? 'تسجيل الدخول إلى حسابك في أمان'
            : subView === 'forgot_password'
            ? 'استعادة الوصول إلى حسابك'
            : 'إنشاء حساب عميل جديد (AUTH-02)'}
        </p>
      </div>

      {/* Global General Success Card */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Global General Error Card */}
      {generalError && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{generalError}</p>
            {authStatus === 'account_suspended' && (
              <p className="text-[11px] text-red-400 mt-1">
                تم تعليق الحساب لمراجعة الإجراءات التشغيلية. يرجى التواصل مع المسؤول.
              </p>
            )}
            {authStatus === 'account_disabled' && (
              <p className="text-[11px] text-red-400 mt-1">
                تم إيقاف صلاحية الدخول بشكل دائم من قبل إدارة النظام.
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 1: AUTH-01 Login Form */}
      {subView === 'login' && (
        <form onSubmit={handleSignIn} className="space-y-3.5" noValidate>
          {/* Email or Username Field */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              البريد الإلكتروني أو اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                {identifier.includes('@') ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (identifierError) setIdentifierError(null);
                  if (generalError) setGeneralError(null);
                }}
                disabled={loading}
                autoComplete="username"
                className={`w-full bg-slate-900 border ${
                  identifierError ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl pr-9 pl-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all`}
                placeholder="name@domain.com أو اسم المستخدم"
              />
            </div>
            {identifierError && (
              <p className="text-[11px] text-red-400 mt-1 pr-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 inline shrink-0" />
                <span>{identifierError}</span>
              </p>
            )}
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-300 block">كلمة المرور</label>
              <button
                type="button"
                onClick={() => {
                  setSubView('forgot_password');
                  setRecoveryEmail(identifier.includes('@') ? identifier : '');
                  setGeneralError(null);
                  setRecoveryError(null);
                  setRecoverySuccess(null);
                }}
                disabled={loading}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                  if (generalError) setGeneralError(null);
                }}
                disabled={loading}
                autoComplete="current-password"
                className={`w-full bg-slate-900 border ${
                  passwordError ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl pr-9 pl-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex={-1}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-[11px] text-red-400 mt-1 pr-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 inline shrink-0" />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {/* Submit Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </button>

          {/* Navigate to Signup (AUTH-02) */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setSubView('signup_info');
                setGeneralError(null);
              }}
              disabled={loading}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>ليس لديك حساب؟</span>
              <span className="text-emerald-400 font-semibold underline underline-offset-4">
                إنشاء حساب جديد
              </span>
            </button>
          </div>
        </form>
      )}

      {/* VIEW 2: Forgot Password Form */}
      {subView === 'forgot_password' && (
        <form onSubmit={handlePasswordRecovery} className="space-y-4" noValidate>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-slate-300 text-xs leading-relaxed">
            أدخل بريدك الإلكتروني المسجل في النظام وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.
          </div>

          {recoverySuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{recoverySuccess}</span>
            </div>
          )}

          {recoveryError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{recoveryError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                disabled={recoveryLoading}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pr-9 pl-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                placeholder="example@domain.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={recoveryLoading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {recoveryLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>جاري إرسال الطلب...</span>
              </>
            ) : (
              <span>إرسال طلب الاستعادة</span>
            )}
          </button>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => {
                setSubView('login');
                setRecoveryError(null);
                setRecoverySuccess(null);
              }}
              disabled={recoveryLoading}
              className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى تسجيل الدخول</span>
            </button>
          </div>
        </form>
      )}

      {/* VIEW 3: Signup Navigation Target (AUTH-02 Placeholder) */}
      {subView === 'signup_info' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">شاشة إنشاء الحساب — AUTH-02</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              المرحلة الحالية مخصصة حصرياً للشاشة AUTH-01 (تسجيل الدخول). سيتم تفعيل إنشاء الحساب بالكامل في مرحلة AUTH-02 القادمة وفق خطة المشروع.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSubView('login')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة إلى تسجيل الدخول (AUTH-01)</span>
          </button>
        </div>
      )}
    </div>
  );
};
