"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"

type SortDir = "asc" | "desc"

export type SortableColumn<Row> = {
    key: string
    label: string
    align?: "left" | "right"
    nowrap?: boolean
    minWidth?: number
    render: (row: Row) => ReactNode
    getSortValue?: (row: Row) => string | number | Date | null | undefined
}

function ArrowUp({ active }: { active: boolean }) {
    return (
        <svg width="16" height="16" fill="none" stroke={active ? "var(--ch-navy)" : "#94A3B8"} strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
        </svg>
    )
}

function ArrowDown({ active }: { active: boolean }) {
    return (
        <svg width="16" height="16" fill="none" stroke={active ? "var(--ch-navy)" : "#94A3B8"} strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-6-6m6 6l6-6" />
        </svg>
    )
}

function SortControls({
    label,
    columnKey,
    isActiveAsc,
    isActiveDesc,
    onSort,
}: {
    label: string
    columnKey: string
    isActiveAsc: boolean
    isActiveDesc: boolean
    onSort: (dir: SortDir) => void
}) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span>{label}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                <button
                    type="button"
                    aria-label={`Sort ${label} ascending`}
                    onClick={() => onSort("asc")}
                    style={{
                        display: "inline-flex",
                        padding: "2px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        lineHeight: 0,
                    }}
                >
                    <ArrowUp active={isActiveAsc} />
                </button>
                <button
                    type="button"
                    aria-label={`Sort ${label} descending`}
                    onClick={() => onSort("desc")}
                    style={{
                        display: "inline-flex",
                        padding: "2px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        lineHeight: 0,
                    }}
                >
                    <ArrowDown active={isActiveDesc} />
                </button>
            </span>
        </span>
    )
}

function compareValues(a: unknown, b: unknown): number {
    if (a == null && b == null) return 0
    if (a == null) return -1
    if (b == null) return 1

    if (a instanceof Date || b instanceof Date) {
        const aTime = a instanceof Date ? a.getTime() : new Date(String(a)).getTime()
        const bTime = b instanceof Date ? b.getTime() : new Date(String(b)).getTime()
        return aTime - bTime
    }

    if (typeof a === "number" && typeof b === "number") return a - b
    return String(a).localeCompare(String(b))
}

export function SortablePaginatedTable<Row extends { id: string }>({
    rows,
    totalCount,
    columns,
    defaultSort,
    baseMinWidth = 820,
}: {
    rows: Row[]
    totalCount: number
    columns: SortableColumn<Row>[]
    defaultSort: { key: string; dir: SortDir }
    baseMinWidth?: number
}) {
    const [sort, setSort] = useState<{ key: string; dir: SortDir }>(defaultSort)
    const [pageSize, setPageSize] = useState(25)
    const [pageIndex, setPageIndex] = useState(0)

    const sortColumn = useMemo(() => columns.find((c) => c.key === sort.key), [columns, sort.key])

    const sortedRows = useMemo(() => {
        const next = [...rows]
        if (!sortColumn?.getSortValue) return next

        next.sort((a, b) => {
            const c = compareValues(sortColumn.getSortValue!(a), sortColumn.getSortValue!(b))
            return sort.dir === "asc" ? c : -c
        })
        return next
    }, [rows, sort.dir, sortColumn])

    const pageCount = useMemo(() => {
        if (sortedRows.length === 0) return 1
        return Math.max(1, Math.ceil(sortedRows.length / pageSize))
    }, [pageSize, sortedRows.length])

    const safePageIndex = Math.min(pageIndex, pageCount - 1)
    const startIndex = safePageIndex * pageSize
    const endIndexExclusive = startIndex + pageSize
    const pageRows = useMemo(() => sortedRows.slice(startIndex, endIndexExclusive), [endIndexExclusive, sortedRows, startIndex])

    const rangeStart = sortedRows.length === 0 ? 0 : startIndex + 1
    const loadedEnd = Math.min(endIndexExclusive, sortedRows.length)
    const rangeEnd = Math.min(loadedEnd, totalCount)

    return (
        <div
            style={{
                background: "white",
                border: "1px solid #787878ff",
                borderRadius: "12px",
                overflowX: "auto",
                overflowY: "hidden",
                maxWidth: "100%",
            }}
        >
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: `${baseMinWidth}px` }}>
                <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #787878ff" }}>
                        {columns.map((col) => {
                            const isSortable = !!col.getSortValue
                            const isActiveAsc = sort.key === col.key && sort.dir === "asc"
                            const isActiveDesc = sort.key === col.key && sort.dir === "desc"
                            const align = col.align ?? "left"

                            return (
                                <th
                                    key={col.key}
                                    style={{
                                        padding: "14px 20px",
                                        textAlign: align,
                                        color: "#64748B",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        textTransform: "uppercase",
                                        whiteSpace: "nowrap",
                                        minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
                                    }}
                                >
                                    {isSortable ? (
                                        <SortControls
                                            label={col.label}
                                            columnKey={col.key}
                                            isActiveAsc={isActiveAsc}
                                            isActiveDesc={isActiveDesc}
                                            onSort={(dir) => {
                                                setSort({ key: col.key, dir })
                                                setPageIndex(0)
                                            }}
                                        />
                                    ) : (
                                        col.label
                                    )}
                                </th>
                            )
                        })}
                    </tr>
                </thead>

                <tbody>
                    {pageRows.map((row) => (
                        <tr key={row.id}>
                            {columns.map((col) => {
                                const align = col.align ?? "left"
                                return (
                                    <td
                                        key={`${row.id}:${col.key}`}
                                        style={{
                                            padding: "16px 20px",
                                            textAlign: align,
                                            whiteSpace: col.nowrap ? "nowrap" : undefined,
                                            verticalAlign: "middle",
                                        }}
                                    >
                                        {col.render(row)}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div
                style={{
                    padding: "12px 20px",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    color: "#64748B",
                    fontSize: "13px",
                    minWidth: `${baseMinWidth}px`,
                    background: "#F8FAFC",
                    borderTop: "1px solid #E2E8F0",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ whiteSpace: "nowrap" }}>Rows per page</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value))
                                setPageIndex(0)
                            }}
                            style={{
                                height: "32px",
                                borderRadius: "8px",
                                border: "1px solid #CBD5E1",
                                background: "white",
                                color: "#0F172A",
                                fontSize: "13px",
                                padding: "0 10px",
                                outline: "none",
                            }}
                        >
                            {[10, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </label>

                    <span style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                        {rangeStart}-{rangeEnd} of {totalCount}
                    </span>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                    <button
                        type="button"
                        aria-label="Previous page"
                        disabled={safePageIndex <= 0}
                        onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                        style={{
                            width: "34px",
                            height: "32px",
                            border: "1px solid #CBD5E1",
                            borderRadius: "8px",
                            background: "white",
                            color: "#0F172A",
                            cursor: safePageIndex <= 0 ? "not-allowed" : "pointer",
                            opacity: safePageIndex <= 0 ? 0.5 : 1,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        aria-label="Next page"
                        disabled={safePageIndex >= pageCount - 1}
                        onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                        style={{
                            width: "34px",
                            height: "32px",
                            border: "1px solid #CBD5E1",
                            borderRadius: "8px",
                            background: "white",
                            color: "#0F172A",
                            cursor: safePageIndex >= pageCount - 1 ? "not-allowed" : "pointer",
                            opacity: safePageIndex >= pageCount - 1 ? 0.5 : 1,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
