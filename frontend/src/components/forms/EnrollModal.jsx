// frontend - components/EnrollModal.jsx (Complete)

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Award, TrendingUp, Edit2, Hash } from 'lucide-react';
import { getAllSemesters, getSemBatches, enrollStudent, promoteStudent, updateEnrollment, getEnrollmentHistory } from '../../api/index';
import { Modal, Button } from '../../components/index';
import useAdminStore from '../../stores/admin';
import { toast } from 'react-toastify';

const EnrollModal = ({ isOpen, onClose, student }) => {
    const queryClient = useQueryClient();
    const { academicYears } = useAdminStore();

    const [selectedSem, setSelectedSem] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [editingEnrollment, setEditingEnrollment] = useState(null);
    const [editSem, setEditSem] = useState('');
    const [editBatch, setEditBatch] = useState('');
    const [editYear, setEditYear] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editBatches, setEditBatches] = useState([]);

    const { data: semesters = [] } = useQuery({
        queryKey: ['semesters', student?.dept_id],
        queryFn: () => getAllSemesters(student?.dept_id),
        enabled: !!student?.dept_id && isOpen,
        staleTime: Infinity
    });

    const { data: batches = [] } = useQuery({
        queryKey: ['batches', selectedSem],
        queryFn: () => getSemBatches(selectedSem),
        enabled: !!selectedSem && isOpen && !editingEnrollment,
        staleTime: Infinity
    });

    const { data: history = [], refetch: refetchHistory } = useQuery({
        queryKey: ['enrollment-history', student?._id],
        queryFn: () => getEnrollmentHistory(student?._id),
        enabled: !!student?._id && isOpen,
        staleTime: 0
    });

    useEffect(() => {
        if (editSem) {
            const fetchEditBatches = async () => {
                const batchesData = await getSemBatches(editSem);
                setEditBatches(batchesData);
            };
            fetchEditBatches();
        }
    }, [editSem]);

    const activeEnrollment = history.find(h => h.status === 'active');

    const enrollMutation = useMutation({
        mutationFn: enrollStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['enrollment-history'] });
            toast.success("Student enrolled successfully");
            resetForm();
            onClose();
        },
        onError: (err) => toast.error(err.error || "Enrollment failed")
    });

    const promoteMutation = useMutation({
        mutationFn: ({ id, data }) => promoteStudent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['enrollment-history'] });
            toast.success("Student promoted successfully");
            resetForm();
            onClose();
        },
        onError: (err) => toast.error(err.error || "Promotion failed")
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateEnrollment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['enrollment-history'] });
            toast.success("Enrollment updated successfully");
            setEditingEnrollment(null);
            refetchHistory();
        },
        onError: (err) => toast.error(err.error || "Update failed")
    });

    const resetForm = () => {
        setSelectedSem('');
        setSelectedBatch('');
        setSelectedYear('');
        setEditingEnrollment(null);
        setEditSem('');
        setEditBatch('');
        setEditYear('');
        setEditStatus('');
        setEditBatches([]);
    };

    const handleEnroll = () => {
        if (!selectedSem || !selectedYear) {
            toast.error("Please fill all required fields");
            return;
        }
        enrollMutation.mutate({
            student_id: student._id,
            dept_id: student.dept_id,
            sem_id: selectedSem,
            academic_year_id: selectedYear,
            batch_id: selectedBatch || null
        });
    };

    const handlePromote = () => {
        if (!selectedSem || !selectedYear) {
            toast.error("Please select semester and academic year");
            return;
        }
        promoteMutation.mutate({
            id: student._id,
            data: {
                next_sem_id: selectedSem,
                next_academic_year_id: selectedYear,
                next_batch_id: selectedBatch || null
            }
        });
    };

    const handleUpdate = () => {
        if (!editingEnrollment) return;
        updateMutation.mutate({
            id: editingEnrollment._id,
            data: {
                sem_id: editSem,
                batch_id: editBatch || null,
                academic_year_id: editYear,
                status: editStatus
            }
        });
    };

    const startEdit = (enrollment) => {
        setEditingEnrollment(enrollment);
        setEditSem(enrollment.sem_id || '');
        setEditBatch(enrollment.batch_id || '');
        setEditYear(enrollment.academic_year_id || '');
        setEditStatus(enrollment.status || 'active');
    };

    const cancelEdit = () => {
        setEditingEnrollment(null);
        setEditSem('');
        setEditBatch('');
        setEditYear('');
        setEditStatus('');
        setEditBatches([]);
    };

    const selectBaseClass = "w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm font-bold outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/5 appearance-none transition-all cursor-pointer";
    const labelClass = "text-[10px] font-black uppercase tracking-wide text-zinc-500 dark:text-zinc-400 ml-1 mb-1.5 block";

    return (
        <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} size="md">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-xl">
                    {editingEnrollment ? <Edit2 size={22} /> : activeEnrollment ? <TrendingUp size={22} /> : <Award size={22} />}
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white leading-none">
                        {editingEnrollment ? 'Edit' : activeEnrollment ? 'Promote' : 'Enroll'} <span className="text-violet-600">Student</span>
                    </h2>
                    <p className="text-xs font-bold text-zinc-500 mt-1">
                        {student?.first_name} {student?.last_name} • {student?.roll_no}
                    </p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {editingEnrollment ? (
                    <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <div>
                            <label className={labelClass}>Semester</label>
                            <div className="relative">
                                <select
                                    value={editSem}
                                    onChange={(e) => setEditSem(e.target.value)}
                                    className={selectBaseClass}
                                >
                                    <option value="">Select Semester</option>
                                    {semesters.map(s => (
                                        <option key={s._id} value={s._id}>Semester {s.sem_number}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Batch (Optional)</label>
                            <div className="relative">
                                <select
                                    value={editBatch}
                                    onChange={(e) => setEditBatch(e.target.value)}
                                    className={selectBaseClass}
                                    disabled={!editSem}
                                >
                                    <option value="">No Batch</option>
                                    {editBatches.map(b => (
                                        <option key={b._id} value={b._id}>{b.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Academic Year</label>
                            <div className="relative">
                                <select
                                    value={editYear}
                                    onChange={(e) => setEditYear(e.target.value)}
                                    className={selectBaseClass}
                                >
                                    <option value="">Select Year</option>
                                    {academicYears?.map(y => (
                                        <option key={y._id} value={y._id}>{y.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Status</label>
                            <div className="relative">
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className={selectBaseClass}
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
                            <Button variant="ghost" className="flex-1" onClick={cancelEdit}>
                                Cancel
                            </Button>
                            <Button variant="primary" className="flex-1" isLoading={updateMutation.isPending} onClick={handleUpdate}>
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                ) : activeEnrollment ? (
                    <motion.div key="promote" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <div className="bg-violet-50 dark:bg-violet-950/30 rounded-2xl p-4 border border-violet-100 dark:border-violet-800">
                            <p className="text-[10px] font-black text-violet-600 uppercase tracking-wide mb-2">Current Enrollment</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                        Semester {semesters.find(s => s._id === activeEnrollment.sem_id)?.sem_number || '?'}
                                    </p>
                                    {activeEnrollment.batch_name && (
                                        <p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
                                            <Hash size={12} /> Batch: {activeEnrollment.batch_name}
                                        </p>
                                    )}
                                    {activeEnrollment.academic_year_label && (
                                        <p className="text-xs text-zinc-500 mt-1">{activeEnrollment.academic_year_label}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => startEdit(activeEnrollment)}
                                    className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-violet-600 hover:bg-violet-100 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Next Semester</label>
                            <div className="relative">
                                <select
                                    value={selectedSem}
                                    onChange={(e) => setSelectedSem(e.target.value)}
                                    className={selectBaseClass}
                                >
                                    <option value="">Select Semester</option>
                                    {semesters.filter(s => s._id !== activeEnrollment.sem_id).map(s => (
                                        <option key={s._id} value={s._id}>Semester {s.sem_number}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Batch (Optional)</label>
                            <div className="relative">
                                <select
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    className={selectBaseClass}
                                    disabled={!selectedSem}
                                >
                                    <option value="">No Batch</option>
                                    {batches.map(b => (
                                        <option key={b._id} value={b._id}>{b.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Academic Year</label>
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className={selectBaseClass}
                                >
                                    <option value="">Select Year</option>
                                    {academicYears?.map(y => (
                                        <option key={y._id} value={y._id}>{y.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="ghost" className="flex-1" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" className="flex-1" isLoading={promoteMutation.isPending} onClick={handlePromote}>
                                Promote Student
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="enroll" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <div>
                            <label className={labelClass}>Semester</label>
                            <div className="relative">
                                <select
                                    value={selectedSem}
                                    onChange={(e) => setSelectedSem(e.target.value)}
                                    className={selectBaseClass}
                                >
                                    <option value="">Select Semester</option>
                                    {semesters.map(s => (
                                        <option key={s._id} value={s._id}>Semester {s.sem_number}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Batch (Optional)</label>
                            <div className="relative">
                                <select
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    className={selectBaseClass}
                                    disabled={!selectedSem}
                                >
                                    <option value="">No Batch</option>
                                    {batches.map(b => (
                                        <option key={b._id} value={b._id}>{b.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Academic Year</label>
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className={selectBaseClass}
                                >
                                    <option value="">Select Year</option>
                                    {academicYears?.map(y => (
                                        <option key={y._id} value={y._id}>{y.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>

                        {history.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-2">Previous Enrollments</p>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {history.map((enroll) => (
                                        <div key={enroll._id} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold">Sem {enroll.sem_number || '?'}</span>
                                                {enroll.batch_name && (
                                                    <span className="text-[10px] text-violet-600 flex items-center gap-1">
                                                        <Hash size={10} /> {enroll.batch_name}
                                                    </span>
                                                )}
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${enroll.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                                    {enroll.status}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => startEdit(enroll)}
                                                className="p-1 hover:bg-white rounded-lg transition-colors"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button variant="ghost" className="flex-1" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" className="flex-1" isLoading={enrollMutation.isPending} onClick={handleEnroll}>
                                Enroll Student
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
};

export default EnrollModal;