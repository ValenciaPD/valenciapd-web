import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import transcriptRoutes from './routes/transcripts.js'
import verificationRoutes from './routes/verification.js'

const __filename =
  fileURLToPath(import.meta.url)

const __dirname =
  path.dirname(__filename)

const app = express()

app.use(
  express.json({
    limit: '10mb',
  }),
)

// -----------------------------------------------------
// STATIC FILES
// -----------------------------------------------------

app.use(
  express.static(
    path.join(
      __dirname,
      '..',
      'public',
    ),
  ),
)

// -----------------------------------------------------
// HOME
// -----------------------------------------------------

app.get('/', (req, res) => {
  res.type('html').send(`
<!doctype html>

<html lang="es">

<head>

<meta charset="utf-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
>

<title>ValenciaPD</title>

<link
  rel="stylesheet"
  href="/style.css"
/>

</head>

<body>

<nav>

<a href="/">
  Inicio
</a>

<a href="/about">
  About
</a>

<a href="/api-data">
  API Data
</a>

<a href="/healthz">
  Health
</a>

<a href="/verify">
  Verificación
</a>

</nav>

<h1>
  ValenciaPD
</h1>

<p>
  Servicios de ValenciaPD online.
</p>

<img
  src="/logo.png"
  alt="ValenciaPD"
  width="120"
/>

</body>

</html>
`)
})

// -----------------------------------------------------
// ABOUT
// -----------------------------------------------------

app.get(
  '/about',
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '..',
        'components',
        'about.htm',
      ),
    )
  },
)

// -----------------------------------------------------
// API DATA
// -----------------------------------------------------

app.get(
  '/api-data',
  (req, res) => {
    res.json({
      message:
        'ValenciaPD API online',
    })
  },
)

// -----------------------------------------------------
// HEALTH
// -----------------------------------------------------

app.get(
  '/healthz',
  (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp:
        new Date().toISOString(),
    })
  },
)

// -----------------------------------------------------
// ROUTES
// -----------------------------------------------------

app.use(
  verificationRoutes,
)

app.use(
  transcriptRoutes,
)

export default app
