import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";
import { hasRole, getToken } from "../../../services/auth";
import type { Notification } from "../../../services/syllabus";
import { studentApi } from "../../../services/student";

export default function StudentNotificationsPage() {
    const nav = useNavigate();
    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const isStudent = hasRole("STUDENT");

    useEffect(() => {

        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setErr("Bạn chưa đăng nhập (thiếu token).");
            setLoading(false);
            return;
        }
        if (!isStudent) {
            setErr("Bạn không có quyền truy cập trang này (STUDENT).");
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const data = await studentApi.notifications();
                setItems(data || []);
            } catch (e: any) {
                setErr(e?.response?.data?.message || e?.message || "Không tải được notifications");
            } finally {
                setLoading(false);
            }
        })
        ();
    }, [isStudent]);

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav(-1)}>
                        ← Quay lại
                    </button>

                    <h2 className="lec-section-title" style={{ marginTop: 10 }}>
                        Notifications
                    </h2>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {err && <div className="lec-empty">❌ {err}</div>}

                    {!loading && !err && (
                        <div className="lec-list">
                            {items.length === 0 ? (
                                <div className="lec-empty">Chưa có thông báo.</div>
                            ) : (
                                items.map((n: any) => (
                                    <div key={n.id} className="syllabus-folder" style={{ cursor: "default" }}>
                                        <div className="syllabus-left">
                                            <div className="syllabus-folder-icon">🔔</div>
                                            <div className="syllabus-folder-name">{n.content || n.message || "Notification"}</div>
                                        </div>
                                        <div style={{ color: "#6b6f76", fontSize: 13 }}>
                                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
