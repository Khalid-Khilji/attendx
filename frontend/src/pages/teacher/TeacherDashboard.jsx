import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { BookOpen, Users, CalendarCheck, Clock, Calendar, CheckCircle, ChevronRight, LayoutDashboard, History } from 'lucide-react'
import { getTeacherDashboard } from '../../api/dashboard'
import { StatCard } from '../../components/index'

const SkeletonCard = () => (
  <div className="animate-pulse bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 h-28" />
)

const TeacherDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: getTeacherDashboard,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const stats = data?.stats
  const todays_slots = data?.todays_slots || []
  const recent_sessions = data?.recent_sessions || []

  const now = new Date()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20 shrink-0">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter dark:text-white leading-none">Teacher <span className="text-violet-600">Core</span></h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {now.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex-1 md:flex-none bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <Clock size={14} className="text-violet-600" />
            <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-widest">
              {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) : <>
            <StatCard icon={BookOpen} label="Total Courses" value={stats?.total_courses} color="bg-violet-100 dark:bg-violet-900/30 text-violet-600" delay={0.05} />
            <StatCard icon={Users} label="Total Students" value={stats?.total_students} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" delay={0.1} />
            <StatCard icon={CalendarCheck} label="Past Sessions" value={stats?.total_sessions} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" delay={0.15} />
            <StatCard icon={CheckCircle} label="Today slots" value={stats?.todays_sessions} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600" delay={0.2} />
          </>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-violet-600" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Today's Schedule</h2>
              </div>
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {isLoading ? [...Array(2)].map((_, i) => <div key={i} className="h-20 animate-pulse bg-zinc-50/50" />) :
                todays_slots.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <Calendar size={32} className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No classes rostered</p>
                  </div>
                ) : todays_slots.map((slot, idx) => (
                  <motion.div key={slot._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + idx * 0.05 }}
                    className="p-5 flex items-center gap-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/50 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-violet-600 leading-none">{slot.start_time}</span>
                      <div className="h-px w-4 bg-violet-200 dark:bg-violet-700 my-1" />
                      <span className="text-[8px] font-bold text-zinc-400 leading-none">{slot.end_time}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase truncate tracking-tight">{slot.course_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-violet-500 bg-violet-50 dark:bg-violet-900/40 px-2 py-0.5 rounded-md">{slot.course_code}</span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Semester {slot.sem_number}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-300" />
                  </motion.div>
                ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-zinc-50 dark:border-zinc-800 flex items-center gap-3">
              <History size={18} className="text-violet-600" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Recent Attendance</h2>
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50 overflow-y-auto max-h-100 hide-scrollbar">
              {isLoading ? [...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-zinc-50/50" />) :
                recent_sessions.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <CheckCircle size={32} className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No recent sessions</p>
                  </div>
                ) : recent_sessions.map((session, idx) => (
                  <motion.div key={session._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + idx * 0.05 }}
                    className="p-4 flex items-center gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                      <CheckCircle size={18} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate uppercase tracking-tight">{session.course_name}</p>
                      <p className="text-[9px] font-bold text-zinc-400 mt-0.5 uppercase tracking-widest">
                        {session.date ? new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard;