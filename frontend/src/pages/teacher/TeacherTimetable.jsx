import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Calendar, LayoutGrid, Clock, ChevronDown, ChevronUp, Hash, BookOpen, User, GraduationCap, Coffee, Sun, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTeacherTimetable } from '../../api/index'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const formatName = (str) => {
  if (!str) return ''
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

const convertTo12Hour = (time24) => {
  if (!time24) return ''
  const match = time24.match(/(\d+):(\d+)/)
  if (!match) return time24
  let hours = parseInt(match[1])
  const minutes = match[2]
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${minutes} ${ampm}`
}

const EmptyDayCard = ({ day, isToday = false }) => {
  if (isToday) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 rounded-2xl border border-violet-200 dark:border-violet-800 p-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
            <Sparkles size={36} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-xl font-black text-violet-700 dark:text-violet-400">No Classes Today</p>
            <p className="text-sm text-violet-600 dark:text-violet-500 mt-1">Enjoy your free time!</p>
          </div>
        </div>
      </div>
    )
  }

  const messages = {
    Monday: 'Start the week fresh! No classes scheduled.',
    Tuesday: 'Free day to catch up on assignments.',
    Wednesday: 'Midweek break! Use this time wisely.',
    Thursday: 'Almost there! No classes today.',
    Friday: 'Weekend loading... No classes!',
    Saturday: 'Enjoy your weekend! No classes scheduled.'
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 p-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <Coffee size={32} className="text-zinc-400 dark:text-zinc-500" />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {messages[day] || 'No classes scheduled'}
        </p>
      </div>
    </div>
  )
}

const TeacherTimetable = () => {
  const [expandedDays, setExpandedDays] = useState({})
  const [showAllDays, setShowAllDays] = useState(false)

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['my-timetable'],
    queryFn: getTeacherTimetable,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long' })

  const { todaySlots, groupedSlots, totalHours, upcomingSlots } = useMemo(() => {
    const allSlots = slots.map(slot => ({
      ...slot,
      start_time_display: convertTo12Hour(slot.start_time),
      end_time_display: convertTo12Hour(slot.end_time),
      start_time_minutes: (() => {
        const [h, m] = slot.start_time.split(':').map(Number)
        return h * 60 + m
      })()
    }))

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const todayName = now.toLocaleDateString('en-IN', { weekday: 'long' })

    const upcoming = allSlots
      .filter(slot => {
        if (slot.day_of_week !== todayName) return false
        return slot.start_time_minutes > currentMinutes
      })
      .sort((a, b) => a.start_time_minutes - b.start_time_minutes)
      .slice(0, 2)

    const todayOnly = allSlots.filter(s => s.day_of_week === today)
      .sort((a, b) => a.start_time_minutes - b.start_time_minutes)

    const grouped = DAYS.reduce((acc, day) => {
      acc[day] = allSlots.filter(s => s.day_of_week === day)
        .sort((a, b) => a.start_time_minutes - b.start_time_minutes)
      return acc
    }, {})

    const total = allSlots.reduce((sum, slot) => {
      const [startH, startM] = slot.start_time.split(':').map(Number)
      const [endH, endM] = slot.end_time.split(':').map(Number)
      const duration = (endH * 60 + endM) - (startH * 60 + startM)
      return sum + duration
    }, 0)

    return { todaySlots: todayOnly, groupedSlots: grouped, totalHours: Math.floor(total / 60), upcomingSlots: upcoming }
  }, [slots, today])

  const toggleDay = (day) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }))
  }

  const SlotCard = ({ slot, isToday = false, compact = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group rounded-xl transition-all duration-300 ${isToday
          ? 'bg-gradient-to-r from-violet-50 to-white dark:from-violet-950/20 dark:to-zinc-900 border-l-4 border-l-violet-500 shadow-md'
          : 'bg-white dark:bg-zinc-900 hover:shadow-md border border-zinc-200 dark:border-zinc-800'
        } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 bg-violet-100 dark:bg-violet-900/40 px-2.5 py-1 rounded-lg">
              <Clock size={12} className="text-violet-600" />
              <span className="text-xs font-black text-violet-700 dark:text-violet-400">
                {slot.start_time_display} - {slot.end_time_display}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={12} className="text-zinc-400" />
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">{slot.course_code}</span>
            </div>
          </div>

          <h4 className={`font-bold text-zinc-700 dark:text-zinc-300 ${compact ? 'text-sm' : 'text-base'} mb-2 line-clamp-1`}>
            {formatName(slot.course_name)}
          </h4>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-zinc-400" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {formatName(slot.teacher_name)}
              </span>
            </div>
            {!slot.batch_name ? (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg">
                Theory (All Batches)
              </span>
            ) : (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-lg">
                Lab • Batch {slot.batch_name}
              </span>
            )}
            {slot.sem_number && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-lg">
                Sem {slot.sem_number}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 pt-6 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-32 bg-white dark:bg-zinc-900 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const hasAnyClasses = slots.length > 0

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-5 shadow-xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter text-white">My Timetable</h1>
              <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                {slots.length} Sessions • {totalHours} Teaching Hours
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg">
            <Calendar size={14} className="text-white" />
            <span className="text-[10px] font-bold text-white">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </motion.div>

      {!hasAnyClasses ? (
        <div className="py-32 text-center">
          <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Calendar size={40} className="text-zinc-400" />
          </div>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">No classes scheduled yet</p>
        </div>
      ) : (
        <>
          {upcomingSlots.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-violet-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Upcoming</h3>
              </div>
              <div className="space-y-2">
                {upcomingSlots.map(slot => (
                  <SlotCard key={slot._id} slot={slot} isToday={true} compact={true} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-violet-600 rounded-full"></div>
              <h2 className="text-base font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Today's Schedule
              </h2>
              <span className="text-[9px] font-bold text-white bg-violet-600 px-2 py-0.5 rounded-full">{today}</span>
            </div>
            {todaySlots.length > 0 ? (
              <div className="space-y-2">
                {todaySlots.map(slot => (
                  <SlotCard key={slot._id} slot={slot} isToday={true} />
                ))}
              </div>
            ) : (
              <EmptyDayCard day={today} isToday={true} />
            )}
          </div>

          <div>
            <button
              onClick={() => setShowAllDays(!showAllDays)}
              className="flex items-center justify-between w-full p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow transition-all"
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-violet-600" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Full Week Schedule
                </span>
              </div>
              {showAllDays ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {showAllDays && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3"
                >
                  {DAYS.map(day => {
                    const daySlots = groupedSlots[day] || []
                    const hasSlots = daySlots.length > 0

                    if (!hasSlots) {
                      return (
                        <div key={day} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                          <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                              <h3 className={`text-sm font-black uppercase tracking-wider ${day === today ? 'text-violet-600' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                {day}
                              </h3>
                              {day === today && (
                                <span className="text-[8px] font-bold text-white bg-violet-600 px-1.5 py-0.5 rounded-full">Today</span>
                              )}
                            </div>
                          </div>
                          <div className="p-3">
                            <EmptyDayCard day={day} />
                          </div>
                        </div>
                      )
                    }

                    const isExpanded = expandedDays[day] || false
                    const displaySlots = isExpanded ? daySlots : daySlots.slice(0, 2)

                    return (
                      <div key={day} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <button
                          onClick={() => toggleDay(day)}
                          className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-black uppercase tracking-wider ${day === today ? 'text-violet-600' : 'text-zinc-600 dark:text-zinc-400'}`}>
                              {day}
                            </h3>
                            {day === today && (
                              <span className="text-[8px] font-bold text-white bg-violet-600 px-1.5 py-0.5 rounded-full">Today</span>
                            )}
                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                              {daySlots.length}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <AnimatePresence>
                          {(isExpanded || daySlots.length <= 2) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2 p-3 pt-0"
                            >
                              {daySlots.map(slot => (
                                <SlotCard key={slot._id} slot={slot} isToday={day === today} />
                              ))}
                            </motion.div>
                          )}
                          {!isExpanded && daySlots.length > 2 && (
                            <div className="px-3 pb-3 pt-0">
                              <button
                                onClick={() => toggleDay(day)}
                                className="w-full text-center py-1.5 text-[10px] font-bold text-violet-600 hover:text-violet-700 transition-colors"
                              >
                                + {daySlots.length - 2} more
                              </button>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}

export default TeacherTimetable