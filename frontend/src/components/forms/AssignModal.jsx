import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, X, Users, BadgeCheck, ChevronDown, Award } from 'lucide-react';
import { getAllSemesters, getAllCourses, getCourseTeachers, assignTeacherToCourse, removeTeacherFromCourse } from '../../api/index';
import { Modal, Button } from '../../components/index';
import useAdminStore from '../../stores/admin';

const AssignModal = ({ isOpen, onClose, teacher }) => {
    const queryClient = useQueryClient();
    const { departments } = useAdminStore();
    
    const [selectedSem, setSelectedSem] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);

    const teacherDeptId = teacher?.dept_id || '';

    const { data: semesters = [] } = useQuery({
        queryKey: ['semesters', teacherDeptId],
        queryFn: () => getAllSemesters(teacherDeptId),
        enabled: !!teacherDeptId && isOpen,
        staleTime: Infinity
    });

    const { data: courses = [] } = useQuery({
        queryKey: ['courses', selectedSem],
        queryFn: () => getAllCourses(selectedSem),
        enabled: !!selectedSem,
        staleTime: Infinity
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

    const selectBase = "w-full h-12 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold outline-none focus:border-violet-600 appearance-none transition-all shadow-sm disabled:opacity-60 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50";
    const labelStyle = "text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-2 block";

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="flex items-center gap-4 mb-8 px-1 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/20 shrink-0">
                    <Award size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white leading-none">Course <span className="text-violet-600">Mapping</span></h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">{teacher?.first_name} {teacher?.last_name}</p>
                </div>
            </div>

            <div className="space-y-5">
                <div className="flex flex-col">
                    <label htmlFor='dept' className={labelStyle}>Faculty Department</label>
                    <div className="relative group">
                        <select id='dept' name='dept' className={selectBase} value={teacherDeptId} disabled={true}>
                            {departments.map(d => (
                                <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="sem-select" className={labelStyle}>Academic Level</label>
                    <div className="relative group">
                        <select 
                            id="sem-select"
                            className={selectBase}
                            value={selectedSem}
                            onChange={(e) => { setSelectedSem(e.target.value); setSelectedCourse(''); }}
                            required
                        >
                            <option value="">CHOOSE SEMESTER</option>
                            {semesters.map(s => <option key={s._id} value={s._id}>SEMESTER {s.sem_number}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {selectedSem && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col">
                            <label htmlFor="course-select" className={labelStyle}>Target Course</label>
                            <div className="relative group">
                                <select 
                                    id="course-select"
                                    className={selectBase}
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    required
                                >
                                    <option value="">CHOOSE COURSE</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.course_code} - {c.name.toUpperCase()}</option>)}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                    {selectedCourse && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 pt-2">
                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between shadow-inner">
                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Set as Lead Instructor</span>
                                <button
                                    type="button"
                                    onClick={() => setIsPrimary(!isPrimary)}
                                    className={`w-11 h-6 rounded-full transition-all relative ${isPrimary ? 'bg-violet-600 shadow-lg shadow-violet-600/20' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                                >
                                    <motion.div
                                        animate={{ x: isPrimary ? 22 : 2 }}
                                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>

                            {!alreadyAssigned ? (
                                <Button
                                    className="h-14 rounded-2xl shadow-xl shadow-violet-500/20"
                                    isLoading={assignMutation.isPending}
                                    onClick={() => assignMutation.mutate({ course_id: selectedCourse, teacher_id: teacher._id, is_primary: isPrimary })}
                                >
                                    Confirm Assignment
                                </Button>
                            ) : (
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-5 text-center border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                                    <BadgeCheck size={24} className="text-emerald-500 mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Personnel already registered for this subject</p>
                                </div>
                            )}

                            {assigned.length > 0 && (
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <Users size={16} className="text-zinc-400" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Rostered Faculty ({assigned.length})</p>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar pr-1">
                                        {assigned.map((a, idx) => (
                                            <motion.div
                                                key={a._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 rounded-xl px-4 py-3 border border-zinc-100 dark:border-zinc-800 transition-all hover:border-violet-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold dark:text-zinc-200 capitalize">{a.first_name} {a.last_name}</span>
                                                    {a.is_primary && (
                                                        <div className="flex items-center gap-1 bg-violet-600 px-1.5 py-0.5 rounded-md shadow-sm">
                                                            <Star size={8} className="text-white fill-white" />
                                                            <span className="text-[7px] font-black uppercase text-white">Lead</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button 
                                                    variant="secondary"
                                                    icon={X}
                                                    onClick={() => removeMutation.mutate(a._id)}
                                                    className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border-none shadow-none"
                                                    isLoading={removeMutation.isPending && selectedCourse === a.course_id}
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

            <div className="pt-6 mt-4 border-t dark:border-zinc-800">
                <Button variant="ghost" onClick={onClose} className="rounded-xl border-zinc-200 dark:border-zinc-800">Exit Deployment</Button>
            </div>
        </Modal>
    );
};

export default AssignModal;