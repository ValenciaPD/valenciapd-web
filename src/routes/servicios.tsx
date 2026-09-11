import { createFileRoute } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import { DISCORD_URL, INSTAGRAM_URL, SERVER_CONNECT, SERVER_IP, TIKTOK_URL, TWITCH_URL } from "@/lib/site";

export const Route = createFileRoute("/servicios")({
  component: ServiciosPage,
  head: () => ({
    meta: [
      { title: "Servicios · Valencia PD" },
      { name: "description", content: "Discord, redes sociales y acceso al servidor de Valencia PD: TikTok, Instagram, Twitch e IP de conexión." },
      { property: "og:title", content: "Servicios · Valencia PD" },
      { property: "og:description", content: "Todos los enlaces oficiales de Valencia PD en un solo sitio." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/servicios" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/servicios" }],
  }),
});

const services = [
  { name: "Discord Valencia PD", desc: "Comunidad principal, tickets y anuncios.", href: DISCORD_URL, cta: "Unirse" },
  { name: "Servidor FiveM", desc: SERVER_IP, href: SERVER_CONNECT, cta: "Conectar" },
  { name: "TikTok", desc: "Clips y momentos del servidor.", href: TIKTOK_URL, cta: "Seguir" },
  { name: "Instagram", desc: "Novedades, flotas y eventos.", href: INSTAGRAM_URL, cta: "Seguir" },
  { name: "Twitch", desc: "Directos oficiales de Valencia PD.", href: TWITCH_URL, cta: "Ver" },
];

function ServiciosPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Comunidad</span>
          <h1>Nuestros servicios y redes</h1>
          <p className="page-lead">Todos los enlaces oficiales de Valencia PD reunidos aquí.</p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="grid grid-3">
            {services.map((s) => (
              <article className="card service-card" key={s.name}>
                <div className="service-head">
                  <img src={logo.url} alt="" className="service-logo" loading="lazy" />
                  <h3 className="service-name">{s.name}</h3>
                </div>
                <p className="service-desc">{s.desc}</p>
                <a href={s.href} target="_blank" rel="noopener" className="btn btn-discord btn-block service-join">
                  {s.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
