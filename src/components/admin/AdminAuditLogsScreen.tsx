/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Layers
} from 'lucide-react';
import { AuditLogItem } from '../../types/aman';

interface AdminAuditLogsScreenProps {
  logs: AuditLogItem[];
}

export const AdminAuditLogsScreen: React.FC<AdminAuditLogsScreenProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const entities = Array.from(new Set(logs.map((l) => l.entity_type)));

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      l.action.toLowerCase().includes(q) ||
      l.entity_type.toLowerCase().includes(q) ||
      (l.entity_id && l.entity_id.toLowerCase().includes(q));

    const matchesEntity = entityFilter === 'all' || l.entity_type === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-white">سجل التدقيق والعمليات (Audit Log)</h2>
            <p className="text-xs text-slate-400">تتبع الإجراءات الأمنية والإدارية في النظام</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            {logs.length} عملية
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بنوع العملية أو الكيان أو المعرّف..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2 pointer-events-none" />
        </div>

        {/* Entity filter pill list */}
        {entities.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setEntityFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                entityFilter === 'all'
                  ? 'bg-emerald-600 text-white font-bold'
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
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {ent}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <Activity className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا توجد عمليات مطابقة للبحث</p>
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                  {log.action}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(log.created_at).toLocaleString('ar-YE')}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>الكيان: <strong className="text-slate-200">{log.entity_type}</strong></span>
                {log.entity_id && (
                  <span className="font-mono text-[10px] text-slate-500">ID: {log.entity_id.substring(0, 8)}...</span>
                )}
              </div>

              {log.metadata && (
                <pre className="text-[10px] bg-slate-950 p-2 rounded-lg text-slate-400 overflow-x-auto font-mono">
                  {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
