import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Edit3, Trash2, ChevronRight, Layers, Calendar, ChevronDown, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllDepartments, deleteDepartment,
  getAllSemesters, deleteSemester,
  getAllCourses, deleteCourse,
  getAllAcademicYears, updateAcademicYear, deleteAcademicYear
} from '../../api/index';
import { Modal, Input, Button, Loader } from '../../components/index';

const DepartmentModal = lazy(() => import('../../components/index').then(m => ({ default: m.DepartmentModal })));
const SemesterModal = lazy(() => import('../../components/index').then(m => ({ default: m.SemesterModal })));
const CourseModal = lazy(() => import('../../components/index').then(m => ({ default: m.CourseModal })));
const AcademicYearModal = lazy(() => import('../../components/index').then(m => ({ default: m.AcademicYearModal })));

const SkeletonCard = () => (
  <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl h-20 w-full" />
);

const Academic = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState('dept');
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [mobileView, setMobileView] = useState('dept');
  const [ayDropdown, setAyDropdown] = useState(false);

  const { data: years = [] } = useQuery({ queryKey: ['academic-years'], queryFn: getAllAcademicYears });
  const { data: departments, isLoading: deptsLoading } = useQuery({ queryKey: ['departments'], queryFn: getAllDepartments });

  const { data: semesters, isLoading: semsLoading } = useQuery({
    queryKey: ['semesters', selectedDept?._id],
    queryFn: () => getAllSemesters(selectedDept?._id),
    enabled: !!selectedDept?._id
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', selectedSem?._id],
    queryFn: () => getAllCourses(selectedSem?._id),
    enabled: !!selectedSem?._id
  });

  const currentYear = useMemo(() => years.find(y => y.is_current), [years]);

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }) => {
      const actions = { dept: deleteDepartment, sem: deleteSemester, course: deleteCourse, ay: deleteAcademicYear };
      return actions[type](id);
    },
    onSuccess: (_, variables) => {
      const keys = { dept: 'departments', sem: 'semesters', course: 'courses', ay: 'academic-years' };
      queryClient.invalidateQueries({ queryKey: [keys[variables.type]] });
    }
  });

  const setCurrentAYMutation = useMutation({
    mutationFn: (ay) => updateAcademicYear(ay._id, { is_current: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academic-years'] })
  });

  const openModal = (type, item = null) => {
    setActiveModal(type);
    setEditItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-4xl border border-zinc-100 dark:border-zinc-800 px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Layers size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter dark:text-white leading-none">Portal <span className="text-violet-600">Core</span></h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Architecture</p>
            </div>
          </div>

          <div className="relative">
            <button onClick={() => setAyDropdown(!ayDropdown)} className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50 px-3 py-2 rounded-xl hover:bg-violet-100 transition-colors">
              <Calendar size={13} className="text-violet-600" />
              <span className="text-xs font-black text-violet-700 dark:text-violet-400">{currentYear?.label || 'No Year'}</span>
              <ChevronDown size={12} className={`text-violet-500 transition-transform ${ayDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {ayDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAyDropdown(false)} />
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-zinc-400">Years</span>
                      <Button size="sm" variant="ghost" onClick={() => { openModal('ay'); setAyDropdown(false); }} icon={Plus} className="h-7 w-7 p-0!" />
                    </div>
                    <div className="max-h-60 overflow-y-auto hide-scrollbar">
                      {years.map((ay) => (
                        <div key={ay._id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group">
                          <button onClick={() => setCurrentAYMutation.mutate(ay)} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${ay.is_current ? 'bg-violet-600 border-violet-600' : 'border-zinc-300'}`}>
                            {ay.is_current && <Check size={9} className="text-white" />}
                          </button>
                          <div className="flex-1 min-w-0" onClick={() => setCurrentAYMutation.mutate(ay)}>
                            <p className="text-xs font-bold dark:text-zinc-200 truncate">{ay.label}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal('ay', ay)} className="p-1 hover:text-violet-600"><Edit3 size={11} /></button>
                            <button onClick={() => deleteMutation.mutate({ type: 'ay', id: ay._id })} className="p-1 hover:text-red-500"><Trash2 size={11} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="lg:hidden mb-6 flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {['dept', 'sem', 'course'].map((view) => (
            <button key={view} onClick={() => setMobileView(view)} disabled={(view === 'sem' && !selectedDept) || (view === 'course' && !selectedSem)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileView === view ? 'bg-white dark:bg-zinc-800 text-violet-600 shadow-sm' : 'text-zinc-400'}`}>
              {view}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`${mobileView === 'dept' ? 'block' : 'hidden'} lg:block lg:col-span-3 space-y-4`}>
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Departments</span>
              <Button size="sm" variant="ghost" onClick={() => openModal('dept')} icon={Plus} className="h-8 w-8 p-0! rounded-full" />
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto hide-scrollbar pr-1">
              <Suspense fallback={<SkeletonCard />}>
                {deptsLoading ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />) : departments?.map((dept) => (
                  <div key={dept._id} className="group relative">
                    <div onClick={() => { setSelectedDept(dept); setSelectedSem(null); setMobileView('sem'); }} className={`p-4 rounded-3xl border-2 cursor-pointer transition-all ${selectedDept?._id === dept._id ? 'border-violet-600 bg-violet-600 text-white shadow-lg' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm uppercase truncate">{dept.short_name || dept.name}</span>
                        <ChevronRight size={14} className={selectedDept?._id === dept._id ? 'text-white' : 'text-zinc-300'} />
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={(e) => { e.stopPropagation(); openModal('dept', dept); }} className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-zinc-500 hover:text-violet-600 border dark:border-zinc-700"><Edit3 size={11} /></button>
                    </div>
                  </div>
                ))}
              </Suspense>
            </div>
          </motion.aside>

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${mobileView === 'sem' ? 'block' : 'hidden'} lg:block lg:col-span-3 space-y-4`}>
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Semesters</span>
              <Button size="sm" variant="ghost" disabled={!selectedDept} onClick={() => openModal('sem')} icon={Plus} className="h-8 w-8 p-0! rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Suspense fallback={<SkeletonCard />}>
                {semsLoading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : semesters?.map((sem) => (
                  <div key={sem._id} className="group relative">
                    <div onClick={() => { setSelectedSem(sem); setMobileView('course'); }} className={`p-5 rounded-4xl border-2 text-center cursor-pointer transition-all ${selectedSem?._id === sem._id ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-200'}`}>
                      <p className="text-xs font-black uppercase italic opacity-60">Sem</p>
                      <p className="text-2xl font-black mt-1">{sem.sem_number}</p>
                    </div>
                    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openModal('sem', sem); }} className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-zinc-500 border dark:border-zinc-700"><Edit3 size={10} /></button>
                    </div>
                  </div>
                ))}
              </Suspense>
            </div>
          </motion.section>

          <motion.main initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`${mobileView === 'course' ? 'block' : 'hidden'} lg:block lg:col-span-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 min-h-[60vh] shadow-sm relative overflow-hidden`}>
            <AnimatePresence mode="wait">
              {selectedSem ? (
                <motion.div key="course-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center font-black">{selectedSem.sem_number}</div>
                      <h2 className="text-xl font-black uppercase tracking-tight dark:text-white truncate max-w-62.5">{selectedDept.name}</h2>
                    </div>
                    <Button size="sm" icon={Plus} onClick={() => openModal('course')}>Add</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Suspense fallback={<Loader />}>
                      {coursesLoading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : courses?.map((course) => (
                        <div key={course._id} className="p-5 rounded-3xl border-2 border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 group hover:border-violet-200 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[9px] font-black text-violet-600 bg-violet-50 dark:bg-violet-950 px-2 py-1 rounded-lg uppercase">{course.course_code}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openModal('course', course)} className="text-zinc-400 hover:text-violet-600"><Edit3 size={14} /></button>
                              <button onClick={() => deleteMutation.mutate({ type: 'course', id: course._id })} className="text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                          </div>
                          <h3 className="font-black text-sm uppercase tracking-tight dark:text-white leading-snug">{course.name}</h3>
                        </div>
                      ))}
                    </Suspense>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-300 py-32 opacity-40">
                  <Layers size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select Parameters</p>
                </div>
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>

      <Suspense fallback={<Loader fullPage />}>
        {isModalOpen && activeModal === 'dept' && <DepartmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editData={editItem} />}
        {isModalOpen && activeModal === 'sem' && <SemesterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editData={editItem} deptId={selectedDept?._id} />}
        {isModalOpen && activeModal === 'course' && <CourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editData={editItem} semId={selectedSem?._id} />}
        {isModalOpen && activeModal === 'ay' && <AcademicYearModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editData={editItem} />}
      </Suspense>
    </div>
  );
};

export default Academic;