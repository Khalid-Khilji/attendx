import { useState, useMemo, lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { Plus, Trash2, Edit3, Calendar, LayoutGrid, ChevronDown } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSemTimetable, deleteSlot, getAllSemesters } from '../../api/index'
import { Button, Loader, Modal, TimetableDayGroup } from '../../components/index'
import useAdminStore from '../../stores/admin'

const TimetableSlotModal = lazy(() => import('../../components/index').then(m => ({ default: m.TimetableSlotModal })))

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const AdminTimetable = () => {
  const queryClient = useQueryClient()
  const { departments } = useAdminStore()

  const [slotModal, setSlotModal] = useState(false)
  const [editSlot, setEditSlot] = useState(null)
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedSem, setSelectedSem] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters', selectedDept],
    queryFn: () => getAllSemesters(selectedDept),
    enabled: !!selectedDept,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['timetable', selectedSem],
    queryFn: () => getSemTimetable(selectedSem),
    enabled: !!selectedSem,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable', selectedSem] })
      setDeleteConfirm({ open: false, id: null })
    }
  })

  const groupedSlots = useMemo(() => {
    return DAYS.reduce((acc, day) => {
      acc[day] = slots.filter(s => s.day_of_week === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
      return acc
    }, {})
  }, [slots])

  const selectClass = "w-full h-12 pl-4 pr-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold appearance-none outline-none focus:border-violet-600 transition-all cursor-pointer shadow-sm"

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/20">
              <Calendar size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter dark:text-white leading-none">Academic <span className="text-violet-600">Scheduler</span></h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sequence Manager
              </p>
            </div>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => { setEditSlot(null); setSlotModal(true) }} className="w-full md:w-auto h-12 rounded-2xl font-black">New Slot</Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="relative group">
            <select id="dept-select" value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedSem('') }} className={selectClass}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
          </div>

          <div className="relative group">
            <select id="sem-select" value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} disabled={!selectedDept} className={`${selectClass} disabled:opacity-50`}>
              <option value="">Choose Semester</option>
              {semesters.map(s => <option key={s._id} value={s._id}>SEMESTER {s.sem_number}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
          </div>
        </div>

        {!selectedSem ? (
          <div className="py-32 text-center flex flex-col items-center justify-center opacity-30">
            <LayoutGrid size={64} strokeWidth={1} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Select sequence to load</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20"><Loader text="fetching sequence..." /></div>
        ) : (
          <div className="space-y-10">
            {DAYS.map((day) => (
              <div key={day}>
                {groupedSlots[day].length === 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 px-2">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] whitespace-nowrap text-zinc-400">{day}</h3>
                      <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="p-8 text-center rounded-[2rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800 text-[10px] font-black text-zinc-300 uppercase tracking-widest">No Sessions Scheduled</div>
                  </div>
                ) : (
                  <TimetableDayGroup
                    day={day}
                    slots={groupedSlots[day]}
                    isAdmin={true}
                    onEdit={(slot) => { setEditSlot(slot); setSlotModal(true) }}
                    onDelete={(id) => setDeleteConfirm({ open: true, id })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        {slotModal && <TimetableSlotModal isOpen={slotModal} onClose={() => { setSlotModal(false); setEditSlot(null) }} editData={editSlot} />}
      </Suspense>

      <Modal isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} size="sm">
        <div className="text-center py-4 px-2">
          <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-6 text-red-600 border border-red-100 dark:border-red-900 shadow-xl">
            <Trash2 size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white mb-2">Delete Slot?</h2>
          <p className="text-sm font-bold text-zinc-500 mb-8 px-4 leading-relaxed">This will remove this class from the schedule permanently. This action is irreversible.</p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setDeleteConfirm({ open: false, id: null })}>Cancel</Button>
            <Button variant="danger" className="flex-[1.5] h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm.id)}>Delete Index</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminTimetable;