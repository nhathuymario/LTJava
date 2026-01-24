import { useEffect, useMemo, useState } from "react";
import { aaOutcomeApi, type MappingStatus } from "../../../services/aaOutcome";
import type { CLO, PLO, CLOPLO } from "../../../services/outcome";
import "../../../assets/css/pages/lecturer_clo.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

export default function AAMappingPage() {
    const [syllabusId, setSyllabusId] = useState<number | "">("");
    const [clos, setClos] = useState<CLO[]>([]);
    const [plos, setPlos] = useState<PLO[]>([]);
    const [mappings, setMappings] = useState<CLOPLO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const plosSorted = useMemo(
        () => [...plos].sort((a, b) => a.code.localeCompare(b.code)),
        [plos]
    );

    const loadData = async () => {
        if (syllabusId === "") return;

        setLoading(true);
        setError(null);
        try {
            const [cloData, ploData, mapData] = await Promise.all([
                aaOutcomeApi.getCLOBySyllabus(Number(syllabusId)),
                aaOutcomeApi.getAllPLO(),
                aaOutcomeApi.getMappingBySyllabus(Number(syllabusId)),
            ]);

            setClos(cloData);
            setPlos(ploData);
            setMappings(mapData);
        } catch {
            setError("Không tải được dữ liệu AA mapping");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [syllabusId]);

    const getMapping = (cloId: number, ploId: number) =>
        mappings.find((m) => m.clo.id === cloId && m.plo.id === ploId);

    const isMapped = (cloId: number, ploId: number) =>
        mappings.some((m) => m.clo.id === cloId && m.plo.id === ploId);

    // 1) AA chỉnh mapping: click cell để map/unmap
    const toggleMapping = async (cloId: number, ploId: number) => {
        try {
            if (isMapped(cloId, ploId)) {
                await aaOutcomeApi.unmapCloPlo({ cloId, ploId });
            } else {
                await aaOutcomeApi.mapCloPlo({ cloId, ploId });
            }
            await loadData();
        } catch {
            alert("Không thể cập nhật mapping (map/unmap).");
        }
    };

    // 3) AA duyệt: approve/reject (chỉ khi đã mapped)
    const setStatus = async (cloId: number, ploId: number, status: MappingStatus) => {
        try {
            await aaOutcomeApi.updateMappingStatus({ cloId, ploId, status });
            await loadData();
        } catch {
            alert("Không thể cập nhật trạng thái duyệt.");
        }
    };

    const renderStatusSymbol = (m?: CLOPLO) => {
        if (!m) return "";
        if (m.status === "APPROVED") return "✔";
        if (m.status === "REJECTED") return "✖";
        return "•"; // PENDING hoặc null
    };

    // 2) AA xuất báo cáo tổng hợp
    // - Export dạng audit list: mỗi dòng là 1 mapping + status
    const exportAAPDF = () => {
        const doc = new jsPDF("landscape");

        /* ===== HEADER ===== */
        doc.setFontSize(18);
        doc.text("CLO – PLO MAPPING REPORT", 14, 18);

        doc.setFontSize(11);
        doc.text(`Syllabus ID: ${syllabusId}`, 14, 26);
        doc.text(`Exported date: ${new Date().toLocaleDateString()}`, 14, 32);
        doc.text(`Role: Academic Advisor (AA)`, 14, 38);

        /* ===== SORT ===== */
        const sortedClos = [...clos].sort((a, b) => a.code.localeCompare(b.code));
        const sortedPlos = [...plos].sort((a, b) => a.code.localeCompare(b.code));

        /* ===== TABLE HEADER ===== */
        const head = [
            ["CLO \\ PLO", ...sortedPlos.map((p) => p.code)],
        ];

        /* ===== TABLE BODY ===== */
        const body = sortedClos.map((c) => [
            c.code,
            ...sortedPlos.map((p) => {
                const m = mappings.find(
                    (x) => x.clo.id === c.id && x.plo.id === p.id
                );
                if (!m) return "";
                return m.status || "";
            }),
        ]);

        /* ===== TABLE ===== */
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
                fillColor: [39, 174, 96],
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

        doc.save("AA_CLO_PLO_Report.pdf");
    };


    return (
        <div className="clo-page">
            <div className="clo-container">
                <div className="clo-header">
                    <h1 className="clo-title">Academic Affairs • CLO–PLO Mapping</h1>
                    <p className="clo-subtitle">
                        AA có thể chỉnh mapping, xuất báo cáo và duyệt trạng thái APPROVED/REJECTED.
                    </p>
                </div>

                {/* Nút quay về trang Lecturer */}
                <button onClick={() => navigate("/aa/plo")}
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

                <div className="clo-card" style={{ maxWidth: "420px" }}>
                    <div className="form-group">
                        <label className="form-label">
                            Syllabus ID <span className="required">*</span>
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

                <div className="clo-card">
                    {loading && <div className="text-center text-subtle">⏳ Đang tải dữ liệu...</div>}
                    {error && <div className="text-center error">{error}</div>}
                    {!loading && !error && syllabusId === "" && (
                        <div className="text-center text-subtle">Nhập Syllabus ID để xem dữ liệu.</div>
                    )}
                </div>

                {!loading && !error && syllabusId !== "" && clos.length > 0 && plosSorted.length > 0 && (
                    <div className="clo-card">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                                flexWrap: "wrap",
                            }}
                        >
                            <h3 className="clo-section-title" style={{ margin: 0 }}>
                                📊 Ma trận CLO – PLO
                            </h3>

                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="btn-secondary" onClick={exportAAPDF}>
                                    Xuất báo cáo tổng hợp
                                </button>
                            </div>
                        </div>

                        <div className="table-responsive" style={{ marginTop: 12 }}>
                            <table className="clo-table mapping-table">
                                <thead>
                                <tr>
                                    <th>CLO \\ PLO</th>
                                    {plosSorted.map((p) => (
                                        <th key={p.id}>{p.code}</th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                {clos.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <span className="badge-code">{c.code}</span>
                                        </td>

                                        {plosSorted.map((p) => {
                                            const m = getMapping(c.id, p.id);
                                            const mapped = !!m;

                                            return (
                                                <td
                                                    key={p.id}
                                                    className={mapped ? "mapped-cell" : "unmapped-cell"}
                                                    onClick={() => toggleMapping(c.id, p.id)}
                                                    title="Click: map/unmap. Nếu đã map thì dùng nút A/R để duyệt."
                                                >
                                                    {mapped ? (
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                gap: 6,
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <span className="aa-status">{renderStatusSymbol(m)}</span>

                                                            <button
                                                                className="aa-btn aa-approve"
                                                                onClick={() => setStatus(c.id, p.id, "APPROVED")}
                                                                title="Approve"
                                                            >
                                                                A
                                                            </button>

                                                            <button
                                                                className="aa-btn aa-reject"
                                                                onClick={() => setStatus(c.id, p.id, "REJECTED")}
                                                                title="Reject"
                                                            >
                                                                R
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        ""
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="text-subtle" style={{ marginTop: 10 }}>
                            Ghi chú: ký hiệu “•” là PENDING, “✔” là APPROVED, “✖” là REJECTED.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
