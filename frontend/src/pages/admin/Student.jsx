import { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Trash2, BookOpen, GraduationCap, Search, ChevronDown, Camera, ShieldCheck, Fingerprint, UserPlus, Hash } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllStudents, deleteStudent, getSemBatches } from '../../api/index';
import { Button, Input, Modal, Loader } from '../../components/index';
import useAdminStore from '../../stores/admin';

const StudentModal = lazy(() => import('../../components/index').then(m => ({ default: m.StudentModal })));
const EnrollModal = lazy(() => import('../../components/index').then(m => ({ default: m.EnrollModal })));
const FaceModal = lazy(() => import('../../components/index').then(m => ({ default: m.FaceModal })));

const Students = () => {
    const queryClient = useQueryClient();
    const { departments } = useAdminStore();
    const [modals, setModals] = useState({ student: false, enroll: false, face: false });
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterBatch, setFilterBatch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    const { data: students = [], isLoading } = useQuery({
        queryKey: ['students', filterDept, filterBatch],
        queryFn: () => getAllStudents({ deptId: filterDept || undefined, batchId: filterBatch || undefined }),
        staleTime: Infinity,
    });

    const { data: batches = [] } = useQuery({
        queryKey: ['batches', filterDept],
        queryFn: () => getSemBatches(filterDept),
        enabled: !!filterDept,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            setDeleteConfirm({ open: false, id: null });
        }
    });

    const filteredStudents = useMemo(() => {
        const query = search.toLowerCase().trim();
        return students.filter(s =>
            `${s.first_name} ${s.last_name} ${s.roll_no}`.toLowerCase().includes(query)
        );
    }, [students, search]);

    const openModal = (type, student = null) => {
        setSelected(student);
        setModals(prev => ({ ...prev, [type]: true }));
    };

    const selectClass = "w-full h-14 pl-5 pr-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-black text-zinc-700 dark:text-zinc-200 appearance-none outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/5 transition-all cursor-pointer shadow-sm";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="w-16 h-16 rounded-3xl bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-600/30">
                            <GraduationCap size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter dark:text-white leading-none">Student <span className="text-violet-600">Base</span></h1>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {students.length} Verified Records
                            </p>
                        </div>
                    </div>
                    <Button variant="primary" icon={UserPlus} onClick={() => openModal('student')} className="w-full md:w-auto h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px]">Enroll Student</Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
                    <div className="lg:col-span-6">
                        <Input id="student-search" name="search" icon={Search} placeholder="Identify by name or Roll No..." value={search} onChange={setSearch} className="h-14 shadow-sm" autoComplete="off" />
                    </div>
                    <div className="lg:col-span-3 relative group">
                        <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setFilterBatch(''); }} className={selectClass}>
                            <option value="">Global Dept View</option>
                            {departments?.map(d => <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
                    </div>
                    <div className="lg:col-span-3 relative group">
                        <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)} disabled={!filterDept} className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}>
                            <option value="">All Batches</option>
                            {batches?.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? Array(6).fill(0).map((_, i) => <div key={i} className="h-80 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 animate-pulse" />) : filteredStudents.map((student) => (
                            <motion.div key={student._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-6 transition-all hover:shadow-2xl hover:shadow-violet-600/10 hover:border-violet-200 dark:hover:border-violet-600/30 overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 overflow-hidden shadow-inner group-hover:border-violet-500/30 transition-colors">
                                        {student.profile_pic ? <img src={student.profile_pic} alt="avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-violet-600 uppercase">{student.first_name[0]}{student.last_name[0]}</div>}
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${student.face_embedding ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-transparent'}`}>
                                        {student.face_embedding ? <ShieldCheck size={12} /> : <Fingerprint size={12} />}
                                        {student.face_embedding ? 'Verified' : 'Pending'}
                                    </div>
                                </div>
                                <div className="space-y-1.5 mb-6">
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{student.first_name} {student.last_name}</h3>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 dark:bg-violet-900/40 px-2.5 py-1 rounded-lg">Roll: {student.roll_no}</span>
                                        {student.batch_name && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg flex items-center gap-1"><Hash size={10} />{student.batch_name}</span>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <Button variant="primary" icon={BookOpen} onClick={() => openModal('enroll', student)} className="col-span-2 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-violet-600/20">Enroll</Button>
                                    <Button variant="secondary" icon={Camera} onClick={() => openModal('face', student)} className="h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl border border-blue-100 dark:border-blue-500/20 shadow-none" />
                                    <div className="flex gap-2 col-span-1">
                                        <Button variant="secondary" icon={Edit3} onClick={() => openModal('student', student)} className="w-1/2 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl border-none shadow-none" />
                                        <Button variant="secondary" icon={Trash2} onClick={() => setDeleteConfirm({ open: true, id: student._id })} className="w-1/2 h-12 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl border border-red-100 dark:border-red-500/20 shadow-none" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <Suspense fallback={null}>
                {modals.student && <StudentModal isOpen={modals.student} onClose={() => setModals(p => ({ ...p, student: false }))} editData={selected} departments={departments} />}
                {modals.enroll && <EnrollModal isOpen={modals.enroll} onClose={() => setModals(p => ({ ...p, enroll: false }))} student={selected} departments={departments} />}
                {modals.face && <FaceModal isOpen={modals.face} onClose={() => setModals(p => ({ ...p, face: false }))} student={selected} />}
            </Suspense>

            <Modal isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} size="sm">
                <div className="text-center py-4 px-2">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-red-600 border border-red-100 dark:border-red-900 shadow-2xl"><Trash2 size={36} /></div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white mb-2">Purge Student?</h2>
                    <p className="text-sm font-bold text-zinc-500 mb-8 px-6 leading-relaxed">Permanent deletion of profile and biometric data. This action is final.</p>
                    <div className="flex gap-3 px-2">
                        <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-black" onClick={() => setDeleteConfirm({ open: false, id: null })}>Cancel</Button>
                        <Button variant="danger" className="flex-[1.5] h-12 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-500/20" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm.id)}>Delete Access</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Students;