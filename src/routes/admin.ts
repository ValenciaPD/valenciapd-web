import { Router, type NextFunction, type Request, type Response } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import { getGuildMember } from '../services/discord.js'
import { callFivem, FivemError, isFivemConfigured, type FivemIdentity } from '../services/fivem.js'
import { getDiscordSession, type DiscordSession } from '../services/session.js'
import { env } from '../config/env.js'

const router = Router()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ADMIN_DIR = path.join(__dirname, '..', '..', 'components', 'admin')

// Roles de Discord con acceso al panel. Lo que cada uno puede hacer lo decide su grupo en luxu_admin.
const STAFF_ROLES: Record<string, string> = {
  '1537177254713495683': 'Fundador',
  '1537182711846805554': 'Co-fundador',
  '1537171214106361866': 'Administrador',
  '1546601389613125772': 'Jefe de staff',
  '1537177961843925096': 'Moderador',
  '1537177832650707047': 'Soporte',
  '1537177910287278111': 'Helper',
}

// El panel exige haber iniciado sesión con Discord hace menos de 12 h (la cookie general dura 7 días)
const ADMIN_SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000
const ROLE_CACHE_MS = 20_000
const RATE_LIMIT = { windowMs: 60_000, max: 300 }
const MAX_BODY_BYTES = 32 * 1024

// ---------------------------------------------------------------------------------------------- cabeceras de seguridad
const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data: https://cdn.discordapp.com",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('Content-Security-Policy', CSP)
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  next()
}
router.use(['/admin', '/api/admin'], securityHeaders)

// ---------------------------------------------------------------------------------------------- sesión y roles
interface StaffContext {
  session: DiscordSession
  identity: FivemIdentity
  staffRoles: string[]
}

const roleCache = new Map<string, { roles: string[]; exp: number }>()

async function getRoles(discordId: string): Promise<string[]> {
  const hit = roleCache.get(discordId)
  if (hit && hit.exp > Date.now()) return hit.roles
  const member = await getGuildMember(discordId)
  const roles = member?.roles ?? []
  roleCache.set(discordId, { roles, exp: Date.now() + ROLE_CACHE_MS })
  if (roleCache.size > 5000) roleCache.clear()
  return roles
}

function adminSession(req: Request): DiscordSession | null {
  const session = getDiscordSession(req)
  if (!session || Date.now() - session.createdAt > ADMIN_SESSION_MAX_AGE_MS) return null
  return session
}

async function getStaff(req: Request): Promise<StaffContext | 'no-session' | 'no-staff'> {
  const session = adminSession(req)
  if (!session) return 'no-session'
  const roles = await getRoles(session.id)
  const staffRoles = roles.filter(r => Object.hasOwn(STAFF_ROLES, r))
  if (staffRoles.length === 0) return 'no-staff'
  return { session, staffRoles, identity: { discordId: session.id, roles, name: session.displayName } }
}

// ---------------------------------------------------------------------------------------------- límites
const hits = new Map<string, { count: number; reset: number }>()
function rateLimited(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + RATE_LIMIT.windowMs })
    if (hits.size > 10_000) hits.clear()
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT.max
}

