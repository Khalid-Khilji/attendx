import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit3, Trash2, BookOpen, Eye, EyeOff, Users, Upload, ChevronRight, GraduationCap, Camera, Hash, Mail, Fingerprint, Calendar, BookMarked, Award } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAllStudents, createStudent, updateStudent, deleteStudent, uploadFace, enrollStudent, promoteStudent, getEnrollmentHistory, getAllDepartments, getAllSemesters, getAllAcademicYears } from '../../api/index';
import { Modal, Input, Button } from '../../components/index';

const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 h-16" />
);

const StudentModal = ({ isOpen, onClose, editData = null, departments = [] }) => {
  const [form, setForm] = useState({
    first_name: editData?.first_name || '',
    last_name: editData?.last_name || '',
    roll_no: editData?.roll_no || '',
    dept_id: editData?.dept_id || '',
  });
  const [credentials, setCredentials] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const mutation = useMutation({
    mutationFn: (data) => editData ? updateStudent(editData._id, data) : createStudent(data),
    onSuccess: (res) => {
      if (!editData && res.email) {
        setCredentials({ 
          email: res.email, 
          password: res.generated_password,
          name: `${capitalizeFirst(form.first_name)} ${capitalizeFirst(form.last_name)}`,
          roll: form.roll_no
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
            <GraduationCap size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight mb-1 dark:text-white">Student Added</h2>
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-1 capitalize">{credentials.name}</p>
          <p className="text-xs font-mono text-zinc-500 mb-4">{credentials.roll}</p>
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
        {editData ? 'Update' : 'Add'} Student
      </h2>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First Name" value={form.first_name} onChange={(v) => set('first_name', v)} required />
          <Input label="Last Name" value={form.last_name} onChange={(v) => set('last_name', v)} required />
        </div>
        {!editData && <Input label="Roll No" value={form.roll_no} onChange={(v) => set('roll_no', v)} required placeholder="e.g. CS2021001" />}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5 block">Department</label>
          <select value={form.dept_id} onChange={(e) => set('dept_id', e.target.value)} required
            className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/30 appearance-none">
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

const EnrollModal = ({ isOpen, onClose, student, departments = [] }) => {
  const [selectedDept, setSelectedDept] = useState(student?.dept_id || '');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters', selectedDept],
    queryFn: () => getAllSemesters(selectedDept),
    enabled: !!selectedDept,
  });

  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: getAllAcademicYears,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['enrollment-history', student?._id],
    queryFn: () => getEnrollmentHistory(student._id),
    enabled: !!student?._id,
  });

  const enrollMutation = useMutation({
    mutationFn: enrollStudent,
    onSuccess: () => {
      setSelectedSem('');
      setSelectedYear('');
    }
  });

  const activeEnrollment = history.find(h => h.status === 'active');

  const { data: promoteSemesters = [] } = useQuery({
    queryKey: ['semesters-promote', activeEnrollment?.dept_id],
    queryFn: () => getAllSemesters(activeEnrollment?.dept_id),
    enabled: !!activeEnrollment,
  });

  const [promoteMode, setPromoteMode] = useState(false);
  const [nextSem, setNextSem] = useState('');
  const [nextYear, setNextYear] = useState('');

  const promoteMutation = useMutation({
    mutationFn: ({ id, data }) => promoteStudent(id, data),
    onSuccess: () => {
      setPromoteMode(false);
      setNextSem('');
      setNextYear('');
    }
  });

  const statusColor = { 
    active: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800', 
    promoted: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800', 
    dropped: 'text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800', 
    graduated: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800' 
  };

  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
          <BookMarked size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight dark:text-white">Enrollment</h2>
          <p className="text-sm font-bold text-violet-600 capitalize">
            {student?.first_name} {student?.last_name} · {student?.roll_no}
          </p>
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-zinc-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Enrollment History</p>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => {
              const sem = promoteSemesters.find(s => s._id === h.sem_id);
              return (
                <div key={h._id} className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl px-4 py-3 border border-zinc-100 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-600 text-[9px] font-black text-white flex items-center justify-center">
                      {i + 1}
                    </div>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Semester {sem?.sem_number || '—'}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${statusColor[h.status] || 'text-zinc-500 bg-zinc-100'}`}>
                    {h.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeEnrollment ? (
        promoteMode ? (
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Award size={14} className="text-zinc-400" /> Promote To
            </p>
            <select value={nextSem} onChange={(e) => setNextSem(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 appearance-none">
              <option value="">Select Next Semester</option>
              {promoteSemesters.filter(s => s._id !== activeEnrollment.sem_id).map(s => (
                <option key={s._id} value={s._id}>Semester {s.sem_number}</option>
              ))}
            </select>
            <select value={nextYear} onChange={(e) => setNextYear(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 appearance-none">
              <option value="">Select Academic Year</option>
              {academicYears.map(y => <option key={y._id} value={y._id}>{y.label}</option>)}
            </select>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={() => setPromoteMode(false)}>Back</Button>
              <Button className="flex-1" isLoading={promoteMutation.isPending}
                onClick={() => promoteMutation.mutate({ id: student._id, data: { next_sem_id: nextSem, next_academic_year_id: nextYear } })}>
                Promote
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 mb-1">Active Enrollment</p>
                  <p className="text-sm font-bold text-emerald-600">Semester {promoteSemesters.find(s => s._id === activeEnrollment.sem_id)?.sem_number || '—'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-200 dark:bg-emerald-800/50 flex items-center justify-center">
                  <GraduationCap size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={() => setPromoteMode(true)}>
              <ChevronRight size={13} className="mr-1" /> Promote to Next Semester
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-4 mt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <BookOpen size={14} className="text-zinc-400" /> New Enrollment
          </p>
          <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedSem(''); }}
            className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 appearance-none">
            <option value="">Select Department</option>
            {departments.map(d => (
              <option key={d._id} value={d._id} className="capitalize">
                {d.name}
              </option>
            ))}
          </select>
          {selectedDept && (
            <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 appearance-none">
              <option value="">Select Semester</option>
              {semesters.map(s => <option key={s._id} value={s._id}>Semester {s.sem_number}</option>)}
            </select>
          )}
          {selectedSem && (
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 appearance-none">
              <option value="">Select Academic Year</option>
              {academicYears.map(y => <option key={y._id} value={y._id}>{y.label}</option>)}
            </select>
          )}
          {selectedSem && selectedYear && (
            <Button className="w-full" isLoading={enrollMutation.isPending}
              onClick={() => enrollMutation.mutate({ student_id: student._id, dept_id: selectedDept, sem_id: selectedSem, academic_year_id: selectedYear })}>
              Enroll Student
            </Button>
          )}
        </div>
      )}

      <Button variant="ghost" className="w-full mt-4" onClick={onClose}>Close</Button>
    </Modal>
  );
};

const FaceModal = ({ isOpen, onClose, student }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const mutation = useMutation({
    mutationFn: () => uploadFace(student._id, file),
    onSuccess: () => {
      onClose();
    }
  });

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <Modal isOpen={isOpen} onClose={() => { setPreview(null); setFile(null); onClose(); }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
          <Fingerprint size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight dark:text-white">Face Registration</h2>
          <p className="text-sm font-bold text-violet-600 capitalize">
            {student?.first_name} {student?.last_name}
          </p>
        </div>
      </div>

      <label className="block cursor-pointer">
        <div className={`rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center h-64 overflow-hidden ${preview ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/10' : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Camera size={28} className="text-zinc-400" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Click to upload photo</p>
              <p className="text-[9px] text-zinc-300 dark:text-zinc-600 mt-2">JPG, PNG — clear face required</p>
            </div>
          )}
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>

      {student?.face_embedding && (
        <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center border border-amber-100 dark:border-amber-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
            ✓ Face already registered — uploading will replace it
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="ghost" className="flex-1" onClick={() => { setPreview(null); setFile(null); onClose(); }}>Cancel</Button>
        <Button className="flex-1" disabled={!file} isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
          <Upload size={12} className="mr-1" /> Register Face
        </Button>
      </div>
    </Modal>
  );
};

const Students = () => {
  const [studentModal, setStudentModal] = useState(false);
  const [enrollModal, setEnrollModal] = useState(false);
  const [faceModal, setFaceModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', filterDept],
    queryFn: () => getAllStudents({ deptId: filterDept || undefined }),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
  });

  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const filtered = students.filter(s =>
    `${capitalizeFirst(s.first_name)} ${capitalizeFirst(s.last_name)} ${s.roll_no} ${s.dept_name || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (s) => { setEditStudent(s); setStudentModal(true); };
  const openEnroll = (s) => { setSelectedStudent(s); setEnrollModal(true); };
  const openFace = (s) => { setSelectedStudent(s); setFaceModal(true); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        <header className="mb-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-100 dark:border-zinc-800 px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                <Users size={20} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white">
                Student <span className="text-violet-600">Management</span>
              </h1>
            </div>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-13">
              {students.length} student{students.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button
            onClick={() => { setEditStudent(null); setStudentModal(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-violet-200 dark:shadow-violet-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={14} /> Add Student
          </button>
        </header>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or roll no..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-sm font-bold text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 placeholder:font-normal focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/30 transition-all" />
            </div>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
              className="px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-sm font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/30 appearance-none">
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id} className="capitalize">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">{[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Users size={36} className="text-zinc-400" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-zinc-400">
                {search ? 'No results found' : 'No students yet'}
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
                {['Student', 'Roll No', 'Department', 'Face', 'Status', 'Actions'].map((h, i) => (
                  <div key={h} className={`text-[9px] font-black uppercase tracking-widest text-zinc-400 ${i === 0 ? 'col-span-3' : i === 2 ? 'col-span-2' : i === 5 ? 'col-span-4' : 'col-span-1'}`}>{h}</div>
                ))}
              </div>

              <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {filtered.map((student, idx) => (
                  <motion.div key={student._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                    className="px-6 py-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">

                    <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 flex items-center gap-3">
                        {student.profile_pic ? (
                          <img src={student.profile_pic} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 ring-2 ring-zinc-100 dark:ring-zinc-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shadow-md shrink-0">
                            {student.first_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 capitalize truncate">
                          {student.first_name} {student.last_name}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                          {student.roll_no}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 capitalize truncate">
                        {student.dept_name || '—'}
                      </div>
                      <div className="col-span-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${student.face_embedding ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700'}`}>
                          {student.face_embedding ? '✓ Done' : 'None'}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${student.is_active !== false ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800'}`}>
                          {student.is_active !== false ? 'Active' : 'Off'}
                        </span>
                      </div>
                      <div className="col-span-4 flex items-center gap-1">
                        <button onClick={() => openEnroll(student)}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-violet-600 hover:text-violet-700 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-lg transition-colors hover:bg-violet-100 dark:hover:bg-violet-900/30">
                          <BookOpen size={11} /> Enroll
                        </button>
                        <button onClick={() => openFace(student)}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-zinc-600 hover:text-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700">
                          <Camera size={11} /> Face
                        </button>
                        <button onClick={() => openEdit(student)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(student._id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="lg:hidden">
                      <div className="flex items-start gap-4">
                        {student.profile_pic ? (
                          <img src={student.profile_pic} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2 ring-zinc-100 dark:ring-zinc-700" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-lg shrink-0">
                            {student.first_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-black text-base text-zinc-800 dark:text-zinc-200 capitalize truncate">
                              {student.first_name} {student.last_name}
                            </p>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${student.is_active !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                              {student.is_active !== false ? 'Active' : 'Off'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                            <span className="font-black uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                              {student.roll_no}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{student.dept_name || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button onClick={() => openEnroll(student)}
                              className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-3 py-2 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
                              <BookOpen size={11} /> Enroll
                            </button>
                            <button onClick={() => openFace(student)}
                              className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                              <Camera size={11} /> Face
                            </button>
                            <button onClick={() => openEdit(student)} 
                              className="p-2 rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => deleteMutation.mutate(student._id)} 
                              className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {student.face_embedding && (
                            <div className="flex items-center gap-1 mt-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600">Face Registered</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <StudentModal isOpen={studentModal} onClose={() => { setStudentModal(false); setEditStudent(null); }} editData={editStudent} departments={departments} />
      <EnrollModal isOpen={enrollModal} onClose={() => { setEnrollModal(false); setSelectedStudent(null); }} student={selectedStudent} departments={departments} />
      <FaceModal isOpen={faceModal} onClose={() => { setFaceModal(false); setSelectedStudent(null); }} student={selectedStudent} />
    </div>
  );
};

export default Students;