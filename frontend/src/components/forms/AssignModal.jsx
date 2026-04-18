import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Award, ShieldCheck, RefreshCcw, Briefcase, X } from 'lucide-react';
import {
    getAllSemesters, getAllCourses, assignTeacherToCourse,
    updateCourseTeacher, getSemBatches
} from '../../api/index';
import { Modal, Button, Input } from '../../components/index';
import { toast } from 'react-toastify';
import useAdminStore from '../../stores/admin';

const AssignModal = ({ isOpen, onClose, teacher, editAsgnData = null }) => {
    const queryClient = useQueryClient();
    const { departments } = useAdminStore();

    const [selectedSem, setSelectedSem] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);

    const teacherDeptId = teacher?.dept_id || '';
    const teacherDeptName = departments.find(d => d._id === teacherDeptId)?.name || 'General';

    const { data: semesters = [] } = useQuery({
        queryKey: ['semesters', teacherDeptId],
        queryFn: () => getAllSemesters(teacherDeptId),
        enabled: !!teacherDeptId && isOpen,
        staleTime: Infinity
    });

    const { data: courses = [] } = useQuery({
        queryKey: ['courses', selectedSem],
        queryFn: () => getAllCourses(selectedSem),
        enabled: !!selectedSem && isOpen,
        staleTime: Infinity
    });

    const { data: batches = [] } = useQuery({
        queryKey: ['batches', selectedSem],
        queryFn: () => getSemBatches(selectedSem),
        enabled: !!selectedSem && isOpen,
        staleTime: Infinity
    });

    useEffect(() => {
        if (editAsgnData && isOpen) {
            setIsPrimary(editAsgnData.is_primary || false);

            if (editAsgnData.sem_id) {
                setSelectedSem(editAsgnData.sem_id);
                setSelectedCourse(editAsgnData.course_id || '');
                setSelectedBatch(editAsgnData.batch_id || '');
            } else {
                setSelectedSem('');
                setSelectedCourse('');
                setSelectedBatch('');
            }
        } else if (isOpen) {
            setSelectedSem('');
            setSelectedCourse('');
            setSelectedBatch('');
            setIsPrimary(false);
        }
    }, [editAsgnData, isOpen]);

    useEffect(() => {
        if (editAsgnData && editAsgnData.course_code && courses.length > 0 && !selectedCourse) {
            const matchedCourse = courses.find(c => c.course_code === editAsgnData.course_code);
            if (matchedCourse) {
                setSelectedCourse(matchedCourse._id);
            }
        }
    }, [courses, editAsgnData, selectedCourse]);

    useEffect(() => {
        if (editAsgnData && editAsgnData.batch_name && batches.length > 0 && !selectedBatch) {
            const matchedBatch = batches.find(b => b.name === editAsgnData.batch_name);
            if (matchedBatch) {
                setSelectedBatch(matchedBatch._id);
            }
        }
    }, [batches, editAsgnData, selectedBatch]);

    const assignMutation = useMutation({
        mutationFn: (data) => {
            if (editAsgnData) {
                return updateCourseTeacher(editAsgnData._id, data);
            }
            return assignTeacherToCourse(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            toast.success(editAsgnData ? "Configuration Updated" : "Mapping Established");
            onClose();
        },
        onError: (err) => toast.error(err.error || "System failure")
    });

    const selectBase = "w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-bold outline-none focus:border-violet-600 appearance-none transition-all shadow-sm disabled:opacity-60 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50 cursor-pointer disabled:cursor-not-allowed";
    const labelStyle = "text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-0.5 sm:ml-1 mb-1.5 sm:mb-2 block";

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-0 sm:px-1 pt-0 sm:pt-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/20 shrink-0">
                    {editAsgnData ? <RefreshCcw size={20} className="sm:size-6" /> : <Award size={20} className="sm:size-6" />}
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter dark:text-white leading-none">
                        {editAsgnData ? 'Modify' : 'Resource'} <span className="text-violet-600">{editAsgnData ? 'Entry' : 'Mapping'}</span>
                    </h2>
                    <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                        {teacher?.first_name} {teacher?.last_name}
                    </p>
                </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col">
                    <label htmlFor="dept_display" className={labelStyle}>Faculty Department</label>
                    <Input
                        id="dept_display"
                        name="dept_display"
                        value={teacherDeptName.toUpperCase()}
                        disabled
                        icon={Briefcase}
                        className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-none bg-zinc-50 dark:bg-zinc-900 font-bold opacity-70 text-xs sm:text-sm"
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="semester_select" className={labelStyle}>Academic Level</label>
                    <div className="relative group">
                        <select
                            id="semester_select"
                            name="semester"
                            className={selectBase}
                            value={selectedSem}
                            onChange={(e) => {
                                setSelectedSem(e.target.value);
                                setSelectedCourse('');
                                setSelectedBatch('');
                            }}
                        >
                            <option value="">CHOOSE SEMESTER</option>
                            {semesters.map(s => (
                                <option key={s._id} value={s._id}>
                                    SEMESTER {s.sem_number}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 sm:size-4" />
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {selectedSem && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-3"
                        >
                            <div className="flex flex-col">
                                <label htmlFor="course_select" className={labelStyle}>Target Course</label>
                                <div className="relative group">
                                    <select
                                        id="course_select"
                                        name="course"
                                        className={selectBase}
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                    >
                                        <option value="">SELECT COURSE</option>
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>
                                                {c.course_code} - {c.short_name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none sm:size-4" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="batch_select" className={labelStyle}>Batch Group</label>
                                <div className="relative group">
                                    <select
                                        id="batch_select"
                                        name="batch"
                                        className={selectBase}
                                        value={selectedBatch}
                                        onChange={(e) => setSelectedBatch(e.target.value)}
                                    >
                                        <option value="">ENTIRE SEMESTER</option>
                                        {batches.map(b => (
                                            <option key={b._id} value={b._id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none sm:size-4" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {editAsgnData && selectedCourse && (
                    <div className="bg-violet-50 dark:bg-violet-950/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-violet-100 dark:border-violet-900">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase text-violet-600 mb-2 tracking-widest">
                            Current Assignment
                        </p>
                        <div className="space-y-1">
                            <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                {editAsgnData.course_code} - {editAsgnData.short_name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-zinc-500">
                                Batch: {editAsgnData.batch_name || 'Entire Semester'}
                            </p>
                            <p className="text-[10px] sm:text-xs text-zinc-500">
                                Role: {editAsgnData.is_primary ? 'Lead Faculty' : 'Support Faculty'}
                            </p>
                        </div>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {selectedCourse && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4 sm:space-y-4 pt-1 sm:pt-2"
                        >
                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-2">
                                    <ShieldCheck size={14} className={`sm:size-4 ${isPrimary ? "text-violet-600" : "text-zinc-400"}`} />
                                    <span className="text-[10px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-tighter">
                                        Lead Faculty Status
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPrimary(!isPrimary)}
                                    className={`w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-all relative ${isPrimary ? 'bg-violet-600 shadow-lg' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                                >
                                    <motion.div
                                        animate={{ x: isPrimary ? 18 : 2 }}
                                        className="absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t dark:border-zinc-800 flex gap-2 sm:gap-3">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] uppercase font-black"
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl shadow-lg font-black uppercase tracking-widest text-[9px] sm:text-[10px]"
                    isLoading={assignMutation.isPending}
                    onClick={() => assignMutation.mutate({
                        course_id: selectedCourse,
                        teacher_id: teacher._id,
                        is_primary: isPrimary,
                        batch_id: selectedBatch || null
                    })}
                    disabled={!selectedCourse}
                >
                    {editAsgnData ? 'Save Changes' : 'Confirm Assignment'}
                </Button>
            </div>
        </Modal>
    );
};

export default AssignModal;