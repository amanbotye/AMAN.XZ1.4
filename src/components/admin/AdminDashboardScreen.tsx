/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  CheckSquare,
  AlertTriangle,
  Bell,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronLeft
} from 'lucide-react';
import {
  UserProfile,
  CustomerNumberItem,
  ProtectionRequestItem,
  ProtectionItem,
  PaymentTaskItem,
  NotificationItem
} from '../../types/aman';

interface AdminDashboardScreenProps {
  customers: UserProfile[];
  allNumbers: CustomerNumberItem[];
  allRequests: ProtectionRequestItem[];
  allProtections: ProtectionItem[];
  allTasks: PaymentTaskItem[];
  adminNotifications: NotificationItem[];
  onNavigateTab: (tab: any) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  customers,
  allNumbers,
  allRequests,
  allProtections,
  allTasks,
  adminNotifications,
  onNavigateTab
}) => {
  const pendingRequests = allRequests.filter((r) => r.status === 'pending');
  const activeProtections = allProtections.filter((p) => p.status === 'active');

  const nowMs = Date.now();
  const needingRenewal = allProtections.filter((p) => {
    if (p.status !== 'active') return false;
    const endMs = new Date(p.end_at).getTime();
    const daysLeft = Math.ceil((endMs - nowMs) / (1000 * 86400));
    return daysLeft <= 14;
  });

  // Tasks today & overdue
  const todayTasks = allTasks.filter((t) => {
    if (t.status === 'completed' || t.status === 'cancelled') return false;
    const dueMs = new Date(t.due_at).getTime();
    const diffHours = (dueMs - nowMs) / (1000 * 3600);
    return diffHours >= 0 && diffHours <= 24;
  });

  const overdueTasks = allTasks.filter((t) => {
    if (t.status === 'completed' || t.status === 'cancelled') return false;
    const dueMs = new Date(t.due_at).getTime();
    return (dueMs - nowMs) < 0;
  });

  const unreadAdminNotifs = adminNotifications.filter((n) => !n.is_read);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 select-none" dir="rtl">
      {/* Admin Welcome */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 border border-slate-700/60 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-1 inline-block">
            لوحة الإدارة والعمليات المركزية
          </span>
          <h2 className="text-base font-bold text-white">نظام أمان — المؤشرات الفورية</h2>
          <p className="text-xs text-slate-400 mt-0.5">مراقبة الحمايات، المهام التشغيلية، ومراجعة الطلبات</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Customers */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 group-hover:text-slate-200">العملاء</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{customers.length}</div>
          <span className="text-[10px] text-slate-500">حسابات مسجلة</span>
        </div>

        {/* Numbers */}
        <div
          onClick={() => onNavigateTab('numbers')}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 group-hover:text-slate-200">الأرقام المسجلة</span>
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white">{allNumbers.length}</div>
          <span className="text-[10px] text-slate-500">هواتف مرتبطة</span>
        </div>

        {/* Pending Requests - Highlights urgent review */}
        <div
          onClick={() => onNavigateTab('requests')}
          className={`p-3 rounded-xl bg-slate-900/90 border ${
            pendingRequests.length > 0 ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-800'
          } hover:border-amber-500 transition-all cursor-pointer group`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 group-hover:text-slate-200">بانتظار المراجعة</span>
            <Clock className={`w-4 h-4 ${pendingRequests.length > 0 ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} />
          </div>
          <div className={`text-xl font-bold ${pendingRequests.length > 0 ? 'text-amber-400' : 'text-white'}`}>
            {pendingRequests.length}
          </div>
          <span className="text-[10px] text-slate-500">طلبات تفعيل معلقة</span>
        </div>

        {/* Active Protections */}
        <div
          onClick={() => onNavigateTab('protections')}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 group-hover:text-slate-200">الحمايات النشطة</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{activeProtections.length}</div>
          <span className="text-[10px] text-slate-500">اشتراكات مفعلة</span>
        </div>

        {/* Today Tasks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 group-hover:text-slate-200">مهام اليوم</span>
            <CheckSquare className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-teal-400">{todayTasks.length}</div>
          <span className="text-[10px] text-slate-500">مستحقة السداد اليوم</span>
        </div>

        {/* Overdue Tasks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className={`p-3 rounded-xl bg-slate-900/90 border ${
            overdueTasks.length > 0 ? 'border-red-500/50 bg-red-950/20' : 'border-slate-800'
          } hover:border-red-500 transition-all cursor-pointer group`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 group-hover:text-slate-200">مهام متأخرة</span>
            <AlertTriangle className={`w-4 h-4 ${overdueTasks.length > 0 ? 'text-red-400' : 'text-slate-500'}`} />
          </div>
          <div className={`text-xl font-bold ${overdueTasks.length > 0 ? 'text-red-400' : 'text-white'}`}>
            {overdueTasks.length}
          </div>
          <span className="text-[10px] text-slate-500">تجاوزت موعد الاستحقاق</span>
        </div>
      </div>

      {/* Action Shortcuts */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 px-1">الوصول السريع</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigateTab('requests')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center gap-2.5 text-right cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">مراجعة الطلبات</div>
              <div className="text-[10px] text-slate-400">{pendingRequests.length} طلب بانتظار القرار</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('tasks')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 transition-all flex items-center gap-2.5 text-right cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">المهام التشغيلية</div>
              <div className="text-[10px] text-slate-400">سداد المشغلين والتجديد</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('providers')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/40 transition-all flex items-center gap-2.5 text-right cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">مشغلو الاتصالات</div>
              <div className="text-[10px] text-slate-400">البوادئ وقواعد الكشف</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('audit')}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center gap-2.5 text-right cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">سجل العمليات</div>
              <div className="text-[10px] text-slate-400">تتبع التدقيق الإداري</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
