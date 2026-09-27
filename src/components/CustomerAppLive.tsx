import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Phone,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  LogOut,
  CreditCard,
  Check,
  Bell,
  RefreshCw,
  Send,
  Loader2,
  User as UserIcon,
  HelpCircle,
  KeyRound,
  FileCheck,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { liveAmanService } from '../services/liveAmanService';
import { getErrorMessageAr } from '../services/errorTranslator';
import {
  CustomerNumber,
  ProtectionRequest,
  Protection,
  Company,
  CompanyPackage,
  PaymentMethod,
  ClientNotification
} from '../types/aman';

interface CustomerAppLiveProps {
  onSignOut: () => void;
  userEmail: string;
}

export function CustomerAppLive({ onSignOut, userEmail }: CustomerAppLiveProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'numbers' | 'requests' | 'protections' | 'notifications' | 'profile' | 'more'>('home');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Real Database State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [myNumbers, setMyNumbers] = useState<CustomerNumber[]>([]);
  const [myRequests, setMyRequests] = useState<ProtectionRequest[]>([]);
  const [myProtections, setMyProtections] = useState<Protection[]>([]);
  const [myNotifications, setMyNotifications] = useState<ClientNotification[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [allPackages, setAllPackages] = useState<CompanyPackage[]>([]);

  // Add Number State
  const [showAddNumberModal, setShowAddNumberModal] = useState(false);
  const [inputPhone, setInputPhone] = useState('');
  const [detectedCompany, setDetectedCompany] = useState<{ company_id: string; prefix: string; number_length: number } | null>(null);
  const [isAddingNumber, setIsAddingNumber] = useState(false);
  const [addNumberError, setAddNumberError] = useState<{ message: string; action: string } | null>(null);

  // New Request State
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedNumberId, setSelectedNumberId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [transferRef, setTransferRef] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<{ message: string; action: string } | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Renewal Modal State
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [targetRenewalProt, setTargetRenewalProt] = useState<Protection | null>(null);
  const [renewalPackageId, setRenewalPackageId] = useState('');
  const [renewalPaymentMethodId, setRenewalPaymentMethodId] = useState('');
  const [renewalTransferRef, setRenewalTransferRef] = useState('');
  const [isSubmittingRenewal, setIsSubmittingRenewal] = useState(false);
  const [renewalError, setRenewalError] = useState<{ message: string; action: string } | null>(null);
  const [renewalSuccess, setRenewalSuccess] = useState(false);

  // Load Real Data
  const loadData = async () => {
    try {
      const [
        fetchedCompanies,
        fetchedNumbers,
        fetchedRequests,
        fetchedProtections,
        fetchedNotifications,
        fetchedPaymentMethods,
        fetchedPackages
      ] = await Promise.all([
        liveAmanService.getCompanies(),
        liveAmanService.getCustomerNumbers(),
        liveAmanService.getProtectionRequests(),
        liveAmanService.getProtections(),
        liveAmanService.getNotifications(),
        liveAmanService.getPaymentMethods(),
        liveAmanService.getPackages()
      ]);

      setCompanies(fetchedCompanies);
      setMyNumbers(fetchedNumbers);
      setMyRequests(fetchedRequests);
      setMyProtections(fetchedProtections);
      setMyNotifications(fetchedNotifications);
      setPaymentMethods(fetchedPaymentMethods);
      setAllPackages(fetchedPackages);

      const userProf = await liveAmanService.getCurrentUserProfile();
      if (userProf?.full_name) {
        setFullName(userProf.full_name);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Phone input company detection via live RPC
  useEffect(() => {
    const detect = async () => {
      if (inputPhone.trim().length >= 2) {
        const normalized = await liveAmanService.rpcNormalizePhone(inputPhone.trim());
        const detected = await liveAmanService.rpcDetectCompany(normalized);
        setDetectedCompany(detected);
      } else {
        setDetectedCompany(null);
      }
    };
    detect();
  }, [inputPhone]);

  // Handle Add Number
  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddNumberError(null);
    setIsAddingNumber(true);

    const res = await liveAmanService.rpcAddCustomerNumber(inputPhone.trim());
    setIsAddingNumber(false);

    if (res.success) {
      setInputPhone('');
      setDetectedCompany(null);
      setShowAddNumberModal(false);
      await loadData();
    } else {
      setAddNumberError(getErrorMessageAr(res.error_code, res.message));
    }
  };

  // Handle New Request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);
    setRequestSuccess(false);

    if (!selectedNumberId || !selectedPackageId || !selectedPaymentMethodId || !transferRef.trim()) {
      setRequestError({ message: 'يرجى استكمال جميع الحقول الإلزامية.', action: 'اختر الرقم والباقة وطريقة الدفع وأدخل رقم الحوالة.' });
      return;
    }

    setIsSubmittingRequest(true);
    const res = await liveAmanService.rpcCreateProtectionRequest(
      selectedNumberId,
      selectedPackageId,
      selectedPaymentMethodId,
      transferRef.trim(),
      customerNote.trim()
    );
    setIsSubmittingRequest(false);

    if (res.success) {
      setRequestSuccess(true);
      setTransferRef('');
      setCustomerNote('');
      await loadData();
    } else {
      setRequestError(getErrorMessageAr(res.error_code, res.message));
    }
  };

  // Handle Renewal Request
  const handleCreateRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    setRenewalError(null);
    setRenewalSuccess(false);

    if (!targetRenewalProt || !renewalPackageId || !renewalPaymentMethodId || !renewalTransferRef.trim()) {
      setRenewalError({ message: 'يرجى استكمال كافة الحقول.', action: 'اختر باقة التجديد وطريقة الدفع وأدخل رقم الحوالة.' });
      return;
    }

    setIsSubmittingRenewal(true);
    const res = await liveAmanService.rpcCreateRenewalRequest(
      targetRenewalProt.id,
      renewalPackageId,
      renewalPaymentMethodId,
      renewalTransferRef.trim()
    );
    setIsSubmittingRenewal(false);

    if (res.success) {
      setRenewalSuccess(true);
      setRenewalTransferRef('');
      await loadData();
    } else {
      setRenewalError(getErrorMessageAr(res.error_code, res.message));
    }
  };

  const getCompanyName = (companyId: string) => {
    const comp = companies.find(c => c.id === companyId);
    return comp ? comp.name_ar : 'غير محدد';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3 font-['Cairo',sans-serif]">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <div className="text-xs">جاري الاتصال بقاعدة البيانات واسترجاع بياناتك...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">منظومة أمان — AMAN</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  متصل حياً
                </span>
              </div>
              <div className="text-[11px] text-slate-400" dir="ltr">{userEmail}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                loadData();
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
        <div className="max-w-4xl mx-auto px-4 flex border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'home' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => setActiveTab('numbers')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'numbers' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            أرقامي ({myNumbers.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'requests' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            طلبات الحماية ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('protections')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'protections' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            الحمايات السارية ({myProtections.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'notifications' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            الإشعارات ({myNotifications.filter(n => !n.is_read).length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'profile' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            حسابي
          </button>
          <button
            onClick={() => setActiveTab('more')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'more' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            المزيد
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs">أرقامي المسجلة</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{myNumbers.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs">حمايات سارية</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {myProtections.filter(p => p.status === 'active').length}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs">طلبات معلقة</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                  {myRequests.filter(r => r.status === 'pending').length}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs">تنبيهات غير مقروءة</div>
                <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                  {myNotifications.filter(n => !n.is_read).length}
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-right">
                <h3 className="font-bold text-white text-base">احمِ رقم هاتفك الآن</h3>
                <p className="text-xs text-slate-400">
                  سجل رقم هاتفك المحمول وقدم طلب حماية معتمد عبر الشبكة لتفادي سحب أو إلغاء الخط.
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddNumberModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" />
                  إضافة رقم
                </button>
                <button
                  onClick={() => {
                    setRequestSuccess(false);
                    setRequestError(null);
                    setShowNewRequestModal(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  طلب حماية
                </button>
              </div>
            </div>

            {/* Active Protections Preview */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                الحمايات السارية حالياً
              </h3>

              {myProtections.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
                  <Phone className="w-8 h-8 mx-auto text-slate-600" />
                  <p>لا توجد لديك حمايات سارية حالياً.</p>
                  <button
                    onClick={() => setShowNewRequestModal(true)}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    تقديم طلب حماية لرقمك الآن &larr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {myProtections.map(prot => {
                    const num = myNumbers.find(n => n.id === prot.customer_number_id);
                    const compName = getCompanyName(prot.company_id);
                    const endDate = new Date(prot.end_at);
                    const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 3600 * 24));

                    return (
                      <div key={prot.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-lg text-white" dir="ltr">
                            {num?.phone_number || 'رقم غير معروف'}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {compName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <div>الباقة: <strong className="text-slate-200">{prot.package_name_snapshot}</strong></div>
                          <div className={`font-semibold ${daysLeft <= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            متبقي: {daysLeft} يوماً
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                          <button
                            onClick={() => {
                              setTargetRenewalProt(prot);
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
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY NUMBERS */}
        {activeTab === 'numbers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">قائمة أرقامي</h2>
                <p className="text-xs text-slate-400">الأرقام المسجلة في حسابك لحمايتها ومتابعة حالتها</p>
              </div>
              <button
                onClick={() => setShowAddNumberModal(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                إضافة رقم جديد
              </button>
            </div>

            {myNumbers.length === 0 ? (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
                <Phone className="w-10 h-10 mx-auto text-slate-600" />
                <div className="text-sm font-bold text-white">لم تقم بإضافة أي رقم بعد</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  قم بإضافة رقم هاتفك اليمني ليقوم النظام باكتشاف الشركة وتجهيزه للحماية.
                </p>
                <button
                  onClick={() => setShowAddNumberModal(true)}
                  className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  أضف رقمك الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myNumbers.map(num => {
                  const compName = getCompanyName(num.company_id);
                  const hasActiveProt = myProtections.some(p => p.customer_number_id === num.id && p.status === 'active');

                  return (
                    <div key={num.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-mono font-bold text-lg text-white tracking-wider" dir="ltr">
                          {num.phone_number}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {compName}
                          </span>
                          {hasActiveProt ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              محمي حالياً
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              غير محمي
                            </span>
                          )}
                        </div>
                      </div>

                      {!hasActiveProt && (
                        <button
                          onClick={() => {
                            setSelectedNumberId(num.id);
                            setRequestSuccess(false);
                            setRequestError(null);
                            setShowNewRequestModal(true);
                          }}
                          className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all"
                        >
                          طلب حماية
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROTECTION REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">سجل طلبات الحماية</h2>
                <p className="text-xs text-slate-400">متابعة حالة الطلبات المرسلة والتحقق المالي</p>
              </div>
              <button
                onClick={() => {
                  setRequestSuccess(false);
                  setRequestError(null);
                  setShowNewRequestModal(true);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                طلب جديد
              </button>
            </div>

            {myRequests.length === 0 ? (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
                لا توجد أي طلبات حماية مسجلة حتى الآن.
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map(req => {
                  const num = myNumbers.find(n => n.id === req.customer_number_id);
                  const compName = getCompanyName(req.company_id);

                  return (
                    <div key={req.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-white" dir="ltr">
                            {num?.phone_number || req.customer_number_id}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                            {compName}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            req.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : req.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {req.status === 'approved' && 'تم الاعتماد والتفعيل'}
                          {req.status === 'rejected' && 'تم الرفض'}
                          {req.status === 'pending' && 'قيد التدقيق والمراجعة'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div>الباقة: {req.requested_price} {req.requested_currency} ({req.requested_duration_days} يوماً)</div>
                        <div className="font-mono">مرجع الحوالة: {req.payment_transfer_reference}</div>
                      </div>

                      {req.rejection_reason && (
                        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/20 text-xs text-rose-300">
                          سبب الرفض: {req.rejection_reason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROTECTIONS */}
        {activeTab === 'protections' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">الحمايات السارية</h2>
              <p className="text-xs text-slate-400">الأرقام التي تتم حمايتها وتمديد صلاحيتها دورياً</p>
            </div>

            {myProtections.length === 0 ? (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
                لا توجد لديك أي حمايات نشطة حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myProtections.map(prot => {
                  const num = myNumbers.find(n => n.id === prot.customer_number_id);
                  const compName = getCompanyName(prot.company_id);
                  const endDate = new Date(prot.end_at);
                  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 3600 * 24));

                  return (
                    <div key={prot.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xl text-white tracking-wider" dir="ltr">
                          {num?.phone_number}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {compName}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex justify-between">
                          <span className="text-slate-400">تاريخ البدء:</span>
                          <span>{new Date(prot.start_at).toLocaleDateString('ar-YE')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">تاريخ الانتهاء:</span>
                          <span className="font-bold text-white">{endDate.toLocaleDateString('ar-YE')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">المدة المتبقية:</span>
                          <span className={`font-bold ${daysLeft <= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {daysLeft} يوماً
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">عدد التجديدات:</span>
                          <span>{prot.renewal_count}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setTargetRenewalProt(prot);
                          setRenewalPackageId(prot.package_id);
                          setShowRenewalModal(true);
                          setRenewalError(null);
                          setRenewalSuccess(false);
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                      >
                        <RotateCcw className="w-4 h-4" />
                        طلب تجديد الحماية
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">مركز الإشعارات</h2>
              <p className="text-xs text-slate-400">تنبيهات حالة الطلبات والحوالات وتجديد الحماية</p>
            </div>

            {myNotifications.length === 0 ? (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
                لا توجد إشعارات جديدة.
              </div>
            ) : (
              <div className="space-y-2">
                {myNotifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={async () => {
                      if (!notif.is_read) {
                        await liveAmanService.rpcMarkNotificationRead(notif.id);
                        loadData();
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      notif.is_read
                        ? 'bg-slate-900/60 border-slate-800/80'
                        : 'bg-slate-900 border-cyan-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-cyan-400" />
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(notif.created_at).toLocaleDateString('ar-YE')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{notif.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PROFILE (1.5.7 حسابي) */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">إعدادات الحساب والملف الشخصي</h2>
              <p className="text-xs text-slate-400">إدارة بيانات حسابك وتأمين كلمة المرور</p>
            </div>

            {profileMsg && (
              <div className={`p-4 rounded-2xl text-xs font-semibold ${
                profileMsg.error ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300' : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              }`}>
                {profileMsg.text}
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-lg">
                  {fullName ? fullName.charAt(0) : userEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{fullName || 'عميل منظومة أمان'}</div>
                  <div className="text-xs text-slate-400 font-mono" dir="ltr">{userEmail}</div>
                </div>
              </div>

              {/* Edit Name Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsUpdatingProfile(true);
                  setProfileMsg(null);
                  const ok = await liveAmanService.updateUserProfile(fullName.trim());
                  setIsUpdatingProfile(false);
                  if (ok) {
                    setProfileMsg({ text: 'تم تحديث الاسم بنجاح في قاعدة البيانات.' });
                  } else {
                    setProfileMsg({ text: 'تعذر تحديث الاسم، يرجى المحاولة لاحقاً.', error: true });
                  }
                }}
                className="space-y-4"
              >
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                  البيانات الشخصية
                </h4>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">الاسم الكامل:</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="أدخل اسمك الكريم"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'جاري الحفظ...' : 'حفظ تعديل الاسم'}
                </button>
              </form>

              <hr className="border-slate-800" />

              {/* Change Password Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newPassword.length < 6) {
                    setProfileMsg({ text: 'كلمة المرور يجب أن لا تقل عن 6 أحرف.', error: true });
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setProfileMsg({ text: 'كلمتا المرور غير متطابقتين.', error: true });
                    return;
                  }

                  setIsUpdatingProfile(true);
                  setProfileMsg(null);
                  const res = await liveAmanService.updateUserPassword(newPassword);
                  setIsUpdatingProfile(false);
                  if (res.success) {
                    setProfileMsg({ text: 'تم تغيير كلمة المرور بنجاح.' });
                    setNewPassword('');
                    setConfirmPassword('');
                  } else {
                    setProfileMsg({ text: res.error || 'تعذر تغيير كلمة المرور.', error: true });
                  }
                }}
                className="space-y-4"
              >
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  تغيير كلمة المرور
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">كلمة المرور الجديدة:</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">تأكيد كلمة المرور:</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  تحديث كلمة المرور
                </button>
              </form>

              <hr className="border-slate-800" />

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-400">تسجيل الخروج</div>
                  <div className="text-[11px] text-slate-500">إنهاء الجلسة الحالية والعودة لشاشة الدخول</div>
                </div>
                <button
                  onClick={onSignOut}
                  className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: MORE (1.5.8 المزيد) */}
        {activeTab === 'more' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">المزيد والمعلومات</h2>
              <p className="text-xs text-slate-400">دليل المنظومة، الشروط والأحكام، والدعم الفني</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">عن منظومة أمان (AMAN)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  منظومة تقنية متخصصة تضمن استمرارية وحماية أرقام الهواتف المحمولة في الجمهورية اليمنية (يمن موبايل، يو YOU، سبأفون، واي) ضد السحب والإلغاء وتدوير الخطوط بسبب عدم الاستخدام أو انتهاء الصلاحية.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">مركز المساعدة والدعم</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  لأي استفسارات أو متابعة الحوالات والطلبات، يمكنك التواصل مع فريق الدعم الفني المباشر عبر الأرقام ووسائل الدفع المعتمدة لدى المنظومة.
                </p>
              </div>
            </div>

            {/* Legal and Terms Accordion */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl divide-y divide-slate-800 overflow-hidden">
              <div className="p-5 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  الشروط والأحكام العامة
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  1. تسجيل الرقم لا يمنحه حماية إلا بعد سداد الرسوم واعتماد الإدارة للطلب.<br />
                  2. تبدأ مدة الحماية من تاريخ موافقة واعتماد المدير وليس من تاريخ السداد أو الإيداع.<br />
                  3. التجديد متاح قبل انتهاء الحماية بـ 10 أيام لضمان عدم انقطاع دورة المهام التشغيلية.
                </p>
              </div>

              <div className="p-5 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  سياسة الخصوصية وأمن البيانات
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  نحن نلتزم بحماية بياناتك وسجلات أرقامك. يتم تشفير كافة الاتصالات مع قاعدة البيانات عبر طبقات حماية Supabase RLS ولا يتم مشاركة أي بيانات اتصال مع أي طرف ثالث خارج إطار العمليات التشغيلية.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD NUMBER */}
      {showAddNumberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                إضافة رقم هاتف جديد
              </h4>
              <button onClick={() => setShowAddNumberModal(false)} className="text-slate-400 hover:text-white text-xs">
                إغلاق
              </button>
            </div>

            <form onSubmit={handleAddNumber} className="space-y-4">
              {addNumberError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-0.5">
                  <div className="font-bold">{addNumberError.message}</div>
                  <div className="text-[11px] text-rose-400/90">{addNumberError.action}</div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  رقم الهاتف المحمول (يمن موبايل / يو / سبأفون / واي)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={inputPhone}
                    onChange={e => setInputPhone(e.target.value)}
                    placeholder="مثال: 771234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {detectedCompany ? (
                <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-300">الشركة المكتشفة آلياً:</span>
                  <span className="font-bold text-cyan-300">{getCompanyName(detectedCompany.company_id)}</span>
                </div>
              ) : inputPhone.length >= 2 ? (
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                  البادئة غير مطابقة لشركات الاتصالات اليمنية المعتمدة.
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNumberModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isAddingNumber || !detectedCompany}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isAddingNumber ? 'جاري التحقق والإضافة...' : 'إضافة الرقم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW PROTECTION REQUEST */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                تقديم طلب حماية رقم
              </h4>
              <button onClick={() => setShowNewRequestModal(false)} className="text-slate-400 hover:text-white text-xs">
                إغلاق
              </button>
            </div>

            {requestSuccess ? (
              <div className="p-6 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-bold text-white text-sm">تم إرسال طلب الحماية بنجاح!</div>
                <p className="text-xs text-slate-300">
                  تم تسجيل طلبك ورقم الحوالة في قاعدة البيانات. سيتم تدقيق الحوالة وتفعيل الحماية تلقائياً.
                </p>
                <button
                  onClick={() => setShowNewRequestModal(false)}
                  className="mt-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  حسناً
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateRequest} className="space-y-4">
                {requestError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-0.5">
                    <div className="font-bold">{requestError.message}</div>
                    <div className="text-[11px] text-rose-400/90">{requestError.action}</div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">اختر الرقم المراد حمايته:</label>
                  <select
                    value={selectedNumberId}
                    onChange={e => setSelectedNumberId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- حدد الرقم من قائمتك --</option>
                    {myNumbers.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.phone_number} ({getCompanyName(n.company_id)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedNumberId && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">اختر باقة الحماية:</label>
                    <select
                      value={selectedPackageId}
                      onChange={e => setSelectedPackageId(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- اختر الباقة --</option>
                      {(() => {
                        const targetNum = myNumbers.find(n => n.id === selectedNumberId);
                        const pkgs = targetNum ? allPackages.filter(p => p.company_id === targetNum.company_id) : allPackages;
                        return pkgs.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name_ar} — {p.price} {p.currency} ({p.duration_days} يوماً)
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">طريقة الدفع والتحويل:</label>
                  <select
                    value={selectedPaymentMethodId}
                    onChange={e => setSelectedPaymentMethodId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- اختر وسيلة الدفع --</option>
                    {paymentMethods.map(pm => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name_ar} ({pm.account_identifier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">رقم مرجع الحوالة:</label>
                  <input
                    type="text"
                    required
                    value={transferRef}
                    onChange={e => setTransferRef(e.target.value)}
                    placeholder="رقم إشعار الحوالة أو رقم العملية"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewRequestModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRequest}
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {isSubmittingRequest ? 'جاري الإرسال...' : 'إرسال طلب الحماية'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: RENEWAL */}
      {showRenewalModal && targetRenewalProt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                تجديد حماية الرقم
              </h4>
              <button onClick={() => setShowRenewalModal(false)} className="text-slate-400 hover:text-white text-xs">
                إغلاق
              </button>
            </div>

            {renewalSuccess ? (
              <div className="p-6 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-bold text-white text-sm">تم إرسال طلب التجديد بنجاح!</div>
                <p className="text-xs text-slate-300">
                  سيتم مراجعة الحوالة وتمديد تاريخ صلاحية الحماية تلقائياً.
                </p>
                <button
                  onClick={() => setShowRenewalModal(false)}
                  className="mt-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
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

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">اختر باقة التجديد:</label>
                  <select
                    value={renewalPackageId}
                    onChange={e => setRenewalPackageId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {allPackages.filter(p => p.company_id === targetRenewalProt.company_id).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name_ar} — {p.price} {p.currency} ({p.duration_days} يوماً)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">طريقة الدفع:</label>
                  <select
                    value={renewalPaymentMethodId}
                    onChange={e => setRenewalPaymentMethodId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- اختر وسيلة التحويل --</option>
                    {paymentMethods.map(pm => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name_ar} ({pm.account_identifier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">رقم مرجع حوالة التجديد:</label>
                  <input
                    type="text"
                    required
                    value={renewalTransferRef}
                    onChange={e => setRenewalTransferRef(e.target.value)}
                    placeholder="رقم الحوالة أو إشعار الإيداع"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRenewalModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRenewal}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {isSubmittingRenewal ? 'جاري الإرسال...' : 'تأكيد طلب التجديد'}
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
