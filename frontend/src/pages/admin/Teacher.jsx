import { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Trash2, BookOpen, GraduationCap, Search, ChevronDown, Briefcase, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTeachers, deleteTeacher } from '../../api/index';
import { Button, Input, Modal } from '../../components/index';
import useAdminStore from '../../stores/admin';

const TeacherModal = lazy(() => import('../../components/index').then(m => ({ default: m.TeacherModal })));
const AssignModal = lazy(() => import('../../components/index').then(m => ({ default: m.AssignModal })));

const Teachers = () => {
  const queryClient = useQueryClient();
  const { departments } = useAdminStore();
  const [modals, setModals] = useState({ teacher: false, assign: false });
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
    staleTime: Infinity,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setDeleteConfirm({ open: false, id: null });
    }
  });

  const filteredTeachers = useMemo(() => {
    const query = search.toLowerCase().trim();
    return teachers.filter(t => {
      const fullName = `${t.first_name} ${t.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(query) || t.faculty_id.toLowerCase().includes(query);
      const matchesDept = filterDept ? t.dept_id === filterDept : true;
      return matchesSearch && matchesDept;
    });
  }, [teachers, search, filterDept]);

  const openModal = (type, teacher = null) => {
    setSelected(teacher);
    setModals(prev => ({ ...prev, [type]: true }));
  };

  const formatName = (str) => {
    if (!str) return "";
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const getDeptName = (id) => {
    return departments.find(d => d._id === id)?.name || 'General';
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-16 h-16 rounded-3xl bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-600/30">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter dark:text-white leading-none">Faculty <span className="text-violet-600">Base</span></h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {teachers.length} PERSONNEL INDEXED
              </p>
            </div>
          </div>
          <Button variant="primary" icon={UserPlus} onClick={() => openModal('teacher')} className="w-full md:w-auto h-14 px-10 rounded-2xl">Add Personnel</Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
          <div className="lg:col-span-8">
            <Input
              id="teacher-search"
              name="search"
              icon={Search}
              placeholder="Identify by faculty name or system ID..."
              value={search}
              onChange={setSearch}
              className="h-14 shadow-sm"
            />
          </div>
          <div className="lg:col-span-4 relative group">
            <select
              id="dept-filter"
              name="dept-filter"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full h-14 pl-5 pr-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-black text-zinc-700 dark:text-zinc-200 appearance-none outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/5 transition-all cursor-pointer shadow-sm"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-72 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 animate-pulse" />
              ))
            ) : filteredTeachers.map((t) => (
              <motion.div
                key={t._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-6 transition-all hover:shadow-2xl hover:shadow-violet-600/10 hover:border-violet-600/30"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-2xl font-black text-violet-600 border border-zinc-100 dark:border-zinc-700 shadow-inner group-hover:bg-violet-600 group-hover:text-white transition-all duration-500 uppercase">
                    {t.first_name[0]}{t.last_name[0]}
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${t.is_active !== false ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : 'bg-red-500/5 text-red-600 border-red-500/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${t.is_active !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {t.is_active !== false ? 'Active' : 'Locked'}
                  </div>
                </div>

                <div className="space-y-1.5 mb-6">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{formatName(`${t.first_name} ${t.last_name}`)}</h3>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Briefcase size={14} className="text-violet-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider truncate">{getDeptName(t.dept_id)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-zinc-50/50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/50">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Index ID</p>
                    <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">{t.faculty_id}</p>
                  </div>
                  <div className="bg-zinc-50/50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">System ID</p>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{t.email?.split('@')[0] || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    icon={BookOpen}
                    onClick={() => openModal('assign', t)}
                    className="flex-2 h-12 rounded-xl"
                  >
                    Assign Course
                  </Button>
                  <Button
                    variant="secondary"
                    icon={Edit3}
                    onClick={() => openModal('teacher', t)}
                    className="flex-1 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none"
                  />
                  <Button
                    variant="secondary"
                    icon={Trash2}
                    onClick={() => setDeleteConfirm({ open: true, id: t._id })}
                    className="flex-1 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Suspense fallback={null}>
        {modals.teacher && <TeacherModal isOpen={modals.teacher} onClose={() => setModals(p => ({ ...p, teacher: false }))} editData={selected} departments={departments} />}
        {modals.assign && <AssignModal isOpen={modals.assign} onClose={() => setModals(p => ({ ...p, assign: false }))} teacher={selected} />}
      </Suspense>

      <Modal isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} size="sm">
        <div className="text-center py-4 px-2">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-red-600 border border-red-100 dark:border-red-900 shadow-2xl">
            <Trash2 size={36} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white mb-2">Revoke Access?</h2>
          <p className="text-sm font-bold text-zinc-500 mb-8 px-6 leading-relaxed">This will delete the faculty registry and revoke all portal permissions. This action is final.</p>
          <div className="flex gap-3 px-2">
            <Button variant="ghost" className="flex-1 h-12 rounded-2xl" onClick={() => setDeleteConfirm({ open: false, id: null })}>Discard</Button>
            <Button variant="danger" className="flex-[1.5] h-12 rounded-2xl shadow-xl shadow-red-500/20" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm.id)}>Delete Registry</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Teachers;