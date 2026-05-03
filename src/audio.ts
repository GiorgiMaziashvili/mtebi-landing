import { Howl } from 'howler'

let music: Howl | null = null

export function initMusic(src: string): void {
  if (music) return
  music = new Howl({ src: [src], loop: true, volume: 0 })
}

export function playMusic(): void {
  if (!music) return
  music.play()
  music.fade(0, 1, 5000)
}
