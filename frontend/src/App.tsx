import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/admin/AdminPage'
import AAPage from './pages/aa'
// import LecturerPage from './pages/lecturer'
import HodPage from './pages/hod'
import PrincipalPage from './pages/principal'
import RequireAuth from './RequireAuth'
import LecturerRoutes from './routes/LecturerRoutes'
import HodCourseDetailPage from "./pages/hod/course-detail"


function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            {children}
        </>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route element={<RequireAuth allowedRoles={['SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN']} />}>
                    <Route path="/admin" element={<AppLayout><AdminPage /></AppLayout>} />
                </Route>
                <Route element={<RequireAuth allowedRoles={['AA', 'ROLE_AA']} />}>
                    <Route path="/aa" element={<AppLayout><AAPage /></AppLayout>} />
                </Route>
                <Route element={<RequireAuth allowedRoles={['LECTURER', 'ROLE_LECTURER']} />}>
                    <Route path="/lecturer/*" element={<AppLayout><LecturerRoutes /></AppLayout>} />
                </Route>
                <Route element={<RequireAuth allowedRoles={["HOD", "ROLE_HOD"]} />}>
                    <Route path="/hod" element={<AppLayout><HodPage /></AppLayout>} />
                    <Route path="/hod/courses/:courseId" element={<AppLayout><HodCourseDetailPage /></AppLayout>} />
                </Route>

                <Route element={<RequireAuth allowedRoles={['PRINCIPAL', 'ROLE_PRINCIPAL']} />}>
                    <Route path="/principal" element={<AppLayout><PrincipalPage /></AppLayout>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}