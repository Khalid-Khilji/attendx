import { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Trash2, BookOpen, GraduationCap, Search, ChevronDown, Briefcase, UserPlus, Star, Settings2, Mail, AlertCircle, Copy, Check, LayoutGrid, List, Hash } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTeachers, deleteTeacher, removeTeacherFromCourse } from '../../api/index';
import { Button, Input, Modal } from '../../components/index';
import useAdminStore from '../../stores/admin';
import { toast } from 'react-toastify';

const TeacherModal = lazy(() => import('../../components/index').then(m => ({ default: m.TeacherModal })));
const AssignModal = lazy(() => import('../../components/index').then(m => ({ default: m.AssignModal })));

const Teachers = () => {
  const queryClient = useQueryClient();
  const { departments } = useAdminStore();
  const [modals, setModals] = useState({ teacher: false, assign: false });
  const [selected, setSelected] = useState(null);
  const [editAsgnData, setEditAsgnData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [removeAsgnConfirm, setRemoveAsgnConfirm] = useState({ open: false, id: null, teacherId: null });
  const [viewMode, setViewMode] = useState('grid');
  const [copiedEmail, setCopiedEmail] = useState(null);

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
      toast.success("Personnel account deactivated");
    },
    onError: (err) => toast.error(err.error || "System failure")
  });

  const removeAsgnMutation = useMutation({
    mutationFn: ({ teacherId, assignmentId }) => removeTeacherFromCourse(teacherId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setRemoveAsgnConfirm({ open: false, id: null, teacherId: null });
      toast.info("Assignment entry purged");
    },
    onError: (err) => toast.error("Removal failure")
  });

  const filteredTeachers = useMemo(() => {
    const query = search.toLowerCase().trim();
    return teachers.filter(t => {
      const fullName = `${t.first_name} ${t.last_name}`.toLowerCase();
      return (fullName.includes(query) || t.faculty_id.toLowerCase().includes(query) || t.email.toLowerCase().includes(query)) &&
        (filterDept ? t.dept_id === filterDept : true);
    });
  }, [teachers, search, filterDept]);

  const openAssignModal = (teacher, asgn = null) => {
    setSelected(teacher);
    setEditAsgnData(asgn);
    setModals(prev => ({ ...prev, assign: true }));
  };

  const openTeacherModal = (teacher = null) => {
    setSelected(teacher);
    setModals(prev => ({ ...prev, teacher: true }));
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(type);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const formatName = (str) => str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : "";
  const getInitials = (first, last) => `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6 sm:mb-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={24} className="sm:size-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white">
                Faculty <span className="text-violet-600">Base</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider mt-0.5 sm:mt-1">
                {teachers.length} Personnel • {departments.length} Departments
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => openTeacherModal()}
            className="w-full sm:w-auto text-sm"
          >
            Add Personnel
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search by name, faculty ID or email..."
              value={search}
              onChange={setSearch}
              className="h-10 sm:h-11 rounded-xl text-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-48">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full h-10 sm:h-11 px-3 sm:px-4 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium outline-none focus:border-violet-600 appearance-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-900 shadow-md text-violet-600' : 'text-zinc-500'}`}
              >
                <LayoutGrid size={16} className="sm:size-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-900 shadow-md text-violet-600' : 'text-zinc-500'}`}
              >
                <List size={16} className="sm:size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-120 sm:h-125 rounded-2xl bg-white dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
            )) : filteredTeachers.map((t) => (
              <motion.div
                key={t._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {getInitials(t.first_name, t.last_name)}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                          {formatName(`${t.first_name} ${t.last_name}`)}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-zinc-500 font-mono mt-0.5">{t.faculty_id}</p>
                      </div>
                    </div>
                    <div className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${t.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'}`}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3 sm:mb-4 py-2 sm:py-3 border-y border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                      <Briefcase size={14} className="text-violet-500 shrink-0" />
                      <span className="truncate">{formatName(`${departments.find(d => d._id === t.dept_id)?.name}`) || 'General Department'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                      <Mail size={14} className="text-zinc-400 shrink-0" />
                      <span className="truncate flex-1">{t.email}</span>
                      <button
                        onClick={() => copyToClipboard(t.email, 'Email')}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
                      >
                        {copiedEmail === 'Email' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-zinc-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-violet-600" />
                        <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wide">Courses</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-violet-600 bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded-lg">
                        {t.assignments?.length || 0}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-36 sm:max-h-40 overflow-y-auto">
                      {t.assignments?.length > 0 ? t.assignments.map((asgn, i) => (
                        <div key={i} className="bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-2 sm:p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">{asgn.course_code}</span>
                                {asgn.is_primary && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                    <Star size={10} /> Lead
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] sm:text-xs text-violet-600 dark:text-violet-400 mt-0.5 truncate">{asgn.short_name}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                                {asgn.batch_name || "ALL"}
                              </span>
                              <button
                                onClick={() => openAssignModal(t, asgn)}
                                className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={() => setRemoveAsgnConfirm({ open: true, id: asgn._id, teacherId: t._id })}
                                className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors text-red-500"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
                          <p className="text-xs sm:text-sm text-zinc-400">No courses assigned</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="primary"
                      icon={BookOpen}
                      onClick={() => openAssignModal(t)}
                      className="flex-1 h-9 sm:h-10 rounded-xl text-[10px] sm:text-xs font-bold"
                    >
                      Assign Course
                    </Button>
                    <Button
                      variant="secondary"
                      icon={Edit3}
                      onClick={() => openTeacherModal(t)}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    />
                    <Button
                      variant="secondary"
                      icon={Trash2}
                      onClick={() => setDeleteConfirm({ open: true, id: t._id })}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoading ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
            )) : filteredTeachers.map((t) => (
              <motion.div
                key={t._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                      {getInitials(t.first_name, t.last_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                          {formatName(`${t.first_name} ${t.last_name}`)}
                        </h3>
                        <div className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold ${t.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {t.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                        <span className="text-[10px] sm:text-xs text-zinc-500 font-mono flex items-center gap-1">
                          <Hash size={10} /> {t.faculty_id}
                        </span>
                        <span className="hidden sm:block text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                          <Briefcase size={10} /> {formatName(`${departments.find(d => d._id === t.dept_id)?.name}`) || 'General'}
                        </span>
                        <span className="hidden sm:block text-zinc-300 dark:text-zinc-700">•</span>
                        <div className="flex items-center gap-1">
                          <Mail size={10} className="text-zinc-400" />
                          <span className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 truncate">{t.email}</span>
                          <button
                            onClick={() => copyToClipboard(t.email, 'Email')}
                            className="p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                          >
                            {copiedEmail === 'Email' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-zinc-400" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-bold text-violet-600">{t.assignments?.length || 0} Courses</p>
                      <p className="text-[9px] sm:text-[10px] text-zinc-400">{t.assignments?.filter(a => a.is_primary).length || 0} Lead</p>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        variant="primary"
                        icon={BookOpen}
                        onClick={() => openAssignModal(t)}
                        className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg text-[9px] sm:text-[10px] font-bold"
                      >
                        Assign
                      </Button>
                      <Button
                        variant="secondary"
                        icon={Edit3}
                        onClick={() => openTeacherModal(t)}
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                      />
                      <Button
                        variant="secondary"
                        icon={Trash2}
                        onClick={() => setDeleteConfirm({ open: true, id: t._id })}
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600"
                      />
                    </div>
                  </div>
                </div>

                {t.assignments?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex gap-1.5 flex-wrap">
                      {t.assignments.slice(0, 4).map((asgn, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] sm:text-xs font-bold">
                          {asgn.course_code}
                          {asgn.is_primary && <Star size={10} className="text-amber-500" />}
                        </span>
                      ))}
                      {t.assignments.length > 4 && (
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] sm:text-xs font-bold">
                          +{t.assignments.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}


      <Suspense fallback={null}>
        {modals.teacher && (
          <TeacherModal
            isOpen={modals.teacher}
            onClose={() => {
              setModals(p => ({ ...p, teacher: false }));
              setSelected(null);
            }}
            editData={selected}
            departments={departments}
          />
        )}
        {modals.assign && (
          <AssignModal
            isOpen={modals.assign}
            onClose={() => {
              setModals(p => ({ ...p, assign: false }));
              setEditAsgnData(null);
              setSelected(null);
            }}
            teacher={selected}
            editAsgnData={editAsgnData}
          />
        )}
      </Suspense>

      <Modal isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} size="sm">
        <div className="text-center p-3 sm:p-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 dark:bg-red-950 rounded-xl flex items-center justify-center mx-auto mb-3 text-red-600">
            <Trash2 size={20} className="sm:size-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-1.5 sm:mb-2">Deactivate Personnel?</h2>
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-4 sm:mb-5">
            This will deactivate the account and remove all course assignments.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 text-sm" onClick={() => setDeleteConfirm({ open: false, id: null })}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1 text-sm" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm.id)}>
              Deactivate
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={removeAsgnConfirm.open} onClose={() => setRemoveAsgnConfirm({ open: false, id: null, teacherId: null })} size="sm">
        <div className="text-center p-3 sm:p-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 dark:bg-amber-950 rounded-xl flex items-center justify-center mx-auto mb-3 text-amber-600">
            <AlertCircle size={20} className="sm:size-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-1.5 sm:mb-2">Remove Assignment?</h2>
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-4 sm:mb-5">
            This faculty will be removed from this course.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 text-sm" onClick={() => setRemoveAsgnConfirm({ open: false, id: null, teacherId: null })}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1 text-sm" isLoading={removeAsgnMutation.isPending} onClick={() => removeAsgnMutation.mutate({ teacherId: removeAsgnConfirm.teacherId, assignmentId: removeAsgnConfirm.id })}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Teachers;