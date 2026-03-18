import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { motion, AnimatePresence } from 'motion/react';
import { BookMarked, ArrowRight, ChevronDown, Award } from 'lucide-react';
import { getAllSemesters, getEnrollmentHistory, enrollStudent, promoteStudent } from '../../api/index';
import { Modal, Button } from '../../components/index';
import useAdminStore from '../../stores/admin';

const EnrollModal = ({ isOpen, onClose, student }) => {
    const queryClient = useQueryClient();
    const { departments, academicYears: cachedYears } = useAdminStore();
    const [selectedDept, setSelectedDept] = useState(student?.dept_id || '');
    const [promoteMode, setPromoteMode] = useState(false);

    const { data: semesters = [] } = useQuery({
        queryKey: ['semesters', selectedDept],
        queryFn: () => getAllSemesters(selectedDept),
        enabled: !!selectedDept,
        staleTime: Infinity
    });

    const { data: history = [] } = useQuery({
        queryKey: ['enrollment-history', student?._id],
        queryFn: () => getEnrollmentHistory(student?._id),
        enabled: !!student?._id && isOpen,
    });

    const activeEnrollment = history.find(h => h.status === 'active');

    const enrollMutation = useMutation({
        mutationFn: enrollStudent,
        onSuccess: () => {
            queryClient.invalidateQueries(['enrollment-history', student._id]);
            onClose();
        }
    });

    const promoteMutation = useMutation({
        mutationFn: ({ id, data }) => promoteStudent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['enrollment-history', student._id]);
            setPromoteMode(false);
            onClose();
        }
    });

    const enrollForm = useForm({
        defaultValues: { sem_id: '', academic_year_id: '' },
        onSubmit: async ({ value }) => {
            enrollMutation.mutate({ student_id: student._id, dept_id: selectedDept, ...value });
        }
    });

    const promoteForm = useForm({
        defaultValues: { next_sem_id: '', next_academic_year_id: '' },
        onSubmit: async ({ value }) => {
            promoteMutation.mutate({ id: student._id, data: value });
        }
    });

    const selectBaseClass = "w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm font-bold outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/5 appearance-none transition-all cursor-pointer group-hover:border-zinc-300 dark:group-hover:border-zinc-700 uppercase";
    const labelClass = "text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 ml-1 mb-1.5 block";

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="flex items-center gap-4 mb-8 px-2 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/20 shrink-0">
                    <BookMarked size={22} />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white leading-none text-zinc-900">Academic <span className="text-violet-600">Entry</span></h2>
                    <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">{student?.first_name} {student?.last_name}</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeEnrollment ? (
                    promoteMode ? (
                        <motion.form
                            key="promote-form-container"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); promoteForm.handleSubmit(); }}
                            className="space-y-6 px-2"
                        >
                            <div>
                                <label htmlFor="next_sem_id" className={labelClass}>Target Semester</label>
                                <div className="relative group">
                                    <promoteForm.Field name="next_sem_id">
                                        {(f) => (
                                            <select
                                                id="next_sem_id"
                                                name="next_sem_id"
                                                value={f.state.value}
                                                onChange={(e) => f.handleChange(e.target.value)}
                                                className={selectBaseClass}
                                                required
                                            >
                                                <option value="" disabled>SELECT SEMESTER</option>
                                                {semesters.filter(s => s._id !== activeEnrollment.sem_id).map(s => (
                                                    <option key={s._id} value={s._id}>SEMESTER {s.sem_number}</option>
                                                ))}
                                            </select>
                                        )}
                                    </promoteForm.Field>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="next_academic_year_id" className={labelClass}>Academic Session</label>
                                <div className="relative group">
                                    <promoteForm.Field name="next_academic_year_id">
                                        {(f) => (
                                            <select
                                                id="next_academic_year_id"
                                                name="next_academic_year_id"
                                                value={f.state.value}
                                                onChange={(e) => f.handleChange(e.target.value)}
                                                className={selectBaseClass}
                                                required
                                            >
                                                <option value="" disabled>SELECT YEAR</option>
                                                {cachedYears.map(y => (
                                                    <option key={y._id} value={y._id}>{y.label}</option>
                                                ))}
                                            </select>
                                        )}
                                    </promoteForm.Field>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black" onClick={() => setPromoteMode(false)}>Discard</Button>
                                <Button type="submit" className="flex-[2] h-14 rounded-2xl shadow-xl shadow-violet-500/10 font-black uppercase tracking-widest text-[11px]" isLoading={promoteMutation.isPending} icon={ArrowRight} iconPosition="right">Execute Promotion</Button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="active-status-view"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6 px-2"
                        >
                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-100 dark:border-zinc-800 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Award size={80} className="text-violet-600" />
                                </div>
                                <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.3em] mb-4">Verification Active</p>
                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-3 uppercase tracking-tighter leading-none">Current State</h3>
                                <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 px-5 py-2.5 rounded-full shadow-sm border dark:border-zinc-700">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-black text-zinc-700 dark:text-zinc-200 tracking-widest uppercase">
                                        SEMESTER {semesters.find(s => s._id === activeEnrollment.sem_id)?.sem_number || 'LOADING...'}
                                    </span>
                                </div>
                            </div>
                            <Button variant="primary" className="w-full h-14 rounded-2xl shadow-xl shadow-violet-500/20 font-black uppercase tracking-widest text-[11px]" onClick={() => setPromoteMode(true)} icon={ArrowRight} iconPosition="right">Initialize Promotion</Button>
                        </motion.div>
                    )
                ) : (
                    <motion.form
                        key="initial-enroll-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); enrollForm.handleSubmit(); }}
                        className="space-y-6 px-2"
                    >
                        <div>
                            <label htmlFor="dept_id" className={labelClass}>Target Department</label>
                            <div className="relative group">
                                <select
                                    id="dept_id"
                                    name="dept_id"
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className={selectBaseClass}
                                    required
                                >
                                    <option value="" disabled>CHOOSE DEPARTMENT</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>)}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="sem_id" className={labelClass}>Semester Index</label>
                            <div className="relative group">
                                <enrollForm.Field name="sem_id">
                                    {(f) => (
                                        <select
                                            id="sem_id"
                                            name="sem_id"
                                            value={f.state.value}
                                            onChange={(e) => f.handleChange(e.target.value)}
                                            className={selectBaseClass}
                                            required
                                            disabled={!selectedDept}
                                        >
                                            <option value="" disabled>CHOOSE SEMESTER</option>
                                            {semesters.map(s => <option key={s._id} value={s._id}>SEMESTER {s.sem_number}</option>)}
                                        </select>
                                    )}
                                </enrollForm.Field>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="academic_year_id" className={labelClass}>Academic Timeline</label>
                            <div className="relative group">
                                <enrollForm.Field name="academic_year_id">
                                    {(f) => (
                                        <select
                                            id="academic_year_id"
                                            name="academic_year_id"
                                            value={f.state.value}
                                            onChange={(e) => f.handleChange(e.target.value)}
                                            className={selectBaseClass}
                                            required
                                        >
                                            <option value="" disabled>CHOOSE SESSION</option>
                                            {cachedYears.map(y => <option key={y._id} value={y._id}>{y.label}</option>)}
                                        </select>
                                    )}
                                </enrollForm.Field>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]" onClick={onClose}>Discard</Button>
                            <Button type="submit" className="flex-[2] h-14 rounded-2xl shadow-xl shadow-violet-500/10 font-black uppercase tracking-widest text-[11px]" isLoading={enrollMutation.isPending}>Commit Enrollment</Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </Modal>
    );
};

export default EnrollModal;