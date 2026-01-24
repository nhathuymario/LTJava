import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/pages/hod.css";
import { profileApi } from "../../services/profile";

export default function ChangePasswordPage() {
    const nav = useNavigate();
    const [currentPassword, setCurrent] = useState("");
    const [newPassword, setNewPass] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const submit = async () => {
        setErr(null);
        if (!currentPassword || !newPassword) {
            setErr("Nhập đủ mật khẩu hiện tại và mật khẩu mới");
            return;
        }

        setSaving(true);
        try {
            await profileApi.changePassword({ currentPassword, newPassword });
            nav("/profile");
        } catch (e: any) {
            setErr(e?.response?.data?.message || "Đổi mật khẩu thất bại");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav("/profile")}>
                        ← Quay lại
                    </button>

                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>Đổi mật khẩu</div>

                    <hr style={{ margin: "12px 0" }} />

                    <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
                        <Input label="Mật khẩu hiện tại" value={currentPassword} onChange={setCurrent} type="password" />
                        <Input label="Mật khẩu mới" value={newPassword} onChange={setNewPass} type="password" />

                        {err && <div className="lec-empty">❌ {err}</div>}

                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="lec-link" onClick={submit} disabled={saving}>
                                {saving ? "Đang lưu..." : "Cập nhật"}
                            </button>
                            <button className="lec-link" onClick={() => nav("/profile")} disabled={saving}>
                                Huỷ
                            </button>
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
                   type,
               }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}) {
    return (
        <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <input
                type={type || "text"}
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
