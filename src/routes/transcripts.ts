import { Router } from 'express'
import { put, list } from '@vercel/blob'
import { randomBytes } from 'crypto'

const router = Router()

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
// TEST TRANSCRIPT
// -----------------------------------------------------

router.get('/test-transcript', async (req, res) => {
  try {
    const id = generateTranscriptId()

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Transcript de prueba</title>
        </head>

        <body>
          <h1>Transcript de prueba</h1>

          <p>
            Si estás viendo esta página,
            el sistema de transcripts funciona correctamente.
          </p>

          <p>
            ID: <strong>${id}</strong>
          </p>
        </body>
      </html>
    `

    const blob = await put(
      `transcripts/${id}.html`,
      html,
      {
        access: 'public',
        contentType: 'text/html; charset=utf-8',
        addRandomSuffix: false,
      }
    )

    res.type('html').send(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Transcript creado</title>
        </head>

        <body>
          <h1>Transcript creado correctamente</h1>

          <p>ID: <strong>${id}</strong></p>

          <p>
            <a
              href="https://transcripts.valenciapd.es/${id}"
              target="_blank"
            >
              Abrir transcript
            </a>
          </p>

          <p>Blob: ${blob.url}</p>
        </body>
      </html>
    `)

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Failed to create test transcript',
    })
  }
})

// -----------------------------------------------------
// CREATE TRANSCRIPT
// POST /api/transcripts
// -----------------------------------------------------

router.post('/api/transcripts', async (req, res) => {
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

    if (
      typeof html !== 'string' ||
      !html.trim()
    ) {
      return res.status(400).json({
        error: 'Missing transcript HTML',
      })
    }

    const id = generateTranscriptId()

    const pathname =
      `transcripts/${id}.html`

    const blob = await put(
      pathname,
      html,
      {
        access: 'public',
        contentType: 'text/html; charset=utf-8',
        addRandomSuffix: false,
      }
    )

    return res.status(201).json({
      success: true,
      id,
      url:
        `https://transcripts.valenciapd.es/${id}`,
      blobUrl: blob.url,
    })

  } catch (error) {
    console.error(
      'Transcript upload error:',
      error
    )

    return res.status(500).json({
      error: 'Failed to save transcript',
    })
  }
})

// -----------------------------------------------------
// VIEW TRANSCRIPT
// GET /:id
// -----------------------------------------------------

router.get('/:id', async (req, res, next) => {
  const { id } = req.params

  if (!/^[A-Za-z0-9]{8}$/.test(id)) {
    return next()
  }

  try {
    const { blobs } = await list({
      prefix:
        `transcripts/${id}.html`,
    })

    const blob = blobs.find(
      item =>
        item.pathname ===
        `transcripts/${id}.html`
    )

    if (!blob) {
      return res.status(404).type('html').send(`
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="utf-8">
            <title>Transcript no encontrado</title>
          </head>

          <body>
            <h1>Transcript no encontrado</h1>
            <p>El transcript solicitado no existe.</p>
          </body>
        </html>
      `)
    }

    const response =
      await fetch(blob.url)

    if (!response.ok) {
      return res
        .status(404)
        .send('Transcript not found')
    }

    const html =
      await response.text()

    return res
      .status(200)
      .set(
        'Content-Type',
        'text/html; charset=utf-8'
      )
      .set(
        'Cache-Control',
        'public, max-age=31536000, immutable'
      )
      .send(html)

  } catch (error) {
    console.error(
      'Transcript read error:',
      error
    )

    return res
      .status(500)
      .send('Failed to load transcript')
  }
})

export default router
