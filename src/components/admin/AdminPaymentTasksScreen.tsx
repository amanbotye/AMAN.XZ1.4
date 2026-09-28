/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  User,
  Calendar,
  Loader2,
  X,
  Check,
  Search,
  ExternalLink
} from 'lucide-react';
import { PaymentTaskItem, UserProfile } from '../../types/aman';

interface AdminPaymentTasksScreenProps {
  supabase: SupabaseClient;
  tasks: PaymentTaskItem[];
  customers: UserProfile[];
  onRefresh: () => void;
}

export const AdminPaymentTasksScreen: React.FC<AdminPaymentTasksScreenProps> = ({
  supabase,
  tasks,
  customers,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming' | 'completed'>('all');
  const [search, setSearch] = useState('');

  // Complete Task Dialog
  const [executingTask, setExecutingTask] = useState<PaymentTaskItem | null>(null);
  const [executionNote, setExecutionNote] = useState('');
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeFeedback, setExecuteFeedback] = useState<string | null>(null);

  // Reschedule Task Dialog
  const [reschedulingTask, setReschedulingTask] = useState<PaymentTaskItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleFeedback, setRescheduleFeedback] = useState<string | null>(null);

  const nowMs = Date.now();

  const enrichedTasks = tasks.map((t) => {
    const dueMs = new Date(t.due_at).getTime();
    const diffHours = (dueMs - nowMs) / (1000 * 3600);
    const isCompleted = t.status === 'completed';
    const isCancelled = t.status === 'cancelled';
    const isOverdue = !isCompleted && !isCancelled && diffHours < 0;
    const isToday = !isCompleted && !isCancelled && diffHours >= 0 && diffHours <= 24;
    const isUpcoming = !isCompleted && !isCancelled && diffHours > 24;

    return {
      ...t,
      diffHours,
      isCompleted,
      isOverdue,
      isToday,
      isUpcoming
    };
  });

  const filtered = enrichedTasks.filter((t) => {
    const cust = customers.find((c) => c.id === t.customer_id);
    const custName = cust?.full_name?.toLowerCase() || '';
    const q = search.toLowerCase();

    const matchesSearch =
      (t.phone_number && t.phone_number.includes(q)) ||
      custName.includes(q) ||
      t.task_number.toString().includes(q);

    if (!matchesSearch) return false;

    if (filter === 'today') return t.isToday;
    if (filter === 'overdue') return t.isOverdue;
    if (filter === 'upcoming') return t.isUpcoming;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  // Execute / Complete task via rpc_execute_task
  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executingTask || executeLoading) return;

    setExecuteLoading(true);
    setExecuteFeedback(null);

    try {
      const { error } = await supabase.rpc('rpc_execute_task', {
        p_task_id: executingTask.id,
        p_execution_note: executionNote.trim() || null
      });

      if (error) {
        setExecuteFeedback('فشل إكمال المهمة: ' + error.message);
      } else {
        setExecuteFeedback('تم تنفيذ المهمة التشغيلية بنجاح.');
        onRefresh();
        setTimeout(() => {
          setExecutingTask(null);
          setExecutionNote('');
          setExecuteFeedback(null);
        }, 1200);
      }
    } catch {
      setExecuteFeedback('حدث خطأ أثناء معالجة التنفيذ.');
    } finally {
      setExecuteLoading(false);
    }
  };

  // Reschedule task via rpc_reschedule_task
  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingTask || rescheduleLoading) return;

    if (!rescheduleDate) {
      setRescheduleFeedback('يرجى تحديد الموعد الجديد');
      return;
    }

    setRescheduleLoading(true);
    setRescheduleFeedback(null);

    try {
      const { error } = await supabase.rpc('rpc_reschedule_task', {
        p_task_id: reschedulingTask.id,
        p_new_scheduled_at: new Date(rescheduleDate).toISOString(),
        p_reason: rescheduleReason.trim() || null
      });

      if (error) {
        setRescheduleFeedback('تعذر إعادة جدولة المهمة: ' + error.message);
      } else {
        setRescheduleFeedback('تمت إعادة جدولة المهمة بنجاح.');
        onRefresh();
        setTimeout(() => {
          setReschedulingTask(null);
          setRescheduleDate('');
          setRescheduleReason('');
          setRescheduleFeedback(null);
        }, 1200);
      }
    } catch {
      setRescheduleFeedback('حدث خطأ أثناء حفظ الجدولة.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">المهام التشغيلية (Payment Tasks)</h2>
            <p className="text-xs text-slate-400">سداد المشغلين وإدارة المواعيد الدورية</p>
          </div>
          <span className="text-xs font-bold text-teal-400 px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 rounded-lg">
            {tasks.length} مهمة
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الهاتف، العميل، أو رقم المهمة..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2 pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(['all', 'today', 'overdue', 'upcoming', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1 text-center text-xs rounded-lg transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all'
                ? 'الكل'
                : tab === 'today'
                ? 'اليوم'
                : tab === 'overdue'
                ? 'متأخرة'
                : tab === 'upcoming'
                ? 'قادمة'
                : 'مكتملة'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا توجد مهام في هذا التصنيف</p>
          </div>
        ) : (
          filtered.map((t) => {
            const cust = customers.find((c) => c.id === t.customer_id);

            return (
              <div
                key={t.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">
                      #{t.task_number}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-wider" dir="ltr">
                        {t.phone_number || 'رقم هاتف'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{cust?.full_name || 'عميل'}</span>
                        <span className="text-slate-600">•</span>
                        <span>مبلغ: {t.amount} {t.currency}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {t.isCompleted ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        مكتملة
                      </span>
                    ) : t.isOverdue ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                        متأخرة
                      </span>
                    ) : t.isToday ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        مستحقة اليوم
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">
                        مجدولة
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-slate-950/70 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">تاريخ الاستحقاق:</span>
                    <span className="text-slate-200">{new Date(t.due_at).toLocaleDateString('ar-YE')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">الفاصل الدوري:</span>
                    <span className="text-slate-200">كل {t.source_task_interval_days} يوم</span>
                  </div>
                  {t.execution_note && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-500 block">ملاحظة التنفيذ:</span>
                      <span className="text-emerald-400">{t.execution_note}</span>
                    </div>
                  )}
                </div>

                {/* Actions for pending tasks */}
                {!t.isCompleted && (
                  <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                    <button
                      onClick={() => {
                        setExecutingTask(t);
                        setExecutionNote('');
                        setExecuteFeedback(null);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تسجيل السداد والانتهاء</span>
                    </button>
                    <button
                      onClick={() => {
                        setReschedulingTask(t);
                        setRescheduleDate('');
                        setRescheduleReason('');
                        setRescheduleFeedback(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة جدولة</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* EXECUTE MODAL */}
      {executingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>إتمام المهمة التشغيلية #{executingTask.task_number}</span>
              </h3>
              <button onClick={() => setExecutingTask(null)} disabled={executeLoading} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {executeFeedback && (
              <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/40 text-teal-300 text-xs">
                {executeFeedback}
              </div>
            )}

            <form onSubmit={handleExecute} className="space-y-3" noValidate>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  مرجع السداد لدى مشغل الاتصالات / ملاحظة التنفيذ:
                </label>
                <input
                  type="text"
                  value={executionNote}
                  onChange={(e) => setExecutionNote(e.target.value)}
                  placeholder="مثال: تم التجديد برقم مرجع YM-88992"
                  disabled={executeLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={executeLoading}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {executeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>تأكيد الإتمام</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExecutingTask(null)}
                  disabled={executeLoading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {reschedulingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-sky-400" />
                <span>إعادة جدولة المهمة #{reschedulingTask.task_number}</span>
              </h3>
              <button onClick={() => setReschedulingTask(null)} disabled={rescheduleLoading} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {rescheduleFeedback && (
              <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/40 text-sky-300 text-xs">
                {rescheduleFeedback}
              </div>
            )}

            <form onSubmit={handleReschedule} className="space-y-3" noValidate>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">الموعد الجديد للمهمة:</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  disabled={rescheduleLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">سبب إعادة الجدولة:</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="مثال: تأخر استجابة بوابة المشغل"
                  disabled={rescheduleLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={rescheduleLoading || !rescheduleDate}
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {rescheduleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>حفظ الموعد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReschedulingTask(null)}
                  disabled={rescheduleLoading}
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
