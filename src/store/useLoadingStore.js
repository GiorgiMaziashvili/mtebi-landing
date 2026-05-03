import { create } from 'zustand'

export const useLoadingStore = create((set) => ({
  items: {},
  minTimerDone: false,
  register: (id) => set(s => ({ items: { ...s.items, [id]: 0 } })),
  update: (id, progress) => set(s => ({ items: { ...s.items, [id]: progress } })),
  setMinTimerDone: () => set({ minTimerDone: true }),
}))
