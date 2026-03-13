import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Calendar, UserCheck, ShieldCheck, ChevronLeft, ChevronRight,ChevronDown, Clock, Tag, Box, Search, XCircle, SlidersHorizontal } from 'lucide-react';
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
    staleTime: 5000,
  });

  const logsList = useMemo(() => data?.logs || [], [data]);
  const totalPages = data?.pages || 1;

  const clearFilters = () => {
    setFilters({ role: '', start_date: '', end_date: '', action: '', page: 1, limit: 10 });
    queryClient.invalidateQueries({ queryKey: ['logs'] });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 md:pt-32 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white">
              Audit <span className="text-violet-600">Trail</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Button
              variant="secondary"
              className="lg:hidden flex-1"
              onClick={() => setShowFilters(!showFilters)}
              icon={SlidersHorizontal}
            >
              Filters
            </Button>
            <div className="hidden lg:flex gap-3">
              <Input
                id="log-action"
                name="action"
                hideLabel
                placeholder="Action (e.g. CREATE)"
                className="w-56"
                icon={Tag}
                value={filters.action}
                onChange={(val) => setFilters(prev => ({ ...prev, action: val.toUpperCase(), page: 1 }))}
                autoComplete="off"
              />
              <div className="relative">
                <select
                  id="log-role"
                  name="role"
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
                  className="pl-4 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold uppercase tracking-widest outline-none focus:border-violet-500 appearance-none cursor-pointer"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin Only</option>
                  <option value="teacher">Teachers Only</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {(showFilters || window.innerWidth > 1024) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 overflow-hidden lg:overflow-visible"
            >
              <div className="lg:col-span-2">
                <Input
                  label="From Date"
                  id="log-start"
                  name="start_date"
                  type="date"
                  icon={Calendar}
                  value={filters.start_date}
                  onChange={(val) => setFilters(prev => ({ ...prev, start_date: val, page: 1 }))}
                />
              </div>
              <div className="lg:col-span-2">
                <Input
                  label="To Date"
                  id="log-end"
                  name="end_date"
                  type="date"
                  icon={Calendar}
                  value={filters.end_date}
                  onChange={(val) => setFilters(prev => ({ ...prev, end_date: val, page: 1 }))}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  className="w-full h-11 border-dashed border-2"
                  onClick={clearFilters}
                  icon={XCircle}
                >
                  Clear All
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden relative"
        >
          {isFetching && !isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-500/20 overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-1/3 h-full bg-violet-600 shadow-[0_0_10px_violet]"
              />
            </div>
          )}

          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Time / Event</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Initiator</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Execution</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {isLoading ? (
                  <tr><td colSpan="4" className="py-32"><Loader text="Accessing Secure Logs..." /></td></tr>
                ) : logsList.length > 0 ? (
                  logsList.map((log, idx) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all group cursor-default"
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-tight">
                            <Clock size={12} className="text-violet-500" />
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                          <span className="text-[10px] font-medium text-zinc-400 ml-5">{new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${log.actor_role === 'admin'
                              ? 'bg-linear-to-br from-violet-500 to-indigo-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}>
                            {log.actor_role === 'admin' ? <ShieldCheck size={18} /> : <UserCheck size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none mb-1">{log.actor_name}</p>
                            <p className="text-[9px] font-bold text-violet-500 uppercase tracking-widest">{log.faculty_id || log.actor_role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] inline-flex items-center gap-2 border ${log.action === 'CREATE' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' :
                            log.action === 'DELETE' ? 'bg-red-500/5 text-red-600 border-red-500/20' :
                              log.action === 'UPDATE' ? 'bg-amber-500/5 text-amber-600 border-amber-500/20' :
                                'bg-zinc-500/5 text-zinc-600 border-zinc-500/20'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${log.action === 'CREATE' ? 'bg-emerald-500' :
                              log.action === 'DELETE' ? 'bg-red-500' : 'bg-amber-500'
                            }`} />
                          {log.action}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-violet-500 group-hover:bg-violet-500/5 transition-all">
                            <Box size={16} />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-xs text-zinc-900 dark:text-white font-black uppercase tracking-tight">
                              <span className="text-zinc-400 font-medium">{log.entity}:</span> {log.entity_name}
                            </p>
                            <p className="text-[9px] text-zinc-500 font-mono tracking-tighter mt-0.5">#{log.entity_id.slice(-12).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-40 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Search size={48} strokeWidth={1} />
                        <p className="text-xs font-black uppercase tracking-[0.4em]">No Logs Recovered</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="px-8 py-6 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Navigation <span className="text-violet-600 ml-2">{filters.page} / {totalPages}</span>
            </span>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 md:flex-none rounded-xl"
                icon={ChevronLeft}
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              />
              <div className="flex gap-1">
                {[...Array(Math.min(3, totalPages))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                    className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${filters.page === i + 1
                        ? 'bg-violet-600 text-white'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 md:flex-none rounded-xl"
                icon={ChevronRight}
                disabled={filters.page >= totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              />
            </div>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLog;