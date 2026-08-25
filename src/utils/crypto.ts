import {
  createHash,
  randomBytes,
} from 'crypto'

import { env } from '../config/env.js'

export function createState(): string {
  return randomBytes(32).toString('hex')
}

export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(
      `${env.security.multiaccountSalt}:${ip}`
    )
    .digest('hex')
}
