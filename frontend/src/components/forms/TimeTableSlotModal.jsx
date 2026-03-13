import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { Modal, Button, Input, Select, SelectOption } from '../index'
import { createSlot, updateSlot, getAllDepartments, getAllSemesters, getAllCourses, getAllTeachers, getAllAcademicYears } from '../../api/index'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const TimetableSlotModal = ({ isOpen, onClose, editData = null }) => {
    const queryClient = useQueryClient()
    const [dept, setDept] = useState('')

    const mutation = useMutation({
        mutationFn: (data) => editData ? updateSlot(editData._id, data) : createSlot(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable'] })
            onClose()
        }
    })

    const form = useForm({
        defaultValues: {
            sem_id: editData?.sem_id || '',
            course_id: editData?.course_id || '',
            teacher_id: editData?.teacher_id || '',
            academic_year_id: editData?.academic_year_id || '',
            day_of_week: editData?.day_of_week || '',
            start_time: editData?.start_time || '',
            end_time: editData?.end_time || '',
            version_tag: editData?.version_tag || '',
            valid_from: editData?.valid_from?.slice(0, 10) || ''
        },
        onSubmit: async ({ value }) => {
            mutation.mutate(value)
        }
    })

    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: getAllDepartments
    })

    const { data: semesters = [] } = useQuery({
        queryKey: ['semesters', dept],
        queryFn: () => getAllSemesters(dept),
        enabled: !!dept
    })

    const { data: courses = [] } = useQuery({
        queryKey: ['courses', form.getFieldValue('sem_id')],
        queryFn: () => getAllCourses(form.getFieldValue('sem_id')),
        enabled: !!form.getFieldValue('sem_id')
    })

    const { data: teachers = [] } = useQuery({
        queryKey: ['teachers'],
        queryFn: getAllTeachers
    })

    const { data: academicYears = [] } = useQuery({
        queryKey: ['academic-years'],
        queryFn: getAllAcademicYears
    })

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                form.reset({
                    sem_id: editData.sem_id || '',
                    course_id: editData.course_id || '',
                    teacher_id: editData.teacher_id || '',
                    academic_year_id: editData.academic_year_id || '',
                    day_of_week: editData.day_of_week || '',
                    start_time: editData.start_time || '',
                    end_time: editData.end_time || '',
                    version_tag: editData.version_tag || '',
                    valid_from: editData.valid_from?.slice(0, 10) || ''
                })
                if (editData.sem_id && semesters.length > 0) {
                    const sem = semesters.find(s => s._id === editData.sem_id)
                    if (sem) setDept(sem.dept_id)
                }
            } else {
                form.reset()
                setDept('')
            }
        }
    }, [isOpen, editData, semesters])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 dark:text-white">
                        {editData ? 'Edit' : 'Add'} Timetable Slot
                    </h2>
                    <form
                        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
                        className="space-y-4 max-h-[70vh] overflow-y-auto hide-scrollbar pr-1"
                    >
                        <Select
                            label="Department"
                            id="dept_select"
                            name="dept_id"
                            value={dept}
                            onChange={(v) => { setDept(v); form.setFieldValue('sem_id', ''); form.setFieldValue('course_id', '') }}
                            required
                            placeholder="Choose Department"
                        >
                            {departments.map(d => (
                                <SelectOption key={d._id} value={d._id}>{d.name}</SelectOption>
                            ))}
                        </Select>

                        <form.Field name="sem_id">
                            {(field) => (
                                <Select
                                    label="Semester"
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(v) => { field.handleChange(v); form.setFieldValue('course_id', '') }}
                                    required
                                    disabled={!dept}
                                    placeholder="Choose Semester"
                                >
                                    {semesters.map(s => (
                                        <SelectOption key={s._id} value={s._id}>Sem {s.sem_number}</SelectOption>
                                    ))}
                                </Select>
                            )}
                        </form.Field>

                        <form.Field name="course_id">
                            {(field) => (
                                <Select
                                    label="Course"
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    required
                                    disabled={!form.getFieldValue('sem_id')}
                                    placeholder="Choose Course"
                                >
                                    {courses.map(c => (
                                        <SelectOption key={c._id} value={c._id}>{c.course_code} — {c.name}</SelectOption>
                                    ))}
                                </Select>
                            )}
                        </form.Field>

                        <form.Field name="teacher_id">
                            {(field) => (
                                <Select
                                    label="Teacher"
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    required
                                    placeholder="Select Teacher"
                                >
                                    {teachers.map(t => (
                                        <SelectOption key={t._id} value={t._id}>
                                            {t.first_name} {t.last_name} ({t.faculty_id})
                                        </SelectOption>
                                    ))}
                                </Select>
                            )}
                        </form.Field>

                        <form.Field name="academic_year_id">
                            {(field) => (
                                <Select
                                    label="Academic Year"
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    required
                                    placeholder="Select Year"
                                >
                                    {academicYears.map(y => (
                                        <SelectOption key={y._id} value={y._id}>{y.label}</SelectOption>
                                    ))}
                                </Select>
                            )}
                        </form.Field>

                        <form.Field name="day_of_week">
                            {(field) => (
                                <Select
                                    label="Day"
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    required
                                    placeholder="Select Day"
                                >
                                    {DAYS.map(d => (
                                        <SelectOption key={d} value={d}>{d}</SelectOption>
                                    ))}
                                </Select>
                            )}
                        </form.Field>

                        <div className="grid grid-cols-2 gap-3">
                            <form.Field name="start_time">
                                {(field) => (
                                    <Input
                                        label="Start Time"
                                        id={field.name}
                                        name={field.name}
                                        type="time"
                                        value={field.state.value}
                                        onChange={field.handleChange}
                                        autoComplete="off"
                                        required
                                    />
                                )}
                            </form.Field>
                            <form.Field name="end_time">
                                {(field) => (
                                    <Input
                                        label="End Time"
                                        id={field.name}
                                        name={field.name}
                                        type="time"
                                        value={field.state.value}
                                        onChange={field.handleChange}
                                        autoComplete="off"
                                        required
                                    />
                                )}
                            </form.Field>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <form.Field name="version_tag">
                                {(field) => (
                                    <Input
                                        label="Version Tag"
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={field.handleChange}
                                        placeholder="e.g. v1"
                                        autoComplete="off"
                                        required
                                    />
                                )}
                            </form.Field>
                            <form.Field name="valid_from">
                                {(field) => (
                                    <Input
                                        label="Valid From"
                                        id={field.name}
                                        name={field.name}
                                        type="date"
                                        value={field.state.value}
                                        onChange={field.handleChange}
                                        autoComplete="off"
                                        required
                                    />
                                )}
                            </form.Field>
                        </div>

                        <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-zinc-900 py-4 mt-2 border-t dark:border-zinc-800">
                            <Button variant="ghost" className="flex-1" onClick={onClose} type="button">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
                                {editData ? 'Update Slot' : 'Create Slot'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </Modal>
    )
}

export default TimetableSlotModal