import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import transcriptRoutes from './routes/transcripts.js'
import verificationRoutes from './routes/verification.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json({ limit: '10mb' }))

app.use(express.static(path.join(__dirname, '..', 'public')))

const siteRoutes = ['/', '/servidor', '/galeria', '/servicios', '/normativa']
app.get(siteRoutes, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'site', 'index.html'))
})

app.get('/about', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

app.get('/api-data', (_req, res) => {
  res.json({ message: 'ValenciaPD API online' })
})

app.get('/healthz', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// Keep the existing verification/transcript backend untouched.
app.use(verificationRoutes)
app.use(transcriptRoutes)

export default app
