import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'default',
            colors: {
                background: '#000000',      // 60% Black
                surface: '#121212',         // Slightly lighter black for cards
                primary: '#D32F2F',         // 30% Red
                primaryHover: '#B71C1C',    // Darker red for hover states
                text: '#FFFFFF',            // 10% White
                textSecondary: '#E0E0E0',   // Off-white for secondary text
                border: '#D32F2F'           // Red borders
            },
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'bubble-flash-cards-theme',
        }
    )
);

export default useThemeStore;
