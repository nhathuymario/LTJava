import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/pages/lecturer.css";
import { hasRole, getToken } from "../../../services/auth";
import type { Notification } from "../../../services/syllabus";
import { studentApi } from "../../../services/student";
import { api } from "../../../services/api";

/**
 * Normalize isRead:
 * - backend có thể trả boolean true/false
 * - hoặc number 0/1
 * - hoặc string "0"/"1"
 */
const isUnread = (n: any) => {
    const v = n?.isRead;
    if (v === false) return true;
    if (v === 0) return true;
    if (v === "0") return true;
    return false;
};

export default function StudentNotificationsPage() {
    const nav = useNavigate();

    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const isStudent = hasRole("STUDENT") || hasRole("ROLE_STUDENT");

    const unreadCount = useMemo(() => (items || []).filter((n: any) => isUnread(n)).length, [items]);

    const fetchNotifications = async () => {
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
    };

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setErr("Bạn chưa đăng nhập.");
            setLoading(false);
            return;
        }
        if (!isStudent) {
            setErr("Bạn không có quyền (STUDENT).");
            setLoading(false);
            return;
        }

        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStudent]);

    /**
     * Mark 1 notification read:
     * PATCH /api/student/syllabus/notifications/{id}/read
     * (Optimistic update: cập nhật UI trước)
     */
    const markRead = async (id: number) => {
        // Optimistic: set isRead = true
        setItems((prev: any) =>
            (prev || []).map((n: any) => (n.id === id ? { ...n, isRead: true } : n))
        );

        try {
            await api.patch(`/student/syllabus/notifications/${id}/read`);
        } catch (e: any) {
            // fallback nếu backend dùng POST thay vì PATCH
            const status = e?.response?.status;
            if (status === 405 || status === 404) {
                try {
                    await api.post(`/student/syllabus/notifications/${id}/read`);
                } catch {
                    // rollback nếu vẫn fail
                    await fetchNotifications();
                }
            } else {
                await fetchNotifications();
            }
        }
    };

    /**
     * Mark all read:
     * POST /api/student/syllabus/notifications/read-all
     */
    const readAll = async () => {
        // Optimistic
        setItems((prev: any) => (prev || []).map((n: any) => ({ ...n, isRead: true })));

        try {
            await api.post(`/student/syllabus/notifications/read-all`);
        } catch {
            await fetchNotifications();
        }
    };

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <button className="lec-link" onClick={() => nav(-1)}>
                            ← Quay lại
                        </button>

                        <button
                            className="lec-select"
                            onClick={readAll}
                            disabled={loading || items.length === 0 || unreadCount === 0}
                            title="Đánh dấu tất cả là đã đọc"
                        >
                            ✅ Đọc hết
                        </button>
                    </div>

                    <h2 className="lec-section-title" style={{ marginTop: 10 }}>
                        Notifications{unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}
                    </h2>

                    {loading && <div className="lec-empty">Đang tải...</div>}
                    {err && <div className="lec-empty">❌ {err}</div>}

                    {!loading && !err && (
                        <div className="lec-list">
                            {items.length === 0 ? (
                                <div className="lec-empty">Chưa có thông báo.</div>
                            ) : (
                                items.map((n: any) => (
                                    <div
                                        key={n.id}
                                        className="syllabus-folder"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            if (isUnread(n)) markRead(n.id);
                                        }}
                                        title="Bấm để đánh dấu đã đọc"
                                    >
                                        <div className="syllabus-left">
                                            <div className="syllabus-folder-icon">🔔</div>

                                            <div className="syllabus-folder-name">
                                                {n.message || "Notification"}
                                                {isUnread(n) && (
                                                    <span
                                                        style={{
                                                            marginLeft: 10,
                                                            fontSize: 12,
                                                            padding: "2px 8px",
                                                            borderRadius: 999,
                                                            background: "#fde68a",
                                                        }}
                                                    >
                            Chưa đọc
                          </span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ fontSize: 13, color: "#6b6f76" }}>
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
