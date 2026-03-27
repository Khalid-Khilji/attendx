import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Calendar, LayoutGrid, SearchX } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getStudentTimetable } from '../../api/index'
import { Loader, TimetableDayGroup } from '../../components/index'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const StudentTimetable = () => {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long' })

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['student-timetable'],
    queryFn: getStudentTimetable,
    staleTime: 1000 * 60 * 60
  })

  const grouped = useMemo(() => DAYS.reduce((acc, day) => {
    acc[day] = slots.filter(s => s.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
    return acc
  }, {}), [slots])

  const activeDays = useMemo(() => DAYS.filter(d => grouped[d].length > 0), [grouped])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-5xl mx-auto space-y-10">

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-600/30">
              <LayoutGrid size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
                Academic <span className="text-violet-600">Timeline</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {slots.length} Sessions rostered this week
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-5 py-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-700">
            <Calendar size={16} className="text-violet-600" />
            <span className="text-xs font-black text-zinc-600 dark:text-zinc-200 uppercase tracking-widest">{today}</span>
          </div>
        </motion.header>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader text="Syncing timeline..." /></div>
        ) : activeDays.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-40 text-center"
          >
            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-4xl flex items-center justify-center mx-auto mb-6 border border-zinc-200 dark:border-zinc-800">
              <SearchX size={48} strokeWidth={1.5} className="text-zinc-300 dark:text-zinc-700" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.4em] text-zinc-400">Sequence Not Found</p>
            <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">Ensure you are enrolled in an active semester</p>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {activeDays.map(day => (
              <TimetableDayGroup
                key={day}
                day={day}
                slots={grouped[day]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentTimetable