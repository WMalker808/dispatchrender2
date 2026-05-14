const TIMING_MODES = [
  { id: 'immediate',   label: 'Immediate' },
  { id: 'scheduled',   label: 'Scheduled' },
  { id: 'intelligent', label: 'Intelligent' },
]

export default function DeliveryTimingCard({ timing, onTimingChange, schedDate, onSchedDateChange, schedTime, onSchedTimeChange }) {
  return (
    <section className="card">
      <h2 className="card-title">Delivery &amp; Timing</h2>

      <div className="timing-buttons">
        {TIMING_MODES.map(mode => (
          <button
            key={mode.id}
            className={`timing-btn${timing === mode.id ? ' active' : ''}`}
            onClick={() => onTimingChange(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {timing === 'scheduled' && (
        <div className="sched-panel">
          <div className="field">
            <label>Date (local)</label>
            <input
              type="date"
              value={schedDate}
              onChange={e => onSchedDateChange(e.target.value)}
              className="input"
            />
          </div>
          <div className="field">
            <label>Time (local)</label>
            <input
              type="time"
              value={schedTime}
              onChange={e => onSchedTimeChange(e.target.value)}
              className="input"
            />
          </div>
        </div>
      )}

      {timing === 'intelligent' && (
        <div className="intelligent-callout">
          <strong>Braze Intelligent Timing</strong>
          <p>Delivers to each subscriber at their individually optimal time within the next 24 hours.</p>
        </div>
      )}
    </section>
  )
}
