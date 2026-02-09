import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { ClaimsHistoryTable, type ClaimsHistoryRow } from "@/components/claims/ClaimsHistoryTable"

export default async function AdminClaimsPage() {
    await requireRole([Role.ADMIN])

    const claims = await prisma.claim.findMany({
        select: {
            id: true,
            createdAt: true,
            claimNumber: true,
            address: true,
            type: true,
            status: true,
        },
        orderBy: { createdAt: "desc" },
    })

    const historyRows: ClaimsHistoryRow[] = claims.map((claim) => ({
        id: claim.id,
        createdAtIso: claim.createdAt.toISOString(),
        claimNumber: claim.claimNumber,
        address: claim.address,
        type: claim.type,
        status: claim.status,
    }))

    return (
        <div className="chPageContainer">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0F172A", marginBottom: "4px" }}>All Claims</h1>
                    <p style={{ color: "#64748B", fontSize: "14px" }}>View and manage all claims across all consumers.</p>
                </div>
            </div>

            <div className="chStatsGrid" style={{ marginBottom: "24px", marginTop: "16px" }}>
                <div style={{ background: "white", border: "1px solid #bebfc1ff", borderRadius: "8px", padding: "16px 24px", minWidth: "140px", flex: "1" }}>
                    <p style={{ color: "#64748B", fontSize: "12px", textTransform: "uppercase", marginBottom: "4px" }}>Total Claims</p>
                    <p style={{ color: "#0F172A", fontSize: "24px", fontWeight: "bold" }}>{claims.length}</p>
                </div>
                <div style={{ background: "white", border: "1px solid #bebfc1ff", borderRadius: "8px", padding: "16px 24px", minWidth: "140px", flex: "1" }}>
                    <p style={{ color: "#64748B", fontSize: "12px", textTransform: "uppercase", marginBottom: "4px" }}>New</p>
                    <p style={{ color: "#92400E", fontSize: "24px", fontWeight: "bold" }}>{claims.filter((c) => c.status === "NEW").length}</p>
                </div>
                <div style={{ background: "white", border: "1px solid #bebfc1ff", borderRadius: "8px", padding: "16px 24px", minWidth: "140px", flex: "1" }}>
                    <p style={{ color: "#64748B", fontSize: "12px", textTransform: "uppercase", marginBottom: "4px" }}>Accepted</p>
                    <p style={{ color: "#065F46", fontSize: "24px", fontWeight: "bold" }}>
                        {claims.filter((c) => c.status === "ACCEPTED").length}
                    </p>
                </div>
            </div>

            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#0F172A" }}>All Claims History</h2>
                </div>

                {claims.length > 0 ? (
                    <ClaimsHistoryTable rows={historyRows} totalCount={claims.length} baseHref="/admin/claims" />
                ) : (
                    <div
                        style={{
                            background: "white",
                            border: "1px solid #bebfc1ff",
                            borderRadius: "12px",
                            padding: "32px",
                            textAlign: "center",
                            color: "#64748B",
                        }}
                    >
                        No claims yet.
                    </div>
                )}
            </div>
        </div>
    )
}

