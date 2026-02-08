import { ClaimEvent, User } from "@prisma/client"

type EventWithActor = ClaimEvent & {
    actorUser: Pick<User, 'name' | 'email'> | null
}

const eventLabels: Record<string, string> = {
    CLAIM_CREATED: 'Claim Created',
    CONTRACTOR_ACCEPTED: 'Contractor Accepted',
    DOCUMENT_UPLOADED: 'Document Uploaded'
}

function getEventDescription(event: EventWithActor): string {
    const actorName = event.actorUser?.name || event.actorUser?.email || event.actorRole

    switch (event.eventType) {
        case 'CLAIM_CREATED':
            return `Submitted via Consumer Intake Wizard.`
        case 'CONTRACTOR_ACCEPTED':
            return `${actorName} has accepted the claim and scheduled a preliminary inspection.`
        case 'DOCUMENT_UPLOADED':
            const meta = event.meta as { filename?: string } | null
            return meta?.filename
                ? `${actorName} uploaded ${meta.filename}`
                : `${actorName} uploaded a document.`
        default:
            return `Action performed by ${actorName}`
    }
}

function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) {
        return 'JUST NOW'
    } else if (diffHours < 24) {
        return `${diffHours} HOURS AGO`
    } else if (diffDays < 7) {
        return `${diffDays} DAYS AGO`
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).toUpperCase()
    }
}

interface ClaimTimelineProps {
    events: EventWithActor[]
}

export function ClaimTimeline({ events }: ClaimTimelineProps) {
    // Show newest first
    const sortedEvents = [...events].reverse()

    if (sortedEvents.length === 0) {
        return (
            <div style={{
                background: 'white',
                border: '1px solid #bdbdbdff',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
                    Activity Timeline
                </h2>
                <p style={{ color: '#94A3B8', fontSize: '14px', fontStyle: 'italic' }}>
                    No activity yet.
                </p>
            </div>
        )
    }

    return (
        <div style={{
            background: 'white',
            border: '1px solid #606060ff',
            borderRadius: '12px',
            padding: '24px'
        }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '24px' }}>
                Activity Timeline
            </h2>
            <div style={{ position: 'relative' }}>
                {sortedEvents.map((event, index) => {
                    const isLatest = index === 0
                    const isLast = index === sortedEvents.length - 1

                    return (
                        <div
                            key={event.id}
                            style={{
                                display: 'flex',
                                gap: '16px',
                                position: 'relative',
                                paddingBottom: isLast ? '0' : '32px'
                            }}
                        >
                            {/* Timeline dot and connecting line */}
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: '24px',
                                flexShrink: 0
                            }}>
                                {/* Connecting line - positioned behind the dot, between dots */}
                                {!isLast && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '2px',
                                        height: 'calc(100% + 22px)',
                                        background: '#bbc1c3ff',
                                        zIndex: 0
                                    }} />
                                )}
                                {/* Dot - Blue for latest, Gray for completed - all same size */}
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: isLatest ? '#1E3A8A' : '#CBD5E1',
                                    flexShrink: 0,
                                    zIndex: 1
                                }} />
                            </div>

                            {/* Event content */}
                            <div style={{ flex: 1, marginTop: '-4px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '4px'
                                }}>
                                    <span style={{
                                        color: isLatest ? '#1E3A8A' : '#0F172A',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>
                                        {eventLabels[event.eventType] || event.eventType}
                                    </span>
                                    <span style={{
                                        color: '#94A3B8',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.3px'
                                    }}>
                                        {formatRelativeTime(new Date(event.createdAt))}
                                    </span>
                                </div>
                                <p style={{
                                    color: '#64748B',
                                    fontSize: '13px',
                                    lineHeight: '1.5',
                                    margin: 0
                                }}>
                                    {getEventDescription(event)}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
