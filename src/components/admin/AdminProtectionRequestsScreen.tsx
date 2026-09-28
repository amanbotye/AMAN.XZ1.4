/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  CreditCard,
  Calendar,
  Loader2,
  X,
  Check
} from 'lucide-react';
import { ProtectionRequestItem, UserProfile } from '../../types/aman';

interface AdminProtectionRequestsScreenProps {
  supabase: SupabaseClient;
  requests: ProtectionRequestItem[];
  customers: UserProfile[];
  onRefresh: () => void;
}

export const AdminProtectionRequestsScreen: React.FC<AdminProtectionRequestsScreenProps> = ({
  supabase,
  requests,
  customers,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Approval state
  const [approvingReq, setApprovingReq] = useState<ProtectionRequestItem | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // Rejection state
  const [rejectingReq, setRejectingReq] = useState<ProtectionRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionLoading, setRejectionLoading] = useState(false);
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  // Handle transactional approval
  const handleApprove = async () => {
    if (!approvingReq || approvalLoading) return;
    setApprovalLoading(true);
    setApprovalFeedback(null);

    try {
      const { error } = await supabase.rpc('rpc_approve_protection_request', {
        p_request_id: approvingReq.id
      });

      if (error) {
        setApprovalFeedback('تعذر قبول الطلب: ' + error.message);
      } else {
        setApprovalFeedback('تم اعتماد طلب الحماية وتفعيل الاشتراك وإنشاء المهمة التشغيلية بنجاح.');
        onRefresh();
        setTimeout(() => {
          setApprovingReq(null);
          setApprovalFeedback(null);
        }, 1500);
      }
    } catch {
      setApprovalFeedback('حدث خطأ أثناء معالجة الاعتماد.');
    } finally {
      setApprovalLoading(false);
    }
  };

  // Handle rejection with mandatory reason
  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq || rejectionLoading) return;

    if (!rejectionReason.trim()) {
      setRejectionError('يرجى كتابة سبب رفض الطلب بشكل واضح للمشترك');
      return;
    }

    setRejectionLoading(true);
    setRejectionError(null);

    try {
      const { error } = await supabase.rpc('rpc_reject_protection_request', {
        p_request_id: rejectingReq.id,
        p_rejection_reason: rejectionReason.trim()
      });

      if (error) {
        setRejectionError(error.message || 'تعذر رفض الطلب');
      } else {
        onRefresh();
        setRejectingReq(null);
        setRejectionReason('');
      }
    } catch {
      setRejectionError('حدث خطأ أثناء حفظ الرفض.');
    } finally {
      setRejectionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">مراجعة طلبات الحماية</h2>
            <p className="text-xs text-slate-400">التحقق من الحوالات المالية وتفعيل خطوط الأمان</p>
          </div>
          <span className="text-xs font-bold text-amber-400 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            {requests.filter((r) => r.status === 'pending').length} قيد المراجعة
          </span>
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1 text-center text-xs rounded-lg transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'pending'
                ? 'بانتظار القرار'
                : tab === 'approved'
                ? 'المقبولة'
                : tab === 'rejected'
                ? 'المرفوضة'
                : 'الكل'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا توجد طلبات في هذا القسم</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const cust = customers.find((c) => c.id === req.customer_id);

            return (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-wider" dir="ltr">
                        {req.phone_number || 'رقم هاتف'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{cust?.full_name || 'عميل مسجل'}</span>
                        <span className="text-slate-600">•</span>
                        <span>{req.package_name || 'باقة حماية'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {req.status === 'pending' ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        بانتظار القرار
                      </span>
                    ) : req.status === 'approved' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        تم التفعيل
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                        مرفوض
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial Reference Box */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">المبلغ المطلوب:</span>
                    <span className="font-semibold text-emerald-400">
                      {req.requested_price} {req.requested_currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">طريقة السداد:</span>
                    <span className="text-slate-200">{req.payment_method_name || 'حوالة بنكية'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 block">المرجع البنكي / رقم الحوالة:</span>
                    <span className="font-mono text-white text-xs font-bold tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block mt-0.5">
                      {req.payment_transfer_reference || 'غير مدخل'}
                    </span>
                  </div>
                </div>

                {req.customer_note && (
                  <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500">ملاحظة العميل:</span> {req.customer_note}
                  </div>
                )}

                {req.status === 'rejected' && req.rejection_reason && (
                  <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                    <span className="font-bold">سبب الرفض: </span>
                    <span>{req.rejection_reason}</span>
                  </div>
                )}

                {/* Decision Buttons for Pending */}
                {req.status === 'pending' && (
                  <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                    <button
                      onClick={() => setApprovingReq(req)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>اعتماد وتفعيل الحماية</span>
                    </button>
                    <button
                      onClick={() => {
                        setRejectingReq(req);
                        setRejectionReason('');
                        setRejectionError(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-400 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>رفض</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* APPROVAL CONFIRMATION MODAL */}
      {approvingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>تأكيد اعتماد طلب الحماية</span>
              </h3>
              <button
                onClick={() => setApprovingReq(null)}
                disabled={approvalLoading}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              هل تم التحقق من وصول مبلغ {approvingReq.requested_price} {approvingReq.requested_currency} عبر الحوالة رقم{' '}
              <span className="font-mono text-emerald-400 font-bold">{approvingReq.payment_transfer_reference}</span>؟
              سيؤدي الاعتماد إلى تفعيل الحماية فوراً وإنشاء مهمة السداد الأولى تلقائياً.
            </p>

            {approvalFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                {approvalFeedback}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApprove}
                disabled={approvalLoading}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {approvalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>تأكيد الاعتماد والتشغيل</span>
              </button>
              <button
                onClick={() => setApprovingReq(null)}
                disabled={approvalLoading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>رفض طلب الحماية</span>
              </h3>
              <button
                onClick={() => setRejectingReq(null)}
                disabled={rejectionLoading}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {rejectionError && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                {rejectionError}
              </div>
            )}

            <form onSubmit={handleReject} className="space-y-3" noValidate>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  سبب الرفض (إلزامي للإشعار):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="مثال: رقم الحوالة غير مطابق، أو المبلغ المحول ناقص..."
                  rows={3}
                  disabled={rejectionLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={rejectionLoading || !rejectionReason.trim()}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {rejectionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  <span>تأكيد الرفض</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRejectingReq(null)}
                  disabled={rejectionLoading}
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
