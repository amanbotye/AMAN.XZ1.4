/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

interface ChangePasswordModalProps {
  supabase: SupabaseClient;
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  supabase,
  isOpen,
  onClose
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    let isValid = true;
    setPasswordError(null);
    setConfirmError(null);
    setGeneralError(null);

    if (!newPassword) {
      setPasswordError('كلمة المرور الجديدة مطلوبة');
      isValid = false;
    } else if (newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب ألا تقل عن 6 خانات');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('يرجى تأكيد كلمة المرور الجديدة');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError('كلمتا المرور غير متطابقتين');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) return;

    setLoading(true);
    setGeneralError(null);
    setSuccessNotice(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setGeneralError(error.message || 'فشل تحديث كلمة المرور');
      } else {
        setSuccessNotice('تم تغيير كلمة المرور بنجاح.');
        setTimeout(() => {
          onClose();
          setNewPassword('');
          setConfirmPassword('');
          setSuccessNotice(null);
        }, 1500);
      }
    } catch {
      setGeneralError('حدث خطأ أثناء الاتصال بالنظام.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none" dir="rtl">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">تغيير كلمة المرور</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {generalError && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{generalError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pr-3 pl-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                placeholder="لا تقل عن 6 خانات"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-[11px] text-red-400 mt-1">{passwordError}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">تأكيد كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmError) setConfirmError(null);
                }}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pr-3 pl-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
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
              <p className="text-[11px] text-red-400 mt-1">{confirmError}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>حفظ كلمة المرور</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
