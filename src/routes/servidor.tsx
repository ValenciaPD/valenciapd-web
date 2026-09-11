import { createFileRoute } from "@tanstack/react-router";
import { useReveal } from "@/components/site/useReveal";
import { GALLERY, SERVER_IP } from "@/lib/site";

export const Route = createFileRoute("/servidor")({
  component: ServidorPage,
  head: () => ({
    meta: [
      { title: "El servidor · Valencia PD" },
      {
        name: "description",
        content: "Conoce Valencia PD: un FivePD ambientado en la Comunidad Valenciana con Policía Nacional, Guardia Civil, Policía Local, SAMU y Bomberos.",
      },
      { property: "og:title", content: "El servidor · Valencia PD" },
      { property: "og:description", content: "Historia, cuerpos, AOP y funcionamiento del servidor Valencia PD." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/servidor" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/servidor" }],
  }),
});

function ServidorPage() {
  useReveal();

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">El servidor</span>
          <h1>Bienvenido a Valencia PD</h1>
          <p className="page-lead">Una comunidad de roleplay en la modalidad FivePD ambientada en la Comunidad Valenciana.</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-2 align-center">
          <div>
            <span className="eyebrow">Qué es un FivePD</span>
            <h2>Emergencias contra maleantes</h2>
            <p className="prose">
              Un servidor FivePD es una modalidad de roleplay centrada únicamente en los <strong>servicios de emergencia</strong>. Existen dos bandos:
              los servicios de emergencia y los maleantes, encargados de generar rol protagonizando avisos.
            </p>
            <p className="prose">
              El <strong>AOP</strong> es el lugar donde se desarrolla el rol. Habitualmente, si no hay actividad IC el AOP es Torrent o Burjassot; cuando
              hay más actividad se cambia a Valencia Centro.
            </p>
            <p className="prose">
              Para entrar, abre FiveM y conecta con <strong>{SERVER_IP}</strong>.
            </p>
          </div>
          <div className="media-frame">
            <img src={GALLERY[1]} alt="Patrulla de Valencia PD en servicio" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Un equipo atento</span>
            <h2>Staff presente, todos los días</h2>
            <p className="section-lead">
              Las sanciones se imponen bajo criterio del staff en beneficio del servidor y de los jugadores. La edad mínima es de 15-16 años, según
              criterios de madurez valorados por la administración.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Los AOP</span>
            <h2>Tres escenarios, tres plantillas de servicios</h2>
            <p className="section-lead">Los cuerpos disponibles cambian según el AOP establecido.</p>
          </div>
          <div className="grid grid-3" data-reveal>
            <article className="card feature-card">
              <h3>AOP Valencia Centro (Ciudad)</h3>
              <p>Policía Nacional · Policía Municipal de Valencia · SAMU · Cuerpo de Bomberos del Ayuntamiento de Valencia.</p>
            </article>
            <article className="card feature-card">
              <h3>AOP Torrent (Paleto Bay)</h3>
              <p>Guardia Civil · Policía Local de Torrent · SAMU · Cuerpo de Bomberos de la Comunidad Valenciana.</p>
            </article>
            <article className="card feature-card">
              <h3>AOP Burjassot (Sandy Shores y Grapeseed)</h3>
              <p>Guardia Civil · Policía Local de Burjassot · SAMU · Cuerpo de Bomberos de la Comunidad Valenciana.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">En cifras</span>
            <h2>La comunidad de un vistazo</h2>
          </div>
          <div className="grid grid-4 stats-grid" data-reveal>
            <div className="card stat-card">
              <strong>3</strong>
              <span>AOP disponibles</span>
            </div>
            <div className="card stat-card">
              <strong>5</strong>
              <span>Cuerpos de emergencia</span>
            </div>
            <div className="card stat-card">
              <strong>99,9 %</strong>
              <span>Uptime del servidor</span>
            </div>
            <div className="card stat-card">
              <strong>24/7</strong>
              <span>Moderación activa</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
