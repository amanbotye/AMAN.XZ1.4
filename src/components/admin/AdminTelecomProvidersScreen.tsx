/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Smartphone,
  CheckCircle,
  XCircle,
  Loader2,
  Tag,
  Hash,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { TelecomProvider, TelecomProviderPrefix } from '../../types/aman';

interface AdminTelecomProvidersScreenProps {
  supabase: SupabaseClient;
  providers: TelecomProvider[];
  prefixes: TelecomProviderPrefix[];
  onRefresh: () => void;
}

export const AdminTelecomProvidersScreen: React.FC<AdminTelecomProvidersScreenProps> = ({
  supabase,
  providers,
  prefixes,
  onRefresh
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleToggleActive = async (provider: TelecomProvider) => {
    if (updatingId) return;
    setUpdatingId(provider.id);

    try {
      const { error } = await supabase
        .from('companies')
        .update({ is_active: !provider.is_active })
        .eq('id', provider.id);

      if (!error) {
        onRefresh();
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">مشغلو الاتصالات (Telecom Providers)</h2>
          <p className="text-xs text-slate-400">إدارة شبكات الاتصالات اليمنية والبوادئ المعتمدة</p>
        </div>
        <span className="text-xs font-bold text-sky-400 px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-lg">
          {providers.length} مشغلين
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {providers.map((prov) => {
          const provPrefixes = prefixes.filter((p) => p.company_id === prov.id);

          return (
            <div
              key={prov.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                    {prov.code}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{prov.name_ar}</h3>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>كود المشغل: {prov.code}</span>
                      <span>•</span>
                      <span>طول الرقم: 9 أرقام</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(prov)}
                  disabled={updatingId === prov.id}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    prov.is_active
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {updatingId === prov.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : prov.is_active ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{prov.is_active ? 'مفعل' : 'معطل'}</span>
                </button>
              </div>

              {/* Prefixes list */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block mb-1">
                  البوادئ المعتمدة للكشف التلقائي:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {provPrefixes.length === 0 ? (
                    <span className="text-[10px] text-slate-500">لا توجد بوادئ مخصصة</span>
                  ) : (
                    provPrefixes.map((px) => (
                      <span
                        key={px.id}
                        className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 text-xs font-mono font-bold tracking-wider"
                      >
                        {px.prefix}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
