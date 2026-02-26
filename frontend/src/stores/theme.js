import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set) => ({
            isDark: false,

            toggleMode: () =>
                set((state) => ({
                    isDark: !state.isDark,
                })),
        }),
        {
            name: 'theme-storage',
        }
    )
);

export default useThemeStore;