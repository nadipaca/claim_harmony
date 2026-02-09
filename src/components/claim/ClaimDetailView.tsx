import type { ReactNode } from "react"
import Link from "next/link"
import type { ClaimDetail } from "@/lib/claim-details"
import { ClaimDocuments } from "./ClaimDocuments"
import { ClaimTimeline } from "./ClaimTimeline"

interface ClaimDetailViewProps {
    claim: ClaimDetail
    backHref: string
    headerRight?: ReactNode
    pageBackground?: string
}

export function ClaimDetailView({ claim, backHref, headerRight, pageBackground = "#F8FAFC" }: ClaimDetailViewProps) {
    return (
        <div className="chClaimDetailPage" style={{ padding: "24px 32px", background: pageBackground, boxSizing: "border-box" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    gap: "16px",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <Link
                        href={backHref}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            background: "white",
                            border: "1px solid #E2E8F0",
                            color: "#64748B",
                            textDecoration: "none",
                        }}
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0F172A" }}>Claim Detail</h1>
                </div>

                {headerRight ? <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>{headerRight}</div> : null}
            </div>

            <div className="chClaimDetailGrid">
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                    <div
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            border: "1px solid #787878ff",
                            padding: "24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "24px",
                            minWidth: 0,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "16px",
                                flexWrap: "wrap",
                            }}
                        >
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#0F172A" }}>
                                        #{claim.claimNumber.replace("CLM-", "")}
                                    </h2>
                                    <span
                                        style={{
                                            background: claim.status === "NEW" ? "#FEF3C7" : "#1E3A8A",
                                            color: claim.status === "NEW" ? "#92400E" : "white",
                                            padding: "4px 12px",
                                            borderRadius: "4px",
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {claim.status === "ACCEPTED" ? "CONTRACTOR ASSIGNED" : claim.status}
                                    </span>
                                </div>
                                <p style={{ color: "#64748B", fontSize: "14px" }}>{claim.address}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p
                                    style={{
                                        color: "#64748B",
                                        fontSize: "10px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        marginBottom: "4px",
                                    }}
                                >
                                    DATE OF LOSS
                                </p>
                                <p style={{ color: "#0F172A", fontSize: "16px", fontWeight: "600" }}>
                                    {new Date(claim.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="chClaimPartyCards">
                            <div
                                className="chClaimPartyCard"
                                style={{
                                    borderWidth: "1px 1px 1px 3px",
                                    borderStyle: "solid",
                                    borderColor: "#1E3A8A",
                                    borderRadius: "8px",
                                    padding: "16px",
                                    background: "white",
                                    boxSizing: "border-box",
                                }}
                            >
                                <p
                                    style={{
                                        color: "#64748B",
                                        fontSize: "10px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        marginBottom: "12px",
                                    }}
                                >
                                    HOMEOWNER
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            background: "#1E3A8A",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: "700",
                                            fontSize: "12px",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {(claim.consumer.name || claim.consumer.email)?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p
                                            style={{
                                                color: "#0F172A",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {claim.consumer.name || "Homeowner"}
                                        </p>
                                        <p
                                            style={{
                                                color: "#1E3A8A",
                                                fontSize: "11px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {claim.consumer.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="chClaimPartyCard"
                                style={{
                                    borderWidth: "1px 1px 1px 3px",
                                    borderStyle: "solid",
                                    borderColor: "#D4AF37",
                                    borderRadius: "8px",
                                    padding: "16px",
                                    boxSizing: "border-box",
                                }}
                            >
                                <p
                                    style={{
                                        color: "#64748B",
                                        fontSize: "10px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        marginBottom: "12px",
                                    }}
                                >
                                    ASSIGNED PROVIDER
                                </p>
                                {claim.acceptedByContractor ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                background: "#1E3A8A",
                                                borderRadius: "8px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontWeight: "700",
                                                fontSize: "12px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {(claim.acceptedByContractor.name || claim.acceptedByContractor.email)
                                                ?.substring(0, 2)
                                                .toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p
                                                style={{
                                                    color: "#0F172A",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {claim.acceptedByContractor.name || claim.acceptedByContractor.email}
                                            </p>
                                            <p style={{ color: "#1E3A8A", fontSize: "10px", fontWeight: "600" }}>
                                                VETTED PLATINUM
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: "#94A3B8", fontSize: "13px", fontStyle: "italic" }}>
                                        Not yet assigned
                                    </p>
                                )}
                            </div>

                            <div
                                className="chClaimPartyCard"
                                style={{
                                    borderWidth: "1px 1px 1px 3px",
                                    borderStyle: "solid",
                                    borderColor: "#F87171",
                                    borderRadius: "8px",
                                    padding: "16px",
                                    background: "white",
                                    boxSizing: "border-box",
                                }}
                            >
                                <p
                                    style={{
                                        color: "#64748B",
                                        fontSize: "10px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        marginBottom: "12px",
                                    }}
                                >
                                    LINKED CARRIER
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            background: "#DC2626",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: "700",
                                            fontSize: "12px",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {claim.insuranceCompany.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p
                                            style={{
                                                color: "#0F172A",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {claim.insuranceCompany.name}
                                        </p>
                                        <p style={{ color: "#1E3A8A", fontSize: "11px" }}>Policy #998-221-X</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p
                                style={{
                                    color: "#64748B",
                                    fontSize: "10px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: "8px",
                                }}
                            >
                                LOSS DESCRIPTION
                            </p>
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: "14px",
                                    lineHeight: "1.7",
                                }}
                            >
                                {claim.description}
                            </p>
                        </div>
                    </div>

                    <ClaimTimeline events={claim.events} />
                </div>

                <div style={{ minWidth: 0 }}>
                    <ClaimDocuments claimId={claim.id} claimNumber={claim.claimNumber} documents={claim.documents} />
                </div>
            </div>

            <style jsx>{`
                .chClaimDetailGrid {
                    display: grid;
                    grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
                    gap: 24px;
                    align-items: start;
                }
                .chClaimPartyCards {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    align-items: stretch;
                }
                .chClaimPartyCard {
                    flex: 1 1 240px;
                    min-width: 220px;
                    height: 120px;
                    overflow: hidden;
                }
                @media (max-width: 1024px) {
                    .chClaimDetailGrid {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 520px) {
                    .chClaimDetailPage {
                        padding: 16px;
                    }
                    .chClaimPartyCard {
                        min-width: 100%;
                    }
                }
            `}</style>
        </div>
    )
}
