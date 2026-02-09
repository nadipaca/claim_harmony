"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

export type ClaimsHistoryRow = {
    id: string
    createdAtIso: string
    claimNumber: string
    address: string
    type: string
    status: string
}

type SortKey = "createdAt" | "claimNumber" | "address" | "type" | "status"
type SortDir = "asc" | "desc"

function ArrowUp({ active }: { active: boolean }) {
    return (
        <svg width="16" height="16" fill="none" stroke={active ? "#1E3A8A" : "#94A3B8"} strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
        </svg>
    )
}

function ArrowDown({ active }: { active: boolean }) {
    return (
        <svg width="16" height="16" fill="none" stroke={active ? "#1E3A8A" : "#94A3B8"} strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-6-6m6 6l6-6" />
        </svg>
    )
}

function compare(a: ClaimsHistoryRow, b: ClaimsHistoryRow, key: SortKey): number {
    switch (key) {
        case "createdAt":
            return new Date(a.createdAtIso).getTime() - new Date(b.createdAtIso).getTime()
        case "claimNumber":
            return a.claimNumber.localeCompare(b.claimNumber)
        case "address":
            return a.address.localeCompare(b.address)
        case "type":
            return a.type.localeCompare(b.type)
        case "status":
            return a.status.localeCompare(b.status)
    }
}

function SortControls({
    label,
    sortKey,
    sort,
    setSort,
}: {
    label: string
    sortKey: SortKey
    sort: { key: SortKey; dir: SortDir }
    setSort: (next: { key: SortKey; dir: SortDir }) => void
}) {
    const isActiveAsc = sort.key === sortKey && sort.dir === "asc"
    const isActiveDesc = sort.key === sortKey && sort.dir === "desc"

    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span>{label}</span>
            <span style={{ display: "inline-flex", alignItems: "center"}}>
                <button
                    type="button"
                    aria-label={`Sort ${label} ascending`}
                    onClick={() => setSort({ key: sortKey, dir: "asc" })}
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
                    onClick={() => setSort({ key: sortKey, dir: "desc" })}
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

export function ClaimsHistoryTable({
    rows,
    totalCount,
    baseHref,
}: {
    rows: ClaimsHistoryRow[]
    totalCount: number
    baseHref: string
}) {
    const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "createdAt", dir: "desc" })
    const [pageSize, setPageSize] = useState(25)
    const [pageIndex, setPageIndex] = useState(0)

    const sortedRows = useMemo(() => {
        const next = [...rows]
        next.sort((a, b) => {
            const c = compare(a, b, sort.key)
            return sort.dir === "asc" ? c : -c
        })
        return next
    }, [rows, sort.dir, sort.key])

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
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "820px" }}>
                <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #787878ff" }}>
                        <th
                            style={{
                                padding: "14px 20px",
                                textAlign: "left",
                                color: "#64748B",
                                fontSize: "12px",
                                fontWeight: "500",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <SortControls label="Date" sortKey="createdAt" sort={sort} setSort={setSort} />
                        </th>
                        <th
                            style={{
                                padding: "14px 20px",
                                textAlign: "left",
                                color: "#64748B",
                                fontSize: "12px",
                                fontWeight: "500",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <SortControls label="Claim ID" sortKey="claimNumber" sort={sort} setSort={setSort} />
                        </th>
                        <th
                            style={{
                                padding: "14px 20px",
                                textAlign: "left",
                                color: "#64748B",
                                fontSize: "12px",
                                fontWeight: "500",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <SortControls label="Property" sortKey="address" sort={sort} setSort={setSort} />
                        </th>
                        <th
                            style={{
                                padding: "14px 20px",
                                textAlign: "left",
                                color: "#64748B",
                                fontSize: "12px",
                                fontWeight: "500",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <SortControls label="Type" sortKey="type" sort={sort} setSort={setSort} />
                        </th>
                        <th
                            style={{
                                padding: "14px 20px",
                                textAlign: "left",
                                color: "#64748B",
                                fontSize: "12px",
                                fontWeight: "500",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <SortControls label="Status" sortKey="status" sort={sort} setSort={setSort} />
                        </th>
                        <th
                            style={{
                                padding: "14px 20px",
                                textAlign: "right",
                                color: "#64748B",
                                fontSize: "12px",
                                fontWeight: "500",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Action
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {pageRows.map((row) => (
                        <tr key={row.id}>
                            <td style={{ padding: "16px 20px", color: "#0F172A", fontSize: "14px", whiteSpace: "nowrap" }}>
                                {new Date(row.createdAtIso).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </td>
                            <td style={{ padding: "16px 20px", color: "#1E3A8A", fontSize: "14px", fontWeight: "500", whiteSpace: "nowrap" }}>
                                {row.claimNumber}
                            </td>
                            <td style={{ padding: "16px 20px", color: "#0F172A", fontSize: "14px", maxWidth: "420px" }}>
                                <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {row.address}
                                </span>
                            </td>
                            <td style={{ padding: "16px 20px", color: "#64748B", fontSize: "14px", whiteSpace: "nowrap" }}>{row.type}</td>
                            <td style={{ padding: "16px 20px" }}>
                                <span
                                    style={{
                                        background: row.status === "NEW" ? "#FEF3C7" : "#D1FAE5",
                                        color: row.status === "NEW" ? "#92400E" : "#065F46",
                                        padding: "4px 10px",
                                        borderRadius: "9999px",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {row.status}
                                </span>
                            </td>
                            <td style={{ padding: "16px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                                <Link
                                    href={`${baseHref}/${row.claimNumber.replace("CLM-", "")}`}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        color: "#1E3A8A",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        textDecoration: "none",
                                    }}
                                >
                                    View
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </td>
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
                    minWidth: "820px",
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
