import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Modal, Button } from '../index';
import { createSlot, getAllCourses, getAllSemesters, getCourseTeachers, getSemBatches } from '../../api/index';
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
        { id: Date.now(), course_id: '', teacher_id: '', batch_id: '', start_time: '', end_time: '', assignedTeachers: [], fetchError: false }
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

    const { data: batches = [] } = useQuery({
        queryKey: ['batches', selectedSemId],
        queryFn: () => getSemBatches(selectedSemId),
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
                        teacher_id: teachers.length === 1 ? teachers[0].teacher_id : '',
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
            batch_id: slot.batch_id || null,
            start_time: slot.start_time,
            end_time: slot.end_time
        }));
        batchMutation.mutate(payload);
    };

    const selectClass = "w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-colors disabled:opacity-50 appearance-none";

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Sequence Architect">
            <form onSubmit={handleSubmit} className="space-y-8 px-1" autoComplete="off">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Department</label>
                        <select className={selectClass} value={selectedDeptId} onChange={(e) => { setSelectedDeptId(e.target.value); setSelectedSemId(''); }} required>
                            <option value="">Select Dept</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Semester</label>
                        <select className={selectClass} value={selectedSemId} onChange={(e) => setSelectedSemId(e.target.value)} disabled={!selectedDeptId} required>
                            <option value="">{semsLoading ? 'Syncing...' : 'Select Sem'}</option>
                            {semesters.map(s => <option key={s._id} value={s._id}>Sem {s.sem_number}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Weekday</label>
                        <select className={selectClass} value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} required>
                            <option value="">Select Day</option>
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Academic Year</label>
                        <select className={selectClass} value={commonData.academic_year_id} onChange={(e) => setCommonData(p => ({ ...p, academic_year_id: e.target.value }))} required>
                            <option value="">Select Year</option>
                            {academicYears.map(y => <option key={y._id} value={y._id}>{y.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Effective From</label>
                        <input type="date" value={commonData.valid_from} onChange={(e) => setCommonData(p => ({ ...p, valid_from: e.target.value }))} required className={selectClass} />
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2.5 text-violet-600">
                            <Clock size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest leading-none">Lecture Sequence</span>
                        </div>
                        <button type="button" onClick={() => setDynamicSlots(p => [...p, { id: Date.now(), course_id: '', teacher_id: '', batch_id: '', start_time: '', end_time: '', assignedTeachers: [], fetchError: false }])} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-violet-600 hover:border-violet-500 transition-all">
                            <Plus size={14} /> Add Slot
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[45vh] overflow-y-auto hide-scrollbar px-1">
                        <AnimatePresence initial={false}>
                            {dynamicSlots.map((slot) => (
                                <motion.div key={slot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                                        <div className="lg:col-span-3">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5 ml-1">Subject</label>
                                            <select className={selectClass} value={slot.course_id} onChange={(e) => handleCourseChange(slot.id, e.target.value)} required disabled={!selectedSemId}>
                                                <option value="">Select Subject</option>
                                                {courses.map(c => <option key={c._id} value={c._id}>{c.course_code} - {c.short_name}</option>)}
                                            </select>
                                        </div>
                                        <div className="lg:col-span-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5 ml-1">Batch (Opt)</label>
                                            <select className={selectClass} value={slot.batch_id} onChange={(e) => handleSlotChange(slot.id, 'batch_id', e.target.value)} disabled={!selectedSemId}>
                                                <option value="">Full Class</option>
                                                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="lg:col-span-3">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5 ml-1">Instructor</label>
                                            <select className={selectClass} value={slot.teacher_id} onChange={(e) => handleSlotChange(slot.id, 'teacher_id', e.target.value)} required disabled={slot.assignedTeachers.length <= 1}>
                                                <option value="">{slot.course_id ? 'Select Faculty' : 'Choose Course'}</option>
                                                {slot.assignedTeachers.map(t => (
                                                    <option key={t.teacher_id} value={t.teacher_id}>
                                                        {t.first_name} {t.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="lg:col-span-3 grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5 ml-1">Start</label>
                                                <input type="time" value={slot.start_time} onChange={(e) => handleSlotChange(slot.id, 'start_time', e.target.value)} required className={selectClass} />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5 ml-1">End</label>
                                                <input type="time" value={slot.end_time} onChange={(e) => handleSlotChange(slot.id, 'end_time', e.target.value)} required className={selectClass} />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-1 flex items-end">
                                            <button type="button" onClick={() => dynamicSlots.length > 1 && setDynamicSlots(p => p.filter(s => s.id !== slot.id))} className="w-full h-10 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100 dark:border-red-500/20 disabled:opacity-30" disabled={dynamicSlots.length <= 1}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-950 py-3">
                    <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]" onClick={onClose} type="button">Discard</Button>
                    <Button type="submit" className="flex-2 h-14 rounded-2xl shadow-xl shadow-violet-500/20 font-black uppercase tracking-widest text-[11px]" isLoading={batchMutation.isPending}>
                        Commit Batch Entry ({dynamicSlots.length})
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TimetableSlotModal;