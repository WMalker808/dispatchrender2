const SEGMENTS_MAP = {
  uk:     { label: 'United Kingdom', flag: '🇬🇧' },
  us:     { label: 'United States',  flag: '🇺🇸' },
  au:     { label: 'Australia',      flag: '🇦🇺' },
  eu:     { label: 'Europe',         flag: '🇪🇺' },
  global: { label: 'Global (ALL)',   flag: '🌍' },
}

function routingDetail(timing, schedDate, schedTime) {
  if (timing === 'immediate') return 'Send immediately'
  if (timing === 'scheduled') {
    return schedDate && schedTime
      ? `Scheduled for ${schedDate} ${schedTime} (local)`
      : 'Scheduled — set date and time'
  }
  return 'Intelligent Timing (next 24h)'
}

function sendLabel(timing, sendStatus) {
  if (sendStatus === 'sending') return 'Sending…'
  if (sendStatus === 'sent')    return 'Sent \u2713'
  if (timing === 'scheduled')   return 'Schedule send'
  if (timing === 'intelligent') return 'Queue for delivery'
  return 'Send now'
}

export default function PreviewPanel({ headline, body, timing, schedDate, schedTime, segments, sendStatus, canSend, onSend }) {
  const selectedSegments = Object.entries(segments)
    .filter(([, active]) => active)
    .map(([id]) => id)

  return (
    <aside className="preview-panel">
      <div className="email-preview">
        <div className="email-header">
          <span className="email-logo">D</span>
          <span className="email-brand">The Guardian</span>
        </div>
        <div className="email-body">
          <p className="email-headline">
            {headline ? `Breaking news: ${headline}` : 'Breaking news: …'}
          </p>
          <p className="email-text">
            {body || 'Preview text will appear here.'}
          </p>
          <button className="email-cta" disabled>Read more &rarr;</button>
        </div>
      </div>

      <div className="routing-info">
        <div className="routing-row">
          <span className="routing-label">Routing</span>
          <span className="routing-value">Newsletter — Email via Braze</span>
        </div>
        <div className="routing-row">
          <span className="routing-label">Timing</span>
          <span className="routing-value">{routingDetail(timing, schedDate, schedTime)}</span>
        </div>
        <div className="routing-row">
          <span className="routing-label">Sending to</span>
          <span className="routing-value">
            {selectedSegments.length === 0
              ? <em>No segments selected</em>
              : selectedSegments.map(id => (
                  <span key={id} className="segment-pill">
                    {SEGMENTS_MAP[id].flag} {SEGMENTS_MAP[id].label}
                  </span>
                ))
            }
          </span>
        </div>
      </div>

      <button
        className={`send-btn${sendStatus === 'sent' ? ' sent' : ''}`}
        disabled={!canSend || sendStatus === 'sending' || sendStatus === 'sent'}
        onClick={onSend}
      >
        {sendLabel(timing, sendStatus)}
      </button>
    </aside>
  )
}
