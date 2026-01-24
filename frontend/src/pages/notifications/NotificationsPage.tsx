
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { notificationApi, type NotificationDto } from "../../services/notification";

function formatTime(iso: string) {
    // hiển thị nhanh; muốn đẹp hơn thì dùng dayjs
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default function NotificationsPage() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<NotificationDto[]>([]);
    const [err, setErr] = useState<string | null>(null);

    const unread = useMemo(() => items.filter((x) => !x.read).length, [items]);

    const load = async () => {
        setLoading(true);
        setErr(null);
        try {
            const data = await notificationApi.listMine();
            setItems(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setErr(e?.message || "Không tải được thông báo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const markRead = async (id: number) => {
        // optimistic
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        try {
            await notificationApi.markRead(id);
        } catch {
            // rollback nếu cần
            await load();
        }
    };

    const readAll = async () => {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await notificationApi.readAll();
        } catch {
            await load();
        }
    };

    return (
        <div>
            <Header />

            <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <h2 style={{ margin: 0 }}>Thông báo</h2>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14 }}>
              Chưa đọc: <b>{unread}</b>
            </span>
                        <button onClick={readAll} disabled={items.length === 0 || unread === 0}>
                            Đọc tất cả
                        </button>
                        <button onClick={load} disabled={loading}>
                            Tải lại
                        </button>
                    </div>
                </div>

                {loading && <p>Đang tải…</p>}
                {err && <p style={{ color: "crimson" }}>{err}</p>}

                {!loading && !err && items.length === 0 && (
                    <p>Chưa có thông báo nào.</p>
                )}

                {!loading && !err && items.length > 0 && (
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                        {items.map((n) => (
                            <div
                                key={n.id}
                                style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 12,
                                    padding: 12,
                                    background: n.read ? "#fff" : "#f3f4f6",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, opacity: 0.75 }}>{formatTime(n.createdAt)}</div>
                                    <div style={{ marginTop: 6, fontSize: 15, fontWeight: n.read ? 400 : 600 }}>
                                        {n.message}
                                    </div>
                                </div>

                                {!n.read && (
                                    <button onClick={() => markRead(n.id)} style={{ height: 36, alignSelf: "center" }}>
                                        Đánh dấu đã đọc
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
