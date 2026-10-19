import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import transcriptRoutes from './routes/transcripts.js'
import verificationRoutes from './routes/verification.js'
import adminRoutes from './routes/admin.js'
import { env } from './config/env.js'
import { createState, verifyState } from './utils/crypto.js'
import { exchangeCode, getDiscordOAuthUrl, getDiscordUser, isGuildMember, addUserToGuild } from './services/discord.js'
import { createDiscordSession, getDiscordSession, OAUTH_NONCE_COOKIE, readCookie } from './services/session.js'
import { randomBytes } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.disable('x-powered-by')

app.use(express.json({ limit: '10mb' }))

app.use(express.static(path.join(__dirname, '..', 'public')))

function htmlEscape(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

// El callback de Discord puede llegar por otro subdominio: la cookie del nonce vale para todo valenciapd.es
function cookieDomain(req: express.Request): string {
  return /(^|\.)valenciapd\.es$/.test(req.hostname) ? ' Domain=.valenciapd.es;' : ''
}

app.get('/discord', (req, res) => {
  // ?next=admin -> tras el login vuelve al panel de staff
  const nonce = randomBytes(16).toString('hex')
  res.append('Set-Cookie', `${OAUTH_NONCE_COOKIE}=${nonce};${cookieDomain(req)} Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`)
  const state = req.query.next === 'admin' ? `discord|admin|${nonce}|${createState()}` : `discord|${nonce}|${createState()}`
  return res.redirect(getDiscordOAuthUrl(state))
})

app.get('/callback', async (req, res, next) => {
  const rawState = typeof req.query.state === 'string' ? req.query.state : ''
  if (!rawState.startsWith('discord|')) return next()

  try {
    let state = rawState.slice('discord|'.length)
    const toAdmin = state.startsWith('admin|')
    if (toAdmin) state = state.slice('admin|'.length)
    const [nonce, ...rest] = state.split('|')
    state = rest.join('|')
    const expectedNonce = readCookie(req, OAUTH_NONCE_COOKIE)
    res.append('Set-Cookie', `${OAUTH_NONCE_COOKIE}=;${cookieDomain(req)} Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`)
    const code = typeof req.query.code === 'string' ? req.query.code : ''
    if (!code || !verifyState(state) || !nonce || nonce !== expectedNonce) {
      return res.status(400).type('html').send('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Discord · ValenciaPD</title><link rel="stylesheet" href="/site/pcs.css"></head><body><main class="page-hero"><div class="container"><span class="eyebrow">Discord</span><h1>Conexión no válida</h1><p class="page-lead">La solicitud ha caducado o no es válida. Vuelve a la web e inténtalo de nuevo.</p><a class="btn btn-primary btn-lg" href="/">Volver al inicio</a></div></main></body></html>')
    }
    const tokens = await exchangeCode(code)
    const user = await getDiscordUser(tokens.access_token)
    if (!(await isGuildMember(user.id))) await addUserToGuild(tokens.access_token, user.id)
    const session = createDiscordSession(user)
    res.append('Set-Cookie', `vpd_discord=${session}; Domain=.valenciapd.es; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; Secure; SameSite=Lax`)
    return res.redirect(toAdmin ? 'https://www.valenciapd.es/admin' : 'https://www.valenciapd.es/')
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

app.use(adminRoutes)
app.use(verificationRoutes)
app.use(transcriptRoutes)

app.use((req, res) => {
  if (req.method === 'GET' && req.accepts('html')) {
    return res.status(404).sendFile(path.join(__dirname, '..', 'public', 'site', 'index.html'))
  }
  return res.status(404).json({ error: 'Not found' })
})

export default app
