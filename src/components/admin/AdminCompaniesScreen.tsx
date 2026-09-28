/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Layers,
  Clock,
  Shield,
  Bell,
  Sliders,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  TelecomProvider,
  TelecomProviderPrefix,
  ProtectionPlan,
  CompanyTaskSettingItem
} from '../../types/aman';

interface TaskClassification {
  id: string;
  name: string;
  duration_days: number;
  is_deleted?: boolean;
}

interface SubscriptionClassification {
  id: string;
  name: string;
  days_threshold: number;
  client_visible: boolean;
  notify_enabled: boolean;
  is_deleted?: boolean;
}

interface AdminCompaniesScreenProps {
  supabase: SupabaseClient;
  providers: TelecomProvider[];
  prefixes: TelecomProviderPrefix[];
  plans: ProtectionPlan[];
  taskSettings: CompanyTaskSettingItem[];
  onRefresh: () => void;
}

export const AdminCompaniesScreen: React.FC<AdminCompaniesScreenProps> = ({
  supabase,
  providers,
  prefixes,
  plans,
  taskSettings,
  onRefresh
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(providers[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'basic' | 'packages' | 'tasks' | 'subscriptions'>('basic');

  // Edit / Add Company modal
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<TelecomProvider | null>(null);
  const [companyNameAr, setCompanyNameAr] = useState('');
  const [companyNameEn, setCompanyNameEn] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [companyPrefixes, setCompanyPrefixes] = useState('');
  const [companyNumLength, setCompanyNumLength] = useState(9);
  const [companyDisplayOrder, setCompanyDisplayOrder] = useState(1);
  const [companyIsActive, setCompanyIsActive] = useState(true);

  // Edit / Add Package modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProtectionPlan | null>(null);
  const [planNameAr, setPlanNameAr] = useState('');
  const [planPrice, setPlanPrice] = useState(1000);
  const [planDuration, setPlanDuration] = useState(30);
  const [planIsActive, setPlanIsActive] = useState(true);
  const [planIsVisible, setPlanIsVisible] = useState(true);

  // Task Settings State (Company specific)
  const [firstTaskEnabled, setFirstTaskEnabled] = useState(true);
  const [taskValue, setTaskValue] = useState(500);
  const [recurringTasksEnabled, setRecurringTasksEnabled] = useState(true);
  const [recurringInterval, setRecurringInterval] = useState(30);
  const [taskVisibilityDays, setTaskVisibilityDays] = useState(3);
  const [rescheduleAllowed, setRescheduleAllowed] = useState(true);
  const [tasksAfterExpiryAllowed, setTasksAfterExpiryAllowed] = useState(false);
  const [maxDaysAfterExpiry, setMaxDaysAfterExpiry] = useState(7);

  // Task display classifications
  const [taskClassifications, setTaskClassifications] = useState<TaskClassification[]>([
    { id: '1', name: 'مهام عاجلة', duration_days: 2 },
    { id: '2', name: 'مهام عادية', duration_days: 7 }
  ]);
  const [newClassifName, setNewClassifName] = useState('');
  const [newClassifDuration, setNewClassifDuration] = useState(3);

  // Subscription Settings State (Company specific)
  const [subscriptionNotificationsEnabled, setSubscriptionNotificationsEnabled] = useState(true);
  const [nearExpiryNotification, setNearExpiryNotification] = useState(true);
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(7);
  const [renewalRequestThreshold, setRenewalRequestThreshold] = useState(14);

  // Subscription classifications
  const [subClassifications, setSubClassifications] = useState<SubscriptionClassification[]>([
    { id: '1', name: 'قرب الانتهاء', days_threshold: 7, client_visible: true, notify_enabled: true },
    { id: '2', name: 'حرج جداً', days_threshold: 3, client_visible: true, notify_enabled: true }
  ]);
  const [newSubClassName, setNewSubClassName] = useState('');
  const [newSubClassDays, setNewSubClassDays] = useState(5);
  const [newSubClassVisible, setNewSubClassVisible] = useState(true);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedCompany = providers.find((p) => p.id === selectedCompanyId) || providers[0];
  const companyPrefixesList = prefixes.filter((px) => px.company_id === selectedCompany?.id);
  const companyPlans = plans.filter((pl) => pl.company_id === selectedCompany?.id);

  // Sync settings when company changes
  React.useEffect(() => {
    if (selectedCompany) {
      const ts = taskSettings.find((s) => s.company_id === selectedCompany.id);
      if (ts) {
        setFirstTaskEnabled(ts.enable_first_task ?? true);
        setTaskValue(ts.task_amount ?? 500);
        setRecurringTasksEnabled(ts.enable_recurring_tasks ?? true);
        setRecurringInterval(ts.task_interval_days ?? 30);
        setTaskVisibilityDays(ts.due_visibility_days ?? 3);
        setRescheduleAllowed(ts.allow_reschedule ?? true);
        setTasksAfterExpiryAllowed(ts.allow_after_expiry ?? false);
        setMaxDaysAfterExpiry(ts.max_days_after_expiry ?? 7);
      }
    }
  }, [selectedCompany, taskSettings]);

  // Open Add Company
  const handleOpenAddCompany = () => {
    setEditingCompany(null);
    setCompanyNameAr('');
    setCompanyNameEn('');
    setCompanyCode('');
    setCompanyPrefixes('');
    setCompanyNumLength(9);
    setCompanyDisplayOrder(providers.length + 1);
    setCompanyIsActive(true);
    setCompanyModalOpen(true);
  };

  // Open Edit Company
  const handleOpenEditCompany = (comp: TelecomProvider) => {
    setEditingCompany(comp);
    setCompanyNameAr(comp.name_ar);
    setCompanyNameEn(comp.name_en || '');
    setCompanyCode(comp.code);
    const existingPfxs = prefixes
      .filter((p) => p.company_id === comp.id)
      .map((p) => p.prefix)
      .join(', ');
    setCompanyPrefixes(existingPfxs);
    setCompanyNumLength(9);
    setCompanyDisplayOrder(comp.display_order || 1);
    setCompanyIsActive(comp.is_active);
    setCompanyModalOpen(true);
  };

  // Save Company (Add or Edit)
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyNameAr.trim() || !companyCode.trim() || saving) return;

    setSaving(true);
    try {
      if (editingCompany) {
        // Update
        const { error } = await supabase
          .from('companies')
          .update({
            name_ar: companyNameAr.trim(),
            name_en: companyNameEn.trim(),
            code: companyCode.trim().toUpperCase(),
            display_order: Number(companyDisplayOrder),
            is_active: companyIsActive
          })
          .eq('id', editingCompany.id);

        if (error) throw error;
      } else {
        // Insert
        const { data: newComp, error } = await supabase
          .from('companies')
          .insert({
            name_ar: companyNameAr.trim(),
            name_en: companyNameEn.trim(),
            code: companyCode.trim().toUpperCase(),
            display_order: Number(companyDisplayOrder),
            is_active: companyIsActive
          })
          .select()
          .single();

        if (error) throw error;

        // If prefixes provided, insert them
        const pfxArr = companyPrefixes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        if (newComp && pfxArr.length > 0) {
          for (const pfx of pfxArr) {
            await supabase.from('company_prefixes').insert({
              company_id: newComp.id,
              prefix: pfx,
              number_length: Number(companyNumLength),
              is_active: true
            });
          }
        }
      }

      setFeedback('تم حفظ بيانات الشركة بنجاح!');
      setCompanyModalOpen(false);
      onRefresh();
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      setFeedback(err?.message || 'حدث خطأ أثناء حفظ الشركة');
    } finally {
      setSaving(false);
    }
  };

  // Toggle company active status
  const handleToggleCompanyActive = async (comp: TelecomProvider) => {
    try {
      await supabase
        .from('companies')
        .update({ is_active: !comp.is_active })
        .eq('id', comp.id);
      onRefresh();
    } catch {
      // ignore
    }
  };

  // Open Add Package
  const handleOpenAddPackage = () => {
    setEditingPlan(null);
    setPlanNameAr('');
    setPlanPrice(1000);
    setPlanDuration(30);
    setPlanIsActive(true);
    setPlanIsVisible(true);
    setPlanModalOpen(true);
  };

  // Open Edit Package
  const handleOpenEditPackage = (plan: ProtectionPlan) => {
    setEditingPlan(plan);
    setPlanNameAr(plan.name_ar);
    setPlanPrice(plan.price);
    setPlanDuration(plan.duration_days);
    setPlanIsActive(plan.is_active);
    setPlanIsVisible(plan.is_visible ?? true);
    setPlanModalOpen(true);
  };

  // Save Package
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planNameAr.trim() || !selectedCompany || saving) return;

    setSaving(true);
    try {
      if (editingPlan) {
        const { error } = await supabase
          .from('protection_plans')
          .update({
            name_ar: planNameAr.trim(),
            price: Number(planPrice),
            duration_days: Number(planDuration),
            is_active: planIsActive,
            is_visible: planIsVisible
          })
          .eq('id', editingPlan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('protection_plans').insert({
          company_id: selectedCompany.id,
          name_ar: planNameAr.trim(),
          price: Number(planPrice),
          currency: 'YER',
          duration_days: Number(planDuration),
          is_active: planIsActive,
          is_visible: planIsVisible
        });
        if (error) throw error;
      }

      setFeedback('تم حفظ باقة الحماية بنجاح!');
      setPlanModalOpen(false);
      onRefresh();
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      setFeedback(err?.message || 'حدث خطأ أثناء حفظ الباقة');
    } finally {
      setSaving(false);
    }
  };

  // Save Task Settings
  const handleSaveTaskSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || saving) return;

    setSaving(true);
    try {
      // Authoritative rpc_update_task_interval
      await supabase.rpc('rpc_update_task_interval', {
        p_company_id: selectedCompany.id,
        p_new_interval: Number(recurringInterval)
      });

      // Update table
      await supabase.from('company_task_settings').upsert({
        company_id: selectedCompany.id,
        task_amount: Number(taskValue),
        task_currency: 'YER',
        task_interval_days: Number(recurringInterval),
        enable_first_task: firstTaskEnabled,
        enable_recurring_tasks: recurringTasksEnabled,
        due_visibility_days: Number(taskVisibilityDays),
        allow_reschedule: rescheduleAllowed,
        allow_after_expiry: tasksAfterExpiryAllowed,
        max_days_after_expiry: Number(maxDaysAfterExpiry),
        is_active: true
      });

      setFeedback('تم حفظ إعدادات المهام التشغيلية للشركة بنجاح!');
      onRefresh();
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      setFeedback(err?.message || 'حدث خطأ أثناء حفظ إعدادات المهام');
    } finally {
      setSaving(false);
    }
  };

  // Add Task Classification
  const handleAddTaskClassification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassifName.trim()) return;
    setTaskClassifications((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newClassifName.trim(),
        duration_days: Number(newClassifDuration)
      }
    ]);
    setNewClassifName('');
  };

  // Delete Task Classification (Logical)
  const handleDeleteTaskClassification = (id: string) => {
    setTaskClassifications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_deleted: true } : c))
    );
  };

  // Add Subscription Classification
  const handleAddSubClassification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubClassName.trim()) return;
    setSubClassifications((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newSubClassName.trim(),
        days_threshold: Number(newSubClassDays),
        client_visible: newSubClassVisible,
        notify_enabled: true
      }
    ]);
    setNewSubClassName('');
  };

  // Delete Sub Classification (Logical)
  const handleDeleteSubClassification = (id: string) => {
    setSubClassifications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_deleted: true } : c))
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none bg-slate-950" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>SCREEN 18 — إدارة الشركات والمنظومة (Companies)</span>
          </h2>
          <p className="text-xs text-slate-400">
            تكوين بيانات الشركات، الباقات، إعدادات المهام، وإعدادات الاشتراكات لكل مشغل
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddCompany}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة شركة</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Company Selector Tab Bar */}
      <div className="px-4 pt-3 flex items-center gap-2 overflow-x-auto border-b border-slate-800 bg-slate-900/40">
        <span className="text-[11px] font-bold text-slate-400 ml-1 shrink-0">المشغل الحالي:</span>
        {providers.map((comp) => (
          <button
            key={comp.id}
            onClick={() => setSelectedCompanyId(comp.id)}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedCompany?.id === comp.id
                ? 'bg-slate-900 text-sky-400 border-t-2 border-sky-400 border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{comp.name_ar}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
              {comp.code}
            </span>
          </button>
        ))}
      </div>

      {/* Sub-Tabs: 1.8.1 Basic Data, 1.8.2 Packages, 1.8.3 Task Settings, 1.8.4 Subscription Settings */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-800 bg-slate-900/20 text-xs">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'basic' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. البيانات الأساسية
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'packages' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. الباقات ({companyPlans.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'tasks' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. إعدادات المهام
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'subscriptions' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          4. إعدادات الاشتراك
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= SECTION 1: BASIC DATA ================= */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">البيانات الأساسية للمشغل (Basic Data)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => selectedCompany && handleOpenEditCompany(selectedCompany)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                    title="تعديل الشركة"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => selectedCompany && handleToggleCompanyActive(selectedCompany)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      selectedCompany?.is_active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {selectedCompany?.is_active ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>مفعلة</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>معطلة</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {selectedCompany && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">اسم الشركة (عربي):</span>
                    <span className="font-bold text-white">{selectedCompany.name_ar}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">اسم الشركة (إنجليزي):</span>
                    <span className="font-bold text-white">{selectedCompany.name_en || '—'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">رمز الشركة (Code):</span>
                    <span className="font-mono font-bold text-sky-400">{selectedCompany.code}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">طول أرقام المشغل:</span>
                    <span className="font-bold text-white">9 أرقام</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">ترتيب الظهور:</span>
                    <span className="font-bold text-white">{selectedCompany.display_order || 1}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">الحالة التشغيلية:</span>
                    <span className={selectedCompany.is_active ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {selectedCompany.is_active ? 'نشطة ومتاحة' : 'معطلة'}
                    </span>
                  </div>
                </div>
              )}

              {/* Prefixes list */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  البادئات المعتمدة للكشف التلقائي (Prefixes):
                </span>
                <div className="flex flex-wrap gap-2">
                  {companyPrefixesList.length === 0 ? (
                    <span className="text-xs text-slate-500">لا توجد بوادئ معينة</span>
                  ) : (
                    companyPrefixesList.map((px) => (
                      <span
                        key={px.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 text-xs font-mono font-bold"
                      >
                        {px.prefix}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 2: PACKAGES ================= */}
        {activeTab === 'packages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">قائمة باقات الحماية لمشغل {selectedCompany?.name_ar}</h3>
                <p className="text-[11px] text-slate-400">تحديد أسعار ومدد الباقات والظهور للعملاء</p>
              </div>
              <button
                onClick={handleOpenAddPackage}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة باقة</span>
              </button>
            </div>

            {companyPlans.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
                <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-white">لا توجد باقات مسجلة لهذا المشغل</p>
                <p className="text-[11px] text-slate-400 mt-1">اضغط إضافة باقة لإنشاء باقة حماية جديدة.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {companyPlans.map((pl) => (
                  <div
                    key={pl.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{pl.name_ar}</span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                            pl.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {pl.is_active ? 'مفعلة' : 'معطلة'}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                            pl.is_visible ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {pl.is_visible ? 'ظاهرة للعميل' : 'مخفية'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                        <span>السعر: <b className="text-emerald-400 font-mono">{pl.price} {pl.currency}</b></span>
                        <span>•</span>
                        <span>المدة: <b className="text-white font-mono">{pl.duration_days} يوم</b></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEditPackage(pl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                      title="تعديل الباقة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 3: TASK SETTINGS ================= */}
        {activeTab === 'tasks' && (
          <form onSubmit={handleSaveTaskSettings} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">إعدادات المهام التشغيلية (Task Settings)</span>
                </div>
                <span className="text-[11px] text-slate-400">{selectedCompany?.name_ar}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. First Task Enabled */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">تفعيل المهمة الأولى فور القبول</span>
                    <span className="text-[10px] text-slate-500">إنشاء مهمة سداد فورية عند بدء الحماية</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={firstTaskEnabled}
                    onChange={(e) => setFirstTaskEnabled(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 2. Recurring Tasks Enabled */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">تفعيل المهام الدورية التلقائية</span>
                    <span className="text-[10px] text-slate-500">جدولة مهام السداد الدورية حسب الفاصل الزمني</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={recurringTasksEnabled}
                    onChange={(e) => setRecurringTasksEnabled(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 3. Task Value */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <label className="font-bold text-white block">قيمة المهمة التشغيلية الواحدة (YER)</label>
                  <input
                    type="number"
                    value={taskValue}
                    onChange={(e) => setTaskValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* 4. Recurring Interval */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <label className="font-bold text-white block">الفاصل الزمني بين المهام (بالأيام)</label>
                  <input
                    type="number"
                    value={recurringInterval}
                    onChange={(e) => setRecurringInterval(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* 5. Due Visibility Days */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <label className="font-bold text-white block">ظهور المهام (أيام قبل الاستحقاق)</label>
                  <input
                    type="number"
                    value={taskVisibilityDays}
                    onChange={(e) => setTaskVisibilityDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* 6. Reschedule Allowed */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">إعادة الجدولة للمهام</span>
                    <span className="text-[10px] text-slate-500">السماح للمدير بتأجيل أو إعادة جدولة المهمة</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rescheduleAllowed}
                    onChange={(e) => setRescheduleAllowed(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 7. Tasks After Expiry Allowed */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">المهام بعد انتهاء الحماية</span>
                    <span className="text-[10px] text-slate-500">تنفيذ المهام حتى لو انتهت فترة الحماية</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={tasksAfterExpiryAllowed}
                    onChange={(e) => setTasksAfterExpiryAllowed(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 8. Max Days After Expiry */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <label className="font-bold text-white block">الحد الأقصى للأيام بعد الانتهاء</label>
                  <input
                    type="number"
                    value={maxDaysAfterExpiry}
                    disabled={!tasksAfterExpiryAllowed}
                    onChange={(e) => setMaxDaysAfterExpiry(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Task Display Classifications */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <span className="text-xs font-bold text-white block">تصنيفات عرض المهام (Task Classifications):</span>
                <div className="space-y-1.5">
                  {taskClassifications
                    .filter((c) => !c.is_deleted)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sky-400">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            (مدة البقاء: {c.duration_days} يوم)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTaskClassification(c.id)}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          title="حذف منطقي"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Add Classification Form */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="اسم التصنيف..."
                    value={newClassifName}
                    onChange={(e) => setNewClassifName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="المدة (أيام)"
                    value={newClassifDuration}
                    onChange={(e) => setNewClassifDuration(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddTaskClassification}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    إضافة تصنيف
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>حفظ إعدادات المهام التشغيلية</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= SECTION 4: SUBSCRIPTION SETTINGS ================= */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">إعدادات الاشتراك والتنبيهات (Subscription Settings)</span>
                </div>
                <span className="text-[11px] text-slate-400">{selectedCompany?.name_ar}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. Subscription Notifications Enabled */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">إشعارات الاشتراك</span>
                    <span className="text-[10px] text-slate-500">إرسال تنبيهات تلقائية حول حالة الاشتراك</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={subscriptionNotificationsEnabled}
                    onChange={(e) => setSubscriptionNotificationsEnabled(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 2. Near Expiry Notification */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">إشعار قرب انتهاء الاشتراك</span>
                    <span className="text-[10px] text-slate-500">تنبيه العميل بضرورة التجديد</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={nearExpiryNotification}
                    onChange={(e) => setNearExpiryNotification(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 3. Days Before Expiry */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <label className="font-bold text-white block">عدد الأيام قبل الانتهاء للإشعار</label>
                  <input
                    type="number"
                    value={daysBeforeExpiry}
                    onChange={(e) => setDaysBeforeExpiry(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                {/* 4. Renewal Request Visibility Threshold */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <label className="font-bold text-white block">الحد المحدد لظهور طلب التجديد (أيام متبقية)</label>
                  <input
                    type="number"
                    value={renewalRequestThreshold}
                    onChange={(e) => setRenewalRequestThreshold(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Subscription Classifications */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <span className="text-xs font-bold text-white block">تصنيفات الاشتراك (Subscription Classifications):</span>
                <div className="space-y-1.5">
                  {subClassifications
                    .filter((c) => !c.is_deleted)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            (الحد: {c.days_threshold} يوم متبقي)
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                            {c.client_visible ? 'ظاهر للعميل' : 'مخفي'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubClassification(c.id)}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          title="حذف منطقي"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Add Sub Classification */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="اسم التصنيف..."
                    value={newSubClassName}
                    onChange={(e) => setNewSubClassName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="الحد (أيام)"
                    value={newSubClassDays}
                    onChange={(e) => setNewSubClassDays(Number(e.target.value))}
                    className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                  />
                  <label className="flex items-center gap-1 text-[11px] text-slate-300 shrink-0">
                    <input
                      type="checkbox"
                      checked={newSubClassVisible}
                      onChange={(e) => setNewSubClassVisible(e.target.checked)}
                      className="accent-emerald-500"
                    />
                    <span>ظاهر للعميل</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSubClassification}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD / EDIT COMPANY ================= */}
      {companyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>{editingCompany ? 'تعديل بيانات الشركة' : 'إضافة شركة اتصالات جديدة'}</span>
              </h3>
              <button
                onClick={() => setCompanyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">اسم الشركة (بالعربية):</label>
                <input
                  type="text"
                  required
                  value={companyNameAr}
                  onChange={(e) => setCompanyNameAr(e.target.value)}
                  placeholder="مثال: يمن موبايل"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">اسم الشركة (بالإنجليزية):</label>
                <input
                  type="text"
                  value={companyNameEn}
                  onChange={(e) => setCompanyNameEn(e.target.value)}
                  placeholder="مثال: Yemen Mobile"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">رمز الشركة (Code):</label>
                  <input
                    type="text"
                    required
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    placeholder="مثال: YM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">طول الرقم:</label>
                  <input
                    type="number"
                    value={companyNumLength}
                    onChange={(e) => setCompanyNumLength(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  البادئات المعتمدة (مفصولة بفواصل):
                </label>
                <input
                  type="text"
                  value={companyPrefixes}
                  onChange={(e) => setCompanyPrefixes(e.target.value)}
                  placeholder="مثال: 77, 78"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-center pt-1">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">ترتيب الظهور:</label>
                  <input
                    type="number"
                    value={companyDisplayOrder}
                    onChange={(e) => setCompanyDisplayOrder(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    checked={companyIsActive}
                    onChange={(e) => setCompanyIsActive(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold text-white">تفعيل الشركة</span>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>حفظ الشركة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PACKAGE ================= */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{editingPlan ? 'تعديل باقة الحماية' : 'إضافة باقة حماية جديدة'}</span>
              </h3>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">اسم الباقة:</label>
                <input
                  type="text"
                  required
                  value={planNameAr}
                  onChange={(e) => setPlanNameAr(e.target.value)}
                  placeholder="مثال: حماية ذهبية - سنة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">سعر الباقة (YER):</label>
                  <input
                    type="number"
                    required
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">مدة الحماية (بالأيام):</label>
                  <input
                    type="number"
                    required
                    value={planDuration}
                    onChange={(e) => setPlanDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planIsActive}
                    onChange={(e) => setPlanIsActive(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span className="font-bold text-white">تفعيل الباقة</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planIsVisible}
                    onChange={(e) => setPlanIsVisible(e.target.checked)}
                    className="accent-sky-500 w-4 h-4"
                  />
                  <span className="font-bold text-white">ظاهرة للعملاء</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>حفظ الباقة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 font-bold rounded-xl cursor-pointer"
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
