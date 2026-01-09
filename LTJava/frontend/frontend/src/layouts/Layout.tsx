import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
// @ts-ignore
import styles from './Layout.module.css'

export default function Layout() {
    return (
        <div className={styles.app}>
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    )
}