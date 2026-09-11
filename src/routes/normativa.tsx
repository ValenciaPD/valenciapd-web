import { createFileRoute } from "@tanstack/react-router";
import { NORMATIVA_DISCORD_URL, NORMATIVA_GENERAL_URL } from "@/lib/site";

export const Route = createFileRoute("/normativa")({
  component: NormativaPage,
  head: () => ({
    meta: [
      { title: "Normativa · Valencia PD" },
      { name: "description", content: "Normativa general y normativa de Discord de Valencia PD. Lectura obligatoria para todos los jugadores y miembros." },
      { property: "og:title", content: "Normativa · Valencia PD" },
      { property: "og:description", content: "Normas del servidor y del Discord de Valencia PD, con los PDF oficiales descargables." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/normativa" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/normativa" }],
  }),
});

function NormativaPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Normativa</span>
          <h1>Normativa de Valencia PD</h1>
          <p className="page-lead">
            La no lectura o el desconocimiento de la normativa no exime de cumplirla ni de posibles sanciones.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container legal-layout">
          <aside className="toc card">
            <h4>Índice</h4>
            <nav>
              <a href="#introduccion">Introducción</a>
              <a href="#comandos">1. Comandos y comunicación</a>
              <a href="#conducta">2. Conducta en rol</a>
              <a href="#maleantes">3. Maleantes, robos y armas</a>
              <a href="#tecnicas">4. Trampas y programas externos</a>
              <a href="#discord">5. Normativa de Discord</a>
              <a href="#descargas">6. Descargas (PDF)</a>
            </nav>
          </aside>

          <div className="prose-block">
            <article id="introduccion" className="rule-section">
              <h2>Introducción</h2>
              <ul>
                <li>
                  <strong>Lectura obligatoria</strong> — El desconocimiento de la normativa no exime de cumplirla.
                </li>
                <li>
                  <strong>Criterio del staff</strong> — Las sanciones se imponen bajo criterio del staff en beneficio del servidor y los jugadores. Los
                  vacíos legales los resuelve el equipo de staff.
                </li>
                <li>
                  <strong>Edad mínima</strong> — 15-16 años bajo criterio de administración según madurez del jugador y de la voz.
                </li>
              </ul>
            </article>

            <article id="comandos" className="rule-section">
              <h2>Sección 1 — Comandos y comunicación</h2>
              <ul>
                <li>
                  <strong>1.1</strong> — <em>/ooc</em> habla con todo el servidor; <em>/oop</em> solo con quienes están en un radio cercano.
                </li>
                <li>
                  <strong>1.2</strong> — <em>/me</em> para acciones que no se pueden expresar IC y <em>/do</em> para sucesos del entorno.
                </li>
                <li>
                  <strong>1.3</strong> — Detener requiere que la persona esté de espaldas o en el suelo tras la reducción; cachear requiere que esté
                  quieta y colaborativa. Prohibido abusar de la animación de detención.
                </li>
                <li>
                  <strong>1.4</strong> — <em>/ayuda</em> solo para preguntas de jugadores; <em>/x</em> para mensajes anónimos tipo RRSS, nunca para
                  faltar al respeto o provocar.
                </li>
                <li>
                  <strong>1.5</strong> — No enviar avisos por <em>/112</em> cuando la situación requiere emergencias está sancionado.
                </li>
              </ul>
            </article>

            <article id="conducta" className="rule-section">
              <h2>Sección 2 — Conducta en rol</h2>
              <ul>
                <li>
                  <strong>2.1 Power Gaming (PG)</strong> — Realizar acciones imposibles en la vida real aunque el juego lo permita.
                </li>
                <li>
                  <strong>2.2 VDM y DM</strong> — Atropellar o matar a otro jugador sin contexto previo está prohibido.
                </li>
                <li>
                  <strong>2.3 Valorar vida y consecuencias</strong> — Valora la vida de tu personaje y las consecuencias de sus actos.
                </li>
                <li>
                  <strong>2.4 Conducción indebida</strong> — Prohibida la conducción temeraria en zonas de rol.
                </li>
                <li>
                  <strong>2.5 Respeto</strong> — Prohibida cualquier actitud tóxica, insultante o acosadora hacia jugadores y staff.
                </li>
                <li>
                  <strong>2.6 Personajes y peds</strong> — Atuendos y peds deben adecuarse al contexto. Peds de animales solo con autorización del staff.
                </li>
                <li>
                  <strong>2.7 Desconexión y evasión de rol</strong> — Prohibido desconectarse en medio de un rol o evitar sus consecuencias.
                </li>
                <li>
                  <strong>2.8 Modulador de voz</strong> — Prohibido para ocultar edad no permitida; solo con aprobación y supervisión del staff.
                </li>
                <li>
                  <strong>2.9 /camara</strong> — Prohibido usarlo para espiar conversaciones u obtener información que el personaje no debería tener.
                </li>
              </ul>
            </article>

            <article id="maleantes" className="rule-section">
              <h2>Sección 3 — Maleantes, robos y armas</h2>
              <ul>
                <li>
                  <strong>3.1 Persecuciones</strong> — Sin rol previo de peso no hay huída. Límite de <strong>2 persecuciones diarias por maleante</strong>.
                </li>
                <li>
                  <strong>3.2 Entorpecer roles</strong> — No entrometerse en un rol en curso sin autorización de los participantes.
                </li>
                <li>
                  <strong>3.3 Comisarías</strong> — Prohibido rolear en comisarías o alrededores sin autorización previa del staff.
                </li>
                <li>
                  <strong>3.4 Vehículos</strong> — Prohibido robar vehículos de emergencia o de NPC.
                </li>
                <li>
                  <strong>3.5 Robos de gran escala</strong> — Bancos, joyerías, etc. requieren autorización de administración. No hay negociación
                  policial ni recompensa: esto es un PD, no un roleplay habitual.
                </li>
                <li>
                  <strong>3.6 Armas</strong> — Uso de armas de fuego solo con autorización administrativa. Máximo un rol agresivo con armas por hora.
                </li>
                <li>
                  <strong>3.7 Autorizaciones</strong> — Si pides <em>/ayuda</em> o <em>/reportar</em> y no hay respuesta, acude a la sala de espera. Sin
                  respuesta allí, el rol queda <strong>NO AUTORIZADO</strong>.
                </li>
              </ul>
            </article>

            <article id="tecnicas" className="rule-section">
              <h2>Sección 4 — Trampas y programas externos</h2>
              <ul>
                <li>
                  <strong>4.1</strong> — Prohibido cualquier programa externo para modificar, dumpear, molestar, crashear o conseguir ventaja:{" "}
                  <strong>baneo permanente no apelable</strong>.
                </li>
                <li>
                  <strong>4.2</strong> — Prohibido aprovechar bugs o errores del servidor y no reportarlos al staff.
                </li>
              </ul>
            </article>

            <article id="discord" className="rule-section">
              <h2>Sección 5 — Normativa de Discord</h2>
              <ul>
                <li>
                  <strong>5.1 Respeto</strong> — Prohibida cualquier actitud tóxica, discriminatoria o acosadora hacia miembros y staff.
                </li>
                <li>
                  <strong>5.2 Contenido inapropiado</strong> — Nada sexual, violento, gore o discriminatorio, incluidos avatar, banner y estado.
                </li>
                <li>
                  <strong>5.3 Spam y flood</strong> — Sin mensajes repetidos, mayúsculas excesivas ni menciones masivas.
                </li>
                <li>
                  <strong>5.4 Publicidad</strong> — Prohibido publicitar otros servidores o enlaces, también por privado.
                </li>
                <li>
                  <strong>5.5 Multicuentas y suplantación</strong> — Prohibidas las cuentas alternativas para evadir sanciones y hacerse pasar por otros
                  o por staff.
                </li>
                <li>
                  <strong>5.6 Perfiles e idioma</strong> — Nombres y perfiles apropiados. El idioma oficial es el español.
                </li>
                <li>
                  <strong>5.7 Canales y voz</strong> — Cada canal para su finalidad. Prohibidos soundboards, ruidos molestos y saltos de canal para
                  molestar.
                </li>
                <li>
                  <strong>5.8 Tickets y bots</strong> — Tickets solo para gestiones reales; prohibido abusar de los comandos de los bots.
                </li>
                <li>
                  <strong>5.9 Privacidad</strong> — Prohibido publicar capturas o conversaciones privadas sin consentimiento.
                </li>
              </ul>
            </article>

            <article id="descargas" className="rule-section">
              <h2>Sección 6 — Documentos oficiales</h2>
              <p className="prose">
                Los documentos completos prevalecen sobre este resumen. Consúltalos y descárgalos aquí:
              </p>
              <div className="cta-banner-actions">
                <a href={NORMATIVA_GENERAL_URL} target="_blank" rel="noopener" className="btn btn-primary btn-lg">
                  Normativa general (PDF)
                </a>
                <a href={NORMATIVA_DISCORD_URL} target="_blank" rel="noopener" className="btn btn-ghost btn-lg">
                  Normativa Discord (PDF)
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
