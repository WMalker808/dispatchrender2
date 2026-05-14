import { useState, useEffect, useRef, useCallback } from 'react'
import ContentCard from './components/ContentCard.jsx'
import ChannelCard from './components/ChannelCard.jsx'
import AudienceSegmentsCard from './components/AudienceSegmentsCard.jsx'
import DeliveryTimingCard from './components/DeliveryTimingCard.jsx'
import PreviewPanel from './components/PreviewPanel.jsx'
import SuccessBanner from './components/SuccessBanner.jsx'
import './guardian.css'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">D</div>
    </aside>
  )
}

export default function App() {
  const [csrf, setCsrf] = useState('')
  const [url, setUrl] = useState('')
  const [headline, setHeadline] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [fetchStatus, setFetchStatus] = useState('')
  const [segments, setSegments] = useState({})
  const [timing, setTiming] = useState('immediate')
  const [schedDate, setSchedDate] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [sendStatus, setSendStatus] = useState('idle') // idle | sending | sent
  const [successInfo, setSuccessInfo] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/csrf`)
      .then(r => r.json())
      .then(d => setCsrf(d.csrf_token))
      .catch(() => {})
  }, [])

  const fetchArticle = useCallback(async (articleUrl) => {
    if (!articleUrl) return
    setFetchStatus('Fetching article…')
    try {
      const res = await fetch(`${API_BASE}/api/fetch-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({ url: articleUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFetchStatus(`Error: ${data.error}`)
        return
      }
      setHeadline(data.headline)
      setBody(data.body)
      setImageUrl(data.image_url || '')
      setFetchStatus('Article fetched.')
    } catch {
      setFetchStatus('Failed to fetch article.')
    }
  }, [csrf])

  const onUrlChange = useCallback((val) => {
    setUrl(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchArticle(val), 500)
  }, [fetchArticle])

  const toggleSegment = (id) => {
    setSegments(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const canSend = headline.trim().length > 0 &&
    (timing !== 'scheduled' || (schedDate !== '' && schedTime !== ''))

  const sendAlert = async () => {
    setSendStatus('sending')
    let schedAt
    if (timing === 'scheduled') {
      schedAt = new Date(`${schedDate}T${schedTime}`).toISOString().slice(0, 19)
    }
    try {
      const res = await fetch(`${API_BASE}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({
          headline,
          body,
          url,
          image_url: imageUrl,
          timing,
          sched_at: schedAt,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSendStatus('sent')
        setSuccessInfo({ timing, schedDate, schedTime })
        setTimeout(() => setSendStatus('idle'), 3000)
      } else {
        alert(data.error || 'Send failed.')
        setSendStatus('idle')
      }
    } catch {
      alert('Network error.')
      setSendStatus('idle')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="form-panel">
        <ContentCard
          url={url}
          onUrlChange={onUrlChange}
          fetchStatus={fetchStatus}
          headline={headline}
          onHeadlineChange={setHeadline}
          body={body}
          onBodyChange={setBody}
        />
        <ChannelCard />
        <AudienceSegmentsCard segments={segments} onToggle={toggleSegment} />
        <DeliveryTimingCard
          timing={timing}
          onTimingChange={setTiming}
          schedDate={schedDate}
          onSchedDateChange={setSchedDate}
          schedTime={schedTime}
          onSchedTimeChange={setSchedTime}
        />
      </main>
      <PreviewPanel
        headline={headline}
        body={body}
        timing={timing}
        schedDate={schedDate}
        schedTime={schedTime}
        segments={segments}
        sendStatus={sendStatus}
        canSend={canSend}
        onSend={sendAlert}
      />
      {successInfo && (
        <SuccessBanner info={successInfo} onDismiss={() => setSuccessInfo(null)} />
      )}
    </div>
  )
}
