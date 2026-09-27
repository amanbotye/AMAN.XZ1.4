import React, { useState } from 'react';
import {
  Phone,
  Shield,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  Search,
  Bell,
  Check,
  CreditCard,
  FileText,
  RotateCcw
} from 'lucide-react';
import { amanStore } from '../services/amanStore.ts';
import { getErrorMessageAr } from '../services/errorTranslator.ts';
import { CustomerNumber, CompanyPackage, PaymentMethod } from '../types/aman.ts';

export function CustomerApp() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'numbers' | 'new_request' | 'protections' | 'notifications'>('home');
  const [refreshKey, setRefreshKey] = useState(0);

  // New Number Modal state
  const [showAddNumberModal, setShowAddNumberModal] = useState(false);
  const [inputPhone, setInputPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneAction, setPhoneAction] = useState<string | null>(null);
  const [isSubmittingNumber, setIsSubmittingNumber] = useState(false);

  // New Protection Request Wizard state
  const [selectedNumberId, setSelectedNumberId] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [transferRef, setTransferRef] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [requestError, setRequestError] = useState<{ message: string; action: string } | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Renewal Modal State
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [targetRenewalProtId, setTargetRenewalProtId] = useState<string>('');
  const [renewalPackageId, setRenewalPackageId] = useState<string>('');
  const [renewalPaymentMethodId, setRenewalPaymentMethodId] = useState<string>('');
  const [renewalTransferRef, setRenewalTransferRef] = useState<string>('');
  const [renewalError, setRenewalError] = useState<{ message: string; action: string } | null>(null);
  const [renewalSuccess, setRenewalSuccess] = useState(false);
  const [isSubmittingRenewal, setIsSubmittingRenewal] = useState(false);

  // Re-fetch store data on update
  const myNumbers = amanStore.customerNumbers.filter(
    n => n.customer_id === amanStore.currentUser.id && !n.is_deleted
  );
  const myProtections = amanStore.protections.filter(
    p => p.customer_id === amanStore.currentUser.id && !p.is_deleted
  );
  const myRequests = amanStore.requests.filter(
    r => r.customer_id === amanStore.currentUser.id
  );
  const myNotifications = amanStore.clientNotifications.filter(
    n => n.user_id === amanStore.currentUser.id
  );
  const unreadNotifsCount = myNotifications.filter(n => !n.is_read).length;

  // Real-time phone detection during input
  const normalizedInput = amanStore.normalizePhone(inputPhone);
  const detectedCompanyInfo = amanStore.detectCompanyFromPhone(normalizedInput);

  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setPhoneAction(null);
    setIsSubmittingNumber(true);

    const res = await amanStore.rpcAddCustomerNumber(inputPhone);
    setIsSubmittingNumber(false);

    if (res.success) {
      setInputPhone('');
      setShowAddNumberModal(false);
      setRefreshKey(prev => prev + 1);
    } else {
      const err = getErrorMessageAr(res.error_code, res.message);
      setPhoneError(err.message);
      setPhoneAction(err.action);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);
    setRequestSuccess(false);

    if (!selectedNumberId) {
      setRequestError({ message: 'يرجى اختيار رقم الهاتف أولاً.', action: 'اختر أحد أرقامك المعتمدة من القائمة.' });
      return;
    }
    if (!selectedPackageId) {
      setRequestError({ message: 'يرجى اختيار باقة الحماية.', action: 'حدد الباقة المناسبة لشركتك.' });
      return;
    }
    if (!selectedPaymentMethodId) {
      setRequestError({ message: 'يرجى تحديد وسيلة التحويل.', action: 'اختر البنك أو المحفظة التي قمت بالتحويل عبرها.' });
      return;
    }
    if (!transferRef.trim()) {
      setRequestError({ message: 'رقم مرجع الحوالة إلزامي.', action: 'يرجى كتابة رقم الحوالة أو رقم العملية المرجعي.' });
      return;
    }

    setIsSubmittingRequest(true);
    const res = await amanStore.rpcCreateProtectionRequest(
      selectedNumberId,
      selectedPackageId,
      selectedPaymentMethodId,
      transferRef,
      customerNote
    );
    setIsSubmittingRequest(false);

    if (res.success) {
      setRequestSuccess(true);
      setTransferRef('');
      setCustomerNote('');
      setRefreshKey(prev => prev + 1);
    } else {
      const err = getErrorMessageAr(res.error_code, res.message);
      setRequestError(err);
    }
  };

  const handleCreateRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    setRenewalError(null);
    setRenewalSuccess(false);

    if (!targetRenewalProtId) {
      setRenewalError({ message: 'معرف الحماية غير صالح.', action: 'يرجى اختيار الحماية المطلوب تجديدها مجدداً.' });
      return;
    }
    if (!renewalPackageId) {
      setRenewalError({ message: 'يرجى اختيار باقة التجديد.', action: 'حدد باقة التجديد المناسبة.' });
      return;
    }
    if (!renewalPaymentMethodId) {
      setRenewalError({ message: 'يرجى تحديد وسيلة التحويل.', action: 'اختر طريقة الدفع المناسبة.' });
      return;
    }
    if (!renewalTransferRef.trim()) {
      setRenewalError({ message: 'رقم مرجع الحوالة إلزامي.', action: 'يرجى كتابة رقم الحوالة أو رقم العملية المرجعي.' });
      return;
    }

    setIsSubmittingRenewal(true);
    const res = await amanStore.rpcCreateRenewalRequest(
      targetRenewalProtId,
      renewalPackageId,
      renewalPaymentMethodId,
      renewalTransferRef
    );
    setIsSubmittingRenewal(false);

    if (res.success) {
      setRenewalSuccess(true);
      setRenewalTransferRef('');
      setRefreshKey(prev => prev + 1);
    } else {
      const err = getErrorMessageAr(res.error_code, res.message);
      setRenewalError(err);
    }
  };

  // Helper for company display
  const getCompany = (companyId: string) => {
    return amanStore.companies.find(c => c.id === companyId);
  };

  const selectedNumberObj = myNumbers.find(n => n.id === selectedNumberId);
  const availablePackages = selectedNumberObj
    ? amanStore.packages.filter(p => p.company_id === selectedNumberObj.company_id && p.is_active && p.is_visible)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-cyan-500/20">
            {amanStore.currentUser.full_name?.slice(0, 1) || 'ع'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{amanStore.currentUser.full_name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                حساب عميل معتمد
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">{amanStore.currentUser.email}</div>
          </div>
        </div>

        {/* Quick Nav Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveScreen('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeScreen === 'home' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => setActiveScreen('numbers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeScreen === 'numbers' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            أرقامي ({myNumbers.length})
          </button>
          <button
            onClick={() => setActiveScreen('protections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeScreen === 'protections' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            الحمايات ({myProtections.length})
          </button>
          <button
            onClick={() => {
              setActiveScreen('new_request');
              setRequestSuccess(false);
              setRequestError(null);
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            طلب حماية جديد
          </button>
          <button
            onClick={() => setActiveScreen('notifications')}
            className={`p-2 rounded-lg text-xs relative transition-colors ${
              activeScreen === 'notifications' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-mono text-white flex items-center justify-center font-bold">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SCREEN 1: HOME DASHBOARD */}
      {activeScreen === 'home' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">الأرقام المسجلة</span>
              <div className="text-2xl font-bold font-mono text-white">{myNumbers.length}</div>
              <div className="text-[11px] text-cyan-400 mt-1">أرقام يمنية معتمدة</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">الحمايات السارية</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">{myProtections.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">حماية نشطة ومؤمنة</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">طلبات قيد المراجعة</span>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {myRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">بانتظار تدقيق الحوالة</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">الإشعارات الجديدة</span>
              <div className="text-2xl font-bold font-mono text-indigo-400">{unreadNotifsCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">تحديثات فورية</div>
            </div>
          </div>

          {/* Active Protections Banner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-emerald-400" />
                الحمايات النشطة حالياً
              </h3>
              <button
                onClick={() => setActiveScreen('protections')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                عرض كل الحمايات
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {myProtections.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs space-y-3">
                <p>لا توجد حمايات نشطة حالياً. يمكنك طلب حماية جديدة لرقمك لضمان عدم سحبه.</p>
                <button
                  onClick={() => setActiveScreen('new_request')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  بدء طلب حماية
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProtections.map(prot => {
                  const num = myNumbers.find(n => n.id === prot.customer_number_id);
                  const company = getCompany(prot.company_id);
                  const daysLeft = Math.max(
                    0,
                    Math.ceil((new Date(prot.end_at).getTime() - Date.now()) / 86400000)
                  );

                  return (
                    <div
                      key={prot.id}
                      className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-mono text-lg font-bold text-white tracking-wider" dir="ltr">
                            {num?.phone_number || 'الرقم'}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{company?.name_ar}</div>
                        </div>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          نشط وساري
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-900">
                        <div>
                          <span className="text-slate-500 block">الباقة:</span>
                          <span className="font-semibold text-slate-200">{prot.package_name_snapshot}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">المتبقي:</span>
                          <span className="font-mono font-bold text-cyan-300">{daysLeft} يوماً</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>ينتهي بتاريخ: {new Date(prot.end_at).toLocaleDateString('ar-YE')}</span>
                        <span className="text-[10px] text-emerald-400">تجديدات سابقة: {prot.renewal_count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Requests Section */}
          {myRequests.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm pb-2 border-b border-slate-800">
                <Clock className="w-4 h-4 text-amber-400" />
                سجل الطلبات الأخيرة
              </h3>
              <div className="space-y-2">
                {myRequests.map(req => {
                  const num = myNumbers.find(n => n.id === req.customer_number_id);
                  const company = getCompany(req.company_id);

                  return (
                    <div
                      key={req.id}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-100" dir="ltr">{num?.phone_number}</span>
                          <span className="text-slate-400">&bull; {company?.name_ar}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          مرجع الحوالة: <span className="font-mono text-cyan-300">{req.payment_transfer_reference}</span> &bull; القيمة: {req.requested_price} {req.requested_currency}
                        </div>
                      </div>

                      <div>
                        {req.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            قيد المراجعة والتدقيق
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            تم القبول والتفعيل
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20" title={req.rejection_reason || ''}>
                            مرفوض: {req.rejection_reason || 'انظر التفاصيل'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCREEN 2: MY NUMBERS */}
      {activeScreen === 'numbers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">قائمة أرقامي المعتمدة</h3>
              <p className="text-xs text-slate-400">إدارة أرقام الهواتف المرتبطة بحسابك والتحقق من صلاحيتها للشركات</p>
            </div>
            <button
              onClick={() => {
                setShowAddNumberModal(true);
                setPhoneError(null);
                setPhoneAction(null);
              }}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              إضافة رقم هاتف جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myNumbers.map(num => {
              const company = getCompany(num.company_id);
              const hasActiveProtection = myProtections.some(p => p.customer_number_id === num.id);

              return (
                <div key={num.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-lg font-bold text-white tracking-widest" dir="ltr">
                        {num.phone_number}
                      </div>
                      <div className="text-xs text-cyan-400 font-medium mt-0.5">{company?.name_ar}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      بادئة: {num.detected_prefix}
                    </span>
                  </div>

                  {num.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      {num.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {hasActiveProtection ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        حماية نشطة
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedNumberId(num.id);
                          setActiveScreen('new_request');
                        }}
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        طلب حماية للرقم
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[11px] text-slate-500">
                      {new Date(num.created_at).toLocaleDateString('ar-YE')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCREEN 3: NEW PROTECTION REQUEST WIZARD */}
      {activeScreen === 'new_request' && (
        <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                معالج تقديم طلب حماية جديد
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                وفق المواصفة: يتم اكتشاف الشركة آلياً والدفع عبر وسيلة التحويل المعتمدة
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('home')}
              className="text-xs text-slate-400 hover:text-white"
            >
              إلغاء
            </button>
          </div>

          {requestSuccess ? (
            <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">تم إرسال طلب الحماية بنجاح!</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                تم تسجيل طلبك وإرسال إشعار للإدارة للتحقق من الحوالة المالية. ستصلك رسالة إشعار فور مراجعة واعتماد الطلب.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setActiveScreen('home')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  العودة للرئيسية
                </button>
                <button
                  onClick={() => {
                    setRequestSuccess(false);
                    setSelectedNumberId('');
                    setSelectedPackageId('');
                    setSelectedPaymentMethodId('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                >
                  تقديم طلب آخر
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateRequest} className="space-y-5">
              {requestError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {requestError.message}
                  </div>
                  <div className="text-[11px] text-rose-400/90">{requestError.action}</div>
                </div>
              )}

              {/* Step 1: Select Number */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  1. اختر رقم الهاتف المراد حمايته:
                </label>
                {myNumbers.length === 0 ? (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                    <span>لم تقم بإضافة أي رقم هاتف بعد.</span>
                    <button
                      type="button"
                      onClick={() => setShowAddNumberModal(true)}
                      className="text-cyan-400 font-semibold hover:underline"
                    >
                      إضافة رقم الآن
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {myNumbers.map(n => {
                      const company = getCompany(n.company_id);
                      const isSelected = selectedNumberId === n.id;
                      const hasActiveProt = myProtections.some(p => p.customer_number_id === n.id);

                      return (
                        <button
                          type="button"
                          key={n.id}
                          disabled={hasActiveProt}
                          onClick={() => {
                            setSelectedNumberId(n.id);
                            setSelectedPackageId('');
                          }}
                          className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                            hasActiveProt
                              ? 'opacity-40 border-slate-800 bg-slate-950 cursor-not-allowed'
                              : isSelected
                              ? 'bg-cyan-950/50 border-cyan-500 text-white'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sm tracking-wider" dir="ltr">{n.phone_number}</span>
                            <span className="text-[10px] text-cyan-400">{company?.name_ar}</span>
                          </div>
                          {hasActiveProt && (
                            <span className="text-[10px] text-amber-400 mt-1">عليه حماية نشطة حالياً</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2: Select Package */}
              {selectedNumberId && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    2. اختر باقة الحماية المتاحة لشركة هذا الرقم ({selectedNumberObj?.company?.name_ar || getCompany(selectedNumberObj?.company_id || '')?.name_ar}):
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {availablePackages.map(pkg => (
                      <button
                        type="button"
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                          selectedPackageId === pkg.id
                            ? 'bg-emerald-950/40 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-100">{pkg.name_ar}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{pkg.description}</div>
                        </div>
                        <div className="text-left">
                          <div className="font-mono font-bold text-emerald-400 text-sm">
                            {pkg.price} {pkg.currency}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{pkg.duration_days} يوماً</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Select Payment Method & Instructions */}
              {selectedPackageId && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    3. اختر وسيلة الدفع / التحويل اليدوي:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {amanStore.paymentMethods.filter(m => m.is_active).map(pm => (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setSelectedPaymentMethodId(pm.id)}
                        className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                          selectedPaymentMethodId === pm.id
                            ? 'bg-indigo-950/40 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs">{pm.name_ar}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">{pm.account_identifier}</div>
                      </button>
                    ))}
                  </div>

                  {/* Payment instructions preview */}
                  {(() => {
                    const currentPm = amanStore.paymentMethods.find(m => m.id === selectedPaymentMethodId);
                    if (!currentPm) return null;

                    return (
                      <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-indigo-500/30 text-xs space-y-1.5">
                        <div className="text-indigo-300 font-semibold flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4" />
                          تعليمات التحويل ({currentPm.name_ar}):
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11px]">{currentPm.instructions}</p>
                        <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-emerald-300 flex items-center justify-between">
                          <span>{currentPm.account_name}</span>
                          <span className="font-bold">{currentPm.account_identifier}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Step 4: Transfer Reference & Notes */}
              {selectedPaymentMethodId && (
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      رقم مرجع الحوالة / رقم العملية (إلزامي للتدقيق المالي):
                    </label>
                    <input
                      type="text"
                      required
                      value={transferRef}
                      onChange={e => setTransferRef(e.target.value)}
                      placeholder="مثال: TRX-884920 أو رقم سند الإيداع بالكريمي"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      ملاحظة إضافية (اختياري):
                    </label>
                    <textarea
                      rows={2}
                      value={customerNote}
                      onChange={e => setCustomerNote(e.target.value)}
                      placeholder="أي تفاصيل تخص الحوالة أو اسم المودع..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingRequest}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingRequest ? 'جاري إرسال الطلب عبر RPC...' : 'تأكيد وإرسال طلب الحماية للتدقيق'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* SCREEN 4: PROTECTIONS LIST & RENEWALS */}
      {activeScreen === 'protections' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">سجل الحمايات السارية والتاريخية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProtections.map(prot => {
              const num = myNumbers.find(n => n.id === prot.customer_number_id);
              const company = getCompany(prot.company_id);
              const daysLeft = Math.max(
                0,
                Math.ceil((new Date(prot.end_at).getTime() - Date.now()) / 86400000)
              );

              return (
                <div key={prot.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-xl font-bold text-white tracking-widest" dir="ltr">
                        {num?.phone_number}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{company?.name_ar}</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                      حماية نشطة
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">تاريخ البدء:</span>
                      <span className="font-mono text-slate-300">{new Date(prot.start_at).toLocaleDateString('ar-YE')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">تاريخ الانتهاء:</span>
                      <span className="font-mono text-slate-300">{new Date(prot.end_at).toLocaleDateString('ar-YE')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الأيام المتبقية:</span>
                      <span className="font-mono font-bold text-cyan-400">{daysLeft} يوماً</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">عدد التجديدات:</span>
                      <span className="font-mono text-slate-300">{prot.renewal_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <div>
                      الباقة: <strong className="text-slate-200">{prot.package_name_snapshot}</strong> ({prot.price_snapshot} {prot.currency_snapshot})
                    </div>
                    <button
                      onClick={() => {
                        setTargetRenewalProtId(prot.id);
                        setRenewalPackageId(prot.package_id);
                        setShowRenewalModal(true);
                        setRenewalError(null);
                        setRenewalSuccess(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      طلب تجديد الحماية
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCREEN 5: NOTIFICATIONS */}
      {activeScreen === 'notifications' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            مركز إشعارات العميل
          </h3>

          <div className="space-y-2">
            {myNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">لا توجد إشعارات حالياً.</div>
            ) : (
              myNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    amanStore.rpcMarkNotificationRead(notif.id);
                    setRefreshKey(prev => prev + 1);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    notif.is_read
                      ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                      : 'bg-indigo-950/20 border-indigo-500/30 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-100">{notif.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(notif.created_at).toLocaleTimeString('ar-YE')}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{notif.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD NUMBER */}
      {showAddNumberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                إضافة رقم هاتف محمول جديد
              </h4>
              <button
                onClick={() => setShowAddNumberModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                إغلاق
              </button>
            </div>

            {phoneError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-0.5">
                <div className="font-bold">{phoneError}</div>
                <div className="text-[11px] text-rose-400/90">{phoneAction}</div>
              </div>
            )}

            <form onSubmit={handleAddNumber} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  أدخل رقم الهاتف:
                </label>
                <input
                  type="text"
                  required
                  value={inputPhone}
                  onChange={e => setInputPhone(e.target.value)}
                  placeholder="مثال: 771234567 أو 739876543"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                  dir="ltr"
                />
              </div>

              {/* Real-time detection badge */}
              {normalizedInput && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>الرقم المطبّع: <strong className="font-mono text-white">{normalizedInput}</strong></span>
                    <span>الطول: <strong className="font-mono text-cyan-300">{normalizedInput.length}</strong></span>
                  </div>
                  {detectedCompanyInfo ? (
                    <div className="text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                      <Check className="w-3.5 h-3.5" />
                      الشركة المكتشفة: {detectedCompanyInfo.company.name_ar} (بادئة: {detectedCompanyInfo.prefix})
                    </div>
                  ) : (
                    <div className="text-rose-400 text-[11px] mt-1">
                      لم يتم التعرف على شركة اتصالات مدعومة لهذه البادئة.
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNumberModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNumber || !detectedCompanyInfo}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
                >
                  {isSubmittingNumber ? 'جاري التحقق والإضافة...' : 'إضافة وتثبيت الرقم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RENEWAL REQUEST */}
      {showRenewalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                طلب تجديد الحماية
              </h4>
              <button
                onClick={() => setShowRenewalModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                إغلاق
              </button>
            </div>

            {renewalSuccess ? (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-center space-y-2 text-xs">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div className="font-bold text-white text-sm">تم إرسال طلب التجديد بنجاح!</div>
                <p className="text-slate-300">
                  تم إدراج طلب التجديد بانتظار تدقيق الحوالة من قبل الإدارة وتمديد صلاحية الحماية فوراً.
                </p>
                <button
                  onClick={() => setShowRenewalModal(false)}
                  className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  حسناً
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateRenewal} className="space-y-4">
                {renewalError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-0.5">
                    <div className="font-bold">{renewalError.message}</div>
                    <div className="text-[11px] text-rose-400/90">{renewalError.action}</div>
                  </div>
                )}

                {(() => {
                  const targetProt = amanStore.protections.find(p => p.id === targetRenewalProtId);
                  const targetNum = targetProt ? amanStore.customerNumbers.find(n => n.id === targetProt.customer_number_id) : null;
                  const targetCompany = targetProt ? getCompany(targetProt.company_id) : null;
                  const companyPkgs = targetProt ? amanStore.packages.filter(p => p.company_id === targetProt.company_id && p.is_active) : [];

                  return (
                    <>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 block text-[11px]">الرقم المراد تجديده:</span>
                          <span className="font-mono font-bold text-white text-sm" dir="ltr">{targetNum?.phone_number}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[11px]">الشركة:</span>
                          <span className="text-cyan-400 font-semibold">{targetCompany?.name_ar}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          اختر مدة / باقة التجديد:
                        </label>
                        <select
                          value={renewalPackageId}
                          onChange={e => setRenewalPackageId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          {companyPkgs.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name_ar} — {pkg.price} {pkg.currency} ({pkg.duration_days} يوماً)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          وسيلة الدفع / التحويل:
                        </label>
                        <select
                          value={renewalPaymentMethodId}
                          onChange={e => setRenewalPaymentMethodId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                          required
                        >
                          <option value="">-- اختر طريقة الدفع --</option>
                          {amanStore.paymentMethods.filter(m => m.is_active).map(pm => (
                            <option key={pm.id} value={pm.id}>
                              {pm.name_ar} ({pm.account_identifier})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          رقم مرجع الحوالة (إلزامي للتدقيق):
                        </label>
                        <input
                          type="text"
                          required
                          value={renewalTransferRef}
                          onChange={e => setRenewalTransferRef(e.target.value)}
                          placeholder="مثال: TRX-771199 أو رقم إشعار التحويل"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </>
                  );
                })()}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRenewalModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRenewal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                  >
                    {isSubmittingRenewal ? 'جاري إرسال التجديد...' : 'تأكيد طلب التجديد'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
