import {
  Router,
  Request,
} from 'express'

import { env } from '../config/env.js'

import {
  createState,
  verifyState,
  createVerificationTicket,
  verifyVerificationTicket,
  hashIp,
} from '../utils/crypto.js'

import {
  checkIP,
} from '../services/ipqs.js'

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
} from '../services/discord.js'

const router = Router()

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------

function getClientIp(
  req: Request,
): string {
  const forwarded =
    req.headers['x-forwarded-for']

  if (typeof forwarded === 'string') {
    return forwarded
      .split(',')[0]
      .trim()
  }

  if (Array.isArray(forwarded)) {
    return forwarded[0]
  }

  return (
    req.socket.remoteAddress ||
    ''
  )
}

function escapeHtml(
  value: string,
): string {
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
): string {
  return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>${escapeHtml(title)} · ValenciaPD</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;

      font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      background:
        radial-gradient(
          circle at top,
          #202b46 0%,
          #0b0f18 55%,
          #070a10 100%
        );

      color: #f5f7fb;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 24px;
    }

    .container {
      width: 100%;
      max-width: 900px;
    }

    .card {
      background:
        rgba(18, 24, 38, 0.94);

      border:
        1px solid
        rgba(255, 255, 255, 0.08);

      border-radius: 20px;

      padding: 42px;

      box-shadow:
        0 25px 80px
        rgba(0, 0, 0, 0.45);

      backdrop-filter: blur(14px);
    }

    .logo {
      width: 84px;
      height: 84px;

      object-fit: contain;

      margin-bottom: 24px;
    }

    .badge {
      display: inline-block;

      padding: 6px 12px;

      border-radius: 999px;

      background:
        rgba(255, 106, 0, 0.12);

      border:
        1px solid
        rgba(255, 106, 0, 0.3);

      color: #ff8a3d;

      font-size: 13px;
      font-weight: 700;

      margin-bottom: 18px;
    }

    h1 {
      margin: 0 0 16px;

      font-size:
        clamp(32px, 5vw, 54px);

      line-height: 1.05;
    }

    p {
      color: #aeb8cb;

      font-size: 17px;

      line-height: 1.65;
    }

    .features {
      display: grid;

      grid-template-columns:
        repeat(
          3,
          minmax(0, 1fr)
        );

      gap: 14px;

      margin: 32px 0;
    }

    .feature {
      padding: 20px;

      border-radius: 14px;

      background:
        rgba(255, 255, 255, 0.035);

      border:
        1px solid
        rgba(255, 255, 255, 0.06);
    }

    .feature strong {
      display: block;

      margin-bottom: 8px;

      color: #ffffff;
    }

    .feature span {
      color: #8f9bb0;

      font-size: 14px;

      line-height: 1.5;
    }

    .button {
      display: inline-flex;

      align-items: center;
      justify-content: center;

      gap: 10px;

      padding: 14px 22px;

      border-radius: 12px;

      background: #5865f2;

      color: white;

      text-decoration: none;

      font-weight: 700;

      font-size: 16px;

      transition:
        transform .15s,
        background .15s;
    }

    .button:hover {
      background: #4752c4;

      transform:
        translateY(-1px);
    }

    .button.orange {
      background: #ff6a00;
    }

    .button.orange:hover {
      background: #e95d00;
    }

    .success {
      color: #67e8a5;
    }

    .error {
      color: #ff7c7c;
    }

    .status {
      margin-top: 24px;

      padding: 18px;

      border-radius: 12px;

      background:
        rgba(255, 255, 255, 0.04);
    }

    .timer {
      display: inline-block;

      margin-top: 10px;

      padding: 8px 12px;

      border-radius: 8px;

      background:
        rgba(88, 101, 242, 0.15);

      color: #9da7ff;

      font-weight: 700;
    }

    .footer {
      margin-top: 28px;

      color: #657086;

      font-size: 13px;

      text-align: center;
    }

    @media (max-width: 700px) {
      .card {
        padding: 28px 22px;
      }

      .features {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>

<body>

  <main class="container">

    <section class="card">

      <img
        class="logo"
        src="/logo.png"
        alt="ValenciaPD"
      >

      ${content}

      <div class="footer">
        ValenciaPD | Comunitat Valenciana
      </div>

    </section>

  </main>

</body>
</html>
`
}

// =====================================================
// BOT API
// POST /api/verification/ticket
// =====================================================

router.post(
  '/api/verification/ticket',
  async (req, res) => {
    try {
      const auth =
        req.headers.authorization

      if (
        !auth ||
        auth !==
          `Bearer ${env.security.botApiSecret}`
      ) {
        return res
          .status(401)
          .json({
            error: 'Unauthorized',
          })
      }

      const {
        discordId,
      } = req.body

      if (
        typeof discordId !== 'string' ||
        !/^\d{17,20}$/.test(discordId)
      ) {
        return res
          .status(400)
          .json({
            error:
              'Invalid Discord ID',
          })
      }

      const ticket =
        createVerificationTicket(
          discordId,
        )

      const url =
        `${env.publicUrl}/verify?code=${encodeURIComponent(ticket)}`

      return res
        .status(201)
        .json({
          success: true,
          expiresIn: 300,
          ticket,
          url,
        })

    } catch (error) {
      console.error(
        'Ticket creation error:',
        error,
      )

      return res
        .status(500)
        .json({
          error:
            'Failed to create verification ticket',
        })
    }
  },
)

// =====================================================
// GET /verify
// =====================================================

router.get(
  '/verify',
  (req, res) => {
    const ticket =
      typeof req.query.code === 'string'
        ? req.query.code
        : null

    if (!ticket) {
      return res
        .status(400)
        .type('html')
        .send(
          page(
            'Verificación no disponible',
            `
              <div class="badge">
                VALENCIAPD
              </div>

              <h1 class="error">
                Verificación no disponible
              </h1>

              <p>
                Debes iniciar la verificación
                desde el botón oficial
                de ValenciaPD en Discord.
              </p>

              <p>
                Los enlaces de verificación
                solamente son válidos durante
                5 minutos.
              </p>
            `,
          ),
        )
    }

    const ticketPayload =
      verifyVerificationTicket(ticket)

    if (!ticketPayload) {
      return res
        .status(400)
        .type('html')
        .send(
          page(
            'Verificación caducada',
            `
              <div class="badge">
                VALENCIAPD
              </div>

              <h1 class="error">
                El enlace ha caducado
              </h1>

              <p>
                Este enlace de verificación
                ya no es válido.
              </p>

              <p>
                Vuelve a Discord y pulsa
                nuevamente el botón
                <strong>
                  Verificar cuenta
                </strong>.
              </p>
            `,
          ),
        )
    }

    const state =
      createState()

    const oauthState =
      `${state}|${ticket}`

    const discordUrl =
      getDiscordOAuthUrl(
        oauthState,
      )

    res
      .type('html')
      .send(
        page(
          'Verificación ValenciaPD',
          `
            <div class="badge">
              VERIFICACIÓN OFICIAL
            </div>

            <h1>
              Verifica tu cuenta
            </h1>

            <p>
              Para acceder a ValenciaPD,
              necesitamos comprobar tu
              cuenta de Discord.
            </p>

            <div class="timer">
              Este enlace caduca en 5 minutos
            </div>

            <div class="features">

              <div class="feature">
                <strong>
                  Discord
                </strong>

                <span>
                  Utilizamos la autenticación
                  oficial de Discord.
                </span>
              </div>

              <div class="feature">
                <strong>
                  Seguridad
                </strong>

                <span>
                  Comprobamos VPN, proxy,
                  Tor y riesgo de conexión.
                </span>
              </div>

              <div class="feature">
                <strong>
                  Acceso
                </strong>

                <span>
                  Si todo está correcto,
                  recibirás automáticamente
                  el rol de Miembro.
                </span>
              </div>

            </div>

            <a
              class="button"
              href="${escapeHtml(discordUrl)}"
            >
              Continuar con Discord
            </a>

            <p
              style="
                font-size:13px;
                margin-top:22px
              "
            >
              La contraseña nunca se comparte
              con ValenciaPD. La autenticación
              se realiza directamente con Discord.
            </p>
          `,
        ),
      )
  },
)

// =====================================================
// GET /callback
// =====================================================

router.get(
  '/callback',
  async (req, res) => {
    try {
      const code =
        typeof req.query.code === 'string'
          ? req.query.code
          : null

      const rawState =
        typeof req.query.state === 'string'
          ? req.query.state
          : null

      const oauthError =
        typeof req.query.error === 'string'
          ? req.query.error
          : null

      // -------------------------------------------------
      // CANCELLED
      // -------------------------------------------------

      if (oauthError) {
        return res
          .status(400)
          .type('html')
          .send(
            page(
              'Verificación cancelada',
              `
                <div class="badge">
                  VERIFICACIÓN
                </div>

                <h1>
                  Verificación cancelada
                </h1>

                <p>
                  Has cancelado la autenticación
                  mediante Discord.
                </p>

                <p>
                  Vuelve a Discord y genera
                  una nueva solicitud.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // BASIC VALIDATION
      // -------------------------------------------------

      if (
        !code ||
        !rawState
      ) {
        return res
          .status(400)
          .type('html')
          .send(
            page(
              'Solicitud inválida',
              `
                <h1 class="error">
                  Solicitud inválida
                </h1>

                <p>
                  El enlace de verificación
                  no es válido.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // SPLIT OAUTH STATE + TICKET
      // -------------------------------------------------

      const separatorIndex =
        rawState.lastIndexOf('|')

      if (
        separatorIndex === -1
      ) {
        return res
          .status(400)
          .type('html')
          .send(
            page(
              'Solicitud inválida',
              `
                <h1 class="error">
                  Solicitud inválida
                </h1>

                <p>
                  El estado de seguridad
                  no es válido.
                </p>
              `,
            ),
          )
      }

      const state =
        rawState.slice(
          0,
          separatorIndex,
        )

      const ticket =
        rawState.slice(
          separatorIndex + 1,
        )

      // -------------------------------------------------
      // VALIDATE STATE
      // -------------------------------------------------

      if (
        !verifyState(state)
      ) {
        return res
          .status(400)
          .type('html')
          .send(
            page(
              'Sesión caducada',
              `
                <h1 class="error">
                  La sesión ha caducado
                </h1>

                <p>
                  Vuelve a Discord y genera
                  un nuevo enlace.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // VALIDATE TICKET
      // -------------------------------------------------

      const ticketPayload =
        verifyVerificationTicket(
          ticket,
        )

      if (!ticketPayload) {
        return res
          .status(400)
          .type('html')
          .send(
            page(
              'Verificación caducada',
              `
                <h1 class="error">
                  El enlace ha caducado
                </h1>

                <p>
                  Vuelve a Discord y pulsa
                  el botón de verificación
                  nuevamente.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // CHECK TICKET USED
      // -------------------------------------------------

      if (
        await isTicketUsed(
          ticketPayload.nonce,
        )
      ) {
        return res
          .status(400)
          .type('html')
          .send(
            page(
              'Enlace utilizado',
              `
                <h1 class="error">
                  Este enlace ya fue utilizado
                </h1>

                <p>
                  Vuelve a Discord y genera
                  una nueva verificación.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // EXCHANGE DISCORD CODE
      // -------------------------------------------------

      const tokens =
        await exchangeCode(
          code,
        )

      // -------------------------------------------------
      // GET DISCORD USER
      // -------------------------------------------------

      const user =
        await getDiscordUser(
          tokens.access_token,
        )

      // -------------------------------------------------
      // SAME DISCORD ACCOUNT
      // -------------------------------------------------

      if (
        user.id !==
        ticketPayload.discordId
      ) {
        return res
          .status(403)
          .type('html')
          .send(
            page(
              'Cuenta incorrecta',
              `
                <div class="badge">
                  SEGURIDAD
                </div>

                <h1 class="error">
                  Cuenta de Discord incorrecta
                </h1>

                <p>
                  Este enlace de verificación
                  pertenece a otra cuenta
                  de Discord.
                </p>

                <p>
                  Vuelve a Discord y utiliza
                  tu propio botón de
                  verificación.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // CLIENT IP
      // -------------------------------------------------

      const ip =
        getClientIp(req)

      if (!ip) {
        throw new Error(
          'Could not determine client IP',
        )
      }

      const ipHash =
        hashIp(ip)

      // -------------------------------------------------
      // ALREADY VERIFIED
      // -------------------------------------------------

      const existingDiscord =
        await findByDiscordId(
          user.id,
        )

      if (existingDiscord) {
        await addUserToGuild(
          tokens.access_token,
          user.id,
        )

        await addVerifiedRole(
          user.id,
        )

        await markTicketUsed({
          nonce:
            ticketPayload.nonce,

          discordId:
            user.id,

          usedAt:
            new Date().toISOString(),
        })

        return res
          .status(200)
          .type('html')
          .send(
            page(
              'Verificación completada',
              `
                <div class="badge">
                  VERIFICACIÓN COMPLETADA
                </div>

                <h1 class="success">
                  ¡Ya estabas verificado!
                </h1>

                <p>
                  Hola,
                  <strong>
                    ${escapeHtml(
                      user.global_name ||
                      user.username,
                    )}
                  </strong>.
                </p>

                <p>
                  Tu cuenta ya estaba registrada.
                  Hemos actualizado tu acceso
                  al servidor.
                </p>

                <div class="status">
                  <strong>
                    ✓ Rol Miembro asignado
                  </strong>
                </div>

                <p>
                  Ya puedes volver a Discord.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // MULTIACCOUNT
      // -------------------------------------------------

      const existingIp =
        await findByIpHash(
          ipHash,
        )

      if (
        existingIp &&
        existingIp.discordId !==
          user.id
      ) {
        console.warn(
          'Possible multi-account detected:',
          {
            discordId:
              user.id,

            previousDiscordId:
              existingIp.discordId,
          },
        )

        return res
          .status(403)
          .type('html')
          .send(
            page(
              'Cuenta no disponible',
              `
                <div class="badge">
                  SEGURIDAD
                </div>

                <h1 class="error">
                  No hemos podido verificar
                  tu cuenta
                </h1>

                <p>
                  Nuestro sistema ha detectado
                  que esta conexión ya está
                  asociada a otra cuenta
                  verificada en ValenciaPD.
                </p>

                <p>
                  Si crees que se trata de un
                  error, contacta con la
                  administración.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // IPQUALITYSCORE
      // -------------------------------------------------

      const ipqs =
        await checkIP(
          ip,
          typeof req.headers['user-agent'] ===
            'string'
            ? req.headers['user-agent']
            : undefined,

          typeof req.headers['accept-language'] ===
            'string'
            ? req.headers['accept-language']
            : undefined,
        )

      console.log(
        'IPQS verification:',
        {
          discordId:
            user.id,

          proxy:
            ipqs.proxy,

          vpn:
            ipqs.vpn,

          tor:
            ipqs.tor,

          active_vpn:
            ipqs.active_vpn,

          active_tor:
            ipqs.active_tor,

          fraud_score:
            ipqs.fraud_score,

          country:
            ipqs.country_code,
        },
      )

      // -------------------------------------------------
      // VPN / TOR
      // -------------------------------------------------

      if (
        ipqs.vpn ||
        ipqs.tor ||
        ipqs.active_vpn ||
        ipqs.active_tor
      ) {
        return res
          .status(403)
          .type('html')
          .send(
            page(
              'Conexión no permitida',
              `
                <div class="badge">
                  SEGURIDAD
                </div>

                <h1 class="error">
                  Conexión no permitida
                </h1>

                <p>
                  Hemos detectado una conexión
                  mediante VPN o Tor.
                </p>

                <p>
                  Desactiva la VPN o conexión
                  anónima y vuelve a iniciar
                  la verificación desde Discord.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // PROXY
      // -------------------------------------------------

      if (ipqs.proxy) {
        return res
          .status(403)
          .type('html')
          .send(
            page(
              'Proxy detectado',
              `
                <div class="badge">
                  SEGURIDAD
                </div>

                <h1 class="error">
                  Proxy detectado
                </h1>

                <p>
                  Hemos detectado una conexión
                  mediante proxy.
                </p>

                <p>
                  Desactiva el proxy y vuelve
                  a iniciar la verificación.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // HIGH RISK
      // -------------------------------------------------

      if (
        typeof ipqs.fraud_score ===
          'number' &&
        ipqs.fraud_score >= 90
      ) {
        return res
          .status(403)
          .type('html')
          .send(
            page(
              'Verificación rechazada',
              `
                <div class="badge">
                  SEGURIDAD
                </div>

                <h1 class="error">
                  Verificación rechazada
                </h1>

                <p>
                  Nuestro sistema de seguridad
                  ha marcado esta conexión
                  como de alto riesgo.
                </p>

                <p>
                  Si utilizas una conexión normal
                  y consideras que es un error,
                  contacta con la administración.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // ADD TO GUILD
      // -------------------------------------------------

      await addUserToGuild(
        tokens.access_token,
        user.id,
      )

      // -------------------------------------------------
      // ADD VERIFIED ROLE
      // -------------------------------------------------

      await addVerifiedRole(
        user.id,
      )

      // -------------------------------------------------
      // SAVE MEMBER
      // -------------------------------------------------

      await saveVerification({
        discordId:
          user.id,

        username:
          user.global_name ||
          user.username,

        ipHash,

        verifiedAt:
          new Date().toISOString(),
      })

      // -------------------------------------------------
      // BURN TICKET
      // -------------------------------------------------

      await markTicketUsed({
        nonce:
          ticketPayload.nonce,

        discordId:
          user.id,

        usedAt:
          new Date().toISOString(),
      })

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      return res
        .status(200)
        .type('html')
        .send(
          page(
            'Verificación completada',
            `
              <div class="badge">
                VERIFICACIÓN COMPLETADA
              </div>

              <h1 class="success">
                ¡Cuenta verificada!
              </h1>

              <p>
                Bienvenido/a,
                <strong>
                  ${escapeHtml(
                    user.global_name ||
                    user.username,
                  )}
                </strong>.
              </p>

              <p>
                Todas las comprobaciones
                se han completado correctamente.
              </p>

              <div class="status">

                <strong>
                  ✓ Cuenta Discord verificada
                </strong>

                <br><br>

                <strong>
                  ✓ Conexión comprobada
                </strong>

                <br><br>

                <strong>
                  ✓ Comprobación de seguridad
                </strong>

                <br><br>

                <strong>
                  ✓ Acceso al servidor concedido
                </strong>

                <br><br>

                <strong>
                  ✓ Rol Miembro asignado
                </strong>

              </div>

              <p>
                Ya puedes volver a Discord.
              </p>
            `,
          ),
        )

    } catch (error) {
      console.error(
        'Verification error:',
        error,
      )

      return res
        .status(500)
        .type('html')
        .send(
          page(
            'Error de verificación',
            `
              <div class="badge">
                ERROR
              </div>

              <h1 class="error">
                Algo salió mal
              </h1>

              <p>
                No hemos podido completar
                la verificación en este momento.
              </p>

              <p>
                Inténtalo de nuevo desde
                Discord.
              </p>

              <a
                class="button orange"
                href="/"
              >
                Volver
              </a>
            `,
          ),
        )
    }
  },
)

export default router
