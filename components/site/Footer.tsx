import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import {
  DISCORD_URL,
  INSTAGRAM_URL,
  NORMATIVA_DISCORD_URL,
  NORMATIVA_GENERAL_URL,
  TIKTOK_URL,
  TWITCH_URL,
} from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src={logo.url} alt="" className="brand-logo footer-logo" />
          <div>
            <strong>VALENCIA PD</strong>
            <p>Comunidad de roleplay FivePD ambientada en la Comunidad Valenciana.</p>
          </div>
        </div>

        <nav className="footer-nav" aria-label="Enlaces del pie de página">
          <div className="footer-col">
            <h4>Servidor</h4>
            <Link to="/servidor">Presentación</Link>
            <Link to="/galeria">Galería</Link>
            <Link to="/servicios">Servicios</Link>
            <Link to="/normativa">Normativa</Link>
          </div>
          <div className="footer-col">
            <h4>Comunidad</h4>
            <a href={DISCORD_URL} target="_blank" rel="noopener">
              Discord principal
            </a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener">
              TikTok
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
              Instagram
            </a>
            <a href={TWITCH_URL} target="_blank" rel="noopener">
              Twitch
            </a>
          </div>
          <div className="footer-col">
            <h4>Normativa</h4>
            <a href={NORMATIVA_GENERAL_URL} target="_blank" rel="noopener">
              Normativa general (PDF)
            </a>
            <a href={NORMATIVA_DISCORD_URL} target="_blank" rel="noopener">
              Normativa Discord (PDF)
            </a>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Valencia PD. Proyecto de roleplay sin ánimo de lucro, no afiliado a Rockstar Games ni a ningún cuerpo policial real.</p>
        </div>
      </div>
    </footer>
  );
}
