import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import RequireAuth from "./RequireAuth"
import AppLayout from "./AppLayout" // hoặc để cùng file cũng được

import AdminPage from "./pages/admin/AdminPage"
import AAPage from "./pages/aa"
import StudentPage from "./pages/student"
import LecturerPage from "./pages/lecturer"
import HodPage from "./pages/hod"
import PrincipalPage from "./pages/principal"

import HodCourseDetailPage from "./pages/hod/course-detail"
import AACourseDetailPage from "./pages/aa/course-detail"
import AaCourseRelationsPage from "./pages/aa/courses/relations"
import AACourseNew from "./pages/aa/courses/new"
import LecturerCoureseDetailPage from "./pages/lecturer/course-syllabus"


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* ADMIN */}
                <Route element={<RequireAuth allowedRoles={["SYSTEM_ADMIN", "ROLE_SYSTEM_ADMIN"]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                </Route>

                {/* AA */}
                <Route element={<RequireAuth allowedRoles={["AA", "ROLE_AA"]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/aa" element={<AAPage />} />
                        <Route path="/aa/courses/new" element={<AACourseNew />} />
                        <Route path="/aa/courses/:courseId" element={<AACourseDetailPage />} />
                        <Route path="/aa/courses/relations" element={<AaCourseRelationsPage />} /> {/* set tiên quyết/song hành/bổ trợ */}
                    </Route>
                </Route>

                {/* LECTURER */}
                <Route element={<RequireAuth allowedRoles={["LECTURER", "ROLE_LECTURER"]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/lecturer" element={<LecturerPage />} />
                        <Route path="/lecturer/courses/:courseId" element={<LecturerCoureseDetailPage/>} />
                    </Route>
                </Route>

                {/* HOD */}
                <Route element={<RequireAuth allowedRoles={["HOD", "ROLE_HOD"]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/hod" element={<HodPage />} />
                        <Route path="/hod/courses/:courseId" element={<HodCourseDetailPage />} />
                    </Route>
                </Route>

                {/* STUDENT */}
                <Route element={<RequireAuth allowedRoles={["STUDENT", "ROLE_STUDENT"]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/student" element={<StudentPage />} />
                    </Route>
                </Route>

                {/* PRINCIPAL */}
                <Route element={<RequireAuth allowedRoles={["PRINCIPAL", "ROLE_PRINCIPAL"]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/principal" element={<PrincipalPage />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
