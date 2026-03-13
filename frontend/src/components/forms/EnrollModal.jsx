import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { motion, AnimatePresence } from 'motion/react';
import { BookMarked, GraduationCap, ArrowRight } from 'lucide-react';
import { getAllSemesters, getAllAcademicYears, getEnrollmentHistory, enrollStudent, promoteStudent } from '../../api/index';
import { Modal, Button, Select, SelectOption } from '../../components/index';

const EnrollModal = ({ isOpen, onClose, student, departments = [] }) => {
    const queryClient = useQueryClient();
    const [selectedDept, setSelectedDept] = useState(student?.dept_id || '');
    const [promoteMode, setPromoteMode] = useState(false);

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
        queryFn: () => getEnrollmentHistory(student?._id),
        enabled: !!student?._id,
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

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                    <BookMarked size={22} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-tight">Student Enrollment</h2>
                    <p className="text-xs font-bold text-violet-600 capitalize">{student?.first_name} {student?.last_name} • {student?.roll_no}</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeEnrollment ? (
                    promoteMode ? (
                        <motion.form
                            key="promote-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); promoteForm.handleSubmit(); }}
                            className="space-y-5"
                        >
                            <promoteForm.Field name="next_sem_id">
                                {(field) => (
                                    <Select
                                        label="Target Semester"
                                        name={field.name}
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={field.handleChange}
                                        required
                                    >
                                        {semesters.filter(s => s._id !== activeEnrollment.sem_id).map(s => (
                                            <SelectOption key={s._id} value={s._id}>Semester {s.sem_number}</SelectOption>
                                        ))}
                                    </Select>
                                )}
                            </promoteForm.Field>

                            <promoteForm.Field name="next_academic_year_id">
                                {(field) => (
                                    <Select
                                        label="Academic Year"
                                        name={field.name}
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={field.handleChange}
                                        required
                                    >
                                        {academicYears.map(y => (
                                            <SelectOption key={y._id} value={y._id}>{y.label}</SelectOption>
                                        ))}
                                    </Select>
                                )}
                            </promoteForm.Field>

                            <div className="flex gap-3 pt-2">
                                <Button variant="ghost" className="flex-1" onClick={() => setPromoteMode(false)}>Back</Button>
                                <Button type="submit" className="flex-1" isLoading={promoteMutation.isPending} icon={ArrowRight} iconPosition="right">Promote</Button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="active-status"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <div className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1">Current Status</p>
                                    <p className="text-lg font-black text-emerald-600">Active Enrollment</p>
                                    <p className="text-sm font-bold text-emerald-500/80">Semester {semesters.find(s => s._id === activeEnrollment.sem_id)?.sem_number || '—'}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <GraduationCap size={24} />
                                </div>
                            </div>
                            <Button className="w-full" onClick={() => setPromoteMode(true)} icon={ArrowRight} iconPosition="right">Promote to Next Semester</Button>
                        </motion.div>
                    )
                ) : (
                    <motion.form
                        key="enroll-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); enrollForm.handleSubmit(); }}
                        className="space-y-5"
                    >
                        <Select
                            label="Department"
                            name="enroll_dept"
                            id="enroll_dept"
                            value={selectedDept}
                            onChange={(v) => setSelectedDept(v)}
                            required
                        >
                            {departments.map(d => (
                                <SelectOption key={d._id} value={d._id}>{d.name}</SelectOption>
                            ))}
                        </Select>

                        <enrollForm.Field name="sem_id">
                            {(field) => (
                                <Select
                                    label="Semester"
                                    name={field.name}
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    required
                                    disabled={!selectedDept}
                                >
                                    {semesters.map(s => (
                                        <SelectOption key={s._id} value={s._id}>Semester {s.sem_number}</SelectOption>
                                    ))}
                                </Select>
                            )}
                        </enrollForm.Field>

                        <enrollForm.Field name="academic_year_id">
                            {(field) => (
                                <Select
                                    label="Academic Year"
                                    name={field.name}
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    required
                                >
                                    {academicYears.map(y => (
                                        <SelectOption key={y._id} value={y._id}>{y.label}</SelectOption>
                                    ))}
                                </Select>
                            )}
                        </enrollForm.Field>

                        <Button type="submit" className="w-full mt-2" isLoading={enrollMutation.isPending}>Enroll Student</Button>
                    </motion.form>
                )}
            </AnimatePresence>

            <Button variant="ghost" className="w-full mt-6" onClick={onClose}>Close</Button>
        </Modal>
    );
};

export default EnrollModal;