import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DISCORD_URL, GALLERY, SERVER_CONNECT } from "@/lib/site";

type Slide = {
  img: string;
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
  actions: React.ReactNode;
};

const slides: Slide[] = [
  {
    img: GALLERY[0],
    eyebrow: "Servidor FivePD · Comunidad Valenciana",
    title: (
      <>
        Un servidor FivePD ambientado
        <br />
        <span className="accent">en la Comunidad Valenciana.</span>
      </>
    ),
    sub: "Rol policial, jerarquía e intervenciones reales, con servicios de emergencia españoles.",
    actions: (
      <>
        <a href={SERVER_CONNECT} className="btn btn-primary btn-lg btn-play">
          ▶ Jugar en Valencia PD
        </a>
        <a href={DISCORD_URL} target="_blank" rel="noopener" className="btn btn-ghost btn-lg">
          Unirse al Discord
        </a>
      </>
    ),
  },
  {
    img: GALLERY[1],
    eyebrow: "Los cuerpos",
    title: (
      <>
        Policía Nacional, Guardia Civil,
        <br />
        <span className="accent">Policía Local, SAMU y Bomberos.</span>
      </>
    ),
    sub: "Patrulla, sube de rango y vive intervenciones coordinadas entre todos los servicios.",
    actions: (
      <Link to="/servidor" className="btn btn-primary btn-lg">
        Descubrir el servidor
      </Link>
    ),
  },
  {
    img: GALLERY[0],
    eyebrow: "La comunidad",
    title: (
      <>
        Staff activo y normativa clara,
        <br />
        <span className="accent">rol serio y sin dramas.</span>
      </>
    ),
    sub: "Una comunidad activa día y noche, con moderación 24/7 y normativa aplicada con criterio.",
    actions: (
      <Link to="/normativa" className="btn btn-primary btn-lg">
        Leer la normativa
      </Link>
    ),
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, []);

  const go = (dir: number) => setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <section className="container hero-section">
      <div className="hero-carousel" id="hero-carousel" aria-roledescription="carrusel">
        <div className="hero-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((s, i) => (
            <article className="hero-slide" key={i}>
              <img className="hero-slide-img" src={s.img} alt="" loading={i === 0 ? "eager" : "lazy"} />
              <div className="hero-overlay">
                <div className="hero-text">
                  <span className="eyebrow">{s.eyebrow}</span>
                  <h1 className="hero-title">{s.title}</h1>
                  <p className="hero-sub">{s.sub}</p>
                  <div className="hero-cta">{s.actions}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button className="hero-arrow hero-prev" aria-label="Diapositiva anterior" onClick={() => go(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="hero-arrow hero-next" aria-label="Diapositiva siguiente" onClick={() => go(1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === index ? " active" : ""}`}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      <ul className="hero-stats" data-reveal>
        <li>
          <strong>FivePD</strong>
          <span>Modalidad de juego</span>
        </li>
        <li>
          <strong>3 AOP</strong>
          <span>Valencia, Torrent y Burjassot</span>
        </li>
        <li>
          <strong>99,9 %</strong>
          <span>Uptime del servidor</span>
        </li>
        <li>
          <strong>24/7</strong>
          <span>Moderación activa</span>
        </li>
      </ul>
    </section>
  );
}
