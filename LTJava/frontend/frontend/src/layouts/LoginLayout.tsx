import Header from '../components/Header'
// @ts-ignore
import styles from './LoginLayout.module.css'
import { Outlet } from 'react-router-dom'

export default function LoginLayout() {
    return (
        <div className={styles.app}>
            <Header />
            <main className={styles.main}>
                {/* Outlet sẽ render LoginPage */}
                <Outlet />
            </main>
        </div>
    )
}