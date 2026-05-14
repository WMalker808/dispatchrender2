function CharCount({ value, max }) {
  const pct = value.length / max
  const cls = pct >= 1 ? 'over' : pct >= 0.9 ? 'warn' : ''
  return <span className={`char-count ${cls}`}>{value.length}/{max}</span>
}

export default function ContentCard({ url, onUrlChange, fetchStatus, headline, onHeadlineChange, body, onBodyChange }) {
  return (
    <section className="card">
      <h2 className="card-title">Content</h2>

      <div className="field">
        <label>Guardian article URL</label>
        <input
          type="url"
          value={url}
          onChange={e => onUrlChange(e.target.value)}
          placeholder="https://www.theguardian.com/…"
          className="input"
        />
        {fetchStatus && <p className="fetch-status">{fetchStatus}</p>}
      </div>

      <div className="field">
        <label>
          Subject line
          <CharCount value={headline} max={100} />
        </label>
        <input
          type="text"
          value={headline}
          onChange={e => onHeadlineChange(e.target.value)}
          maxLength={100}
          placeholder="Headline"
          className="input"
        />
      </div>

      <div className="field">
        <label>
          Preview text
          <CharCount value={body} max={280} />
        </label>
        <textarea
          value={body}
          onChange={e => onBodyChange(e.target.value)}
          maxLength={280}
          placeholder="Preview text…"
          rows={3}
          className="textarea"
        />
      </div>
    </section>
  )
}
