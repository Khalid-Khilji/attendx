import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Camera, Layers, Calendar, SearchX, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, ChevronDown, GraduationCap } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTeacherTimetable, getCourseSessions } from '../../api/index'
import { AttendanceModal, Loader } from '../../components/index'
import useAdminStore from '../../stores/admin'

const getWeekNumber = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const firstDayWeek = firstDayOfMonth.getDay()
  const dayOfMonth = date.getDate()
  return Math.ceil((dayOfMonth + firstDayWeek) / 7)
}

const getWeeksInMonth = (year, month) => {
  const lastDay = new Date(year, month + 1, 0)
  const lastDayDate = lastDay.getDate()
  const firstDayOfMonth = new Date(year, month, 1)
  const firstDayWeek = firstDayOfMonth.getDay()
  return Math.ceil((lastDayDate + firstDayWeek) / 7)
}

const formatDateRange = (year, month, weekNum) => {
  const firstDayOfMonth = new Date(year, month, 1)
  const firstDayWeek = firstDayOfMonth.getDay()
  const startDay = (weekNum - 1) * 7 - firstDayWeek + 1
  const startDate = new Date(year, month, startDay)
  const endDate = new Date(year, month, startDay + 6)
  return `${startDate.getDate()} ${startDate.toLocaleString('default', { month: 'short' })} - ${endDate.getDate()} ${endDate.toLocaleString('default', { month: 'short' })}`
}

