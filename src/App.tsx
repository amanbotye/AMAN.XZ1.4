import { useState } from 'react';
import {
  ShieldCheck,
  Database,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  Lock,
  Phone,
  Layers,
  Search,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  FileText,
  UserCheck,
  ShieldAlert,
  Users
} from 'lucide-react';
import { REPO_INFO, DB_TABLES, DB_RPCS } from './data/dbData.ts';
import { STAGES_EVALUATION, ERROR_CODES, INITIAL_SEED_SQL } from './data/evaluation.ts';
import { amanStore } from './services/amanStore.ts';
import { CustomerApp } from './components/CustomerApp.tsx';
import { AdminApp } from './components/AdminApp.tsx';

export default function App() {
  // Navigation: 'customer_app' | 'admin_app' | 'database_eval'
  const [currentMode, setCurrentMode] = useState<'customer_app' | 'admin_app' | 'database_eval'>('customer_app');
  const [evalTab, setEvalTab] = useState<'verdict' | 'stages' | 'tables' | 'rpcs' | 'simulator' | 'errors' | 'seed'>('verdict');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(DB_TABLES[0]?.name || null);
  const [selectedRpc, setSelectedRpc] = useState<string | null>(DB_RPCS[0]?.name || null);
  const [copiedSeed, setCopiedSeed] = useState(false);

  // Switch role handler
  const handleSwitchUserRole = (type: 'customer' | 'admin') => {
    if (type === 'customer') {
      amanStore.setCurrentUser('usr-customer-1');
      setCurrentMode('customer_app');
    } else {
      amanStore.setCurrentUser('usr-admin-1');
      setCurrentMode('admin_app');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Universal Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">منظومة أمان — AMAN</h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  XZ1.4 Reference
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  قيد التشغيل
                </span>
              </div>
              <p className="text-xs text-slate-400">تطبيق حماية أرقام الهاتف المحمول وفق المواصفة المرجعية</p>
            </div>
          </div>

          {/* User Role Switcher & Live Mode Nav */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => handleSwitchUserRole('customer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentMode === 'customer_app'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              واجهة العميل
            </button>

            <button
              onClick={() => handleSwitchUserRole('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentMode === 'admin_app'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              واجهة الإدارة
            </button>

            <button
              onClick={() => setCurrentMode('database_eval')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentMode === 'database_eval'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              توثيق ومطابقة الـ DB
            </button>
          </div>
        </div>

        {/* Sub-nav when in DB Evaluation Mode */}
        {currentMode === 'database_eval' && (
          <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-2 border-t border-slate-800/60 pt-2 pb-1 text-sm scrollbar-none">
            <button
              onClick={() => setEvalTab('verdict')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                evalTab === 'verdict' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              تقرير الجاهزية والتحديث الأخير
            </button>
            <button
              onClick={() => setEvalTab('stages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                evalTab === 'stages' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              مطابقة المراحل الـ 8
            </button>
            <button
              onClick={() => setEvalTab('tables')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                evalTab === 'tables' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              مستكشف الجداول ({DB_TABLES.length})
            </button>
            <button
              onClick={() => setEvalTab('rpcs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                evalTab === 'rpcs' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              العمليات الموثوقة RPCs ({DB_RPCS.length})
            </button>
            <button
              onClick={() => setEvalTab('errors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                evalTab === 'errors' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              مصفوفة الأخطاء ({ERROR_CODES.length})
            </button>
            <button
              onClick={() => setEvalTab('seed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                evalTab === 'seed' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              سكربت SQL للتغذية
            </button>
          </div>
        )}
      </header>

      {/* Main Screen Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* CUSTOMER APP VIEW */}
        {currentMode === 'customer_app' && <CustomerApp />}

        {/* ADMIN APP VIEW */}
        {currentMode === 'admin_app' && <AdminApp />}

        {/* DATABASE & SPEC EVALUATION VIEW */}
        {currentMode === 'database_eval' && (
          <div className="space-y-6">
            {evalTab === 'verdict' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    تم تحديث ومطابقة ملف الاستعلام الجديد في المستودع بنجاح!
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    جاهزية كود تطبيق أمان (AMAN Codebase Ready)
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    تم رفع وثيقة خطة بناء التطبيق <code>AMAN_IMPLEMENTATION_PLAN.md</code> وتقرير التحديث <code>AMAN_DB_UPDATE_REPORT.md</code> إلى المستودع الرسمي. يمكنك استخدام شريط التنقل العلوي للتبديل بين <strong>واجهة العميل</strong> و <strong>واجهة الإدارة</strong> لاختبار دورة حياة الطلبات والمهام والتدقيق المالي حياً.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">الجداول الموثقة</div>
                    <div className="text-2xl font-bold font-mono text-white mt-1">21</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">أمان مستوى الصفوف</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">100% (21/21)</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">العمليات الموثوقة RPC</div>
                    <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">14 دالة</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">رموز الأخطاء المقننة</div>
                    <div className="text-2xl font-bold font-mono text-amber-400 mt-1">22 رمزاً</div>
                  </div>
                </div>
              </div>
            )}

            {evalTab === 'stages' && (
              <div className="space-y-4">
                {STAGES_EVALUATION.map(stage => (
                  <div key={stage.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">المرحلة {stage.id}: {stage.title}</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">{stage.score}%</span>
                    </div>
                    <p className="text-xs text-slate-400">{stage.verdict}</p>
                  </div>
                ))}
              </div>
            )}

            {evalTab === 'tables' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {DB_TABLES.map(t => (
                    <div key={t.name} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="font-mono font-bold text-slate-100">{t.name}</div>
                      <div className="text-slate-400">{t.columnCount} حقول &bull; {t.policies.length} سياسات RLS</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {evalTab === 'rpcs' && (
              <div className="space-y-3">
                {DB_RPCS.map(r => (
                  <div key={r.name} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="font-mono font-bold text-emerald-300">{r.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{r.arguments || 'بدون معاملات'}</div>
                  </div>
                ))}
              </div>
            )}

            {evalTab === 'errors' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ERROR_CODES.map(e => (
                  <div key={e.code} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="font-mono font-bold text-rose-300">{e.code}</div>
                    <div className="text-slate-200">{e.messageAr}</div>
                    <div className="text-[11px] text-slate-400">{e.actionAr}</div>
                  </div>
                ))}
              </div>
            )}

            {evalTab === 'seed' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">سكربت SQL للتغذية الأولية:</span>
                  <button
                    onClick={() => copyToClipboard(INITIAL_SEED_SQL)}
                    className="hover:text-white flex items-center gap-1 font-mono text-[11px]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedSeed ? 'تم النسخ!' : 'نسخ السكربت'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
                  {INITIAL_SEED_SQL}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
