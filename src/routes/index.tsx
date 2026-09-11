import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { useReveal } from "@/components/site/useReveal";
import { DISCORD_URL, SERVER_IP } from "@/lib/site";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Inicio · Valencia PD" },
      {
        name: "description",
        content:
          "Valencia PD — Servidor de roleplay FivePD ambientado en la Comunidad Valenciana. Policía Nacional, Guardia Civil, Policía Local, SAMU y Bomberos.",
      },
      { property: "og:title", content: "Inicio · Valencia PD" },
      {
        property: "og:description",
        content: "Servidor de roleplay FivePD ambientado en la Comunidad Valenciana. Únete al Discord y entra en patrulla.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Index() {
  useReveal();

  return (
    <main>
      <HeroCarousel />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Por qué unirte</span>
            <h2>Una experiencia cuidada al detalle</h2>
            <p className="section-lead">Todo está calibrado para un roleplay inmersivo, fluido y serio.</p>
          </div>

          <div className="grid grid-3" data-reveal>
            <article className="card feature-card">
              <span className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
              </span>
              <h3>Rol inmersivo</h3>
              <p>Rol coherente y de calidad, sin EGO RP y con una normativa aplicada con criterio.</p>
            </article>
            <article className="card feature-card">
              <span className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              <h3>Servicios de emergencia completos</h3>
              <p>Policía Nacional, Guardia Civil, Policía Local, SAMU y Bomberos con jerarquía y equipamiento propios.</p>
            </article>
            <article className="card feature-card">
              <span className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-6 0v4" />
                  <rect x="5" y="9" width="14" height="11" rx="2" />
                </svg>
              </span>
              <h3>Tres AOP distintos</h3>
              <p>Valencia Centro, Torrent y Burjassot: el rol cambia de escenario según la actividad del servidor.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Conectar</span>
            <h2>Entra en el servidor</h2>
            <p className="section-lead">
              Abre FiveM y usa la IP directa: <strong>{SERVER_IP}</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner card" data-reveal>
            <div>
              <h2>¿Listo para vestir el uniforme?</h2>
              <p>Crea tu personaje, únete a una patrulla y vive el rol policial como nunca.</p>
            </div>
            <div className="cta-banner-actions">
              <a href={DISCORD_URL} target="_blank" rel="noopener" className="btn btn-primary btn-lg">
                Unirse ahora
              </a>
              <Link to="/servidor" className="btn btn-ghost btn-lg">
                Saber más
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
