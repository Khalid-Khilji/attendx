import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GraduationCap, BookOpen, Users, ChevronDown, ChevronUp, Calendar, Hash, UserCheck, Sparkles, Clock, FlaskConical, UsersRound, Loader2, Trophy, Target, Award, Eye, ChevronRight, School } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMyCourses, getCourseTeachers, getSemStudents } from '../../api/index'

const formatName = (str) => {
  if (!str) return ''
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

const TeacherCourses = () => {
  const [expandedCourse, setExpandedCourse] = useState(null)
  const [courseDetails, setCourseDetails] = useState({})

  const { data: coursesRaw = [], isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: getMyCourses,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  })

  const courses = useMemo(() => {
    const uniqueMap = new Map()
    coursesRaw.forEach(course => {
      if (!uniqueMap.has(course._id)) {
        uniqueMap.set(course._id, course)
      }
    })
    return Array.from(uniqueMap.values())
  }, [coursesRaw])

  const grouped = useMemo(() => {
    return courses.reduce((acc, course) => {
      const key = course.dept_name || 'General'
      if (!acc[key]) acc[key] = []
      acc[key].push(course)
      return acc
    }, {})
  }, [courses])

  const fetchCourseDetails = async (courseId, semId) => {
    if (courseDetails[courseId]) return

    setCourseDetails(prev => ({ ...prev, [courseId]: { loading: true } }))

    try {
      const [teachers, students] = await Promise.all([
        getCourseTeachers(courseId),
        getSemStudents(semId)
      ])

      const studentsList = students || []
      const hasLabTeachers = teachers?.some(t => t.batch_name && t.batch_name !== null)

      let theoryStudents = []
      let labBatches = {}

      if (hasLabTeachers) {
        labBatches = studentsList.reduce((acc, s) => {
          if (s.batch_name && s.batch_name !== null) {
            if (!acc[s.batch_name]) acc[s.batch_name] = []
            acc[s.batch_name].push(s)
          }
          return acc
        }, {})
        theoryStudents = studentsList.filter(s => !s.batch_name || s.batch_name === null)
      } else {
        theoryStudents = studentsList
      }

      const uniqueTeachers = []
      const teacherMap = new Map()
      teachers?.forEach(t => {
        if (!teacherMap.has(t.teacher_id)) {
          teacherMap.set(t.teacher_id, t)
          uniqueTeachers.push(t)
        }
      })

      setCourseDetails(prev => ({
        ...prev,
        [courseId]: {
          loading: false,
          teachers: uniqueTeachers,
          theoryStudents: theoryStudents,
          labBatches: labBatches,
          hasLab: Object.keys(labBatches).length > 0,
          teacherCount: uniqueTeachers.length,
          studentCount: studentsList.length
        }
      }))
    } catch (err) {
      setCourseDetails(prev => ({
        ...prev,
        [courseId]: {
          loading: false,
          teachers: [],
          theoryStudents: [],
          labBatches: {},
          hasLab: false,
          teacherCount: 0,
          studentCount: 0
        }
      }))
    }
  }

  const toggleCourse = (courseId, semId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null)
    } else {
      setExpandedCourse(courseId)
      fetchCourseDetails(courseId, semId)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 pt-6 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-28 bg-white dark:bg-zinc-900 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">My Courses</h1>
              <p className="text-xs font-medium text-white/80 mt-0.5">
                {courses.length} Active {courses.length === 1 ? 'Course' : 'Courses'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
            <Calendar size={14} className="text-white" />
            <span className="text-xs font-medium text-white">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </motion.div>

      {courses.length === 0 ? (
        <div className="py-32 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <BookOpen size={48} className="text-zinc-400" />
          </div>
          <p className="text-base font-bold text-zinc-400 uppercase tracking-wider">No courses assigned yet</p>
          <p className="text-sm text-zinc-400 mt-2">Contact admin for course assignments</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dept, deptCourses]) => (
            <div key={dept} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <School size={18} className="text-violet-500" />
                <h2 className="text-base font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  {dept}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-800"></div>
                <span className="text-[10px] font-bold text-white bg-violet-500 px-2 py-0.5 rounded-full">
                  {deptCourses.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {deptCourses.map((course) => {
                  const isExpanded = expandedCourse === course._id
                  const details = courseDetails[course._id]
                  const isLoadingDetails = details?.loading

                  return (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleCourse(course._id, course.sem_id)}
                        className="w-full text-left p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${course.is_primary
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  : 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400'
                                }`}>
                                {course.is_primary ? 'Lead' : 'Support'}
                              </div>
                              <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400">
                                <Hash size={9} />
                                <span>{course.course_code}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400">
                                <GraduationCap size={9} />
                                <span>Semester {course.sem_number}</span>
                              </div>
                            </div>

                            <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 line-clamp-1">
                              {formatName(course.name)}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-[11px] text-zinc-400 font-medium">
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </div>
                            <ChevronRight size={16} className={`text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-800/20 dark:to-zinc-900"
                          >
                            {isLoadingDetails ? (
                              <div className="p-8 text-center">
                                <Loader2 size={28} className="animate-spin text-violet-600 mx-auto mb-2" />
                                <p className="text-xs text-zinc-500">Loading course details...</p>
                              </div>
                            ) : details ? (
                              <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                  <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                                        <UserCheck size={16} className="text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Faculty Team</p>
                                        <p className="text-xl font-black text-blue-600">{details.teacherCount}</p>
                                      </div>
                                    </div>
                                    {details.teachers.length > 0 && (
                                      <div className="space-y-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                        {details.teachers.map((teacher, idx) => (
                                          <div key={idx} className="flex items-center justify-between py-1">
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-[9px] font-black">
                                                {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                                              </div>
                                              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                {formatName(teacher.first_name)} {formatName(teacher.last_name)}
                                              </span>
                                            </div>
                                            {teacher.is_primary && (
                                              <span className="text-[8px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-full">
                                                Lead
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                                        <Users size={16} className="text-emerald-600" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Students</p>
                                        <p className="text-xl font-black text-emerald-600">{details.studentCount}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {details.hasLab ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <FlaskConical size={16} className="text-blue-600" />
                                      <span className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Lab Batches</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {Object.entries(details.labBatches).map(([batchName, students]) => (
                                        <div key={batchName} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                                                <FlaskConical size={12} className="text-blue-600" />
                                              </div>
                                              <span className="text-sm font-black uppercase text-blue-600">Batch {batchName}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                              {students.length} Students
                                            </span>
                                          </div>
                                          <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {students.map((student, idx) => (
                                              <div key={idx} className="flex items-center justify-between text-sm py-1">
                                                <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate flex-1">
                                                  {formatName(student.first_name)} {formatName(student.last_name)}
                                                </span>
                                                <span className="text-[9px] text-zinc-500 font-mono ml-2 shrink-0">{student.roll_no}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : details.theoryStudents.length > 0 && (
                                  <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <BookOpen size={14} className="text-emerald-600" />
                                      <span className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Enrolled Students</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                      {details.theoryStudents.map((student, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm py-2 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/30">
                                          <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate flex-1">
                                            {formatName(student.first_name)} {formatName(student.last_name)}
                                          </span>
                                          <span className="text-[9px] text-zinc-500 font-mono ml-2 shrink-0">{student.roll_no}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-2 rounded-lg bg-violet-50 dark:bg-violet-950/20">
                                      <Award size={14} className="text-violet-600 mx-auto mb-1" />
                                      <p className="text-sm font-black text-violet-700 dark:text-violet-400">{course.sem_number}</p>
                                      <p className="text-[8px] font-bold text-zinc-500 uppercase">Semester</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                                      <Trophy size={14} className="text-amber-600 mx-auto mb-1" />
                                      <p className="text-sm font-black text-amber-700 dark:text-amber-400">{course.is_primary ? 'Lead' : 'Support'}</p>
                                      <p className="text-[8px] font-bold text-zinc-500 uppercase">Your Role</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                                      <Target size={14} className="text-emerald-600 mx-auto mb-1" />
                                      <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">{course.short_name || 'Theory'}</p>
                                      <p className="text-[8px] font-bold text-zinc-500 uppercase">Type</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeacherCourses