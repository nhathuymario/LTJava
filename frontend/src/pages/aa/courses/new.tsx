import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../../assets/css/pages/lecturer.css"
import { hasRole } from "../../../services/auth"
import { createCourse } from "../../../services/course"

type FormState = {
    code: string
    name: string
    credits: number
    department: string
    lecturerUsername: string // ✅ gán bằng USER (username = CCCD)
}

export default function AACreateCoursePage() {
    const nav = useNavigate()
    const isAA = hasRole("AA")

    const [form, setForm] = useState<FormState>({
        code: "",
        name: "",
        credits: 3,
        department: "",
        lecturerUsername: "",
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isAA) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">
                        <div className="lec-empty">❌ Bạn không có quyền (AA)</div>
                    </div>
                </div>
            </div>
        )
    }

    const onChange = <K extends keyof FormState>(k: K, v: FormState[K]) => {
        setForm((p) => ({ ...p, [k]: v }))
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!form.code.trim() || !form.name.trim()) {
            setError("Vui lòng nhập Code và Tên môn học.")
            return
        }

        if (!form.lecturerUsername.trim()) {
            setError("Vui lòng nhập Username (CCCD) của giảng viên.")
            return
        }

        try {
            setLoading(true)

            await createCourse({
                code: form.code.trim(),
                name: form.name.trim(),
                credits: Number(form.credits) || 0,
                department: form.department.trim(),
                lecturerUsername: form.lecturerUsername.trim(), // ✅ USER
            })

            nav("/aa", { replace: true })
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Tạo môn học thất bại"
            setError(typeof msg === "string" ? msg : "Tạo môn học thất bại")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="lec-card">
                    <button className="lec-link" onClick={() => nav("/aa")}>
                        ← Quay lại
                    </button>

                    <h2 className="lec-section-title">AA - Tạo môn học</h2>

                    {error && <div className="lec-empty">❌ {error}</div>}

                    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Course Code</span>
                            <input
                                className="lec-search"
                                value={form.code}
                                onChange={(e) => onChange("code", e.target.value)}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Course Name</span>
                            <input
                                className="lec-search"
                                value={form.name}
                                onChange={(e) => onChange("name", e.target.value)}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Credits</span>
                            <input
                                className="lec-search"
                                type="number"
                                min={0}
                                value={form.credits}
                                onChange={(e) =>
                                    onChange("credits", Number(e.target.value))
                                }
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Department</span>
                            <input
                                className="lec-search"
                                value={form.department}
                                onChange={(e) =>
                                    onChange("department", e.target.value)
                                }
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Lecturer Username (CCCD)</span>
                            <input
                                className="lec-search"
                                value={form.lecturerUsername}
                                onChange={(e) =>
                                    onChange("lecturerUsername", e.target.value)
                                }
                                placeholder="VD: 012345678999"
                            />
                        </label>

                        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                            <button className="btn-primary" type="submit" disabled={loading}>
                                {loading ? "Đang tạo..." : "✅ Tạo môn học"}
                            </button>
                            <button className="btn-outline" type="button" onClick={() => nav("/aa")}>
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
