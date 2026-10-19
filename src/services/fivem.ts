import { createHmac } from 'crypto'

import { env } from '../config/env.js'

// Cliente del recurso valencia_webadmin del servidor FiveM.
// Las peticiones van firmadas con HMAC (ver valencia_webadmin/server/http.js).

export class FivemError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function isFivemConfigured(): boolean {
  return env.fivem.apiSecret.length >= 32
}

export async function callFivem<T = unknown>(
  route: '/me' | '/action',
  payload: Record<string, unknown>,
): Promise<T> {
  if (!isFivemConfigured()) {
    throw new FivemError(503, 'El panel no está configurado (falta FIVEM_API_SECRET)')
  }

  const body = JSON.stringify(payload)
  const timestamp = Date.now().toString()
  const signature = createHmac('sha256', env.fivem.apiSecret)
    .update(`${timestamp}.${route}.${body}`)
    .digest('hex')

  let response: Response
  try {
    response = await fetch(`${env.fivem.apiUrl}${route}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VPD-Timestamp': timestamp,
        'X-VPD-Signature': signature,
      },
      body,
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    throw new FivemError(502, 'No se pudo conectar con el servidor de FiveM. ¿Está encendido?')
  }

  const text = await response.text()
  let data: { error?: string } & Record<string, unknown>
  try {
    data = JSON.parse(text)
  } catch {
    throw new FivemError(502, 'Respuesta no válida del servidor de FiveM')
  }

  if (!response.ok) {
    throw new FivemError(response.status, data.error || `Error ${response.status} del servidor de FiveM`)
  }

  return data as T
}
