/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Shield,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Building2,
  Calendar,
  Loader2,
  X,
  FileText,
  Search,
  Check,
  ChevronDown
} from 'lucide-react';
import {
  CustomerNumberItem,
  ProtectionPlan,
  PaymentMethod,
  ProtectionRequestItem,
  ProtectionItem
} from '../../types/aman';

interface CustomerProtectionRequestsScreenProps {
  supabase: SupabaseClient;
  requests: ProtectionRequestItem[];
  numbers: CustomerNumberItem[];
  plans: ProtectionPlan[];
  paymentMethods: PaymentMethod[];
  protections: ProtectionItem[];
  onRefresh: () => void;
  isCreateModalOpenInitially?: boolean;
  preselectedNumberId?: string | null;
}

export const CustomerProtectionRequestsScreen: React.FC<CustomerProtectionRequestsScreenProps> = ({
  supabase,
  requests,
  numbers,
  plans,
  paymentMethods,
  protections,
  onRefresh,
  isCreateModalOpenInitially = false,
  preselectedNumberId = null
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isModalOpen, setIsModalOpen] = useState(isCreateModalOpenInitially);

  // New Request Form State
  const [selectedNumberId, setSelectedNumberId] = useState<string>(preselectedNumberId || (numbers[0]?.id || ''));
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedPmId, setSelectedPmId] = useState<string>('');
  const [transferRef, setTransferRef] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Target number for new request
  const currentNumber = numbers.find((n) => n.id === selectedNumberId) || numbers[0] || null;

  // Filter plans by company_id of current number
  const compatiblePlans = plans.filter((p) => p.is_active && (!currentNumber || p.company_id === currentNumber.company_id));
  const activePaymentMethods = paymentMethods.filter((pm) => pm.is_active);

  // Default selection if empty
  React.useEffect(() => {
    if (compatiblePlans.length > 0 && (!selectedPlanId || !compatiblePlans.some((p) => p.id === selectedPlanId))) {
      setSelectedPlanId(compatiblePlans[0].id);
    }
  }, [compatiblePlans, selectedPlanId]);

  React.useEffect(() => {
    if (activePaymentMethods.length > 0 && !selectedPmId) {
      setSelectedPmId(activePaymentMethods[0].id);
    }
  }, [activePaymentMethods, selectedPmId]);

  // Filter list
  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedNumberId) {
      setErrorMsg('يرجى اختيار رقم الهاتف المطلوب حمايته');
      return;
    }

    if (!selectedPlanId) {
      setErrorMsg('يرجى اختيار باقة الحماية');
      return;
    }

    if (!selectedPmId) {
      setErrorMsg('يرجى اختيار وسيلة الدفع المستخدمة');
      return;
    }

    if (!transferRef.trim()) {
      setErrorMsg('يرجى إدخال رقم الحوالة أو المرجع البنكي للتأكيد');
      return;
    }

    // Check if number already has an active protection or pending request
    const hasActiveProt = protections.some(
      (p) => p.customer_number_id === selectedNumberId && p.status === 'active'
    );
    if (hasActiveProt) {
      setErrorMsg('هذا الرقم لديه حماية نشطة بالفعل في النظام');
      return;
    }

    const hasPendingReq = requests.some(
      (r) => r.customer_number_id === selectedNumberId && r.status === 'pending'
    );
    if (hasPendingReq) {
      setErrorMsg('توجد بالفعل طلب حماية قيد المراجعة لهذا الرقم');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('rpc_create_protection_request', {
        p_customer_number_id: selectedNumberId,
        p_package_id: selectedPlanId,
        p_payment_method_id: selectedPmId,
        p_transfer_reference: transferRef.trim(),
        p_customer_note: customerNote.trim() || null
      });

      if (error) {
        setErrorMsg(error.message || 'فشل إرسال طلب الحماية');
        return;
      }

      setSuccessMsg('تم رفع طلب الحماية بنجاح! سيتم مراجعته وتفعيله من قبل الإدارة.');
      setTransferRef('');
      setCustomerNote('');
      onRefresh();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
      }, 1500);
    } catch {
      setErrorMsg('حدث خطأ غير متوقع أثناء إرسال طلب الحماية.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            <CheckCircle className="w-3 h-3" />
            <span>مقبول ومفعل</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold">
            <XCircle className="w-3 h-3" />
            <span>مرفوض</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-bold">
            <Clock className="w-3 h-3" />
            <span>قيد المراجعة</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">طلبات الحماية</h2>
            <p className="text-xs text-slate-400">متابعة طلبات التفعيل والحوالات المالية</p>
          </div>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>طلب حماية</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1 text-center text-xs rounded-lg transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all'
                ? 'الكل'
                : tab === 'pending'
                ? 'قيد الانتظار'
                : tab === 'approved'
                ? 'المقبولة'
                : 'المرفوضة'}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredRequests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">لا توجد طلبات في هذا القسم</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تقديم طلب حماية جديد</span>
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white tracking-wide" dir="ltr">
                      {req.phone_number || 'رقم هاتف'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(req.created_at).toLocaleDateString('ar-YE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {getStatusBadge(req.status)}
              </div>

              {/* Details table in card */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">الباقة المطلوبة:</span>
                  <span className="font-semibold text-slate-200">{req.package_name || 'باقة أمان'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">المبلغ:</span>
                  <span className="font-semibold text-emerald-400">
                    {req.requested_price} {req.requested_currency}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">طريقة السداد:</span>
                  <span className="text-slate-300 font-medium">
                    {req.payment_method_name || 'حوالة بنكية'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">رقم الحوالة:</span>
                  <span className="font-mono text-slate-300 tracking-wider">
                    {req.payment_transfer_reference || 'غير محدد'}
                  </span>
                </div>
              </div>

              {/* Rejection reason box if applicable */}
              {req.status === 'rejected' && req.rejection_reason && (
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                  <span className="font-bold block mb-0.5">سبب الرفض:</span>
                  <p className="text-[11px] leading-relaxed">{req.rejection_reason}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">تقديم طلب حماية جديد</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
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
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {/* Select Number */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  اختر رقم الهاتف المطلوب حمايته
                </label>
                <select
                  value={selectedNumberId}
                  onChange={(e) => setSelectedNumberId(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  {numbers.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.phone_number} — {n.detected_prefix} ({n.notes || 'رقمي'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Protection Package */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">باقة الحماية</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  {compatiblePlans.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name_ar} — {pl.price} {pl.currency} ({pl.duration_days} يوم)
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  طريقة التحويل / الإيداع
                </label>
                <select
                  value={selectedPmId}
                  onChange={(e) => setSelectedPmId(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  {activePaymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name_ar} {pm.account_identifier ? `(حساب: ${pm.account_identifier})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transfer Reference */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  رقم الإشعار / الحوالة البنكية
                </label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="مثال: 987654321"
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Customer Note */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="أي تفاصيل أو ملاحظات للإدارة..."
                  rows={2}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || !transferRef.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>تأكيد وإرسال الطلب</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
