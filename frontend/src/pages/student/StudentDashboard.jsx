import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  Calendar, CheckCircle, XCircle, AlertCircle,
  Camera, CameraOff, LayoutDashboard, Clock,
  CalendarDays, GraduationCap, ChevronRight, Activity
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getStudentDashboard } from '../../api/dashboard'
import { StatCard, Loader } from '../../components/index'

const statusConfig = {
  present: { color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
  absent: { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: XCircle },
  review: { color: 'text-amber-600 bg-amber-500/10 border-amber-500/20', icon: AlertCircle },
}

const StudentDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: getStudentDashboard,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 60000,
  })

  const student = data?.student
  const stats = data?.stats
  const courseAttendance = data?.course_attendance || []
  const todaysSlots = data?.todays_slots || []
  const recentRecords = data?.recent_records || []

  const today = useMemo(() => new Date().toLocaleDateString('en-IN', { weekday: 'long' }), [])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20 shrink-0">
              <LayoutDashboard size={24} />
            </div>
            <div className="min-w-0">
              {isLoading ? (
                <div className="space-y-2"><div className="h-5 w-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-md" /></div>
              ) : (
                <>
                  <h1 className="text-xl font-black uppercase tracking-tighter dark:text-white leading-none truncate">
                    {student?.first_name} <span className="text-violet-600">{student?.last_name}</span>
                  </h1>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1 truncate">
                    {student?.roll_no} • {student?.dept_name}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {!isLoading && (
              <div className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${student?.face_registered ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/5 text-rose-600 border-rose-500/20'}`}>
                {student?.face_registered ? <Camera size={12} /> : <CameraOff size={12} />}
                {student?.face_registered ? 'Identity Verified' : 'Sync Pending'}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? [...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800" />) : <>
            <StatCard icon={Activity} label="Aggregate" value={`${stats?.overall_percentage}%`} sub={stats?.overall_percentage >= 75 ? 'Optimal' : 'Warning'} color={stats?.overall_percentage >= 75 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'} delay={0.05} />
            <StatCard icon={GraduationCap} label="Course Count" value={stats?.total_courses} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" delay={0.1} />
            <StatCard icon={CheckCircle} label="Days Present" value={stats?.total_present} sub={`out of ${stats?.total_classes}`} color="bg-violet-100 dark:bg-violet-900/30 text-violet-600" delay={0.15} />
            <StatCard icon={Calendar} label="Active Today" value={todaysSlots.length} sub={today} color="bg-orange-100 dark:bg-orange-900/30 text-orange-600" delay={0.2} />
          </>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-violet-600" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Scheduled Today</h2>
              </div>
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {isLoading ? <div className="p-10 flex justify-center"><Loader size="sm" /></div> :
                todaysSlots.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <Calendar size={32} className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No classes rostered</p>
                  </div>
                ) : todaysSlots.map((slot, idx) => (
                  <motion.div key={slot._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                    className="p-5 flex items-center gap-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 leading-none">{slot.start_time}</span>
                      <div className="h-px w-4 bg-zinc-200 dark:bg-zinc-600 my-1" />
                      <span className="text-[8px] font-bold text-zinc-400 leading-none">{slot.end_time}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase truncate tracking-tight">{slot.course_name}</p>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1 tracking-widest">{slot.course_code}</p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-300" />
                  </motion.div>
                ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-zinc-50 dark:border-zinc-800 flex items-center gap-3">
              <CalendarDays size={18} className="text-violet-600" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Activity Logs</h2>
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50 overflow-y-auto max-h-100 hide-scrollbar">
              {isLoading ? <div className="p-10 flex justify-center"><Loader size="sm" /></div> :
                recentRecords.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <Activity size={32} className="mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No recent activity</p>
                  </div>
                ) : recentRecords.map((record, idx) => {
                  const cfg = statusConfig[record.status] || statusConfig.absent
                  const StatusIcon = cfg.icon
                  return (
                    <motion.div key={record._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                      className="p-4 flex items-center gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${cfg.color}`}>
                        <StatusIcon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate uppercase tracking-tight">{record.course_code}</p>
                        <p className="text-[9px] font-bold text-zinc-400 mt-0.5 uppercase tracking-widest">
                          {record.date ? new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity size={18} className="text-violet-600" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Distribution Analysis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {courseAttendance.map((course, i) => (
              <div key={course._id}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-tight">{course.course_name}</span>
                  <span className={`text-[10px] font-black ${course.percentage >= 75 ? 'text-emerald-600' : 'text-rose-500'}`}>{course.percentage}%</span>
                </div>
                <div className="h-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800/50">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${course.percentage}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 1 }}
                    className={`h-full rounded-full ${course.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>
                <div className="flex justify-between mt-1 px-1">
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{course.course_code}</p>
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{course.present} / {course.total} Sessions</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StudentDashboard;