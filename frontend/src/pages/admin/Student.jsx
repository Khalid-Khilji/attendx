import { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit3, Trash2, BookOpen, Camera, Hash, Filter, Search, UserCircle, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllStudents, deleteStudent, getAllDepartments } from '../../api/index';
import { Button, Input, Loader } from '../../components/index';

const StudentModal = lazy(() => import('../../components/index').then(m => ({ default: m.StudentModal })));
const EnrollModal = lazy(() => import('../../components/index').then(m => ({ default: m.EnrollModal })));
const FaceModal = lazy(() => import('../../components/index').then(m => ({ default: m.FaceModal })));

const Students = () => {
  const queryClient = useQueryClient();
  const [modals, setModals] = useState({ student: false, enroll: false, face: false });
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', filterDept],
    queryFn: () => getAllStudents({ deptId: filterDept || undefined }),
    staleTime: 5000,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => queryClient.invalidateQueries(['students'])
  });

  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      `${s.first_name} ${s.last_name} ${s.roll_no}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const openModal = (type, student = null) => {
    setSelected(student);
    setModals(prev => ({ ...prev, [type]: true }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 md:pt-32 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <UserCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Student Management</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white">
              Student <span className="text-violet-600">Registry</span>
            </h1>
            <p className="text-xs font-bold text-zinc-400 mt-2 tracking-widest uppercase">{students.length} Records found</p>
          </motion.div>
          <Button icon={Plus} size="lg" onClick={() => openModal('student')}>Register New Student</Button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 flex flex-col md:flex-row gap-4 bg-zinc-50/30">
            <div className="flex-1">
              <Input
                id="student-search"
                name="search"
                icon={Search}
                placeholder="Find student by name or roll number..."
                value={search}
                onChange={setSearch}
                autoComplete="off"
              />
            </div>
            <div className="relative md:w-72">
              <label htmlFor="dept-filter" className="sr-only">Filter by Department</label>
              <select
                id="dept-filter"
                name="department"
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
                  <th className="px-8 py-5 text-center">Identity</th>
                  <th className="px-8 py-5">Profile Details</th>
                  <th className="px-8 py-5">Academic Dept</th>
                  <th className="px-8 py-5">Verification</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {isLoading ? (
                  <tr><td colSpan="5" className="py-32 text-center"><Loader text="Accessing biometric database..." /></td></tr>
                ) : filteredStudents.map((student, idx) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all"
                  >
                    <td className="px-8 py-5 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 text-violet-600 flex items-center justify-center font-black overflow-hidden mx-auto shadow-sm group-hover:scale-110 transition-transform">
                        {student.profile_pic ? <img src={student.profile_pic} className="w-full h-full object-cover" /> : student.first_name[0].toUpperCase()}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-zinc-900 dark:text-white capitalize tracking-tight">{student.first_name} {student.last_name}</p>
                      <p className="text-[10px] font-mono font-bold text-zinc-400 mt-1 tracking-tighter uppercase">{student.roll_no}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 capitalize">{student.dept_name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${student.face_embedding
                          ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-transparent'
                        }`}>
                        {student.face_embedding ? <ShieldCheck size={10} /> : <div className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse" />}
                        {student.face_embedding ? 'Verified' : 'Pending'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 group-hover:transition-all duration-300">
                        <button onClick={() => openModal('enroll', student)} className="p-2.5 bg-white dark:bg-zinc-800 shadow-sm border dark:border-zinc-700 hover:text-violet-600 hover:border-violet-200 rounded-xl transition-all"><BookOpen size={16} /></button>
                        <button onClick={() => openModal('face', student)} className="p-2.5 bg-white dark:bg-zinc-800 shadow-sm border dark:border-zinc-700 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all"><Camera size={16} /></button>
                        <button onClick={() => openModal('student', student)} className="p-2.5 bg-white dark:bg-zinc-800 shadow-sm border dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 rounded-xl transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => deleteMutation.mutate(student._id)} className="p-2.5 bg-white dark:bg-zinc-800 shadow-sm border dark:border-zinc-700 hover:text-red-600 hover:border-red-200 rounded-xl transition-all"><Trash2 size={16} /></button>
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
        {modals.student && (
          <StudentModal
            isOpen={modals.student}
            onClose={() => setModals({ ...modals, student: false })}
            editData={selected}
            departments={departments}
          />
        )}
        {modals.enroll && (
          <EnrollModal
            isOpen={modals.enroll}
            onClose={() => setModals({ ...modals, enroll: false })}
            student={selected}
            departments={departments}
          />
        )}
        {modals.face && (
          <FaceModal
            isOpen={modals.face}
            onClose={() => setModals({ ...modals, face: false })}
            student={selected}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Students;