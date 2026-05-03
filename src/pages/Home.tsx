import styles from './Home.module.css'
import { MountainScene } from '../components/MountainScene/MountainScene'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.sticky}>
        <MountainScene />
      </div>
    </main>
  )
}
