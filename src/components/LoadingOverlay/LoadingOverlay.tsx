import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useLoadingStore } from '../../store/useLoadingStore'
import { initMusic, playMusic } from '../../audio'
import styles from './LoadingOverlay.module.css'
import { Howl } from 'howler'

export function LoadingOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const enterRef = useRef<HTMLButtonElement>(null)

  const items = useLoadingStore(s => s.items)
  const minTimerDone = useLoadingStore(s => s.minTimerDone)

  const vals = Object.values(items)
  const totalProgress = vals.length
    ? vals.reduce((a, b) => a + b, 0) / vals.length
    : 0

  const isDone = minTimerDone && (vals.length === 0 || vals.every(p => p >= 1))

  useEffect(() => {
    initMusic('sounds/Cinematic Percussion Kick.mp3')
  }, [])

  useEffect(() => {
    if (vals.length > 0) return
    const tween = gsap.to(barRef.current, {
      width: '90%',
      duration: 1.8,
      ease: 'power1.inOut',
    })
    return () => { tween.kill() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (vals.length === 0) return
    gsap.to(barRef.current, {
      width: `${totalProgress * 100}%`,
      duration: 0.4,
      ease: 'power2.out',
    })
  }, [totalProgress]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isDone) return
    gsap.timeline()
      .to(barRef.current, { width: '100%', duration: 0.3, ease: 'power2.out' })
      .to(enterRef.current, { opacity: 1, duration: 0.6, ease: 'power2.out' })
  }, [isDone])

  function handleEnter() {
    const music = new Howl({ src: ['sounds/SoundReality Boom 3.mp3'], volume: 1, loop: false })
    music.play()
    gsap.delayedCall(0.8, () => {
      playMusic()
    })
    gsap.timeline()
      .to(barRef.current, { scaleX: 1.02, duration: 0.15, ease: 'power2.out' })
      .to(overlayRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: 'power3.inOut',
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = 'none'
        },
      })
  }

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <p className={styles.title}>Mountain Mtebi</p>
      <div className={styles.track}>
        <div ref={barRef} className={styles.bar} />
      </div>
      <button
        ref={enterRef}
        className={styles.enter}
        onClick={handleEnter}
      >
        Enter
      </button>
    </div>
  )
}