const SlotCard = ({ slot, date }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dateStr = date.toISOString().split('T')[0]

  const { data: sessions = [], refetch } = useQuery({
    queryKey: ['sessions', slot.course_id, dateStr],
    queryFn: () => getCourseSessions(slot.course_id),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const sessionForDate = sessions.find(s => s.date?.slice(0, 10) === dateStr)

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-3 flex items-center justify-between hover:shadow-md transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex flex-col items-center justify-center shrink-0">
            <span className="text-[9px] font-black text-violet-600">{slot.start_time}</span>
            <div className="h-px w-3 bg-violet-200 my-0.5" />
            <span className="text-[7px] font-bold text-zinc-400">{slot.end_time}</span>
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 uppercase truncate max-w-[150px]">{slot.course_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[8px] font-black text-violet-500 bg-violet-50 dark:bg-violet-900/40 px-1.5 py-0.5 rounded">{slot.course_code}</span>
              <span className="text-[8px] font-bold text-zinc-400">Sem {slot.sem_number}</span>
              {slot.batch_name && (
                <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                  Batch {slot.batch_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sessionForDate ? (
            <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg flex items-center gap-1">
              <CheckCircle size={10} /> Done
            </span>
          ) : (
            <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg flex items-center gap-1">
              <Clock size={10} /> Pending
            </span>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-lg hover:bg-violet-600 hover:text-white transition-all"
          >
            <Camera size={12} /> {sessionForDate ? 'Edit' : 'Mark'}
          </button>
        </div>
      </div>
      <AttendanceModal 
        isOpen={isOpen} 
        onClose={() => { setIsOpen(false); refetch(); }} 
        slot={slot} 
        todaySession={sessionForDate}
        selectedDate={dateStr}
      />
    </>
  )
}

const WeekView = ({ slots, weekNum, year, month, onPrevWeek, onNextWeek, hasPrev, hasNext, selectedAcYear }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const getDateOfWeek = (week, dayName) => {
    const firstDayOfMonth = new Date(year, month, 1)
    const firstDayWeek = firstDayOfMonth.getDay()
    const dayNumbers = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 }
    const targetDayNum = dayNumbers[dayName]
    const adjustedFirstDay = firstDayWeek === 0 ? 7 : firstDayWeek
    const dayOffset = targetDayNum - adjustedFirstDay
    const dateNum = (week - 1) * 7 + dayOffset + 1
    return new Date(year, month, dateNum)
  }

  const isDateInAcademicYear = (date) => {
    if (!selectedAcYear) return true
    const acYearStart = new Date(selectedAcYear.start_date)
    const acYearEnd = new Date(selectedAcYear.end_date)
    return date >= acYearStart && date <= acYearEnd
  }

  const slotsByDay = useMemo(() => {
    const map = {}
    days.forEach(day => { map[day] = slots.filter(s => s.day_of_week === day) })
    return map
  }, [slots, days])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrevWeek} disabled={!hasPrev} className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-all">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">{formatDateRange(year, month, weekNum)}</p>
          <p className="text-[9px] font-bold text-violet-600 mt-0.5">Week {weekNum}</p>
        </div>
        <button onClick={onNextWeek} disabled={!hasNext} className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-all">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => {
          const daySlots = slotsByDay[day]
          const dateObj = getDateOfWeek(weekNum, day)
          const isValidDate = dateObj.getMonth() === month && dateObj.getFullYear() === year
          const isInAcYear = isDateInAcademicYear(dateObj)
          const isPast = isValidDate && dateObj < new Date() && dateObj.toDateString() !== new Date().toDateString()
          const isToday = isValidDate && dateObj.toDateString() === new Date().toDateString()

          if (!isInAcYear && isValidDate) {
            return (
              <div key={day} className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden opacity-50">
                <div className="px-3 py-2 border-b bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-zinc-400">{day}</span>
                    <span className="text-[9px] font-bold text-zinc-400">{dateObj.getDate()}</span>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <p className="text-[9px] text-zinc-400">Outside Academic Year</p>
                </div>
              </div>
            )
          }

          return (
            <div key={day} className={`rounded-xl border ${isToday ? 'border-violet-300 dark:border-violet-700 bg-violet-50/30 dark:bg-violet-950/20' : 'border-zinc-100 dark:border-zinc-800'} overflow-hidden`}>
              <div className={`px-3 py-2 border-b ${isToday ? 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30' : 'bg-zinc-50 dark:bg-zinc-800/50'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase ${isToday ? 'text-violet-700 dark:text-violet-400' : 'text-zinc-600 dark:text-zinc-400'}`}>{day}</span>
                  {isValidDate && (
                    <span className={`text-[9px] font-bold ${isToday ? 'text-violet-600' : isPast ? 'text-zinc-400' : 'text-emerald-600'}`}>
                      {dateObj.getDate()}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                {!isValidDate ? (
                  <p className="text-[9px] text-zinc-400 text-center py-4">Next month</p>
                ) : daySlots.length === 0 ? (
                  <p className="text-[9px] text-zinc-400 text-center py-4">No lectures</p>
                ) : (
                  daySlots.map(slot => <SlotCard key={slot._id} slot={slot} date={dateObj} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const TeacherAttendance = () => {
  const { academicYears } = useAdminStore()
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(currentDate))
  const [selectedAcYearId, setSelectedAcYearId] = useState('')

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['my-timetable'],
    queryFn: async () => {
        const res = await getTeacherTimetable();
        return res;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const selectedAcYear = academicYears?.find(y => y._id === selectedAcYearId)

  const filteredSlots = useMemo(() => {
    if (!selectedAcYear) return slots
    const startDate = new Date(selectedAcYear.start_date)
    const endDate = new Date(selectedAcYear.end_date)
    return slots.filter(slot => {
      const slotDate = new Date(slot.date || slot.created_at)
      return slotDate >= startDate && slotDate <= endDate
    })
  }, [slots, selectedAcYear])

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const years = [2024, 2025, 2026, 2027, 2028]
  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonth)
  const weekNumbers = Array.from({ length: weeksInMonth }, (_, i) => i + 1)

  const handleMonthChange = (month) => {
    setSelectedMonth(month)
    setSelectedWeek(1)
  }

  const handleYearChange = (year) => {
    setSelectedYear(year)
    setSelectedWeek(1)
  }

  const handlePrevWeek = () => {
    if (selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1)
    } else if (selectedMonth > 0) {
      const prevMonth = selectedMonth - 1
      const prevMonthWeeks = getWeeksInMonth(selectedYear, prevMonth)
      setSelectedMonth(prevMonth)
      setSelectedWeek(prevMonthWeeks)
    } else {
      const prevYear = selectedYear - 1
      const prevMonthWeeks = getWeeksInMonth(prevYear, 11)
      setSelectedYear(prevYear)
      setSelectedMonth(11)
      setSelectedWeek(prevMonthWeeks)
    }
  }

  const handleNextWeek = () => {
    if (selectedWeek < weeksInMonth) {
      setSelectedWeek(selectedWeek + 1)
    } else if (selectedMonth < 11) {
      setSelectedMonth(selectedMonth + 1)
      setSelectedWeek(1)
    } else {
      setSelectedYear(selectedYear + 1)
      setSelectedMonth(0)
      setSelectedWeek(1)
    }
  }

  const isCurrentMonth = selectedYear === currentDate.getFullYear() && selectedMonth === currentDate.getMonth()
  const isCurrentWeek = isCurrentMonth && selectedWeek === getWeekNumber(currentDate)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Layers size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter dark:text-white">Attendance <span className="text-violet-600">Scan</span></h1>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Weekly Session Management
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {academicYears && academicYears.length > 0 && (
                <div className="relative min-w-[180px]">
                  <select value={selectedAcYearId} onChange={(e) => setSelectedAcYearId(e.target.value)} className="w-full h-10 px-4 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold appearance-none cursor-pointer">
                    <option value="">All Academic Years</option>
                    {academicYears.map(y => (<option key={y._id} value={y._id}>{y.label}</option>))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              )}
              <div className="relative">
                <select value={selectedMonth} onChange={(e) => handleMonthChange(parseInt(e.target.value))} className="h-10 px-4 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold appearance-none cursor-pointer">
                  {months.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={selectedYear} onChange={(e) => handleYearChange(parseInt(e.target.value))} className="h-10 px-4 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold appearance-none cursor-pointer">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={selectedWeek} onChange={(e) => setSelectedWeek(parseInt(e.target.value))} className="h-10 px-4 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold appearance-none cursor-pointer">
                  {weekNumbers.map(w => <option key={w} value={w}>Week {w}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {selectedAcYear && (
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-full w-fit">
              <GraduationCap size={12} /> {selectedAcYear.label}
            </div>
          )}

          {isCurrentWeek && (
            <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Current Week
            </div>
          )}
        </header>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader text="Loading schedule..." /></div>
        ) : filteredSlots.length === 0 ? (
          <div className="py-40 text-center">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <SearchX size={40} className="text-zinc-300 dark:text-zinc-700" />
            </div>
            <p className="text-sm font-black uppercase tracking-wider text-zinc-400">No Timetable Found</p>
            <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-wider">
              {selectedAcYear ? `No classes in ${selectedAcYear.label}` : 'Contact admin to assign courses'}
            </p>
          </div>
        ) : (
          <WeekView
            slots={filteredSlots}
            weekNum={selectedWeek}
            year={selectedYear}
            month={selectedMonth}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            hasPrev={true}
            hasNext={true}
            selectedAcYear={selectedAcYear}
          />
        )}
      </div>
    </div>
  )
}

export default TeacherAttendance