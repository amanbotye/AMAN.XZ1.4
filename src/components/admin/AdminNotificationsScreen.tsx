/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  ExternalLink,
  Loader2,
  ShieldAlert,
  CheckSquare
} from 'lucide-react';
import { NotificationItem } from '../../types/aman';

interface AdminNotificationsScreenProps {
  supabase: SupabaseClient;
  notifications: NotificationItem[];
  onRefresh: () => void;
  onNavigateTab: (tab: any) => void;
}

export const AdminNotificationsScreen: React.FC<AdminNotificationsScreenProps> = ({
  supabase,
  notifications,
  onRefresh,
  onNavigateTab
}) => {
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (notif: NotificationItem) => {
    if (notif.is_read) return;

    try {
      await supabase.rpc('rpc_mark_admin_notification_read', {
        p_notification_id: notif.id
      });
      onRefresh();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);

    try {
      const unreads = notifications.filter((n) => !n.is_read);
      for (const u of unreads) {
        await supabase.rpc('rpc_mark_admin_notification_read', {
          p_notification_id: u.id
        });
      }
      onRefresh();
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeepLink = (notif: NotificationItem) => {
    if (notif.related_request_id) {
      onNavigateTab('requests');
    } else if (notif.related_task_id) {
      onNavigateTab('tasks');
    } else if (notif.related_protection_id) {
      onNavigateTab('protections');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">إشعارات الإدارة والعمليات</h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                {unreadCount} جديد
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">تنبيهات استحقاق المهام والطلبات الجديدة</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            <span>قراءة الكل</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {notifications.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا توجد إشعارات إدارية جديدة</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.is_read) handleMarkAsRead(notif);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                notif.is_read
                  ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                  : 'bg-slate-900 border-amber-500/40 shadow-sm shadow-amber-950/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.is_read ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{notif.title}</span>
                      {!notif.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{notif.body}</p>
                    <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.created_at).toLocaleString('ar-YE')}</span>
                    </div>
                  </div>
                </div>

                {(notif.related_request_id || notif.related_task_id || notif.related_protection_id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeepLink(notif);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                    title="فتح العنصر المرتبط"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
