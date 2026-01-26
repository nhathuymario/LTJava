import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { hasRole } from "../../../services/auth"
import "../../../assets/css/pages/aa/aa-course-relations.css";
import { getAllCourses, type Course } from "../../../services/course"
import {api} from "../../../services/api"

export default function AaCourseRelationsPage() {
    const nav = useNavigate()
    const isAA = hasRole("AA")

    const [courses, setCourses] = useState<Course[]>([])
    const [courseId, setCourseId] = useState<number | "">("")
    const [prereq, setPrereq] = useState<number[]>([])
    const [parallel, setParallel] = useState<number[]>([])
    const [supp, setSupp] = useState<number[]>([])

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        ;(async () => {
            try {
                setLoading(true)
                setError("")
                const data = await getAllCourses()
                setCourses(data || [])
            } catch (e: any) {
                setError(e?.message || "Không tải được danh sách môn học")
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const options = useMemo(
        () => courses.map(c => ({ id: c.id, label: `${c.code} - ${c.name}` })),
        [courses]
    )

    const available = useMemo(() => {
        if (courseId === "") return options
        return options.filter(o => o.id !== courseId)
    }, [options, courseId])

    const toNumbers = (values: string[]) => values.map(v => Number(v)).filter(n => !Number.isNaN(n))

    const save = async () => {
        setError("")
        if (courseId === "") {
            setError("Vui lòng chọn môn học chính.")
            return
        }

        try {
            setSaving(true)
            await api.put("/aa/syllabus/courses/relations", {
                courseId,
                prerequisiteIds: prereq,
                parallelIds: parallel,
                supplementaryIds: supp,
            })
            nav("/aa", { replace: true })
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.response?.data || e?.message
            setError(typeof msg === "string" ? msg : "Lưu quan hệ học phần thất bại")
        } finally {
            setSaving(false)
        }
    }

    if (!isAA) return <div style={{ padding: 16 }}>❌ Bạn không có quyền (AA)</div>

    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">AA • Set tiên quyết / song hành / bổ trợ</h1>

                <div className="lec-card">
                    <div className="aa-rel-page">
                        {loading && <div className="aa-rel-loading">Đang tải...</div>}
                        {error && <div className="aa-rel-error">{error}</div>}

                        {!loading && (
                            <div className="aa-rel-form">
                                <div className="aa-rel-field">
                                    <span className="aa-rel-label">Môn học chính</span>
                                    <select
                                        className="aa-rel-select"
                                        value={courseId}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setCourseId(v ? Number(v) : "");
                                            setPrereq([]);
                                            setParallel([]);
                                            setSupp([]);
                                        }}
                                    >
                                        <option value="">-- Chọn môn học --</option>
                                        {options.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="aa-rel-field">
                                    <span className="aa-rel-label">Tiên quyết</span>
                                    <select
                                        className="aa-rel-select"
                                        multiple
                                        value={prereq.map(String)}
                                        onChange={(e) =>
                                            setPrereq(
                                                toNumbers(Array.from(e.target.selectedOptions).map((o) => o.value))
                                            )
                                        }
                                    >
                                        {available.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="aa-rel-field">
                                    <span className="aa-rel-label">Song hành</span>
                                    <select
                                        className="aa-rel-select"
                                        multiple
                                        value={parallel.map(String)}
                                        onChange={(e) =>
                                            setParallel(
                                                toNumbers(Array.from(e.target.selectedOptions).map((o) => o.value))
                                            )
                                        }
                                    >
                                        {available.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="aa-rel-field">
                                    <span className="aa-rel-label">Bổ trợ</span>
                                    <select
                                        className="aa-rel-select"
                                        multiple
                                        value={supp.map(String)}
                                        onChange={(e) =>
                                            setSupp(
                                                toNumbers(Array.from(e.target.selectedOptions).map((o) => o.value))
                                            )
                                        }
                                    >
                                        {available.map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="aa-rel-actions">
                                    <button
                                        className="aa-rel-btn aa-rel-btn-cancel"
                                        type="button"
                                        onClick={() => nav("/aa")}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="aa-rel-btn aa-rel-btn-save"
                                        onClick={save}
                                        disabled={saving}
                                    >
                                        {saving ? "Đang lưu..." : "Lưu"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

}
