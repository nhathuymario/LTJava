import { useEffect, useState } from "react";
import { ploApi } from "../../services/plo";
import type { PLO } from "../../services/outcome";
import "../../assets/css/pages/aa_plo.css";

export default function AaPLOPage() {
    const [items, setItems] = useState<PLO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [program, setProgram] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<number | null>(null);

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

    const create = async () => {
        if (!code || !description) {
            alert("Code và mô tả là bắt buộc");
            return;
        }

        try {
            setSubmitting(true);
            const p = await ploApi.createForAA({ code, description, program });
            setItems((prev) => [...prev, p]);

            setCode("");
            setDescription("");
            setProgram("");
        } catch {
            alert("Có lỗi xảy ra khi tạo PLO");
        } finally {
            setSubmitting(false);
        }
    };

    const saveEdit = async (id: number) => {
        try {
            const updated = await ploApi.updateForAA(id, {
                code,
                description,
                program,
            });
            setItems(items.map(i => i.id === id ? updated : i));
            setEditingId(null);
        } catch {
            alert("Không thể cập nhật PLO");
        }
    };

    const remove = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xoá PLO này?")) return;
        try {
            await ploApi.deleteForAA(id);
            setItems(items.filter(i => i.id !== id));
        } catch {
            alert("Không thể xoá PLO");
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

                {/* ===== CREATE FORM ===== */}
                <div className="plo-card">
                    <h3 className="card-title">✨ Tạo PLO mới</h3>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                PLO Code <span className="required">*</span>
                            </label>
                            <input
                                className="form-input"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Chương trình (Program)</label>
                            <input
                                className="form-input"
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
                </div>

                {/* ===== LIST ===== */}
                <div className="plo-card" style={{ padding: 0 }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #edf2f7" }}>
                        <h3 className="card-title" style={{ margin: 0 }}>
                            📋 Danh sách PLO hiện tại
                        </h3>
                    </div>

                    {!loading && !error && items.length > 0 && (
                        <div className="table-responsive">
                            <table className="plo-table">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>PLO Code</th>
                                    <th>Mô tả</th>
                                    <th>Program</th>
                                    <th>Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map((p, idx) => (
                                    <tr key={p.id}>
                                        <td>{idx + 1}</td>

                                        <td>
                                            {editingId === p.id ? (
                                                <input
                                                    className="form-input"
                                                    value={code}
                                                    onChange={(e) => setCode(e.target.value)}
                                                />
                                            ) : (
                                                <span className="badge-code">{p.code}</span>
                                            )}
                                        </td>

                                        <td>
                                            {editingId === p.id ? (
                                                <textarea
                                                    className="form-textarea"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                />
                                            ) : (
                                                p.description
                                            )}
                                        </td>

                                        <td>
                                            {editingId === p.id ? (
                                                <input
                                                    className="form-input"
                                                    value={program}
                                                    onChange={(e) => setProgram(e.target.value)}
                                                />
                                            ) : (
                                                p.program || "-"
                                            )}
                                        </td>

                                        <td>
                                            {editingId === p.id ? (
                                                <>
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => saveEdit(p.id)}
                                                    >
                                                        Lưu
                                                    </button>
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        Huỷ
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => {
                                                            setEditingId(p.id);
                                                            setCode(p.code);
                                                            setDescription(p.description);
                                                            setProgram(p.program || "");
                                                        }}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        className="btn-danger"
                                                        onClick={() => remove(p.id)}
                                                    >
                                                        Xoá
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
