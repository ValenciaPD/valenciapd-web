import express from 'express'

import transcriptRoutes from './routes/transcripts.js'
import verificationRoutes from './routes/verification.js'

const app = express()

app.use(express.json({ limit: '10mb' }))

// -----------------------------------------------------
// HOME
// -----------------------------------------------------

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
        <nav>
          <a href="/">Inicio</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
          <a href="/verify">Verificación</a>
        </nav>

        <h1>ValenciaPD</h1>
        <p>Servicios de ValenciaPD online.</p>

        <img src="/logo.png" alt="ValenciaPD" width="120" />
      </body>
    </html>
  `)
})

// -----------------------------------------------------
// ABOUT
// -----------------------------------------------------

app.get('/about', (req, res) => {
  res.sendFile(
    new URL('../components/about.htm', import.meta.url)
  )
})

// -----------------------------------------------------
// API DATA
// -----------------------------------------------------

app.get('/api-data', (req, res) => {
  res.json({
    message: 'ValenciaPD API online',
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
// ROUTES
// -----------------------------------------------------

app.use(transcriptRoutes)
app.use(verificationRoutes)

export default app
