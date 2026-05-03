import { Howl } from 'howler'

let music = null

export function initMusic(src) {
  if (music) return
  music = new Howl({ src: [src], loop: true, volume: 0 })
}

export function playMusic() {
  if (!music) return
  music.play()
  music.fade(0, 1, 5000)
}
