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

import ProfilePage from "./pages/profile/ProfilePage";
import ProfileEditPage from "./pages/profile/ProfileEditPage";
import ChangePasswordPage from "./pages/profile/ChangePasswordPage";
import HodCourseDetailPage from "./pages/hod/course-detail"
import AACourseDetailPage from "./pages/aa/course-detail"
import AaCourseRelationsPage from "./pages/aa/courses/relations"
import AACourseNew from "./pages/aa/courses/new"
import LecturerCoureseDetailPage from "./pages/lecturer/course-syllabus"
import LecturerSyllabusNewPage  from "./pages/lecturer/syllabus/new";
import LecturerSyllabusEdit  from "./pages/lecturer/syllabus/edit";
import PrincipalCourseDetailPage from "./pages/principal/course-detail";
import StudentCourseSyllabusPage from "./pages/student/course-syllabus"
import StudentSyllabusDetailPage from "./pages/student/syllabus/syllabus-detail"
import StudentNotificationsPage from "./pages/student/notifications/notifications"
import StudentRegisterCoursePage from "./pages/student/courses/register-course"


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<ProfileEditPage />} />
                <Route path="/profile/password" element={<ChangePasswordPage />} />


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
                        <Route path="/lecturer/syllabus/new" element={<LecturerSyllabusNewPage />} />
                        <Route path="/lecturer/syllabus/:syllabusId/edit" element={<LecturerSyllabusEdit/>} />
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
                        <Route path="/student/courses/:courseId" element={<StudentCourseSyllabusPage />} />
                        <Route path="/student/syllabus/:syllabusId" element={<StudentSyllabusDetailPage />} />
                        <Route path="/student/courses/register" element={<StudentRegisterCoursePage />} />
                        <Route path="/student/notifications" element={<StudentNotificationsPage />} />
                    </Route>
                </Route>

                {/* PRINCIPAL */}
                <Route element={<RequireAuth allowedRoles={["PRINCIPAL", "ROLE_PRINCIPAL"]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/principal" element={<PrincipalPage />} />
                        <Route path="/principal/courses/:courseId" element={<PrincipalCourseDetailPage />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
