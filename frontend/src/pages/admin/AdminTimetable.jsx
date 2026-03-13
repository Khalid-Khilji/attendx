import { useState, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Trash2, Edit3, Calendar, Clock, Filter, LayoutGrid } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSemTimetable, deleteSlot, getAllSemesters, getAllDepartments } from '../../api/index'
import { Button, Loader, Select, SelectOption } from '../../components/index'

const TimetableSlotModal = lazy(() => import('../../components/index').then(m => ({ default: m.TimetableSlotModal })))

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const dayStyles = {
  Monday: 'bg-violet-50/50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-800 text-violet-600',
  Tuesday: 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 text-blue-600',
  Wednesday: 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 text-emerald-600',
  Thursday: 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800 text-amber-600',
  Friday: 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800 text-rose-600',
  Saturday: 'bg-zinc-50/50 dark:bg-zinc-800/20 border-zinc-100 dark:border-zinc-700 text-zinc-500',
}

const SkeletonCard = () => (
  <div className="animate-pulse h-32 rounded-3xl bg-zinc-100 dark:bg-zinc-800/50 w-full" />
)

const AdminTimetable = () => {
  const queryClient = useQueryClient()
  const [slotModal, setSlotModal] = useState(false)
  const [editSlot, setEditSlot] = useState(null)
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedSem, setSelectedSem] = useState('')

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getAllDepartments })
  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters', selectedDept],
    queryFn: () => getAllSemesters(selectedDept),
    enabled: !!selectedDept
  })
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['timetable', selectedSem],
    queryFn: () => getSemTimetable(selectedSem),
    enabled: !!selectedSem
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSlot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timetable', selectedSem] })
  })

  const groupedSlots = useMemo(() => {
    return DAYS.reduce((acc, day) => {
      acc[day] = slots.filter(s => s.day_of_week === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
      return acc
    }, {})
  }, [slots])

  const openEdit = (slot) => { setEditSlot(slot); setSlotModal(true) }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 md:pt-32 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <Calendar size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Academic Scheduler</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white">
              Time <span className="text-violet-600">Table</span>
            </h1>
          </motion.div>
          <Button icon={Plus} size="lg" onClick={() => { setEditSlot(null); setSlotModal(true) }}>
            Add New Slot
          </Button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-6 mb-8 shadow-2xl flex flex-col md:flex-row gap-4"
        >
          <Select
            label="Department"
            id="dept-select"
            name="department"
            value={selectedDept}
            onChange={(v) => { setSelectedDept(v); setSelectedSem('') }}
            placeholder="Select Department"
          >
            {departments.map(d => <SelectOption key={d._id} value={d._id}>{d.name}</SelectOption>)}
          </Select>

          <AnimatePresence mode="popLayout">
            {selectedDept && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1">
                <Select
                  label="Semester"
                  id="sem-select"
                  name="semester"
                  value={selectedSem}
                  onChange={setSelectedSem}
                  placeholder="Choose Semester"
                >
                  {semesters.map(s => <SelectOption key={s._id} value={s._id}>Semester {s.sem_number}</SelectOption>)}
                </Select>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!selectedSem ? (
          <div className="py-40 text-center opacity-20">
            <LayoutGrid size={80} className="mx-auto mb-6" strokeWidth={1} />
            <p className="text-xs font-black uppercase tracking-[0.4em]">Select Parameters to Load</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="space-y-10">
            {DAYS.map((day, dayIdx) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIdx * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-5 px-4">
                  <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${dayStyles[day].split(' ').pop()}`}>{day}</h3>
                  <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{groupedSlots[day].length} Classes</span>
                </div>

                {groupedSlots[day].length === 0 ? (
                  <div className="h-20 rounded-4xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                    Free Day
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {groupedSlots[day].map((slot, idx) => (
                      <motion.div
                        key={slot._id}
                        whileHover={{ y: -4 }}
                        className={`group relative p-6 rounded-4xl border-2 transition-all ${dayStyles[day].split(' ').slice(0, 2).join(' ')} hover:shadow-xl hover:shadow-violet-500/5`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
                              <Clock size={14} className="text-violet-500" />
                            </div>
                            <span className="text-xs font-black text-zinc-900 dark:text-white">{slot.start_time} – {slot.end_time}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                            <button onClick={() => openEdit(slot)} className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm hover:text-violet-600 transition-colors"><Edit3 size={14} /></button>
                            <button onClick={() => deleteMutation.mutate(slot._id)} className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-violet-600/60">{slot.course_code}</p>
                          <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase leading-snug line-clamp-2">{slot.course_name}</h4>
                          <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 pt-2 flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-zinc-300" />
                            {slot.teacher_name}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Suspense fallback={<Loader fullPage />}>
        {slotModal && (
          <TimetableSlotModal
            isOpen={slotModal}
            onClose={() => { setSlotModal(false); setEditSlot(null) }}
            editData={editSlot}
          />
        )}
      </Suspense>
    </div>
  )
}

export default AdminTimetable