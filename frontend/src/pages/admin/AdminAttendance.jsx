import { useState } from 'react'
import { Calendar, Layers, ChevronDown, Activity, User, BookOpen, Hash, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllSemesters, getAllCourses, getCourseSessions, getSessionRecords, reviewAttendanceRecord } from '../../api/index'
import { Loader, Modal, Button } from '../../components/index'
import useAdminStore from '../../stores/admin'
import { toast } from 'react-toastify'

const AdminAttendance = () => {
  const { departments } = useAdminStore()
  const queryClient = useQueryClient()
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedSem, setSelectedSem] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [viewRecords, setViewRecords] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  const { data: semesters = [], isLoading: isSemLoading } = useQuery({
    queryKey: ['semesters', selectedDept],
    queryFn: () => getAllSemesters(selectedDept),
    enabled: !!selectedDept,
    staleTime: Infinity,
  })

  const { data: courses = [], isLoading: isCourseLoading } = useQuery({
    queryKey: ['courses', selectedSem],
    queryFn: () => getAllCourses(selectedSem),
    enabled: !!selectedSem,
    staleTime: Infinity,
  })

  const { data: sessions = [], isLoading: isSessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ['sessions', selectedCourse],
    queryFn: () => getCourseSessions(selectedCourse),
    enabled: !!selectedCourse,
    staleTime: Infinity,
  })

  const { data: sessionRecords = [], refetch: refetchRecords } = useQuery({
    queryKey: ['sessionRecords', selectedSession?._id],
    queryFn: () => getSessionRecords(selectedSession?._id),
    enabled: !!selectedSession && viewRecords,
    staleTime: 0,
  })

  const reviewMutation = useMutation({
    mutationFn: ({ recordId, data }) => reviewAttendanceRecord(recordId, data),
    onSuccess: () => {
      refetchRecords()
      refetchSessions()
      queryClient.invalidateQueries(['sessions', selectedCourse])
      toast.success("Attendance status updated")
      setEditingRecord(null)
    },
    onError: (err) => toast.error(err.error || "Failed to update")
  })

  const selectClass = "w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-black text-zinc-800 dark:text-zinc-200 outline-none focus:border-violet-600 appearance-none cursor-pointer transition-all disabled:opacity-40 shadow-sm"

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatName = (str) => {
    if (!str) return ""
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
      case 'absent': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
    }
  }

  const totalPresent = sessionRecords.filter(r => r.status === 'present').length
  const totalAbsent = sessionRecords.filter(r => r.status === 'absent').length
  const totalStudents = sessionRecords.length

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Activity size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Attendance <span className="text-violet-600">Sync</span></h1>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Course-wise Session Management
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedSem(''); setSelectedCourse('') }} className={selectClass}>
              <option value="">CHOOSE DEPARTMENT</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedCourse('') }} className={selectClass} disabled={!selectedDept || isSemLoading}>
              <option value="">{isSemLoading ? 'LOADING...' : 'CHOOSE SEMESTER'}</option>
              {semesters.map(s => <option key={s._id} value={s._id}>SEMESTER {s.sem_number}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className={selectClass} disabled={!selectedSem || isCourseLoading}>
              <option value="">{isCourseLoading ? 'LOADING...' : 'CHOOSE COURSE'}</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.course_code} — {c.short_name?.toUpperCase() || c.name.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {!selectedCourse ? (
          <div className="py-40 text-center opacity-20">
            <Layers size={64} strokeWidth={1} className="mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-wider">Select Course to View Sessions</p>
          </div>
        ) : isSessionsLoading ? (
          <div className="py-20 flex justify-center"><Loader text="Fetching sessions..." /></div>
        ) : sessions.length === 0 ? (
          <div className="py-40 text-center opacity-30">
            <Calendar size={48} strokeWidth={1} className="mx-auto mb-3 text-zinc-400" />
            <p className="text-[10px] font-black uppercase tracking-wider">No sessions found for this course</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session._id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-all">
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 flex-wrap mb-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex flex-col items-center justify-center">
                          <Calendar size={18} className="text-violet-600" />
                          <span className="text-[8px] font-black text-violet-600 mt-0.5">DATE</span>
                        </div>
                        <div>
                          <p className="text-base font-black text-zinc-800 dark:text-zinc-200">{formatDate(session.date)}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {session.batch_name && (
                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                                Batch {session.batch_name}
                              </span>
                            )}
                            <span className="text-[9px] text-zinc-500">ID: {session._id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-start gap-2">
                          <BookOpen size={14} className="text-violet-500 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[8px] font-black uppercase text-zinc-400">Course</p>
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{formatName(session.course_name) || 'N/A'}</p>
                            <p className="text-[9px] text-zinc-500 font-mono">{session.course_code || ''}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <User size={14} className="text-violet-500 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[8px] font-black uppercase text-zinc-400">Teacher</p>
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{formatName(session.teacher_name) || 'Not Assigned'}</p>
                            <p className="text-[9px] text-zinc-500 truncate">{session.teacher_email || ''}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Hash size={14} className="text-violet-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[8px] font-black uppercase text-zinc-400">Semester</p>
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Semester {session.sem_number || '?'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Layers size={14} className="text-violet-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[8px] font-black uppercase text-zinc-400">Batch</p>
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{session.batch_name || 'All Batches'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      icon={Calendar}
                      onClick={() => { setSelectedSession(session); setViewRecords(true); }}
                      className="h-11 px-5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap shrink-0"
                    >
                      View Records
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={viewRecords} onClose={() => { setViewRecords(false); setSelectedSession(null); setEditingRecord(null); }} size="lg">
        {selectedSession && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Calendar size={18} />
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">Attendance Details</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{formatDate(selectedSession.date)}</p>
                {selectedSession.batch_name && (
                  <p className="text-[9px] text-emerald-600 mt-1">Batch {selectedSession.batch_name}</p>
                )}
              </div>
            </div>

            {sessionRecords.length > 0 && (
              <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl mb-5">
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-600">{totalPresent}</p>
                  <p className="text-[9px] font-black uppercase text-zinc-500">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-red-500">{totalAbsent}</p>
                  <p className="text-[9px] font-black uppercase text-zinc-500">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-zinc-500">{totalStudents}</p>
                  <p className="text-[9px] font-black uppercase text-zinc-500">Total</p>
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800">
              {sessionRecords.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400">No attendance records found</p>
                </div>
              ) : (
                sessionRecords.map(record => (
                  <div key={record._id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          {formatName(record.first_name)} {formatName(record.last_name)}
                        </p>
                        <span className="text-[10px] text-zinc-500 font-mono">{record.roll_no}</span>
                        {record.batch_name && (
                          <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                            Batch {record.batch_name}
                          </span>
                        )}
                        {record.department_name && (
                          <span className="text-[8px] font-black text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-1.5 py-0.5 rounded">
                            {record.department_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                      <button
                        onClick={() => setEditingRecord(record)}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 transition-colors"
                      >
                        <RefreshCw size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 pt-5 mt-3 border-t dark:border-zinc-800">
              <Button variant="ghost" className="flex-1" onClick={() => { setViewRecords(false); setSelectedSession(null); }}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editingRecord} onClose={() => setEditingRecord(null)} size="sm">
        {editingRecord && (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
                <RefreshCw size={24} className="text-violet-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{formatName(editingRecord.first_name)} {formatName(editingRecord.last_name)}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{editingRecord.roll_no}</p>
              <p className="text-[10px] font-bold mt-2">Current Status: <span className={`uppercase ${getStatusColor(editingRecord.status)}`}>{editingRecord.status}</span></p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-zinc-500 text-center">Update Attendance Status</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => reviewMutation.mutate({ recordId: editingRecord._id, data: { status: 'present' } })}
                  className="py-3 rounded-xl font-black uppercase text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 transition-all"
                >
                  Present
                </button>
                <button
                  onClick={() => reviewMutation.mutate({ recordId: editingRecord._id, data: { status: 'absent' } })}
                  className="py-3 rounded-xl font-black uppercase text-sm bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition-all"
                >
                  Absent
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t dark:border-zinc-800">
              <Button variant="ghost" className="flex-1" onClick={() => setEditingRecord(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminAttendance