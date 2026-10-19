import { Router, type Request, type Response } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import { getGuildMember } from '../services/discord.js'
import { callFivem, FivemError, isFivemConfigured } from '../services/fivem.js'
import { getDiscordSession, type DiscordSession } from '../services/session.js'

const router = Router()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ADMIN_PAGE = path.join(__dirname, '..', '..', 'components', 'admin.html')

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

interface StaffContext {
  session: DiscordSession
  roles: string[]
  staffRoles: string[]
}

async function getStaff(req: Request): Promise<StaffContext | 'no-session' | 'no-staff'> {
  const session = getDiscordSession(req)
  if (!session) return 'no-session'
  const member = await getGuildMember(session.id)
  const roles = member?.roles ?? []
  const staffRoles = roles.filter(r => r in STAFF_ROLES)
  if (staffRoles.length === 0) return 'no-staff'
  return { session, roles, staffRoles }
}

function fivemPayload(staff: StaffContext) {
  return { discordId: staff.session.id, roles: staff.roles, name: staff.session.displayName }
}

function sendError(res: Response, error: unknown) {
  if (error instanceof FivemError) return res.status(error.status).json({ error: error.message })
  console.error('Admin panel error:', error)
  return res.status(500).json({ error: 'Error interno' })
}

router.get('/admin', (req, res) => {
  if (!getDiscordSession(req)) return res.redirect('/discord?next=admin')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Frame-Options', 'DENY')
  return res.sendFile(ADMIN_PAGE)
})

router.get('/admin/logout', (_req, res) => {
  res.setHeader('Set-Cookie', 'vpd_discord=; Domain=.valenciapd.es; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax')
  return res.redirect('/')
})

router.get('/api/admin/me', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const staff = await getStaff(req)
    if (staff === 'no-session') return res.status(401).json({ error: 'Inicia sesión con Discord' })
    if (staff === 'no-staff') return res.status(403).json({ error: 'No tienes un rol de staff en el Discord de Valencia PD' })

    const user = {
      id: staff.session.id,
      displayName: staff.session.displayName,
      avatarUrl: staff.session.avatarUrl,
      discordRoles: staff.staffRoles.map(r => STAFF_ROLES[r]),
    }
    if (!isFivemConfigured()) return res.status(503).json({ user, error: 'El panel no está configurado todavía (falta FIVEM_API_SECRET en Vercel)' })

    const luxu = await callFivem<{ group: string; label: string; permissions: string[] }>('/me', fivemPayload(staff))
    return res.json({ user, group: luxu.group, groupLabel: luxu.label, permissions: luxu.permissions })
  } catch (error) {
    return sendError(res, error)
  }
})

router.post('/api/admin/action', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  // Solo JSON: un formulario de otra web no puede enviar application/json sin preflight CORS
  if (!req.is('application/json')) return res.status(415).json({ error: 'Tipo de contenido no válido' })

  try {
    const staff = await getStaff(req)
    if (staff === 'no-session') return res.status(401).json({ error: 'Inicia sesión con Discord' })
    if (staff === 'no-staff') return res.status(403).json({ error: 'No tienes un rol de staff' })

    const { action, target, data } = req.body ?? {}
    if (typeof action !== 'string' || !/^[a-z_.]{3,40}$/.test(action)) return res.status(400).json({ error: 'Acción no válida' })

    const result = await callFivem('/action', {
      ...fivemPayload(staff),
      action,
      target: typeof target === 'number' ? target : undefined,
      data: data && typeof data === 'object' ? data : {},
    })
    return res.json(result)
  } catch (error) {
    return sendError(res, error)
  }
})

export default router
