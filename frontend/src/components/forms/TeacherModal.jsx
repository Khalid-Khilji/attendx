import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, Mail, Eye, EyeOff, User, Hash, Fingerprint, Building2 } from 'lucide-react';
import { createTeacher, updateTeacher } from '../../api/index';
import { Modal, Input, Button, Select, SelectOption } from '../../components/index';

const TeacherModal = ({ isOpen, onClose, editData = null, departments = [] }) => {
    const queryClient = useQueryClient();
    const [credentials, setCredentials] = useState(null);
    const [showPass, setShowPass] = useState(false);

    const mutation = useMutation({
        mutationFn: (data) => editData ? updateTeacher(editData._id, data) : createTeacher(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['teachers']);
            if (!editData && res.email) {
                setCredentials({
                    email: res.email,
                    password: res.generated_password,
                    name: `${res.teacher.first_name} ${res.teacher.last_name}`
                });
            } else {
                onClose();
            }
        }
    });

    const form = useForm({
        defaultValues: {
            first_name: editData?.first_name || '',
            last_name: editData?.last_name || '',
            faculty_id: editData?.faculty_id || '',
            dept_id: editData?.dept_id || '',
        },
        onSubmit: async ({ value }) => {
            mutation.mutate(value);
        },
    });

    useEffect(() => {
        if (isOpen && editData) {
            form.reset({
                first_name: editData.first_name,
                last_name: editData.last_name,
                faculty_id: editData.faculty_id,
                dept_id: editData.dept_id,
            });
        } else if (isOpen) {
            form.reset();
        }
    }, [editData, isOpen]);

    if (credentials) {
        return (
            <Modal isOpen={isOpen} onClose={() => { setCredentials(null); onClose(); }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                        <UserCheck size={28} className="text-white" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-1 dark:text-white">Teacher Added</h2>
                    <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2 capitalize">{credentials.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">Credential Details</p>

                    <div className="space-y-3 text-left mb-6">
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Login Email</p>
                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 break-all font-mono">{credentials.email}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
                            <div className="flex justify-between mb-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Default Password</p>
                                <button onClick={() => setShowPass(!showPass)} className="text-zinc-400 hover:text-violet-500 transition-colors">
                                    {showPass ? <Fingerprint size={12} /> : <Hash size={12} />}
                                </button>
                            </div>
                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                                {showPass ? credentials.password : '••••••••••••'}
                            </p>
                        </div>
                    </div>
                    <Button className="w-full" onClick={() => { setCredentials(null); onClose(); }}>Finish Setup</Button>
                </motion.div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2 }}
                >
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                        {editData ? 'Modify' : 'Register'} Teacher
                    </h2>
                    <form
                        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <form.Field name="first_name">
                                {(field) => (
                                    <Input
                                        label="First Name"
                                        id={field.name}
                                        name={field.name}
                                        icon={User}
                                        autoComplete="given-name"
                                        value={field.state.value}
                                        onChange={field.handleChange}
                                        required
                                    />
                                )}
                            </form.Field>
                            <form.Field name="last_name">
                                {(field) => (
                                    <Input
                                        label="Last Name"
                                        id={field.name}
                                        name={field.name}
                                        icon={User}
                                        autoComplete="family-name"
                                        value={field.state.value}
                                        onChange={field.handleChange}
                                        required
                                    />
                                )}
                            </form.Field>
                        </div>

                        {!editData && (
                            <form.Field name="faculty_id">
                                {(field) => (
                                    <Input
                                        label="Faculty ID"
                                        id={field.name}
                                        name={field.name}
                                        icon={Hash}
                                        autoComplete="off"
                                        value={field.state.value}
                                        onChange={field.handleChange}
                                        required
                                        placeholder="e.g. FAC-2024-01"
                                    />
                                )}
                            </form.Field>
                        )}

                        <form.Field name="dept_id">
                            {(field) => (
                                <Select
                                    label="Primary Department"
                                    name={field.name}
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    required
                                    placeholder="Select Dept"
                                >
                                    {departments.map(d => (
                                        <SelectOption key={d._id} value={d._id}>{d.name}</SelectOption>
                                    ))}
                                </Select>
                            )}
                        </form.Field>

                        <div className="flex gap-3 pt-4">
                            <Button variant="ghost" className="flex-1" onClick={onClose} type="button">Cancel</Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                isLoading={mutation.isPending}
                            >
                                {editData ? 'Save Changes' : 'Create Teacher'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </Modal>
    );
};

export default TeacherModal;