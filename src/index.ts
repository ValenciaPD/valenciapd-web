import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import transcriptRoutes from './routes/transcripts.js'
import verificationRoutes from './routes/verification.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json({ limit: '10mb' }))

app.use(
  express.static(
    path.join(__dirname, '..', 'public'),
  ),
)

app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>ValenciaPD</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <h1>ValenciaPD</h1>
        <p>Servicios online.</p>
        <p><a href="/verify">Verificación</a></p>
      </body>
    </html>
  `)
})

app.get('/about', (req, res) => {
  res.sendFile(
    path.join(__dirname, '..', 'components', 'about.htm'),
  )
})

app.get('/api-data', (req, res) => {
  res.json({
    message: 'ValenciaPD API online',
  })
})

app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

app.use(verificationRoutes)
app.use(transcriptRoutes)

export default app
