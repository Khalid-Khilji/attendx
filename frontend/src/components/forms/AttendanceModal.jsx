import { useState } from 'react'
import { Camera, Upload, Play, Eye } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSession, markAttendanceByFrames } from '../../api/index'
import { Modal, Button, AttendanceRecords } from '../index'

const AttendanceModal = ({ isOpen, onClose, slot, todaySession }) => {
    const queryClient = useQueryClient()
    const [step, setStep] = useState(todaySession ? 'upload' : 'create')
    const [sessionId, setSessionId] = useState(todaySession?._id || null)
    const [frames, setFrames] = useState([])
    const [result, setResult] = useState(null)
    const [viewRecords, setViewRecords] = useState(false)

    const createMutation = useMutation({
        mutationFn: createSession,
        onSuccess: (res) => {
            setSessionId(res._id)
            setStep('upload')
            queryClient.invalidateQueries(['sessions', slot.course_id])
        }
    })

    const markMutation = useMutation({
        mutationFn: ({ id, files }) => markAttendanceByFrames(id, files),
        onSuccess: (res) => {
            setResult(res)
            setStep('result')
            queryClient.invalidateQueries(['sessions', slot.course_id])
        }
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-tight">{slot.course_name}</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1.5">{slot.course_code} · SEM {slot.sem_number}</p>
            </div>

            {step === 'create' && (
                <div className="py-4">
                    <Button className="w-full h-14 rounded-2xl shadow-xl shadow-violet-500/20" icon={Play} isLoading={createMutation.isPending}
                        onClick={() => createMutation.mutate({ timetable_id: slot._id, teacher_id: slot.teacher_id, date: new Date().toISOString().split('T')[0] })}>
                        Initialize Session
                    </Button>
                </div>
            )}

            {step === 'upload' && (
                <div className="space-y-6">
                    <label htmlFor="frame_upload" className="block cursor-pointer group">
                        <div className={`rounded-4xl border-2 border-dashed transition-all p-10 text-center ${frames.length > 0 ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-violet-400'}`}>
                            <Camera size={40} className="mx-auto mb-4 text-zinc-300 group-hover:text-violet-500 transition-colors" />
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{frames.length > 0 ? `${frames.length} frames ready` : 'Capture Batch Frames'}</p>
                            <input id="frame_upload" name="frames" type="file" accept="image/*" multiple className="hidden" onChange={e => setFrames(Array.from(e.target.files))} />
                        </div>
                    </label>
                    <div className="flex gap-3">
                        {!todaySession && <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setStep('create')}>Back</Button>}
                        <Button className="flex-2 h-12 rounded-xl shadow-lg" icon={Upload} disabled={frames.length === 0} isLoading={markMutation.isPending} onClick={() => markMutation.mutate({ id: sessionId, files: frames })}>
                            Sync Attendance
                        </Button>
                    </div>
                </div>
            )}

            {step === 'result' && result && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                        {['present', 'absent', 'review'].map(s => (
                            <div key={s} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 text-center">
                                <p className="text-xl font-black dark:text-white">{result[s]}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mt-1">{s}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={onClose}>Finish</Button>
                        <Button className="flex-1 h-12 rounded-xl" icon={Eye} onClick={() => setViewRecords(true)}>Roster</Button>
                    </div>
                </div>
            )}

            {todaySession && step !== 'result' && (
                <div className="mt-4 pt-4 border-t dark:border-zinc-800">
                    <Button variant="ghost" className="w-full h-11 text-[10px] font-black uppercase" icon={Eye} onClick={() => setViewRecords(true)}>Quick View Logs</Button>
                </div>
            )}

            <AttendanceRecords isOpen={viewRecords} sessionId={sessionId} onClose={() => setViewRecords(false)} />
        </Modal>
    )
}

export default AttendanceModal