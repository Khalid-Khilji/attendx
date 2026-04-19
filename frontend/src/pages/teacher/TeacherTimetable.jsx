import { useMemo } from 'react'
import { Calendar, LayoutGrid } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTeacherTimetable } from '../../api/index'
import { TimetableDayGroup } from '../../components/index'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const TeacherTimetable = () => {
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['my-timetable'],
    queryFn: getTeacherTimetable,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const grouped = useMemo(() => {
    const result = DAYS.reduce((acc, day) => {
      acc[day] = slots.filter(s => s.day_of_week === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
      return acc
    }, {})
    return result
  }, [slots])

  const activeDays = useMemo(() => DAYS.filter(d => grouped[d] && grouped[d].length > 0), [grouped])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
        <div className="max-w-5xl mx-auto space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-48 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 pt-6 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <LayoutGrid size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter dark:text-white">
                  My <span className="text-violet-600">Timetable</span>
                </h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                  {slots.length} Weekly sessions scheduled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <Calendar size={16} className="text-violet-600" />
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {activeDays.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Calendar size={40} className="text-zinc-400" />
            </div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">No classes scheduled yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {DAYS.map(day => {
              const daySlots = grouped[day] || []
              if (daySlots.length === 0) return null
              return (
                <TimetableDayGroup key={day} day={day} slots={daySlots} />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherTimetable;