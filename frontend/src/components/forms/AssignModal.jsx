import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Star, X, Users, BadgeCheck } from 'lucide-react';
import { getAllSemesters, getAllCourses, getCourseTeachers, assignTeacherToCourse, removeTeacherFromCourse } from '../../api/index';
import { Modal, Button, Select, SelectOption } from '../../components/index';

const AssignModal = ({ isOpen, onClose, teacher, departments = [] }) => {
    const queryClient = useQueryClient();
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
        mutationFn: assignTeacherToCourse,
        onSuccess: () => queryClient.invalidateQueries(['course-teachers', selectedCourse]),
    });

    const removeMutation = useMutation({
        mutationFn: removeTeacherFromCourse,
        onSuccess: () => queryClient.invalidateQueries(['course-teachers', selectedCourse]),
    });

    const alreadyAssigned = assigned.some(a => a.teacher_id === teacher?._id);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                    <BookOpen size={18} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-tight">Assign Courses</h2>
                    <p className="text-sm font-bold text-violet-600 capitalize">{teacher?.first_name} {teacher?.last_name}</p>
                </div>
            </div>

            <div className="space-y-4">
                <Select
                    label="Department"
                    name="assign_dept"
                    id="assign_dept"
                    value={selectedDept}
                    onChange={(v) => { setSelectedDept(v); setSelectedSem(''); setSelectedCourse(''); }}
                    required
                >
                    {departments.map(d => (
                        <SelectOption key={d._id} value={d._id}>{d.name}</SelectOption>
                    ))}
                </Select>

                <AnimatePresence mode="popLayout">
                    {selectedDept && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Select
                                label="Semester"
                                name="assign_sem"
                                id="assign_sem"
                                value={selectedSem}
                                onChange={(v) => { setSelectedSem(v); setSelectedCourse(''); }}
                                required
                            >
                                {semesters.map(s => (
                                    <SelectOption key={s._id} value={s._id}>Semester {s.sem_number}</SelectOption>
                                ))}
                            </Select>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                    {selectedSem && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Select
                                label="Course"
                                name="assign_course"
                                id="assign_course"
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                                required
                            >
                                {courses.map(c => (
                                    <SelectOption key={c._id} value={c._id}>{c.name}</SelectOption>
                                ))}
                            </Select>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                    {selectedCourse && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4 pt-2"
                        >
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-700 flex items-center justify-between transition-all">
                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Set as Primary Teacher</span>
                                <button
                                    type="button"
                                    onClick={() => setIsPrimary(!isPrimary)}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${isPrimary ? 'bg-violet-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                                >
                                    <motion.div
                                        animate={{ x: isPrimary ? 24 : 4 }}
                                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>

                            {!alreadyAssigned ? (
                                <Button
                                    className="w-full"
                                    isLoading={assignMutation.isPending}
                                    onClick={() => assignMutation.mutate({ course_id: selectedCourse, teacher_id: teacher._id, is_primary: isPrimary })}
                                >
                                    Assign to Course
                                </Button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center border border-emerald-100 dark:border-emerald-800"
                                >
                                    <BadgeCheck size={20} className="text-emerald-500 mx-auto mb-1" />
                                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Already assigned to this course</p>
                                </motion.div>
                            )}

                            {assigned.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 ml-1">
                                        <Users size={14} /> Assigned Teachers ({assigned.length})
                                    </p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto hide-scrollbar">
                                        {assigned.map((a, idx) => (
                                            <motion.div
                                                key={a._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-100 dark:border-zinc-800 hover:shadow-sm transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold dark:text-zinc-200 capitalize">{a.first_name} {a.last_name}</span>
                                                    {a.is_primary && (
                                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800">
                                                            <Star size={10} className="text-amber-500 fill-amber-500" />
                                                            <span className="text-[8px] font-black uppercase text-amber-600">Primary</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0! text-zinc-400 hover:text-red-500 border-none bg-transparent"
                                                    onClick={() => removeMutation.mutate(a._id)}
                                                    icon={X}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Button variant="ghost" className="w-full mt-6" onClick={onClose}>Close Portal</Button>
        </Modal>
    );
};

export default AssignModal;