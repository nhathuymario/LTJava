import { useEffect, useState } from "react"
import { aaCreatePlo, aaDeletePlo, aaListPlos, aaUpdatePlo, type PloDto } from "../../../services/outcomes"
import "../../../assets/css/pages/outcomes/outcome.css";
export default function AaPloPage() {
    const [scopeKey, setScopeKey] = useState("KTPM_2025")
    const [items, setItems] = useState<PloDto[]>([])
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    const [code, setCode] = useState("")
    const [description, setDescription] = useState("")

    async function load() {
        setLoading(true)
        setErr(null)
        try {
            const data = await aaListPlos(scopeKey)
            setItems(data)
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Load PLO failed")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function onCreate() {
        if (!scopeKey.trim() || !code.trim() || !description.trim()) return
        setLoading(true)
        setErr(null)
        try {
            await aaCreatePlo({ scopeKey: scopeKey.trim(), code: code.trim(), description: description.trim(), active: true })
            setCode("")
            setDescription("")
            await load()
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Create PLO failed")
        } finally {
            setLoading(false)
        }
    }

    async function onUpdate(id: number, patch: Partial<PloDto>) {
        const cur = items.find((x) => x.id === id)
        if (!cur) return
        setLoading(true)
        setErr(null)
        try {
            await aaUpdatePlo(id, {
                scopeKey: patch.scopeKey ?? cur.scopeKey,
                code: patch.code ?? cur.code,
                description: patch.description ?? cur.description,
                active: patch.active ?? cur.active,
            })
            await load()
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Update PLO failed")
        } finally {
            setLoading(false)
        }
    }

    async function onDelete(id: number) {
        if (!confirm("Disable PLO này?")) return
        setLoading(true)
        setErr(null)
        try {
            await aaDeletePlo(id)
            await load()
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Delete PLO failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="lec-page">
            <div className="lec-container">
                <h1 className="lec-title">AA • Quản lý PLO</h1>

                <div className="lec-card">
                    <div className="manage-toolbar">
                        <input
                            className="lec-search"
                            value={scopeKey}
                            onChange={(e) => setScopeKey(e.target.value)}
                            placeholder="scopeKey (vd: KTPM_2025)"
                        />
                        <button className="lec-btn" disabled={loading} onClick={load}>
                            Reload
                        </button>
                    </div>

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
                            className="lec-btn"
                            disabled={loading || !scopeKey.trim() || !code.trim() || !description.trim()}
                            onClick={onCreate}
                        >
                            + Add
                        </button>
                    </div>

                    {err && <div className="outcome-error">{err}</div>}

                    <div className="outcome-table-wrap">
                        <table className="lec-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Active</th>
                                <th style={{ width: 160 }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>
                                        <input
                                            className="lec-search"
                                            defaultValue={p.code}
                                            onBlur={(e) => onUpdate(p.id, { code: e.target.value })}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className="lec-search"
                                            defaultValue={p.description}
                                            onBlur={(e) => onUpdate(p.id, { description: e.target.value })}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className="lec-select"
                                            defaultValue={String(p.active)}
                                            onChange={(e) => onUpdate(p.id, { active: e.target.value === "true" })}
                                        >
                                            <option value="true">true</option>
                                            <option value="false">false</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button className="lec-btn" disabled={loading} onClick={() => onDelete(p.id)}>
                                            Disable
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

                    {loading && <div className="outcome-loading">Loading...</div>}
                </div>
            </div>
        </div>
    )

}
