import { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Search, Calendar, UserCheck, ShieldCheck, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, Loader } from '../../components/index';
import { getAllLogs } from '../../api/index';

const AdminLog = () => {
  const [filters, setFilters] = useState({
    role: '',
    start_date: '',
    end_date: '',
    search: '',
    page: 1,
    limit: 10
  });

  const { data, isLoading } = useQuery({
    queryKey: ['logs', filters],
    queryFn: () => getAllLogs(filters),
    keepPreviousData: true
  });

  const handleSearchChange = (val) => {
    setFilters(prev => ({ ...prev, search: val, page: 1 }));
  };

  // Backend response handles different formats
  const logsList = Array.isArray(data) ? data : data?.logs || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 pb-12 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-violet-600 mb-1">
              <Activity size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Audit</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white">
              Activity <span className="italic text-violet-600">Logs</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Input
              placeholder="Search logs..."
              className="md:w-64"
              icon={Search}
              value={filters.search}
              onChange={handleSearchChange}
            />
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold uppercase tracking-widest text-zinc-500 outline-none focus:border-violet-600"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Start Date</label>
            <Input type="date" icon={Calendar} value={filters.start_date} onChange={(val) => setFilters(prev => ({ ...prev, start_date: val }))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">End Date</label>
            <Input type="date" icon={Calendar} value={filters.end_date} onChange={(val) => setFilters(prev => ({ ...prev, end_date: val }))} />
          </div>
          <div className="md:col-span-2 flex items-end">
            <Button variant="secondary" className="w-full" onClick={() => setFilters({ role: '', start_date: '', end_date: '', search: '', page: 1, limit: 10 })}>Reset Filters</Button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Timestamp</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">User</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Action</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {isLoading ? (
                  <tr><td colSpan="4" className="py-20"><Loader text="Fetching audit trails..." /></td></tr>
                ) : logsList.length > 0 ? (
                  logsList.map((log, idx) => (
                    <motion.tr
                      key={log.log_id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                          <Clock size={12} />
                          <span className="text-xs font-medium">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
                            {log.role === 'admin' ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white uppercase">
                              {log.teacher_name || log.role || 'System'}
                            </p>
                            <p className="text-[9px] font-black text-violet-500 uppercase tracking-tighter">{log.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${log.action_type === 'CREATE' ? 'bg-emerald-100 text-emerald-600' :
                            log.action_type === 'DELETE' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                          }`}>
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs truncate font-medium">{log.message}</p>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="py-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">No logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-5 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Page {filters.page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              />
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                disabled={filters.page >= totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLog;