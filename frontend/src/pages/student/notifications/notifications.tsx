import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";

import { hasRole, getToken } from "../../../services/auth";
import type { Notification } from "../../../services/syllabus";
import { studentApi } from "../../../services/student";

export default function StudentNotificationsPage() {
    const nav = useNavigate();
    const isStudent = hasRole("STUDENT") || hasRole("ROLE_STUDENT");

    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const unreadCount = useMemo(
        () => items.filter((n) => !n.isRead).length,
        [items]
    );

    const load = async () => {
        setLoading(true);
        setErr(null);
        try {
            const data = await studentApi.notifications();
            setItems(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setErr(
                e?.response?.data?.message ||
                e?.message ||
                "Không tải được notifications"
            );
        } finally {
            setLoading(false);
        }
    };

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
        load();
    }, [isStudent]);

    // Click 1 notification => mark read
    const markOneRead = async (id: number) => {
        // optimistic UI: update trước cho mượt
        setItems((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );

        try {
            await studentApi.markRead(id);
        } catch {
            // rollback nếu cần (optional)
            setItems((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
            );
        }
    };

    // Read all
    const readAll = async () => {
        if (items.length === 0) return;
        setBusy(true);

        // optimistic
        setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));

        try {
            await studentApi.readAll();
        } catch (e: any) {
            // nếu fail thì reload lại cho chắc
            await load();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button className="lec-link" onClick={() => nav(-1)}>
                            ← Quay lại
                        </button>

                        <button
                            className="lec-select"
                            onClick={readAll}
                            disabled={busy || unreadCount === 0}
                            title="Đánh dấu tất cả đã đọc"
                        >
                            ✅ Đọc hết{unreadCount > 0 ? ` (${unreadCount})` : ""}
                        </button>
                    </div>

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
                                items.map((n) => {
                                    const isUnread = !n.isRead;

                                    return (
                                        <div
                                            key={n.id}
                                            className="syllabus-folder"
                                            style={{
                                                cursor: "pointer",
                                                opacity: isUnread ? 1 : 0.7,
                                                border:
                                                    isUnread ? "1px solid rgba(59,130,246,.35)" : "",
                                            }}
                                            onClick={() => {
                                                if (isUnread) markOneRead(n.id);
                                            }}
                                            title={isUnread ? "Bấm để đánh dấu đã đọc" : "Đã đọc"}
                                        >
                                            <div className="syllabus-left">
                                                <div className="syllabus-folder-icon">🔔</div>

                                                <div className="syllabus-folder-name">
                                                    {n.message || "Notification"}
                                                    {isUnread && (
                                                        <span
                                                            style={{
                                                                marginLeft: 10,
                                                                fontSize: 12,
                                                                padding: "2px 8px",
                                                                borderRadius: 999,
                                                                background: "rgba(59,130,246,.12)",
                                                                color: "#2563eb",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                              NEW
                            </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ color: "#6b6f76", fontSize: 13 }}>
                                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
