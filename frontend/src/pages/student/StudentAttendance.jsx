import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, Activity, CalendarDays, SearchX } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMyAttendance, getAllCourses } from '../../api/index'
import { Loader, AttendanceRow } from '../../components/index'

const StudentAttendance = () => {
  const [selectedCourse, setSelectedCourse] = useState('')

  const { data: courses = [] } = useQuery({
    queryKey: ['my-courses-student'],
    queryFn: getAllCourses,
    staleTime: 1000 * 60 * 30
  })

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['my-attendance', selectedCourse],
    queryFn: () => getMyAttendance(null, selectedCourse || null),
  })

  const records = attendance?.records || []
  const percentage = attendance?.percentage || 0
  const total = attendance?.total_classes || 0
  const present = attendance?.present || 0

  const selectClass = "w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-black text-zinc-800 dark:text-zinc-200 outline-none focus:border-violet-600 appearance-none cursor-pointer transition-all shadow-sm"

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-3xl mx-auto space-y-8">

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 px-8 py-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-5 w-full">
            <div className="w-16 h-16 rounded-3xl bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-600/30 shrink-0">
              <Activity size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
                My <span className="text-violet-600">Attendance</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Status Registry
              </p>
            </div>
          </div>
        </motion.header>

        <div className="relative group">
          <label htmlFor="course_filter" className="hidden">Filter by Course</label>
          <select
            id="course_filter"
            name="course_filter"
            value={selectedCourse}
            autoComplete="off"
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={selectClass}
          >
            <option value="">ALL ENROLLED COURSES</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.course_code} — {c.name.toUpperCase()}</option>)}
          </select>
          <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-violet-600 transition-colors" />
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader text="Syncing Sequence..." /></div>
        ) : (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Current Integrity</p>
                <span className={`text-2xl font-black tracking-tighter ${percentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{percentage}%</span>
              </div>

              <div className="h-4 bg-zinc-50 dark:bg-zinc-800 rounded-full overflow-hidden mb-6 border border-zinc-100 dark:border-zinc-800/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className={`h-full rounded-full bg-linear-to-r ${percentage >= 75 ? 'from-emerald-500 to-teal-400' : 'from-rose-500 to-orange-400'}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Attended', val: present, color: 'text-emerald-500' },
                  { label: 'Missed', val: total - present, color: 'text-rose-500' },
                  { label: 'Aggregate', val: total, color: 'text-zinc-400' }
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className={`text-xl font-black leading-none ${stat.color}`}>{stat.val}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-zinc-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {percentage < 75 && total > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 bg-rose-500/5 rounded-2xl p-4 border border-rose-500/10 text-center"
                >
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                    ⚠ Threshold Alert: Complete {Math.ceil((0.75 * total - present) / 0.25)} more sessions to recover 75%
                  </p>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="px-8 py-5 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-800/20">
                <div className="flex items-center gap-3">
                  <CalendarDays size={16} className="text-violet-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">History Logs</span>
                </div>
                <span className="text-[10px] font-black text-violet-600 bg-violet-100 dark:bg-violet-900/40 px-3 py-1 rounded-lg border border-violet-200 dark:border-violet-700">{records.length} Logs</span>
              </div>

              {records.length === 0 ? (
                <div className="py-24 text-center opacity-20">
                  <SearchX size={48} strokeWidth={1} className="mx-auto mb-3" />
                  <p className="text-[12px] font-black uppercase tracking-[0.4em]">Sequence Empty</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50 overflow-y-auto max-h-125 hide-scrollbar">
                  {records.map((record, index) => (
                    <AttendanceRow key={record._id} record={record} index={index} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentAttendance