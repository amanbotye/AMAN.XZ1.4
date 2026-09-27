import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Check,
  AlertTriangle,
  FileText,
  Clock,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  CreditCard,
  Phone,
  RotateCcw
} from 'lucide-react';
import { liveAmanService } from '../services/liveAmanService';
import { getErrorMessageAr } from '../services/errorTranslator';
import {
  ProtectionRequest,
  ProtectionRenewal,
  ProtectionTask,
  ManualPaymentLog,
  CustomerNumber,
  Company,
  PaymentMethod
} from '../types/aman';

interface AdminAppLiveProps {
  onSignOut: () => void;
  adminEmail: string;
}

export function AdminAppLive({ onSignOut, adminEmail }: AdminAppLiveProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'renewals' | 'tasks' | 'payments'>('requests');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Real Database State
  const [requests, setRequests] = useState<ProtectionRequest[]>([]);
  const [renewals, setRenewals] = useState<ProtectionRenewal[]>([]);
  const [tasks, setTasks] = useState<ProtectionTask[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<ManualPaymentLog[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [numbers, setNumbers] = useState<CustomerNumber[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Action feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{ message: string; action: string } | null>(null);

  const loadAdminData = async () => {
    try {
      const [
        fetchedReqs,
        fetchedRenewals,
        fetchedTasks,
        fetchedLogs,
        fetchedCompanies,
        fetchedNumbers,
        fetchedPaymentMethods
      ] = await Promise.all([
        liveAmanService.getProtectionRequests(),
        liveAmanService.getRenewals(),
        liveAmanService.getProtectionTasks(),
        liveAmanService.getPaymentLogs(),
        liveAmanService.getCompanies(),
        liveAmanService.getCustomerNumbers(),
        liveAmanService.getPaymentMethods()
      ]);

      setRequests(fetchedReqs);
      setRenewals(fetchedRenewals);
      setTasks(fetchedTasks);
      setPaymentLogs(fetchedLogs);
      setCompanies(fetchedCompanies);
      setNumbers(fetchedNumbers);
      setPaymentMethods(fetchedPaymentMethods);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle Verify Payment
  const handleVerifyPayment = async (requestId?: string, renewalId?: string, status: 'verified' | 'rejected' = 'verified') => {
    setActionError(null);
    setActionSuccess(null);
    setIsProcessing(true);

    const res = await liveAmanService.rpcVerifyManualPayment(requestId, renewalId, status);
    setIsProcessing(false);

    if (res.success) {
      setActionSuccess('تم تسجيل وتأكيد التحقق المالي للحوالة بنجاح.');
      await loadAdminData();
    } else {
      setActionError(getErrorMessageAr(res.error_code, res.message));
    }
  };

  // Handle Approve Request
  const handleApproveRequest = async (requestId: string) => {
    setActionError(null);
    setActionSuccess(null);
    setIsProcessing(true);

    const res = await liveAmanService.rpcApproveProtectionRequest(requestId);
    setIsProcessing(false);

    if (res.success) {
      setActionSuccess('تم اعتماد الطلب وتفعيل الحماية وجدولة المهام التشغيلية بنجاح!');
      await loadAdminData();
    } else {
      setActionError(getErrorMessageAr(res.error_code, res.message));
    }
  };

  // Handle Reject Request
  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('أدخل سبب رفض طلب الحماية:');
    if (!reason || !reason.trim()) return;

    setActionError(null);
    setActionSuccess(null);
    setIsProcessing(true);

    const res = await liveAmanService.rpcRejectProtectionRequest(requestId, reason.trim());
    setIsProcessing(false);

    if (res.success) {
      setActionSuccess('تم رفض الطلب وإشعار العميل بالسبب.');
      await loadAdminData();
    } else {
      setActionError(getErrorMessageAr(res.error_code, res.message));
    }
  };

  // Handle Approve Renewal
  const handleApproveRenewal = async (renewalId: string) => {
    setActionError(null);
    setActionSuccess(null);
    setIsProcessing(true);

    const res = await liveAmanService.rpcApproveRenewal(renewalId);
    setIsProcessing(false);

    if (res.success) {
      setActionSuccess('تم اعتماد التجديد وتمديد فترة الحماية بنجاح!');
      await loadAdminData();
    } else {
      setActionError(getErrorMessageAr(res.error_code, res.message));
    }
  };

  // Handle Execute Task
  const handleExecuteTask = async (taskId: string) => {
    const note = prompt('ملاحظات تنفيذ العملية التشغيلية:') || '';
    setActionError(null);
    setActionSuccess(null);
    setIsProcessing(true);

    const res = await liveAmanService.rpcExecuteTask(taskId, note);
    setIsProcessing(false);

    if (res.success) {
      setActionSuccess('تم تسجيل تنفيذ المهمة وتحديث تاريخها.');
      await loadAdminData();
    } else {
      setActionError(getErrorMessageAr(res.error_code, res.message));
    }
  };

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name_ar || 'غير محدد';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">منظومة أمان — لوحة الإدارة والتدقيق</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  مدير النظام
                </span>
              </div>
              <div className="text-[11px] text-slate-400" dir="ltr">{adminEmail}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                loadAdminData();
              }}
              title="تحديث البيانات"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onSignOut}
              title="تسجيل الخروج"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-rose-300 border border-slate-700 hover:border-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-4 flex border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'requests' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            طلبات الحماية ({requests.filter(r => r.status === 'pending').length} معلق)
          </button>
          <button
            onClick={() => setActiveTab('renewals')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'renewals' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            طلبات التجديد ({renewals.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'tasks' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            المهام التشغيلية ({tasks.filter(t => t.status === 'scheduled').length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'payments' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            دفتر الحوالات ({paymentLogs.length})
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {/* Alerts */}
        {actionSuccess && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">&times;</button>
          </div>
        )}

        {actionError && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div>
              <div className="font-bold">{actionError.message}</div>
              <div className="text-[11px] text-rose-400/90">{actionError.action}</div>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">&times;</button>
          </div>
        )}

        {/* TAB 1: PROTECTION REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">طلبات الحماية الجديدة والتدقيق المالي</h2>

            {requests.length === 0 ? (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
                لا توجد طلبات حماية مسجلة حالياً.
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => {
                  const num = numbers.find(n => n.id === req.customer_number_id);
                  const pm = paymentMethods.find(m => m.id === req.payment_method_id);
                  const compName = getCompanyName(req.company_id);
                  const isVerified = paymentLogs.some(
                    l => l.request_id === req.id && l.verification_status === 'verified'
                  );

                  return (
                    <div
                      key={req.id}
                      className={`p-5 rounded-2xl border bg-slate-900/80 space-y-4 transition-all ${
                        isVerified ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-xl text-white" dir="ltr">
                            {num?.phone_number || req.customer_number_id}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {compName}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              req.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : req.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {req.status === 'approved' && 'معتمد'}
                            {req.status === 'rejected' && 'مرفوض'}
                            {req.status === 'pending' && 'معلق'}
                          </span>
                        </div>

                        <div className="text-left font-mono font-bold text-sm text-emerald-400">
                          {req.requested_price} {req.requested_currency} &bull; {req.requested_duration_days} يوماً
                        </div>
                      </div>

                      {/* Payment Verification Box */}
                      <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div>وسيلة التحويل: <strong className="text-slate-200">{pm?.name_ar || 'غير محدد'}</strong></div>
                          <div className="font-mono">مرجع الحوالة: <strong className="text-cyan-300">{req.payment_transfer_reference}</strong></div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                              <Check className="w-3.5 h-3.5" />
                              تم تدقيق الحوالة بنجاح
                            </span>
                          ) : (
                            <button
                              onClick={() => handleVerifyPayment(req.id, undefined, 'verified')}
                              disabled={isProcessing}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow"
                            >
                              <Check className="w-3.5 h-3.5" />
                              تأكيد استلام الحوالة
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-slate-800 hover:bg-rose-950/40 text-rose-300 border border-slate-700 rounded-xl text-xs font-semibold"
                          >
                            رفض الطلب
                          </button>
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            disabled={isProcessing || !isVerified}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 ${
                              isVerified
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            اعتماد وتفعيل الحماية
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RENEWALS */}
        {activeTab === 'renewals' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">طلبات تجديد الحماية السارية</h2>

            {renewals.length === 0 ? (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
                لا توجد طلبات تجديد حالياً.
              </div>
            ) : (
              <div className="space-y-4">
                {renewals.map(ren => {
                  const pm = paymentMethods.find(m => m.id === ren.payment_method_id);
                  const isVerified = paymentLogs.some(
                    l => l.renewal_id === ren.id && l.verification_status === 'verified'
                  );

                  return (
                    <div key={ren.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">طلب تمديد حماية</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                            {ren.duration_days_snapshot} يوماً
                          </span>
                        </div>
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          {ren.price_snapshot} {ren.currency_snapshot}
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div>وسيلة التحويل: <strong className="text-slate-200">{pm?.name_ar}</strong></div>
                          <div className="font-mono">مرجع الحوالة: <strong className="text-cyan-300">{ren.payment_transfer_reference}</strong></div>
                        </div>

                        {!isVerified && (
                          <button
                            onClick={() => handleVerifyPayment(undefined, ren.id, 'verified')}
                            disabled={isProcessing}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            تأكيد الحوالة
                          </button>
                        )}
                      </div>

                      {ren.status === 'pending' && (
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => handleApproveRenewal(ren.id)}
                            disabled={isProcessing || !isVerified}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 ${
                              isVerified
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                          >
                            <RotateCcw className="w-4 h-4" />
                            اعتماد التمديد
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">المهام التشغيلية الدورية المجدولة</h2>

            {tasks.length === 0 ? (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
                لا توجد مهام تشغيلية مجدولة حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map(t => {
                  const num = numbers.find(n => n.id === t.customer_number_id);
                  const isDone = t.status === 'completed';

                  return (
                    <div key={t.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white" dir="ltr">
                          {num?.phone_number || t.customer_number_id}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {isDone ? 'منجزة' : 'مجدولة'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <div>المبلغ: {t.amount} {t.currency}</div>
                        <div>التاريخ: {new Date(t.scheduled_at).toLocaleDateString('ar-YE')}</div>
                      </div>

                      {!isDone && (
                        <button
                          onClick={() => handleExecuteTask(t.id)}
                          disabled={isProcessing}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                        >
                          تسجيل تنفيذ العملية
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENT LOGS */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">دفتر التدقيق المالي للحوالات</h2>

            {paymentLogs.length === 0 ? (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
                لا توجد سجلات تدقيق مالي حتى الآن.
              </div>
            ) : (
              <div className="space-y-2">
                {paymentLogs.map(log => (
                  <div key={log.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">حوالة مدققة</div>
                      <div className="text-slate-400 text-[11px]">
                        {new Date(log.created_at).toLocaleString('ar-YE')}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      معتمدة مالياً
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