// Las peticiones que cambian algo deben venir de esta misma web (además de la cookie SameSite=Lax)
function sameOrigin(req: Request): boolean {
  const origin = req.headers.origin
  if (!origin) return false
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

function sendError(res: Response, error: unknown) {
  if (error instanceof FivemError) return res.status(error.status).json({ error: error.message })
  console.error('Admin panel error:', error)
  return res.status(500).json({ error: 'Error interno' })
}

// ---------------------------------------------------------------------------------------------- páginas
router.get('/admin', (req, res) => {
  if (!adminSession(req)) return res.redirect('/discord?next=admin')
  return res.sendFile(path.join(ADMIN_DIR, 'index.html'))
})

const ASSETS: Record<string, string> = { 'admin.js': 'application/javascript; charset=utf-8', 'admin.css': 'text/css; charset=utf-8' }
router.get('/admin/assets/:file', (req, res) => {
  const type = ASSETS[req.params.file]
  if (!type) return res.status(404).end()
  res.type(type)
  return res.sendFile(path.join(ADMIN_DIR, req.params.file))
})

router.get('/admin/logout', (_req, res) => {
  res.append('Set-Cookie', 'vpd_discord=; Domain=.valenciapd.es; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax')
  res.append('Set-Cookie', 'vpd_discord=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax')
  return res.redirect('/')
})

// ---------------------------------------------------------------------------------------------- API
router.get('/api/admin/me', async (req, res) => {
  try {
    const staff = await getStaff(req)
    if (staff === 'no-session') return res.status(401).json({ error: 'Inicia sesión con Discord' })
    if (staff === 'no-staff') return res.status(403).json({ error: 'No tienes un rol de staff en el Discord de Valencia PD' })
    if (rateLimited(staff.session.id)) return res.status(429).json({ error: 'Demasiadas peticiones, espera un momento' })

    const user = {
      id: staff.session.id,
      displayName: staff.session.displayName,
      avatarUrl: staff.session.avatarUrl,
      discordRoles: staff.staffRoles.map(r => STAFF_ROLES[r]),
    }
    if (!isFivemConfigured()) return res.status(503).json({ user, error: 'El panel no está configurado todavía (falta FIVEM_API_SECRET en Vercel)' })

    const luxu = await callFivem<Record<string, unknown>>('/webadmin/me', { ...staff.identity })
    return res.json({ user, ...luxu })
  } catch (error) {
    return sendError(res, error)
  }
})

// Diagnóstico de la conexión web -> FiveM. No expone datos: solo si el servidor responde y si el secreto coincide.
const DIAG_URLS = ['https://deprecated-gaa58qq.users.cfx.re/luxu_admin', 'https://gaa58qq.users.cfx.re/luxu_admin']
router.get('/api/admin/diag', async (_req, res) => {
  if (!isFivemConfigured()) return res.json({ configured: false, result: 'missing_secret' })
  const probe = async (url: string) => {
    try {
      // ID imposible: si la firma es válida, luxu responde 403 "sin grupo de staff"
      await callFivem('/webadmin/me', { discordId: '0', roles: [], name: 'diag' }, url)
      return 'ok'
    } catch (error) {
      if (!(error instanceof FivemError)) return 'error'
      return error.status === 403 ? 'ok' : error.message === 'No autorizado' ? 'bad_secret' : error.status === 502 && /conectar/.test(error.message) ? 'unreachable' : `http_${error.status}`
    }
  }
  const [current, ...alts] = await Promise.all([probe(env.fivem.apiUrl), ...DIAG_URLS.map(probe)])
  return res.json({ configured: true, result: current, alternatives: Object.fromEntries(DIAG_URLS.map((u, i) => [new URL(u).host, alts[i]])) })
})

router.post('/api/admin/call', async (req, res) => {
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Origen no permitido' })
  if (!req.is('application/json')) return res.status(415).json({ error: 'Tipo de contenido no válido' })
  if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) return res.status(413).json({ error: 'Petición demasiado grande' })

  try {
    const staff = await getStaff(req)
    if (staff === 'no-session') return res.status(401).json({ error: 'Tu sesión ha caducado, vuelve a iniciar sesión' })
    if (staff === 'no-staff') return res.status(403).json({ error: 'No tienes un rol de staff' })
    if (rateLimited(staff.session.id)) return res.status(429).json({ error: 'Demasiadas peticiones, espera un momento' })

    const { op, data } = req.body ?? {}
    if (typeof op !== 'string' || !/^[a-z_]{2,40}(\.[a-z_]{2,40})?$/.test(op)) return res.status(400).json({ error: 'Operación no válida' })
    if (data !== undefined && (typeof data !== 'object' || data === null || Array.isArray(data))) return res.status(400).json({ error: 'Datos no válidos' })

    const result = await callFivem('/webadmin/call', { ...staff.identity, op, data: data ?? {} })
    if (!/^(stream_poll|stream_signal|panel|console_read|chat_messages)$/.test(op)) console.log(`[admin] ${staff.session.username} (${staff.session.id}) -> ${op}`)
    return res.json(result)
  } catch (error) {
    return sendError(res, error)
  }
})

export default router
