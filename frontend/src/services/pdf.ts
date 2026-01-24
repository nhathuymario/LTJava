
import { api } from "./api"

export type PdfExportRes = {
    syllabusId: number
    pdfReady: boolean
    generatedAt?: string
    downloadUrl?: string
}

export async function exportSyllabusPdf(syllabusId: number, scopeKey: string) {
    const { data } = await api.post<PdfExportRes>(
        `/syllabus/${syllabusId}/export-pdf`,
        null,
        { params: { scopeKey } }
    )
    return data
}

export async function downloadSyllabusPdfBlob(syllabusId: number) {
    const res = await api.get<Blob>(`/syllabus/${syllabusId}/pdf`, {
        responseType: "blob",
    })
    return res.data
}

/** mở PDF trong tab mới (hoặc fallback tải xuống) */
export function openPdfBlob(blob: Blob, filename = "syllabus.pdf") {
    const url = URL.createObjectURL(blob)

    // thử mở tab mới
    const win = window.open(url, "_blank")

    // nếu bị popup-block => tải xuống
    if (!win) {
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
    }

    // giải phóng
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
