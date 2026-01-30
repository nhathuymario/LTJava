import { useEffect, useMemo, useState } from "react"

export function useClientPagination<T>(
    items: T[],
    pageSize: number,
    depsResetPage: any[] = []
) {
    const [page, setPage] = useState(1)

    const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / pageSize)), [items.length, pageSize])

    useEffect(() => {
        setPage(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, depsResetPage)

    useEffect(() => {
        if (page > totalPages) setPage(totalPages)
    }, [page, totalPages])

    const pagedItems = useMemo(() => {
        const start = (page - 1) * pageSize
        return items.slice(start, start + pageSize)
    }, [items, page, pageSize])

    return { page, setPage, totalPages, pagedItems }
}
