import { useEffect, useMemo, useState } from "react"
import {
    aaCreatePlo,
    aaHardDeletePlo,
    aaListPlos,
    aaUpdatePlo,
    type PloDto,
} from "../../../services/outcomes"
import "../../../assets/css/pages/outcomes/aaplopage.css"

export default function AaPloPage() {
    const [scopeKey, setScopeKey] = useState("KTPM_2025")
    const [items, setItems] = useState<PloDto[]>([])
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    const [code, setCode] = useState("")
    const [description, setDescription] = useState("")

    /* ===== Derived ===== */
    const activeCount = useMemo(
        () => items.filter((x) => x.active).length,
        [items]
    )

    /* ===== Load ===== */
    async function load(keyArg?: string) {
        const key = (keyArg ?? scopeKey).trim()
        if (!key) return

        setLoading(true)
        setErr(null)
        try {
            const data = await aaListPlos(key)
            data.sort(
                (a, b) =>
                    Number(b.active) - Number(a.active) ||
                    a.code.localeCompare(b.code)
            )
            setItems(data)
        } catch (e: any) {
            setErr(
                e?.response?.data?.message ||
                e?.message ||
                "Load PLO failed"
            )
        } finally {
            setLoading(false)
        }
    }

    /* initial load */
    useEffect(() => {
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /* reload khi đổi scopeKey (debounce nhẹ) */
    useEffect(() => {
        const t = setTimeout(() => {
            if (scopeKey.trim()) load(scopeKey)
        }, 300)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scopeKey])

    /* ===== Create ===== */
    async function onCreate() {
        if (!scopeKey.trim() || !code.trim() || !description.trim()) return

        setLoading(true)
        setErr(null)
        try {
            await aaCreatePlo({
                scopeKey: scopeKey.trim(),
                code: code.trim(),
                description: description.trim(),
                active: true,
            })
            setCode("")
            setDescription("")
            await load()
        } catch (e: any) {
            setErr(
                e?.response?.data?.message ||
                e?.message ||
                "Create PLO failed"
            )
        } finally {
            setLoading(false)
        }
    }

    /* ===== Update ===== */
    async function onUpdate(id: number, patch: Partial<PloDto>) {
        const cur = items.find((x) => x.id === id)
        if (!cur) return

        const next = {
            scopeKey: (patch.scopeKey ?? cur.scopeKey).trim(),
            code: (patch.code ?? cur.code).trim(),
            description: (patch.description ?? cur.description).trim(),
            active: patch.active ?? cur.active,
        }

        // không đổi gì thì skip
        if (
            next.scopeKey === cur.scopeKey &&
            next.code === cur.code &&
            next.description === cur.description &&
            next.active === cur.active
        ) {
            return
        }

        setLoading(true)
        setErr(null)
        try {
            await aaUpdatePlo(id, next)
            await load()
        } catch (e: any) {
            setErr(
                e?.response?.data?.message ||
                e?.message ||
                "Update PLO failed"
            )
        } finally {
            setLoading(false)
        }
    }

    /* ===== Enable / Disable ===== */
    // async function onToggleActive(p: PloDto) {
    //     const next = !p.active
    //     const msg = next
    //         ? `Bật lại (Enable) PLO "${p.code}"?`
    //         : `Ẩn (Disable) PLO "${p.code}"?`
    //     if (!confirm(msg)) return
    //     await onUpdate(p.id, { active: next })
    // }

    /* ===== Hard Delete ===== */
    async function onHardDelete(p: PloDto) {
        if (!confirm(`XÓA HẲN PLO "${p.code}"? (Không thể phục hồi)`)) return
        if (!confirm("Bạn chắc chắn 100% chứ?")) return

        setLoading(true)
        setErr(null)
        try {
            await aaHardDeletePlo(p.id)
            await load()
        } catch (e: any) {
            setErr(
                e?.response?.data?.message ||
                e?.message ||
                "Hard delete PLO failed"
            )
        } finally {
            setLoading(false)
        }
    }

    /* ===== UI ===== */
    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="page-head">
                    <h1 className="lec-title">AA • Quản lý PLO</h1>
                    <div className="page-sub">
                        Tổng: {items.length} • Active: {activeCount} •
                        Inactive: {items.length - activeCount}
                    </div>
                </div>

                <div className="lec-card">
                    {/* Toolbar */}
                    <div className="manage-toolbar">
                        <input
                            className="lec-search"
                            value={scopeKey}
                            onChange={(e) => setScopeKey(e.target.value)}
                            placeholder="scopeKey (vd: KTPM_2025)"
                        />
                        <button
                            className="lec-btn btn-reload"
                            disabled={loading || !scopeKey.trim()}
                            onClick={() => load()}
                        >
                            Reload
                        </button>
                    </div>

                    {/* Create */}
                    <div className="outcome-form-grid-plo">
                        <input
                            className="lec-search"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="PLO code (PLO1)"
                        />
                        <input
                            className="lec-search"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả PLO"
                        />
                        <button
                            className="lec-btn btn-add"
                            disabled={
                                loading ||
                                !scopeKey.trim() ||
                                !code.trim() ||
                                !description.trim()
                            }
                            onClick={onCreate}
                        >
                            + Add
                        </button>
                    </div>

                    {err && <div className="outcome-error">{err}</div>}

                    {/* Table */}
                    <div className="outcome-table-wrap">
                        <table className="lec-table">
                            <thead>
                            <tr>
                                <th style={{ width: 70 }}>ID</th>
                                <th style={{ width: 220 }}>Code</th>
                                <th>Description</th>
                                <th style={{ width: 140 }}>Active</th>
                                <th style={{ width: 260 }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((p) => (
                                <tr
                                    key={p.id}
                                    className={!p.active ? "row-inactive" : ""}
                                >
                                    <td>{p.id}</td>

                                    <td>
                                        <input
                                            className="lec-search"
                                            defaultValue={p.code}
                                            onBlur={(e) =>
                                                onUpdate(p.id, {code: e.target.value})
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            className="lec-search"
                                            defaultValue={p.description}
                                            onBlur={(e) =>
                                                onUpdate(p.id, {
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </td>

                                    <td>
                                        <select
                                            className="lec-select"
                                            value={String(p.active)}
                                            disabled={loading}
                                            onChange={(e) =>
                                                onUpdate(p.id, {
                                                    active: e.target.value === "true",
                                                })
                                            }
                                        >
                                            <option value="true">true</option>
                                            <option value="false">false</option>
                                        </select>
                                    </td>

                                    <td className="actions-cell">
                                        {/*<button*/}
                                        {/*    className={`lec-btn ${*/}
                                        {/*        p.active ? "btn-disable" : "btn-enable"*/}
                                        {/*    }`}*/}
                                        {/*    disabled={loading}*/}
                                        {/*    onClick={() => onToggleActive(p)}*/}
                                        {/*>*/}
                                        {/*    {p.active ? "Disable" : "Enable"}*/}
                                        {/*</button>*/}

                                        <button
                                            className="lec-btn btn-danger"
                                            disabled={loading}
                                            onClick={() => onHardDelete(p)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {items.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="outcome-empty">
                                        No PLO
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {loading && (
                        <div className="outcome-loading">Loading...</div>
                    )}
                </div>
            </div>
        </div>
    )
}
