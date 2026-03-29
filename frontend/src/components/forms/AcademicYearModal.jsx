import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { createAcademicYear, updateAcademicYear } from '../../api/index';
import { Modal, Input, Button } from '../../components/index';
import useAdminStore from '../../stores/admin';

const AcademicYearModal = ({ isOpen, onClose, editData = null }) => {
    const queryClient = useQueryClient();
    const updateLocalData = useAdminStore((state) => state.updateLocalData);

    const mutation = useMutation({
        mutationFn: (data) => editData ? updateAcademicYear(editData._id, data) : createAcademicYear(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });

            if (editData) {
                updateLocalData('ay', 'edit', res);
            } else {
                updateLocalData('ay', 'add', res);
            }

            onClose();
        }
    });

    const form = useForm({
        defaultValues: {
            label: editData?.label || '',
            start_date: editData?.start_date?.split('T')[0] || '',
            end_date: editData?.end_date?.split('T')[0] || '',
            is_current: editData?.is_current || false,
        },
        onSubmit: async ({ value }) => {
            mutation.mutate(value);
        }
    });

    useEffect(() => {
        if (isOpen) {
            form.reset(editData ? {
                ...editData,
                start_date: editData.start_date.split('T')[0],
                end_date: editData.end_date.split('T')[0]
            } : {
                label: '',
                start_date: '',
                end_date: '',
                is_current: false
            });
        }
    }, [isOpen, editData]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                    {editData ? 'Modify' : 'New'} Academic Year
                </h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-5"
                >
                    <form.Field name="label">
                        {(field) => (
                            <Input
                                label="Year Label"
                                id={field.name}
                                name={field.name}
                                placeholder="e.g. 2024-25"
                                value={field.state.value}
                                onChange={(val) => field.handleChange(val)}
                                autoComplete="off"
                                required
                            />
                        )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field name="start_date">
                            {(field) => (
                                <Input
                                    label="Start Date"
                                    id={field.name}
                                    name={field.name}
                                    type="date"
                                    value={field.state.value}
                                    onChange={(val) => field.handleChange(val)}
                                    required
                                />
                            )}
                        </form.Field>
                        <form.Field name="end_date">
                            {(field) => (
                                <Input
                                    label="End Date"
                                    id={field.name}
                                    name={field.name}
                                    type="date"
                                    value={field.state.value}
                                    onChange={(val) => field.handleChange(val)}
                                    required
                                />
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="is_current">
                        {(field) => (
                            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div
                                    onClick={() => field.handleChange(!field.state.value)}
                                    className={`w-10 h-5 rounded-full transition-all relative ${field.state.value ? 'bg-violet-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                                >
                                    <motion.div
                                        animate={{ x: field.state.value ? 20 : 0 }}
                                        className="absolute top-0 w-5 h-5 rounded-full bg-white shadow-sm border border-zinc-200"
                                    />
                                </div>
                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-violet-600 transition-colors">Set as Active Year</span>
                            </label>
                        )}
                    </form.Field>

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" className="flex-1" onClick={onClose} type="button">Cancel</Button>
                        <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
                            {editData ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </Modal>
    );
};

export default AcademicYearModal;