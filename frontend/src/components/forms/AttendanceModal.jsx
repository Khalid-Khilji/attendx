import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, Play, Eye, Video, VideoOff, RefreshCw, Check, X, AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSession, markAttendanceByFrames, confirmAttendance, cancelSession } from '../../api/index'
import { Modal, Button, AttendanceRecords } from '../index'

const statusColors = {
    present: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    absent: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    review: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
}

const AttendanceModal = ({ isOpen, onClose, slot, todaySession }) => {
    const queryClient = useQueryClient()
    const [step, setStep] = useState(todaySession ? 'upload' : 'create')
    const [sessionId, setSessionId] = useState(todaySession?._id || null)
    const [frames, setFrames] = useState([])
    const [scanResult, setScanResult] = useState(null)
    const [editedResults, setEditedResults] = useState([])
    const [viewRecords, setViewRecords] = useState(false)
    const [mode, setMode] = useState('upload')
    const [cameraActive, setCameraActive] = useState(false)
    const [recording, setRecording] = useState(false)
    const [countdown, setCountdown] = useState(null)
    const [capturedFrames, setCapturedFrames] = useState(0)

    const videoRef = useRef(null)
    const streamRef = useRef(null)
    const canvasRef = useRef(null)

    const createMutation = useMutation({
        mutationFn: createSession,
        onSuccess: (res) => {
            if (res.error) return
            setSessionId(res._id)
            setStep('upload')
            queryClient.invalidateQueries(['sessions', slot.course_id])
        }
    })

    const markMutation = useMutation({
        mutationFn: ({ id, files }) => markAttendanceByFrames(id, files),
        onSuccess: (res) => {
            if (res.error) return
            setScanResult(res)
            setEditedResults(res.results || [])
            setStep('review')
            stopCamera()
        }
    })

    const confirmMutation = useMutation({
        mutationFn: () => confirmAttendance(sessionId, editedResults),
        onSuccess: () => {
            setStep('done')
            queryClient.invalidateQueries(['sessions', slot.course_id])
        }
    })

    const cancelMutation = useMutation({
        mutationFn: () => cancelSession(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions', slot.course_id])
            handleClose()
        }
    })

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "environment"
                }
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()
            }
            setCameraActive(true)
        } catch (err) {
            console.error('Camera error:', err)
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = fallbackStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = fallbackStream;
                    videoRef.current.play();
                }
                setCameraActive(true);
            } catch (fallbackErr) {
                alert("Camera access denied or not found");
            }
        }
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        setCameraActive(false)
        setRecording(false)
        setCountdown(null)
    }

    const captureFrame = useCallback(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return null
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0)
        return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    }, [])

    const startRecording = useCallback(async () => {
        setRecording(true)
        setCapturedFrames(0)
        const allBlobs = []

        for (let sec = 5; sec >= 1; sec--) {
            setCountdown(sec)
            const secondBlobs = []

            for (let f = 0; f < 6; f++) {
                await new Promise(r => setTimeout(r, 150))
                const blob = await captureFrame()
                if (blob) secondBlobs.push(blob)
            }

            if (secondBlobs.length > 0) {
                const sorted = secondBlobs.sort((a, b) => b.size - a.size)
                const top3 = sorted.slice(0, 3)

                allBlobs.push(...top3)
                setCapturedFrames(prev => prev + top3.length)
            }
        }

        setCountdown(null)
        setRecording(false)
        setFrames(allBlobs.map((blob, i) => new File([blob], `frame_${i}.jpg`, { type: 'image/jpeg' })))
    }, [captureFrame])

    const flipStatus = (studentId) => {
        setEditedResults(prev => prev.map(r => {
            if (r.student_id !== studentId) return r
            const next = r.status === 'present' ? 'absent' : r.status === 'absent' ? 'present' : 'present'
            return { ...r, status: next }
        }))
    }

    const handleClose = () => {
        stopCamera()
        setStep(todaySession ? 'upload' : 'create')
        setSessionId(todaySession?._id || null)
        setFrames([])
        setScanResult(null)
        setEditedResults([])
        setMode('upload')
        setCapturedFrames(0)
        onClose()
    }

    const present = editedResults.filter(r => r.status === 'present').length
    const absent = editedResults.filter(r => r.status === 'absent').length
    const review = editedResults.filter(r => r.status === 'review').length

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <div className="mb-5">
                <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-tight">{slot.course_name}</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">{slot.course_code} · SEM {slot.sem_number}</p>
            </div>

            {step === 'create' && (
                <div className="space-y-3 py-2">
                    <Button className="w-full h-14 rounded-2xl shadow-xl shadow-violet-500/20" icon={Play} isLoading={createMutation.isPending}
                        onClick={() => createMutation.mutate({
                            timetable_id: slot._id,
                            date: new Date().toISOString().split('T')[0]
                        })}>
                        Start Session
                    </Button>
                </div>
            )}

            {step === 'upload' && (
                <div className="space-y-4">
                    <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                        {['upload', 'camera'].map(m => (
                            <button key={m} onClick={() => { setMode(m); if (m === 'upload') stopCamera(); setFrames([]) }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${mode === m ? 'bg-white dark:bg-zinc-900 text-violet-600 shadow-sm' : 'text-zinc-500'}`}>
                                {m === 'upload' ? <><Upload size={12} /> Upload</> : <><Camera size={12} /> Camera</>}
                            </button>
                        ))}
                    </div>

                    {mode === 'upload' ? (
                        <label className="block cursor-pointer">
                            <div className={`rounded-3xl border-2 border-dashed p-10 text-center transition-all ${frames.length > 0 ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-violet-400'}`}>
                                <Upload size={32} className="mx-auto mb-3 text-zinc-300" />
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                                    {frames.length > 0 ? `${frames.length} photos ready` : 'Upload class photos'}
                                </p>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={e => setFrames(Array.from(e.target.files))} />
                            </div>
                        </label>
                    ) : (
                        <div className="space-y-3">
                            <div className="relative rounded-3xl overflow-hidden bg-zinc-900 aspect-video">
                                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                                <canvas ref={canvasRef} className="hidden" />
                                {!cameraActive && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <VideoOff size={32} className="text-zinc-600" />
                                    </div>
                                )}
                                {recording && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <div className="text-center">
                                            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-2">
                                                <span className="text-3xl font-black text-white">{countdown}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-white uppercase">{capturedFrames}/5 captured</p>
                                        </div>
                                    </div>
                                )}
                                {frames.length > 0 && !recording && (
                                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full">
                                        {frames.length} frames ready
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {!cameraActive ? (
                                    <Button className="flex-1 h-11 rounded-xl" icon={Camera} onClick={startCamera}>Start Camera</Button>
                                ) : recording ? (
                                    <div className="flex-1 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center gap-2 text-[10px] font-black text-red-600">
                                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> Recording...
                                    </div>
                                ) : (
                                    <>
                                        <Button className="flex-1 h-11 rounded-xl" icon={Video} onClick={startRecording} disabled={frames.length > 0}>
                                            {frames.length > 0 ? '✓ Done' : 'Record 5s'}
                                        </Button>
                                        {frames.length > 0 && (
                                            <Button variant="ghost" className="h-11 px-3 rounded-xl" icon={RefreshCw} onClick={() => { setFrames([]); setCapturedFrames(0) }} />
                                        )}
                                        <Button variant="ghost" className="h-11 px-3 rounded-xl" icon={VideoOff} onClick={stopCamera} />
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        {!todaySession && (
                            <Button variant="ghost" className="h-12 px-4 rounded-xl" onClick={() => setStep('create')}>Back</Button>
                        )}
                        <Button className="flex-1 h-12 rounded-xl" icon={Upload}
                            disabled={frames.length === 0} isLoading={markMutation.isPending}
                            onClick={() => markMutation.mutate({ id: sessionId, files: frames })}>
                            Scan Attendance
                        </Button>
                    </div>

                    {todaySession && (
                        <div className="flex gap-3 pt-1 border-t dark:border-zinc-800">
                            <Button variant="ghost" className="flex-1 h-11 text-[10px] font-black uppercase" icon={Eye} onClick={() => setViewRecords(true)}>View Records</Button>
                            <Button variant="ghost" className="h-11 px-4 rounded-xl text-red-500 hover:bg-red-50" icon={X} onClick={() => cancelMutation.mutate()} isLoading={cancelMutation.isPending}>Cancel</Button>
                        </div>
                    )}
                </div>
            )}

            {step === 'review' && scanResult && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Present', value: present, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                            { label: 'Absent', value: absent, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
                            { label: 'Review', value: review, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                        ].map(s => (
                            <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                                <p className="text-xl font-black">{s.value}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-amber-100 dark:border-amber-800">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Review before confirming — flip status if wrong</p>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        {editedResults.map(r => (
                            <div key={r.student_id} className="flex items-center justify-between px-4 py-2.5">
                                <div>
                                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 capitalize">{r.name || r.student_id.slice(-6)}</p>
                                    <p className="text-[9px] text-zinc-400">{Math.round((r.confidence || 0) * 100)}% confidence</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${statusColors[r.status]}`}>{r.status}</span>
                                    <button onClick={() => flipStatus(r.student_id)}
                                        className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 transition-colors">
                                        Flip
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" className="h-12 px-4 rounded-xl text-red-500" icon={X}
                            isLoading={cancelMutation.isPending}
                            onClick={() => cancelMutation.mutate()}>
                            Cancel Session
                        </Button>
                        <Button className="flex-1 h-12 rounded-xl" icon={Check}
                            isLoading={confirmMutation.isPending}
                            onClick={() => confirmMutation.mutate()}>
                            Confirm & Save
                        </Button>
                    </div>
                </div>
            )}

            {step === 'done' && (
                <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                        <Check size={28} className="text-emerald-600" />
                    </div>
                    <p className="text-lg font-black uppercase tracking-tight dark:text-white">Attendance Saved</p>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={handleClose}>Close</Button>
                        <Button className="flex-1 h-12 rounded-xl" icon={Eye} onClick={() => setViewRecords(true)}>View Roster</Button>
                    </div>
                </div>
            )}

            <AttendanceRecords isOpen={viewRecords} sessionId={sessionId} onClose={() => setViewRecords(false)} />
        </Modal>
    )
}

export default AttendanceModal