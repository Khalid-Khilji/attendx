import { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit3, Trash2, BookOpen, GraduationCap, Hash, Search, Filter, UserPlus, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTeachers, deleteTeacher, getAllDepartments } from '../../api/index';
import { Button, Input, Loader } from '../../components/index';

const TeacherModal = lazy(() => import('../../components/index').then(m => ({ default: m.TeacherModal })));
const AssignModal = lazy(() => import('../../components/index').then(m => ({ default: m.AssignModal })));

const Teachers = () => {
  const queryClient = useQueryClient();
  const [modals, setModals] = useState({ teacher: false, assign: false });
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
    staleTime: 1000 * 60 * 5,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] })
  });

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = `${t.first_name} ${t.last_name} ${t.faculty_id}`.toLowerCase().includes(search.toLowerCase());
      const matchesDept = filterDept ? t.dept_id === filterDept : true;
      return matchesSearch && matchesDept;
    });
  }, [teachers, search, filterDept]);

  const openModal = (type, teacher = null) => {
    setSelected(teacher);
    setModals(prev => ({ ...prev, [type]: true }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 md:pt-32 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <GraduationCap size={16} className="animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Faculty Management</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white">
              Teacher <span className="text-violet-600">Portal</span>
            </h1>
            <p className="text-xs font-bold text-zinc-400 mt-2 tracking-widest uppercase">{teachers.length} Active Personnel</p>
          </motion.div>
          <Button icon={UserPlus} size="lg" onClick={() => openModal('teacher')}>Register Teacher</Button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 flex flex-col md:flex-row gap-4 bg-zinc-50/30">
            <div className="flex-1">
              <Input
                id="teacher-search"
                name="teacher-search"
                icon={Search}
                placeholder="Find teacher by name or Faculty ID..."
                value={search}
                onChange={setSearch}
                autoComplete="off"
              />
            </div>
            <div className="relative md:w-72">
              <select
                id="dept-filter"
                name="dept-filter"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full h-11 pl-4 pr-10 rounded-xl bg-white dark:bg-zinc-800 text-sm font-bold border border-zinc-200 dark:border-zinc-700 outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b dark:border-zinc-800">
                  <th className="px-8 py-5">Full Name</th>
                  <th className="px-8 py-5">Academic ID</th>
                  <th className="px-8 py-5">Department</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {isLoading ? (
                  <tr><td colSpan="5" className="py-32 text-center"><Loader text="Syncing Biometric Data..." /></td></tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-40 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Search size={48} strokeWidth={1} />
                        <p className="text-xs font-black uppercase tracking-[0.4em]">No Personnel Found</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTeachers.map((t, idx) => (
                  <motion.tr
                    key={t._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform uppercase">
                          {t.first_name[0]}{t.last_name[0]}
                        </div>
                        <span className="text-sm font-black text-zinc-900 dark:text-white capitalize tracking-tight">{t.first_name} {t.last_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-400 font-mono">
                        <Hash size={10} /> {t.faculty_id}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 capitalize">{t.dept_name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${t.is_active !== false
                          ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20'
                          : 'bg-red-500/5 text-red-600 border-red-500/20'
                        }`}>
                        {t.is_active !== false && <CheckCircle2 size={10} />}
                        {t.is_active !== false ? 'Active' : 'Off-Duty'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => openModal('assign', t)} className="p-2.5 bg-white dark:bg-zinc-800 shadow-sm border dark:border-zinc-700 hover:text-violet-600 hover:border-violet-200 rounded-xl transition-all"><BookOpen size={16} /></button>
                        <button onClick={() => openModal('teacher', t)} className="p-2.5 bg-white dark:bg-zinc-800 shadow-sm border dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 rounded-xl transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => deleteMutation.mutate(t._id)} className="p-2.5 bg-white dark:bg-zinc-800 shadow-sm border dark:border-zinc-700 hover:text-red-600 hover:border-red-200 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <Suspense fallback={<Loader fullPage />}>
        {modals.teacher && (
          <TeacherModal
            isOpen={modals.teacher}
            onClose={() => setModals(prev => ({ ...prev, teacher: false }))}
            editData={selected}
            departments={departments}
          />
        )}
        {modals.assign && (
          <AssignModal
            isOpen={modals.assign}
            onClose={() => setModals(prev => ({ ...prev, assign: false }))}
            teacher={selected}
            departments={departments}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Teachers;