type Props = {
    page: number
    totalPages: number
    totalItems: number
    pageSize: number
    onPrev: () => void
    onNext: () => void
}

export default function PaginationBar({
                                          page,
                                          totalPages,
                                          totalItems,
                                          pageSize,
                                          onPrev,
                                          onNext,
                                      }: Props) {
    if (totalItems <= 0) return null

    const from = (page - 1) * pageSize + 1
    const to = Math.min(page * pageSize, totalItems)

    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 8 }}>
            <div style={{ color: "#6b7280" }}>
                Hiển thị {from}–{to} / {totalItems}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="lec-btn" disabled={page <= 1} onClick={onPrev}>
                    ← Prev
                </button>

                <div style={{ minWidth: 110, textAlign: "center", color: "#6b7280" }}>
                    Trang {page} / {totalPages}
                </div>

                <button className="lec-btn" disabled={page >= totalPages} onClick={onNext}>
                    Next →
                </button>
            </div>
        </div>
    )
}
