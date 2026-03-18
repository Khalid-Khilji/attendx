import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { GraduationCap, Fingerprint, Hash, User, CheckCircle2, ChevronDown } from 'lucide-react';
import { createStudent, updateStudent } from '../../api/index';
import { Modal, Input, Button } from '../../components/index';

const StudentModal = ({ isOpen, onClose, editData = null, departments = [] }) => {
    const queryClient = useQueryClient();
    const [credentials, setCredentials] = useState(null);
    const [showPass, setShowPass] = useState(false);

    const mutation = useMutation({
        mutationFn: (data) => editData ? updateStudent(editData._id, data) : createStudent(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            if (!editData && res.email) {
                setCredentials({
                    email: res.email,
                    password: res.generated_password,
                    name: `${res.student.first_name} ${res.student.last_name}`,
                    roll: res.student.roll_no
                });
            } else {
                onClose();
            }
        }
    });

    const formatToSentenceCase = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const form = useForm({
        defaultValues: {
            first_name: '',
            last_name: '',
            roll_no: '',
            dept_id: '',
        },
        onSubmit: async ({ value }) => mutation.mutate(value),
    });

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                form.reset({
                    first_name: formatToSentenceCase(editData.first_name),
                    last_name: formatToSentenceCase(editData.last_name),
                    roll_no: editData.roll_no,
                    dept_id: editData.dept_id,
                });
            } else {
                form.reset({
                    first_name: '',
                    last_name: '',
                    roll_no: '',
                    dept_id: '',
                });
            }
        }
    }, [editData, isOpen]);

    if (credentials) {
        return (
            <Modal isOpen={isOpen} onClose={() => { setCredentials(null); onClose(); }} size="sm">
                <div className="text-center py-4">
                    <div className="w-20 h-20 bg-linear-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20 text-white">
                        <CheckCircle2 size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-2 leading-none">Registry Secured</h2>
                    <p className="text-xs font-bold text-zinc-400 mb-8 uppercase tracking-widest">{credentials.name}</p>

                    <div className="space-y-3 mb-10 text-left">
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1 block">Access ID</label>
                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{credentials.email}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 relative">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1 block">Generated Passkey</label>
                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 font-mono tracking-widest">
                                {showPass ? credentials.password : '••••••••••••'}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-violet-500 transition-colors"
                            >
                                {showPass ? <Fingerprint size={18} /> : <Hash size={18} />}
                            </button>
                        </div>
                    </div>
                    <Button className="w-full py-4 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]" onClick={() => { setCredentials(null); onClose(); }}>Finish Process</Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="flex items-center gap-4 mb-10 px-2 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/20 shrink-0">
                    <GraduationCap size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
                        {editData ? 'Modify' : 'Enroll'} Student
                    </h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">Academic Record Management</p>
                </div>
            </div>

            <form
                id="student-enrollment-form"
                onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
                className="space-y-6 px-2 pb-2"
                autoComplete="on"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <form.Field name="first_name">
                        {(f) => (
                            <Input
                                label="First Name"
                                id="student_first_name"
                                name="first_name"
                                value={f.state.value}
                                onChange={(val) => f.handleChange(val)}
                                icon={User}
                                autoComplete="given-name"
                                required
                                placeholder="Enter first name"
                                className="font-bold text-zinc-900 dark:text-white"
                            />
                        )}
                    </form.Field>
                    <form.Field name="last_name">
                        {(f) => (
                            <Input
                                label="Last Name"
                                id="student_last_name"
                                name="last_name"
                                value={f.state.value}
                                onChange={(val) => f.handleChange(val)}
                                icon={User}
                                autoComplete="family-name"
                                required
                                placeholder="Enter last name"
                                className="font-bold text-zinc-900 dark:text-white"
                            />
                        )}
                    </form.Field>
                </div>

                <form.Field name="roll_no">
                    {(f) => (
                        <Input
                            label="Roll Number"
                            id="student_roll_no"
                            name="roll_no"
                            value={f.state.value}
                            onChange={(val) => f.handleChange(val)}
                            icon={Hash}
                            autoComplete="off"
                            required
                            placeholder="e.g. 231425"
                            className="font-bold text-zinc-900 dark:text-white"
                        />
                    )}
                </form.Field>

                <form.Field name="dept_id">
                    {(f) => (
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="student_dept_id" className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 ml-1">
                                Assigned Department <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <select
                                    id="student_dept_id"
                                    name="dept_id"
                                    value={f.state.value}
                                    onChange={(e) => f.handleChange(e.target.value)}
                                    className="w-full h-12 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm font-bold outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/5 appearance-none transition-all cursor-pointer group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
                                    required
                                >
                                    <option value="" disabled>CHOOSE DEPARTMENT</option>
                                    {departments.map(d => (
                                        <option key={d._id} value={d._id} className="dark:bg-zinc-900 py-2">
                                            {d.name.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-violet-500 transition-colors">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>
                    )}
                </form.Field>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button
                        variant="ghost"
                        className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[11px]"
                        onClick={onClose}
                        type="button"
                    >
                        Discard
                    </Button>
                    <Button
                        type="submit"
                        className="flex-[1.5] rounded-2xl h-14 shadow-xl shadow-violet-500/20 font-black uppercase tracking-widest text-[11px]"
                        isLoading={mutation.isPending}
                    >
                        {editData ? 'Sync Changes' : 'Initialize Registry'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default StudentModal;