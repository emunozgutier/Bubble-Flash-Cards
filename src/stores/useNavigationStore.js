import { create } from 'zustand';


const useNavigationStore = create((set) => ({
    currentPage: 'main', // 'main', 'bubble', 'matching'
    navigateTo: (page) => set({ currentPage: page }),
}));

export default useNavigationStore;
