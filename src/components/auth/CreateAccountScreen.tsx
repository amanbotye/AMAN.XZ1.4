/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Shield, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../types/aman';

interface CreateAccountScreenProps {
  supabase: SupabaseClient;
  onNavigateToLogin: () => void;
  onSignUpSuccess: (profile: UserProfile, targetRoute: '/customer/home') => void;
}

export const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({
  supabase,
  onNavigateToLogin,
  onSignUpSuccess
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    let isValid = true;
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setGeneralError(null);

    if (!fullName.trim()) {
      setNameError('الاسم الكامل مطلوب');
      isValid = false;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('البريد الإلكتروني مطلوب');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('يرجى إدخال بريد إلكتروني صالح (مثال: name@domain.com)');
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

    if (!confirmPassword) {
      setConfirmError('يرجى تأكيد كلمة المرور');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('كلمتا المرور غير متطابقتين');
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) return;

    setLoading(true);
    setGeneralError(null);
    setSuccessNotice(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('unique constraint') || msg.includes('user already exists')) {
          setGeneralError('البريد الإلكتروني مسجل مسبقاً في النظام. يمكنك تسجيل الدخول مباشرة.');
        } else {
          setGeneralError(error.message || 'فشلت عملية إنشاء الحساب');
        }
        return;
      }

      if (data.user) {
        // If session was established directly (confirm email disabled in development/production)
        if (data.session) {
          // Wait briefly for handle_new_auth_user trigger to populate public.users
          await new Promise((r) => setTimeout(r, 600));
          const { data: userRec } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userRec) {
            onSignUpSuccess(userRec as UserProfile, '/customer/home');
            return;
          }
        }

        // Email confirmation required or user created
        setSuccessNotice('تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.');
        setTimeout(() => {
          onNavigateToLogin();
        }, 1500);
      }
    } catch {
      setGeneralError('حدث خطأ غير متوقع أثناء إنشاء الحساب.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col justify-center select-none" dir="rtl">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/60 mb-2">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-lg font-bold text-white tracking-wide">إنشاء حساب جديد</h1>
        <p className="text-xs text-slate-400 mt-1">انضم إلى أمان لحماية أرقامك وخدماتك</p>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Error Alert */}
      {generalError && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{generalError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-3" noValidate>
        {/* Full Name */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">الاسم الكامل</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (nameError) setNameError(null);
              }}
              disabled={loading}
              className={`w-full bg-slate-900 border ${
                nameError ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
              } rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all`}
              placeholder="محمد أحمد عبد الله"
            />
          </div>
          {nameError && (
            <p className="text-[11px] text-red-400 mt-1 pr-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 inline shrink-0" />
              <span>{nameError}</span>
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">البريد الإلكتروني</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              disabled={loading}
              className={`w-full bg-slate-900 border ${
                emailError ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
              } rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all`}
              placeholder="name@domain.com"
            />
          </div>
          {emailError && (
            <p className="text-[11px] text-red-400 mt-1 pr-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 inline shrink-0" />
              <span>{emailError}</span>
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">كلمة المرور</label>
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
              }}
              disabled={loading}
              className={`w-full bg-slate-900 border ${
                passwordError ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
              } rounded-xl pr-9 pl-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all`}
              placeholder="لا تقل عن 6 خانات"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-200"
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

        {/* Confirm Password */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">تأكيد كلمة المرور</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError(null);
              }}
              disabled={loading}
              className={`w-full bg-slate-900 border ${
                confirmError ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
              } rounded-xl pr-9 pl-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all`}
              placeholder="إعادة إدخال كلمة المرور"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmError && (
            <p className="text-[11px] text-red-400 mt-1 pr-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 inline shrink-0" />
              <span>{confirmError}</span>
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>جاري إنشاء الحساب...</span>
            </>
          ) : (
            <span>إنشاء الحساب</span>
          )}
        </button>

        {/* Back to Login */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onNavigateToLogin}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>لديك حساب بالفعل؟</span>
            <span className="text-emerald-400 font-semibold underline underline-offset-4">تسجيل الدخول</span>
          </button>
        </div>
      </form>
    </div>
  );
};
