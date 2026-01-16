import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { hasRole } from "../../../services/auth"
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
        <>

            <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
                <h2 style={{ marginTop: 0 }}>AA - Set tiên quyết / song hành / bổ trợ</h2>

                {loading && <div>Đang tải...</div>}
                {error && <div style={{ color: "#c0392b", marginTop: 12 }}>{error}</div>}

                {!loading && (
                    <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Môn học chính</span>
                            <select
                                value={courseId}
                                onChange={(e) => {
                                    const v = e.target.value
                                    setCourseId(v ? Number(v) : "")
                                    setPrereq([])
                                    setParallel([])
                                    setSupp([])
                                }}
                            >
                                <option value="">-- Chọn môn học --</option>
                                {options.map(o => (
                                    <option key={o.id} value={o.id}>{o.label}</option>
                                ))}
                            </select>
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Tiên quyết</span>
                            <select
                                multiple
                                size={6}
                                value={prereq.map(String)}
                                onChange={(e) => setPrereq(toNumbers(Array.from(e.target.selectedOptions).map(o => o.value)))}
                            >
                                {available.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                            </select>
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Song hành</span>
                            <select
                                multiple
                                size={6}
                                value={parallel.map(String)}
                                onChange={(e) => setParallel(toNumbers(Array.from(e.target.selectedOptions).map(o => o.value)))}
                            >
                                {available.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                            </select>
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Bổ trợ</span>
                            <select
                                multiple
                                size={6}
                                value={supp.map(String)}
                                onChange={(e) => setSupp(toNumbers(Array.from(e.target.selectedOptions).map(o => o.value)))}
                            >
                                {available.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                            </select>
                        </label>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={save} disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu"}
                            </button>
                            <button onClick={() => nav("/aa")} type="button">Hủy</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
