import { create } from 'zustand'

interface LoadingState {
  items: Record<string, number>
  minTimerDone: boolean
  register: (id: string) => void
  update: (id: string, progress: number) => void
  setMinTimerDone: () => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  items: {},
  minTimerDone: false,
  register: (id) => set(s => ({ items: { ...s.items, [id]: 0 } })),
  update: (id, progress) => set(s => ({ items: { ...s.items, [id]: progress } })),
  setMinTimerDone: () => set({ minTimerDone: true }),
}))
