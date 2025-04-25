import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAppStore = create(
    persist(
      (set) => ({
        role:'',
        setRole: (role: string) => set((state:any) => ({ ...state,role })),
      }),
      {
        name: 'gescom-storage', // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      }
    )
  )