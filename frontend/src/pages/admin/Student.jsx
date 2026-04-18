import { useState, useMemo, lazy, Suspense, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Edit3, Trash2, BookOpen, GraduationCap, Search, ChevronDown,
    Camera, ShieldCheck, UserPlus, Hash, Copy, Check,
    TrendingUp, Mail, AlertCircle, LayoutGrid, List, Layers, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllStudents, deleteStudent, getEnrollmentHistory, updateEnrollment, getSemBatches, getAllSemesters } from '../../api/index';
import { Button, Input, Modal } from '../../components/index';
import useAdminStore from '../../stores/admin';
import { toast } from 'react-toastify';

const StudentModal = lazy(() => import('../../components/index').then(m => ({ default: m.StudentModal })));
const EnrollModal = lazy(() => import('../../components/index').then(m => ({ default: m.EnrollModal })));
const FaceModal = lazy(() => import('../../components/index').then(m => ({ default: m.FaceModal })));

const Students = () => {
    const queryClient = useQueryClient();
    const { departments, academicYears } = useAdminStore();
    const [modals, setModals] = useState({ student: false, enroll: false, face: false });
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterFace, setFilterFace] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
    const [editEnrollment, setEditEnrollment] = useState({ open: false, enrollment: null, student: null, batches: [], semesters: [] });
    const [copiedEmail, setCopiedEmail] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const { data: allSemesters = [] } = useQuery({
        queryKey: ['allSemesters'],
        queryFn: async () => {
            const depts = departments.map(d => d._id);
            const allSems = [];
            for (const deptId of depts) {
                const sems = await getAllSemesters(deptId);
                allSems.push(...sems);
            }
            return allSems;
        },
        enabled: departments.length > 0,
        staleTime: 300000,
        refetchOnWindowFocus: false,
    });

    const { data: students = [], isLoading, refetch } = useQuery({
        queryKey: ['students', filterDept],
        queryFn: () => getAllStudents({ deptId: filterDept || undefined }),
        staleTime: 300000,
        refetchOnWindowFocus: false,
    });

    const filteredStudents = useMemo(() => {
        let filtered = [...students];

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter(s =>
                `${s.first_name} ${s.last_name}`.toLowerCase().includes(query) ||
                s.roll_no?.toLowerCase().includes(query) ||
                s.email?.toLowerCase().includes(query)
            );
        }

        if (filterStatus === 'enrolled') {
            filtered = filtered.filter(s => s.enrollment_status === 'active');
        } else if (filterStatus === 'not_enrolled') {
            filtered = filtered.filter(s => !s.enrollment_status);
        }

        if (filterFace === 'registered') {
            filtered = filtered.filter(s => s.face_embedding);
        } else if (filterFace === 'not_registered') {
            filtered = filtered.filter(s => !s.face_embedding);
        }

        return filtered;
    }, [students, search, filterStatus, filterFace]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredStudents.slice(start, start + itemsPerPage);
    }, [filteredStudents, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterDept, filterStatus, filterFace]);

    const { data: enrollmentHistory = {} } = useQuery({
        queryKey: ['enrollmentHistory', paginatedStudents.map(s => s._id)],
        queryFn: async () => {
            const historyMap = {};
            for (const student of paginatedStudents) {
                try {
                    const history = await getEnrollmentHistory(student._id);
                    historyMap[student._id] = history || [];
                } catch {
                    historyMap[student._id] = [];
                }
            }
            return historyMap;
        },
        enabled: paginatedStudents.length > 0,
        staleTime: 300000,
        refetchOnWindowFocus: false,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            setDeleteConfirm({ open: false, id: null });
            toast.success("Student deleted successfully");
        },
        onError: (err) => toast.error(err.error || "Failed to delete")
    });

    const updateEnrollMutation = useMutation({
        mutationFn: ({ id, data }) => updateEnrollment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['enrollmentHistory'] });
            toast.success("Enrollment updated successfully");
            setEditEnrollment({ open: false, enrollment: null, student: null, batches: [], semesters: [] });
        },
        onError: (err) => toast.error(err.error || "Update failed")
    });

    const copyToClipboard = useCallback(async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedEmail(type);
            toast.success(`${type} copied`);
            setTimeout(() => setCopiedEmail(null), 2000);
        } catch (err) {
            toast.error("Failed to copy");
        }
    }, []);

    const openModal = useCallback((type, student = null) => {
        setSelected(student);
        setModals(prev => ({ ...prev, [type]: true }));
    }, []);

    const openEditEnrollment = useCallback(async (enrollment, student) => {
        const deptSemesters = allSemesters.filter(s => s.dept_id === student.dept_id);
        let batches = [];
        if (enrollment.sem_id) {
            try {
                batches = await getSemBatches(enrollment.sem_id);
            } catch (err) {
                console.error("Failed to fetch batches", err);
            }
        }
        setEditEnrollment({
            open: true,
            enrollment: { ...enrollment },
            student: student,
            batches: batches,
            semesters: deptSemesters
        });
    }, [allSemesters]);

    const getInitials = useCallback((first, last) => `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase(), []);
    const formatName = (str) => str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : "";

    const stats = useMemo(() => ({
        total: students.length,
        enrolled: students.filter(s => s.enrollment_status === 'active').length,
        notEnrolled: students.filter(s => !s.enrollment_status).length,
        faceRegistered: students.filter(s => s.face_embedding).length,
    }), [students]);

    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
            case 'promoted': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
            case 'graduated': return 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400';
            case 'dropped': return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
        }
    }, []);

    const StudentCard = ({ student }) => {
        const history = enrollmentHistory[student._id] || [];

        return (
            <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {student.profile_pic ? (
                                    <img src={student.profile_pic} alt={student.first_name} className="w-14 h-14 rounded-xl object-cover shadow-md" />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {getInitials(student.first_name, student.last_name)}
                                    </div>
                                )}
                                {student.face_embedding && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                                        <ShieldCheck size={10} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{formatName(student.first_name)} {formatName(student.last_name)}</h3>
                                <p className="text-xs text-zinc-500 font-mono mt-0.5">{student.roll_no}</p>
                            </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${student.enrollment_status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                            {student.enrollment_status === 'active' ? 'Enrolled' : 'Not Enrolled'}
                        </div>
                    </div>

                    <div className="space-y-2 mb-4 py-3 border-y border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Department</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-37.5">{formatName(student.dept_name) || 'Not Assigned'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Email</span>
                            <div className="flex items-center gap-1">
                                <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-30">{student.email}</span>
                                <button onClick={() => copyToClipboard(student.email, 'Email')} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded shrink-0">
                                    {copiedEmail === 'Email' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-zinc-400" />}
                                </button>
                            </div>
                        </div>
                        {student.current_sem && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500">Current Semester</span>
                                <span className="font-bold text-violet-600">Semester {student.current_sem}</span>
                            </div>
                        )}
                    </div>

                    {history.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Layers size={14} className="text-violet-600" />
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Enrollment History</p>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {history.map((enroll) => (
                                    <div key={enroll._id} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/30 rounded-lg p-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Sem {enroll.sem_number}</span>
                                            {enroll.batch_name && <span className="text-[10px] font-bold text-violet-600 bg-violet-100 dark:bg-violet-950/50 px-1.5 py-0.5 rounded">Batch {enroll.batch_name}</span>}
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${getStatusColor(enroll.status)}`}>{enroll.status}</span>
                                        </div>
                                        <button onClick={() => openEditEnrollment(enroll, student)} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg shrink-0">
                                            <Edit3 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {student.enrollment_status === 'active' ? (
                            <Button variant="primary" icon={TrendingUp} onClick={() => openModal('enroll', student)} className="flex-1 h-10 rounded-xl text-xs font-bold">Promote</Button>
                        ) : (
                            <Button variant="primary" icon={BookOpen} onClick={() => openModal('enroll', student)} className="flex-1 h-10 rounded-xl text-xs font-bold">Enroll</Button>
                        )}
                        <Button variant="secondary" icon={Camera} onClick={() => openModal('face', student)} className={`h-10 w-10 rounded-xl shrink-0 ${student.face_embedding ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600'}`} />
                        <Button variant="secondary" icon={Edit3} onClick={() => openModal('student', student)} className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                        <Button variant="secondary" icon={Trash2} onClick={() => setDeleteConfirm({ open: true, id: student._id })} className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 shrink-0" />
                    </div>
                </div>
            </motion.div>
        );
    };

    const StudentListItem = ({ student }) => {
        const history = enrollmentHistory[student._id] || [];

        return (
            <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative shrink-0">
                            {student.profile_pic ? (
                                <img src={student.profile_pic} alt={student.first_name} className="w-12 h-12 rounded-xl object-cover shadow-md" />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-md shadow-md">
                                    {getInitials(student.first_name, student.last_name)}
                                </div>
                            )}
                            {student.face_embedding && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-white dark:border-zinc-900 flex items-center justify-center">
                                    <ShieldCheck size={8} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-zinc-900 dark:text-white">{formatName(student.first_name)} {formatName(student.last_name)}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${student.enrollment_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {student.enrollment_status === 'active' ? 'Enrolled' : 'Not Enrolled'}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                                <span className="text-zinc-500 font-mono flex items-center gap-1"><Hash size={10} /> {student.roll_no}</span>
                                <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
                                <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-37.5">{formatName(student.dept_name) || 'No Department'}</span>
                                {student.current_sem && <><span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span><span className="text-violet-600 font-bold shrink-0">Sem {student.current_sem}</span></>}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail size={12} className="text-zinc-400 shrink-0" />
                                <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{student.email}</span>
                                <button onClick={() => copyToClipboard(student.email, 'Email')} className="p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded shrink-0">
                                    {copiedEmail === 'Email' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-zinc-400" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {student.enrollment_status === 'active' ? (
                            <Button variant="primary" icon={TrendingUp} onClick={() => openModal('enroll', student)} className="h-9 px-3 rounded-lg text-[10px] font-bold">Promote</Button>
                        ) : (
                            <Button variant="primary" icon={BookOpen} onClick={() => openModal('enroll', student)} className="h-9 px-3 rounded-lg text-[10px] font-bold">Enroll</Button>
                        )}
                        <Button variant="secondary" icon={Camera} onClick={() => openModal('face', student)} className={`h-9 w-9 rounded-lg shrink-0 ${student.face_embedding ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`} />
                        <Button variant="secondary" icon={Edit3} onClick={() => openModal('student', student)} className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                        <Button variant="secondary" icon={Trash2} onClick={() => setDeleteConfirm({ open: true, id: student._id })} className="h-9 w-9 rounded-lg bg-red-50 text-red-600 shrink-0" />
                    </div>
                </div>

                {history.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex gap-2 flex-wrap">
                            {history.map((enroll) => (
                                <div key={enroll._id} className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-2 py-1">
                                    <span className="text-xs font-bold">Sem {enroll.sem_number}</span>
                                    {enroll.batch_name && <span className="text-[9px] text-violet-600">#{enroll.batch_name}</span>}
                                    <span className={`text-[8px] px-1 py-0.5 rounded ${getStatusColor(enroll.status)}`}>{enroll.status}</span>
                                    <button onClick={() => openEditEnrollment(enroll, student)} className="ml-1 p-0.5 hover:bg-white rounded">
                                        <Edit3 size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-6 sm:mb-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                            <GraduationCap size={24} className="sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white">
                                Student <span className="text-violet-600">Base</span>
                            </h1>
                            <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                                {stats.total} Records • {stats.enrolled} Enrolled • {stats.faceRegistered} Face Verified
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-900 shadow-md text-violet-600' : 'text-zinc-500'}`}>
                                <LayoutGrid size={16} />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-900 shadow-md text-violet-600' : 'text-zinc-500'}`}>
                                <List size={16} />
                            </button>
                        </div>
                        <Button variant="primary" icon={UserPlus} onClick={() => openModal('student')} className="text-sm">Add Student</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input icon={Search} placeholder="Search by name, roll no or email..." value={search} onChange={setSearch} className="h-10 sm:h-11 rounded-xl text-sm" />

                    <div className="relative">
                        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="w-full h-10 sm:h-11 px-3 sm:px-4 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium outline-none focus:border-violet-600 appearance-none cursor-pointer">
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full h-10 sm:h-11 px-3 sm:px-4 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium outline-none focus:border-violet-600 appearance-none cursor-pointer">
                            <option value="all">All Students</option>
                            <option value="enrolled">Enrolled Only</option>
                            <option value="not_enrolled">Not Enrolled</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select value={filterFace} onChange={(e) => setFilterFace(e.target.value)} className="w-full h-10 sm:h-11 px-3 sm:px-4 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium outline-none focus:border-violet-600 appearance-none cursor-pointer">
                            <option value="all">Face Status: All</option>
                            <option value="registered">Face Registered</option>
                            <option value="not_registered">Face Not Registered</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                </div>
            </header>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-120 rounded-2xl bg-white dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
                    ))}
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            <AnimatePresence mode="popLayout">
                                {paginatedStudents.map((student) => (
                                    <StudentCard key={student._id} student={student} />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {paginatedStudents.map((student) => (
                                    <StudentListItem key={student._id} student={student} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-9 h-9 rounded-xl font-bold text-sm transition-all ${currentPage === pageNum ? 'bg-violet-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}

            <Suspense fallback={null}>
                {modals.student && <StudentModal isOpen={modals.student} onClose={() => { setModals(p => ({ ...p, student: false })); refetch(); }} editData={selected} departments={departments} />}
                {modals.enroll && <EnrollModal isOpen={modals.enroll} onClose={() => { setModals(p => ({ ...p, enroll: false })); refetch(); }} student={selected} />}
                {modals.face && <FaceModal isOpen={modals.face} onClose={() => { setModals(p => ({ ...p, face: false })); refetch(); }} student={selected} />}
            </Suspense>

            <Modal isOpen={editEnrollment.open} onClose={() => setEditEnrollment({ open: false, enrollment: null, student: null, batches: [], semesters: [] })} size="md">
                {editEnrollment.enrollment && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                                <Edit3 size={18} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white">Edit Enrollment</h2>
                                <p className="text-xs text-zinc-500 mt-0.5">{editEnrollment.student?.first_name} {editEnrollment.student?.last_name} • {editEnrollment.student?.roll_no}</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wide text-zinc-500 ml-1 mb-1.5 block">Semester</label>
                                <div className="relative">
                                    <select
                                        value={editEnrollment.enrollment.sem_id || ''}
                                        onChange={async (e) => {
                                            const newSemId = e.target.value;
                                            let batches = [];
                                            if (newSemId) {
                                                try {
                                                    batches = await getSemBatches(newSemId);
                                                } catch (err) {
                                                    console.error("Failed to fetch batches", err);
                                                }
                                            }
                                            setEditEnrollment(prev => ({
                                                ...prev,
                                                enrollment: { ...prev.enrollment, sem_id: newSemId, batch_id: '', batch_name: '' },
                                                batches: batches
                                            }));
                                        }}
                                        className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Semester</option>
                                        {editEnrollment.semesters.map(s => (
                                            <option key={s._id} value={s._id}>Semester {s.sem_number}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wide text-zinc-500 ml-1 mb-1.5 block">Batch</label>
                                <div className="relative">
                                    <select
                                        value={editEnrollment.enrollment.batch_id || ''}
                                        onChange={(e) => {
                                            const selectedBatch = editEnrollment.batches.find(b => b._id === e.target.value);
                                            setEditEnrollment(prev => ({
                                                ...prev,
                                                enrollment: {
                                                    ...prev.enrollment,
                                                    batch_id: e.target.value,
                                                    batch_name: selectedBatch?.name || ''
                                                }
                                            }));
                                        }}
                                        className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer"
                                        disabled={!editEnrollment.enrollment.sem_id}
                                    >
                                        <option value="">No Batch</option>
                                        {editEnrollment.batches.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wide text-zinc-500 ml-1 mb-1.5 block">Academic Year</label>
                                <div className="relative">
                                    <select
                                        value={editEnrollment.enrollment.academic_year_id || ''}
                                        onChange={(e) => setEditEnrollment(prev => ({
                                            ...prev,
                                            enrollment: { ...prev.enrollment, academic_year_id: e.target.value }
                                        }))}
                                        className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Academic Year</option>
                                        {academicYears?.map(y => (
                                            <option key={y._id} value={y._id}>{y.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wide text-zinc-500 ml-1 mb-1.5 block">Status</label>
                                <div className="relative">
                                    <select
                                        value={editEnrollment.enrollment.status || 'active'}
                                        onChange={(e) => setEditEnrollment(prev => ({
                                            ...prev,
                                            enrollment: { ...prev.enrollment, status: e.target.value }
                                        }))}
                                        className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold outline-none focus:border-violet-600 appearance-none cursor-pointer"
                                    >
                                        <option value="active">Active</option>
                                        <option value="promoted">Promoted</option>
                                        <option value="dropped">Dropped</option>
                                        <option value="graduated">Graduated</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" className="flex-1" onClick={() => setEditEnrollment({ open: false, enrollment: null, student: null, batches: [], semesters: [] })}>Cancel</Button>
                                <Button variant="primary" className="flex-1" isLoading={updateEnrollMutation.isPending} onClick={() => updateEnrollMutation.mutate({ id: editEnrollment.enrollment._id, data: editEnrollment.enrollment })}>Save Changes</Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} size="sm">
                <div className="text-center p-4">
                    <div className="w-14 h-14 bg-red-100 dark:bg-red-950 rounded-xl flex items-center justify-center mx-auto mb-3 text-red-600">
                        <Trash2 size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Delete Student?</h2>
                    <p className="text-xs text-zinc-500 mb-5">This will delete the student and ALL their enrollment records. This action cannot be undone.</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="flex-1" onClick={() => setDeleteConfirm({ open: false, id: null })}>Cancel</Button>
                        <Button variant="danger" className="flex-1" isLoading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm.id)}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Students;