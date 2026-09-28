/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  User,
  Mail,
  Lock,
  FileText,
  Shield,
  LogOut,
  Edit2,
  Check,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../../types/aman';
import { ChangePasswordModal } from './ChangePasswordModal';

interface CustomerAccountScreenProps {
  supabase: SupabaseClient;
  profile: UserProfile;
  onRefreshProfile: () => void;
  onSignOut: () => void;
}

export const CustomerAccountScreen: React.FC<CustomerAccountScreenProps> = ({
  supabase,
  profile,
  onRefreshProfile,
  onSignOut
}) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.full_name || '');
  const [updatingName, setUpdatingName] = useState(false);
  const [nameFeedback, setNameFeedback] = useState<string | null>(null);

  // Modals for Terms & Privacy
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updatingName) return;

    if (!nameInput.trim()) {
      setNameFeedback('الاسم مطلوب');
      return;
    }

    setUpdatingName(true);
    setNameFeedback(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: nameInput.trim() })
        .eq('id', profile.id);

      if (error) {
        setNameFeedback('تعذر تحديث الاسم: ' + error.message);
      } else {
        setNameFeedback('تم حفظ الاسم بنجاح');
        onRefreshProfile();
        setTimeout(() => {
          setIsEditingName(false);
          setNameFeedback(null);
        }, 1200);
      }
    } catch {
      setNameFeedback('حدث خطأ أثناء حفظ الاسم');
    } finally {
      setUpdatingName(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 select-none" dir="rtl">
      {/* Profile Header Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/60 shadow-lg text-center relative">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-lg shadow-emerald-950/60 mb-2">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
            <User className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-base font-bold text-white">{profile.full_name || 'عميل أمان'}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{profile.email || 'لا يوجد بريد'}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>حساب مفعل (نشط)</span>
        </div>
      </div>

      {/* Account Details Box */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300">بيانات الحساب الأساسية</h3>

        {/* Full Name Edit */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">الاسم الكامل</span>
            {!isEditingName && (
              <button
                onClick={() => {
                  setIsEditingName(true);
                  setNameInput(profile.full_name || '');
                  setNameFeedback(null);
                }}
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>تعديل</span>
              </button>
            )}
          </div>

          {isEditingName ? (
            <form onSubmit={handleUpdateName} className="space-y-2 mt-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                disabled={updatingName}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              {nameFeedback && (
                <div className="text-[11px] text-emerald-400">{nameFeedback}</div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updatingName}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {updatingName ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  <span>حفظ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          ) : (
            <div className="text-xs font-bold text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              {profile.full_name || 'غير محدد'}
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <span className="text-xs text-slate-400 block mb-1">البريد الإلكتروني</span>
          <div className="text-xs font-bold text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span>{profile.email || 'غير متوفر'}</span>
            <span className="text-[10px] text-slate-500">(معتمد في المصادقة)</span>
          </div>
        </div>

        {/* Username */}
        <div>
          <span className="text-xs text-slate-400 block mb-1">اسم المستخدم</span>
          <div className="text-xs font-bold text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            {profile.username || 'لا يوجد اسم مستخدم'}
          </div>
        </div>

        {/* Role & Status */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">نوع الحساب</span>
            <span className="font-bold text-slate-200">عميل (Customer)</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">حالة الحساب</span>
            <span className="font-bold text-emerald-400">{profile.status}</span>
          </div>
        </div>
      </div>

      {/* Security & Settings actions */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <h3 className="text-xs font-bold text-slate-300 mb-2">إعدادات الأمان والقانونية</h3>

        {/* Change password button */}
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 transition-all flex items-center justify-between text-xs text-white cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>تغيير كلمة المرور</span>
          </div>
          <span className="text-[10px] text-slate-400">تحديث أمان الحساب</span>
        </button>

        {/* Terms and conditions */}
        <button
          onClick={() => setShowTerms(true)}
          className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 transition-all flex items-center justify-between text-xs text-white cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>الشروط والأحكام</span>
          </div>
          <span className="text-[10px] text-slate-400">اتفاقية استخدام أمان</span>
        </button>

        {/* Privacy Policy */}
        <button
          onClick={() => setShowPrivacy(true)}
          className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 transition-all flex items-center justify-between text-xs text-white cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>سياسة الخصوصية</span>
          </div>
          <span className="text-[10px] text-slate-400">حماية البيانات والسرية</span>
        </button>
      </div>

      {/* Logout button */}
      <button
        onClick={onSignOut}
        className="w-full py-3 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-500/40 text-red-400 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>تسجيل الخروج من الحساب</span>
      </button>

      {/* CHANGE PASSWORD MODAL (SCREEN 04) */}
      <ChangePasswordModal
        supabase={supabase}
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* TERMS MODAL */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">الشروط والأحكام</h3>
              <button onClick={() => setShowTerms(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
              تقدم خدمة «أمان» حلول الحماية والتجديد الآلي وتأمين خطوط الاتصالات بموجب اشتراكات دورية. يلتزم العميل بتقديم بيانات دقيقة وتأكيد الحوالات عبر المراجع البنكية الرسمية. يتم تفعيل الحماية وتجديدها وفق أنظمة المشغلين وقواعد العمل المعتمدة.
            </p>
            <button
              onClick={() => setShowTerms(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}

      {/* PRIVACY MODAL */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">سياسة الخصوصية</h3>
              <button onClick={() => setShowPrivacy(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
              تضمن أمان الحفاظ الكامل على سرية أرقام الهواتف وبيانات المستخدم والحوالات المالية، ولا يتم مشاركة أي سجلات مع أي جهات خارجية غير مصرح بها. يتم تشفير جميع العمليات والاتصالات عبر بروتوكولات حماية موثوقة.
            </p>
            <button
              onClick={() => setShowPrivacy(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              موافق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
