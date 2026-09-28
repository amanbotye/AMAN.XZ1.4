/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  CreditCard,
  Plus,
  CheckCircle,
  XCircle,
  Edit2,
  Loader2,
  X,
  Check,
  Building2
} from 'lucide-react';
import { PaymentMethod } from '../../types/aman';

interface AdminPaymentMethodsScreenProps {
  supabase: SupabaseClient;
  paymentMethods: PaymentMethod[];
  onRefresh: () => void;
}

export const AdminPaymentMethodsScreen: React.FC<AdminPaymentMethodsScreenProps> = ({
  supabase,
  paymentMethods,
  onRefresh
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Add / Edit Modal
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [nameAr, setNameAr] = useState('');
  const [code, setCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggle = async (pm: PaymentMethod) => {
    if (updatingId) return;
    setUpdatingId(pm.id);

    try {
      await supabase
        .from('payment_methods')
        .update({ is_active: !pm.is_active })
        .eq('id', pm.id);
      onRefresh();
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenEdit = (pm?: PaymentMethod) => {
    if (pm) {
      setEditingMethod(pm);
      setNameAr(pm.name_ar);
      setCode(pm.code);
      setAccountName(pm.account_name || '');
      setAccountIdentifier(pm.account_identifier || '');
      setInstructions(pm.instructions || '');
    } else {
      setEditingMethod(null);
      setNameAr('');
      setCode('');
      setAccountName('');
      setAccountIdentifier('');
      setInstructions('');
    }
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!nameAr.trim() || !code.trim()) {
      setErrorMsg('اسم الحساب والكود مطلوبان');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (editingMethod) {
        // Edit existing
        const { error } = await supabase
          .from('payment_methods')
          .update({
            name_ar: nameAr.trim(),
            code: code.trim().toUpperCase(),
            account_name: accountName.trim() || null,
            account_identifier: accountIdentifier.trim() || null,
            instructions: instructions.trim() || null
          })
          .eq('id', editingMethod.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from('payment_methods').insert({
          name_ar: nameAr.trim(),
          code: code.trim().toUpperCase(),
          account_name: accountName.trim() || null,
          account_identifier: accountIdentifier.trim() || null,
          instructions: instructions.trim() || null,
          is_active: true,
          display_order: paymentMethods.length + 1
        });

        if (error) throw error;
      }

      onRefresh();
      setEditingMethod(null);
      setNameAr('');
      setCode('');
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل حفظ وسيلة السداد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">وسائل الدفع والتحويل</h2>
          <p className="text-xs text-slate-400">إدارة البنوك والمحافظ الإلكترونية لاستقبال الحوالات</p>
        </div>
        <button
          onClick={() => handleOpenEdit()}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة وسيلة</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {paymentMethods.map((pm) => (
          <div
            key={pm.id}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{pm.name_ar}</h4>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-emerald-400">{pm.code}</span>
                    <span>•</span>
                    <span>رقم الحساب: {pm.account_identifier || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(pm)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggle(pm)}
                  disabled={updatingId === pm.id}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pm.is_active
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {pm.is_active ? 'نشطة' : 'معطلة'}
                </button>
              </div>
            </div>

            {pm.instructions && (
              <p className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/60 leading-relaxed">
                {pm.instructions}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {(editingMethod !== null || nameAr !== '') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{editingMethod ? 'تعديل وسيلة الدفع' : 'إضافة وسيلة دفع جديدة'}</span>
              </h3>
              <button
                onClick={() => {
                  setEditingMethod(null);
                  setNameAr('');
                }}
                disabled={loading}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3" noValidate>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">اسم البنك / المحفظة</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: بنك الكريمي"
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">الكود التعريفي (رمز)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="KURAIMI"
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">اسم الحساب المستفيد</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="خدمة أمان لحماية الأرقام"
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">رقم الحساب / المحفظة</label>
                <input
                  type="text"
                  value={accountIdentifier}
                  onChange={(e) => setAccountIdentifier(e.target.value)}
                  placeholder="300123456"
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">تعليمات التحويل للعميل</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="إيداع أو تحويل عبر التطبيق البنكي..."
                  rows={2}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>حفظ وسيلة الدفع</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMethod(null);
                    setNameAr('');
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
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
};
