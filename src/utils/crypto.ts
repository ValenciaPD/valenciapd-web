import {
  createHash,
  createHmac,
  randomBytes,
} from 'crypto'

import { env } from '../config/env.js'

interface StatePayload {
  nonce: string
  createdAt: number
}

export function createState(): string {
  const payload: StatePayload = {
    nonce: randomBytes(32).toString('hex'),
    createdAt: Date.now(),
  }

  const encoded = Buffer
    .from(JSON.stringify(payload))
    .toString('base64url')

  const signature = createHmac(
    'sha256',
    env.security.sessionSecret,
  )
    .update(encoded)
    .digest('base64url')

  return `${encoded}.${signature}`
}

export function verifyState(
  state: string,
): boolean {
  try {
    const [encoded, signature] =
      state.split('.')

    if (!encoded || !signature) {
      return false
    }

    const expected =
      createHmac(
        'sha256',
        env.security.sessionSecret,
      )
        .update(encoded)
        .digest('base64url')

    if (signature !== expected) {
      return false
    }

    const payload =
      JSON.parse(
        Buffer
          .from(encoded, 'base64url')
          .toString('utf8'),
      ) as StatePayload

    // El estado solamente es válido durante 10 minutos.
    const age =
      Date.now() - payload.createdAt

    if (age < 0 || age > 10 * 60 * 1000) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function hashIp(
  ip: string,
): string {
  return createHash('sha256')
    .update(
      `${env.security.multiaccountSalt}:${ip}`,
    )
    .digest('hex')
}
