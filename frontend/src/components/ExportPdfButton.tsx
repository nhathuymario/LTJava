import { useState } from "react"
import { downloadSyllabusPdfBlob, exportSyllabusPdf, openPdfBlob } from "../services/pdf"

type Props = {
    syllabusId: number
    defaultScopeKey?: string
}

export default function ExportPdfButton({ syllabusId, defaultScopeKey = "KTPM_2025" }: Props) {
    const [scopeKey, setScopeKey] = useState(defaultScopeKey)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleExportAndOpen() {
        setLoading(true)
        setError(null)
        try {
            await exportSyllabusPdf(syllabusId, scopeKey)
            const blob = await downloadSyllabusPdfBlob(syllabusId)
            openPdfBlob(blob, `syllabus-${syllabusId}.pdf`)
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Export PDF failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
                value={scopeKey}
                onChange={(e) => setScopeKey(e.target.value)}
                placeholder="scopeKey (vd: KTPM_2025)"
                style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", minWidth: 200 }}
            />

            <button
                onClick={handleExportAndOpen}
                disabled={loading || !scopeKey.trim()}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}
            >
                {loading ? "Đang xuất..." : "Xuất PDF"}
            </button>

            {error && <div style={{ color: "crimson", fontSize: 13 }}>{error}</div>}
        </div>
    )
}
