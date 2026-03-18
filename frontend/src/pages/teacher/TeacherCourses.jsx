import { useMemo } from 'react'
import { GraduationCap, BookOpen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMyCourses } from '../../api/index'
import { CourseCard } from '../../components/index'

const TeacherCourses = () => {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: getMyCourses,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const grouped = useMemo(() => courses.reduce((acc, course) => {
    const key = course.dept_name
    if (!acc[key]) acc[key] = []
    acc[key].push(course)
    return acc
  }, {}), [courses])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-10 pb-20">
      <div className="max-w-4xl mx-auto space-y-10">

        <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-600/30">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
                My <span className="text-violet-600">Lecture</span> Base
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {courses.length} active assignments
              </p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-24 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-40 text-center opacity-25">
            <BookOpen size={64} strokeWidth={1} className="mx-auto mb-4" />
            <p className="text-[12px] font-black uppercase tracking-[0.5em]">Sequence Empty</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([dept, deptCourses]) => (
              <div key={dept} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">{dept}</span>
                  <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800/50" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {deptCourses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherCourses;