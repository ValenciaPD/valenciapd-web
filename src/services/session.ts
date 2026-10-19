import type { Request } from 'express'
import { createHmac, timingSafeEqual } from 'crypto'

import { env } from '../config/env.js'

export interface DiscordSession {
  id: string
  displayName: string
  username: string
  avatarUrl: string | null
}

export function createDiscordSession(user: { id: string; username: string; global_name?: string | null; avatar?: string | null }): string {
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

export function getDiscordSession(req: Request): DiscordSession | null {
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
