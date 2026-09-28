/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smartphone,
  Search,
  Shield,
  Clock,
  CheckCircle,
  FileText,
  X,
  User
} from 'lucide-react';
import {
  CustomerNumberItem,
  UserProfile,
  ProtectionItem,
  ProtectionRequestItem
} from '../../types/aman';

interface AdminCustomerNumbersScreenProps {
  numbers: CustomerNumberItem[];
  customers: UserProfile[];
  protections: ProtectionItem[];
  requests: ProtectionRequestItem[];
}

export const AdminCustomerNumbersScreen: React.FC<AdminCustomerNumbersScreenProps> = ({
  numbers,
  customers,
  protections,
  requests
}) => {
  const [search, setSearch] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<CustomerNumberItem | null>(null);

  const filtered = numbers.filter((n) => {
    const cust = customers.find((c) => c.id === n.customer_id);
    const custName = cust?.full_name?.toLowerCase() || '';
    const q = search.toLowerCase();
    return (
      n.phone_number.includes(q) ||
      custName.includes(q) ||
      n.detected_prefix.includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">أرقام المشتركين</h2>
            <p className="text-xs text-slate-400">فهرس كافة أرقام الهواتف وتتبع ملاكها وحمايتها</p>
          </div>
          <span className="text-xs font-bold text-slate-300 px-2.5 py-1 bg-slate-800 rounded-lg">
            {numbers.length} رقم
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الهاتف، المالك، أو البادئة..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2 pointer-events-none" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <Smartphone className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا توجد أرقام مطابقة للبحث</p>
          </div>
        ) : (
          filtered.map((num) => {
            const cust = customers.find((c) => c.id === num.customer_id);
            const activeProt = protections.find(
              (p) => p.customer_number_id === num.id && p.status === 'active'
            );

            return (
              <div
                key={num.id}
                onClick={() => setSelectedNumber(num)}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                    {num.phone_number.substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white tracking-wider" dir="ltr">
                      {num.phone_number}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{cust?.full_name || 'عميل مسجل'}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] text-slate-500">بادئة {num.detected_prefix}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {activeProt ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3" />
                      <span>محمي</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                      غير محمي
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Number Details Dialog */}
      {selectedNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">تفاصيل الرقم وسجل الحماية</h3>
              </div>
              <button
                onClick={() => setSelectedNumber(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الهاتف:</span>
                <span className="font-mono font-bold text-white tracking-wider" dir="ltr">
                  {selectedNumber.phone_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المالك:</span>
                <span className="text-slate-200">
                  {customers.find((c) => c.id === selectedNumber.customer_id)?.full_name || 'غير معروف'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">البادئة والمشغل:</span>
                <span className="text-sky-400 font-bold">{selectedNumber.detected_prefix}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ملاحظات العميل:</span>
                <span className="text-slate-300">{selectedNumber.notes || '—'}</span>
              </div>
            </div>

            {/* Related requests */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-1.5">طلبات الحماية المرتبطة</h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {requests
                  .filter((r) => r.customer_number_id === selectedNumber.id)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span>{r.package_name || 'باقة حماية'}</span>
                      <span className="text-[10px] font-bold text-slate-300">{r.status}</span>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedNumber(null)}
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
