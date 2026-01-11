import { Routes, Route } from "react-router-dom";
import LecturerPage from "../pages/lecturer";
import LecturerCourseDetailPage from "../pages/lecturer/course-syllabus";

export default function LecturerRoutes() {
    return (
        <Routes>
            <Route index element={<LecturerPage />} />
            <Route path="courses/:courseId" element={<LecturerCourseDetailPage />} />
        </Routes>
    );
}
