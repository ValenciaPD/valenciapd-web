import {
  Router,
  Request,
} from 'express'

import { env } from '../config/env.js'

import {
  createState,
  verifyState,
  hashIp,
} from '../utils/crypto.js'

import {
  checkIP,
} from '../services/ipqs.js'

import {
  findByDiscordId,
  findByIpHash,
  saveVerification,
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
      background: rgba(18, 24, 38, 0.92);

      border: 1px solid
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

      background: rgba(255, 106, 0, 0.12);

      border: 1px solid
        rgba(255, 106, 0, 0.3);

      color: #ff8a3d;

      font-size: 13px;
      font-weight: 700;

      margin-bottom: 18px;
    }

    h1 {
      margin: 0 0 16px;

      font-size: clamp(
        32px,
        5vw,
        54px
      );

      line-height: 1.05;
    }

    h2 {
      margin-top: 0;
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

      border: 1px solid
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

// -----------------------------------------------------
// GET /verify
// -----------------------------------------------------

router.get(
  '/verify',
  (req, res) => {
    const state =
      createState()

    const discordUrl =
      getDiscordOAuthUrl(state)

    res.type('html').send(
      page(
        'Verificación',
        `
          <div class="badge">
            VERIFICACIÓN OFICIAL
          </div>

          <h1>
            Verifica tu cuenta
          </h1>

          <p>
            Para acceder a ValenciaPD,
            necesitas verificar tu cuenta
            de Discord.
          </p>

          <div class="features">

            <div class="feature">
              <strong>
                Discord
              </strong>

              <span>
                Inicia sesión mediante
                el sistema oficial
                de Discord.
              </span>
            </div>

            <div class="feature">
              <strong>
                Seguridad
              </strong>

              <span>
                Comprobamos la conexión
                para detectar VPN,
                proxy y Tor.
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

          <p style="font-size:13px;margin-top:22px">
            La autenticación se realiza
            mediante Discord. ValenciaPD
            no recibe ni almacena tu
            contraseña de Discord.
          </p>
        `,
      ),
    )
  },
)

// -----------------------------------------------------
// GET /callback
// -----------------------------------------------------

router.get(
  '/callback',
  async (req, res) => {
    try {

      const code =
        typeof req.query.code === 'string'
          ? req.query.code
          : null

      const state =
        typeof req.query.state === 'string'
          ? req.query.state
          : null

      const oauthError =
        typeof req.query.error === 'string'
          ? req.query.error
          : null

      // -------------------------------------------------
      // DISCORD CANCELLED
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
                  Has cancelado el acceso
                  mediante Discord.
                </p>

                <a
                  class="button orange"
                  href="/verify"
                >
                  Volver a verificar
                </a>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // VALIDATE STATE
      // -------------------------------------------------

      if (
        !code ||
        !state ||
        !verifyState(state)
      ) {
        return res
          .status(400)
          .type('html')
          .send(
            page(
              'Solicitud inválida',
              `
                <div class="badge">
                  ERROR DE SEGURIDAD
                </div>

                <h1>
                  Solicitud inválida
                </h1>

                <p>
                  La sesión de verificación
                  ha caducado o no es válida.
                </p>

                <a
                  class="button orange"
                  href="/verify"
                >
                  Intentar de nuevo
                </a>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // DISCORD TOKEN
      // -------------------------------------------------

      const tokens =
        await exchangeCode(code)

      // -------------------------------------------------
      // DISCORD USER
      // -------------------------------------------------

      const user =
        await getDiscordUser(
          tokens.access_token,
        )

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
      // ALREADY VERIFIED DISCORD ACCOUNT
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
                  Tu cuenta ya estaba
                  registrada en ValenciaPD.
                  Hemos actualizado tu acceso
                  al servidor.
                </p>

                <div class="status">
                  <strong>
                    ✓ Rol Miembro asignado
                  </strong>
                </div>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // MULTIACCOUNT CHECK
      // -------------------------------------------------

      const existingIp =
        await findByIpHash(
          ipHash,
        )

      if (
        existingIp &&
        existingIp.discordId !== user.id
      ) {

        console.warn(
          'Possible multi-account detected:',
          {
            discordId: user.id,
            previousDiscordId:
              existingIp.discordId,
          },
        )

        return res
          .status(403)
          .type('html')
          .send(
            page(
              'Verificación no disponible',
              `
                <div class="badge">
                  VERIFICACIÓN
                </div>

                <h1 class="error">
                  No hemos podido verificar
                  tu cuenta
                </h1>

                <p>
                  Nuestro sistema de seguridad
                  ha detectado que esta conexión
                  ya está asociada a otra cuenta
                  de ValenciaPD.
                </p>

                <p>
                  Si crees que se trata de un
                  error, contacta con el equipo
                  de administración de ValenciaPD.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // IPQS CHECK
      // -------------------------------------------------

      const ipqs =
        await checkIP(
          ip,
          req.headers['user-agent'] ||
            undefined,
          req.headers['accept-language'] ||
            undefined,
        )

      console.log(
        'IPQS verification:',
        {
          discordId: user.id,
          proxy: ipqs.proxy,
          vpn: ipqs.vpn,
          tor: ipqs.tor,
          active_vpn:
            ipqs.active_vpn,
          active_tor:
            ipqs.active_tor,
          fraud_score:
            ipqs.fraud_score,
        },
      )

      // -------------------------------------------------
      // VPN / PROXY / TOR
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
                  ValenciaPD no permite
                  verificaciones realizadas
                  mediante VPN o Tor.
                </p>

                <p>
                  Desactiva la VPN o conexión
                  anónima e inténtalo de nuevo.
                </p>

                <a
                  class="button orange"
                  href="/verify"
                >
                  Intentar de nuevo
                </a>
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
                  Desactiva el proxy e intenta
                  realizar la verificación
                  nuevamente.
                </p>

                <a
                  class="button orange"
                  href="/verify"
                >
                  Intentar de nuevo
                </a>
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
                  No hemos podido completar
                  la verificación
                </h1>

                <p>
                  Nuestro sistema de seguridad
                  ha marcado esta conexión
                  como de alto riesgo.
                </p>

                <p>
                  Si utilizas una conexión
                  normal y consideras que se
                  trata de un error, contacta
                  con la administración.
                </p>
              `,
            ),
          )
      }

      // -------------------------------------------------
      // ADD USER TO SERVER
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
      // SAVE VERIFICATION
      // -------------------------------------------------

      await saveVerification({
        discordId: user.id,

        username:
          user.global_name ||
          user.username,

        ipHash,

        verifiedAt:
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
                Tu cuenta ha sido verificada
                correctamente.
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
                Inténtalo de nuevo en unos
                minutos.
              </p>

              <a
                class="button orange"
                href="/verify"
              >
                Volver a verificar
              </a>
            `,
          ),
        )
    }
  },
)

export default router
