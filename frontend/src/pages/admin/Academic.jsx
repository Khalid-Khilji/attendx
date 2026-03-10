import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Edit3, Trash2, ChevronRight, Layers, GraduationCap, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllDepartments, deleteDepartment, getAllSemesters, deleteSemester, getAllCourses, deleteCourse } from '../../api/index';
import { DepartmentModal, SemesterModal, CourseModal, Button, Loader } from '../../components/index';

const SkeletonCard = () => (
  <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-20 w-full" />
);

const Academic = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState('dept');
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [mobileView, setMobileView] = useState('dept');

  const queryClient = useQueryClient();

  const { data: departments, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments,
    retry: false,
  });

  const { data: semesters, isLoading: semsLoading } = useQuery({
    queryKey: ['semesters', selectedDept?._id],
    queryFn: () => getAllSemesters(selectedDept?._id),
    enabled: !!selectedDept?._id,
    retry: false,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', selectedSem?._id],
    queryFn: () => getAllCourses(selectedSem?._id),
    enabled: !!selectedSem?._id,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'dept') return deleteDepartment(id);
      if (type === 'sem') return deleteSemester(id);
      return deleteCourse(id);
    },
    onSuccess: (_, variables) => {
      if (variables.type === 'dept') {
        queryClient.invalidateQueries({ queryKey: ['departments'] });
        setSelectedDept(null);
        setSelectedSem(null);
        setMobileView('dept');
      }
      if (variables.type === 'sem') {
        queryClient.invalidateQueries({ queryKey: ['semesters', selectedDept?._id] });
        setSelectedSem(null);
        setMobileView('sem');
      }
      if (variables.type === 'course') {
        queryClient.invalidateQueries({ queryKey: ['courses', selectedSem?._id] });
      }
    },
  });

  const openModal = (type, item = null) => {
    setActiveModal(type);
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleDeptClick = (dept) => {
    setSelectedDept(dept);
    setSelectedSem(null);
    setMobileView('sem');
  };

  const handleSemClick = (sem) => {
    setSelectedSem(sem);
    setMobileView('course');
  };

  const DeptPanel = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Departments</span>
        <button
          onClick={() => openModal('dept')}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-violet-600 hover:text-violet-700 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-full transition-colors"
        >
          <Plus size={11} /> Add
        </button>
      </div>
      {deptsLoading ? (
        [1, 2, 3].map(i => <SkeletonCard key={i} />)
      ) : departments?.length === 0 ? (
        <div className="text-center py-10 text-zinc-300 dark:text-zinc-700">
          <GraduationCap size={28} className="mx-auto mb-2" />
          <p className="text-[10px] font-bold uppercase tracking-widest">No departments</p>
        </div>
      ) : departments?.map((dept, idx) => (
        <motion.div
          key={dept._id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04 }}
          className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${selectedDept?._id === dept._id
              ? 'border-violet-500 bg-violet-600 shadow-lg shadow-violet-200 dark:shadow-violet-900/30'
              : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700'
            }`}
        >
          <button
            onClick={() => handleDeptClick(dept)}
            className="w-full text-left px-4 py-3.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${selectedDept?._id === dept._id ? 'bg-white/20 text-white' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'
                }`}>
                {dept.name?.charAt(0).toUpperCase()}
              </div>
              <span className={`font-bold text-sm truncate ${selectedDept?._id === dept._id ? 'text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                {dept.name}
              </span>
            </div>
            <ChevronRight size={14} className={`shrink-0 transition-transform duration-200 ${selectedDept?._id === dept._id ? 'rotate-90 text-white' : 'text-zinc-300'
              }`} />
          </button>
          <div className={`flex border-t transition-all ${selectedDept?._id === dept._id ? 'border-violet-500/30' : 'border-zinc-100 dark:border-zinc-800'
            }`}>
            <button
              onClick={() => openModal('dept', dept)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${selectedDept?._id === dept._id
                  ? 'text-violet-100 hover:bg-white/10'
                  : 'text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                }`}
            >
              <Edit3 size={10} /> Edit
            </button>
            <div className={`w-px ${selectedDept?._id === dept._id ? 'bg-violet-500/30' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
            <button
              onClick={() => deleteMutation.mutate({ type: 'dept', id: dept._id })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${selectedDept?._id === dept._id
                  ? 'text-red-300 hover:bg-red-500/20'
                  : 'text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
            >
              <Trash2 size={10} /> Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const SemPanel = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Semesters</span>
          {selectedDept && <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mt-0.5 truncate">{selectedDept.name}</p>}
        </div>
        <button
          onClick={() => openModal('sem')}
          disabled={!selectedDept}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-violet-600 hover:text-violet-700 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={11} /> Add
        </button>
      </div>

      {!selectedDept ? (
        <div className="text-center py-10 text-zinc-300 dark:text-zinc-700">
          <ArrowLeft size={24} className="mx-auto mb-2" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Pick a department first</p>
        </div>
      ) : semsLoading ? (
        <div className="grid grid-cols-2 gap-2">{[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {semesters?.map((sem, idx) => (
            <motion.div
              key={sem._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${selectedSem?._id === sem._id
                  ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white'
                  : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
            >
              <button
                onClick={() => handleSemClick(sem)}
                className={`w-full py-4 font-black text-sm uppercase tracking-wider ${selectedSem?._id === sem._id ? 'text-white dark:text-zinc-900' : 'text-zinc-700 dark:text-zinc-300'
                  }`}
              >
                Sem {sem.sem_number}
              </button>
              <div className={`flex border-t ${selectedSem?._id === sem._id ? 'border-zinc-700 dark:border-zinc-200' : 'border-zinc-100 dark:border-zinc-800'
                }`}>
                <button
                  onClick={() => openModal('sem', sem)}
                  className={`flex-1 py-2 flex items-center justify-center transition-colors ${selectedSem?._id === sem._id
                      ? 'text-zinc-400 dark:text-zinc-500 hover:bg-white/10 dark:hover:bg-black/10'
                      : 'text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                    }`}
                >
                  <Edit3 size={11} />
                </button>
                <div className={`w-px ${selectedSem?._id === sem._id ? 'bg-zinc-700 dark:bg-zinc-200' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                <button
                  onClick={() => deleteMutation.mutate({ type: 'sem', id: sem._id })}
                  className={`flex-1 py-2 flex items-center justify-center transition-colors ${selectedSem?._id === sem._id
                      ? 'text-red-400 hover:bg-red-500/20'
                      : 'text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </motion.div>
          ))}
          {!semsLoading && (!semesters || semesters.length === 0) && (
            <div className="col-span-2 text-center py-8 text-zinc-300 dark:text-zinc-700">
              <p className="text-[10px] font-bold uppercase tracking-widest">No semesters yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const CoursePanel = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight dark:text-white leading-none">
              {selectedDept?.name}
            </h2>
            <p className="text-[10px] font-bold uppercase text-violet-500 mt-0.5 tracking-widest">
              Semester {selectedSem?.sem_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800 uppercase tracking-widest whitespace-nowrap">
            {courses?.length || 0} courses
          </span>
          <button
            onClick={() => openModal('course')}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-colors"
          >
            <Plus size={11} /> Add
          </button>
        </div>
      </div>

      {coursesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-36" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses?.map((course, idx) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-violet-200 dark:hover:border-violet-800/50 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center text-xs font-black mb-3">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight text-zinc-900 dark:text-white leading-snug">
                  {course.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Registered</span>
                </div>
              </div>
              <div className="flex border-t-2 border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => openModal('course', course)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                >
                  <Edit3 size={11} /> Edit
                </button>
                <div className="w-0.5 bg-zinc-100 dark:bg-zinc-800" />
                <button
                  onClick={() => deleteMutation.mutate({ type: 'course', id: course._id })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </motion.div>
          ))}

          {!coursesLoading && courses?.length === 0 && (
            <div className="col-span-full text-center py-16 text-zinc-300 dark:text-zinc-700">
              <BookOpen size={32} className="mx-auto mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No courses yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-350 mx-auto">

        <header className="mb-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white">
              Academic <span className="text-violet-600">Portal</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-0.5">
              {selectedDept ? selectedDept.name : 'All Departments'}
              {selectedSem ? ` · Semester ${selectedSem.sem_number}` : ''}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <span className={selectedDept ? 'text-violet-600' : ''}>Departments</span>
            <ChevronRight size={12} />
            <span className={selectedSem ? 'text-violet-600' : ''}>Semesters</span>
            <ChevronRight size={12} />
            <span className={selectedSem ? 'text-zinc-600 dark:text-zinc-300' : ''}>Courses</span>
          </div>
        </header>

        <div className="lg:hidden mb-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-1 flex gap-1">
            {[
              { key: 'dept', label: 'Depts', canAccess: true },
              { key: 'sem', label: 'Sems', canAccess: !!selectedDept },
              { key: 'course', label: 'Courses', canAccess: !!selectedSem },
            ].map(({ key, label, canAccess }) => (
              <button
                key={key}
                onClick={() => canAccess && setMobileView(key)}
                disabled={!canAccess}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${mobileView === key
                    ? 'bg-violet-600 text-white shadow-sm'
                    : canAccess
                      ? 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      : 'text-zinc-200 dark:text-zinc-700 cursor-not-allowed'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-5">

          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm">
              <DeptPanel />
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm min-h-75">
              <SemPanel />
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm min-h-75">
              {!selectedSem ? (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-300 dark:text-zinc-700">
                  <Layers size={36} className="mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-center">
                    {!selectedDept ? 'Select a department to begin' : 'Select a semester to view courses'}
                  </p>
                </div>
              ) : (
                <CoursePanel />
              )}
            </div>
          </div>

          <div className="lg:hidden col-span-full">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm min-h-100">
              <AnimatePresence mode="wait">
                {mobileView === 'dept' && (
                  <motion.div key="dept-mobile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                    <DeptPanel />
                  </motion.div>
                )}
                {mobileView === 'sem' && (
                  <motion.div key="sem-mobile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.18 }}>
                    <SemPanel />
                  </motion.div>
                )}
                {mobileView === 'course' && (
                  <motion.div key="course-mobile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.18 }}>
                    {selectedSem ? <CoursePanel /> : (
                      <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-700">
                        <Layers size={32} className="mb-3" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Select a semester first</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      <DepartmentModal isOpen={isModalOpen && activeModal === 'dept'} onClose={() => setIsModalOpen(false)} editData={editItem} />
      <SemesterModal isOpen={isModalOpen && activeModal === 'sem'} onClose={() => setIsModalOpen(false)} editData={editItem} deptId={selectedDept?._id} />
      <CourseModal isOpen={isModalOpen && activeModal === 'course'} onClose={() => setIsModalOpen(false)} editData={editItem} semId={selectedSem?._id} />
    </div>
  );
};

export default Academic;