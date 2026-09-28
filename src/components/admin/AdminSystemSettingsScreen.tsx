/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Settings,
  Smartphone,
  Save,
  Check,
  Loader2,
  Sliders,
  FileText,
  Shield,
  Clock,
  Layers
} from 'lucide-react';
import { TelecomProvider, CompanyTaskSettingItem, SystemSettingItem } from '../../types/aman';

interface AdminSystemSettingsScreenProps {
  supabase: SupabaseClient;
  providers: TelecomProvider[];
  taskSettings: CompanyTaskSettingItem[];
  systemSettings: SystemSettingItem[];
  onRefresh: () => void;
}

export const AdminSystemSettingsScreen: React.FC<AdminSystemSettingsScreenProps> = ({
  supabase,
  providers,
  taskSettings,
  systemSettings,
  onRefresh
}) => {
  const [activeSection, setActiveSection] = useState<'providers' | 'general'>('providers');

  // Provider-specific task settings state
  const [selectedProviderId, setSelectedProviderId] = useState<string>(providers[0]?.id || '');
  const [intervalDays, setIntervalDays] = useState<number>(30);
  const [taskAmount, setTaskAmount] = useState<number>(500);
  const [savingTaskSetting, setSavingTaskSetting] = useState(false);
  const [taskSettingFeedback, setTaskSettingFeedback] = useState<string | null>(null);

  // Sync state when provider changes
  React.useEffect(() => {
    if (selectedProviderId) {
      const currentSetting = taskSettings.find((ts) => ts.company_id === selectedProviderId);
      if (currentSetting) {
        setIntervalDays(currentSetting.task_interval_days || 30);
        setTaskAmount(currentSetting.task_amount || 500);
      }
    }
  }, [selectedProviderId, taskSettings]);

  const handleSaveProviderTaskSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingTaskSetting) return;

    setSavingTaskSetting(true);
    setTaskSettingFeedback(null);

    try {
      // 1. Call rpc_update_task_interval if interval changed
      await supabase.rpc('rpc_update_task_interval', {
        p_company_id: selectedProviderId,
        p_new_interval: Number(intervalDays)
      });

      // 2. Also update company_task_settings amount
      await supabase
        .from('company_task_settings')
        .update({
          task_interval_days: Number(intervalDays),
          task_amount: Number(taskAmount)
        })
        .eq('company_id', selectedProviderId);

      setTaskSettingFeedback('تم حفظ إعدادات المشغل بنجاح.');
      onRefresh();
      setTimeout(() => setTaskSettingFeedback(null), 2000);
    } catch {
      setTaskSettingFeedback('حدث خطأ أثناء حفظ الإعدادات.');
    } finally {
      setSavingTaskSetting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">إعدادات النظام والمهام</h2>
            <p className="text-xs text-slate-400">تكوين فترات السداد لكل مشغل والإعدادات العامة</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSection('providers')}
            className={`flex-1 py-1 text-center text-xs rounded-lg transition-all cursor-pointer ${
              activeSection === 'providers'
                ? 'bg-slate-800 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            إعدادات مهام المشغلين
          </button>
          <button
            onClick={() => setActiveSection('general')}
            className={`flex-1 py-1 text-center text-xs rounded-lg transition-all cursor-pointer ${
              activeSection === 'general'
                ? 'bg-slate-800 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            إعدادات النظام العامة
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSection === 'providers' ? (
          /* Provider-Specific Task Settings */
          <div className="space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
              وفق ضوابط أمان، يتم ضبط إعدادات المهام والفاصل الدوري للسداد بشكل مستقل لكل مشغل اتصالات على حدة (Provider-specific Task Settings).
            </div>

            <form onSubmit={handleSaveProviderTaskSettings} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3.5" noValidate>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  اختر مشغل الاتصالات لتعديل إعداداته:
                </label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_ar} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  الفاصل الدوري لتنفيذ مهام السداد (بالأيام):
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(Number(e.target.value))}
                  disabled={savingTaskSetting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  عدد الأيام بين كل عملية سداد وتجديد خط أمان لدى المشغل
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  مبلغ تنفيذ المهمة الافتراضي (ريال يمني):
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={taskAmount}
                  onChange={(e) => setTaskAmount(Number(e.target.value))}
                  disabled={savingTaskSetting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {taskSettingFeedback && (
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{taskSettingFeedback}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={savingTaskSetting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingTaskSetting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري حفظ الإعدادات...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ إعدادات المشغل</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* General System Settings */
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-white mb-2">معلومات النظام المعتمدة</h4>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">اسم المنصة:</span>
                <span className="text-slate-200 font-bold">AMAN — أمان لحماية الأرقام</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">البيئة وقاعدة البيانات:</span>
                <span className="text-emerald-400 font-mono text-[11px]">Supabase Production PostgreSQL</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">نظام المصادقة:</span>
                <span className="text-slate-200">Supabase GoTrue (Email + Users RLS)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">تنبيه انتهاء الحماية:</span>
                <span className="text-slate-200">قبل 14 يوم من الموعد</span>
              </div>
            </div>

            {systemSettings.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center"
              >
                <div>
                  <span className="font-mono text-slate-300 font-bold block">{s.setting_key}</span>
                  <span className="text-[10px] text-slate-500">{s.description || 'إعداد عام'}</span>
                </div>
                <span className="text-xs bg-slate-950 px-2.5 py-1 rounded text-emerald-400 font-mono">
                  {s.setting_value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
