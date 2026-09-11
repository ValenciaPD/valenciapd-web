import express from 'express'
import path from 'path'
import { createHmac, timingSafeEqual } from 'crypto'
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

function createDiscordSession(user: { id: string; username: string; global_name?: string | null; avatar?: string | null }): string {
  const payload = {
    id: user.id,
    displayName: user.global_name || user.username,
    username: user.username,
    avatarUrl: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : null,
    createdAt: Date.now(),
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', env.security.sessionSecret).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

function getDiscordSession(req: express.Request): { id: string; displayName: string; username: string; avatarUrl: string | null } | null {
  try {
    const cookieHeader = req.headers.cookie || ''
    const match = cookieHeader.split(';').map(part => part.trim()).find(part => part.startsWith('vpd_discord='))
    const raw = match?.slice('vpd_discord='.length)
    if (!raw) return null
    const [encoded, signature] = raw.split('.')
    if (!encoded || !signature) return null
    const expected = createHmac('sha256', env.security.sessionSecret).update(encoded).digest('base64url')
    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as { id?: string; displayName?: string; username?: string; avatarUrl?: string | null; createdAt?: number }
    if (!payload.id || !payload.displayName || !payload.username || !payload.createdAt) return null
    if (Date.now() - payload.createdAt > 7 * 24 * 60 * 60 * 1000) return null
    return { id: payload.id, displayName: payload.displayName, username: payload.username, avatarUrl: payload.avatarUrl ?? null }
  } catch {
    return null
  }
}

function htmlEscape(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

app.get('/discord', (_req, res) => {
  const state = `discord|${createState()}`
  return res.redirect(getDiscordOAuthUrl(state))
})

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
    const session = createDiscordSession(user)
    res.setHeader('Set-Cookie', `vpd_discord=${session}; Domain=.valenciapd.es; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; Secure; SameSite=Lax`)
    return res.redirect('https://www.valenciapd.es/')
  } catch (error) {
    console.error('Discord connection error:', error)
    return res.status(500).type('html').send('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Discord · ValenciaPD</title><link rel="stylesheet" href="/site/pcs.css"></head><body><main class="page-hero"><div class="container"><span class="eyebrow">Discord</span><h1>No hemos podido conectar la cuenta</h1><p class="page-lead">El servicio de Discord ha rechazado temporalmente la solicitud. Inténtalo de nuevo desde Valencia PD.</p><a class="btn btn-primary btn-lg" href="/discord">Intentar de nuevo</a></div></main></body></html>')
  }
})

app.get('/api/discord/me', (req, res) => {
  const session = getDiscordSession(req)
  if (!session) return res.json({ authenticated: false })
  return res.json({ authenticated: true, ...session })
})

app.post('/discord/logout', (_req, res) => {
  res.setHeader('Set-Cookie', 'vpd_discord=; Domain=.valenciapd.es; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax')
  return res.status(204).end()
})

const siteRoutes = ['/', '/servidor', '/galeria', '/servicios', '/normativa', '/guia-inicio', '/estado', '/postular', '/legal/privacidad', '/legal/terminos']
app.get(siteRoutes, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'site', 'index.html'))
})

app.get('/instagram', (_req, res) => res.redirect('https://www.instagram.com/valenciapd_/'))
app.get('/tiktok', (_req, res) => res.redirect('https://www.tiktok.com/@valenciapd_'))
app.get('/twitch', (_req, res) => res.redirect('https://www.twitch.tv/valenciapd'))
app.get('/fivem', (_req, res) => res.redirect('https://servers.fivem.net/servers/detail/gaa58qq'))
app.get('/desbaneos', (_req, res) => res.redirect('https://discord.gg/pGXCRVg7yF'))

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

app.use(verificationRoutes)
app.use(transcriptRoutes)

app.use((req, res) => {
  if (req.method === 'GET' && req.accepts('html')) {
    return res.status(404).sendFile(path.join(__dirname, '..', 'public', 'site', 'index.html'))
  }
  return res.status(404).json({ error: 'Not found' })
})

export default app
