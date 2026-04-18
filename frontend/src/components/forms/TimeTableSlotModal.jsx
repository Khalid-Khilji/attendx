import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Clock, ChevronDown, X, Save, BookOpen } from 'lucide-react';
import { Modal, Button } from '../index';
import { createSlot, getAllCourses, getCourseTeachers, getSemBatches, getAllSemesters } from '../../api/index';
import useAdminStore from '../../stores/admin';
import { toast } from 'react-toastify';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatName = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const TimePicker = ({ value, onChange, label }) => {
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');
    const [ampm, setAmPm] = useState('AM');

    useEffect(() => {
        if (value) {
            const match = value.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (match) {
                setHour(match[1].padStart(2, '0'));
                setMinute(match[2]);
                setAmPm(match[3].toUpperCase());
            }
        } else {
            setHour('');
            setMinute('');
            setAmPm('AM');
        }
    }, [value]);

    const updateTime = () => {
        if (hour && minute) {
            onChange(`${hour}:${minute} ${ampm}`);
        }
    };

    useEffect(() => {
        if (hour && minute) {
            updateTime();
        }
    }, [hour, minute, ampm]);

    return (
        <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 block">{label}</label>
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <select value={hour} onChange={(e) => setHour(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer">
                        <option value="">HH</option>
                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                            <option key={h} value={h}>{h}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
                <div className="flex-1 relative">
                    <select value={minute} onChange={(e) => setMinute(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer">
                        <option value="">MM</option>
                        {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
                <div className="w-24 relative">
                    <select value={ampm} onChange={(e) => setAmPm(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer">
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

const TimetableSlotModal = ({ isOpen, onClose, editData, selectedSem: propSelectedSem, selectedDept: propSelectedDept }) => {
    const queryClient = useQueryClient();
    const { departments, academicYears } = useAdminStore();

    const [selectedDept, setSelectedDept] = useState(propSelectedDept || '');
    const [selectedSem, setSelectedSem] = useState(propSelectedSem || '');
    const [selectedDay, setSelectedDay] = useState('');
    const [commonData, setCommonData] = useState({
        academic_year_id: '',
        version_tag: 'v1',
        valid_from: new Date().toLocaleDateString('en-CA')
    });
    const [dynamicSlots, setDynamicSlots] = useState([
        { id: Date.now(), course_id: '', teacher_id: '', batch_id: '', start_time: '', end_time: '', assignedTeachers: [] }
    ]);

    const { data: semesters = [] } = useQuery({
        queryKey: ['semesters', selectedDept],
        queryFn: () => getAllSemesters(selectedDept),
        enabled: !!selectedDept,
        staleTime: Infinity,
    });

    const { data: courses = [] } = useQuery({
        queryKey: ['courses', selectedSem],
        queryFn: () => getAllCourses(selectedSem),
        enabled: !!selectedSem,
        staleTime: Infinity
    });

    const { data: batches = [] } = useQuery({
        queryKey: ['batches', selectedSem],
        queryFn: () => getSemBatches(selectedSem),
        enabled: !!selectedSem,
        staleTime: Infinity
    });

    const createMutation = useMutation({
        mutationFn: async (payloads) => {
            const results = [];
            for (const slot of payloads) {
                const result = await createSlot(slot);
                results.push(result);
            }
            return results;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable', selectedSem] });
            toast.success(`${dynamicSlots.length} slot(s) created successfully`);
            onClose();
            resetForm();
        },
        onError: (err) => toast.error(err.error || "Failed to create slots")
    });

    const resetForm = () => {
        setSelectedDay('');
        setCommonData({
            academic_year_id: '',
            version_tag: 'v1',
            valid_from: new Date().toLocaleDateString('en-CA')
        });
        setDynamicSlots([
            { id: Date.now(), course_id: '', teacher_id: '', batch_id: '', start_time: '', end_time: '', assignedTeachers: [] }
        ]);
        if (!propSelectedDept) setSelectedDept('');
        if (!propSelectedSem) setSelectedSem('');
    };

    const handleCourseChange = async (slotId, courseId) => {
        if (!courseId) {
            setDynamicSlots(prev => prev.map(s => s.id === slotId ? { ...s, course_id: '', assignedTeachers: [], teacher_id: '' } : s));
            return;
        }
        setDynamicSlots(prev => prev.map(s => s.id === slotId ? { ...s, course_id: courseId, assignedTeachers: [], teacher_id: '' } : s));
        try {
            const teachers = await getCourseTeachers(courseId);
            const formattedTeachers = teachers.map(t => ({
                ...t,
                first_name: formatName(t.first_name),
                last_name: formatName(t.last_name)
            }));
            setDynamicSlots(prev => prev.map(s => {
                if (s.id === slotId) {
                    return {
                        ...s,
                        assignedTeachers: formattedTeachers,
                        teacher_id: formattedTeachers.length === 1 ? formattedTeachers[0].teacher_id : ''
                    };
                }
                return s;
            }));
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        }
    };

    const handleSlotChange = (id, field, value) => {
        setDynamicSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const addSlot = () => {
        setDynamicSlots(prev => [...prev, {
            id: Date.now(),
            course_id: '',
            teacher_id: '',
            batch_id: '',
            start_time: '',
            end_time: '',
            assignedTeachers: []
        }]);
    };

    const removeSlot = (id) => {
        if (dynamicSlots.length > 1) {
            setDynamicSlots(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDept) {
            toast.error("Please select department");
            return;
        }
        if (!selectedSem) {
            toast.error("Please select semester");
            return;
        }
        if (!selectedDay) {
            toast.error("Please select a day");
            return;
        }
        if (!commonData.academic_year_id) {
            toast.error("Please select academic year");
            return;
        }

        const invalidSlots = dynamicSlots.filter(slot => !slot.course_id || !slot.teacher_id || !slot.start_time || !slot.end_time);
        if (invalidSlots.length > 0) {
            toast.error("Please fill all slot details");
            return;
        }

        const payload = dynamicSlots.map(slot => ({
            ...commonData,
            sem_id: selectedSem,
            day_of_week: selectedDay,
            course_id: slot.course_id,
            teacher_id: slot.teacher_id,
            batch_id: slot.batch_id || null,
            start_time: slot.start_time,
            end_time: slot.end_time
        }));
        createMutation.mutate(payload);
    };

    const selectClass = "w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer disabled:opacity-50";

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <Clock size={18} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 dark:text-white">Create <span className="text-violet-600">Schedule Slots</span></h2>
                        <p className="text-xs text-zinc-500">Add multiple slots for the same day</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 block">Department</label>
                        <div className="relative">
                            <select
                                value={selectedDept}
                                onChange={(e) => { setSelectedDept(e.target.value); setSelectedSem(''); }}
                                className={selectClass}
                                required
                                disabled={!!propSelectedDept}
                            >
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{formatName(d.name)}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 block">Semester</label>
                        <div className="relative">
                            <select
                                value={selectedSem}
                                onChange={(e) => setSelectedSem(e.target.value)}
                                className={selectClass}
                                disabled={!selectedDept || !!propSelectedSem}
                                required
                            >
                                <option value="">Select Semester</option>
                                {semesters.map(s => <option key={s._id} value={s._id}>Semester {s.sem_number}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 block">Weekday</label>
                        <div className="relative">
                            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className={selectClass} required>
                                <option value="">Select Day</option>
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 block">Academic Year</label>
                        <div className="relative">
                            <select value={commonData.academic_year_id} onChange={(e) => setCommonData(p => ({ ...p, academic_year_id: e.target.value }))} className={selectClass} required>
                                <option value="">Select Year</option>
                                {academicYears.map(y => <option key={y._id} value={y._id}>{y.label}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-violet-600" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Lecture Slots</span>
                        </div>
                        <button type="button" onClick={addSlot} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-violet-600 hover:border-violet-500 transition-all">
                            <Plus size={12} /> Add Slot
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        <AnimatePresence initial={false}>
                            {dynamicSlots.map((slot, index) => (
                                <motion.div key={slot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black text-violet-600 bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded-lg">Slot {index + 1}</span>
                                        {dynamicSlots.length > 1 && (
                                            <button type="button" onClick={() => removeSlot(slot.id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-1 block">Course</label>
                                            <div className="relative">
                                                <select value={slot.course_id} onChange={(e) => handleCourseChange(slot.id, e.target.value)} className={selectClass} required disabled={!selectedSem}>
                                                    <option value="">{selectedSem ? 'Select Course' : 'Select Semester First'}</option>
                                                    {courses.map(c => (
                                                        <option key={c._id} value={c._id}>{c.course_code} - {c.short_name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-1 block">Teacher</label>
                                            <div className="relative">
                                                <select
                                                    value={slot.teacher_id}
                                                    onChange={(e) => handleSlotChange(slot.id, 'teacher_id', e.target.value)}
                                                    className={selectClass}
                                                    disabled={!slot.course_id}
                                                    required
                                                >
                                                    <option value="">{slot.course_id ? 'Select Teacher' : 'Choose Course First'}</option>
                                                    {slot.assignedTeachers.map(t => (
                                                        <option key={t.teacher_id} value={t.teacher_id}>
                                                            {t.first_name} {t.last_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <TimePicker value={slot.start_time} onChange={(val) => handleSlotChange(slot.id, 'start_time', val)} label="Start Time" />
                                        <TimePicker value={slot.end_time} onChange={(val) => handleSlotChange(slot.id, 'end_time', val)} label="End Time" />
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-1 block">Batch</label>
                                            <div className="relative">
                                                <select value={slot.batch_id} onChange={(e) => handleSlotChange(slot.id, 'batch_id', e.target.value)} className={selectClass} disabled={!selectedSem}>
                                                    <option value="">All Batches</option>
                                                    {batches.map(b => (
                                                        <option key={b._id} value={b._id}>Batch {b.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t dark:border-zinc-800">
                    <Button variant="ghost" className="flex-1 h-12 rounded-xl font-black text-xs" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button type="submit" icon={Save} className="flex-1 h-12 rounded-xl font-black text-xs shadow-lg shadow-violet-600/20" isLoading={createMutation.isPending}>
                        Create {dynamicSlots.length} Slot{dynamicSlots.length !== 1 ? 's' : ''}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TimetableSlotModal;