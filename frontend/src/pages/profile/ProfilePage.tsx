import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/hod.css";
import "../../assets/css/pages/profile.css";

import { goHomeByRole } from "../../utils/navByRole"; // chỉnh đúng path project bạn

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
        ? `http://localhost:8081${me.profile.avatarUrl}`
        : null;

    if (loading) return <div className="lec-empty">Đang tải...</div>;
    if (err) return <div className="lec-empty">❌ {err}</div>;
    if (!me) return <div className="lec-empty">Không có dữ liệu</div>;

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <div style={{ marginBottom: 8 }}>
                        {/* ✅ quay về trang chính để tránh loop history */}
                        <button className="lec-link" onClick={() => goHomeByRole(nav)}>
                            ← Quay lại
                        </button>
                    </div>

                    <div className="profile-header">
                        <div>
                            <div className="profile-title">Profile</div>
                            <div className="profile-subtitle">
                                {me.username} • Roles: {me.roles?.join(", ")}
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button className="lec-link" onClick={() => nav("/profile/edit")}>
                                Sửa profile
                            </button>
                            <button className="lec-link" onClick={() => nav("/profile/password")}>
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>

                    <hr className="profile-divider" />

                    <div className="profile-body">
                        <div className="profile-avatar-col">
                            <div className="profile-avatar">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="avatar" className="profile-avatar-img" />
                                ) : (
                                    <div className="profile-avatar-empty">No Avatar</div>
                                )}
                            </div>
                            <div className="profile-avatar-hint">Upload ở trang Edit</div>
                        </div>

                        <div className="profile-grid">
                            <Field label="Họ tên" value={me.fullName || ""} />
                            <Field label="CCCD" value={me.cccd || ""} />
                            <Field label="Ngày sinh" value={me.dateOfBirth || ""} />
                            <Field label="Email" value={me.profile?.email || ""} />
                            <Field label="Phone" value={me.profile?.phone || ""} />
                            <Field label="Địa chỉ" value={me.profile?.address || ""} />
                            <div className="profile-grid-full">
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
            <div className="profile-field-label">{label}</div>
            <div className={`profile-field-value ${multiline ? "multiline" : ""}`}>
                {value || <span className="profile-field-empty">(trống)</span>}
            </div>
        </div>
    );
}
