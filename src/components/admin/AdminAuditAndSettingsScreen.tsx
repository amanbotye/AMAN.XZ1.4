/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  FileText,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Layers,
  Settings,
  Phone,
  Mail,
  Shield,
  Save,
  CheckCircle,
  Loader2,
  Eye,
  X
} from 'lucide-react';
import { AuditLogItem, SystemSettingItem } from '../../types/aman';

interface AdminAuditAndSettingsScreenProps {
  supabase: SupabaseClient;
  logs: AuditLogItem[];
  systemSettings: SystemSettingItem[];
  onRefresh: () => void;
  initialSection?: 'audit' | 'settings';
}

export const AdminAuditAndSettingsScreen: React.FC<AdminAuditAndSettingsScreenProps> = ({
  supabase,
  logs,
  systemSettings,
  onRefresh,
  initialSection = 'audit'
}) => {
  const [activeSection, setActiveSection] = useState<'audit' | 'settings'>(initialSection);

  // ============ AUDIT LOG STATE ============
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const entities = Array.from(new Set(logs.map((l) => l.entity_type)));

  const filteredLogs = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      l.action.toLowerCase().includes(q) ||
      l.entity_type.toLowerCase().includes(q) ||
      (l.entity_id && l.entity_id.toLowerCase().includes(q)) ||
      (l.actor_name && l.actor_name.toLowerCase().includes(q));

    const matchesEntity = entityFilter === 'all' || l.entity_type === entityFilter;
    return matchesSearch && matchesEntity;
  });

  // ============ SYSTEM SETTINGS STATE ============
  const [settingsTab, setSettingsTab] = useState<'general' | 'contact' | 'terms' | 'privacy'>('general');

  // General Settings
  const [appName, setAppName] = useState(
    systemSettings.find((s) => s.setting_key === 'app_name')?.setting_value || 'AMAN — أمان'
  );
  const [defaultCurrency, setDefaultCurrency] = useState(
    systemSettings.find((s) => s.setting_key === 'default_currency')?.setting_value || 'YER'
  );

  // Contact Info
  const [supportPhone, setSupportPhone] = useState(
    systemSettings.find((s) => s.setting_key === 'support_phone')?.setting_value || '+967 777 000 000'
  );
  const [supportEmail, setSupportEmail] = useState(
    systemSettings.find((s) => s.setting_key === 'support_email')?.setting_value || 'support@aman-ye.com'
  );
  const [supportWhatsapp, setSupportWhatsapp] = useState(
    systemSettings.find((s) => s.setting_key === 'support_whatsapp')?.setting_value || '+967 777 000 000'
  );

  // Terms & Privacy
  const [termsContent, setTermsContent] = useState(
    systemSettings.find((s) => s.setting_key === 'terms_and_conditions')?.setting_value ||
      'شروط وأحكام استخدام منصة أمان لحماية أرقام الاتصالات اليمنية...'
  );
  const [privacyContent, setPrivacyContent] = useState(
    systemSettings.find((s) => s.setting_key === 'privacy_policy')?.setting_value ||
      'سياسة الخصوصية وحماية بيانات المشتركين وأرقامهم في منصة أمان...'
  );

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingSettings) return;

    setSavingSettings(true);
    setSettingsFeedback(null);

    const itemsToUpsert = [
      { setting_key: 'app_name', setting_value: appName, is_active: true },
      { setting_key: 'default_currency', setting_value: defaultCurrency, is_active: true },
      { setting_key: 'support_phone', setting_value: supportPhone, is_active: true },
      { setting_key: 'support_email', setting_value: supportEmail, is_active: true },
      { setting_key: 'support_whatsapp', setting_value: supportWhatsapp, is_active: true },
      { setting_key: 'terms_and_conditions', setting_value: termsContent, is_active: true },
      { setting_key: 'privacy_policy', setting_value: privacyContent, is_active: true }
    ];

    try {
      for (const item of itemsToUpsert) {
        await supabase
          .from('system_settings')
          .upsert(item, { onConflict: 'setting_key' });
      }

      setSettingsFeedback('تم حفظ إعدادات النظام بنجاح!');
      onRefresh();
      setTimeout(() => setSettingsFeedback(null), 2500);
    } catch {
      setSettingsFeedback('فشل حفظ بعض إعدادات النظام، يرجى المحاولة لاحقاً');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none bg-slate-950" dir="rtl">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>SCREEN 21 — سجل العمليات وإعدادات النظام (Audit Log & System Settings)</span>
          </h2>
          <p className="text-xs text-slate-400">
            الوحدة الإدارية الختامية: تدقيق العمليات الأمنية وتكوين الإعدادات العامة للمنظومة
          </p>
        </div>
      </div>

      {/* Main Switcher: Two Clearly Separated Sections */}
      <div className="p-3 bg-slate-900/40 border-b border-slate-800 flex items-center gap-2">
        <button
          onClick={() => setActiveSection('audit')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'audit'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>القسم 1: سجل التدقيق والعمليات (Audit Log)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
            {logs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('settings')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'settings'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>القسم 2: إعدادات النظام (System Settings)</span>
        </button>
      </div>

      {/* ================= SECTION 1: AUDIT LOG ================= */}
      {activeSection === 'audit' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Audit Search & Filters */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/30 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث في العمليات، الكيانات، المنفّذ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2 pointer-events-none" />
            </div>

            {entities.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setEntityFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    entityFilter === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  الكل
                </button>
                {entities.map((ent) => (
                  <button
                    key={ent}
                    onClick={() => setEntityFilter(ent)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                      entityFilter === ent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {ent}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audit List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-white">لا توجد عمليات مسجلة تطابق البحث</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const date = new Date(log.created_at).toLocaleString('ar-YE', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {log.action}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-sky-400 font-mono">
                            {log.entity_type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{date}</span>
                          </span>
                          {log.actor_name && (
                            <>
                              <span>•</span>
                              <span>بواسطة: {log.actor_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      className="text-slate-400 group-hover:text-white p-1 rounded-lg"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: SYSTEM SETTINGS ================= */}
      {activeSection === 'settings' && (
        <form onSubmit={handleSaveSettings} className="flex-1 flex flex-col overflow-hidden">
          {/* Settings Sub-Tabs: General, Contact, Terms, Privacy */}
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/30 flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSettingsTab('general')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                settingsTab === 'general'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الإعدادات العامة
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('contact')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                settingsTab === 'contact'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              بيانات التواصل
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('terms')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                settingsTab === 'terms'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الشروط والأحكام
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('privacy')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                settingsTab === 'privacy'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              سياسة الخصوصية
            </button>
          </div>

          {/* Feedback */}
          {settingsFeedback && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{settingsFeedback}</span>
            </div>
          )}

          {/* Settings Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* General Settings */}
            {settingsTab === 'general' && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-white block border-b border-slate-800 pb-2">
                  الإعدادات العامة للنظام (General Settings)
                </span>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">اسم النظام / المنصة:</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">العملة الافتراضية للمعاملات:</label>
                  <input
                    type="text"
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Contact Information */}
            {settingsTab === 'contact' && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-white block border-b border-slate-800 pb-2">
                  بيانات التواصل وخدمة المشتركين (Contact Information)
                </span>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">رقم هاتف الدعم الفني:</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">البريد الإلكتروني الرسمي:</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">رقم واتساب المعتمد:</label>
                  <input
                    type="text"
                    value={supportWhatsapp}
                    onChange={(e) => setSupportWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            {settingsTab === 'terms' && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-white block border-b border-slate-800 pb-2">
                  الشروط والأحكام (Terms & Conditions)
                </span>
                <div>
                  <label className="text-slate-400 block mb-1">نص الشروط والأحكام المعروض للمستخدمين:</label>
                  <textarea
                    rows={8}
                    value={termsContent}
                    onChange={(e) => setTermsContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Privacy Policy */}
            {settingsTab === 'privacy' && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-white block border-b border-slate-800 pb-2">
                  سياسة الخصوصية (Privacy Policy)
                </span>
                <div>
                  <label className="text-slate-400 block mb-1">نص سياسة الخصوصية المعروض للمستخدمين:</label>
                  <textarea
                    rows={8}
                    value={privacyContent}
                    onChange={(e) => setPrivacyContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Save Button */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/60">
            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ الإعدادات...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ إعدادات النظام</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Operation Details Modal (Audit Log) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">تفاصيل العملية الأمنية (Operation Details)</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">الإجراء:</span>
                  <span className="font-bold text-emerald-400">{selectedLog.action}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">الكيان المتأثر:</span>
                  <span className="font-bold text-sky-400">{selectedLog.entity_type}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">معرّف السجل:</span>
                  <span className="font-mono text-slate-300 text-[11px] truncate block">
                    {selectedLog.entity_id || '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">التاريخ والوقت:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {new Date(selectedLog.created_at).toLocaleString('ar-YE')}
                  </span>
                </div>
              </div>

              {selectedLog.old_data && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">البيانات السابقة:</span>
                  <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto" dir="ltr">
                    {JSON.stringify(selectedLog.old_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_data && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold block">البيانات الجديدة:</span>
                  <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto" dir="ltr">
                    {JSON.stringify(selectedLog.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
