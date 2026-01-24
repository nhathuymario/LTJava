import { useEffect, useState } from "react";
import { cloApi } from "../../services/clo";
import type {CLO, CLOPLO, PLO} from "../../services/outcome";
import "../../assets/css/pages/lecturer_clo.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function LecturerCLOPage() {
    const [syllabusId, setSyllabusId] = useState<number | "">("");
    const [clos, setClos] = useState<CLO[]>([]);
    const [plos, setPlos] = useState<PLO[]>([]);
    const [mappings, setMappings] = useState<CLOPLO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();


    /* ===== CREATE FORM ===== */
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    /* ===== INLINE EDIT (GIỐNG PLO) ===== */
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({ code: "", description: "" });

    /* ===== MAPPING ===== */
    const [selectedPloId, setSelectedPloId] = useState<number | "">("");
    const sortedClos = [...clos].sort((a, b) => a.code.localeCompare(b.code));
    const sortedPlos = [...plos].sort((a, b) => a.code.localeCompare(b.code));


    /* ====================== LOAD DATA ====================== */
    const loadData = async () => {
        if (syllabusId === "") return;

        setLoading(true);
        setError(null);
        try {
            const [cloData, ploData, mapData] = await Promise.all([
                cloApi.getCLOBySyllabus(Number(syllabusId)),
                cloApi.getAllPLO(),
                cloApi.getMappingBySyllabus(Number(syllabusId)),
            ]);
            setClos(cloData);
            setPlos(ploData);
            setMappings(mapData);
        } catch {
            setError("Không tải được dữ liệu CLO / PLO");
        } finally {
            setLoading(false);
        }
    };
    const isMapped = (cloId: number, ploId: number): boolean =>
        mappings.some(
            (m) => m.clo.id === cloId && m.plo.id === ploId
        );

    const exportMappingPDF = () => {
        const doc = new jsPDF("landscape");

        /* ===== LẤY TÊN GIẢNG VIÊN TỪ JWT (ĐÚNG THỜI ĐIỂM) ===== */
        let exportedBy = "Unknown Lecturer";

        try {
            const token = localStorage.getItem("token");
            if (token) {
                const decoded: any = jwtDecode(token);
                exportedBy =
                    decoded.full_name ||
                    decoded.name ||
                    decoded.username ||
                    decoded.sub ||
                    "Unknown Lecturer";
            }
        } catch (err) {
            console.error("JWT decode error:", err);
        }

        /* ===== SORT DATA ===== */
        const sortedClos = [...clos].sort((a, b) => a.code.localeCompare(b.code));
        const sortedPlos = [...plos].sort((a, b) => a.code.localeCompare(b.code));

        /* ===== HEADER ===== */
        doc.setFontSize(18);
        doc.text("CLO – PLO MAPPING REPORT", 14, 18);

        doc.setFontSize(11);
        doc.text(`Syllabus ID: ${syllabusId}`, 14, 26);
        doc.text(`Exported date: ${new Date().toLocaleDateString()}`, 14, 32);
        doc.text(`Exported by: ${exportedBy}`, 14, 38);

        /* ===== TABLE DATA ===== */
        const head = [
            ["CLO \\ PLO", ...sortedPlos.map((p) => p.code)],
        ];

        const body = sortedClos.map((c) => [
            c.code,
            ...sortedPlos.map((p) => {
                const m = mappings.find(
                    (x) => x.clo.id === c.id && x.plo.id === p.id
                );
                if (!m) return "";
                if (m.status === "APPROVED") return "APPROVED";
                if (m.status === "REJECTED") return "REJECTED";
                return "PENDING";
            }),
        ]);

        autoTable(doc, {
            head,
            body,
            startY: 45,
            styles: {
                halign: "center",
                valign: "middle",
                fontSize: 10,
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: "bold",
            },
            didParseCell: function (data) {
                if (data.section === "body") {
                    if (data.cell.text[0] === "APPROVED") {
                        data.cell.styles.textColor = [0, 128, 0];
                    }
                    if (data.cell.text[0] === "REJECTED") {
                        data.cell.styles.textColor = [200, 0, 0];
                    }
                }
            },
        });

        doc.save("CLO_PLO_Mapping_Report.pdf");
    };



    useEffect(() => {
        loadData();
    }, [syllabusId]);

    useEffect(() => {
        if (clos.length > 0 && plos.length > 0) {
            console.log("Test mapping:", isMapped(clos[0].id, plos[0].id));
        }
    }, [clos, plos]);

    /* ====================== CREATE CLO ====================== */
    const createCLO = async () => {
        if (!code || !description || syllabusId === "") {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            setSubmitting(true);
            const clo = await cloApi.createCLO(Number(syllabusId), { code, description });
            setClos((prev) => [...prev, clo]);
            setCode("");
            setDescription("");
        } catch {
            alert("Tạo CLO thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    /* ====================== INLINE EDIT ====================== */
    const startEdit = (c: CLO) => {
        setEditingId(c.id);
        setEditData({ code: c.code, description: c.description });
    };

    const saveEdit = async (id: number) => {
        try {
            const updated = await cloApi.updateCLO(id, editData);
            setClos((prev) => prev.map((c) => (c.id === id ? updated : c)));
            setEditingId(null);
        } catch {
            alert("Không thể cập nhật CLO");
        }
    };

    const remove = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xoá CLO này không?")) return;

        try {
            await cloApi.deleteCLO(id);
            setClos((prev) => prev.filter((c) => c.id !== id));
        } catch {
            alert("Không thể xoá CLO");
        }
    };

    /* ====================== MAP CLO ↔ PLO ====================== */
    const mapCloPlo = async (cloId: number) => {
        if (selectedPloId === "") {
            alert("Chọn PLO để map");
            return;
        }

        try {
            await cloApi.mapCloPlo({ cloId, ploId: Number(selectedPloId) });
            alert("Mapping thành công!");
            loadData();
            setSelectedPloId("");
        } catch {
            alert("Map CLO – PLO thất bại");
        }
    };

    const getMapping = (cloId: number, ploId: number): CLOPLO | undefined =>
        mappings.find(
            (m) => m.clo.id === cloId && m.plo.id === ploId
        );

    const renderStatusSymbol = (m?: CLOPLO) => {
        if (!m) return "";
        if (m.status === "APPROVED") return "✓";
        if (m.status === "REJECTED") return "✗";
        return "∘"; // PENDING
    };


    return (
        <div className="clo-page">
            <div className="clo-container">
                {/* ===== HEADER ===== */}
                <div className="clo-header">
                    <h1 className="clo-title">Lecturer • Quản lý CLO</h1>
                    <p className="clo-subtitle">
                        Xây dựng chuẩn đầu ra chi tiết cho học phần và ánh xạ với chuẩn đầu ra chương trình.
                    </p>
                </div>

                {/* Nút quay về trang Lecturer */}
                <button onClick={() => navigate("/lecturer")}
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

                {/* ===== SELECT SYLLABUS ===== */}
                <div className="clo-card" style={{ maxWidth: "400px" }}>
                    <div className="form-group">
                        <label className="form-label">
                            Chọn Mã Syllabus <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Nhập ID Syllabus"
                            value={syllabusId}
                            onChange={(e) =>
                                setSyllabusId(e.target.value === "" ? "" : Number(e.target.value))
                            }
                        />
                    </div>
                </div>

                {/* ===== CREATE CLO ===== */}
                <div className="clo-card">
                    <h3 className="clo-section-title">✨ Tạo CLO mới</h3>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                Mã CLO <span className="required">*</span>
                            </label>
                            <input
                                className="form-input"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">
                                Mô tả chi tiết CLO <span className="required">*</span>
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
                            onClick={createCLO}
                            disabled={submitting || syllabusId === ""}
                        >
                            {submitting ? "Đang tạo..." : "➕ Tạo CLO"}
                        </button>
                    </div>
                </div>

                {/* ===== LIST CLO ===== */}
                <div className="clo-card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #edf2f7" }}>
                        <h3 className="clo-section-title" style={{ margin: 0 }}>
                            📋 Danh sách CLO của học phần
                        </h3>
                    </div>

                    {/* ===== CLO – PLO MAPPING TABLE ===== */}
                    {!loading && clos.length > 0 && plos.length > 0 && (
                        <div className="clo-card">
                            <h3 className="clo-section-title">📊 Ma trận CLO – PLO</h3>

                            <div style={{ textAlign: "right", marginBottom: "12px" }}>
                                <button className="btn-secondary" onClick={exportMappingPDF}>
                                    📥 Xuất báo cáo Mapping
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="clo-table mapping-table">
                                    <thead>
                                    <tr>
                                        <th>CLO \\ PLO</th>
                                        {sortedPlos.map((p) => (
                                            <th key={p.id}>{p.code}</th>
                                        ))}
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {sortedClos.map((c) => (
                                        <tr key={c.id}>
                                            <td>
                                                <span className="badge-code">{c.code}</span>
                                            </td>

                                            {sortedPlos.map((p) => {
                                                const m = getMapping(c.id, p.id);

                                                return (
                                                    <td
                                                        key={p.id}
                                                        className={
                                                            m?.status === "APPROVED"
                                                                ? "mapped-cell approved"
                                                                : m?.status === "REJECTED"
                                                                    ? "mapped-cell rejected"
                                                                    : m
                                                                        ? "mapped-cell pending"
                                                                        : "unmapped-cell"
                                                        }
                                                        title={m ? `Status: ${m.status}` : ""}
                                                    >
                                                        {renderStatusSymbol(m)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}



                    {/* ===== STATE MESSAGE ===== */}
                    <div style={{ padding: "40px" }}>
                        {loading && (
                            <div className="text-center text-subtle">
                                ⏳ Đang tải dữ liệu học phần...
                            </div>
                        )}

                        {error && (
                            <div className="text-center error">
                                {error}
                            </div>
                        )}

                        {!loading && !error && syllabusId === "" && (
                            <div className="text-center text-subtle">
                                Vui lòng nhập Syllabus ID để xem danh sách.
                            </div>
                        )}

                        {!loading && !error && syllabusId !== "" && clos.length === 0 && (
                            <div className="text-center text-subtle">
                                Học phần này chưa có CLO nào.
                            </div>
                        )}
                    </div>

                    {!loading && clos.length > 0 && (
                        <div className="table-responsive">
                            <table className="clo-table">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>CLO Code</th>
                                    <th>Mô tả</th>
                                    <th>Mapping PLO</th>
                                    <th style={{ textAlign: "center" }}>Hành động</th>
                                </tr>
                                </thead>

                                <tbody>
                                {clos.map((c, idx) => (
                                    <tr key={c.id}>
                                        <td className="text-subtle">{idx + 1}</td>

                                        <td>
                                            {editingId === c.id ? (
                                                <input
                                                    className="edit-input"
                                                    value={editData.code}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, code: e.target.value })
                                                    }
                                                />
                                            ) : (
                                                <span className="badge-code">{c.code}</span>
                                            )}
                                        </td>

                                        <td>
                                            {editingId === c.id ? (
                                                <textarea
                                                    className="edit-textarea"
                                                    value={editData.description}
                                                    onChange={(e) =>
                                                        setEditData({
                                                            ...editData,
                                                            description: e.target.value,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                c.description
                                            )}
                                        </td>

                                        <td>
                                            <select
                                                className="form-input"
                                                value={selectedPloId}
                                                onChange={(e) =>
                                                    setSelectedPloId(
                                                        e.target.value === "" ? "" : Number(e.target.value)
                                                    )
                                                }
                                                disabled={editingId === c.id}
                                            >
                                                <option value="">-- Chọn PLO --</option>
                                                {plos.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.code}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => mapCloPlo(c.id)}
                                                disabled={editingId === c.id}
                                            >
                                                Link PLO
                                            </button>
                                        </td>

                                        <td>
                                            {editingId === c.id ? (
                                                <div className="action-buttons">
                                                    <button className="btn-save" onClick={() => saveEdit(c.id)}>
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
                                                        onClick={() => startEdit(c)}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => remove(c.id)}
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
                </div>
            </div>
        </div>
    );
}
