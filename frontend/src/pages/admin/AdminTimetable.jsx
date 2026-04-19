import { useState, useMemo, lazy, Suspense, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Calendar, LayoutGrid, ChevronDown, Hash, Edit3, Clock, AlertCircle, BookOpen, User, X, Save } from 'lucide-react';
import { getSemTimetable, deleteSlot, getAllSemesters, getSemBatches, updateSlot, getAllCourses, getCourseTeachers } from '../../api/index';
import { Button, Loader, Modal } from '../../components/index';
import useAdminStore from '../../stores/admin';
import { toast } from 'react-toastify';

const TimetableSlotModal = lazy(() => import('../../components/index').then(m => ({ default: m.TimetableSlotModal })));

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
    }
  }, [value]);

  const updateTime = () => {
    if (hour && minute) {
      onChange(`${hour}:${minute} ${ampm}`);
    }
  };

  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 block">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <select value={hour} onChange={(e) => { setHour(e.target.value); updateTime(); }} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer">
            <option value="">HH</option>
            {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (<option key={h} value={h}>{h}</option>))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
        <div className="flex-1 relative">
          <select value={minute} onChange={(e) => { setMinute(e.target.value); updateTime(); }} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer">
            <option value="">MM</option>
            {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (<option key={m} value={m}>{m}</option>))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
        <div className="w-24 relative">
          <select value={ampm} onChange={(e) => { setAmPm(e.target.value); updateTime(); }} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer">
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

