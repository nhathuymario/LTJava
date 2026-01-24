import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/assign/assign_manage.css";
import { getToken, hasRole } from "../../../services/auth";
import { reviewApi, type ReviewAssignment, type ReviewStatus } from "../../../services/review";

export default function HodReviewManagePage() {
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<ReviewAssignment[]>([]);

    // filters
    const [status, setStatus] = useState<ReviewStatus | "">("");
    const [reviewer, setReviewer] = useState("");
    const [courseId] = useState("");
    const [syllabusId] = useState("");
    const [fromDue, setFromDue] = useState("");
    const [toDue, setToDue] = useState("");

    const load = async () => {
        try {
            setError(null);
            setLoading(true);

            const params: any = {};
            if (status) params.status = status;
            if (reviewer.trim()) params.reviewer = reviewer.trim();
            if (courseId.trim()) params.courseId = Number(courseId);
            if (syllabusId.trim()) params.syllabusId = Number(syllabusId);
            if (fromDue) params.fromDue = fromDue.length === 16 ? `${fromDue}:00` : fromDue;
            if (toDue) params.toDue = toDue.length === 16 ? `${toDue}:00` : toDue;

            const data = await reviewApi.listAll(params);
            setRows(data || []);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Không tải được danh sách assignment");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = getToken();
        if (!token) { setError("Bạn chưa đăng nhập."); setLoading(false); return; }
        if (!hasRole("HOD")) { setError("Bạn không có quyền (HOD)."); setLoading(false); return; }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onCancel = async (id: number) => {
        if (!confirm("Huỷ assignment này?")) return;
        try {
            await reviewApi.cancel(id);
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Huỷ thất bại");
        }
    };

    return (
        <div className="lec-page hod-manage">
            <div className="lec-container">
                <h1 className="lec-title">HoD • Quản lý Assignments</h1>

                <div className="lec-card">
                    <div className="manage-toolbar">
                        <button className="lec-btn" onClick={() => nav("/hod/collab")}>
                            ← Quay lại
                        </button>

                        <select
                            className="lec-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                        >
                            <option value="">ALL</option>
                            <option value="ASSIGNED">ASSIGNED</option>
                            <option value="IN_REVIEW">IN_REVIEW</option>
                            <option value="DONE">DONE</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>

                        <input
                            className="lec-search manage-reviewer"
                            placeholder="reviewer username/cccd"
                            value={reviewer}
                            onChange={(e) => setReviewer(e.target.value)}
                        />

                        <input
                            className="lec-select manage-dt"
                            type="datetime-local"
                            value={fromDue}
                            onChange={(e) => setFromDue(e.target.value)}
                        />

                        <input
                            className="lec-select manage-dt"
                            type="datetime-local"
                            value={toDue}
                            onChange={(e) => setToDue(e.target.value)}
                        />

                        <button className="lec-btn manage-filter" onClick={load}>
                            Lọc
                        </button>
                    </div>

                    {error && <div className="lec-empty">❌ {error}</div>}

                    {loading ? (
                        <div className="empty">Đang tải...</div>
                    ) : rows.length === 0 ? (
                        <div className="empty">Không có assignment.</div>
                    ) : (
                        <div className="manage-table-wrap">
                            <table className="manage-table">
                                <thead>
                                <tr>
                                    <th style={{ width: 80 }}>ID</th>
                                    <th style={{ width: 180 }}>Reviewer</th>
                                    <th style={{ width: 140 }}>Status</th>
                                    <th>Syllabus</th>
                                    <th style={{ width: 200 }}>Due</th>
                                    <th style={{ width: 120, textAlign: "right" }}>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {rows.map((a) => {
                                    const st = (a.status || "").toLowerCase();
                                    const badgeCls =
                                        st === "assigned"
                                            ? "assigned"
                                            : st === "in_review"
                                                ? "inreview"
                                                : st === "done"
                                                    ? "done"
                                                    : "cancelled";

                                    return (
                                        <tr key={a.id}>
                                            <td>#{a.id}</td>
                                            <td>{a.reviewer?.username || "UNKNOWN"}</td>
                                            <td>
                                                <span className={`badge ${badgeCls}`}>{a.status}</span>
                                            </td>
                                            <td>
                                                <div className="manage-syllabus">
                                                    <div className="manage-syllabus-title">
                                                        {a.syllabus?.title || "(no title)"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="manage-due">{a.dueAt}</td>
                                            <td>
                                                <div className="actions">
                                                    <button
                                                        className="btn-cancel"
                                                        disabled={a.status === "CANCELLED"}
                                                        onClick={() => onCancel(a.id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}
