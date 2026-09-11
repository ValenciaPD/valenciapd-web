import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import transcriptRoutes from './routes/transcripts.js'
import verificationRoutes from './routes/verification.js'
import { env } from './config/env.js'
import { createState, verifyState } from './utils/crypto.js'
import { exchangeCode, getDiscordOAuthUrl, getDiscordUser, isGuildMember, addUserToGuild } from './services/discord.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json({ limit: '10mb' }))

app.use(express.static(path.join(__dirname, '..', 'public')))

function htmlEscape(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

app.get('/discord', (_req, res) => {
  const state = `discord|${createState()}`
  return res.redirect(getDiscordOAuthUrl(state))
})

// Direct Discord connection from the website. Verification callbacks keep using the existing handler below.
app.get('/callback', async (req, res, next) => {
  const rawState = typeof req.query.state === 'string' ? req.query.state : ''
  if (!rawState.startsWith('discord|')) return next()

  try {
    const state = rawState.slice('discord|'.length)
    const code = typeof req.query.code === 'string' ? req.query.code : ''
    if (!code || !verifyState(state)) {
      return res.status(400).type('html').send('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Discord · ValenciaPD</title><link rel="stylesheet" href="/site/pcs.css"></head><body><main class="page-hero"><div class="container"><span class="eyebrow">Discord</span><h1>Conexión no válida</h1><p class="page-lead">La solicitud ha caducado o no es válida. Vuelve a la web e inténtalo de nuevo.</p><a class="btn btn-primary btn-lg" href="/">Volver al inicio</a></div></main></body></html>')
    }
    const tokens = await exchangeCode(code)
    const user = await getDiscordUser(tokens.access_token)
    if (!(await isGuildMember(user.id))) await addUserToGuild(tokens.access_token, user.id)
    const displayName = htmlEscape(user.global_name || user.username)
    return res.status(200).type('html').send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Discord conectado · ValenciaPD</title><link rel="icon" type="image/png" href="/site/favicon.png"><link rel="stylesheet" href="/site/pcs.css"></head><body><main class="page-hero"><div class="container"><span class="eyebrow">Discord · Valencia PD</span><h1>Cuenta conectada correctamente</h1><p class="page-lead">Bienvenido/a, <strong>${displayName}</strong>. Tu cuenta de Discord ha quedado conectada con Valencia PD.</p><div class="cta-banner-actions"><a class="btn btn-primary btn-lg" href="/">Volver al inicio</a><a class="btn btn-ghost btn-lg" href="${env.publicUrl}">Abrir portal de verificación</a></div></div></main></body></html>`)
  } catch (error) {
    console.error('Discord connection error:', error)
    return res.status(500).type('html').send('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Discord · ValenciaPD</title><link rel="stylesheet" href="/site/pcs.css"></head><body><main class="page-hero"><div class="container"><span class="eyebrow">Discord</span><h1>No hemos podido conectar la cuenta</h1><p class="page-lead">El servicio de Discord ha rechazado temporalmente la solicitud. Inténtalo de nuevo desde Valencia PD.</p><a class="btn btn-primary btn-lg" href="/discord">Intentar de nuevo</a></div></main></body></html>')
  }
})

const siteRoutes = ['/', '/servidor', '/galeria', '/servicios', '/normativa', '/legal/privacidad', '/legal/terminos']
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

app.use((req, res) => {
  if (req.method === 'GET' && req.accepts('html')) {
    return res.status(404).sendFile(path.join(__dirname, '..', 'public', 'site', 'index.html'))
  }
  return res.status(404).json({ error: 'Not found' })
})

export default app
