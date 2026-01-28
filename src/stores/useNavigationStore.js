import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNavigationStore = create(
    persist(
        (set) => ({
            currentPage: 'main', // 'main', 'bubble', 'matching'
            navigateTo: (page) => set({ currentPage: page }),
        }),
        {
            name: 'bubble-flash-cards-nav',
        }
    )
);

export default useNavigationStore;
