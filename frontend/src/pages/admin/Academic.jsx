import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Edit3, Trash2, ChevronRight, Layers, GraduationCap, ArrowLeft, Calendar, ChevronDown, Check, Hash, Tag } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAllDepartments, deleteDepartment, getAllSemesters, deleteSemester, getAllCourses, deleteCourse, getAllAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear } from '../../api/index';
import { DepartmentModal, SemesterModal, CourseModal, Modal, Input, Button } from '../../components/index';

const SkeletonCard = () => (
  <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-20 w-full" />
);

const SkeletonCourseCard = () => (
  <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-48 w-full" />
);

const AcademicYearModal = ({ isOpen, onClose, editData = null }) => {
  const [formData, setFormData] = useState({
    label: editData?.label || '',
    start_date: editData?.start_date?.split('T')[0] || '',
    end_date: editData?.end_date?.split('T')[0] || '',
    is_current: editData?.is_current || false,
  });

  const mutation = useMutation({
    mutationFn: (data) => editData ? updateAcademicYear(editData._id, data) : createAcademicYear(data),
    onSuccess: () => {
      onClose();
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
        {editData ? 'Update' : 'New'} Academic Year
      </h2>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
        <Input label="Label (e.g. 2024-25)" value={formData.label} onChange={(v) => setFormData({ ...formData, label: v })} required />
        <Input label="Start Date" type="date" value={formData.start_date} onChange={(v) => setFormData({ ...formData, start_date: v })} required />
        <Input label="End Date" type="date" value={formData.end_date} onChange={(v) => setFormData({ ...formData, end_date: v })} required />
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setFormData({ ...formData, is_current: !formData.is_current })}
            className={`w-10 h-5 rounded-full transition-colors relative ${formData.is_current ? 'bg-violet-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
          >
            <div className={`absolute top-0 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.is_current ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Set as Current Year</span>
        </label>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" isLoading={mutation.isPending}>{editData ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
};

const AcademicYearHeader = () => {
  const [open, setOpen] = useState(false);
  const [ayModal, setAyModal] = useState(false);
  const [editAY, setEditAY] = useState(null);

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: getAllAcademicYears,
  });

  const currentYear = years.find(y => y.is_current);

  const deleteMutation = useMutation({
    mutationFn: deleteAcademicYear,
  });

  const setCurrentMutation = useMutation({
    mutationFn: (ay) => updateAcademicYear(ay._id, { is_current: true }),
  });

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50 px-3 py-2 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
        >
          <Calendar size={13} className="text-violet-600" />
          <span className="text-xs font-black text-violet-700 dark:text-violet-400">
            {currentYear ? currentYear.label : 'No Year Set'}
          </span>
          <ChevronDown size={12} className={`text-violet-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Academic Years</span>
                  <button
                    onClick={() => { setEditAY(null); setAyModal(true); setOpen(false); }}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-violet-600 hover:text-violet-700 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-full"
                  >
                    <Plus size={10} /> New
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {years.length === 0 ? (
                    <div className="py-8 text-center text-zinc-300 dark:text-zinc-700">
                      <p className="text-[10px] font-bold uppercase tracking-widest">No years yet</p>
                    </div>
                  ) : years.map((ay) => (
                    <div key={ay._id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group">
                      <button onClick={() => setCurrentMutation.mutate(ay)} className="shrink-0">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${ay.is_current ? 'bg-violet-600 border-violet-600' : 'border-zinc-300 dark:border-zinc-600'}`}>
                          {ay.is_current && <Check size={9} className="text-white" />}
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{ay.label}</p>
                        <p className="text-[9px] text-zinc-400">{ay.start_date?.split('T')[0]} → {ay.end_date?.split('T')[0]}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditAY(ay); setAyModal(true); setOpen(false); }} className="p-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-zinc-400 hover:text-violet-600">
                          <Edit3 size={11} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(ay._id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <AcademicYearModal isOpen={ayModal} onClose={() => setAyModal(false)} editData={editAY} />
    </>
  );
};

