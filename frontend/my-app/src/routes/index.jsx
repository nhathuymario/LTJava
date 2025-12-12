import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../features/auth/AuthProvider";
import { ROLES } from "../constants/roles";

// layouts
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

// pages
import Home from "../pages/Home";
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import Dashboard from "../features/dashboard/pages/Dashboard";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import LearnerHome from "../pages/forLearner/LearnerHome.jsx";
import UserManagement from "../features/dashboard/users/pages/UserManagement.jsx";
import ProfilePage from "../features/profile/pages/ProfilePage.jsx";
import OAuthSuccess from "../pages/OAuthSuccess";
import ResetPassword from "../features/auth/pages/ResetPassword.jsx";

// SMD Pages
import SystemConfig from "../features/admin/pages/SystemConfig";
import TextbookManager from "../features/lecturer/pages/TextbookManager";
import TextbookForm from "../features/lecturer/components/TextbookForm";
import ReviewDashboard from "../features/review/pages/ReviewDashboard";
import ReviewDetail from "../features/review/pages/ReviewDetail";
import Library from "../features/public/pages/Library";
import TextbookDetail from "../features/public/pages/TextbookDetail";

export default function AppRoutes() {
    return (
        <AuthProvider>
            <Routes>


                {/* Public */}
                <Route path={"/"} element={<UserLayout />}>
                    <Route path="" element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="oauth-success" element={<OAuthSuccess />} />
                    <Route path="reset-password" element={<ResetPassword />} />

                    {/* Public Library */}
                    <Route path="library" element={<Library />} />
                    <Route path="library/:id" element={<TextbookDetail />} />
                </Route>


                {/* User routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.USER, ROLES.STUDENT]} />}>
                    <Route path="/user" element={<UserLayout />}>
                        <Route path="home" element={<LearnerHome />} />
                    </Route>
                </Route>


                {/* User-Admin routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.LECTURER, ROLES.HOD, ROLES.ACADEMIC_AFFAIRS, ROLES.RECTOR]} />}>
                    <Route path="/" element={<UserLayout />}>
                        {/* Thêm các route user protected ở đây */}
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>
                </Route>


                {/* Admin routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="system-config" element={<SystemConfig />} />
                    </Route>
                </Route>

                {/* Lecturer routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.LECTURER]} />}>
                    <Route path="/lecturer" element={<AdminLayout />}>
                        <Route path="textbooks" element={<TextbookManager />} />
                        <Route path="textbooks/new" element={<TextbookForm />} />
                        <Route path="textbooks/:id" element={<TextbookForm />} />
                    </Route>
                </Route>

                {/* Reviewer routes - protected */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.HOD, ROLES.ACADEMIC_AFFAIRS, ROLES.RECTOR]} />}>
                    <Route path="/review" element={<AdminLayout />}>
                        <Route path="dashboard" element={<ReviewDashboard />} />
                        <Route path="dashboard/:id" element={<ReviewDetail />} />
                    </Route>
                </Route>

                {/* Not found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}