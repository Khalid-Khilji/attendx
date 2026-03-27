import { useState } from 'react'
import { Calendar, Layers, ChevronDown, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getAllSemesters, getAllCourses, getCourseSessions } from '../../api/index'
import { Loader, SessionCard } from '../../components/index'
import useAdminStore from '../../stores/admin'

const AdminAttendance = () => {
  const { departments } = useAdminStore()
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedSem, setSelectedSem] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')

  const { data: semesters = [], isLoading: isSemLoading } = useQuery({
    queryKey: ['semesters', selectedDept],
    queryFn: () => getAllSemesters(selectedDept),
    enabled: !!selectedDept,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const { data: courses = [], isLoading: isCourseLoading } = useQuery({
    queryKey: ['courses', selectedSem],
    queryFn: () => getAllCourses(selectedSem),
    enabled: !!selectedSem,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const { data: sessions = [], isLoading: isSessionsLoading } = useQuery({
    queryKey: ['sessions', selectedCourse],
    queryFn: () => getCourseSessions(selectedCourse),
    enabled: !!selectedCourse,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const selectClass = "w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-black text-zinc-800 dark:text-zinc-200 outline-none focus:border-violet-600 appearance-none cursor-pointer transition-all disabled:opacity-40 shadow-sm"

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-5xl mx-auto space-y-8">

        <header className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 px-8 py-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-600/30">
              <Activity size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
                Attendance <span className="text-violet-600">Sync</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                API Live Sequence
              </p>
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-zinc-900 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <label htmlFor="dept_id" className="hidden">Faculty</label>
            <select id="dept_id" name="dept_id" value={selectedDept} autoComplete="off"
              onChange={(e) => { setSelectedDept(e.target.value); setSelectedSem(''); setSelectedCourse('') }}
              className={selectClass}>
              <option value="">CHOOSE DEPT</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative">
            <label htmlFor="sem_id" className="hidden">Semester</label>
            <select id="sem_id" name="sem_id" value={selectedSem} autoComplete="off"
              onChange={(e) => { setSelectedSem(e.target.value); setSelectedCourse('') }}
              className={selectClass} disabled={!selectedDept || isSemLoading}>
              <option value="">{isSemLoading ? 'LOADING...' : 'CHOOSE SEM'}</option>
              {semesters.map(s => <option key={s._id} value={s._id}>SEMESTER {s.sem_number}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative">
            <label htmlFor="course_id" className="hidden">Course</label>
            <select id="course_id" name="course_id" value={selectedCourse} autoComplete="off"
              onChange={(e) => setSelectedCourse(e.target.value)}
              className={selectClass} disabled={!selectedSem || isCourseLoading}>
              <option value="">{isCourseLoading ? 'LOADING...' : 'CHOOSE COURSE'}</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.course_code} — {c.short_name?.toUpperCase() || c.name.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {!selectedCourse ? (
          <div className="py-40 text-center opacity-20">
            <Layers size={64} strokeWidth={1} className="mx-auto mb-4" />
            <p className="text-[12px] font-black uppercase tracking-[0.5em]">Query Pending</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Logs</span>
              <span className="text-[10px] font-black text-violet-600 bg-violet-100 dark:bg-violet-900/40 px-3 py-1 rounded-lg border border-violet-200 dark:border-violet-700">{sessions.length} Sessions Found</span>
            </div>

            {isSessionsLoading ? (
              <div className="py-20 flex justify-center"><Loader text="fetching sequence..." /></div>
            ) : sessions.length === 0 ? (
              <div className="py-24 text-center opacity-30">
                <Calendar size={48} strokeWidth={1} className="mx-auto mb-3 text-zinc-400" />
                <p className="text-[10px] font-black uppercase tracking-widest">Empty Dataset</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {sessions.map(session => <SessionCard key={session._id} session={session} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAttendance;