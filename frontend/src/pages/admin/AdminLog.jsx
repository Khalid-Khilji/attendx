import { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Calendar, UserCheck, ShieldCheck, ChevronLeft, ChevronRight, Clock, Tag, Box, Filter, Search, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, Loader } from '../../components/index';
import { getAllLogs } from '../../api/index';

const AdminLog = () => {
  const [filters, setFilters] = useState({
    role: '',
    start_date: '',
    end_date: '',
    action: '',
    page: 1,
    limit: 10
  });

  const { data, isLoading } = useQuery({
    queryKey: ['logs', filters],
    queryFn: () => getAllLogs(filters),
    placeholderData: (previousData) => previousData,
  });

  const logsList = data?.logs || [];
  const totalPages = data?.pages || 1;

  const clearFilters = () => setFilters({ role: '', start_date: '', end_date: '', action: '', page: 1, limit: 10 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pt-28 pb-12 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <Activity size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Audit</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white">
              Activity <span className="italic text-violet-600">Logs</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Input
              id="action-filter"
              name="action-filter"
              label="Action"
              hideLabel
              placeholder="CREATE / UPDATE / DELETE"
              className="md:w-64"
              icon={Tag}
              value={filters.action}
              onChange={(val) => setFilters(prev => ({ ...prev, action: val.toUpperCase(), page: 1 }))}
              autoComplete="off"
            />
            <div className="relative min-w-[140px]">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <select
                id="role-filter"
                name="role-filter"
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/30 appearance-none cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="lg:col-span-2 flex flex-col gap-1">
            <label htmlFor="start-date" className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Start Date</label>
            <Input
              id="start-date"
              name="start-date"
              type="date"
              icon={Calendar}
              value={filters.start_date}
              onChange={(val) => setFilters(prev => ({ ...prev, start_date: val }))}
              autoComplete="off"
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-1">
            <label htmlFor="end-date" className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">End Date</label>
            <Input
              id="end-date"
              name="end-date"
              type="date"
              icon={Calendar}
              value={filters.end_date}
              onChange={(val) => setFilters(prev => ({ ...prev, end_date: val }))}
              autoComplete="off"
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="secondary" 
              className="w-full h-11 flex items-center justify-center gap-2" 
              onClick={clearFilters}
            >
              <XCircle size={14} />
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-widest text-zinc-400">Timestamp</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-widest text-zinc-400">Actor</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-widest text-zinc-400">Action</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-widest text-zinc-400">Target Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {isLoading ? (
                  <tr><td colSpan="4" className="py-20"><Loader text="Syncing logs..." /></td></tr>
                ) : logsList.length > 0 ? (
                  logsList.map((log, idx) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                          <Clock size={12} className="group-hover:text-violet-500 transition-colors" />
                          <span className="text-xs font-medium">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                            {log.actor_role === 'admin' ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                              {log.actor_name}
                            </p>
                            <p className="text-[8px] font-black text-violet-500 uppercase tracking-wider">{log.faculty_id || log.actor_role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest inline-block ${
                          log.action === 'CREATE' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                          log.action === 'DELETE' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' :
                          log.action === 'UPDATE' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 transition-all">
                            <Box size={14} />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-xs text-zinc-900 dark:text-white font-bold uppercase tracking-tight max-w-xs">
                              <span className="text-zinc-500 dark:text-zinc-400">{log.entity}:</span>{' '}
                              <span className="text-violet-600 dark:text-violet-400">{log.entity_name}</span>
                            </p>
                            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-tighter font-mono">
                              ID: {log.entity_id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-400">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-4">
                          <Search size={28} className="text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest">Zero Logs Recorded</p>
                        {(filters.role || filters.action || filters.start_date || filters.end_date) && (
                          <button onClick={clearFilters} className="mt-4 text-xs font-bold text-violet-600 hover:text-violet-700">
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-5 bg-gradient-to-r from-zinc-50/50 to-white/50 dark:from-zinc-900/50 dark:to-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              PAGE <span className="text-violet-600 text-xs mx-1">{filters.page}</span> OF <span className="text-zinc-600 dark:text-zinc-300 text-xs mx-1">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                className="disabled:opacity-30 disabled:cursor-not-allowed"
              />
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                disabled={filters.page >= totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                className="disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLog;