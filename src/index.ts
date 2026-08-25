import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { put, list } from '@vercel/blob'
import { randomBytes } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json({ limit: '10mb' }))

// -----------------------------------------------------
// GENERATE TRANSCRIPT ID
// -----------------------------------------------------

function generateTranscriptId(length = 8): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

  let result = ''

  while (result.length < length) {
    const bytes = randomBytes(length)

    for (const byte of bytes) {
      result += chars[byte % chars.length]

      if (result.length === length) break
    }
  }

  return result
}

// -----------------------------------------------------
// HOME
// -----------------------------------------------------

app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>ValenciaPD</title>
        <link rel="stylesheet" href="/style.css" />
      </head>

      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
        </nav>

        <h1>ValenciaPD</h1>
        <p>ValenciaPD services are online.</p>

        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `)
})

// -----------------------------------------------------
// ABOUT
// -----------------------------------------------------

app.get('/about', (req, res) => {
  res.sendFile(
    path.join(__dirname, '..', 'components', 'about.htm')
  )
})

// -----------------------------------------------------
// EXAMPLE API
// -----------------------------------------------------

app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// -----------------------------------------------------
// HEALTH
// -----------------------------------------------------

app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// -----------------------------------------------------
// CREATE TRANSCRIPT
// POST /api/transcripts
// -----------------------------------------------------

app.post('/api/transcripts', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (
      !process.env.TRANSCRIPT_API_SECRET ||
      authHeader !==
        `Bearer ${process.env.TRANSCRIPT_API_SECRET}`
    ) {
      return res.status(401).json({
        error: 'Unauthorized',
      })
    }

    const { html } = req.body

    if (typeof html !== 'string' || !html.trim()) {
      return res.status(400).json({
        error: 'Missing transcript HTML',
      })
    }

    const id = generateTranscriptId()

    const pathname = `transcripts/${id}.html`

    const blob = await put(pathname, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      addRandomSuffix: false,
    })

    return res.status(201).json({
      success: true,
      id,
      url: `https://transcripts.valenciapd.es/${id}`,
      blobUrl: blob.url,
    })
  } catch (error) {
    console.error('Transcript upload error:', error)

    return res.status(500).json({
      error: 'Failed to save transcript',
    })
  }
})

// -----------------------------------------------------
// VIEW TRANSCRIPT
// GET /ABCDEFGH
// -----------------------------------------------------

app.get('/:id', async (req, res, next) => {
  const { id } = req.params

  // Only treat 8-character IDs as transcript IDs.
  if (!/^[A-Za-z0-9]{8}$/.test(id)) {
    return next()
  }

  try {
    const { blobs } = await list({
      prefix: `transcripts/${id}.html`,
    })

    const blob = blobs.find(
      (item) => item.pathname === `transcripts/${id}.html`
    )

    if (!blob) {
      return res.status(404).type('html').send(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Transcript not found</title>
          </head>
          <body>
            <h1>Transcript not found</h1>
            <p>The requested transcript does not exist.</p>
          </body>
        </html>
      `)
    }

    const response = await fetch(blob.url)

    if (!response.ok) {
      return res.status(404).send('Transcript not found')
    }

    const html = await response.text()

    return res
      .status(200)
      .set('Content-Type', 'text/html; charset=utf-8')
      .set(
        'Cache-Control',
        'public, max-age=31536000, immutable'
      )
      .send(html)
  } catch (error) {
    console.error('Transcript read error:', error)

    return res.status(500).send(
      'Failed to load transcript'
    )
  }
})

export default app
