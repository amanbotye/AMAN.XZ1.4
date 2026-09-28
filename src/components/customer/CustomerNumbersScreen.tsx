/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Smartphone,
  Plus,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  X,
  FileText,
  Search,
  Check
} from 'lucide-react';
import { CustomerNumberItem, ProtectionItem, ProtectionRequestItem } from '../../types/aman';

interface CustomerNumbersScreenProps {
  supabase: SupabaseClient;
  numbers: CustomerNumberItem[];
  protections: ProtectionItem[];
  requests: ProtectionRequestItem[];
  onRefresh: () => void;
  onRequestProtectionForNumber: (numberItem: CustomerNumberItem) => void;
  isAddModalOpenInitially?: boolean;
}

const PROVIDER_METADATA: Record<string, { name: string; code: string; bg: string; text: string; badgeBg: string }> = {
  '77': { name: 'يمن موبايل', code: 'YM', bg: 'bg-rose-500/10', text: 'text-rose-400', badgeBg: 'bg-rose-500/20' },
  '78': { name: 'يمن موبايل', code: 'YM', bg: 'bg-rose-500/10', text: 'text-rose-400', badgeBg: 'bg-rose-500/20' },
  '73': { name: 'يو للاتصالات', code: 'YOU', bg: 'bg-amber-500/10', text: 'text-amber-400', badgeBg: 'bg-amber-500/20' },
  '71': { name: 'سبأفون', code: 'SABAFON', bg: 'bg-blue-500/10', text: 'text-blue-400', badgeBg: 'bg-blue-500/20' },
  '70': { name: 'واي', code: 'Y', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badgeBg: 'bg-emerald-500/20' }
};

