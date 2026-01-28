import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import RequireAuth from "./RequireAuth"
import AppLayout from "./AppLayout" // hoặc để cùng file cũng được

import AdminPage from "./pages/admin/AdminPage"
import AAPage from "./pages/aa"
import StudentPage from "./pages/student"
import LecturerPage from "./pages/lecturer"
import HodPage from "./pages/hod"
import PrincipalPage from "./pages/principal"

import ReviewerMyReviewsPage from "./pages/review/ReviewerMyReviewsPage";
import ReviewDetailPage from "./pages/review/ReviewDetailPage";
import HodAssignReviewPage from "./pages/review/HodAssignReviewPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProfileEditPage from "./pages/profile/ProfileEditPage";
import ChangePasswordPage from "./pages/profile/ChangePasswordPage";
import HodCourseDetailPage from "./pages/hod/course-detail"
import AACourseDetailPage from "./pages/aa/course-detail"
import AaCourseRelationsPage from "./pages/aa/courses/relations"
import AaManageCoursesPage from "./pages/aa/courses/aa-manage-courses"
import AaEditCoursePage from "./pages/aa/courses/AaEditCoursePage"
import AaPloPage from "./pages/aa/plo/AaPloPage"
import AACourseNew from "./pages/aa/courses/new"
import LecturerCoureseDetailPage from "./pages/lecturer/course-syllabus"
import LecturerSyllabusNewPage  from "./pages/lecturer/syllabus/new";
import LecturerSyllabusDetailPage  from "./pages/lecturer/syllabus/LecturerSyllabusDetailPage";
import LecturerSyllabusEdit  from "./pages/lecturer/syllabus/edit";
import PrincipalCourseDetailPage from "./pages/principal/course-detail";
import StudentCourseSyllabusPage from "./pages/student/course-syllabus"
import SyllabusDetailPage from "./pages/lecturer/syllabus/LecturerSyllabusDetailPage";

import StudentNotificationsPage from "./pages/student/notifications/notifications"
import StudentRegisterCoursePage from "./pages/student/courses/register-course"
import HodCollabCoursesPage from "./pages/hod/assign/HodCollabCoursesPage";
import HodDraftSyllabiByCoursePage from "./pages/hod/assign/HodDraftSyllabiByCoursePage";
import HodReviewManagePage  from "./pages/hod/assign/HodReviewManagePage ";
import LecturerSyllabusReviewsPage  from "./pages/lecturer/comment/LecturerSyllabusReviewsPage";
import LecturerSyllabusOutcomesPage  from "./pages/lecturer/syllabus/LecturerSyllabusOutcomesPage";
import NotificationsPage from "./pages/notifications/NotificationsPage"


export default function App() {
    return (
        <BrowserRouter>
            <Routes>


                {/* ===== VIEW CHUNG SYLLABUS (ALL ROLES) ===== */}
                <Route
                    element={
                        <RequireAuth
                            allowedRoles={[
                                "SYSTEM_ADMIN","ROLE_SYSTEM_ADMIN",
                                "AA","ROLE_AA",
                                "LECTURER","ROLE_LECTURER",
                                "HOD","ROLE_HOD",
                                "PRINCIPAL","ROLE_PRINCIPAL",
                                "STUDENT","ROLE_STUDENT",
                            ]}
                        />
                    }
                >
                    <Route element={<AppLayout />}>
                        <Route
                            path="/syllabus/:syllabusId"
                            element={<SyllabusDetailPage />}
                        />
                    </Route>
                </Route>




                <Route path="materials" element={<div>Materials</div>} />
                        <Route path="assignments" element={<div>Assignments</div>} />
                        <Route path="grades" element={<div>Grades</div>} />




                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<ProfileEditPage />} />
                <Route path="/profile/password" element={<ChangePasswordPage />} />
                {/* review */}
                // App.tsx
                <Route element={<RequireAuth allowedRoles={[
                    "SYSTEM_ADMIN","ROLE_SYSTEM_ADMIN",
                    "AA","ROLE_AA",
                    "LECTURER","ROLE_LECTURER",
                    "HOD","ROLE_HOD",
                    "PRINCIPAL","ROLE_PRINCIPAL",
                    "STUDENT","ROLE_STUDENT",
                ]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/reviews" element={<ReviewerMyReviewsPage />} />
                        <Route path="/reviews/:assignmentId" element={<ReviewDetailPage />} />
                        <Route path="/hod/reviews/assign" element={<HodAssignReviewPage />} />
                    </Route>
                </Route>

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
                        <Route path="/aa/plos" element={<AaPloPage />} />
                        <Route path="/aa/courses-manager" element={<AaManageCoursesPage />} />
                        <Route path="/aa/courses/:id/edit" element={<AaEditCoursePage />} />

                    </Route>
                </Route>

                {/* LECTURER */}
                <Route element={<RequireAuth allowedRoles={["LECTURER", "ROLE_LECTURER"]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/lecturer" element={<LecturerPage />} />
                        <Route path="/lecturer/courses/:courseId" element={<LecturerCoureseDetailPage/>} />
                        <Route path="/lecturer/syllabus/new" element={<LecturerSyllabusNewPage />} />
                        <Route path="/lecturer/syllabus/:syllabusId/edit" element={<LecturerSyllabusEdit/>} />
                        <Route path="/lecturer/syllabus/:id/reviews" element={<LecturerSyllabusReviewsPage/>} />
                        <Route
                            path="/lecturer/syllabus/:syllabusId"
                            element={<Navigate to="/syllabus/:syllabusId" replace />}
                        />

                        <Route
                            path="/lecturer/syllabus/:syllabusId/outcomes"
                            element={<LecturerSyllabusOutcomesPage />}
                        />



                        <Route path="/lecturer/syllabus/:syllabusId" element={<LecturerSyllabusDetailPage />} />


                    </Route>
                </Route>

                {/* HOD */}
                <Route element={<RequireAuth allowedRoles={["HOD", "ROLE_HOD"]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/hod" element={<HodPage />} />
                        <Route path="/hod/courses/:courseId" element={<HodCourseDetailPage />} />
                        <Route path="/hod/collab" element={<HodCollabCoursesPage />} />
                        <Route path="/hod/courses/:courseId/syllabi" element={<HodDraftSyllabiByCoursePage />} />
                        <Route path="/hod/reviews/manage" element={<HodReviewManagePage  />} />
                    </Route>
                </Route>

                {/* STUDENT */}
                <Route element={<RequireAuth allowedRoles={["STUDENT", "ROLE_STUDENT"]} />}>
                    <Route element={<AppLayout />}>
                        <Route path="/student" element={<StudentPage />} />
                        <Route path="/student/courses/:courseId" element={<StudentCourseSyllabusPage />} />
                        <Route
                            path="/student/syllabus/:syllabusId"
                            element={<Navigate to="/syllabus/:syllabusId" replace />}
                        />

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
