import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GALLERY } from "@/lib/site";

export const Route = createFileRoute("/galeria")({
  component: GaleriaPage,
  head: () => ({
    meta: [
      { title: "Galería · Valencia PD" },
      { name: "description", content: "Capturas del servidor de roleplay Valencia PD: patrullas, vehículos e intervenciones en juego." },
      { property: "og:title", content: "Galería · Valencia PD" },
      { property: "og:description", content: "Momentos capturados en el servidor Valencia PD." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/galeria" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/galeria" }],
  }),
});

function GaleriaPage() {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => ((i ?? 0) + 1) % GALLERY.length);
      if (e.key === "ArrowLeft") setOpen((i) => ((i ?? 0) - 1 + GALLERY.length) % GALLERY.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Galería</span>
          <h1>Vistazo en juego</h1>
          <p className="page-lead">Algunos momentos capturados en el servidor Valencia PD.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="gallery-grid">
            {GALLERY.map((src, i) => (
              <button type="button" className="gallery-item" key={i} onClick={() => setOpen(i)} aria-label={`Ampliar la imagen ${i + 1}`}>
                <img src={src} alt={`Captura de Valencia PD ${i + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className={`lightbox${open !== null ? " open" : ""}`} onClick={() => setOpen(null)}>
        {open !== null && (
          <>
            <img className="lightbox-img" src={GALLERY[open]} alt="" onClick={(e) => e.stopPropagation()} />
            <button className="lightbox-close" aria-label="Cerrar" onClick={() => setOpen(null)}>
              ✕
            </button>
            <button
              className="lightbox-nav lightbox-prev"
              aria-label="Anterior"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((i) => ((i ?? 0) - 1 + GALLERY.length) % GALLERY.length);
              }}
            >
              ‹
            </button>
            <button
              className="lightbox-nav lightbox-next"
              aria-label="Siguiente"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((i) => ((i ?? 0) + 1) % GALLERY.length);
              }}
            >
              ›
            </button>
          </>
        )}
      </div>
    </main>
  );
}
