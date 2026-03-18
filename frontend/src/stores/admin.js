import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAdminStore = create(
    persist(
        (set, get) => ({
            departments: [],
            academicYears: [],
            semesters: [],
            courses: [],

            setDepartments: (depts) => set({ departments: depts }),
            setAcademicYears: (years) => set({ academicYears: years }),
            setSemesters: (sems) => set({ semesters: sems }),
            setCourses: (courses) => set({ courses: courses }),

            updateLocalData: (type, action, data) => {
                const typeMap = {
                    'dept': 'departments',
                    'sem': 'semesters',
                    'course': 'courses',
                    'ay': 'academicYears'
                };
                
                const key = typeMap[type] || `${type}s`;
                const currentData = get()[key] || [];

                if (action === 'delete') {
                    set({ [key]: currentData.filter(item => item._id !== data) });
                } else if (action === 'add') {
                    set({ [key]: [...currentData, data] });
                } else if (action === 'edit') {
                    set({ [key]: currentData.map(item => item._id === data._id ? data : item) });
                }
            },

            getCurrentYear: () => {
                const years = get().academicYears;
                return years.find(y => y.is_current) || null;
            },

            clearAcademicData: () => set({
                departments: [],
                semesters: [],
                courses: [],
                academicYears: []
            })
        }),
        {
            name: 'attendx-admin-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useAdminStore;