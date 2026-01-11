import { Routes, Route, Navigate } from "react-router-dom";
import LecturerPage from "../pages/lecturer";
import LecturerCourseSyllabusPage from "../pages/lecturer/course-syllabus";

export default function LecturerRoutes() {
    return (
        <Routes>
            <Route path="/lecturer" element={<LecturerPage />} />
            <Route path="/lecturer/courses/:courseId" element={<LecturerCourseSyllabusPage />} />

            <Route path="*" element={<Navigate to="/lecturer" replace />} />
        </Routes>
    );
}
