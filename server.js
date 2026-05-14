import express from 'express'
import session from 'express-session'
import { randomBytes } from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const isProd = process.env.NODE_ENV === 'production'

app.set('trust proxy', 1)
app.use(express.json())
app.use(session({
  secret: process.env.SECRET_KEY || randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: isProd, sameSite: 'strict' }
}))

function requireCsrf(req, res, next) {
  const token = req.headers['x-csrf-token']
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid request' })
  }
  next()
}

// ── Routes ────────────────────────────────────────────

app.get('/api/csrf', (req, res) => {
  req.session.csrfToken = randomBytes(32).toString('hex')
  res.json({ csrf_token: req.session.csrfToken })
})

app.post('/api/fetch-article', requireCsrf, async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:')
      return res.status(400).json({ error: 'URL must use HTTPS' })
    if (parsed.hostname !== 'www.theguardian.com')
      return res.status(400).json({ error: 'Only Guardian articles are supported' })
  } catch {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
    })
    const html = await response.text()

    const getMeta = (prop) => {
      const m = html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']*?)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+property=["']${prop}["']`, 'i'))
      return m ? m[1] : ''
    }

    let headline = getMeta('og:title')
    if (!headline) {
      const t = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      headline = t ? t[1] : ''
    }
    headline = headline.replace(/\s*[|\-]\s*The Guardian\s*$/i, '').trim()

    res.json({ headline, body: getMeta('og:description'), image_url: getMeta('og:image') })
  } catch {
    res.status(500).json({ error: 'Failed to fetch article' })
  }
})

app.post('/api/send', requireCsrf, async (req, res) => {
  const { headline, body, url, image_url, timing, sched_at } = req.body

  const brazeApiKey = process.env.BRAZE_API_KEY
  const brazeEndpoint = process.env.BRAZE_REST_ENDPOINT || 'https://rest.fra-01.braze.eu'
  const brazeCampaignId = process.env.BRAZE_CAMPAIGN_ID

  // Dev mode: no Braze key → succeed silently
  if (!brazeApiKey) return res.json({ success: true })

  const triggerProperties = {
    headline,
    subject: `Breaking news: ${headline}`,
    body,
    url,
    image_url: image_url || '',
  }

  try {
    let brazeUrl, payload

    if (timing === 'immediate') {
      brazeUrl = `${brazeEndpoint}/campaigns/trigger/send`
      payload = { campaign_id: brazeCampaignId, broadcast: true, trigger_properties: triggerProperties }
    } else {
      brazeUrl = `${brazeEndpoint}/campaigns/trigger/schedule/create`
      const scheduleTime = timing === 'scheduled'
        ? sched_at
        : new Date().toISOString().slice(0, 19)
      payload = {
        campaign_id: brazeCampaignId,
        broadcast: true,
        trigger_properties: triggerProperties,
        schedule: {
          time: scheduleTime,
          ...(timing === 'intelligent' && { at_optimal_time: true }),
        },
      }
    }

    const brazeRes = await fetch(brazeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${brazeApiKey}` },
      body: JSON.stringify(payload),
    })

    if (!brazeRes.ok) {
      const err = await brazeRes.json().catch(() => ({}))
      return res.status(500).json({ success: false, error: err.message || 'Braze API error' })
    }

    res.json({ success: true })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to send' })
  }
})

// ── Static files (production) ─────────────────────────

if (isProd) {
  app.use(express.static(join(__dirname, 'dist')))
  app.get('*', (_req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))
}

app.listen(PORT, () => console.log(`Dispatch server running on port ${PORT}`))
