const SEGMENTS = [
  { id: 'uk',     label: 'United Kingdom', flag: '🇬🇧' },
  { id: 'us',     label: 'United States',  flag: '🇺🇸' },
  { id: 'au',     label: 'Australia',      flag: '🇦🇺' },
  { id: 'eu',     label: 'Europe',         flag: '🇪🇺' },
  { id: 'global', label: 'Global (ALL)',   flag: '🌍' },
]

export default function AudienceSegmentsCard({ segments, onToggle }) {
  return (
    <section className="card">
      <h2 className="card-title">Audience Segments</h2>
      <div className="warning-note">
        Segment selection is UI-only and not wired to the backend. All sends go to the same Braze campaign regardless of selection. Not in production.
      </div>
      <div className="segments">
        {SEGMENTS.map(seg => (
          <button
            key={seg.id}
            className={`segment-btn${segments[seg.id] ? ' active' : ''}`}
            onClick={() => onToggle(seg.id)}
          >
            {seg.flag} {seg.label}
          </button>
        ))}
      </div>
    </section>
  )
}
