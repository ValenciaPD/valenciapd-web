(() => {
  const DISCORD = 'https://discord.gg/valenciapd';
  const SERVER_CONNECT = 'https://cfx.re/join/qqqb8mz';
  const SERVER_IP = 'connect cfx.re/join/qqqb8mz';
  const TIKTOK = 'https://www.tiktok.com/@valenciapd_';
  const INSTAGRAM = 'http://instagram.com/valenciapd_/';
  const TWITCH = 'https://www.twitch.tv/valenciapd';
  const LOGO = '/logo.png';
  // The ZIP contains asset manifests for these two images, but not the image bytes.
  // If you add public/gal1.png and public/gal2.png later, the site will use them automatically.
  const GALLERY = ['/gal1.png', '/gal2.png'];
  const PDF_GENERAL = '/normativa-general.pdf';
  const PDF_DISCORD = '/normativa-discord.pdf';

  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const app = document.getElementById('app');

  function navLink(href, label) {
    const active = path === href ? ' active' : '';
    return `<a href="${href}" class="${active ? 'active' : ''}">${label}</a>`;
  }

  function discordIcon() {
    return `<svg width="20" height="15" viewBox="0 0 127.14 96.36" fill="currentColor" aria-hidden="true"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/></svg>`;
  }

  function header() {
    return `<header class="site-header" id="site-header"><div class="container header-inner">
      <a href="/" class="brand" aria-label="Inicio Valencia PD"><img src="${LOGO}" alt="" class="brand-logo"><span class="brand-text">VALENCIA PD</span></a>
      <nav class="main-nav" id="main-nav" aria-label="Navegación principal">
        ${navLink('/servidor','El servidor')}
        ${navLink('/galeria','Galería')}
        ${navLink('/servicios','Servicios')}
        ${navLink('/normativa','Normativa')}
        <a class="nav-play" href="${SERVER_CONNECT}">▶ Jugar</a>
      </nav>
      <div class="header-actions">
        <a href="${DISCORD}" target="_blank" rel="noopener" class="btn btn-discord">${discordIcon()} Discord</a>
        <button class="nav-toggle" id="nav-toggle" aria-label="Abrir el menú" aria-expanded="false"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      </div>
    </div></header>`;
  }

  function footer() {
    return `<footer class="site-footer"><div class="container footer-inner">
      <div class="footer-brand"><img src="${LOGO}" alt="" class="brand-logo footer-logo"><div><strong>VALENCIA PD</strong><p>Comunidad de roleplay FivePD ambientada en la Comunidad Valenciana.</p></div></div>
      <nav class="footer-nav" aria-label="Enlaces del pie de página">
        <div class="footer-col"><h4>Servidor</h4><a href="/servidor">Presentación</a><a href="/galeria">Galería</a><a href="/servicios">Servicios</a><a href="/normativa">Normativa</a></div>
        <div class="footer-col"><h4>Comunidad</h4><a href="${DISCORD}" target="_blank" rel="noopener">Discord principal</a><a href="${TIKTOK}" target="_blank" rel="noopener">TikTok</a><a href="${INSTAGRAM}" target="_blank" rel="noopener">Instagram</a><a href="${TWITCH}" target="_blank" rel="noopener">Twitch</a></div>
        <div class="footer-col"><h4>Normativa</h4><a href="${PDF_GENERAL}" target="_blank" rel="noopener">Normativa general (PDF)</a><a href="${PDF_DISCORD}" target="_blank" rel="noopener">Normativa Discord (PDF)</a></div>
      </nav>
    </div><div class="footer-bottom"><div class="container"><p>© ${new Date().getFullYear()} Valencia PD. Proyecto de roleplay sin ánimo de lucro, no afiliado a Rockstar Games ni a ningún cuerpo policial real.</p></div></div></footer>`;
  }

  function assetImg(src, alt, cls='') {
    return `<img src="${src}" alt="${alt}" class="${cls}" onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('div'),{className:'asset-missing',innerHTML:'<span>Imagen pendiente de subir al repositorio.<br>Nombre esperado: <strong>${src.replace('/','')}</strong></span>'}))">`;
  }

  function hero() {
    return `<section class="container hero-section"><div class="hero-carousel" id="hero-carousel" aria-roledescription="carrusel">
      <div class="hero-track" id="hero-track">
        <article class="hero-slide">${assetImg(GALLERY[0],'','hero-slide-img')}<div class="hero-overlay"><div class="hero-text"><span class="eyebrow">Servidor FivePD · Comunidad Valenciana</span><h1 class="hero-title">Un servidor FivePD ambientado<br><span class="accent">en la Comunidad Valenciana.</span></h1><p class="hero-sub">Rol policial, jerarquía e intervenciones reales, con servicios de emergencia españoles.</p><div class="hero-cta"><a href="${SERVER_CONNECT}" class="btn btn-primary btn-lg btn-play">▶ Jugar en Valencia PD</a><a href="${DISCORD}" target="_blank" rel="noopener" class="btn btn-ghost btn-lg">Unirse al Discord</a></div></div></div></article>
        <article class="hero-slide">${assetImg(GALLERY[1],'','hero-slide-img')}<div class="hero-overlay"><div class="hero-text"><span class="eyebrow">Los cuerpos</span><h1 class="hero-title">Policía Nacional, Guardia Civil,<br><span class="accent">Policía Local, SAMU y Bomberos.</span></h1><p class="hero-sub">Patrulla, sube de rango y vive intervenciones coordinadas entre todos los servicios.</p><div class="hero-cta"><a href="/servidor" class="btn btn-primary btn-lg">Descubrir el servidor</a></div></div></div></article>
        <article class="hero-slide">${assetImg(GALLERY[0],'','hero-slide-img')}<div class="hero-overlay"><div class="hero-text"><span class="eyebrow">La comunidad</span><h1 class="hero-title">Staff activo y normativa clara,<br><span class="accent">rol serio y sin dramas.</span></h1><p class="hero-sub">Una comunidad activa día y noche, con moderación 24/7 y normativa aplicada con criterio.</p><div class="hero-cta"><a href="/normativa" class="btn btn-primary btn-lg">Leer la normativa</a></div></div></div></article>
      </div>
      <button class="hero-arrow hero-prev" aria-label="Diapositiva anterior" data-dir="-1">‹</button><button class="hero-arrow hero-next" aria-label="Diapositiva siguiente" data-dir="1">›</button>
      <div class="hero-dots"><button class="hero-dot active" data-slide="0" aria-label="Ir a la diapositiva 1"></button><button class="hero-dot" data-slide="1" aria-label="Ir a la diapositiva 2"></button><button class="hero-dot" data-slide="2" aria-label="Ir a la diapositiva 3"></button></div>
    </div><ul class="hero-stats" data-reveal><li><strong>FivePD</strong><span>Modalidad de juego</span></li><li><strong>3 AOP</strong><span>Valencia, Torrent y Burjassot</span></li><li><strong>99,9 %</strong><span>Uptime del servidor</span></li><li><strong>24/7</strong><span>Moderación activa</span></li></ul></section>`;
  }

  function home() {
    return `<main>${hero()}
      <section class="section"><div class="container"><div class="section-head"><span class="eyebrow">Por qué unirte</span><h2>Una experiencia cuidada al detalle</h2><p class="section-lead">Todo está calibrado para un roleplay inmersivo, fluido y serio.</p></div><div class="grid grid-3" data-reveal>
        <article class="card feature-card"><span class="feature-icon">◈</span><h3>Rol inmersivo</h3><p>Rol coherente y de calidad, sin EGO RP y con una normativa aplicada con criterio.</p></article>
        <article class="card feature-card"><span class="feature-icon">◷</span><h3>Servicios de emergencia completos</h3><p>Policía Nacional, Guardia Civil, Policía Local, SAMU y Bomberos con jerarquía y equipamiento propios.</p></article>
        <article class="card feature-card"><span class="feature-icon">▣</span><h3>Tres AOP distintos</h3><p>Valencia Centro, Torrent y Burjassot: el rol cambia de escenario según la actividad del servidor.</p></article>
      </div></div></section>
      <section class="section section-alt"><div class="container"><div class="section-head"><span class="eyebrow">Conectar</span><h2>Entra en el servidor</h2><p class="section-lead">Abre FiveM y usa la IP directa: <strong>${SERVER_IP}</strong></p></div></div></section>
      <section class="section"><div class="container"><div class="cta-banner card" data-reveal><div><h2>¿Listo para vestir el uniforme?</h2><p>Crea tu personaje, únete a una patrulla y vive el rol policial como nunca.</p></div><div class="cta-banner-actions"><a href="${DISCORD}" target="_blank" rel="noopener" class="btn btn-primary btn-lg">Unirse ahora</a><a href="/servidor" class="btn btn-ghost btn-lg">Saber más</a></div></div></div></section>
    </main>`;
  }

  function pageHero(eyebrow,title,lead) { return `<section class="page-hero"><div class="container"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p class="page-lead">${lead}</p></div></section>`; }

  function servidor() {
    return `<main>${pageHero('El servidor','Bienvenido a Valencia PD','Una comunidad de roleplay en la modalidad FivePD ambientada en la Comunidad Valenciana.')}
      <section class="section"><div class="container grid grid-2 align-center"><div><span class="eyebrow">Qué es un FivePD</span><h2>Emergencias contra maleantes</h2><p class="prose">Un servidor FivePD es una modalidad de roleplay centrada únicamente en los <strong>servicios de emergencia</strong>. Existen dos bandos: los servicios de emergencia y los maleantes, encargados de generar rol protagonizando avisos.</p><p class="prose">El <strong>AOP</strong> es el lugar donde se desarrolla el rol. Habitualmente, si no hay actividad IC el AOP es Torrent o Burjassot; cuando hay más actividad se cambia a Valencia Centro.</p><p class="prose">Para entrar, abre FiveM y conecta con <strong>${SERVER_IP}</strong>.</p></div><div class="media-frame">${assetImg(GALLERY[1],'Patrulla de Valencia PD en servicio')}</div></div></section>
      <section class="section section-alt"><div class="container"><div class="section-head"><span class="eyebrow">Un equipo atento</span><h2>Staff presente, todos los días</h2><p class="section-lead">Las sanciones se imponen bajo criterio del staff en beneficio del servidor y de los jugadores. La edad mínima es de 15-16 años, según criterios de madurez valorados por la administración.</p></div></div></section>
      <section class="section"><div class="container"><div class="section-head"><span class="eyebrow">Los AOP</span><h2>Tres escenarios, tres plantillas de servicios</h2><p class="section-lead">Los cuerpos disponibles cambian según el AOP establecido.</p></div><div class="grid grid-3" data-reveal>
        <article class="card feature-card"><h3>AOP Valencia Centro (Ciudad)</h3><p>Policía Nacional · Policía Municipal de Valencia · SAMU · Cuerpo de Bomberos del Ayuntamiento de Valencia.</p></article>
        <article class="card feature-card"><h3>AOP Torrent (Paleto Bay)</h3><p>Guardia Civil · Policía Local de Torrent · SAMU · Cuerpo de Bomberos de la Comunidad Valenciana.</p></article>
        <article class="card feature-card"><h3>AOP Burjassot (Sandy Shores y Grapeseed)</h3><p>Guardia Civil · Policía Local de Burjassot · SAMU · Cuerpo de Bomberos de la Comunidad Valenciana.</p></article>
      </div></div></section>
      <section class="section"><div class="container"><div class="section-head"><span class="eyebrow">En cifras</span><h2>La comunidad de un vistazo</h2></div><div class="grid grid-4 stats-grid" data-reveal><div class="card stat-card"><strong>3</strong><span>AOP disponibles</span></div><div class="card stat-card"><strong>5</strong><span>Cuerpos de emergencia</span></div><div class="card stat-card"><strong>99,9 %</strong><span>Uptime del servidor</span></div><div class="card stat-card"><strong>24/7</strong><span>Moderación activa</span></div></div></div></section>
    </main>`;
  }

  function galeria() {
    return `<main>${pageHero('Galería','Vistazo en juego','Algunos momentos capturados en el servidor Valencia PD.')}
      <section class="section"><div class="container"><div class="gallery-grid">${GALLERY.map((src,i)=>`<button type="button" class="gallery-item" data-gallery="${i}" aria-label="Ampliar la imagen ${i+1}">${assetImg(src,'Captura de Valencia PD '+(i+1))}</button>`).join('')}</div></div></section>
      <div class="lightbox" id="lightbox"><img class="lightbox-img" id="lightbox-img" alt=""><button class="lightbox-close" id="lightbox-close" aria-label="Cerrar">✕</button><button class="lightbox-nav lightbox-prev" id="lightbox-prev" aria-label="Anterior">‹</button><button class="lightbox-nav lightbox-next" id="lightbox-next" aria-label="Siguiente">›</button></div>
    </main>`;
  }

  function servicios() {
    const services = [
      ['Discord Valencia PD','Comunidad principal, tickets y anuncios.',DISCORD,'Unirse'],
      ['Servidor FiveM',SERVER_IP,SERVER_CONNECT,'Conectar'],
      ['TikTok','Clips y momentos del servidor.',TIKTOK,'Seguir'],
      ['Instagram','Novedades, flotas y eventos.',INSTAGRAM,'Seguir'],
      ['Twitch','Directos oficiales de Valencia PD.',TWITCH,'Ver'],
    ];
    return `<main>${pageHero('Comunidad','Nuestros servicios y redes','Todos los enlaces oficiales de Valencia PD reunidos aquí.')}
      <section class="section section-tight"><div class="container"><div class="grid grid-3">${services.map(s=>`<article class="card service-card"><div class="service-head"><img src="${LOGO}" alt="" class="service-logo"><h3 class="service-name">${s[0]}</h3></div><p class="service-desc">${s[1]}</p><a href="${s[2]}" target="_blank" rel="noopener" class="btn btn-discord btn-block service-join">${s[3]}</a></article>`).join('')}</div></div></section>
    </main>`;
  }

  function normativa() {
    return `<main>${pageHero('Normativa','Normativa de Valencia PD','La no lectura o el desconocimiento de la normativa no exime de cumplirla ni de posibles sanciones.')}
      <section class="section"><div class="container legal-layout"><aside class="toc card"><h4>Índice</h4><nav><a href="#introduccion">Introducción</a><a href="#comandos">1. Comandos y comunicación</a><a href="#conducta">2. Conducta en rol</a><a href="#maleantes">3. Maleantes, robos y armas</a><a href="#tecnicas">4. Trampas y programas externos</a><a href="#discord">5. Normativa de Discord</a><a href="#descargas">6. Descargas (PDF)</a></nav></aside>
      <div class="prose-block">
        <article id="introduccion" class="rule-section"><h2>Introducción</h2><ul><li><strong>Lectura obligatoria</strong> — El desconocimiento de la normativa no exime de cumplirla.</li><li><strong>Criterio del staff</strong> — Las sanciones se imponen bajo criterio del staff en beneficio del servidor y los jugadores. Los vacíos legales los resuelve el equipo de staff.</li><li><strong>Edad mínima</strong> — 15-16 años bajo criterio de administración según madurez del jugador y de la voz.</li></ul></article>
        <article id="comandos" class="rule-section"><h2>Sección 1 — Comandos y comunicación</h2><ul><li><strong>1.1</strong> — <em>/ooc</em> habla con todo el servidor; <em>/oop</em> solo con quienes están en un radio cercano.</li><li><strong>1.2</strong> — <em>/me</em> para acciones que no se pueden expresar IC y <em>/do</em> para sucesos del entorno.</li><li><strong>1.3</strong> — Detener requiere que la persona esté de espaldas o en el suelo tras la reducción; cachear requiere que esté quieta y colaborativa. Prohibido abusar de la animación de detención.</li><li><strong>1.4</strong> — <em>/ayuda</em> solo para preguntas de jugadores; <em>/x</em> para mensajes anónimos tipo RRSS, nunca para faltar al respeto o provocar.</li><li><strong>1.5</strong> — No enviar avisos por <em>/112</em> cuando la situación requiere emergencias está sancionado.</li></ul></article>
        <article id="conducta" class="rule-section"><h2>Sección 2 — Conducta en rol</h2><ul><li><strong>2.1 Power Gaming (PG)</strong> — Realizar acciones imposibles en la vida real aunque el juego lo permita.</li><li><strong>2.2 VDM y DM</strong> — Atropellar o matar a otro jugador sin contexto previo está prohibido.</li><li><strong>2.3 Valorar vida y consecuencias</strong> — Valora la vida de tu personaje y las consecuencias de sus actos.</li><li><strong>2.4 Conducción indebida</strong> — Prohibida la conducción temeraria en zonas de rol.</li><li><strong>2.5 Respeto</strong> — Prohibida cualquier actitud tóxica, insultante o acosadora hacia jugadores y staff.</li><li><strong>2.6 Personajes y peds</strong> — Atuendos y peds deben adecuarse al contexto. Peds de animales solo con autorización del staff.</li><li><strong>2.7 Desconexión y evasión de rol</strong> — Prohibido desconectarse en medio de un rol o evitar sus consecuencias.</li><li><strong>2.8 Modulador de voz</strong> — Prohibido para ocultar edad no permitida; solo con aprobación y supervisión del staff.</li><li><strong>2.9 /camara</strong> — Prohibido usarlo para espiar conversaciones u obtener información que el personaje no debería tener.</li></ul></article>
        <article id="maleantes" class="rule-section"><h2>Sección 3 — Maleantes, robos y armas</h2><ul><li><strong>3.1 Persecuciones</strong> — Sin rol previo de peso no hay huída. Límite de <strong>2 persecuciones diarias por maleante</strong>.</li><li><strong>3.2 Entorpecer roles</strong> — No entrometerse en un rol en curso sin autorización de los participantes.</li><li><strong>3.3 Comisarías</strong> — Prohibido rolear en comisarías o alrededores sin autorización previa del staff.</li><li><strong>3.4 Vehículos</strong> — Prohibido robar vehículos de emergencia o de NPC.</li><li><strong>3.5 Robos de gran escala</strong> — Bancos, joyerías, etc. requieren autorización de administración. No hay negociación policial ni recompensa: esto es un PD, no un roleplay habitual.</li><li><strong>3.6 Armas</strong> — Uso de armas de fuego solo con autorización administrativa. Máximo un rol agresivo con armas por hora.</li><li><strong>3.7 Autorizaciones</strong> — Si pides <em>/ayuda</em> o <em>/reportar</em> y no hay respuesta, acude a la sala de espera. Sin respuesta allí, el rol queda <strong>NO AUTORIZADO</strong>.</li></ul></article>
        <article id="tecnicas" class="rule-section"><h2>Sección 4 — Trampas y programas externos</h2><ul><li><strong>4.1</strong> — Prohibido cualquier programa externo para modificar, dumpear, molestar, crashear o conseguir ventaja: <strong>baneo permanente no apelable</strong>.</li><li><strong>4.2</strong> — Prohibido aprovechar bugs o errores del servidor y no reportarlos al staff.</li></ul></article>
        <article id="discord" class="rule-section"><h2>Sección 5 — Normativa de Discord</h2><ul><li><strong>5.1 Respeto</strong> — Prohibida cualquier actitud tóxica, discriminatoria o acosadora hacia miembros y staff.</li><li><strong>5.2 Contenido inapropiado</strong> — Nada sexual, violento, gore o discriminatorio, incluidos avatar, banner y estado.</li><li><strong>5.3 Spam y flood</strong> — Sin mensajes repetidos, mayúsculas excesivas ni menciones masivas.</li><li><strong>5.4 Publicidad</strong> — Prohibido publicitar otros servidores o enlaces, también por privado.</li><li><strong>5.5 Multicuentas y suplantación</strong> — Prohibidas las cuentas alternativas para evadir sanciones y hacerse pasar por otros o por staff.</li><li><strong>5.6 Perfiles e idioma</strong> — Nombres y perfiles apropiados. El idioma oficial es el español.</li><li><strong>5.7 Canales y voz</strong> — Cada canal para su finalidad. Prohibidos soundboards, ruidos molestos y saltos de canal para molestar.</li><li><strong>5.8 Tickets y bots</strong> — Tickets solo para gestiones reales; prohibido abusar de los comandos de los bots.</li><li><strong>5.9 Privacidad</strong> — Prohibido publicar capturas o conversaciones privadas sin consentimiento.</li></ul></article>
        <article id="descargas" class="rule-section"><h2>Sección 6 — Documentos oficiales</h2><p class="prose">Los documentos completos prevalecen sobre este resumen. Consúltalos y descárgalos aquí:</p><div class="cta-banner-actions"><a href="${PDF_GENERAL}" target="_blank" rel="noopener" class="btn btn-primary btn-lg">Normativa general (PDF)</a><a href="${PDF_DISCORD}" target="_blank" rel="noopener" class="btn btn-ghost btn-lg">Normativa Discord (PDF)</a></div></article>
      </div></div></section>
    </main>`;
  }

  const pages = {'/':home,'/servidor':servidor,'/galeria':galeria,'/servicios':servicios,'/normativa':normativa};
  const renderer = pages[path] || (() => `<main>${pageHero('404','Página no encontrada','La página que buscas no existe.')}</main>`);
  app.className = '';
  app.innerHTML = header() + renderer() + footer();

  // Header scroll + mobile menu
  const headerEl = document.getElementById('site-header');
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('nav-toggle');
  const updateHeader = () => headerEl && headerEl.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', updateHeader, {passive:true}); updateHeader();
  toggle?.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  // Hero carousel
  let slide = 0;
  const track = document.getElementById('hero-track');
  const dots = [...document.querySelectorAll('.hero-dot')];
  const setSlide = i => { slide=(i+3)%3; if(track) track.style.transform=`translateX(-${slide*100}%)`; dots.forEach((d,n)=>d.classList.toggle('active',n===slide)); };
  document.querySelector('.hero-prev')?.addEventListener('click',()=>setSlide(slide-1));
  document.querySelector('.hero-next')?.addEventListener('click',()=>setSlide(slide+1));
  dots.forEach(d=>d.addEventListener('click',()=>setSlide(Number(d.dataset.slide))));
  if(track){ window.setInterval(()=>setSlide(slide+1),6500); }

  // Gallery lightbox
  let lightIndex=0;
  const lightbox=document.getElementById('lightbox');
  const lightImg=document.getElementById('lightbox-img');
  const showLight=i=>{lightIndex=(i+GALLERY.length)%GALLERY.length;if(!lightbox||!lightImg)return;lightImg.src=GALLERY[lightIndex];lightbox.classList.add('open');};
  document.querySelectorAll('[data-gallery]').forEach(b=>b.addEventListener('click',()=>showLight(Number(b.dataset.gallery))));
  document.getElementById('lightbox-close')?.addEventListener('click',()=>lightbox.classList.remove('open'));
  document.getElementById('lightbox-prev')?.addEventListener('click',e=>{e.stopPropagation();showLight(lightIndex-1)});
  document.getElementById('lightbox-next')?.addEventListener('click',e=>{e.stopPropagation();showLight(lightIndex+1)});
  lightbox?.addEventListener('click',e=>{if(e.target===lightbox)lightbox.classList.remove('open')});
  document.addEventListener('keydown',e=>{if(!lightbox?.classList.contains('open'))return;if(e.key==='Escape')lightbox.classList.remove('open');if(e.key==='ArrowLeft')showLight(lightIndex-1);if(e.key==='ArrowRight')showLight(lightIndex+1)});

  // Reveal animation used by the supplied design.
  const reveals=[...document.querySelectorAll('[data-reveal]')];
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12});reveals.forEach(e=>io.observe(e));}
  else reveals.forEach(e=>e.classList.add('is-visible'));
})();
