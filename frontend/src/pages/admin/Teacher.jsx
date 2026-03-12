import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit3, Trash2, UserCheck, BookOpen, Star, X, Eye, EyeOff, Users, Hash, Mail, BadgeCheck, GraduationCap } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAllTeachers, createTeacher, updateTeacher, deleteTeacher, assignTeacherToCourse, removeTeacherFromCourse, getCourseTeachers, getAllDepartments, getAllSemesters, getAllCourses } from '../../api/index';
import { Modal, Input, Button } from '../../components/index';

const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 h-16" />
);

const TeacherModal = ({ isOpen, onClose, editData = null, departments = [] }) => {
  const [form, setForm] = useState({
    first_name: editData?.first_name || '',
    last_name: editData?.last_name || '',
    faculty_id: editData?.faculty_id || '',
    dept_id: editData?.dept_id || '',
  });
  const [credentials, setCredentials] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const mutation = useMutation({
    mutationFn: (data) => editData ? updateTeacher(editData._id, data) : createTeacher(data),
    onSuccess: (res) => {
      if (!editData && res.email) {
        setCredentials({
          email: res.email,
          password: res.generated_password,
          name: `${capitalizeFirst(form.first_name)} ${capitalizeFirst(form.last_name)}`
        });
      } else {
        onClose();
      }
    }
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (credentials) {
    return (
      <Modal isOpen={isOpen} onClose={() => { setCredentials(null); onClose(); }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
            <UserCheck size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight mb-1 dark:text-white">Teacher Added</h2>
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2 capitalize">{credentials.name}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">Share these credentials</p>
          <div className="space-y-3 text-left mb-6">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-1">
                <Mail size={12} className="text-zinc-400" />
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Email</p>
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 break-all">{credentials.email}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Eye size={12} className="text-zinc-400" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Password</p>
                </div>
                <button onClick={() => setShowPass(!showPass)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                {showPass ? credentials.password : '••••••••••••'}
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={() => { setCredentials(null); onClose(); }}>Done</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
        {editData ? 'Update' : 'Add'} Teacher
      </h2>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First Name" value={form.first_name} onChange={(v) => set('first_name', v)} required />
          <Input label="Last Name" value={form.last_name} onChange={(v) => set('last_name', v)} required />
        </div>
        {!editData && <Input label="Faculty ID" value={form.faculty_id} onChange={(v) => set('faculty_id', v)} required placeholder="e.g. F001" />}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5 block">Department</label>
          <select
            value={form.dept_id}
            onChange={(e) => set('dept_id', e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/30 appearance-none"
          >
            <option value="">Select Department</option>
            {departments.map(d => (
              <option key={d._id} value={d._id} className="capitalize">
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" isLoading={mutation.isPending}>{editData ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
};

const AssignModal = ({ isOpen, onClose, teacher, departments = [] }) => {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters', selectedDept],
    queryFn: () => getAllSemesters(selectedDept),
    enabled: !!selectedDept,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', selectedSem],
    queryFn: () => getAllCourses(selectedSem),
    enabled: !!selectedSem,
  });

  const { data: assigned = [] } = useQuery({
    queryKey: ['course-teachers', selectedCourse],
    queryFn: () => getCourseTeachers(selectedCourse),
    enabled: !!selectedCourse,
  });

  const assignMutation = useMutation({
    mutationFn: (data) => assignTeacherToCourse(data),
  });

  const removeMutation = useMutation({
    mutationFn: removeTeacherFromCourse,
  });

  const alreadyAssigned = assigned.some(a => a.teacher_id === teacher?._id);

  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
          <BookOpen size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight dark:text-white">Assign Courses</h2>
          <p className="text-sm font-bold text-violet-600 capitalize">
            {teacher?.first_name} {teacher?.last_name}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5 block">Department</label>
          <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedSem(''); setSelectedCourse(''); }}
            className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/30 appearance-none">
            <option value="">Select Department</option>
            {departments.map(d => (
              <option key={d._id} value={d._id} className="capitalize">
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {selectedDept && (
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5 block">Semester</label>
            <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedCourse(''); }}
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/30 appearance-none">
              <option value="">Select Semester</option>
              {semesters.map(s => (
                <option key={s._id} value={s._id}>
                  Semester {s.sem_number}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedSem && (
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5 block">Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/30 appearance-none">
              <option value="">Select Course</option>
              {courses.map(c => {
                const courseName = c.name?.charAt(0).toUpperCase() + c.name?.slice(1);
                return (
                  <option key={c._id} value={c._id}>
                    {courseName} {c.short_name && `(${c.short_name})`}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {selectedCourse && (
          <>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Set as Primary Teacher</span>
                <div onClick={() => setIsPrimary(!isPrimary)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${isPrimary ? 'bg-violet-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPrimary ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>
            </div>

            {!alreadyAssigned ? (
              <Button className="w-full" isLoading={assignMutation.isPending}
                onClick={() => assignMutation.mutate({ course_id: selectedCourse, teacher_id: teacher._id, is_primary: isPrimary })}>
                Assign to Course
              </Button>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center border border-emerald-100 dark:border-emerald-800">
                <BadgeCheck size={16} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Already assigned to this course</p>
              </div>
            )}

            {assigned.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={14} className="text-zinc-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Assigned Teachers ({assigned.length})</p>
                </div>
                <div className="space-y-2">
                  {assigned.map(a => (
                    <div key={a._id} className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl px-4 py-3 border border-zinc-100 dark:border-zinc-700 hover:border-zinc-200 dark:hover:border-zinc-600 transition-colors">
                      <div className="flex items-center gap-3">
                        {a.is_primary && (
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                            <Star size={10} className="text-amber-500 fill-amber-500" />
                            <span className="text-[8px] font-black uppercase text-amber-600">Primary</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white">
                            {a.first_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 capitalize">
                            {a.first_name} {a.last_name}
                          </span>
                        </div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
                          {a.faculty_id}
                        </span>
                      </div>
                      <button onClick={() => removeMutation.mutate(a._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Button variant="ghost" className="w-full mt-6" onClick={onClose}>Close</Button>
    </Modal>
  );
};

const Teachers = () => {
  const [teacherModal, setTeacherModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [search, setSearch] = useState('');

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeacher,
  });

  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const filtered = teachers.filter(t =>
    `${capitalizeFirst(t.first_name)} ${capitalizeFirst(t.last_name)} ${t.faculty_id} ${t.dept_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (t) => { setEditTeacher(t); setTeacherModal(true); };
  const openAssign = (t) => { setSelectedTeacher(t); setAssignModal(true); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        <header className="mb-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-100 dark:border-zinc-800 px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                <GraduationCap size={20} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white">
                Teacher <span className="text-violet-600">Management</span>
              </h1>
            </div>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-13">
              {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button
            onClick={() => { setEditTeacher(null); setTeacherModal(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-violet-200 dark:shadow-violet-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={14} /> Add Teacher
          </button>
        </header>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative">
              <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, faculty ID or department..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-sm font-bold text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 placeholder:font-normal focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/30 transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Users size={36} className="text-zinc-400" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-zinc-400">
                {search ? 'No results found' : 'No teachers yet'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-4 text-xs font-bold text-violet-600 hover:text-violet-700">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                {['Name', 'Faculty ID', 'Department', 'Email', 'Status', 'Actions'].map((h, i) => (
                  <div key={h} className={`text-[9px] font-black uppercase tracking-widest text-zinc-400 ${i === 0 ? 'col-span-3' : i === 3 ? 'col-span-3' : i === 5 ? 'col-span-2' : 'col-span-1'}`}>{h}</div>
                ))}
              </div>

              <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {filtered.map((teacher, idx) => {
                  const teacherName = `${capitalizeFirst(teacher.first_name)} ${capitalizeFirst(teacher.last_name)}`;
                  return (
                    <motion.div
                      key={teacher._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="px-6 py-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shadow-md shrink-0">
                            {teacher.first_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 capitalize truncate">
                            {teacherName}
                          </span>
                        </div>
                        <div className="col-span-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                            {teacher.faculty_id}
                          </span>
                        </div>
                        <div className="col-span-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 capitalize truncate">
                          {teacher.dept_name}
                        </div>
                        <div className="col-span-3 text-xs text-zinc-400 truncate font-mono">{teacher.email}</div>
                        <div className="col-span-1">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${teacher.is_active !== false ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800'}`}>
                            {teacher.is_active !== false ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1">
                          <button onClick={() => openAssign(teacher)}
                            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-violet-600 hover:text-violet-700 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-lg transition-colors hover:bg-violet-100 dark:hover:bg-violet-900/30">
                            <BookOpen size={11} /> Assign
                          </button>
                          <button onClick={() => openEdit(teacher)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => deleteMutation.mutate(teacher._id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="lg:hidden">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg font-black text-white shadow-lg shrink-0">
                            {teacher.first_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-black text-base text-zinc-800 dark:text-zinc-200 capitalize truncate">
                                {teacherName}
                              </p>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${teacher.is_active !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                {teacher.is_active !== false ? 'Active' : 'Off'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                              <span className="font-black uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                {teacher.faculty_id}
                              </span>
                              <span>•</span>
                              <span className="capitalize">{teacher.dept_name}</span>
                            </div>
                            <p className="text-xs text-zinc-400 font-mono mb-3">{teacher.email}</p>
                            <div className="flex items-center gap-2">
                              <button onClick={() => openAssign(teacher)}
                                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-3 py-2 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
                                <BookOpen size={11} /> Assign
                              </button>
                              <button onClick={() => openEdit(teacher)}
                                className="p-2 rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => deleteMutation.mutate(teacher._id)}
                                className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <TeacherModal isOpen={teacherModal} onClose={() => { setTeacherModal(false); setEditTeacher(null); }} editData={editTeacher} departments={departments} />
      <AssignModal isOpen={assignModal} onClose={() => { setAssignModal(false); setSelectedTeacher(null); }} teacher={selectedTeacher} departments={departments} />
    </div>
  );
};

export default Teachers;