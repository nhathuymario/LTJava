import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/hod.css";
import { profileApi, type MeResponse } from "../../services/profile";
import { getToken } from "../../services/auth";

export default function ProfileEditPage() {
    const nav = useNavigate();
    const [me, setMe] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [bio, setBio] = useState("");

    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    useEffect(() => {
        const token = getToken?.() || localStorage.getItem("token");
        if (!token) {
            setErr("Bạn chưa đăng nhập.");
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const data = await profileApi.me();
                setMe(data);

                setFullName(data.fullName || "");
                setEmail(data.profile?.email || "");
                setPhone(data.profile?.phone || "");
                setAddress(data.profile?.address || "");
                setBio(data.profile?.bio || "");
            } catch (e: any) {
                setErr(e?.response?.data?.message || "Không tải được profile");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const avatarPreview = avatarFile
        ? URL.createObjectURL(avatarFile)
        : me?.profile?.avatarUrl
            ? `http://localhost:8081${me.profile.avatarUrl}`
            : null;

    const save = async () => {
        setErr(null);
        setSaving(true);
        try {
            // 1) upload avatar nếu có file
            if (avatarFile) {
                const url = await profileApi.uploadAvatar(avatarFile);
                // cập nhật local state để preview đúng
                setMe((prev) =>
                    prev ? { ...prev, profile: { ...prev.profile, avatarUrl: url } } : prev
                );
            }

            // 2) update fields
            const updated = await profileApi.updateProfile({
                fullName,
                email,
                phone,
                address,
                bio,
            });

            setMe(updated);
            nav("/profile");
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Lưu thất bại");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="lec-empty">Đang tải...</div>;
    if (err) return <div className="lec-empty">❌ {err}</div>;
    if (!me) return <div className="lec-empty">Không có dữ liệu</div>;

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav("/profile")}>
                        ← Quay lại
                    </button>

                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>Sửa Profile</div>

                    <hr style={{ margin: "12px 0" }} />

                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ width: 180 }}>
                            <div
                                style={{
                                    width: 140,
                                    height: 140,
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    background: "#f2f2f2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="avatar"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div style={{ opacity: 0.6 }}>No Avatar</div>
                                )}
                            </div>

                            <input
                                style={{ marginTop: 10 }}
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                            />
                            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                                Chọn ảnh từ máy để upload
                            </div>
                        </div>

                        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <Input label="Họ tên" value={fullName} onChange={setFullName} />
                            <Input label="Email" value={email} onChange={setEmail} />
                            <Input label="Phone" value={phone} onChange={setPhone} />
                            <Input label="Địa chỉ" value={address} onChange={setAddress} />
                            <div style={{ gridColumn: "1 / -1" }}>
                                <TextArea label="Bio" value={bio} onChange={setBio} />
                            </div>

                            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
                                <button className="lec-link" onClick={save} disabled={saving}>
                                    {saving ? "Đang lưu..." : "Lưu"}
                                </button>
                                <button className="lec-link" onClick={() => nav("/profile")} disabled={saving}>
                                    Huỷ
                                </button>
                            </div>

                            {err && <div className="lec-empty">❌ {err}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Input({
                   label,
                   value,
                   onChange,
               }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    marginTop: 4,
                    width: "100%",
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #e5e5e5",
                }}
            />
        </div>
    );
}

function TextArea({
                      label,
                      value,
                      onChange,
                  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                style={{
                    marginTop: 4,
                    width: "100%",
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #e5e5e5",
                    resize: "vertical",
                }}
            />
        </div>
    );
}