const AdminTimetable = () => {
  const queryClient = useQueryClient();
  const { departments } = useAdminStore();

  const [slotModal, setSlotModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [editingSlot, setEditingSlot] = useState(null);

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters', selectedDept],
    queryFn: () => getAllSemesters(selectedDept),
    enabled: !!selectedDept,
    staleTime: Infinity,
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['batches', selectedSem],
    queryFn: () => getSemBatches(selectedSem),
    enabled: !!selectedSem,
  });

  const { data: slots = [], isLoading, refetch } = useQuery({
    queryKey: ['timetable', selectedSem],
    queryFn: () => {
      if (!selectedSem) return [];
      return getSemTimetable(selectedSem);
    },
    enabled: !!selectedSem,
    staleTime: 0,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['allCourses', selectedSem],
    queryFn: () => getAllCourses(selectedSem),
    enabled: !!selectedSem,
    staleTime: Infinity,
  });

  const { data: teachersList = [] } = useQuery({
    queryKey: ['teachersForCourse', editingSlot?.course_id],
    queryFn: () => {
      if (!editingSlot?.course_id) return [];
      return getCourseTeachers(editingSlot.course_id);
    },
    enabled: !!editingSlot?.course_id,
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable', selectedSem] });
      setDeleteConfirm({ open: false, id: null });
      toast.success("Slot deleted successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable', selectedSem] });
      setEditingSlot(null);
      toast.success("Slot updated successfully");
      refetch();
    },
  });

  const filteredSlots = useMemo(() => {
    if (!selectedBatch) return slots;
    return slots.filter(s => !s.batch_id || s.batch_id === selectedBatch);
  }, [slots, selectedBatch]);

  const groupedSlots = useMemo(() => {
    return DAYS.reduce((acc, day) => {
      acc[day] = filteredSlots
        .filter(s => s.day_of_week === day)
        .sort((a, b) => {
          const timeA = a.start_time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          const timeB = b.start_time.match(/(\d+):(\d+)\s*(AM|PM)/i);

          if (!timeA || !timeB) return 0;

          let hoursA = parseInt(timeA[1]);
          const minutesA = parseInt(timeA[2]);
          const isPMA = timeA[3].toUpperCase() === 'PM';

          let hoursB = parseInt(timeB[1]);
          const minutesB = parseInt(timeB[2]);
          const isPMB = timeB[3].toUpperCase() === 'PM';

          if (isPMA && hoursA !== 12) hoursA += 12;
          if (!isPMA && hoursA === 12) hoursA = 0;
          if (isPMB && hoursB !== 12) hoursB += 12;
          if (!isPMB && hoursB === 12) hoursB = 0;

          const totalMinutesA = hoursA * 60 + minutesA;
          const totalMinutesB = hoursB * 60 + minutesB;

          return totalMinutesA - totalMinutesB;
        });
      return acc;
    }, {});
  }, [filteredSlots]);

  const handleEditClick = (slot) => {
    setEditingSlot({
      id: slot._id,
      course_id: slot.course_id || '',
      teacher_id: slot.teacher_id || '',
      start_time: slot.start_time,
      end_time: slot.end_time,
      batch_id: slot.batch_id || '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingSlot) return;
    updateMutation.mutate({
      id: editingSlot.id,
      data: {
        course_id: editingSlot.course_id,
        teacher_id: editingSlot.teacher_id,
        start_time: editingSlot.start_time,
        end_time: editingSlot.end_time,
        batch_id: editingSlot.batch_id || null,
      }
    });
  };

  const selectClass = "w-full h-12 pl-4 pr-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold appearance-none outline-none focus:border-violet-600 transition-all cursor-pointer shadow-sm";

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6 sm:mb-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Calendar size={24} className="sm:size-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter dark:text-white">Academic <span className="text-violet-600">Scheduler</span></h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5 sm:mt-1">Manage course schedules and batch allocations</p>
            </div>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => { setEditSlot(null); setSlotModal(true); }} className="w-full sm:w-auto h-11 sm:h-12 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs shadow-lg shadow-violet-600/20">
            Create New Slot
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="relative group">
          <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedSem(''); setSelectedBatch(''); }} className={selectClass}>
            <option value="">Select Department</option>
            {departments.map(d => <option key={d._id} value={d._id}>{formatName(d.name)}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
        <div className="relative group">
          <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedBatch(''); }} disabled={!selectedDept} className={`${selectClass} disabled:opacity-50`}>
            <option value="">Select Semester</option>
            {semesters.map(s => <option key={s._id} value={s._id}>Semester {s.sem_number}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
        <div className="relative group">
          <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} disabled={!selectedSem} className={`${selectClass} disabled:opacity-50`}>
            <option value="">All Batches</option>
            {batches.map(b => <option key={b._id} value={b._id}>Batch {b.name}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {!selectedSem ? (
        <div className="py-20 sm:py-32 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl sm:rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <LayoutGrid size={32} className="sm:size-10 text-zinc-400" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider">Select semester to load schedule</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20"><Loader /></div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {DAYS.map((day) => (
            <div key={day}>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-1 sm:px-2">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">{day}</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-800"></div>
                <span className="text-[10px] sm:text-xs font-bold text-violet-600 bg-violet-50 dark:bg-violet-950/30 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                  {groupedSlots[day]?.length || 0} slot{groupedSlots[day]?.length !== 1 ? 's' : ''}
                </span>
              </div>
              {!groupedSlots[day] || groupedSlots[day].length === 0 ? (
                <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 text-center">
                  <Clock size={20} className="sm:size-6 mx-auto mb-2 text-zinc-300" />
                  <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">No classes scheduled for {day}</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {groupedSlots[day].map((slot) => {
                    const isEditing = editingSlot?.id === slot._id;

                    if (isEditing) {
                      return (
                        <div key={slot._id} className="bg-white dark:bg-zinc-900 rounded-xl border border-violet-300 dark:border-violet-700 p-4 shadow-lg">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 block">Course</label>
                                <div className="relative">
                                  <select
                                    value={editingSlot.course_id}
                                    onChange={(e) => setEditingSlot({ ...editingSlot, course_id: e.target.value, teacher_id: '' })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer"
                                  >
                                    <option value="">Select Course</option>
                                    {allCourses.map(c => (
                                      <option key={c._id} value={c._id}>{c.course_code} - {c.short_name}</option>
                                    ))}
                                  </select>
                                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 block">Teacher</label>
                                <div className="relative">
                                  <select
                                    value={editingSlot.teacher_id}
                                    onChange={(e) => setEditingSlot({ ...editingSlot, teacher_id: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer"
                                    disabled={!editingSlot.course_id}
                                  >
                                    {teachersList.length === 0 ? (
                                      <option value="" disabled>Teacher Not Found</option>
                                    ) : (
                                      <>
                                        {teachersList.map(t => (
                                          <option key={t.teacher_id} value={t.teacher_id}>
                                            {formatName(t.first_name)} {formatName(t.last_name)}
                                          </option>
                                        ))}
                                      </>
                                    )}
                                  </select>
                                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <TimePicker
                                value={editingSlot.start_time}
                                onChange={(val) => setEditingSlot({ ...editingSlot, start_time: val })}
                                label="Start Time"
                              />
                              <TimePicker
                                value={editingSlot.end_time}
                                onChange={(val) => setEditingSlot({ ...editingSlot, end_time: val })}
                                label="End Time"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 block">Batch</label>
                              <div className="relative">
                                <select
                                  value={editingSlot.batch_id}
                                  onChange={(e) => setEditingSlot({ ...editingSlot, batch_id: e.target.value })}
                                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer"
                                >
                                  <option value="">All Batches (Theory)</option>
                                  {batches.map(b => (<option key={b._id} value={b._id}>Batch {b.name}</option>))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                              </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button variant="ghost" className="flex-1 h-11 rounded-xl text-xs font-bold" onClick={() => setEditingSlot(null)}>
                                Cancel
                              </Button>
                              <Button variant="primary" icon={Save} className="flex-1 h-11 rounded-xl text-xs font-bold" isLoading={updateMutation.isPending} onClick={handleSaveEdit}>
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={slot._id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <div className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-950/30 px-2.5 py-1 rounded-lg">
                                <Clock size={12} className="text-violet-600" />
                                <span className="text-xs font-black text-violet-700 dark:text-violet-400">{slot.start_time} - {slot.end_time}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <BookOpen size={12} className="text-violet-600" />
                                <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">{slot.course_code}</span>
                                <span className="text-xs text-zinc-500">-</span>
                                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{formatName(slot.course_name)}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <User size={12} className="text-zinc-400" />
                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{formatName(slot.teacher_name)}</span>
                              </div>
                              {slot.batch_name && slot.batch_name === 'Theory (All Batches)' && (
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg">Theory (All Batches)</span>
                              )}
                              {slot.batch_name && slot.batch_name !== 'Theory (All Batches)' && (
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg">Lab (Batch {slot.batch_name})</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => handleEditClick(slot)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><Edit3 size={16} /></button>
                            <button onClick={() => setDeleteConfirm({ open: true, id: slot._id })} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Suspense fallback={null}>
        {slotModal && <TimetableSlotModal isOpen={slotModal} onClose={() => { setSlotModal(false); setEditSlot(null); refetch(); }} editData={editSlot} selectedSem={selectedSem} selectedDept={selectedDept} />}
      </Suspense>

      <Modal isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} size="sm">
        <div className="text-center p-3 sm:p-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 dark:bg-red-950 rounded-xl flex items-center justify-center mx-auto mb-3 text-red-600"><AlertCircle size={22} className="sm:size-6" /></div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-1.5 sm:mb-2">Delete Schedule Slot?</h2>
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-4 sm:mb-5">This action cannot be undone. The slot will be permanently removed.</p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 text-sm" onClick={() => setDeleteConfirm({ open: false, id: null })}>Cancel</Button>
            <Button variant="danger" className="flex-1 text-sm" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm.id)}>Delete Slot</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTimetable;