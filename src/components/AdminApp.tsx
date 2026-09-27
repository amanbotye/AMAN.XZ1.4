import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  Check,
  CreditCard,
  User,
  Sliders,
  RotateCcw,
  FileText,
  DollarSign
} from 'lucide-react';
import { amanStore } from '../services/amanStore.ts';
import { getErrorMessageAr } from '../services/errorTranslator.ts';
import { ProtectionRequest, ProtectionTask, ManualPaymentLog } from '../types/aman.ts';

export function AdminApp() {
  const [activeTab, setActiveTab] = useState<'requests' | 'payments' | 'tasks' | 'companies' | 'audit'>('requests');
  const [refreshKey, setRefreshKey] = useState(0);

  // Verification modal state
  const [selectedRequest, setSelectedRequest] = useState<ProtectionRequest | null>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionError, setActionError] = useState<{ message: string; action: string } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Operational task execution note
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [taskExecutionNote, setTaskExecutionNote] = useState('');

  const requests = amanStore.requests;
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const protections = amanStore.protections;
  const tasks = amanStore.tasks;
  const pendingTasks = tasks.filter(t => t.status === 'scheduled');
  const paymentLogs = amanStore.paymentLogs;
  const auditLogs = amanStore.auditLogs;

  const handleVerifyPayment = async (requestId: string, status: 'verified' | 'rejected') => {
    setActionError(null);
    setActionSuccess(null);
    setIsProcessing(true);

    const res = await amanStore.rpcVerifyManualPayment(requestId, undefined, status, verificationNote);
    setIsProcessing(false);

    if (res.success) {
      setActionSuccess(status === 'verified' ? 'تم تأكيد صحة الحوالة المالية بنجاح.' : 'تم تسجيل رفض الحوالة المالية.');
      setVerificationNote('');
      setRefreshKey(prev => prev + 1);
    } else {
      const err = getErrorMessageAr(res.error_code, res.message);
      setActionError(err);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    setActionError(null);
    setActionSuccess(null);
    setIsProcessing(true);

    const res = await amanStore.rpcApproveProtectionRequest(requestId);
    setIsProcessing(false);

    if (res.success) {
      setActionSuccess('تمت الموافقة على الطلب وتفعيل الحماية وجدولة المهام التشغيلية بنجاح!');
      setSelectedRequest(null);
      setRefreshKey(prev => prev + 1);
    } else {
      const err = getErrorMessageAr(res.error_code, res.message);
      setActionError(err);
    }
  };

  const handleRejectRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      setActionError({ message: 'سبب الرفض إلزامي.', action: 'يرجى كتابة سبب واضح يظهر للعميل.' });
      return;
    }

    setActionError(null);
    setIsProcessing(true);

    const res = await amanStore.rpcRejectProtectionRequest(selectedRequest.id, rejectionReason);
    setIsProcessing(false);

    if (res.success) {
      setActionSuccess('تم رفض الطلب بنجاح وإرسال إشعار فوري للعميل.');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      setRefreshKey(prev => prev + 1);
    } else {
      const err = getErrorMessageAr(res.error_code, res.message);
      setActionError(err);
    }
  };

  const handleExecuteTask = async (taskId: string) => {
    setIsProcessing(true);
    const res = await amanStore.rpcExecuteTask(taskId, taskExecutionNote || 'تم تنفيذ العملية التشغيلية');
    setIsProcessing(false);

    if (res.success) {
      setExecutingTaskId(null);
      setTaskExecutionNote('');
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-indigo-500/30 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-indigo-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">لوحة تحكم إدارة منظومة أمان</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                صلاحية مدير (ADMIN)
              </span>
            </div>
            <div className="text-xs text-slate-400">
              مراجعة الطلبات المعلقة &bull; التدقيق المالي للحوالات &bull; تنفيذ المهام التشغيلية
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            طلبات الحماية ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            المهام التشغيلية ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            سجل الحوالات ({paymentLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            سجل التدقيق ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {actionSuccess}
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 space-y-1">
          <div className="font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            {actionError.message}
          </div>
          <div className="text-[11px] text-rose-400/90 pr-6">{actionError.action}</div>
        </div>
      )}

      {/* TAB 1: REQUESTS & APPROVALS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              طلبات الحماية الواردة بانتظار التدقيق والاعتماد
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {pendingRequests.length} طلبات جديدة
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto" />
              <p>رائع! لا توجد طلبات معلقة بانتظار التدقيق حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map(req => {
                const customer = amanStore.users.find(u => u.id === req.customer_id);
                const number = amanStore.customerNumbers.find(n => n.id === req.customer_number_id);
                const company = amanStore.companies.find(c => c.id === req.company_id);
                const pkg = amanStore.packages.find(p => p.id === req.package_id);
                const pm = amanStore.paymentMethods.find(m => m.id === req.payment_method_id);
                const verifiedLog = paymentLogs.find(
                  l => l.request_id === req.id && l.verification_status === 'verified'
                );

                return (
                  <div
                    key={req.id}
                    className={`bg-slate-900/70 border rounded-2xl p-5 space-y-4 transition-all ${
                      verifiedLog ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xl font-extrabold text-white tracking-widest" dir="ltr">
                            {number?.phone_number}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {company?.name_ar}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>العميل: <strong className="text-slate-200">{customer?.full_name}</strong> ({customer?.email})</span>
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="text-sm font-bold font-mono text-emerald-400">
                          {req.requested_price} {req.requested_currency}
                        </div>
                        <div className="text-[11px] text-slate-400">مدة الحماية: {req.requested_duration_days} يوماً</div>
                      </div>
                    </div>

                    {/* Payment Verification Box */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-slate-300 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-400" />
                          <span>طريقة الدفع: <strong>{pm?.name_ar}</strong></span>
                        </div>
                        <div className="text-xs font-mono bg-slate-900 px-3 py-1 rounded text-cyan-300 border border-slate-800">
                          مرجع الحوالة: <strong>{req.payment_transfer_reference}</strong>
                        </div>
                      </div>

                      {req.customer_note && (
                        <div className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block mb-0.5">ملاحظة العميل:</span>
                          {req.customer_note}
                        </div>
                      )}

                      {/* Manual verification status badge */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-900">
                        <div className="text-xs flex items-center gap-2">
                          <span className="text-slate-400">حالة التدقيق المالي:</span>
                          {verifiedLog ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                              <Check className="w-3.5 h-3.5" />
                              تم تأكيد الحوالة المالية
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              بانتظار تأكيد الحوالة يدوياً
                            </span>
                          )}
                        </div>

                        {/* Verify actions */}
                        <div className="flex items-center gap-2">
                          {!verifiedLog ? (
                            <>
                              <button
                                onClick={() => handleVerifyPayment(req.id, 'verified')}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                تأكيد استلام الحوالة
                              </button>
                              <button
                                onClick={() => handleVerifyPayment(req.id, 'rejected')}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs transition-colors"
                              >
                                حوالة غير صحيحة
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              تم التدقيق بواسطة الإدارة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Final Decision Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setShowRejectModal(true);
                        }}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-slate-800 hover:bg-rose-950/40 text-rose-300 border border-slate-700 hover:border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
                      >
                        رفض الطلب
                      </button>

                      <button
                        onClick={() => handleApproveRequest(req.id)}
                        disabled={isProcessing || !verifiedLog}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                          verifiedLog
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                        title={!verifiedLog ? 'يجب تأكيد الحوالة المالية أولاً' : ''}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        الموافقة وتفعيل الحماية للرقم
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OPERATIONAL TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              مصفوفة المهام التشغيلية للحمايات النشطة
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              محصورة على واجهة المدير بنظام Defense-in-Depth
            </span>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">رقم الهاتف</th>
                  <th className="p-3">الشركة</th>
                  <th className="p-3">رقم المهمة</th>
                  <th className="p-3">المبلغ التشغيلي</th>
                  <th className="p-3">تاريخ الاستحقاق</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {tasks.map(t => {
                  const num = amanStore.customerNumbers.find(n => n.id === t.customer_number_id);
                  const company = amanStore.companies.find(c => c.id === t.company_id);

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-200" dir="ltr">{num?.phone_number}</td>
                      <td className="p-3 font-sans text-slate-300">{company?.name_ar}</td>
                      <td className="p-3 text-cyan-400">#{t.task_number}</td>
                      <td className="p-3 text-emerald-400 font-bold">{t.amount} {t.currency}</td>
                      <td className="p-3 text-slate-400">
                        {new Date(t.scheduled_at).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="p-3 font-sans">
                        {t.status === 'scheduled' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                            مجدولة
                          </span>
                        )}
                        {t.status === 'completed' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                            مكتملة
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-sans">
                        {t.status === 'scheduled' ? (
                          <button
                            onClick={() => handleExecuteTask(t.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold"
                          >
                            تنفيذ المهمة
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">تم التنفيذ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT LOGS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              سجل التدقيق المالي للحوالات (manual_payment_logs)
            </h3>
            <span className="text-xs text-slate-400">
              تسجيل تاريخي تراكمي مع مسؤول التدقيق والطوابع الزمنية
            </span>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">رقم المرجع (الحوالة)</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">وسيلة الدفع</th>
                  <th className="p-3">حالة التدقيق</th>
                  <th className="p-3">تاريخ السجل</th>
                  <th className="p-3">ملاحظة التدقيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {paymentLogs.map(log => {
                  const pm = amanStore.paymentMethods.find(m => m.id === log.payment_method_id);

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-cyan-300">{log.transfer_reference}</td>
                      <td className="p-3 font-bold text-emerald-400">{log.amount} YER</td>
                      <td className="p-3 font-sans text-slate-300">{pm?.name_ar}</td>
                      <td className="p-3 font-sans">
                        {log.verification_status === 'verified' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                            معتمدة
                          </span>
                        )}
                        {log.verification_status === 'pending' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold">
                            معلقة
                          </span>
                        )}
                        {log.verification_status === 'rejected' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-bold">
                            مرفوضة
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(log.created_at).toLocaleString('ar-YE')}
                      </td>
                      <td className="p-3 font-sans text-slate-400 text-[11px]">
                        {log.verification_note || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              سجل التدقيق الشامل للنظام (audit_logs)
            </h3>
            <span className="text-xs text-slate-400">
              حفظ غير قابل للتعديل لجميع العمليات الموثوقة الحساسة
            </span>
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-400">{log.action}</span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-300 font-mono">{log.entity_type}</span>
                  </div>
                  {log.new_data && (
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {JSON.stringify(log.new_data)}
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.created_at).toLocaleTimeString('ar-YE')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-sm">رفض طلب الحماية</h4>
            <p className="text-xs text-slate-400">
              يرجى كتابة سبب الرفض الصريح لإشعار العميل فوراً.
            </p>

            <form onSubmit={handleRejectRequest} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  سبب الرفض:
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="مثال: رقم الحوالة غير مطابق، أو المبلغ المحول ناقص..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                >
                  تأكيد الرفض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
