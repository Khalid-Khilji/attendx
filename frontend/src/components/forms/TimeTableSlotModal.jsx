import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { Modal, Button, Input } from '../index';
import { createSlot, getAllCourses, getAllSemesters, getCourseTeachers } from '../../api/index';
import useAdminStore from '../../stores/admin';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableSlotModal = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const { departments, academicYears, setSemesters } = useAdminStore();

    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [selectedSemId, setSelectedSemId] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [commonData, setCommonData] = useState({
        academic_year_id: '',
        version_tag: 'v1',
        valid_from: new Date().toLocaleDateString('en-CA')
    });

    const [dynamicSlots, setDynamicSlots] = useState([
        { id: Date.now(), course_id: '', teacher_id: '', start_time: '', end_time: '', assignedTeachers: [], fetchError: false }
    ]);

    const { data: semesters = [], isLoading: semsLoading } = useQuery({
        queryKey: ['semesters', selectedDeptId],
        queryFn: () => getAllSemesters(selectedDeptId),
        enabled: !!selectedDeptId,
        staleTime: Infinity,
        onSuccess: (data) => setSemesters(data)
    });

    const { data: courses = [] } = useQuery({
        queryKey: ['courses', selectedSemId],
        queryFn: () => getAllCourses(selectedSemId),
        enabled: !!selectedSemId,
        staleTime: Infinity
    });

    const batchMutation = useMutation({
        mutationFn: async (payloads) => Promise.all(payloads.map(slot => createSlot(slot))),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable'] });
            onClose();
        }
    });

    const handleCourseChange = async (slotId, courseId) => {
        if (!courseId) {
            setDynamicSlots(prev => prev.map(s => s.id === slotId ? { ...s, course_id: '', assignedTeachers: [], teacher_id: '', fetchError: false } : s));
            return;
        }

        setDynamicSlots(prev => prev.map(s => s.id === slotId ? { ...s, course_id: courseId, assignedTeachers: [], teacher_id: '', fetchError: false } : s));

        try {
            const teachers = await getCourseTeachers(courseId);
            setDynamicSlots(prev => prev.map(s => {
                if (s.id === slotId) {
                    return {
                        ...s,
                        assignedTeachers: teachers,
                        teacher_id: teachers.length === 1 ? teachers[0]._id : '',
                        fetchError: false
                    };
                }
                return s;
            }));
        } catch (error) {
            setDynamicSlots(prev => prev.map(s => s.id === slotId ? { ...s, assignedTeachers: [], fetchError: true } : s));
        }
    };

    const handleSlotChange = (id, field, value) => {
        setDynamicSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = dynamicSlots.map(slot => ({
            ...commonData,
            sem_id: selectedSemId,
            day_of_week: selectedDay,
            course_id: slot.course_id,
            teacher_id: slot.teacher_id,
            start_time: slot.start_time,
            end_time: slot.end_time
        }));
        batchMutation.mutate(payload);
    };

    const selectBase = "w-full h-[46px] px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[13px] font-bold outline-none focus:border-violet-600 appearance-none transition-all shadow-sm disabled:opacity-60";
    const labelStyle = "text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1 mb-2 block";

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Batch Scheduler">
            <form onSubmit={handleSubmit} className="space-y-8 px-1" autoComplete="off">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div>
                        <label htmlFor='dept' className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                            Department
                        </label>
                        <select
                            id='dept'
                            name='dept'
                            className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
                            value={selectedDeptId}
                            onChange={(e) => { setSelectedDeptId(e.target.value); setSelectedSemId(''); }}
                            required
                        >
                            <option value="">Select Dept</option>
                            {departments.map(d => (
                                <option key={d._id} value={d._id}>
                                    {d.name.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor='sem' className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                            Semester
                        </label>
                        <select
                            id='sem'
                            name='sem'
                            className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            value={selectedSemId}
                            onChange={(e) => setSelectedSemId(e.target.value)}
                            disabled={!selectedDeptId}
                            required
                        >
                            <option value="">{semsLoading ? 'Syncing...' : 'Select Sem'}</option>
                            {semesters.map(s => (
                                <option key={s._id} value={s._id}>
                                    Sem {s.sem_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor='day' className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                            Weekday
                        </label>
                        <select
                            id='day'
                            name='day'
                            className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            required
                        >
                            <option value="">Select Day</option>
                            {DAYS.map(d => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor='year' className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                            Academic Year
                        </label>
                        <select
                            id='year'
                            name='year'
                            className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
                            value={commonData.academic_year_id}
                            onChange={(e) => setCommonData(p => ({ ...p, academic_year_id: e.target.value }))}
                            required
                        >
                            <option value="">Select Year</option>
                            {academicYears.map(y => (
                                <option key={y._id} value={y._id}>
                                    {y.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor='effective_from' className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                            Effective From
                        </label>
                        <input
                            id='effective_from'
                            name='effective_from'
                            type="date"
                            value={commonData.valid_from}
                            onChange={(e) => setCommonData(p => ({ ...p, valid_from: e.target.value }))}
                            required
                            className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2.5 text-violet-600">
                            <Clock size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest leading-none">Lecture Sequence</span>
                        </div>
                        <button type="button" onClick={() => setDynamicSlots(p => [...p, { id: Date.now(), course_id: '', teacher_id: '', start_time: '', end_time: '', assignedTeachers: [], fetchError: false }])} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-violet-600 hover:border-violet-500 transition-all">
                            <Plus size={14} /> Add Lecture
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[45vh] overflow-y-auto hide-scrollbar px-1">
                        <AnimatePresence initial={false}>
                            {dynamicSlots.map((slot) => {
                                const noTeacher = slot.course_id && !slot.fetchError && slot.assignedTeachers.length === 0;

                                return (
                                    <motion.div
                                        key={slot.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`bg-white dark:bg-zinc-900/50 p-4 rounded-xl border ${noTeacher
                                            ? 'border-red-400 dark:border-red-500 shadow-lg shadow-red-500/5'
                                            : 'border-zinc-100 dark:border-zinc-800'
                                            }`}
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                                            <div className="sm:col-span-1 lg:col-span-3">
                                                <label htmlFor='course' className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                                                    Course Object
                                                </label>
                                                <select
                                                    id='course'
                                                    name='course'
                                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    value={slot.course_id}
                                                    onChange={(e) => handleCourseChange(slot.id, e.target.value)}
                                                    required
                                                    disabled={!selectedSemId}
                                                >
                                                    <option value="">Select Subject</option>
                                                    {courses.map(c => (
                                                        <option key={c._id} value={c._id}>
                                                            {c.course_code} - {c.short_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="sm:col-span-1 lg:col-span-3">
                                                <label htmlFor='instructor' className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                                                    Instructor
                                                </label>
                                                <select
                                                    id='instructor'
                                                    name='instructor'
                                                    className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${noTeacher
                                                        ? 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 focus:border-red-600 focus:ring-red-600'
                                                        : 'border-zinc-200 dark:border-zinc-700 focus:border-violet-600 focus:ring-violet-600'
                                                        }`}
                                                    value={slot.teacher_id}
                                                    onChange={(e) => handleSlotChange(slot.id, 'teacher_id', e.target.value)}
                                                    required={!noTeacher}
                                                    disabled={slot.assignedTeachers.length <= 1 || noTeacher}
                                                >
                                                    <option value="">
                                                        {!slot.course_id && 'Choose Course first'}
                                                        {slot.fetchError && 'Sync Failed'}
                                                        {noTeacher && 'Assign Teacher First'}
                                                        {slot.course_id && !noTeacher && 'Select Faculty'}
                                                    </option>
                                                    {slot.assignedTeachers.map(t => (
                                                        <option key={t._id} value={t._id}>
                                                            {t.first_name} {t.last_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="sm:col-span-1 lg:col-span-2">
                                                <label htmlFor='start_time' className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                                                    Start Time
                                                </label>
                                                <input
                                                    id='start_time'
                                                    name='start_time'
                                                    type="time"
                                                    value={slot.start_time}
                                                    onChange={(e) => handleSlotChange(slot.id, 'start_time', e.target.value)}
                                                    required
                                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
                                                />
                                            </div>

                                            <div className="sm:col-span-1 lg:col-span-2">
                                                <label htmlFor='end_time' className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                                                    End Time
                                                </label>
                                                <input
                                                    id='end_time'
                                                    name='end_time'
                                                    type="time"
                                                    value={slot.end_time}
                                                    onChange={(e) => handleSlotChange(slot.id, 'end_time', e.target.value)}
                                                    required
                                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
                                                />
                                            </div>

                                            <div className="sm:col-span-2 lg:col-span-2 flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={() => dynamicSlots.length > 1 && setDynamicSlots(p => p.filter(s => s.id !== slot.id))}
                                                    disabled={dynamicSlots.length <= 1}
                                                    className="w-full h-10 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-50 dark:disabled:hover:bg-red-500/10 disabled:hover:text-red-500 flex items-center justify-center gap-2 border border-red-100 dark:border-red-500/20"
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="text-sm font-medium hidden sm:inline">Remove</span>
                                                </button>
                                            </div>

                                            {noTeacher && (
                                                <div className="col-span-full flex items-center gap-2 p-2 bg-red-50 dark:bg-red-500/5 rounded-lg border border-red-200 dark:border-red-500/20">
                                                    <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                                                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                                        Warning: No personnel mapped to this course. Update via Courses Portal.
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 py-3">
                    <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]" onClick={onClose} type="button">Discard</Button>
                    <Button type="submit" className="flex-[2] h-14 rounded-2xl shadow-xl shadow-violet-500/20 font-black uppercase tracking-widest text-[11px]" isLoading={batchMutation.isPending}>
                        Confirm Batch Entry ({dynamicSlots.length})
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TimetableSlotModal;