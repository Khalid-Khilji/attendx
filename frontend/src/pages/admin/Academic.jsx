import { useState, lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit3, Trash2, ChevronRight, Layers,
  Calendar, ChevronDown, Check, ToggleLeft,
  ToggleRight, Info, AlertTriangle, X, Hash
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteDepartment, deleteSemester, deleteCourse,
  deleteAcademicYear, getAllSemesters, getAllCourses,
  updateAcademicYear, getSemBatches, deleteBatch
} from '../../api/index';
import { Button, Loader, Modal } from '../../components/index';
import useAdminStore from '../../stores/admin';

const DepartmentModal = lazy(() => import('../../components/index').then(m => ({ default: m.DepartmentModal })));
const SemesterModal = lazy(() => import('../../components/index').then(m => ({ default: m.SemesterModal })));
const CourseModal = lazy(() => import('../../components/index').then(m => ({ default: m.CourseModal })));
const AcademicYearModal = lazy(() => import('../../components/index').then(m => ({ default: m.AcademicYearModal })));
const BatchModal = lazy(() => import('../../components/index').then(m => ({ default: m.BatchModal })));

const Academic = () => {
  const queryClient = useQueryClient();
  const { departments, academicYears, setSemesters, setCourses, updateLocalData, getCurrentYear } = useAdminStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState('dept');
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [ayDropdown, setAyDropdown] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null });

  const { data: semesters = [], isLoading: semsLoading } = useQuery({
    queryKey: ['semesters', selectedDept?._id],
    queryFn: () => getAllSemesters(selectedDept?._id),
    enabled: !!selectedDept?._id,
    staleTime: Infinity,
    onSuccess: (data) => setSemesters(data)
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', selectedSem?._id],
    queryFn: () => getAllCourses(selectedSem?._id),
    enabled: !!selectedSem?._id,
    staleTime: Infinity,
    onSuccess: (data) => setCourses(data)
  });

  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ['batches', selectedSem?._id],
    queryFn: () => getSemBatches(selectedSem?._id),
    enabled: !!selectedSem?._id,
    staleTime: Infinity,
  });

  const currentYear = useMemo(() => getCurrentYear(), [academicYears]);

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }) => {
      const actions = { dept: deleteDepartment, sem: deleteSemester, course: deleteCourse, ay: deleteAcademicYear, batch: deleteBatch };
      return actions[type](id);
    },
    onSuccess: (_, v) => {
      if (v.type !== 'batch') updateLocalData(v.type, 'delete', v.id);
      queryClient.invalidateQueries({ queryKey: [v.type === 'ay' ? 'academic-years' : v.type + 's', selectedSem?._id] });
      setDeleteConfirm({ open: false, type: null, id: null });
    }
  });

  const setYearMutation = useMutation({
    mutationFn: (id) => updateAcademicYear(id, { is_current: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setAyDropdown(false);
    }
  });

  const openModal = (type, item = null) => {
    setActiveModal(type);
    setEditItem(item);
    setIsModalOpen(true);
  };

  const capitalize = (str) => str ? str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : "";

  const ActionOverlay = ({ type, item }) => (
    <AnimatePresence>
      {showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[2px] flex items-center justify-center gap-2 rounded-[inherit]"
        >
          {type !== 'batch' && (
            <Button
              variant="secondary"
              size="sm"
              className="w-8 h-8 p-0! rounded-lg bg-white dark:bg-zinc-800 text-violet-600 shadow-md border border-zinc-200 dark:border-zinc-700 hover:scale-110"
              icon={Edit3}
              onClick={(e) => { e.stopPropagation(); openModal(type, item); }}
            />
          )}
          <Button
            variant="secondary"
            size="sm"
            className="w-8 h-8 p-0! rounded-lg bg-white dark:bg-zinc-800 text-red-500 shadow-md border border-zinc-200 dark:border-zinc-700 hover:scale-110"
            icon={Trash2}
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, type, id: item._id }); }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Layers size={20} />
            </div>
            <h1 className="text-lg font-black uppercase dark:text-white leading-none tracking-tighter">Academic <span className="text-violet-600">Core</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant={showControls ? 'primary' : 'ghost'} size="sm" icon={showControls ? ToggleRight : ToggleLeft} onClick={() => setShowControls(!showControls)} className="rounded-xl border-zinc-200">Edit Mode</Button>
            <div className="relative">
              <Button variant="secondary" size="sm" onClick={() => setAyDropdown(!ayDropdown)} className="bg-violet-50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-800 text-violet-700 rounded-xl" icon={Calendar}>{currentYear?.label || 'Session'}<ChevronDown size={14} className={`ml-1 transition-transform duration-300 ${ayDropdown ? 'rotate-180' : ''}`} /></Button>
              <AnimatePresence>
                {ayDropdown && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden p-1.5">
                    <div className="p-2 border-b dark:border-zinc-800 flex justify-between items-center mb-1"><span className="text-[9px] font-black uppercase text-zinc-400">Sessions</span><Button variant="secondary" size="sm" className="h-6 w-6 p-0 rounded-md border-none bg-transparent" icon={Plus} onClick={() => openModal('ay')} /></div>
                    {academicYears.map((ay) => (
                      <div key={ay._id} className="flex items-center gap-3 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl relative group">
                        <button onClick={() => setYearMutation.mutate(ay._id)} className={`w-4 h-4 rounded-full border-2 shrink-0 ${ay.is_current ? 'bg-violet-600 border-violet-600' : 'border-zinc-300'}`}>{ay.is_current && <Check size={8} className="text-white mx-auto" />}</button>
                        <p className="flex-1 text-xs font-bold dark:text-white truncate cursor-pointer" onClick={() => setYearMutation.mutate(ay._id)}>{ay.label}</p>
                        <ActionOverlay type="ay" item={ay} />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <aside className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Departments</span><Button variant="secondary" size="sm" className="h-6 w-6 p-0 rounded-lg" icon={Plus} onClick={() => openModal('dept')} /></div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto hide-scrollbar pr-1">
              {departments.map((dept) => (
                <div key={dept._id} className="relative group rounded-2xl">
                  <div onClick={() => { setSelectedDept(dept); setSelectedSem(null); }} className={`p-4 border-2 cursor-pointer transition-all duration-300 flex justify-between items-center rounded-2xl ${selectedDept?._id === dept._id ? 'border-violet-600 bg-violet-600 text-white shadow-lg' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-200'}`}>
                    <div className="min-w-0 pr-4"><p className={`text-[10px] font-black uppercase tracking-tighter ${selectedDept?._id === dept._id ? 'text-violet-200' : 'text-violet-600'}`}>{dept.short_name?.toUpperCase()}</p><p className="font-bold text-xs truncate mt-0.5">{capitalize(dept.name)}</p></div>
                    {selectedDept?._id === dept._id ? <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg border-none hover:bg-white/20" icon={X} onClick={(e) => { e.stopPropagation(); setSelectedDept(null); setSelectedSem(null); }} /> : <ChevronRight size={16} className={selectedDept?._id === dept._id ? 'text-white' : 'text-zinc-300'} />}
                  </div>
                  <ActionOverlay type="dept" item={dept} />
                </div>
              ))}
            </div>
          </aside>

          <section className="md:col-span-8 lg:col-span-3 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Levels</span><Button variant="secondary" size="sm" className="h-6 w-6 p-0 rounded-lg" icon={Plus} disabled={!selectedDept} onClick={() => openModal('sem')} /></div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {!selectedDept ? <div className="p-8 text-center bg-zinc-100/50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800"><Info size={20} className="mx-auto text-zinc-300 mb-2" /><p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Select Dept</p></div> : semsLoading ? [1, 2, 3].map(i => <Loader key={i} variant="skeleton" className="h-20 w-full" />) : semesters.map((sem) => (
                  <div key={sem._id} className="relative group rounded-3xl">
                    <div onClick={() => setSelectedSem(sem)} className={`p-5 border-2 cursor-pointer transition-all duration-300 flex items-center justify-between rounded-3xl ${selectedSem?._id === sem._id ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}`}><p className="text-2xl font-black">Sem {sem.sem_number}</p>{selectedSem?._id === sem._id && <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg border-none hover:bg-white/10 dark:hover:bg-zinc-100" icon={X} onClick={(e) => { e.stopPropagation(); setSelectedSem(null); }} />}</div>
                    <ActionOverlay type="sem" item={sem} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Batches</span><Button variant="secondary" size="sm" className="h-6 w-6 p-0 rounded-lg" icon={Plus} disabled={!selectedSem} onClick={() => openModal('batch')} /></div>
              <div className="flex flex-wrap gap-2">
                {!selectedSem ? <div className="w-full p-4 text-center bg-zinc-100/30 dark:bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800"><p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Select Sem</p></div> : batchesLoading ? <Loader variant="skeleton" className="h-10 w-full" /> : batches.map((b) => (
                  <div key={b._id} className="group relative px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[10px] font-black uppercase text-violet-600 flex items-center gap-2 hover:border-violet-200 transition-all">
                    <Hash size={10} /> {b.name}
                    <ActionOverlay type="batch" item={b} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <main className="md:col-span-12 lg:col-span-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 md:p-8 min-h-[60vh] shadow-sm relative overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedSem ? (
                <motion.div key="course-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b dark:border-zinc-800 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center font-black shadow-inner">0{selectedSem.sem_number}</div>
                      <div><h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">{capitalize(selectedDept.name)}</h2><p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2">Active Curriculum</p></div>
                    </div>
                    <Button variant="primary" size="sm" icon={Plus} onClick={() => openModal('course')} className="w-full sm:w-auto rounded-xl">Add Course</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coursesLoading ? [1, 2].map(i => <Loader key={i} variant="skeleton" className="h-28 w-full" />) : courses.map((course) => (
                      <div key={course._id} className="p-5 rounded-2xl border-2 border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20 transition-all hover:border-violet-200 dark:hover:border-violet-500/30 relative group">
                        <div className="flex justify-between items-start mb-3"><span className="text-[9px] font-black text-violet-600 bg-violet-100/50 dark:bg-violet-900/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">{course.course_code}</span></div>
                        <h3 className="font-bold text-sm uppercase leading-tight dark:text-white">{capitalize(course.name)}</h3>
                        <div className="mt-4 flex items-center gap-2 text-zinc-400"><div className="w-1.5 h-1.5 rounded-full bg-zinc-300" /><span className="text-[10px] font-bold uppercase tracking-widest">{course.short_name?.toUpperCase() || 'CORE'}</span></div>
                        <ActionOverlay type="course" item={course} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-300 py-32 space-y-4 opacity-50"><div className="w-24 h-24 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center shadow-inner border border-zinc-100 dark:border-zinc-800/50"><Layers size={48} strokeWidth={1} /></div><div className="text-center"><p className="text-[10px] font-black uppercase tracking-[0.4em]">Resource Engine</p><p className="text-[9px] font-bold text-zinc-400 mt-2">Select department and semester levels</p></div></div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Suspense fallback={<Loader fullPage />}>
        {isModalOpen && (
          <>
            {activeModal === 'dept' && <DepartmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editData={editItem} />}
            {activeModal === 'sem' && <SemesterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editData={editItem} deptId={selectedDept?._id} />}
            {activeModal === 'course' && <CourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editData={editItem} semId={selectedSem?._id} />}
            {activeModal === 'ay' && <AcademicYearModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editData={editItem} />}
            {activeModal === 'batch' && <BatchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} semId={selectedSem?._id} />}
          </>
        )}
      </Suspense>

      <Modal isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, type: null, id: null })} size="sm">
        <div className="text-center py-4 px-2">
          <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 dark:border-red-900/50"><AlertTriangle size={32} /></div>
          <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white mb-2">Purge Registry?</h3>
          <p className="text-sm font-bold text-zinc-500 mb-8 px-4 leading-relaxed">This record and all its associated data will be permanently revoked from the system core.</p>
          <div className="flex gap-3"><Button variant="ghost" className="flex-1 h-12 rounded-2xl font-black uppercase" onClick={() => setDeleteConfirm({ open: false, type: null, id: null })}>Cancel</Button><Button variant="danger" className="flex-[1.5] h-12 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-500/20" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate({ type: deleteConfirm.type, id: deleteConfirm.id })}>Delete</Button></div>
        </div>
      </Modal>
    </div>
  );
};

export default Academic;