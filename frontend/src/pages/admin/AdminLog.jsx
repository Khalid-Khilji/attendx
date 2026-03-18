import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, Calendar, UserCheck, ShieldCheck,
  ChevronLeft, ChevronRight, ChevronDown, Clock,
  Tag, Box, XCircle, SlidersHorizontal,
  Fingerprint
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Loader } from '../../components/index';
import { getAllLogs } from '../../api/index';

const AdminLog = () => {
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    start_date: '',
    end_date: '',
    action: '',
    page: 1,
    limit: 10
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['logs', filters],
    queryFn: () => getAllLogs(filters),
    placeholderData: (previousData) => previousData,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const logsList = useMemo(() => data?.logs || [], [data]);
  const totalPages = data?.pages || 1;

  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ role: '', start_date: '', end_date: '', action: '', page: 1, limit: 10 });
    queryClient.invalidateQueries({ queryKey: ['logs'] });
  };

  const getActionStyles = (action) => {
    const styles = {
      CREATE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      UPDATE: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
      PROMOTE: "bg-violet-500/10 text-violet-600 border-violet-500/20",
      LOGIN: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    };
    return styles[action] || "bg-zinc-500/10 text-zinc-600 border-zinc-500/20";
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-600/30 shrink-0">
              <Activity size={28} className="md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">System <span className="text-violet-600">Audit</span></h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {data?.total || 0} Total Records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="secondary"
              className="lg:hidden flex-1 h-12 md:h-14"
              onClick={() => setShowFilters(!showFilters)}
              icon={SlidersHorizontal}
            >
              Filters
            </Button>
            <div className="hidden lg:flex gap-3">
              <Input
                id="audit-action-desktop"
                name="audit_action"
                autoComplete="off"
                placeholder="ACTION (E.G. CREATE)"
                className="w-56 h-14"
                icon={Tag}
                value={filters.action}
                onChange={(val) => updateFilter('action', val.toUpperCase())}
              />
              <div className="relative group">
                <select
                  id="audit-role-desktop"
                  name="audit_role"
                  value={filters.role}
                  onChange={(e) => updateFilter('role', e.target.value)}
                  className="w-full h-14 pl-5 pr-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-black text-zinc-700 dark:text-zinc-200 appearance-none outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/5 transition-all cursor-pointer shadow-sm"
                >
                  <option value="">Origin: All</option>
                  <option value="admin">Root: Admin</option>
                  <option value="teacher">Faculty</option>
                </select>
                <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {(showFilters || window.innerWidth > 1024) && (
            <motion.div
              initial={window.innerWidth <= 1024 ? { height: 0, opacity: 0 } : {}}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 overflow-hidden"
            >
              <Input
                id="audit-start-date"
                name="start_date"
                label="Timeline Start"
                type="date"
                icon={Calendar}
                value={filters.start_date}
                onChange={(val) => updateFilter('start_date', val)}
                className="h-12 md:h-14"
              />
              <Input
                id="audit-end-date"
                name="end_date"
                label="Timeline End"
                type="date"
                icon={Calendar}
                value={filters.end_date}
                onChange={(val) => updateFilter('end_date', val)}
                className="h-12 md:h-14"
              />
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <Button
                  variant="ghost"
                  className="w-full h-12 md:h-14 border-dashed border-2 bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500"
                  onClick={clearFilters}
                  icon={XCircle}
                >
                  Reset Parameters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
          {isFetching && !isLoading && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-violet-500/10 overflow-hidden z-20">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-1/3 h-full bg-violet-600"
              />
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400">
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em]">Initiator</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em]">Operation</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em]">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {isLoading ? (
                  <tr><td colSpan="4" className="py-40"><Loader text="Syncing Records..." /></td></tr>
                ) : logsList.length > 0 ? (
                  logsList.map((log, idx) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-all group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col whitespace-nowrap">
                          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-black text-xs md:text-sm uppercase">
                            <Clock size={14} className="text-violet-500" />
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <span className="text-[10px] md:text-xs font-bold text-zinc-400 ml-5 mt-0.5">
                            {new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-md shrink-0 ${log.actor_role === 'admin' ? 'bg-zinc-900 text-white' : 'bg-violet-100 text-violet-600 dark:bg-violet-900/30'
                            }`}>
                            {log.actor_role === 'admin' ? <ShieldCheck size={18} /> : <UserCheck size={18} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm font-black text-zinc-900 dark:text-white uppercase truncate tracking-tight">{log.actor_name}</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-violet-500 uppercase tracking-widest">{log.faculty_id || log.actor_role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 border whitespace-nowrap ${getActionStyles(log.action)}`}>
                          <Fingerprint size={12} className="opacity-50" />
                          {log.action}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-violet-600 transition-colors shrink-0">
                            <Box size={16} />
                          </div>
                          <div className="truncate">
                            <p className="text-[11px] md:text-xs text-zinc-900 dark:text-zinc-100 font-black uppercase truncate">
                              <span className="text-zinc-400 font-medium lowercase italic mr-1">[{log.entity}]</span>
                              {log.entity_name}
                            </p>
                            <p className="text-[9px] md:text-[10px] text-zinc-500 font-mono mt-0.5 opacity-50">REF: {log.entity_id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="py-40 text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Null Sequence Detected</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="px-6 md:px-8 py-6 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 order-2 sm:order-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Segment <span className="text-violet-600 mx-1">{filters.page}</span> / {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button
                variant="ghost"
                className="flex-1 sm:w-12 sm:h-12 p-0 border-zinc-200"
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                icon={ChevronLeft}
              />

              <div className="hidden md:flex gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  (i === 0 || i === totalPages - 1 || (i >= filters.page - 2 && i <= filters.page)) && (
                    <button
                      key={i}
                      onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                      className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all border ${filters.page === i + 1
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-xl scale-110'
                        : 'bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:border-violet-600'
                        }`}
                    >
                      {i + 1}
                    </button>
                  )
                ))}
              </div>

              <Button
                variant="ghost"
                className="flex-1 sm:w-12 sm:h-12 p-0 border-zinc-200"
                disabled={filters.page >= totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                icon={ChevronRight}
              />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AdminLog;