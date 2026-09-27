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
  RotateCcw,
  Users,
  Building2,
  Settings,
  History,
  Plus,
  Edit2,
  Trash2,
  Sliders,
  DollarSign
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
  const [activeTab, setActiveTab] = useState<'requests' | 'renewals' | 'tasks' | 'payments' | 'customers' | 'companies' | 'methods' | 'audit' | 'settings'>('requests');
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
  const [customers, setCustomers] = useState<any[]>([]);
  const [allPackages, setAllPackages] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any[]>([]);

  // Search filter
  const [customerSearch, setCustomerSearch] = useState('');

  // Modals & form state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Partial<Company>>({ name_ar: '', name_en: '', code: '', description: '', display_order: 0, is_active: true });
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>({ name_ar: '', price: 1000, currency: 'YER', duration_days: 30, company_id: '', is_active: true, is_visible: true });
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<Partial<PaymentMethod>>({ name_ar: '', account_name: '', account_identifier: '', instructions: '', is_active: true });

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
        fetchedPaymentMethods,
        fetchedCustomers,
        fetchedPkgs,
        fetchedAudits,
        fetchedSysSettings
      ] = await Promise.all([
        liveAmanService.getProtectionRequests(),
        liveAmanService.getRenewals(),
        liveAmanService.getProtectionTasks(),
        liveAmanService.getPaymentLogs(),
        liveAmanService.getAllCompaniesAdmin(),
        liveAmanService.getCustomerNumbers(),
        liveAmanService.getAllPaymentMethodsAdmin(),
        liveAmanService.getCustomers(),
        liveAmanService.getAllPackagesAdmin(),
        liveAmanService.getAuditLogs(),
        liveAmanService.getSystemSettings()
      ]);

      setRequests(fetchedReqs);
      setRenewals(fetchedRenewals);
      setTasks(fetchedTasks);
      setPaymentLogs(fetchedLogs);
      setCompanies(fetchedCompanies);
      setNumbers(fetchedNumbers);
      setPaymentMethods(fetchedPaymentMethods);
      setCustomers(fetchedCustomers);
      setAllPackages(fetchedPkgs);
      setAuditLogs(fetchedAudits);
      setSystemSettings(fetchedSysSettings);
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
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'customers' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            العملاء ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'companies' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            الشركات والباقات ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('methods')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'methods' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            طرق الدفع ({paymentMethods.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'audit' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            سجل العمليات ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'settings' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            إعدادات النظام
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

        {/* TAB 5: CUSTOMERS (1.6.3 العملاء) */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">إدارة العملاء والمستخدمين</h2>
                <p className="text-xs text-slate-400">عرض تفاصيل العملاء وأرقامهم المسجلة وحالة الحسابات</p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث باسم العميل أو البريد..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customers
                .filter(c => {
                  if (!customerSearch) return true;
                  const s = customerSearch.toLowerCase();
                  return (c.email && c.email.toLowerCase().includes(s)) ||
                         (c.full_name && c.full_name.toLowerCase().includes(s));
                })
                .map(cust => {
                  const custNumbers = numbers.filter(n => n.customer_id === cust.id);
                  const custRequests = requests.filter(r => r.customer_id === cust.id);

                  return (
                    <div key={cust.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-sm">{cust.full_name || 'بدون اسم'}</div>
                          <div className="text-[11px] text-slate-400 font-mono" dir="ltr">{cust.email}</div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          cust.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {cust.status === 'active' ? 'حساب نشط' : cust.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <div>الأرقام المسجلة: <span className="font-bold font-mono text-white">{custNumbers.length}</span></div>
                        <div>طلبات الحماية: <span className="font-bold font-mono text-white">{custRequests.length}</span></div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={async () => {
                            const newStatus = cust.status === 'active' ? 'suspended' : 'active';
                            const ok = await liveAmanService.updateCustomerStatus(cust.id, newStatus);
                            if (ok) {
                              setActionSuccess(`تم تغيير حالة العميل إلى ${newStatus === 'active' ? 'نشط' : 'معلق'}`);
                              loadAdminData();
                            }
                          }}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                            cust.status === 'active'
                              ? 'bg-rose-950/30 border-rose-500/30 text-rose-400 hover:bg-rose-900/40'
                              : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40'
                          }`}
                        >
                          {cust.status === 'active' ? 'تجميد الحساب' : 'إلغاء التجميد والتفعيل'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 6: COMPANIES & PACKAGES (1.6.8 الشركات والباقات) */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">إدارة شركات الاتصالات وباقات الحماية</h2>
                <p className="text-xs text-slate-400">ضبط الشركات المشغلة والأسعار والمدد</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCompany({ name_ar: '', name_en: '', code: '', description: '', display_order: companies.length + 1, is_active: true });
                    setShowCompanyModal(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة شركة
                </button>
                <button
                  onClick={() => {
                    setEditingPackage({ name_ar: '', price: 1500, currency: 'YER', duration_days: 30, company_id: companies[0]?.id || '', is_active: true, is_visible: true });
                    setShowPackageModal(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة باقة
                </button>
              </div>
            </div>

            {/* Companies List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300">الشركات المشغلة المعتمدة:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {companies.map(comp => (
                  <div key={comp.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                        {comp.name_ar}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                        كود: {comp.code}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">{comp.description || 'لا يوجد وصف'}</div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setEditingCompany(comp);
                          setShowCompanyModal(true);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        تعديل
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Packages List */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300">باقات الحماية المتاحة للعملاء:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {allPackages.map(pkg => {
                  const comp = companies.find(c => c.id === pkg.company_id);
                  return (
                    <div key={pkg.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{pkg.name_ar}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {comp?.name_ar || 'عام'}
                        </span>
                      </div>

                      <div className="text-emerald-400 font-bold font-mono text-sm">
                        {pkg.price} {pkg.currency}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        المدة: {pkg.duration_days} يوماً
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setEditingPackage(pkg);
                            setShowPackageModal(true);
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          تعديل
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PAYMENT METHODS (1.6.9 طرق الدفع) */}
        {activeTab === 'methods' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">إدارة طرق وحسابات الدفع</h2>
                <p className="text-xs text-slate-400">حسابات الإيداع المالي والتحويل للمنظومة</p>
              </div>
              <button
                onClick={() => {
                  setEditingPaymentMethod({ name_ar: '', account_name: '', account_identifier: '', instructions: '', is_active: true });
                  setShowPaymentMethodModal(true);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة وسيلة دفع
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map(pm => (
                <div key={pm.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      {pm.name_ar}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      pm.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {pm.is_active ? 'مفعلة' : 'معطلة'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                    <div className="text-slate-400">اسم المستفيد / الحساب: <span className="text-white font-semibold">{pm.account_name}</span></div>
                    <div className="text-slate-400">رقم الحساب / المحفظة: <span className="text-emerald-400 font-mono font-bold">{pm.account_identifier}</span></div>
                  </div>

                  {pm.instructions && (
                    <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/50 p-2 rounded-lg">
                      {pm.instructions}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setEditingPaymentMethod(pm);
                        setShowPaymentMethodModal(true);
                      }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      تعديل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS (1.6.11 سجل العمليات) */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">سجل العمليات والرقابة (Audit Trail)</h2>
              <p className="text-xs text-slate-400">حركات النظام والاعتمادات الإدارية الموثقة</p>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
                لا توجد سجلات تدقيق حتى الآن.
              </div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-indigo-400" />
                        {log.action} &bull; <span className="text-slate-400 font-normal">{log.entity_type}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        معرف الكيان: {log.entity_id || 'عام'}
                      </div>
                    </div>
                    <div className="text-left font-mono text-[10px] text-slate-500">
                      {new Date(log.created_at).toLocaleString('ar-YE')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: SYSTEM SETTINGS (1.6.12 إعدادات النظام) */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">إعدادات النظام العامة</h2>
              <p className="text-xs text-slate-400">تكوين المتغيرات الأساسية وبيانات التواصل والشروط</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              {systemSettings.length === 0 ? (
                <div className="text-xs text-slate-400">لا توجد إعدادات مخصصة مسجلة حالياً.</div>
              ) : (
                systemSettings.map(set => (
                  <div key={set.id} className="pb-4 border-b border-slate-800/80 last:border-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-300">{set.setting_key}</span>
                      <span className="text-[11px] text-slate-500">{set.description}</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue={set.setting_value}
                        id={`input-${set.setting_key}`}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        onClick={async () => {
                          const input = document.getElementById(`input-${set.setting_key}`) as HTMLInputElement;
                          if (input) {
                            const ok = await liveAmanService.updateSystemSetting(set.setting_key, input.value.trim());
                            if (ok) {
                              setActionSuccess(`تم حفظ الإعداد ${set.setting_key} بنجاح.`);
                              loadAdminData();
                            }
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD/EDIT COMPANY */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-sm">
              {editingCompany.id ? 'تعديل بيانات الشركة' : 'إضافة شركة اتصالات جديدة'}
            </h4>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await liveAmanService.saveCompany(editingCompany);
                if (ok) {
                  setShowCompanyModal(false);
                  setActionSuccess('تم حفظ بيانات الشركة بنجاح.');
                  loadAdminData();
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-400 block mb-1">اسم الشركة (عربي):</label>
                <input
                  type="text"
                  required
                  value={editingCompany.name_ar || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, name_ar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">رمز الشركة (Code):</label>
                <input
                  type="text"
                  required
                  value={editingCompany.code || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, code: e.target.value })}
                  placeholder="مثال: yemen_mobile"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">الوصف:</label>
                <textarea
                  value={editingCompany.description || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT PACKAGE */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-sm">
              {editingPackage.id ? 'تعديل بيانات الباقة' : 'إضافة باقة حماية جديدة'}
            </h4>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await liveAmanService.savePackage(editingPackage);
                if (ok) {
                  setShowPackageModal(false);
                  setActionSuccess('تم حفظ بيانات الباقة بنجاح.');
                  loadAdminData();
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-400 block mb-1">الشركة التابعة:</label>
                <select
                  value={editingPackage.company_id || ''}
                  onChange={e => setEditingPackage({ ...editingPackage, company_id: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="">-- اختر الشركة --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">اسم الباقة:</label>
                <input
                  type="text"
                  required
                  value={editingPackage.name_ar || ''}
                  onChange={e => setEditingPackage({ ...editingPackage, name_ar: e.target.value })}
                  placeholder="مثال: الباقة الأساسية (30 يوماً)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">السعر (YER):</label>
                  <input
                    type="number"
                    required
                    value={editingPackage.price || 0}
                    onChange={e => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">المدة (أيام):</label>
                  <input
                    type="number"
                    required
                    value={editingPackage.duration_days || 30}
                    onChange={e => setEditingPackage({ ...editingPackage, duration_days: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT PAYMENT METHOD */}
      {showPaymentMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-sm">
              {editingPaymentMethod.id ? 'تعديل وسيلة الدفع' : 'إضافة وسيلة دفع جديدة'}
            </h4>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await liveAmanService.savePaymentMethod(editingPaymentMethod);
                if (ok) {
                  setShowPaymentMethodModal(false);
                  setActionSuccess('تم حفظ وسيلة الدفع بنجاح.');
                  loadAdminData();
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-400 block mb-1">اسم وسيلة الدفع:</label>
                <input
                  type="text"
                  required
                  value={editingPaymentMethod.name_ar || ''}
                  onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, name_ar: e.target.value })}
                  placeholder="مثال: بنك الكريمي المميز"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">اسم المستفيد / الحساب:</label>
                <input
                  type="text"
                  required
                  value={editingPaymentMethod.account_name || ''}
                  onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, account_name: e.target.value })}
                  placeholder="اسم الشخص أو المؤسسة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">رقم الحساب / الآيبان / المحفظة:</label>
                <input
                  type="text"
                  required
                  value={editingPaymentMethod.account_identifier || ''}
                  onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, account_identifier: e.target.value })}
                  placeholder="رقم الحساب للإيداع"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">تعليمات التحويل للعميل:</label>
                <textarea
                  value={editingPaymentMethod.instructions || ''}
                  onChange={e => setEditingPaymentMethod({ ...editingPaymentMethod, instructions: e.target.value })}
                  placeholder="يرجى كتابة رقم هاتفك في ملاحظة الحوالة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentMethodModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
