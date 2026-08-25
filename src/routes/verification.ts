import { Router, Request } from 'express'
import { env } from '../config/env.js'
import {
  createState,
  verifyState,
  verifyVerificationTicket,
  createVerificationTicket,
  hashIp,
} from '../utils/crypto.js'
import { checkIp, FFraudError } from '../services/ffraud.js'
import {
  findByDiscordId,
  findByIpHash,
  saveVerification,
  isTicketUsed,
  markTicketUsed,
} from '../services/verification-store.js'
import {
  getDiscordOAuthUrl,
  exchangeCode,
  getDiscordUser,
  addUserToGuild,
  addVerifiedRole,
  sendVerificationLog,
} from '../services/discord.js'

const router = Router()

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }

  if (Array.isArray(forwarded)) {
    return forwarded[0] || ''
  }

  return (req.socket.remoteAddress || '')
    .replace('::ffff:', '')
    .trim()
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function page(
  title: string,
  content: string,
  expiresAt?: number,
): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0b0f18">
<title>${escapeHtml(title)} · ValenciaPD</title>
<style>
:root{--bg:#0b0f18;--panel:#151b28;--panel2:#1a2130;--muted:#8f9bb0;--text:#f6f8fc;--blue:#5865f2;--orange:#ff7a00}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at 15% 10%,rgba(88,101,242,.10),transparent 26%),radial-gradient(circle at 85% 0%,rgba(255,122,0,.07),transparent 23%),linear-gradient(145deg,#080b12,#0d121d 48%,#0b0f18);color:var(--text)}
a{text-decoration:none;color:inherit}
.page{min-height:100vh;display:grid;grid-template-columns:minmax(0,1fr) 430px}
.left{padding:46px 5vw 38px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:14px;margin-bottom:82px}
.brand img{width:64px;height:64px;object-fit:contain;border-radius:14px;background:#050505}
.brand-name{font-size:20px;font-weight:800}
.brand-sub{font-size:13px;color:#8793a8;margin-top:3px}
.eyebrow{font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#8fa0ff;margin-bottom:16px}
h1{margin:0;max-width:920px;font-size:clamp(44px,5.2vw,72px);line-height:.98;letter-spacing:-.045em}
.hero{max-width:920px;font-size:20px;line-height:1.6;color:#93a0b7;margin:28px 0 34px}
.features,.steps,.info-grid{display:grid;gap:14px;max-width:1040px}
.features{grid-template-columns:repeat(3,1fr)}
.feature,.step,.info{padding:20px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:linear-gradient(180deg,rgba(24,31,45,.92),rgba(18,24,36,.84))}
.icon{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#1d2639;border:1px solid rgba(131,149,255,.18);margin-bottom:14px}
.feature strong,.step strong,.info strong{display:block;margin-bottom:7px}
.feature span,.step span,.info span{font-size:13px;line-height:1.5;color:#8d99af}
.kicker{margin:68px 0 20px;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#8793aa}
.steps{grid-template-columns:repeat(3,1fr)}
.num{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#192238;color:#9aa6ff;margin-bottom:18px;font-weight:800}
.info-grid{grid-template-columns:repeat(2,1fr)}
.bottom{margin-top:auto;padding-top:48px;color:#69758b;font-size:12px}
.right{border-left:1px solid rgba(255,255,255,.06);background:rgba(17,22,33,.94);padding:34px;display:flex;align-items:center}
.side{width:100%;padding:34px;border:1px solid rgba(255,255,255,.08);border-radius:22px;background:linear-gradient(180deg,#171e2b,#121823);box-shadow:0 28px 80px rgba(0,0,0,.45)}
.ready{display:flex;align-items:center;gap:9px;color:#66d6a8;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:18px}
.dot{width:8px;height:8px;border-radius:50%;background:#66d6a8;box-shadow:0 0 12px rgba(102,214,168,.5)}
.side h2{font-size:34px;line-height:1.02;letter-spacing:-.035em;margin:0}
.side p{font-size:14px;line-height:1.6;color:#95a2b8}
.timer{padding:18px;border-radius:16px;background:#1b2231;border:1px solid rgba(255,255,255,.07);margin:20px 0 16px}
.tlabel{font-size:10px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#77849d}
.tvalue{font-size:36px;font-weight:800;margin-top:5px}
.bar{height:6px;background:#273044;border-radius:999px;overflow:hidden;margin-top:13px}.bar>span{display:block;height:100%;width:100%;background:#7280ff;transform-origin:left}
.secure{padding:15px;border-radius:14px;background:#1a2130;border:1px solid rgba(255,255,255,.07);font-size:12px;color:#9ca8bc;margin-bottom:14px}
.checks{display:grid;gap:12px;margin:18px 0}.check{display:flex;gap:10px;align-items:flex-start;color:#9ca8bc;font-size:12px}.checkmark{width:22px;height:22px;flex:0 0 22px;display:grid;place-items:center;border-radius:7px;background:#1c2537;border:1px solid rgba(124,142,255,.25);color:#9aa6ff}
.button{display:flex;align-items:center;justify-content:center;min-height:58px;border-radius:13px;background:linear-gradient(180deg,#6772ff,#5360e8);color:#fff;font-weight:800;box-shadow:0 12px 28px rgba(88,101,242,.24)}
.button.orange{background:linear-gradient(180deg,#ff861f,#f56f00)}
@media(max-width:1050px){.page{grid-template-columns:1fr}.right{border-left:0;border-top:1px solid rgba(255,255,255,.06)}}
@media(max-width:700px){.left{padding:28px 20px}.brand{margin-bottom:52px}.features,.steps,.info-grid{grid-template-columns:1fr}.right{padding:20px}.side{padding:25px 20px}.hero{font-size:17px}}
</style>
</head>
<body>
<div class="page">
<section class="left">
<div class="brand">
<img src="/valenciapd-verification-logo.png" alt="ValenciaPD">
<div><div class="brand-name">ValenciaPD</div><div class="brand-sub">Portal de verificación segura</div></div>
</div>
${content}
<div class="bottom">© ValenciaPD · Verificación de miembros · Comunitat Valenciana</div>
</section>
<aside class="right">
<div class="side">
<div class="ready"><span class="dot"></span> LISTO PARA VERIFICAR</div>
<h2>Conecta tu cuenta de Discord</h2>
<p>Utiliza el botón de abajo para iniciar sesión de forma segura mediante Discord.</p>
${expiresAt ? `<div class="timer"><div class="tlabel">La solicitud caduca en</div><div id="tvalue" class="tvalue">5:00</div><div class="bar"><span id="bar"></span></div></div>` : ''}
<div class="secure">🔒 La autenticación se realiza mediante Discord. ValenciaPD no recibe ni almacena tu contraseña.</div>
${expiresAt ? `<div class="checks"><div class="check"><div class="checkmark">✓</div><div>Perfil y cuenta de Discord</div></div><div class="check"><div class="checkmark">✓</div><div>VPN, proxy, Tor y red de datos</div></div><div class="check"><div class="checkmark">✓</div><div>Posible multicuenta y señales de riesgo</div></div></div>` : ''}
</div>
</aside>
</div>
${expiresAt ? `<script>
const expires=${expiresAt},total=300000;
function tick(){const r=Math.max(0,expires-Date.now()),s=Math.ceil(r/1000),m=Math.floor(s/60),q=s%60;document.getElementById('tvalue').textContent=m+':'+String(q).padStart(2,'0');document.getElementById('bar').style.transform='scaleX('+Math.min(1,r/total)+')';if(r>0)setTimeout(tick,250)} tick()
</script>` : ''}
</body>
</html>`
}

router.post('/api/verification/ticket', async (req, res) => {
  try {
    const auth = req.headers.authorization

    if (auth !== `Bearer ${env.security.botApiSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const discordId = req.body?.discordId

    if (
      typeof discordId !== 'string' ||
      !/^\d{17,20}$/.test(discordId)
    ) {
      return res.status(400).json({ error: 'Invalid Discord ID' })
    }

    // 5-minute signed ticket. No database roundtrip is needed for creation.
    const ticket = createVerificationTicket(discordId)
    const url = `${env.publicUrl}/verify?code=${encodeURIComponent(ticket)}`

    await sendVerificationLog({
      title: '🔐 Nueva solicitud de verificación',
      color: 0x5865F2,
      fields: [
        {
          name: 'Usuario',
          value: `<@${discordId}>`,
          inline: true,
        },
        {
          name: 'ID',
          value: discordId,
          inline: true,
        },
        {
          name: 'Estado',
          value: 'Pendiente · 5 minutos',
          inline: true,
        },
      ],
    })

    return res.status(201).json({
      success: true,
      expiresIn: 300,
      url,
    })
  } catch (error) {
    console.error('Ticket creation error:', error)
    return res.status(500).json({ error: 'Failed to create verification ticket' })
  }
})

router.get('/verify', (req, res) => {
  const ticket = typeof req.query.code === 'string' ? req.query.code : null

  if (!ticket) {
    return res.status(400).type('html').send(
      page(
        'Verificación no disponible',
        `
          <div class="eyebrow">VALENCIAPD · VERIFICACIÓN DE MIEMBROS</div>
          <h1>Inicia la verificación desde Discord</h1>
          <p class="hero">
            Este portal utiliza enlaces individuales generados por el bot de ValenciaPD.
            Vuelve a Discord y pulsa <strong>Verificar cuenta</strong>.
          </p>
        `,
      ),
    )
  }

  const payload = verifyVerificationTicket(ticket)

  if (!payload) {
    return res.status(400).type('html').send(
      page(
        'Verificación caducada',
        `
          <div class="eyebrow">VALENCIAPD · SEGURIDAD</div>
          <h1>El enlace ha caducado</h1>
          <p class="hero">
            Esta solicitud ya no es válida. Vuelve a Discord y genera una nueva.
          </p>
        `,
      ),
    )
  }

  const state = createState()
  const oauthState = `${state}|${ticket}`
  const discordUrl = getDiscordOAuthUrl(oauthState)

  return res.type('html').send(
    page(
      'Verificación ValenciaPD',
      `
        <div class="eyebrow">VALENCIAPD · VERIFICACIÓN DE MIEMBROS</div>
        <h1>Verifica tu cuenta para acceder al servidor</h1>
        <p class="hero">
          Completa una autenticación segura con Discord para confirmar tu cuenta
          y proteger la comunidad frente a conexiones anónimas y posibles cuentas alternativas.
        </p>

        <div class="features">
          <div class="feature"><div class="icon">🔐</div><strong>Autenticación OAuth2</strong><span>Inicio de sesión oficial de Discord. Tu contraseña nunca pasa por ValenciaPD.</span></div>
          <div class="feature"><div class="icon">🛡️</div><strong>Comprobaciones de seguridad</strong><span>Revisamos VPN, proxy, Tor, datacenter y señales de riesgo.</span></div>
          <div class="feature"><div class="icon">✓</div><strong>Rol de Miembro</strong><span>Si todo es correcto, el acceso y el rol se conceden automáticamente.</span></div>
        </div>

        <div class="kicker">Cómo funciona</div>
        <div class="steps">
          <div class="step"><div class="num">1</div><strong>Inicia sesión con Discord</strong><span>Autentícate mediante el sistema oficial de Discord.</span></div>
          <div class="step"><div class="num">2</div><strong>Comprobaciones</strong><span>Analizamos la conexión y las señales de seguridad.</span></div>
          <div class="step"><div class="num">3</div><strong>Acceso desbloqueado</strong><span>Si todo está correcto, recibirás el rol Miembro.</span></div>
        </div>

        <div class="kicker">Qué comprobamos</div>
        <div class="info-grid">
          <div class="info"><strong>Perfil de Discord</strong><span>Identificación de la cuenta necesaria para completar el acceso.</span></div>
          <div class="info"><strong>Conexión</strong><span>VPN, proxy, Tor, hosting/datacenter y riesgo de IP.</span></div>
          <div class="info"><strong>Posible multicuenta</strong><span>Comparamos un hash de IP con verificaciones anteriores.</span></div>
          <div class="info"><strong>Acceso</strong><span>El rol se asigna únicamente después de pasar las comprobaciones.</span></div>
        </div>

        <div class="kicker">Continuar</div>
        <a class="button" href="${escapeHtml(discordUrl)}">Continuar con Discord</a>
      `,
      payload.expiresAt,
    ),
  )
})

router.get('/callback', async (req, res) => {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : null
    const rawState = typeof req.query.state === 'string' ? req.query.state : null

    if (!code || !rawState) {
      return res.status(400).type('html').send(
        page(
          'Solicitud inválida',
          `<div class="eyebrow">VALENCIAPD · ERROR</div><h1>Solicitud inválida</h1><p class="hero">No se han recibido todos los datos necesarios.</p>`,
        ),
      )
    }

    const separatorIndex = rawState.lastIndexOf('|')

    if (separatorIndex === -1) {
      return res.status(400).type('html').send(
        page(
          'Solicitud inválida',
          `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>Solicitud inválida</h1><p class="hero">El estado de seguridad no es válido.</p>`,
        ),
      )
    }

    const state = rawState.slice(0, separatorIndex)
    const ticket = rawState.slice(separatorIndex + 1)

    if (!verifyState(state)) {
      return res.status(400).type('html').send(
        page(
          'Sesión caducada',
          `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>La sesión ha caducado</h1><p class="hero">Vuelve a Discord y genera una nueva solicitud.</p>`,
        ),
      )
    }

    const ticketPayload = verifyVerificationTicket(ticket)

    if (!ticketPayload) {
      return res.status(400).type('html').send(
        page(
          'Verificación caducada',
          `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>El enlace ha caducado</h1><p class="hero">Vuelve a Discord y genera una nueva verificación.</p>`,
        ),
      )
    }

    if (await isTicketUsed(ticketPayload.nonce)) {
      return res.status(400).type('html').send(
        page(
          'Enlace utilizado',
          `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>Este enlace ya fue utilizado</h1><p class="hero">Genera una nueva solicitud desde Discord.</p>`,
        ),
      )
    }

    const tokens = await exchangeCode(code)
    const user = await getDiscordUser(tokens.access_token)

    await sendVerificationLog({
      title: '🔑 OAuth2 de Discord completado',
      color: 0x5865F2,
      fields: [
        {
          name: 'Usuario',
          value: `<@${user.id}>`,
          inline: true,
        },
        {
          name: 'ID',
          value: user.id,
          inline: true,
        },
        {
          name: 'Etapa',
          value: 'Identidad de Discord obtenida',
          inline: true,
        },
      ],
    })

    if (user.id !== ticketPayload.discordId) {
      return res.status(403).type('html').send(
        page(
          'Cuenta incorrecta',
          `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>Has iniciado sesión con otra cuenta</h1><p class="hero">Este enlace pertenece a otra cuenta de Discord. Vuelve a Discord y utiliza tu propia solicitud.</p>`,
        ),
      )
    }

    const ip = getClientIp(req)

    if (!ip) {
      throw new Error('No se pudo determinar la IP del cliente')
    }

    const ipHash = hashIp(ip)
    const existingDiscord = await findByDiscordId(user.id)

    if (existingDiscord) {
      await addUserToGuild(tokens.access_token, user.id)
      await addVerifiedRole(user.id)
      await markTicketUsed({
        nonce: ticketPayload.nonce,
        discordId: user.id,
        usedAt: new Date().toISOString(),
      })

      return res.status(200).type('html').send(
        page(
          'Verificación completada',
          `<div class="eyebrow">VALENCIAPD · VERIFICACIÓN COMPLETADA</div><h1>¡Ya estabas verificado!</h1><p class="hero">Hola, <strong>${escapeHtml(user.global_name || user.username)}</strong>. Tu acceso ha sido actualizado.</p><div class="info-grid"><div class="info"><strong>✓ Cuenta Discord</strong><span>Identificada correctamente.</span></div><div class="info"><strong>✓ Rol Miembro</strong><span>Asignado correctamente.</span></div></div>`,
        ),
      )
    }

    const existingIp = await findByIpHash(ipHash)

    if (existingIp && existingIp.discordId !== user.id) {
      await sendVerificationLog({
        title: '🚫 Posible multicuenta detectada',
        color: 0xED4245,
        fields: [
          {
            name: 'Usuario',
            value: `<@${user.id}>`,
            inline: true,
          },
          {
            name: 'ID',
            value: user.id,
            inline: true,
          },
          {
            name: 'Resultado',
            value: 'IP hash ya asociada a otra cuenta',
            inline: false,
          },
        ],
      })

      return res.status(403).type('html').send(
        page(
          'Posible multicuenta',
          `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>Verificación no disponible</h1><p class="hero">Esta conexión ya está asociada a otra cuenta verificada en ValenciaPD.</p><p class="hero">Si se trata de un error, contacta con la administración.</p>`,
        ),
      )
    }

    let ffraud

    try {
      ffraud = await checkIp(ip)
    } catch (error) {
      if (error instanceof FFraudError) {
        console.error('FFraud error:', error.message)
        return res.status(503).type('html').send(
          page(
            'Comprobación temporalmente no disponible',
            `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>No se pudo comprobar la conexión</h1><p class="hero">El servicio de inteligencia de IP no respondió correctamente. No se ha concedido el rol.</p><p class="hero">Vuelve a intentarlo en unos minutos.</p>`,
          ),
        )
      }
      throw error
    }

    console.log('FFraud verification:', {
      discordId: user.id,
      vpn: ffraud.vpn,
      proxy: ffraud.proxy,
      tor: ffraud.tor,
      hosting: ffraud.hosting,
      fraud_score: ffraud.fraud_score,
      risk: ffraud.risk,
      confidence: ffraud.confidence,
    })

    await sendVerificationLog({
      title: '🛡️ Resultado FFraud',
      color: 0x5865F2,
      fields: [
        {
          name: 'Usuario',
          value: `<@${user.id}>`,
          inline: true,
        },
        {
          name: 'Fraud score',
          value: String(ffraud.fraud_score ?? 'N/D'),
          inline: true,
        },
        {
          name: 'VPN / Proxy / Tor',
          value: `${ffraud.vpn ? 'VPN' : 'No VPN'} · ${ffraud.proxy ? 'Proxy' : 'No Proxy'} · ${ffraud.tor ? 'Tor' : 'No Tor'}`,
          inline: false,
        },
        {
          name: 'Hosting',
          value: ffraud.hosting ? 'Sí' : 'No',
          inline: true,
        },
        {
          name: 'Riesgo',
          value: String(ffraud.risk ?? 'N/D'),
          inline: true,
        },
      ],
    })

    if (ffraud.vpn || ffraud.tor) {
      return res.status(403).type('html').send(
        page(
          'Conexión no permitida',
          `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>VPN o Tor detectado</h1><p class="hero">No se permiten verificaciones realizadas mediante VPN o Tor. Desactiva la conexión y vuelve a iniciar la verificación desde Discord.</p>`,
        ),
      )
    }

    if (ffraud.proxy) {
      return res.status(403).type('html').send(
        page(
          'Proxy detectado',
          `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>Proxy detectado</h1><p class="hero">Hemos detectado una conexión mediante proxy. Desactiva el proxy e inténtalo de nuevo.</p>`,
        ),
      )
    }

    // FFraud documents 75+ as critical.
    // We also block high-confidence hosting/datacenter at 75+,
    // while not rejecting ordinary residential/mobile IPs.
    if (
      typeof ffraud.fraud_score === 'number' &&
      ffraud.fraud_score >= 75
    ) {
      return res.status(403).type('html').send(
        page(
          'Riesgo elevado',
          `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>Verificación rechazada</h1><p class="hero">La conexión ha sido clasificada como de riesgo elevado.</p><p class="hero">${escapeHtml(ffraud.reason || 'La dirección IP presenta señales de riesgo.')}</p>`,
        ),
      )
    }

    if (
      ffraud.hosting &&
      ffraud.confidence === 'high' &&
      typeof ffraud.fraud_score === 'number' &&
      ffraud.fraud_score >= 50
    ) {
      return res.status(403).type('html').send(
        page(
          'Red no permitida',
          `<div class="eyebrow">VALENCIAPD · SEGURIDAD</div><h1>Red de alojamiento detectada</h1><p class="hero">La conexión parece proceder de una red de datacenter o hosting y no cumple nuestros criterios de verificación.</p>`,
        ),
      )
    }

    await addUserToGuild(tokens.access_token, user.id)
    await addVerifiedRole(user.id)

    await sendVerificationLog({
      title: '✅ Verificación completada',
      color: 0x57D69A,
      fields: [
        {
          name: 'Usuario',
          value: `<@${user.id}>`,
          inline: true,
        },
        {
          name: 'ID',
          value: user.id,
          inline: true,
        },
        {
          name: 'Rol',
          value: `<@&${env.discord.verifiedRoleId}>`,
          inline: true,
        },
        {
          name: 'Resultado',
          value: 'Acceso concedido y rol asignado',
          inline: false,
        },
      ],
    })

    await saveVerification({
      discordId: user.id,
      username: user.global_name || user.username,
      ipHash,
      verifiedAt: new Date().toISOString(),
    })

    await markTicketUsed({
      nonce: ticketPayload.nonce,
      discordId: user.id,
      usedAt: new Date().toISOString(),
    })

    return res.status(200).type('html').send(
      page(
        'Verificación completada',
        `<div class="eyebrow">VALENCIAPD · VERIFICACIÓN COMPLETADA</div><h1>¡Cuenta verificada!</h1><p class="hero">Bienvenido/a, <strong>${escapeHtml(user.global_name || user.username)}</strong>. Todas las comprobaciones se han completado correctamente.</p><div class="info-grid"><div class="info"><strong>✓ Cuenta Discord</strong><span>Identificada correctamente.</span></div><div class="info"><strong>✓ Conexión</strong><span>Comprobación de seguridad completada.</span></div><div class="info"><strong>✓ Servidor</strong><span>Acceso concedido a ValenciaPD.</span></div><div class="info"><strong>✓ Rol Miembro</strong><span>Asignado automáticamente.</span></div></div>`,
      ),
    )
  } catch (error) {
    console.error('Verification error:', error)

    try {
      const detail =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error)

      await sendVerificationLog({
        title: '❌ Error durante la verificación',
        color: 0xED4245,
        fields: [
          {
            name: 'Detalle',
            value: detail.slice(0, 1000),
            inline: false,
          },
        ],
      })
    } catch (logError) {
      console.error('Could not write verification error log:', logError)
    }

    return res.status(500).type('html').send(
      page(
        'Error de verificación',
        `<div class="eyebrow">VALENCIAPD · ERROR</div><h1>Algo salió mal</h1><p class="hero">No hemos podido completar la verificación en este momento.</p><a class="button orange" href="/">Volver</a>`,
      ),
    )
  }
})

export default router
