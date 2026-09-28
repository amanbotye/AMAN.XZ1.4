/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Shield,
  Smartphone,
  AlertTriangle,
  Clock,
  Bell,
  ArrowRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { UserProfile, CustomerNumberItem, ProtectionItem, ProtectionRequestItem, NotificationItem } from '../../types/aman';

interface CustomerHomeScreenProps {
  profile: UserProfile;
  numbers: CustomerNumberItem[];
  protections: ProtectionItem[];
  requests: ProtectionRequestItem[];
  notifications: NotificationItem[];
  onNavigateTab: (tab: 'home' | 'numbers' | 'requests' | 'protections' | 'notifications' | 'account') => void;
  onOpenAddNumber: () => void;
  onOpenNewRequest: () => void;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  profile,
  numbers,
  protections,
  requests,
  notifications,
  onNavigateTab,
  onOpenAddNumber,
  onOpenNewRequest
}) => {
  // Compute metrics
  const activeProtections = protections.filter((p) => p.status === 'active');
  
  // Protections needing renewal (end_at within next 14 days)
  const nowMs = Date.now();
  const needingRenewal = protections.filter((p) => {
    if (p.status !== 'active') return false;
    const endMs = new Date(p.end_at).getTime();
    const diffDays = Math.ceil((endMs - nowMs) / (1000 * 86400));
    return diffDays <= 14;
  });

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 select-none" dir="rtl">
      {/* Welcome Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-medium">حساب نشط ومحمي</span>
            </div>
            <h2 className="text-base font-bold text-white">
              مرحباً بك، {profile.full_name || 'عميل أمان'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">منصة حماية الأرقام والخدمات الذكية</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-700/60 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Numbers stat */}
        <div
          onClick={() => onNavigateTab('numbers')}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 group-hover:text-slate-200">أرقامي المسجلة</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{numbers.length}</div>
          <span className="text-[10px] text-slate-500">هواتف مرتبطة بالحساب</span>
        </div>

        {/* Active protections stat */}
        <div
          onClick={() => onNavigateTab('protections')}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 group-hover:text-slate-200">الحمايات النشطة</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{activeProtections.length}</div>
          <span className="text-[10px] text-slate-500">حماية مفعلة حالياً</span>
        </div>

        {/* Renewal alerts stat */}
        <div
          onClick={() => onNavigateTab('protections')}
          className={`p-3 rounded-xl bg-slate-900/90 border ${
            needingRenewal.length > 0 ? 'border-amber-500/40 bg-amber-950/20' : 'border-slate-800'
          } hover:border-amber-500/60 transition-all cursor-pointer group`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 group-hover:text-slate-200">تحتاج تجديد</span>
            <AlertTriangle className={`w-4 h-4 ${needingRenewal.length > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className={`text-xl font-bold ${needingRenewal.length > 0 ? 'text-amber-400' : 'text-white'}`}>
            {needingRenewal.length}
          </div>
          <span className="text-[10px] text-slate-500">أرقام قريبة من الانتهاء</span>
        </div>

        {/* Pending requests stat */}
        <div
          onClick={() => onNavigateTab('requests')}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 group-hover:text-slate-200">طلبات المراجعة</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400">{pendingRequests.length}</div>
          <span className="text-[10px] text-slate-500">بانتظار تأكيد الإدارة</span>
        </div>
      </div>

      {/* Action Shortcuts */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 px-1">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenAddNumber}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center gap-2.5 text-right cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">إضافة رقم جديد</div>
              <div className="text-[10px] text-slate-400">تسجيل وتأكيد المشغل</div>
            </div>
          </button>

          <button
            onClick={onOpenNewRequest}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 transition-all flex items-center gap-2.5 text-right cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">طلب حماية جديد</div>
              <div className="text-[10px] text-slate-400">تفعيل الباقة والسداد</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Alerts / Protections list snippet */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400">حالة الحمايات الجارية</h3>
          <button
            onClick={() => onNavigateTab('protections')}
            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>

        {protections.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا توجد حمايات مفعلة بعد</p>
            <button
              onClick={onOpenNewRequest}
              className="mt-2 text-xs text-emerald-400 font-semibold hover:underline"
            >
              قدم طلب حماية الآن
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {protections.slice(0, 3).map((prot) => {
              const endMs = new Date(prot.end_at).getTime();
              const daysLeft = Math.ceil((endMs - nowMs) / (1000 * 86400));
              const isUrgent = daysLeft <= 14;

              return (
                <div
                  key={prot.id}
                  onClick={() => onNavigateTab('protections')}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      {prot.phone_number?.substring(0, 2) || '77'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white tracking-wide" dir="ltr">
                        {prot.phone_number || 'رقم مسجل'}
                      </div>
                      <div className="text-[10px] text-slate-400">{prot.package_name_snapshot}</div>
                    </div>
                  </div>

                  <div className="text-left">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        isUrgent ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {daysLeft <= 0 ? 'منتهية' : `متبقي ${daysLeft} يوم`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notifications preview banner */}
      {unreadNotifications.length > 0 && (
        <div
          onClick={() => onNavigateTab('notifications')}
          className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 hover:border-sky-500/50 transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-400 animate-bounce" />
            <span className="text-xs text-sky-200">
              لديك {unreadNotifications.length} إشعار جديد في حسابك
            </span>
          </div>
          <ChevronLeft className="w-4 h-4 text-sky-400" />
        </div>
      )}
    </div>
  );
};
