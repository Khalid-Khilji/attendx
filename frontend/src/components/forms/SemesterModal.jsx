import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GraduationCap } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { Button, Input, Modal } from '../index'
import { createSemester, updateSemester, getCurrentAcademicYear } from '../../api/index'

const SemesterModal = ({ isOpen, onClose, deptId, editData = null }) => {
    const queryClient = useQueryClient()

    const { data: currentYear } = useQuery({
        queryKey: ['academic-year-current'],
        queryFn: getCurrentAcademicYear,
        enabled: isOpen,
        staleTime: Infinity,
    })

    const mutation = useMutation({
        mutationFn: (values) => {
            const payload = {
                dept_id: deptId,
                sem_number: parseInt(values.sem_number),
                academic_year_id: currentYear?._id
            }
            return editData ? updateSemester(editData._id, payload) : createSemester(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['semesters'] })
            onClose()
        }
    })

    const form = useForm({
        defaultValues: {
            sem_number: editData?.sem_number || '',
        },
        onSubmit: async ({ value }) => {
            mutation.mutate(value)
        },
    })

    useEffect(() => {
        if (isOpen) {
            form.reset({
                sem_number: editData?.sem_number || ''
            })
        }
    }, [editData, isOpen])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                        {editData ? 'Modify' : 'Configure'} Semester
                    </h2>

                    {currentYear ? (
                        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3 border border-violet-100 dark:border-violet-800 mb-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                                Active Academic Year
                            </p>
                            <p className="text-sm font-bold text-violet-700 dark:text-violet-300">
                                {currentYear.label}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-100 dark:border-red-800 mb-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
                                Configuration Error
                            </p>
                            <p className="text-xs font-bold text-red-700 dark:text-red-400">
                                No current academic year set — create one first
                            </p>
                        </div>
                    )}

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                        className="space-y-5"
                    >
                        <form.Field
                            name="sem_number"
                            children={(field) => (
                                <Input
                                    label="Semester Number"
                                    id={field.name}
                                    name={field.name}
                                    type="number"
                                    autoComplete="off"
                                    placeholder="e.g. 1, 2, 3..."
                                    icon={GraduationCap}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    required
                                />
                            )}
                        />

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={onClose}
                                type="button"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                isLoading={mutation.isPending}
                                disabled={!currentYear}
                            >
                                {editData ? 'Update Semester' : 'Confirm Configuration'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </Modal>
    )
}

export default SemesterModal