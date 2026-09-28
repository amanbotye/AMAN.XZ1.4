/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../../types/aman';

interface LoginScreenProps {
  supabase: SupabaseClient;
  onLoginSuccess: (profile: UserProfile, targetRoute: '/customer/home' | '/admin/home') => void;
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  initialError?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  supabase,
  onLoginSuccess,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  initialError
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(initialError || null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    let isValid = true;
    setIdentifierError(null);
    setPasswordError(null);
    setGeneralError(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setIdentifierError('البريد الإلكتروني أو اسم المستخدم مطلوب');
      isValid = false;
    } else if (trimmed.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        setIdentifierError('يرجى إدخال بريد إلكتروني صالح (مثال: name@domain.com)');
        isValid = false;
      }
    } else {
      if (trimmed.length < 3) {
        setIdentifierError('اسم المستخدم يجب ألا يقل عن 3 أحرف');
        isValid = false;
      }
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) return;

    setLoading(true);
    setGeneralError(null);

    try {
      const trimmedIdentifier = identifier.trim();
      let targetEmail = trimmedIdentifier;

      // When username is entered instead of email, resolve email from users table
      if (!trimmedIdentifier.includes('@')) {
        try {
          const { data: userRecord } = await supabase
            .from('users')
            .select('email')
            .eq('username', trimmedIdentifier)
            .maybeSingle();

          if (userRecord?.email) {
            targetEmail = userRecord.email;
          }
        } catch {
          // If query fails, fall back to targetEmail
        }
      }

      // 1. Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
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
          setGeneralError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connect')) {
          setGeneralError('تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت');
        } else if (errorMsg.includes('email not confirmed')) {
          setGeneralError('يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.');
        } else {
          setGeneralError('حدث خطأ أثناء الاتصال بنظام المصادقة. يرجى المحاولة لاحقاً');
        }
        return;
      }

      // 2. Fetch User Profile from public.users using auth.users.id
      const userId = authData.user.id;
      const { data: userRec, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userRec) {
        await supabase.auth.signOut();
        setGeneralError('لم يتم العثور على بيانات المستخدم في النظام');
        return;
      }

      const profile = userRec as UserProfile;

      // 3. Status checks
      if (profile.is_deleted) {
        await supabase.auth.signOut();
        setGeneralError('هذا الحساب تم حذفه من النظام، يرجى التواصل مع الإدارة.');
        return;
      }

      if (profile.status === 'suspended') {
        await supabase.auth.signOut();
        setGeneralError('الحساب معطل أو موقوف، يرجى مراجعة الإدارة');
        return;
      }

      if (profile.status === 'disabled') {
        await supabase.auth.signOut();
        setGeneralError('تم تعطيل هذا الحساب نهائياً، يرجى التواصل مع الإدارة.');
        return;
      }

      if (profile.status !== 'active') {
        await supabase.auth.signOut();
        setGeneralError('حالة الحساب لا تسمح بالدخول، يرجى مراجعة إدارة النظام.');
        return;
      }

      // 4. Validate user_type and role-based routing
      if (profile.user_type !== 'admin' && profile.user_type !== 'customer') {
        await supabase.auth.signOut();
        setGeneralError('نوع الحساب غير صالح، لا يمكن تحديد مسار الوصول.');
        return;
      }

      const targetRoute = profile.user_type === 'admin' ? '/admin/home' : '/customer/home';
      onLoginSuccess(profile, targetRoute);
    } catch {
      setGeneralError('حدث خطأ غير متوقع أثناء معالجة تسجيل الدخول.');
    } finally {
      setLoading(false);
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
        <p className="text-xs text-slate-400 mt-1">تسجيل الدخول إلى حسابك في أمان</p>
      </div>

      {/* General Error Card */}
      {generalError && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{generalError}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-3.5" noValidate>
        {/* Email or Username Field */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">البريد الإلكتروني أو اسم المستخدم</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
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
                identifierError ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
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

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-slate-300 block">كلمة المرور</label>
            <button
              type="button"
              onClick={onNavigateToForgotPassword}
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
                passwordError ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

        {/* Sign up link */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onNavigateToSignUp}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>ليس لديك حساب؟</span>
            <span className="text-emerald-400 font-semibold underline underline-offset-4">إنشاء حساب جديد</span>
          </button>
        </div>
      </form>
    </div>
  );
};