const Academic = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState('dept');
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [mobileView, setMobileView] = useState('dept');

  const { data: departments, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments,
  });

  const { data: semesters, isLoading: semsLoading } = useQuery({
    queryKey: ['semesters', selectedDept?._id],
    queryFn: () => getAllSemesters(selectedDept?._id),
    enabled: !!selectedDept?._id,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', selectedSem?._id],
    queryFn: () => getAllCourses(selectedSem?._id),
    enabled: !!selectedSem?._id,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'dept') return deleteDepartment(id);
      if (type === 'sem') return deleteSemester(id);
      return deleteCourse(id);
    },
  });

  const openModal = (type, item = null) => { setActiveModal(type); setEditItem(item); setIsModalOpen(true); };
  const handleDeptClick = (dept) => { setSelectedDept(dept); setSelectedSem(null); setMobileView('sem'); };
  const handleSemClick = (sem) => { setSelectedSem(sem); setMobileView('course'); };

  const DeptPanel = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Departments</span>
        <button onClick={() => openModal('dept')} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-violet-600 hover:text-violet-700 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-full transition-colors">
          <Plus size={11} /> Add
        </button>
      </div>
      {deptsLoading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) :
        departments?.length === 0 ? (
          <div className="text-center py-10 text-zinc-300 dark:text-zinc-700">
            <GraduationCap size={28} className="mx-auto mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No departments</p>
          </div>
        ) : departments?.map((dept, idx) => {
          const deptName = dept.name?.charAt(0).toUpperCase() + dept.name?.slice(1);
          return (
            <motion.div key={dept._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
              className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${selectedDept?._id === dept._id ? 'border-violet-500 bg-violet-600 shadow-lg shadow-violet-200 dark:shadow-violet-900/30' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700'}`}>
              <button onClick={() => handleDeptClick(dept)} className="w-full text-left px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${selectedDept?._id === dept._id ? 'bg-white/20 text-white' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'}`}>
                    {dept.short_name || dept.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className={`font-bold text-sm truncate ${selectedDept?._id === dept._id ? 'text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>{deptName}</span>
                </div>
                <ChevronRight size={14} className={`shrink-0 transition-transform duration-200 ${selectedDept?._id === dept._id ? 'rotate-90 text-white' : 'text-zinc-300'}`} />
              </button>
              <div className={`flex border-t ${selectedDept?._id === dept._id ? 'border-violet-500/30' : 'border-zinc-100 dark:border-zinc-800'}`}>
                <button onClick={() => openModal('dept', dept)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${selectedDept?._id === dept._id ? 'text-violet-100 hover:bg-white/10' : 'text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20'}`}>
                  <Edit3 size={10} /> Edit
                </button>
                <div className={`w-px ${selectedDept?._id === dept._id ? 'bg-violet-500/30' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                <button onClick={() => deleteMutation.mutate({ type: 'dept', id: dept._id })} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${selectedDept?._id === dept._id ? 'text-red-300 hover:bg-red-500/20' : 'text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                  <Trash2 size={10} /> Delete
                </button>
              </div>
            </motion.div>
          );
        })}
    </div>
  );

  const SemPanel = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Semesters</span>
          {selectedDept && <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mt-0.5 truncate">{selectedDept.name}</p>}
        </div>
        <button onClick={() => openModal('sem')} disabled={!selectedDept} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-violet-600 hover:text-violet-700 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
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
            <motion.div key={sem._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
              className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${selectedSem?._id === sem._id ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-600'}`}>
              <button onClick={() => handleSemClick(sem)} className={`w-full py-4 font-black text-sm uppercase tracking-wider ${selectedSem?._id === sem._id ? 'text-white dark:text-zinc-900' : 'text-zinc-700 dark:text-zinc-300'}`}>
                Semester {sem.sem_number}
              </button>
              <div className={`flex border-t ${selectedSem?._id === sem._id ? 'border-zinc-700 dark:border-zinc-200' : 'border-zinc-100 dark:border-zinc-800'}`}>
                <button onClick={() => openModal('sem', sem)} className={`flex-1 py-2 flex items-center justify-center transition-colors ${selectedSem?._id === sem._id ? 'text-zinc-400 dark:text-zinc-500 hover:bg-white/10 dark:hover:bg-black/10' : 'text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20'}`}>
                  <Edit3 size={11} />
                </button>
                <div className={`w-px ${selectedSem?._id === sem._id ? 'bg-zinc-700 dark:bg-zinc-200' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                <button onClick={() => deleteMutation.mutate({ type: 'sem', id: sem._id })} className={`flex-1 py-2 flex items-center justify-center transition-colors ${selectedSem?._id === sem._id ? 'text-red-400 hover:bg-red-500/20' : 'text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
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
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black uppercase tracking-tight dark:text-white leading-none truncate">{selectedDept?.name}</h2>
            <p className="text-[10px] font-bold uppercase text-violet-500 mt-0.5 tracking-widest">Semester {selectedSem?.sem_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800 uppercase tracking-widest whitespace-nowrap">
            {courses?.length || 0} courses
          </span>
          <button onClick={() => openModal('course')} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
            <Plus size={11} /> Add
          </button>
        </div>
      </div>
      {coursesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCourseCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses?.map((course, idx) => {
            const courseName = course.name?.charAt(0).toUpperCase() + course.name?.slice(1);
            return (
              <motion.div key={course._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-violet-200 dark:hover:border-violet-800/50 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center text-xs font-black shrink-0">
                      {course.short_name || String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash size={12} className="text-zinc-400" />
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{course.course_code}</span>
                    </div>
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight text-zinc-900 dark:text-white leading-snug break-words">{courseName}</h4>
                  {course.short_name && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag size={10} className="text-zinc-400" />
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">{course.short_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Active</span>
                  </div>
                </div>
                <div className="flex border-t-2 border-zinc-100 dark:border-zinc-800">
                  <button onClick={() => openModal('course', course)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                    <Edit3 size={11} /> Edit
                  </button>
                  <div className="w-0.5 bg-zinc-100 dark:bg-zinc-800" />
                  <button onClick={() => deleteMutation.mutate({ type: 'course', id: course._id })} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-350 mx-auto">
        <header className="mb-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-100 dark:border-zinc-800 px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                <Layers size={20} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white break-words">
                Academic <span className="text-violet-600">Portal</span>
              </h1>
            </div>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-13 truncate max-w-full">
              {selectedDept ? selectedDept.name : 'All Departments'}
              {selectedSem ? ` · Semester ${selectedSem.sem_number}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 overflow-x-auto pb-1">
              <span className={selectedDept ? 'text-violet-600 whitespace-nowrap' : 'whitespace-nowrap'}>Departments</span>
              <ChevronRight size={12} className="shrink-0" />
              <span className={selectedSem ? 'text-violet-600 whitespace-nowrap' : 'whitespace-nowrap'}>Semesters</span>
              <ChevronRight size={12} className="shrink-0" />
              <span className={selectedSem ? 'text-zinc-600 dark:text-zinc-300 whitespace-nowrap' : 'whitespace-nowrap'}>Courses</span>
            </div>
            <AcademicYearHeader />
          </div>
        </header>
        <div className="lg:hidden mb-4">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-100 dark:border-zinc-800 p-1 flex gap-1">
            {[
              { key: 'dept', label: 'Depts', canAccess: true },
              { key: 'sem', label: 'Sems', canAccess: !!selectedDept },
              { key: 'course', label: 'Courses', canAccess: !!selectedSem },
            ].map(({ key, label, canAccess }) => (
              <button key={key} onClick={() => canAccess && setMobileView(key)} disabled={!canAccess}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${mobileView === key ? 'bg-violet-600 text-white shadow-sm' : canAccess ? 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200' : 'text-zinc-200 dark:text-zinc-700 cursor-not-allowed'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-12 gap-5">
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
              <DeptPanel />
            </div>
          </div>
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm min-h-75">
              <SemPanel />
            </div>
          </div>
          <div className="hidden lg:block lg:col-span-6">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm min-h-75">
              {!selectedSem ? (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-300 dark:text-zinc-700">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-4">
                    <Layers size={28} className="text-zinc-400" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-center">
                    {!selectedDept ? 'Select a department to begin' : 'Select a semester to view courses'}
                  </p>
                </div>
              ) : <CoursePanel />}
            </div>
          </div>
          <div className="lg:hidden col-span-full">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm min-h-100">
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