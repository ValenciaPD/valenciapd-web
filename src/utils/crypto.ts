import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'crypto'

import { env } from '../config/env.js'

interface StatePayload {
  nonce: string
  createdAt: number
}

interface VerificationPayload {
  discordId: string
  nonce: string
  expiresAt: number
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

    const a = Buffer.from(signature)
    const b = Buffer.from(expected)

    if (
      a.length !== b.length ||
      !timingSafeEqual(a, b)
    ) {
      return false
    }

    const payload =
      JSON.parse(
        Buffer
          .from(encoded, 'base64url')
          .toString('utf8'),
      ) as StatePayload

    const age =
      Date.now() - payload.createdAt

    if (
      age < 0 ||
      age > 10 * 60 * 1000
    ) {
      return false
    }

    return true
  } catch {
    return false
  }
}

// -----------------------------------------------------
// VERIFICATION TICKET
// -----------------------------------------------------

export function createVerificationTicket(
  discordId: string,
): string {
  const payload: VerificationPayload = {
    discordId,
    nonce: randomBytes(16).toString('hex'),
    expiresAt:
      Date.now() + 5 * 60 * 1000,
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

export function verifyVerificationTicket(
  ticket: string,
): VerificationPayload | null {
  try {
    const [encoded, signature] =
      ticket.split('.')

    if (!encoded || !signature) {
      return null
    }

    const expected =
      createHmac(
        'sha256',
        env.security.sessionSecret,
      )
        .update(encoded)
        .digest('base64url')

    const a = Buffer.from(signature)
    const b = Buffer.from(expected)

    if (
      a.length !== b.length ||
      !timingSafeEqual(a, b)
    ) {
      return null
    }

    const payload =
      JSON.parse(
        Buffer
          .from(encoded, 'base64url')
          .toString('utf8'),
      ) as VerificationPayload

    if (
      !payload.discordId ||
      !payload.nonce ||
      !payload.expiresAt
    ) {
      return null
    }

    if (
      Date.now() > payload.expiresAt
    ) {
      return null
    }

    return payload
  } catch {
    return null
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
