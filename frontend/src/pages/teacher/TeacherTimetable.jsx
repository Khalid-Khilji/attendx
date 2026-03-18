import { useMemo } from 'react'
import { Calendar, LayoutGrid } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMyTimetable } from '../../api/index'
import { TimetableDayGroup } from '../../components/index'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const TeacherTimetable = () => {
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['my-timetable'],
    queryFn: getMyTimetable,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const grouped = useMemo(() => DAYS.reduce((acc, day) => {
    acc[day] = slots.filter(s => s.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
    return acc
  }, {}), [slots])

  const activeDays = useMemo(() => DAYS.filter(d => grouped[d].length > 0), [grouped])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-5xl mx-auto space-y-8">

        <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-600/30">
              <LayoutGrid size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white">
                Academic <span className="text-violet-600">Schedule</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {slots.length} Weekly sessions indexed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-5 py-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-700">
            <Calendar size={16} className="text-violet-600" />
            <span className="text-xs font-black text-zinc-600 dark:text-zinc-200 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-48 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800" />)}
          </div>
        ) : activeDays.length === 0 ? (
          <div className="py-40 text-center opacity-25">
            <Calendar size={64} strokeWidth={1} className="mx-auto mb-4" />
            <p className="text-[12px] font-black uppercase tracking-[0.5em]">No Sessions Configured</p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeDays.map(day => (
              <TimetableDayGroup key={day} day={day} slots={grouped[day]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherTimetable;