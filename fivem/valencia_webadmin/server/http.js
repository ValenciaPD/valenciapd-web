// API HTTP para el panel web (valenciapd.es/admin).
// Ruta base: http://IP:PUERTO/valencia_webadmin/<ruta>
//
// Cada petición es POST con JSON y va firmada con el secreto compartido (convar valencia_webadmin_secret):
//   X-VPD-Timestamp: <ms unix>
//   X-VPD-Signature: hex(HMAC_SHA256(secret, `${timestamp}.${path}.${body}`))
// Las firmas caducan a los 60 s y no se pueden reutilizar, así que capturar una petición no sirve de nada.
//
// La lógica (permisos y acciones) está en Lua; aquí solo se valida la firma y se reenvía con eventos locales.

const crypto = require('crypto')

const SECRET = GetConvar('valencia_webadmin_secret', '')
const MAX_SKEW_MS = 60_000
const usedSignatures = new Map() // firma -> caducidad
const pending = new Map() // id -> callback
let nextId = 1

if (SECRET.length < 32) {
  console.log('^1[valencia_webadmin] Falta "set valencia_webadmin_secret" (mínimo 32 caracteres) en server.cfg. API desactivada.^0')
}

function header(req, name) {
  return req.headers[name] ?? req.headers[name.toLowerCase()] ?? ''
}

function verify(req, path, body) {
  if (SECRET.length < 32) return false
  const ts = Number(header(req, 'X-VPD-Timestamp'))
  const signature = String(header(req, 'X-VPD-Signature'))
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) return false
  if (!/^[0-9a-f]{64}$/.test(signature) || usedSignatures.has(signature)) return false

  const expected = crypto.createHmac('sha256', SECRET).update(`${ts}.${path}.${body}`).digest()
  const given = Buffer.from(signature, 'hex')
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return false

  const now = Date.now()
  for (const [sig, exp] of usedSignatures) if (exp < now) usedSignatures.delete(sig)
  usedSignatures.set(signature, now + MAX_SKEW_MS * 2)
  return true
}

function reply(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.send(JSON.stringify(payload))
}

on('valencia_webadmin:result', (id, status, payloadJson) => {
  const cb = pending.get(id)
  if (!cb) return
  pending.delete(id)
  cb(status, payloadJson)
})

SetHttpHandler((req, res) => {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Método no permitido' })

  req.setDataHandler((raw) => {
    const path = req.path
    if (!verify(req, path, raw || '')) return reply(res, 401, { error: 'No autorizado' })

    let body
    try {
      body = JSON.parse(raw)
    } catch {
      return reply(res, 400, { error: 'JSON no válido' })
    }
    if (!body || typeof body !== 'object') return reply(res, 400, { error: 'JSON no válido' })

    const id = nextId++
    const timeout = setTimeout(() => {
      if (pending.delete(id)) reply(res, 504, { error: 'El servidor tardó demasiado en responder' })
    }, 15_000)
    pending.set(id, (status, payloadJson) => {
      clearTimeout(timeout)
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
      res.send(payloadJson)
    })
    emit('valencia_webadmin:request', id, path, JSON.stringify(body))
  })
})
