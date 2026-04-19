import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { BookOpen, Users, CalendarCheck, Clock, Calendar, CheckCircle, ChevronRight, LayoutDashboard, History, GraduationCap, UserCheck, Target } from 'lucide-react'
import { getTeacherDashboard } from '../../api/dashboard'
import { StatCard } from '../../components/index'

const formatName = (str) => {
  if (!str) return ''
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

const SkeletonCard = () => (
  <div className="animate-pulse bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 h-24" />
)

const TeacherDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: getTeacherDashboard,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  })

  const stats = data?.stats
  const todaysSlots = data?.todays_slots || []
  const recentSessions = data?.recent_sessions || []

  const uniqueCourses = new Map()
  todaysSlots.forEach(slot => {
    if (!uniqueCourses.has(slot.course_id)) {
      uniqueCourses.set(slot.course_id, slot)
    }
  })
  const uniqueTodaysCourses = Array.from(uniqueCourses.values())

  const now = new Date()

  const getTimeStatus = () => {
    const hours = now.getHours()
    if (hours < 12) return 'Morning'
    if (hours < 17) return 'Afternoon'
    return 'Evening'
  }

  const getGreeting = () => {
    const name = data?.teacher_name?.split(' ')[0] || 'Teacher'
    return `${getTimeStatus()}, ${formatName(name)}`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-lg">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">{getGreeting()}</h1>
              <p className="text-xs font-medium text-white/80 mt-0.5">
                Welcome to your teaching dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
            <Clock size={14} className="text-white" />
            <span className="text-xs font-medium text-white">
              {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="w-px h-4 bg-white/30 mx-1" />
            <Calendar size={14} className="text-white" />
            <span className="text-xs font-medium text-white">
              {now.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard icon={BookOpen} label="Total Courses" value={stats?.total_courses} color="bg-violet-100 dark:bg-violet-900/30 text-violet-600" delay={0.05} />
            <StatCard icon={Users} label="Total Students" value={stats?.total_students} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" delay={0.1} />
            <StatCard icon={CalendarCheck} label="Past Sessions" value={stats?.total_sessions} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" delay={0.15} />
            <StatCard icon={CheckCircle} label="Today's Classes" value={uniqueTodaysCourses.length} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600" delay={0.2} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-violet-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500">Today's Schedule</h2>
            </div>
            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded-full">
              {uniqueTodaysCourses.length} Classes
            </span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {isLoading ? [...Array(2)].map((_, i) => <div key={i} className="h-20 animate-pulse bg-zinc-50/50" />) :
              uniqueTodaysCourses.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Calendar size={28} className="text-zinc-400" />
                  </div>
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">No classes today</p>
                  <p className="text-xs text-zinc-400 mt-1">Enjoy your day off!</p>
                </div>
              ) : (
                uniqueTodaysCourses.map((slot, idx) => (
                  <motion.div
                    key={slot._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="p-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[11px] font-black text-violet-700 dark:text-violet-400">{slot.start_time}</span>
                      <div className="h-px w-5 bg-violet-300 dark:bg-violet-700 my-1" />
                      <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">{slot.end_time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[9px] font-black text-violet-600 bg-violet-50 dark:bg-violet-950/40 px-1.5 py-0.5 rounded">
                          {slot.course_code}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400">Sem {slot.sem_number}</span>
                        {slot.batch_name && (
                          <span className="text-[8px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
                            Batch {slot.batch_name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 truncate">
                        {formatName(slot.course_name)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-300 shrink-0" />
                  </motion.div>
                ))
              )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <History size={18} className="text-violet-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500">Recent Sessions</h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 overflow-y-auto max-h-[400px]">
            {isLoading ? [...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-zinc-50/50" />) :
              recentSessions.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <CheckCircle size={28} className="text-zinc-400" />
                  </div>
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">No recent sessions</p>
                  <p className="text-xs text-zinc-400 mt-1">Start taking attendance</p>
                </div>
              ) : (
                recentSessions.map((session, idx) => (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="p-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <CheckCircle size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">
                        {formatName(session.course_name)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-zinc-400">{session.course_code}</span>
                        <span className="text-[9px] font-bold text-zinc-400">•</span>
                        <span className="text-[9px] font-bold text-zinc-400">
                          {session.date ? new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard