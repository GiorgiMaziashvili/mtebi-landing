import { useEffect } from 'react'
import { useLoadingStore } from '../store/useLoadingStore'

export function useRegisterLoader(id: string, progress: number): void {
  const register = useLoadingStore(s => s.register)
  const update = useLoadingStore(s => s.update)

  useEffect(() => {
    register(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    update(id, progress)
  }, [progress]) // eslint-disable-line react-hooks/exhaustive-deps
}
