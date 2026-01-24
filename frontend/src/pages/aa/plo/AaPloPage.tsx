import { useEffect, useState } from "react";
import { ploApi } from "../../../services/plo.ts";
import type { PLO } from "../../../services/outcome.ts";
import "../../../assets/css/pages/aa_plo.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function AaPLOPage() {
    const [items, setItems] = useState<PLO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // ===== STATE CHO FORM TẠO MỚI =====
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [program, setProgram] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // ===== STATE CHO CHỨC NĂNG SỬA (INLINE EDIT) =====
    const [editingId, setEditingId] = useState<number | null>(null);
    // Tách riêng data sửa để không ảnh hưởng form tạo mới
    const [editData, setEditData] = useState({ code: "", description: "", program: "" });

    // Load dữ liệu ban đầu
    useEffect(() => {
        (async () => {
            try {
                const data = await ploApi.listForAA();
                setItems(data);
            } catch {
                setError("Không tải được danh sách PLO");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Xử lý Tạo mới
    const create = async () => {
        if (!code || !description) {
            alert("Code và mô tả là bắt buộc");
            return;
        }

        try {
            setSubmitting(true);
            const p = await ploApi.createForAA({ code, description, program });
            setItems((prev) => [...prev, p]);
            // Reset form tạo mới
            setCode("");
            setDescription("");
            setProgram("");
        } catch {
            alert("Có lỗi xảy ra khi tạo PLO");
        } finally {
            setSubmitting(false);
        }
    };



    // Bắt đầu chế độ sửa
    const startEdit = (p: PLO) => {
        setEditingId(p.id);
        setEditData({
            code: p.code,
            description: p.description,
            program: p.program || ""
        });
    };

    // Lưu thay đổi
    const saveEdit = async (id: number) => {
        try {
            const updated = await ploApi.updateForAA(id, {
                code: editData.code,
                description: editData.description,
                program: editData.program,
            });

            // Cập nhật lại danh sách hiển thị
            setItems(items.map(i => i.id === id ? updated : i));
            setEditingId(null); // Thoát chế độ sửa
        } catch {
            alert("Không thể cập nhật PLO");
        }
    };

    // Xử lý Xóa
    const remove = async (id: number) => {
        // Dùng confirm mặc định hoặc Custom Modal sau này
        if (!window.confirm("Bạn có chắc chắn muốn xoá PLO này không?")) return;

        try {
            await ploApi.deleteForAA(id);
            setItems(items.filter(i => i.id !== id));
        } catch {
            alert("Không thể xoá PLO (Có thể dữ liệu đang được sử dụng)");
        }
    };

    return (
        <div className="plo-page">
            <div className="plo-container">
                {/* ===== HEADER ===== */}
                <div className="plo-header">
                    <h1 className="plo-title">AA • Quản lý PLO</h1>
                    <p className="plo-subtitle">
                        Thiết lập chuẩn đầu ra (Program Learning Outcomes) cho chương trình đào tạo.
                    </p>
                </div>

                {/* Nút quay về trang Lecturer */}
                <button onClick={() => navigate("/aa")}
                        style={{
                            marginBottom: "1rem",
                            padding: "8px 16px",
                            backgroundColor: "#2c3e50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                >
                    ← Quay về
                </button>

                {/* ===== CREATE FORM (Form tạo mới) ===== */}
                <div className="plo-card">
                    <h3 className="card-title">✨ Tạo PLO mới</h3>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                PLO Code <span className="required">*</span>
                            </label>
                            <input
                                className="form-input"
                                placeholder="VD: PLO1, PLO2..."
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Chương trình (Program)</label>
                            <input
                                className="form-input"
                                placeholder="VD: SE, IA, GD..."
                                value={program}
                                onChange={(e) => setProgram(e.target.value)}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">
                                Mô tả chi tiết <span className="required">*</span>
                            </label>
                            <textarea
                                className="form-textarea"
                                placeholder="Mô tả năng lực sinh viên đạt được..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <button
                            className="btn-primary"
                            onClick={create}
                            disabled={submitting}
                        >
                            {submitting ? "Đang xử lý..." : "➕ Tạo PLO Mới"}
                        </button>
                    </div>
                    <Link to="/aa/mapping">
                        <button className="btn-secondary">
                            📊 Xem bảng Mapping CLO–PLO
                        </button>
                    </Link>
                </div>
                {/* ===== LIST (Danh sách hiển thị) ===== */}
                <div className="plo-card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #edf2f7" }}>
                        <h3 className="card-title" style={{ margin: 0, border: "none", padding: 0 }}>
                            📋 Danh sách PLO hiện tại
                        </h3>
                    </div>

                    {!loading && !error && items.length > 0 && (
                        <div className="table-responsive">
                            <table className="plo-table">
                                <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th style={{ width: '120px' }}>PLO Code</th>
                                    <th>Mô tả</th>
                                    <th style={{ width: '120px' }}>Program</th>
                                    <th style={{ width: '140px', textAlign: 'center' }}>Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map((p, idx) => (
                                    <tr key={p.id}>
                                        <td className="text-subtle">{idx + 1}</td>

                                        {/* Cột CODE */}
                                        <td>
                                            {editingId === p.id ? (
                                                <input
                                                    className="edit-input" // Class mới
                                                    value={editData.code}
                                                    onChange={(e) => setEditData({...editData, code: e.target.value})}
                                                />
                                            ) : (
                                                <span className="badge-code">{p.code}</span>
                                            )}
                                        </td>

                                        {/* Cột DESCRIPTION */}
                                        <td>
                                            {editingId === p.id ? (
                                                <textarea
                                                    className="edit-textarea" // Class mới
                                                    value={editData.description}
                                                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                                                />
                                            ) : (
                                                p.description
                                            )}
                                        </td>

                                        {/* Cột PROGRAM */}
                                        <td>
                                            {editingId === p.id ? (
                                                <input
                                                    className="edit-input" // Class mới
                                                    value={editData.program}
                                                    onChange={(e) => setEditData({...editData, program: e.target.value})}
                                                />
                                            ) : (
                                                <span style={{ fontWeight: 500 }}>{p.program || "-"}</span>
                                            )}
                                        </td>

                                        {/* Cột ACTIONS */}
                                        <td>
                                            {editingId === p.id ? (
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-save"
                                                        onClick={() => saveEdit(p.id)}
                                                    >
                                                        Lưu
                                                    </button>
                                                    <button
                                                        className="btn-cancel"
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        Huỷ
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        title="Chỉnh sửa"
                                                        onClick={() => startEdit(p)}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        title="Xóa chuẩn đầu ra"
                                                        onClick={() => remove(p.id)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && items.length === 0 && (
                        <div style={{ padding: "40px", textAlign: "center", color: "#718096" }}>
                            Chưa có dữ liệu PLO nào. Hãy tạo mới ở trên.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}