/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Smartphone,
  Shield,
  FileText,
  X,
  Mail,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react';
import {
  UserProfile,
  CustomerNumberItem,
  ProtectionRequestItem,
  ProtectionItem,
  PaymentTaskItem
} from '../../types/aman';

interface AdminCustomersScreenProps {
  customers: UserProfile[];
  allNumbers: CustomerNumberItem[];
  allRequests: ProtectionRequestItem[];
  allProtections: ProtectionItem[];
  allTasks: PaymentTaskItem[];
}

export const AdminCustomersScreen: React.FC<AdminCustomersScreenProps> = ({
  customers,
  allNumbers,
  allRequests,
  allProtections,
  allTasks
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'disabled'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      (c.full_name && c.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.username && c.username.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">إدارة العملاء</h2>
            <p className="text-xs text-slate-400">سجل المشتركين وتتبع حساباتهم وأرقامهم</p>
          </div>
          <span className="text-xs font-bold text-slate-300 px-2.5 py-1 bg-slate-800 rounded-lg">
            {customers.length} عميل
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد الإلكتروني أو اسم المستخدم..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2 pointer-events-none" />
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(['all', 'active', 'suspended', 'disabled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-1 py-1 text-center text-xs rounded-lg transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all'
                ? 'الكل'
                : st === 'active'
                ? 'النشطين'
                : st === 'suspended'
                ? 'الموقوفين'
                : 'المعطلين'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا يوجد عملاء مطابقون للبحث</p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const customerNums = allNumbers.filter((n) => n.customer_id === cust.id);
            const customerProts = allProtections.filter((p) => p.customer_id === cust.id);

            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-sm text-emerald-400">
                    {cust.full_name?.substring(0, 1) || 'ع'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{cust.full_name || 'بدون اسم'}</h4>
                    <p className="text-[11px] text-slate-400">{cust.email || 'لا يوجد بريد'}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span>{customerNums.length} أرقام</span>
                      <span>•</span>
                      <span>{customerProts.length} حمايات</span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      cust.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : cust.status === 'suspended'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {cust.status === 'active' ? 'نشط' : cust.status === 'suspended' ? 'موقوف' : 'معطل'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">تفاصيل ملف العميل</h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile info */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">الاسم:</span>
                <span className="font-bold text-white">{selectedCustomer.full_name || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">البريد:</span>
                <span className="text-slate-300 font-mono text-[11px]">{selectedCustomer.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">اسم المستخدم:</span>
                <span className="text-slate-300">{selectedCustomer.username || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الحالة:</span>
                <span className="font-bold text-emerald-400">{selectedCustomer.status}</span>
              </div>
            </div>

            {/* Registered Numbers */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>الأرقام المسجلة للعميل</span>
              </h4>
              <div className="space-y-1.5">
                {allNumbers
                  .filter((n) => n.customer_id === selectedCustomer.id)
                  .map((num) => (
                    <div
                      key={num.id}
                      className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-white tracking-wider" dir="ltr">{num.phone_number}</span>
                      <span className="text-[10px] text-slate-400">{num.detected_prefix}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Active Protections */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>اشتراكات الحماية</span>
              </h4>
              <div className="space-y-1.5">
                {allProtections
                  .filter((p) => p.customer_id === selectedCustomer.id)
                  .map((prot) => (
                    <div
                      key={prot.id}
                      className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-200">{prot.package_name_snapshot}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">{prot.status}</span>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
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
