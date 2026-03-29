import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, Play, Eye, Video, VideoOff, RefreshCw } from 'lucide-react'
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
            setSessionId(res._id)
            setStep('upload')
            console.log('session response:', res)
            queryClient.invalidateQueries(['sessions', slot.course_id])
        }
    })

    const markMutation = useMutation({
        mutationFn: ({ id, files }) => markAttendanceByFrames(id, files),
        onSuccess: (res) => {
            setResult(res)
            setStep('result')
            queryClient.invalidateQueries(['sessions', slot.course_id])
            stopCamera()
        }
    })

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'environment' }
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()
            }
            setCameraActive(true)
        } catch (err) {
            console.error('Camera error:', err)
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
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)
        return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    }, [])

    const startRecording = useCallback(async () => {
        setRecording(true)
        setCapturedFrames(0)
        const allBlobs = []

        for (let sec = 5; sec >= 1; sec--) {
            setCountdown(sec)
            const secondBlobs = []
            // 5 frames per second
            for (let f = 0; f < 5; f++) {
                await new Promise(r => setTimeout(r, 200))
                const blob = await captureFrame()
                if (blob) secondBlobs.push(blob)
            }
            // Pick best frame from this second (largest size = most detail)
            if (secondBlobs.length > 0) {
                const best = secondBlobs.reduce((a, b) => a.size > b.size ? a : b)
                allBlobs.push(best)
                setCapturedFrames(prev => prev + 1)
            }
        }

        setCountdown(null)
        setRecording(false)

        // Convert blobs to File objects
        const files = allBlobs.map((blob, i) => new File([blob], `frame_${i}.jpg`, { type: 'image/jpeg' }))
        setFrames(files)
    }, [captureFrame])

    const handleClose = () => {
        stopCamera()
        setStep(todaySession ? 'upload' : 'create')
        setSessionId(todaySession?._id || null)
        setFrames([])
        setResult(null)
        setMode('upload')
        setCapturedFrames(0)
        onClose()
    }

    const submitFrames = () => {
        markMutation.mutate({ id: sessionId, files: frames })
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <div className="mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-tight">{slot.course_name}</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1.5">{slot.course_code} · SEM {slot.sem_number}</p>
            </div>

            {step === 'create' && (
                <div className="py-4">
                    <Button className="w-full h-14 rounded-2xl shadow-xl shadow-violet-500/20" icon={Play} isLoading={createMutation.isPending}
                        onClick={() => createMutation.mutate({
                            timetable_id: slot._id,
                            teacher_id: slot.teacher_id,
                            date: new Date().toISOString().split('T')[0]
                        })}>
                        Initialize Session
                    </Button>
                </div>
            )}

            {step === 'upload' && (
                <div className="space-y-5">
                    <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                        <button onClick={() => { setMode('upload'); stopCamera(); setFrames([]) }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${mode === 'upload' ? 'bg-white dark:bg-zinc-900 text-violet-600 shadow-sm' : 'text-zinc-500'}`}>
                            <Upload size={13} /> Upload
                        </button>
                        <button onClick={() => { setMode('camera'); setFrames([]) }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${mode === 'camera' ? 'bg-white dark:bg-zinc-900 text-violet-600 shadow-sm' : 'text-zinc-500'}`}>
                            <Camera size={13} /> Camera
                        </button>
                    </div>

                    {mode === 'upload' ? (
                        <label htmlFor="frame_upload" className="block cursor-pointer group">
                            <div className={`rounded-3xl border-2 border-dashed transition-all p-10 text-center ${frames.length > 0 ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-violet-400'}`}>
                                <Upload size={36} className="mx-auto mb-3 text-zinc-300 group-hover:text-violet-500 transition-colors" />
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                                    {frames.length > 0 ? `${frames.length} frames ready` : 'Select class photos'}
                                </p>
                                <p className="text-[9px] text-zinc-400 mt-1 uppercase tracking-widest">JPG · PNG · Multiple allowed</p>
                                <input id="frame_upload" name="frames" type="file" accept="image/*" multiple className="hidden"
                                    onChange={e => setFrames(Array.from(e.target.files))} />
                            </div>
                        </label>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative rounded-3xl overflow-hidden bg-zinc-900 aspect-video">
                                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                                <canvas ref={canvasRef} className="hidden" />

                                {!cameraActive && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <VideoOff size={36} className="mx-auto mb-2 text-zinc-600" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Camera Off</p>
                                        </div>
                                    </div>
                                )}

                                {recording && countdown && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="text-center">
                                            <div className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center mb-2 mx-auto shadow-2xl">
                                                <span className="text-4xl font-black text-white">{countdown}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">
                                                {capturedFrames}/5 frames
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {frames.length > 0 && !recording && (
                                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full">
                                        {frames.length} frames captured
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {!cameraActive ? (
                                    <Button className="flex-1 h-12 rounded-xl" icon={Camera} onClick={startCamera}>
                                        Start Camera
                                    </Button>
                                ) : recording ? (
                                    <div className="flex-1 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-red-600">
                                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                        Recording...
                                    </div>
                                ) : (
                                    <>
                                        <Button className="flex-1 h-12 rounded-xl" icon={Video} onClick={startRecording}
                                            disabled={frames.length > 0}>
                                            {frames.length > 0 ? 'Captured' : 'Record 5s'}
                                        </Button>
                                        {frames.length > 0 && (
                                            <Button variant="ghost" className="h-12 px-4 rounded-xl" icon={RefreshCw}
                                                onClick={() => { setFrames([]); setCapturedFrames(0) }}>
                                                Redo
                                            </Button>
                                        )}
                                        <Button variant="ghost" className="h-12 px-4 rounded-xl" icon={VideoOff} onClick={stopCamera}>
                                            Stop
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {!todaySession && (
                            <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setStep('create')}>Back</Button>
                        )}
                        <Button className="flex-1 h-12 rounded-xl shadow-lg" icon={Upload}
                            disabled={frames.length === 0} isLoading={markMutation.isPending}
                            onClick={submitFrames}>
                            Sync Attendance
                        </Button>
                    </div>
                </div>
            )}

            {step === 'result' && result && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { key: 'present', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                            { key: 'absent', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
                            { key: 'review', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                        ].map(({ key, color }) => (
                            <div key={key} className={`rounded-2xl p-4 text-center ${color}`}>
                                <p className="text-2xl font-black">{result[key]}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest mt-1">{key}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Processing Stats</p>
                        {[
                            { label: 'Frames Processed', value: result.frames_processed },
                            { label: 'Faces Detected', value: result.faces_detected },
                            { label: 'Spoof Attempts', value: result.spoof_attempts },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between">
                                <span className="text-[10px] text-zinc-500">{label}</span>
                                <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300">{value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={handleClose}>Finish</Button>
                        <Button className="flex-1 h-12 rounded-xl" icon={Eye} onClick={() => setViewRecords(true)}>Roster</Button>
                    </div>
                </div>
            )}

            {todaySession && step !== 'result' && (
                <div className="mt-4 pt-4 border-t dark:border-zinc-800">
                    <Button variant="ghost" className="w-full h-11 text-[10px] font-black uppercase" icon={Eye} onClick={() => setViewRecords(true)}>
                        Quick View Logs
                    </Button>
                </div>
            )}

            <AttendanceRecords isOpen={viewRecords} sessionId={sessionId} onClose={() => setViewRecords(false)} />
        </Modal>
    )
}

export default AttendanceModal