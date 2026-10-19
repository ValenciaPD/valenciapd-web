import { createHmac } from 'crypto'
import mysql from 'mysql2/promise'

import { env } from '../config/env.js'

// Cliente del panel web integrado en luxu_admin (luxu_admin/server/webadmin.js).
// Las peticiones van firmadas con HMAC-SHA256, caducan a los 60 s y el servidor no acepta una firma dos veces.

export class FivemError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function isFivemConfigured(): boolean {
  return env.fivem.apiSecret.length >= 32
}

export interface FivemIdentity {
  discordId: string
  roles: string[]
  name: string
}

export async function callFivem<T = unknown>(
  route: '/webadmin/me' | '/webadmin/call',
  payload: FivemIdentity & Record<string, unknown>,
  baseUrl: string = env.fivem.apiUrl,
): Promise<T> {
  if (!isFivemConfigured()) {
    throw new FivemError(503, 'El panel no está configurado (falta FIVEM_API_SECRET en Vercel)')
  }

  const body = JSON.stringify(payload)
  const timestamp = Date.now().toString()
  const signature = createHmac('sha256', env.fivem.apiSecret)
    .update(`${timestamp}.${route}.${body}`)
    .digest('hex')

  if (env.fivem.dbUrl && baseUrl === env.fivem.apiUrl) return viaDatabase<T>(route, body, timestamp, signature)

  let response: Response
  try {
    response = await fetch(`${baseUrl}${route}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VPD-Timestamp': timestamp,
        'X-VPD-Signature': signature,
      },
      body,
      redirect: 'error',
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
    throw new FivemError(response.status === 401 ? 502 : response.status, data.error || `Error ${response.status} del servidor de FiveM`)
  }

  return data as T
}

// ------------------------------------------------------------------------------------------- buzón en MySQL
// luxu_admin (server/webadmin.js) revisa esta tabla cada 150-400 ms, verifica la firma y deja la respuesta.
const QUEUE = 'luxu_admin_webadmin_queue'
let pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  pool ??= mysql.createPool({ uri: env.fivem.dbUrl, connectionLimit: 3, connectTimeout: 8_000, enableKeepAlive: true })
  return pool
}

export function isDatabaseTransport(): boolean {
  return !!env.fivem.dbUrl
}

async function viaDatabase<T>(route: string, body: string, ts: string, sig: string): Promise<T> {
  let id: number
  try {
    const [res] = await getPool().execute<mysql.ResultSetHeader>(`INSERT INTO ${QUEUE} (route, body, ts, sig) VALUES (?, ?, ?, ?)`, [route, body, ts, sig])
    id = res.insertId
  } catch (error) {
    const code = (error as { code?: string }).code
    console.error('Buzón MySQL:', code || error)
    throw new FivemError(502, code === 'ER_NO_SUCH_TABLE'
      ? 'luxu_admin todavía no ha creado el buzón: reinicia luxu_admin en el servidor'
      : 'No se pudo conectar con la base de datos del servidor')
  }

  const deadline = Date.now() + 15_000
  let wait = 80
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, wait))
    wait = Math.min(wait + 40, 250)
    const [rows] = await getPool().execute<mysql.RowDataPacket[]>(`SELECT status, http_status, result FROM ${QUEUE} WHERE id = ?`, [id])
    const row = rows[0]
    if (!row || row.status !== 'done') continue
    getPool().execute(`DELETE FROM ${QUEUE} WHERE id = ?`, [id]).catch(() => {})
    let data: { error?: string } & Record<string, unknown>
    try {
      data = JSON.parse(row.result ?? 'null') ?? {}
    } catch {
      throw new FivemError(502, 'Respuesta no válida del servidor de FiveM')
    }
    const status = Number(row.http_status)
    if (status >= 400) throw new FivemError(status === 401 ? 502 : status, data.error || `Error ${status} del servidor de FiveM`)
    return data as T
  }
  getPool().execute(`DELETE FROM ${QUEUE} WHERE id = ? AND status = 'pending'`, [id]).catch(() => {})
  throw new FivemError(504, 'El servidor de FiveM no respondió. ¿Está encendido y luxu_admin iniciado?')
}
