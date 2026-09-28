/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Shield,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  Loader2,
  X,
  Check
} from 'lucide-react';
import { ProtectionItem, ProtectionPlan, PaymentMethod } from '../../types/aman';

interface CustomerProtectionsScreenProps {
  supabase: SupabaseClient;
  protections: ProtectionItem[];
  plans: ProtectionPlan[];
  paymentMethods: PaymentMethod[];
  onRefresh: () => void;
  onOpenNewRequest: () => void;
}

export const CustomerProtectionsScreen: React.FC<CustomerProtectionsScreenProps> = ({
  supabase,
  protections,
  plans,
  paymentMethods,
  onRefresh,
  onOpenNewRequest
}) => {
  const [tab, setTab] = useState<'all' | 'active' | 'renewal' | 'expired'>('all');

  // Renewal Modal
  const [renewingProt, setRenewingProt] = useState<ProtectionItem | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedPmId, setSelectedPmId] = useState<string>('');
  const [transferRef, setTransferRef] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const nowMs = Date.now();

  // Helper to categorize
  const categorized = protections.map((p) => {
    const endMs = new Date(p.end_at).getTime();
    const daysLeft = Math.ceil((endMs - nowMs) / (1000 * 86400));
    const isExpired = daysLeft <= 0 || p.status === 'expired';
    const isNeedsRenewal = daysLeft <= 14 && !isExpired;
    const isActive = p.status === 'active' && !isExpired;

    return {
      ...p,
      daysLeft,
      isExpired,
      isNeedsRenewal,
      isActive
    };
  });

  const filtered = categorized.filter((p) => {
    if (tab === 'active') return p.isActive;
    if (tab === 'renewal') return p.isNeedsRenewal;
    if (tab === 'expired') return p.isExpired;
    return true;
  });

  const activePaymentMethods = paymentMethods.filter((pm) => pm.is_active);

  const handleOpenRenewal = (prot: ProtectionItem) => {
    setRenewingProt(prot);
    setErrorMsg(null);
    setSuccessMsg(null);
    setTransferRef('');

    // Preselect plan
    const matchPlan = plans.find((pl) => pl.company_id === prot.company_id && pl.is_active);
    if (matchPlan) setSelectedPlanId(matchPlan.id);
    if (activePaymentMethods.length > 0) setSelectedPmId(activePaymentMethods[0].id);
  };

  const handleRenewalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingProt || loading) return;

    if (!selectedPlanId || !selectedPmId || !transferRef.trim()) {
      setErrorMsg('يرجى ملء جميع حقول التجديد ورقم الحوالة');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.rpc('rpc_create_renewal_request', {
        p_protection_id: renewingProt.id,
        p_package_id: selectedPlanId,
        p_payment_method_id: selectedPmId,
        p_transfer_reference: transferRef.trim()
      });

      if (error) {
        setErrorMsg(error.message || 'فشل إرسال طلب التجديد');
        return;
      }

      setSuccessMsg('تم رفع طلب تجديد الحماية بنجاح! سيتم اعتماده بعد التحقق.');
      onRefresh();
      setTimeout(() => {
        setRenewingProt(null);
        setSuccessMsg(null);
      }, 1500);
    } catch {
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">حماياتي النشطة</h2>
            <p className="text-xs text-slate-400">تتبع اشتراكات الحماية وتواريخ التجديد</p>
          </div>
          <button
            onClick={onOpenNewRequest}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>طلب حماية</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(['all', 'active', 'renewal', 'expired'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1 text-center text-xs rounded-lg transition-all cursor-pointer ${
                tab === t
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'all'
                ? 'الكل'
                : t === 'active'
                ? 'النشطة'
                : t === 'renewal'
                ? 'تحتاج تجديد'
                : 'المنتهية'}
            </button>
          ))}
        </div>
      </div>

      {/* Protections List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">لا توجد حمايات في هذا القسم</p>
          </div>
        ) : (
          filtered.map((prot) => {
            const isDanger = prot.daysLeft <= 7 && !prot.isExpired;
            const isWarn = prot.daysLeft <= 14 && !prot.isExpired;

            return (
              <div
                key={prot.id}
                className={`p-3.5 rounded-xl bg-slate-900 border ${
                  prot.isExpired
                    ? 'border-slate-800 opacity-75'
                    : isDanger
                    ? 'border-red-500/50 bg-red-950/10'
                    : isWarn
                    ? 'border-amber-500/50 bg-amber-950/10'
                    : 'border-slate-800'
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-wider" dir="ltr">
                        {prot.phone_number || 'رقم هاتف'}
                      </div>
                      <div className="text-[10px] text-slate-400">{prot.package_name_snapshot}</div>
                    </div>
                  </div>

                  <div>
                    {prot.isExpired ? (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold">
                        منتهية
                      </span>
                    ) : isDanger ? (
                      <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold animate-pulse">
                        🔴 متبقي {prot.daysLeft} أيام
                      </span>
                    ) : isWarn ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        🟡 متبقي {prot.daysLeft} يوم
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        🟢 متبقي {prot.daysLeft} يوم
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata Box */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">تاريخ البدء:</span>
                    <span className="text-slate-300">
                      {new Date(prot.start_at).toLocaleDateString('ar-YE')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">تاريخ الانتهاء:</span>
                    <span className="text-slate-300">
                      {new Date(prot.end_at).toLocaleDateString('ar-YE')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">قيمة الحماية:</span>
                    <span className="font-semibold text-emerald-400">
                      {prot.price_snapshot} {prot.currency_snapshot}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">مرات التجديد:</span>
                    <span className="text-slate-300">{prot.renewal_count || 0}</span>
                  </div>
                </div>

                {/* Renewal button when eligible */}
                {(prot.isNeedsRenewal || prot.isExpired) && (
                  <button
                    onClick={() => handleOpenRenewal(prot)}
                    className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>طلب تجديد الحماية الآن</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* RENEWAL MODAL */}
      {renewingProt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">تجديد الحماية للرقم</h3>
              </div>
              <button
                onClick={() => setRenewingProt(null)}
                disabled={loading}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMsg && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRenewalSubmit} className="space-y-3" noValidate>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">الرقم المراد تجديده:</span>
                <span className="text-sm font-bold text-white" dir="ltr">
                  {renewingProt.phone_number}
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">باقة التجديد</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {plans
                    .filter((pl) => pl.company_id === renewingProt.company_id && pl.is_active)
                    .map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name_ar} — {pl.price} {pl.currency}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">طريقة السداد</label>
                <select
                  value={selectedPmId}
                  onChange={(e) => setSelectedPmId(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {activePaymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name_ar} {pm.account_identifier ? `(حساب: ${pm.account_identifier})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  رقم الحوالة / السداد
                </label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="رقم الإشعار المالي للتجديد"
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || !transferRef.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>تأكيد طلب التجديد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRenewingProt(null)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
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
