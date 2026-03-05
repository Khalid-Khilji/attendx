import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Edit3, Trash2, ChevronRight, Filter, Layers } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllDepartments, deleteDepartment, getAllSemesters, deleteSemester, getAllCourses, deleteCourse } from '../../api/academics';
import { DepartmentModal, SemesterModal, CourseModal, Button, Loader } from '../../components/index'

const Academic = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState('dept');
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const queryClient = useQueryClient();

  const { data: departments, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments
  });

  const { data: semesters, isLoading: semsLoading } = useQuery({
    queryKey: ['semesters', selectedDept?._id],
    queryFn: () => getAllSemesters(selectedDept?._id),
    enabled: !!selectedDept
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', selectedDept?._id, selectedSem?._id],
    queryFn: () => getAllCourses(selectedDept?._id, selectedSem?._id),
    enabled: !!selectedDept && !!selectedSem
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'dept') return deleteDepartment(id);
      if (type === 'sem') return deleteSemester(id);
      return deleteCourse(id);
    },
    onSuccess: (_, variables) => {
      if (variables.type === 'dept') {
        queryClient.invalidateQueries(['departments']);
        setSelectedDept(null);
        setSelectedSem(null);
      } else if (variables.type === 'sem') {
        queryClient.invalidateQueries(['semesters']);
        setSelectedSem(null);
      } else {
        queryClient.invalidateQueries(['courses']);
      }
    }
  });

  const openModal = (type, item = null) => {
    setActiveModal(type);
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 pb-12 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter dark:text-white leading-none">
              Academic <span className="italic text-violet-600">Flow</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2 flex items-center gap-2">
              <Filter size={12} /> Hierarchy: Dept → Sem → Course
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={Plus} onClick={() => openModal('dept')}>Dept</Button>
            <Button variant="outline" size="sm" icon={Plus} onClick={() => openModal('sem')} disabled={!selectedDept}>Sem</Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => openModal('course')} disabled={!selectedSem}>Course</Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 px-2">Departments</h2>
              <div className="space-y-2">
                {deptsLoading ? <Loader size="sm" /> : departments?.map(dept => (
                  <div key={dept._id} className="group relative">
                    <button
                      onClick={() => { setSelectedDept(dept); setSelectedSem(null); }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedDept?._id === dept._id ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-violet-500/50'}`}
                    >
                      <span className="font-bold uppercase text-xs tracking-tight">{dept.name}</span>
                      <ChevronRight size={14} className={selectedDept?._id === dept._id ? 'opacity-100' : 'opacity-0'} />
                    </button>
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openModal('dept', dept)} className="p-1.5 text-zinc-400 hover:text-white"><Edit3 size={12} /></button>
                      <button onClick={() => deleteMutation.mutate({ type: 'dept', id: dept._id })} className="p-1.5 text-zinc-400 hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <AnimatePresence>
              {selectedDept && (
                <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 px-2">Semesters</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {semsLoading ? <div className="col-span-2"><Loader size="sm" /></div> : semesters?.map(sem => (
                      <div key={sem._id} className="relative group">
                        <button
                          onClick={() => setSelectedSem(sem)}
                          className={`w-full p-3 rounded-xl border text-center transition-all ${selectedSem?._id === sem._id ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500'}`}
                        >
                          <span className="text-[10px] font-black italic">SEM {sem.sem_number}</span>
                        </button>
                        <button onClick={() => deleteMutation.mutate({ type: 'sem', id: sem._id })} className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"><Trash2 size={10} /></button>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {!selectedSem ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-100 flex flex-col items-center justify-center bg-white dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center p-8">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-400">
                    <Layers size={32} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Empty Selection</h3>
                  <p className="text-xs text-zinc-500 font-medium max-w-xs mt-2 uppercase tracking-widest leading-relaxed">Select a department and semester to manage its specific courses.</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={selectedSem._id}>
                  <div className="flex items-center justify-between mb-8 px-4">
                    <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-3">
                      <BookOpen className="text-violet-600" />
                      Courses <span className="italic text-violet-600">Sem {selectedSem.sem_number}</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coursesLoading ? <Loader /> : courses?.map((course, idx) => (
                      <motion.div key={course._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="group bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 hover:shadow-2xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <h4 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">{course.name}</h4>
                          <div className="flex gap-2">
                            <button onClick={() => openModal('course', course)} className="p-2 text-zinc-400 hover:text-violet-600"><Edit3 size={16} /></button>
                            <button onClick={() => deleteMutation.mutate({ type: 'course', id: course._id })} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {course.teachers?.map((t, i) => (
                            <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{t}</span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {activeModal === 'dept' && <DepartmentModal isOpen={isModalOpen} onClose={handleCloseModal} editData={editItem} />}
      {activeModal === 'sem' && <SemesterModal isOpen={isModalOpen} onClose={handleCloseModal} editData={editItem} deptId={selectedDept?._id} />}
      {activeModal === 'course' && <CourseModal isOpen={isModalOpen} onClose={handleCloseModal} editData={editItem} semId={selectedSem?._id} />}
    </div>
  );
};

export default Academic;