/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  RotateCcw,
  Shield,
  Calendar,
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Loader2,
  User,
  Smartphone,
  Building2,
  FileCheck,
  ArrowRight
} from 'lucide-react';
import { ProtectionItem, ProtectionPlan, PaymentMethod, UserProfile } from '../../types/aman';

interface CustomerRenewalScreenProps {
  supabase: SupabaseClient;
  protections: ProtectionItem[];
  plans: ProtectionPlan[];
  paymentMethods: PaymentMethod[];
  profile: UserProfile;
  onRefresh: () => void;
  onNavigateToProtections?: () => void;
  targetProtectionId?: string | null;
}

export const CustomerRenewalScreen: React.FC<CustomerRenewalScreenProps> = ({
  supabase,
  protections,
  plans,
  paymentMethods,
  profile,
  onRefresh,
  onNavigateToProtections,
  targetProtectionId
}) => {
  const [selectedProtId, setSelectedProtId] = useState<string>(
    targetProtectionId || protections[0]?.id || ''
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedPmId, setSelectedPmId] = useState<string>(
    paymentMethods.filter((pm) => pm.is_active)[0]?.id || ''
  );
  const [transferRef, setTransferRef] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const nowMs = Date.now();
  const selectedProt = protections.find((p) => p.id === selectedProtId) || protections[0];

  // Calculate days remaining and renewal eligibility
  let daysLeft = 0;
  let isEligible = false;
  let endFormatted = '';
  let startFormatted = '';

  if (selectedProt) {
    const endMs = new Date(selectedProt.end_at).getTime();
    const startMs = new Date(selectedProt.start_at).getTime();
    daysLeft = Math.ceil((endMs - nowMs) / (1000 * 86400));
    // Renewal allowed within 14 days of expiry or if expired (per company rules)
    isEligible = daysLeft <= 14;
    endFormatted = new Date(endMs).toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    startFormatted = new Date(startMs).toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Company plans
  const availablePlans = selectedProt
    ? plans.filter((pl) => pl.company_id === selectedProt.company_id && pl.is_active)
    : [];

  const currentPlan = availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];
  const activePaymentMethods = paymentMethods.filter((pm) => pm.is_active);
  const currentPm = activePaymentMethods.find((pm) => pm.id === selectedPmId) || activePaymentMethods[0];

  const handleExecuteRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProt || loading) return;

    if (!isEligible) {
      setErrorMsg('التجديد غير متاح حالياً. يسمح بالتجديد فقط عندما تتبقى 14 يوماً أو أقل على انتهاء الحماية.');
      return;
    }

    if (!transferRef.trim()) {
      setErrorMsg('يرجى إدخال رقم أو مرجع الحوالة البنكية');
      return;
    }

    const planToUse = currentPlan;
    if (!planToUse) {
      setErrorMsg('يرجى اختيار باقة التجديد المعتمدة');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. First attempt authoritative backend RPC
      const { data: rpcRes, error: rpcError } = await supabase.rpc('rpc_create_renewal_request', {
        p_protection_id: selectedProt.id,
        p_package_id: planToUse.id,
        p_payment_method_id: selectedPmId || activePaymentMethods[0]?.id,
        p_transfer_reference: transferRef.trim()
      });

      if (!rpcError && (rpcRes?.success || rpcRes === true || !rpcRes?.error_code)) {
        setSuccessMsg('تم رفع وتثبيت طلب تجديد الحماية بنجاح! سيتم تمديد الحماية القائمة دون إنشاء حماية مكررة.');
        onRefresh();
        setTransferRef('');
        return;
      }

      // If RPC is unavailable or requires manager approval flow:
      // Directly create protection_request with renewal intent or extend protection
      const { error: reqError } = await supabase.from('protection_requests').insert({
        customer_id: profile.id,
        customer_number_id: selectedProt.customer_number_id,
        company_id: selectedProt.company_id,
        package_id: planToUse.id,
        payment_method_id: selectedPmId || activePaymentMethods[0]?.id,
        status: 'pending',
        requested_price: planToUse.price,
        requested_currency: planToUse.currency,
        requested_duration_days: planToUse.duration_days,
        payment_transfer_reference: transferRef.trim(),
        customer_note: `طلب تجديد الحماية القائمة رقم (${selectedProt.id.slice(0, 8)})`
      });

      if (reqError) {
        throw reqError;
      }

      setSuccessMsg('تم إرسال طلب تجديد الحماية بنجاح! سيتم تمديد الحماية الحالية فور مراجعة المدير للحوالة.');
      onRefresh();
      setTransferRef('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء معالجة طلب التجديد. يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none bg-slate-950" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onNavigateToProtections && (
            <button
              onClick={onNavigateToProtections}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer ml-1"
              title="العودة للحمايات"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>SCREEN 09 — تجديد الحماية (Renewal)</span>
            </h2>
            <p className="text-xs text-slate-400">تمديد الحماية الحالية وفق اشتراطات الشركة دون إنشاء حماية ثانية</p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          قواعد التجديد AMAN.XZ1.4
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selector for which protection to renew if user has multiple */}
        {protections.length > 1 && (
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              اختر الحماية المراد تجديدها:
            </label>
            <select
              value={selectedProt?.id || ''}
              onChange={(e) => {
                setSelectedProtId(e.target.value);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {protections.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.phone_number || 'رقم'} — {p.company_name_ar || 'الشركة'} ({p.package_name_snapshot})
                </option>
              ))}
            </select>
          </div>
        )}

        {!selectedProt ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">لا توجد حمايات نشطة للتجديد حالياً</p>
            <p className="text-xs text-slate-400 mt-1">يجب أن تمتلك حماية مفعلة أو قاربت على الانتهاء لطلب التجديد.</p>
          </div>
        ) : (
          <>
            {/* Protection Owner Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>بيانات مالك الحماية (Current Protection Owner)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">اسم العميل:</span>
                  <span className="font-bold text-white">{profile.full_name || 'عميل أمان'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">البريد الإلكتروني:</span>
                  <span className="font-mono text-slate-300 text-[11px]">{profile.email}</span>
                </div>
              </div>
            </div>

            {/* Current Protection Data Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>بيانات الحماية الحالية (Current Protection Data)</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    daysLeft <= 0
                      ? 'bg-red-500/20 text-red-400'
                      : daysLeft <= 14
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {daysLeft <= 0
                    ? 'منتهية'
                    : daysLeft <= 14
                    ? `تتطلب التجديد (متبقي ${daysLeft} يوم)`
                    : `سارية (متبقي ${daysLeft} يوم)`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">الرقم المحمي:</span>
                  <span className="font-mono font-bold text-white text-sm" dir="ltr">
                    {selectedProt.phone_number || 'رقم مسجل'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">شركة الاتصالات:</span>
                  <span className="font-bold text-sky-400">
                    {selectedProt.company_name_ar || 'المشغل المعتمد'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">الباقة الحالية:</span>
                  <span className="font-bold text-white">{selectedProt.package_name_snapshot}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">قيمة الحماية الحالية:</span>
                  <span className="font-bold text-emerald-400">
                    {selectedProt.price_snapshot} {selectedProt.currency_snapshot}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">تاريخ البدء:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{startFormatted}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">تاريخ الانتهاء الحالي:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{endFormatted}</span>
                </div>
              </div>

              {/* Renewal Eligibility Alert */}
              {!isEligible && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    وفق إعدادات الشركة، التجديد غير متاح الآن لأن الحماية ما زالت سارية لأكثر من 14 يوماً ({daysLeft} يوم متبقي).
                  </span>
                </div>
              )}
            </div>

            {/* Renewal Execution Form */}
            <form onSubmit={handleExecuteRenewal} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-slate-800 pb-2">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>إجراء التجديد وتمديد فترة الحماية (Renewal Action)</span>
              </div>

              {/* Feedback messages */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Package Selection */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  باقة التجديد المراد تمديد الحماية بها:
                </label>
                <div className="space-y-2">
                  {availablePlans.map((pl) => (
                    <label
                      key={pl.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        (selectedPlanId || availablePlans[0]?.id) === pl.id
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="renewal_plan"
                          value={pl.id}
                          checked={(selectedPlanId || availablePlans[0]?.id) === pl.id}
                          onChange={() => setSelectedPlanId(pl.id)}
                          className="accent-emerald-500"
                        />
                        <div>
                          <div className="text-xs font-bold">{pl.name_ar}</div>
                          <div className="text-[10px] text-slate-400">
                            تمديد لمدة {pl.duration_days} يوم
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {pl.price} {pl.currency}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  طريقة التحويل أو الدفع:
                </label>
                <select
                  value={selectedPmId}
                  onChange={(e) => setSelectedPmId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {activePaymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name_ar} {pm.account_identifier ? `(${pm.account_identifier})` : ''}
                    </option>
                  ))}
                </select>
                {currentPm?.instructions && (
                  <p className="text-[11px] text-amber-400/90 mt-1 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    تعليمات التحويل: {currentPm.instructions}
                  </p>
                )}
              </div>

              {/* Transfer Reference */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  رقم الحوالة البنكية / إشعار السداد:
                </label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="مثال: 987654321"
                  disabled={!isEligible || loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Rule reminder note */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-slate-300 block">ضوابط التجديد في AMAN.XZ1.4:</span>
                <p>• التجديد يمدد نفس الحماية الحالية ولا ينشئ حماية ثانية مستقلة.</p>
                <p>• يُعاد احتساب جدول المهام التشغيلية المستقبلية وتاريخ الانتهاء الجديد تلقائياً.</p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!isEligible || loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  !isEligible || loading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري معالجة التجديد...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>تنفيذ تجديد الحماية وتمديد الصلاحية</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
