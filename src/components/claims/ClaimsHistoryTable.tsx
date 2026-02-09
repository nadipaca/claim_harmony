"use client"

import Link from "next/link"
import { SortablePaginatedTable } from "@/components/table/SortablePaginatedTable"

export type ClaimsHistoryRow = {
    id: string
    createdAtIso: string
    claimNumber: string
    address: string
    type: string
    status: string
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
    return (
        <SortablePaginatedTable
            rows={rows}
            totalCount={totalCount}
            baseMinWidth={820}
            defaultSort={{ key: "createdAt", dir: "desc" }}
            columns={[
                {
                    key: "createdAt",
                    label: "Date",
                    nowrap: true,
                    getSortValue: (r) => new Date(r.createdAtIso),
                    render: (r) =>
                        new Date(r.createdAtIso).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }),
                },
                {
                    key: "claimNumber",
                    label: "Claim ID",
                    nowrap: true,
                    getSortValue: (r) => r.claimNumber,
                    render: (r) => <span style={{ color: "var(--ch-navy)", fontSize: "14px", fontWeight: 500 }}>{r.claimNumber}</span>,
                },
                {
                    key: "address",
                    label: "Property",
                    minWidth: 280,
                    getSortValue: (r) => r.address,
                    render: (r) => (
                        <span style={{ display: "block", color: "#0F172A", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.address}
                        </span>
                    ),
                },
                {
                    key: "type",
                    label: "Type",
                    nowrap: true,
                    getSortValue: (r) => r.type,
                    render: (r) => <span style={{ color: "#64748B", fontSize: "14px" }}>{r.type}</span>,
                },
                {
                    key: "status",
                    label: "Status",
                    nowrap: true,
                    getSortValue: (r) => r.status,
                    render: (r) => (
                        <span
                            style={{
                                background: r.status === "NEW" ? "#FEF3C7" : "#D1FAE5",
                                color: r.status === "NEW" ? "#92400E" : "#065F46",
                                padding: "4px 10px",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: 500,
                            }}
                        >
                            {r.status}
                        </span>
                    ),
                },
                {
                    key: "action",
                    label: "Action",
                    align: "right",
                    nowrap: true,
                    render: (r) => (
                        <Link
                            href={`${baseHref}/${r.claimNumber.replace("CLM-", "")}`}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "#1E3A8A",
                                fontSize: "14px",
                                fontWeight: 500,
                                textDecoration: "none",
                            }}
                        >
                            View
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ),
                },
            ]}
        />
    )
}
