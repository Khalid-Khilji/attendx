import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Camera, Layers, Calendar, SearchX } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMyTimetable, getCourseSessions } from '../../api/index'
import { AttendanceModal, Loader } from '../../components/index'

const SlotCard = ({ slot }) => {
  const [isOpen, setIsOpen] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', slot.course_id],
    queryFn: () => getCourseSessions(slot.course_id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const todaySession = useMemo(() => sessions.find(s => s.date?.slice(0, 10) === today), [sessions, today])

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 p-5 flex items-center gap-5 hover:shadow-xl hover:shadow-zinc-500/5 transition-all group">
        <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/50 flex flex-col items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-violet-600 leading-none">{slot.start_time}</span>
          <div className="h-px w-4 bg-violet-200 dark:bg-violet-700 my-1" />
          <span className="text-[8px] font-bold text-zinc-400 leading-none">{slot.end_time}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase truncate tracking-tight group-hover:text-violet-600 transition-colors">{slot.course_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-black text-violet-500 bg-violet-50 dark:bg-violet-900/40 px-2 py-0.5 rounded-md uppercase">{slot.course_code}</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Sem {slot.sem_number}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {todaySession && <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">Indexed</span>}
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-4 py-2.5 rounded-xl hover:bg-violet-600 hover:text-white transition-all">
            <Camera size={14} /> Scan
          </button>
        </div>
      </motion.div>
      <AttendanceModal isOpen={isOpen} onClose={() => setIsOpen(false)} slot={slot} todaySession={todaySession} />
    </>
  )
}

const TeacherAttendance = () => {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long' })
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['my-timetable'],
    queryFn: getMyTimetable,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const { todaySlots, otherSlots } = useMemo(() => ({
    todaySlots: slots.filter(s => s.day_of_week === today),
    otherSlots: slots.filter(s => s.day_of_week !== today)
  }), [slots, today])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-600/30">
              <Layers size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">Attendance <span className="text-violet-600">Scan</span></h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Session Capture
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-2xl border border-zinc-100 dark:border-zinc-700">
            <Calendar size={14} className="text-violet-600" />
            <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-200 uppercase tracking-widest">{today}</span>
          </div>
        </header>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader text="Syncing schedule..." /></div>
        ) : slots.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <SearchX size={40} className="text-zinc-300 dark:text-zinc-700" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">No Assignments Found</p>
            <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">Contact admin if this is an error</p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-4 mb-6 px-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-violet-600 whitespace-nowrap">Classes Today</h3>
                <div className="h-px w-full bg-violet-100 dark:bg-violet-900/30" />
              </div>

              {todaySlots.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {todaySlots.map(s => <SlotCard key={s._id} slot={s} />)}
                </div>
              ) : (
                <div className="p-10 text-center rounded-[2.5rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-700">Relax! No classes rostered for today</p>
                </div>
              )}
            </div>

            {otherSlots.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-6 px-2">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 whitespace-nowrap">Weekly Pipeline</h3>
                  <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800/50" />
                </div>
                <div className="grid grid-cols-1 gap-4 opacity-70 grayscale-[0.5] hover:grayscale-0 transition-all duration-500">
                  {otherSlots.map(s => <SlotCard key={s._id} slot={s} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherAttendance