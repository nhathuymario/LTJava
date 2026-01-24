import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import "../../../assets/css/pages/outcomes/outcome.css";
import {
    getCloPloMatrix,
    lecturerCreateClo,
    lecturerDeleteClo,
    lecturerListClos,
    lecturerUpdateClo,
    saveCloPloMatrix,
    type CloDto,
    type MatrixCellDto,
    type PloDto,
} from "../../../services/outcomes"
import { downloadSyllabusPdfBlob, exportSyllabusPdf, openPdfBlob } from "../../../services/pdf"

type Tab = "CLO" | "MATRIX" | "PDF"

export default function LecturerCloPloPage() {
    const { id } = useParams()
    const syllabusId = Number(id)

    const [tab, setTab] = useState<Tab>("CLO")

    const [scopeKey, setScopeKey] = useState("KTPM_2025")

    const [clos, setClos] = useState<CloDto[]>([])
    const [plos, setPlos] = useState<PloDto[]>([])
    const [cells, setCells] = useState<MatrixCellDto[]>([])

    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [savedMsg, setSavedMsg] = useState<string | null>(null)

    // create CLO form
    const [code, setCode] = useState("")
    const [description, setDescription] = useState("")
    const [domain, setDomain] = useState("")
    const [weight, setWeight] = useState<string>("")

    const cellMap = useMemo(() => {
        const m = new Map<string, number | null | undefined>()
        for (const c of cells) m.set(`${c.cloId}_${c.ploId}`, c.level)
        return m
    }, [cells])

    async function loadClos() {
        const data = await lecturerListClos(syllabusId)
        setClos(data)
    }

    async function loadMatrix() {
        const data = await getCloPloMatrix(syllabusId, scopeKey)
        setPlos(data.plos)
        setClos(data.clos) // đồng bộ CLO theo backend
        setCells(data.cells)
    }

    async function init() {
        setLoading(true)
        setErr(null)
        try {
            await loadClos()
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Load CLO failed")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!Number.isFinite(syllabusId) || syllabusId <= 0) return
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [syllabusId])

    function cycleLevel(current?: number | null) {
        // 0/empty -> 1 -> 2 -> 3 -> empty
        if (current == null) return 1
        if (current === 1) return 2
        if (current === 2) return 3
        return null
    }

    function toggleCell(cloId: number, ploId: number) {
        setSavedMsg(null)
        setCells((prev) => {
            const cur = prev.find((x) => x.cloId === cloId && x.ploId === ploId)
            const nextLevel = cycleLevel(cur?.level ?? null)

            if (nextLevel == null) {
                return prev.filter((x) => !(x.cloId === cloId && x.ploId === ploId))
            }

            if (cur) {
                return prev.map((x) =>
                    x.cloId === cloId && x.ploId === ploId
                        ? { ...x, level: nextLevel }
                        : x
                )
            }

            return [...prev, { cloId, ploId, level: nextLevel }]
        })
    }


    async function onCreateClo() {
        if (!code.trim() || !description.trim()) return
        setLoading(true)
        setErr(null)
        try {
            await lecturerCreateClo(syllabusId, {
                code: code.trim(),
                description: description.trim(),
                domain: domain.trim() || null,
                weight: weight.trim() ? Number(weight) : null,
                active: true,
            })
            setCode("")
            setDescription("")
            setDomain("")
            setWeight("")
            await loadClos()
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Create CLO failed")
        } finally {
            setLoading(false)
        }
    }

    async function onUpdateClo(cloId: number, patch: Partial<CloDto>) {
        const cur = clos.find((x) => x.id === cloId)
        if (!cur) return
        setLoading(true)
        setErr(null)
        try {
            await lecturerUpdateClo(cloId, {
                code: patch.code ?? cur.code,
                description: patch.description ?? cur.description,
                domain: patch.domain ?? cur.domain ?? null,
                weight: patch.weight ?? cur.weight ?? null,
                active: patch.active ?? cur.active,
            })
            await loadClos()
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Update CLO failed")
        } finally {
            setLoading(false)
        }
    }

    async function onDeleteClo(cloId: number) {
        if (!confirm("Xóa CLO này?")) return
        setLoading(true)
        setErr(null)
        try {
            await lecturerDeleteClo(cloId)
            // xóa mapping cell liên quan
            setCells((prev) => prev.filter((c) => c.cloId !== cloId))
            await loadClos()
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Delete CLO failed")
        } finally {
            setLoading(false)
        }
    }

    async function onLoadMatrixClick() {
        setLoading(true)
        setErr(null)
        try {
            await loadMatrix()
            setTab("MATRIX")
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Load matrix failed")
        } finally {
            setLoading(false)
        }
    }

    async function onSaveMatrix() {
        setLoading(true)
        setErr(null)
        setSavedMsg(null)
        try {
            await saveCloPloMatrix(syllabusId, { scopeKey: scopeKey.trim(), cells })
            setSavedMsg("Saved.")
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Save matrix failed")
        } finally {
            setLoading(false)
        }
    }

    async function onExportPdf() {
        setLoading(true)
        setErr(null)
        try {
            await exportSyllabusPdf(syllabusId, scopeKey)
            const blob = await downloadSyllabusPdfBlob(syllabusId)
            openPdfBlob(blob, `syllabus-${syllabusId}.pdf`)
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Export PDF failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">Lecturer • CLO / PLO Mapping</h1>

                <div className="lec-card">
                    <div className="manage-toolbar">
                        <div className="outcome-tabs">
                            <button className={`lec-btn ${tab === "CLO" ? "is-active" : ""}`} onClick={() => setTab("CLO")}>
                                CLO
                            </button>

                            <button
                                className={`lec-btn ${tab === "MATRIX" ? "is-active" : ""}`}
                                onClick={onLoadMatrixClick}
                                disabled={loading || !scopeKey.trim()}
                            >
                                Load Matrix
                            </button>

                            <button className={`lec-btn ${tab === "PDF" ? "is-active" : ""}`} onClick={() => setTab("PDF")}>
                                PDF
                            </button>
                        </div>

                        <input
                            className="lec-search outcome-scope"
                            value={scopeKey}
                            onChange={(e) => setScopeKey(e.target.value)}
                            placeholder="scopeKey (vd: KTPM_2025)"
                        />

                        {tab === "MATRIX" && (
                            <button className="lec-btn" disabled={loading} onClick={onSaveMatrix}>
                                Save Mapping
                            </button>
                        )}
                    </div>

                    {err && <div className="outcome-error">{err}</div>}
                    {savedMsg && <div className="outcome-success">{savedMsg}</div>}

                    {/* ===== TAB CLO ===== */}
                    {tab === "CLO" && (
                        <>
                            <div className="outcome-form-grid-clo">
                                <input className="lec-search" value={code} onChange={(e) => setCode(e.target.value)} placeholder="CLO1" />
                                <input className="lec-search" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả CLO" />
                                <input className="lec-search" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="domain (opt)" />
                                <input className="lec-search" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="weight" />
                                <button className="lec-btn" disabled={loading || !code.trim() || !description.trim()} onClick={onCreateClo}>
                                    + Add
                                </button>
                            </div>

                            <div className="outcome-table-wrap">
                                <table className="lec-table">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Code</th>
                                        <th>Description</th>
                                        <th>Domain</th>
                                        <th>Weight</th>
                                        <th>Active</th>
                                        <th style={{ width: 180 }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {clos.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.id}</td>
                                            <td>
                                                <input className="lec-search" defaultValue={c.code} onBlur={(e) => onUpdateClo(c.id, { code: e.target.value })} />
                                            </td>
                                            <td>
                                                <input
                                                    className="lec-search"
                                                    defaultValue={c.description}
                                                    onBlur={(e) => onUpdateClo(c.id, { description: e.target.value })}
                                                />
                                            </td>
                                            <td>
                                                <input className="lec-search" defaultValue={c.domain ?? ""} onBlur={(e) => onUpdateClo(c.id, { domain: e.target.value })} />
                                            </td>
                                            <td>
                                                <input
                                                    className="lec-search"
                                                    defaultValue={c.weight ?? ""}
                                                    onBlur={(e) => onUpdateClo(c.id, { weight: e.target.value ? Number(e.target.value) : null })}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    className="lec-select"
                                                    defaultValue={String(c.active)}
                                                    onChange={(e) => onUpdateClo(c.id, { active: e.target.value === "true" })}
                                                >
                                                    <option value="true">true</option>
                                                    <option value="false">false</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button className="lec-btn" disabled={loading} onClick={() => onDeleteClo(c.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {clos.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={7} className="outcome-empty">
                                                No CLO
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* ===== TAB MATRIX ===== */}
                    {tab === "MATRIX" && (
                        <div className="matrix-wrap">
                            <div className="matrix-hint">Click cell để cycle level: empty → 1 → 2 → 3 → empty</div>

                            <table className="matrix-table">
                                <thead>
                                <tr>
                                    <th className="sticky-col">CLO \\ PLO</th>
                                    {plos.map((p) => (
                                        <th key={p.id} title={p.description}>
                                            {p.code}
                                        </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                {clos.map((c) => (
                                    <tr key={c.id}>
                                        <td className="sticky-col" title={c.description}>
                                            {c.code}
                                        </td>

                                        {plos.map((p) => {
                                            const v = cellMap.get(`${c.id}_${p.id}`) ?? null
                                            const cls = v == null ? "matrix-cell is-empty" : `matrix-cell level-${v}`

                                            return (
                                                <td
                                                    key={p.id}
                                                    className={cls}
                                                    onClick={() => toggleCell(c.id, p.id)}
                                                    title={v ? `level=${v}` : "empty"}
                                                >
                                                    {v ?? ""}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}

                                {clos.length === 0 && (
                                    <tr>
                                        <td colSpan={1 + plos.length} className="outcome-empty">
                                            No CLO
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ===== TAB PDF ===== */}
                    {tab === "PDF" && (
                        <div className="pdf-box">
                            <div className="pdf-toolbar">
                                <input className="lec-search outcome-scope" value={scopeKey} onChange={(e) => setScopeKey(e.target.value)} placeholder="scopeKey (vd: KTPM_2025)" />
                                <button className="lec-btn" disabled={loading || !scopeKey.trim()} onClick={onExportPdf}>
                                    Export & Open PDF
                                </button>
                            </div>

                            <div className="pdf-note">PDF sẽ gồm CLO/PLO và ma trận mapping theo scopeKey.</div>
                        </div>
                    )}

                    {loading && <div className="outcome-loading">Loading...</div>}
                </div>
            </div>
        </div>
    )

}
