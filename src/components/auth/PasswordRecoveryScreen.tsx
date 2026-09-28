/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Shield, Mail, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface PasswordRecoveryScreenProps {
  supabase: SupabaseClient;
  onNavigateToLogin: () => void;
}

export const PasswordRecoveryScreen: React.FC<PasswordRecoveryScreenProps> = ({
  supabase,
  onNavigateToLogin
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setEmailError(null);
    setGeneralError(null);
    setSuccessMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('البريد الإلكتروني مطلوب');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('يرجى إدخال بريد إلكتروني صالح (مثال: name@domain.com)');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
      if (error) {
        setGeneralError(error.message || 'تعذر إرسال رابط استعادة كلمة المرور');
      } else {
        setSuccessMessage('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح.');
      }
    } catch {
      setGeneralError('حدث خطأ أثناء محاولة الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col justify-center select-none" dir="rtl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/60 mb-2">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-lg font-bold text-white tracking-wide">استعادة كلمة المرور</h1>
        <p className="text-xs text-slate-400 mt-1">أدخل بريدك الإلكتروني لاستلام رابط الاستعادة</p>
      </div>

      {/* Success alert */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error alert */}
      {generalError && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{generalError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              } rounded-xl pr-9 pl-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all`}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>جاري إرسال الطلب...</span>
            </>
          ) : (
            <span>إرسال رابط الاستعادة</span>
          )}
        </button>

        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={onNavigateToLogin}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة إلى تسجيل الدخول</span>
          </button>
        </div>
      </form>
    </div>
  );
};
