import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/hod.css"; // nếu bạn dùng chung layout
import { profileApi, type MeResponse } from "../../services/profile";
import { getToken } from "../../services/auth";

export default function ProfilePage() {
    const nav = useNavigate();
    const [me, setMe] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setErr("Bạn chưa đăng nhập.");
            setLoading(false);
            return;
        }

        (async () => {
            try {
                setLoading(true);
                const data = await profileApi.me();
                setMe(data);
            } catch (e: any) {
                setErr(e?.response?.data?.message || "Không tải được profile");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const avatarSrc = me?.profile?.avatarUrl
        ? `http://localhost:8081${me.profile.avatarUrl}` // chỉnh port nếu khác
        : null;

    if (loading) return <div className="lec-empty">Đang tải...</div>;
    if (err) return <div className="lec-empty">❌ {err}</div>;
    if (!me) return <div className="lec-empty">Không có dữ liệu</div>;

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 700 }}>Profile</div>
                            <div style={{ opacity: 0.75 }}>
                                {me.username} • Roles: {me.roles?.join(", ")}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="lec-link" onClick={() => nav("/profile/edit")}>
                                Sửa profile
                            </button>
                            <button className="lec-link" onClick={() => nav("/profile/password")}>
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>

                    <hr style={{ margin: "12px 0" }} />

                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ width: 140 }}>
                            <div
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    background: "#f2f2f2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {avatarSrc ? (
                                    <img
                                        src={avatarSrc}
                                        alt="avatar"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div style={{ opacity: 0.6 }}>No Avatar</div>
                                )}
                            </div>
                            <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>
                                Upload ở trang Edit
                            </div>
                        </div>

                        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <Field label="Họ tên" value={me.fullName || ""} />
                            <Field label="CCCD" value={me.cccd || ""} />
                            <Field label="Ngày sinh" value={me.dateOfBirth || ""} />
                            <Field label="Email" value={me.profile?.email || ""} />
                            <Field label="Phone" value={me.profile?.phone || ""} />
                            <Field label="Địa chỉ" value={me.profile?.address || ""} />
                            <div style={{ gridColumn: "1 / -1" }}>
                                <Field label="Bio" value={me.profile?.bio || ""} multiline />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({
                   label,
                   value,
                   multiline,
               }: {
    label: string;
    value: string;
    multiline?: boolean;
}) {
    return (
        <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <div
                style={{
                    marginTop: 4,
                    padding: 10,
                    border: "1px solid #e5e5e5",
                    borderRadius: 10,
                    minHeight: multiline ? 80 : 40,
                    whiteSpace: multiline ? "pre-wrap" : "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {value || <span style={{ opacity: 0.5 }}>(trống)</span>}
            </div>
        </div>
    );
}
