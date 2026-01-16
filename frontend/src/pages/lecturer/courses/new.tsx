import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";
import { hasRole } from "../../../services/auth";
import { createCourse } from "../../../services/course"; // bạn cần có hàm này trong course.ts

export default function LecturerCreateCoursePage() {
    const nav = useNavigate();
    const isLecturer = hasRole("LECTURER");

    const [form, setForm] = useState({
        code: "",
        name: "",
        credits: 3,
        department: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isLecturer) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">
                        <div className="lec-empty">❌ Bạn không có quyền (LECTURER)</div>
                    </div>
                </div>
            </div>
        );
    }

    const onChange = (k: keyof typeof form, v: any) => {
        setForm((p) => ({ ...p, [k]: v }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.code.trim() || !form.name.trim()) {
            setError("Vui lòng nhập Code và Tên môn học.");
            return;
        }

        try {
            setLoading(true);
            // payload theo backend DTO (nếu backend khác field thì mình sẽ chỉnh đúng theo Course1.java)
            await createCourse({
                code: form.code.trim(),
                name: form.name.trim(),
                credits: Number(form.credits) || 0,
                department: form.department.trim(),
            });

            // tạo xong quay về trang lecturer (đã có list)
            nav("/lecturer", { replace: true });
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message || "Tạo môn học thất bại";
            setError(typeof msg === "string" ? msg : "Tạo môn học thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav("/lecturer")}>
                        ← Quay lại
                    </button>

                    <h2 className="lec-section-title">Tạo môn học</h2>

                    {error && <div className="lec-empty">❌ {error}</div>}

                    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Course Code</span>
                            <input
                                className="lec-search"
                                value={form.code}
                                onChange={(e) => onChange("code", e.target.value)}
                                placeholder="VD: IT001"
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Course Name</span>
                            <input
                                className="lec-search"
                                value={form.name}
                                onChange={(e) => onChange("name", e.target.value)}
                                placeholder="VD: Lập trình Java"
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Credits</span>
                            <input
                                className="lec-search"
                                type="number"
                                min={0}
                                value={form.credits}
                                onChange={(e) => onChange("credits", e.target.value)}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Department</span>
                            <input
                                className="lec-search"
                                value={form.department}
                                onChange={(e) => onChange("department", e.target.value)}
                                placeholder="VD: CNTT"
                            />
                        </label>
                        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                            <button className="btn-primary" type="submit" disabled={loading}>
                                {loading ? "Đang tạo..." : "✅ Tạo môn học"}
                            </button>
                            <button className="btn-outline" type="button" onClick={() => nav("/lecturer")}>
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