export const CustomerNumbersScreen: React.FC<CustomerNumbersScreenProps> = ({
  supabase,
  numbers,
  protections,
  requests,
  onRefresh,
  onRequestProtectionForNumber,
  isAddModalOpenInitially = false
}) => {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(isAddModalOpenInitially);
  const [addPhone, setAddPhone] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Selected number details dialog
  const [selectedNumber, setSelectedNumber] = useState<CustomerNumberItem | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [updatingNotes, setUpdatingNotes] = useState(false);
  const [notesFeedback, setNotesFeedback] = useState<string | null>(null);

  // Auto detect provider from prefix
  const cleanPhone = addPhone.replace(/\D/g, '');
  const prefix = cleanPhone.length >= 2 ? cleanPhone.substring(0, 2) : '';
  const detectedProvider = PROVIDER_METADATA[prefix] || null;

  // Filter numbers
  const filteredNumbers = numbers.filter((n) =>
    n.phone_number.includes(search) || (n.notes && n.notes.includes(search))
  );

  // Add Number submission via rpc_add_customer_number
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addLoading) return;

    setAddError(null);
    setAddSuccess(null);

    const raw = addPhone.trim().replace(/\D/g, '');
    if (raw.length !== 9) {
      setAddError('يجب أن يتكون رقم الهاتف من 9 أرقام');
      return;
    }

    if (!detectedProvider) {
      setAddError('بادئة الرقم غير معتمدة (يجب أن يبدأ بـ 77، 78، 73، 71، أو 70)');
      return;
    }

    setAddLoading(true);

    try {
      const { data, error } = await supabase.rpc('rpc_add_customer_number', {
        p_phone_number: raw
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('duplicate') || msg.includes('already exists') || msg.includes('unique')) {
          setAddError('هذا الرقم مسجل مسبقاً في حسابك.');
        } else {
          setAddError(error.message || 'فشلت إضافة الرقم');
        }
        return;
      }

      setAddSuccess('تمت إضافة الرقم بنجاح مع كشف المشغل تلقائياً.');
      setAddPhone('');
      onRefresh();
      setTimeout(() => {
        setIsAddOpen(false);
        setAddSuccess(null);
      }, 1200);
    } catch {
      setAddError('حدث خطأ أثناء حفظ الرقم في النظام.');
    } finally {
      setAddLoading(false);
    }
  };

  // Update notes via rpc_update_customer_number_notes
  const handleSaveNotes = async () => {
    if (!selectedNumber || updatingNotes) return;
    setUpdatingNotes(true);
    setNotesFeedback(null);

    try {
      const { error } = await supabase.rpc('rpc_update_customer_number_notes', {
        p_customer_number_id: selectedNumber.id,
        p_notes: notesInput.trim()
      });

      if (error) {
        setNotesFeedback('تعذر حفظ الملاحظات: ' + error.message);
      } else {
        setNotesFeedback('تم تحديث الملاحظات بنجاح');
        onRefresh();
      }
    } catch {
      setNotesFeedback('حدث خطأ أثناء حفظ الملاحظات.');
    } finally {
      setUpdatingNotes(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">أرقامي المسجلة</h2>
            <p className="text-xs text-slate-400">إدارة الأرقام وتتبع حمايتها واكتشاف المشغل</p>
          </div>
          <button
            onClick={() => {
              setIsAddOpen(true);
              setAddError(null);
              setAddSuccess(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة رقم</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الهاتف أو الملاحظات..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Numbers List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredNumbers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <Smartphone className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">لا توجد أرقام مسجلة مطابقة للبحث</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>أضف رقمك الأول الآن</span>
            </button>
          </div>
        ) : (
          filteredNumbers.map((num) => {
            const opPrefix = num.phone_number.substring(0, 2);
            const op = PROVIDER_METADATA[opPrefix] || {
              name: 'مشغل اتصالات',
              code: 'GSM',
              bg: 'bg-slate-800',
              text: 'text-slate-400',
              badgeBg: 'bg-slate-700'
            };

            // Check active protection
            const activeProt = protections.find(
              (p) => p.customer_number_id === num.id && p.status === 'active'
            );

            // Check pending request
            const pendingReq = requests.find(
              (r) => r.customer_number_id === num.id && r.status === 'pending'
            );

            return (
              <div
                key={num.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${op.bg} flex items-center justify-center font-bold text-xs ${op.text}`}>
                      {op.code}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-wider" dir="ltr">
                        {num.phone_number}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${op.badgeBg} ${op.text}`}>
                          {op.name}
                        </span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400">
                          {num.notes || 'لا توجد ملاحظات'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {activeProt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" />
                        <span>محمي</span>
                      </span>
                    ) : pendingReq ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        <span>قيد المراجعة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium">
                        <span>غير محمي</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedNumber(num);
                      setNotesInput(num.notes || '');
                      setNotesFeedback(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    <span>تفاصيل وملاحظات</span>
                  </button>

                  {!activeProt && !pendingReq ? (
                    <button
                      onClick={() => onRequestProtectionForNumber(num)}
                      className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Shield className="w-3 h-3" />
                      <span>طلب حماية</span>
                    </button>
                  ) : activeProt ? (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      باقة {activeProt.package_name_snapshot}
                    </span>
                  ) : (
                    <span className="text-[10px] text-sky-400 font-medium">بانتظار المراجعة الإدارية</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Add Number with Automatic Provider Detection */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">إضافة رقم هاتف جديد</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                disabled={addLoading}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addSuccess && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{addSuccess}</span>
              </div>
            )}

            {addError && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4" noValidate>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  رقم الهاتف (9 أرقام)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={addPhone}
                    onChange={(e) => {
                      setAddPhone(e.target.value);
                      if (addError) setAddError(null);
                    }}
                    maxLength={9}
                    placeholder="77XXXXXXX"
                    dir="ltr"
                    disabled={addLoading}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white tracking-widest text-center focus:outline-none"
                  />
                </div>
              </div>

              {/* Automatic Telecom Provider Detection Box */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>المشغل المكتشف تلقائياً:</span>
                  <span className="text-[10px] text-slate-500">(اكتشاف فوري عبر البادئة)</span>
                </div>
                {detectedProvider ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${detectedProvider.badgeBg} ${detectedProvider.text}`}>
                        {detectedProvider.name} ({detectedProvider.code})
                      </span>
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span>بادئة صحيحة ({prefix})</span>
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    أدخل أول رقمين لاكتشاف مشغل الاتصالات تلقائياً (77, 78, 73, 71, 70)
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={addLoading || !detectedProvider || cleanPhone.length !== 9}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {addLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>تأكيد وإضافة الرقم</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={addLoading}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Number Details and Notes Editor */}
      {selectedNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">تفاصيل الرقم</h3>
              </div>
              <button
                onClick={() => setSelectedNumber(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-[11px] text-slate-500">رقم الهاتف</div>
                  <div className="text-sm font-bold text-white tracking-wider" dir="ltr">
                    {selectedNumber.phone_number}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  {selectedNumber.detected_prefix}
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  ملاحظات مخصصة (اسم المالك، الغرض):
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="مثال: رقم العمل الخاص، أو هاتف الشريحة الاحتياطية"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              {notesFeedback && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{notesFeedback}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={updatingNotes}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {updatingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>حفظ الملاحظات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNumber(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
