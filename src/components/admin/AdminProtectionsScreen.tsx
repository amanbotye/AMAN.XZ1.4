/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  Search,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Calendar,
  User,
  X
} from 'lucide-react';
import { ProtectionItem, UserProfile } from '../../types/aman';

interface AdminProtectionsScreenProps {
  protections: ProtectionItem[];
  customers: UserProfile[];
}

export const AdminProtectionsScreen: React.FC<AdminProtectionsScreenProps> = ({
  protections,
  customers
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'renewal' | 'expired'>('all');
  const [search, setSearch] = useState('');
  const [selectedProt, setSelectedProt] = useState<ProtectionItem | null>(null);

  const nowMs = Date.now();

  const enriched = protections.map((p) => {
    const endMs = new Date(p.end_at).getTime();
    const daysLeft = Math.ceil((endMs - nowMs) / (1000 * 86400));
    const isExpired = daysLeft <= 0 || p.status === 'expired';
    const isNeedsRenewal = daysLeft <= 14 && !isExpired;
    const isActive = p.status === 'active' && !isExpired;

    return {
      ...p,
      daysLeft,
      isExpired,
      isNeedsRenewal,
      isActive
    };
  });

  const filtered = enriched.filter((p) => {
    const cust = customers.find((c) => c.id === p.customer_id);
    const custName = cust?.full_name?.toLowerCase() || '';
    const q = search.toLowerCase();

    const matchesSearch =
      (p.phone_number && p.phone_number.includes(q)) ||
      custName.includes(q) ||
      p.package_name_snapshot.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filter === 'active') return p.isActive;
    if (filter === 'renewal') return p.isNeedsRenewal;
    if (filter === 'expired') return p.isExpired;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">إدارة الحمايات</h2>
            <p className="text-xs text-slate-400">متابعة كافة الاشتراكات النشطة وتواريخ الانتهاء</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            {protections.length} اشتراك
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالرقم أو العميل أو الباقة..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2 pointer-events-none" />
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(['all', 'active', 'renewal', 'expired'] as const).map((tab) => (
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
                : tab === 'active'
                ? 'النشطة'
                : tab === 'renewal'
                ? 'تحتاج تجديد'
                : 'المنتهية'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا توجد حمايات في هذا القسم</p>
          </div>
        ) : (
          filtered.map((prot) => {
            const cust = customers.find((c) => c.id === prot.customer_id);

            return (
              <div
                key={prot.id}
                onClick={() => setSelectedProt(prot)}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-wider" dir="ltr">
                        {prot.phone_number || 'رقم هاتف'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{cust?.full_name || 'عميل'}</span>
                        <span className="text-slate-600">•</span>
                        <span>{prot.package_name_snapshot}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {prot.isExpired ? (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                        منتهية
                      </span>
                    ) : prot.isNeedsRenewal ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        تجديد: {prot.daysLeft} يوم
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        نشطة
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-slate-950/70 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">تاريخ البدء:</span>
                    <span className="text-slate-300">{new Date(prot.start_at).toLocaleDateString('ar-YE')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">تاريخ الانتهاء:</span>
                    <span className="text-slate-300">{new Date(prot.end_at).toLocaleDateString('ar-YE')}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Dialog */}
      {selectedProt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">تفاصيل سجل الحماية</h3>
              </div>
              <button
                onClick={() => setSelectedProt(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الهاتف:</span>
                <span className="font-mono text-white tracking-wider" dir="ltr">{selectedProt.phone_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المالك:</span>
                <span className="text-slate-200">
                  {customers.find((c) => c.id === selectedProt.customer_id)?.full_name || 'غير معروف'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الباقة:</span>
                <span className="text-emerald-400 font-bold">{selectedProt.package_name_snapshot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">القيمة:</span>
                <span className="text-slate-200">{selectedProt.price_snapshot} {selectedProt.currency_snapshot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تاريخ البدء:</span>
                <span className="text-slate-300">{new Date(selectedProt.start_at).toLocaleString('ar-YE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تاريخ الانتهاء:</span>
                <span className="text-slate-300">{new Date(selectedProt.end_at).toLocaleString('ar-YE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">مرات التجديد:</span>
                <span className="text-slate-300">{selectedProt.renewal_count || 0}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedProt(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
