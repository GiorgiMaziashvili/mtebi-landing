import gsap from 'gsap'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import './App.css'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LoadingOverlay } from './components/LoadingOverlay/LoadingOverlay'
import { useLoadingStore } from './store/useLoadingStore'

gsap.registerPlugin(ScrollTrigger)

const Home = lazy(() => import('./pages/Home'))

export default function App() {
  const setMinTimerDone = useLoadingStore(s => s.setMinTimerDone)

  useEffect(() => {
    const id = setTimeout(setMinTimerDone, 2000)
    return () => clearTimeout(id)
  }, [setMinTimerDone])

  return (
    <>
      <LoadingOverlay />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Suspense fallback={null}>
              <Home />
            </Suspense>
          } />
        </Routes>
      </BrowserRouter>
    </>
  )
}
