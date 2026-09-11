(() => {
  const DISCORD = 'https://discord.gg/valenciapd';
  const DISCORD_EMERGENCIAS = 'https://discord.gg/valenciapd';
  const UNBAN_DISCORD = 'https://discord.gg/pGXCRVg7yF';
  const DISCORD_CONNECT = '/discord';
  const FIVEM_PROTOCOL = 'fivem://connect/gaa58qq';
  const SERVER_IP = 'connect cfx.re/join/gaa58qq';
  const FIVEM = 'https://servers.fivem.net/servers/detail/gaa58qq';
  const LOGO = '/site/valenciapd-logo.png';
  const GALLERY = ['/gal1.png', '/gal2.png', '/gal3.png', '/gallery/gal4.png', '/gallery/gal5.png', '/gallery/gal6.png', '/gallery/gal7.png', '/gallery/gal8.png', '/gallery/gal9.png'];
  const PDF_GENERAL = '/normativa-general.pdf';
  const PDF_DISCORD = '/normativa-discord.pdf';

  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const app = document.getElementById('app');

  function navLink(href, label) {
    const active = path === href ? ' active' : '';
    return `<a href="${href}" class="${active ? 'active' : ''}">${label}</a>`;
  }

  function icon(name) { return `<img class="social-icon" src="/site/icons/${name}.svg" alt="" aria-hidden="true">`; }

  function header() {
    return `<header class="site-header" id="site-header"><div class="container header-inner">
      <a href="/" class="brand" aria-label="Inicio Valencia PD"><img src="${LOGO}" alt="Valencia PD" class="brand-logo"><span class="brand-text">VALENCIA PD</span></a>
      <nav class="main-nav" id="main-nav" aria-label="Navegación principal">
        ${navLink('/servidor','El servidor')}
        ${navLink('/galeria','Galería')}
        ${navLink('/servicios','Servicios')}
        ${navLink('/normativa','Normativa')}
        ${navLink('/guia-inicio','Guía')}
        <a class="nav-play fivem-launch" href="${FIVEM_PROTOCOL}" data-fivem-launch>▶ Jugar</a>
      </nav>
      <div class="header-actions">
        <div id="discord-account-slot" class="discord-account-slot"><a href="${DISCORD_CONNECT}" class="btn btn-discord discord-connect-btn">${icon('discord')} Conectar Discord</a></div>
        <button class="nav-toggle" id="nav-toggle" aria-label="Abrir el menú" aria-expanded="false"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      </div>
    </div></header>`;
  }

  function footer() {
    return `<footer class="site-footer"><div class="container footer-inner">
      <div class="footer-brand"><img src="${LOGO}" alt="Valencia PD" class="brand-logo footer-logo"><div><strong>VALENCIA PD</strong><p>Comunidad de roleplay FivePD ambientada en la Comunidad Valenciana.</p></div></div>
      <nav class="footer-nav" aria-label="Enlaces del pie de página">
        <div class="footer-col"><h4>Servidor</h4><a href="/galeria">Galería</a><a href="/servicios">Servicios</a><a href="/normativa">Normativa</a><a href="/guia-inicio">Guía de inicio</a><a href="/estado">Estado</a></div>
        <div class="footer-col"><h4>Comunidad</h4><a href="/postular">Postular</a><a href="${UNBAN_DISCORD}" target="_blank" rel="noopener">Desbaneos</a></div>
        <div class="footer-col"><h4>Legal</h4><a href="/legal/privacidad">Política de privacidad</a><a href="/legal/terminos">Términos y condiciones</a></div>
      </nav>
    </div><div class="footer-bottom"><div class="container"><p>© 2026 ValenciaPD. Todos los derechos reservados.</p><span>No afiliado a Rockstar Games ni a Take-Two Interactive.</span></div></div></footer>`;
  }

  function featureIcon(name) {
    const icons = {
      role: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.6-2.7 8-7 10-4.3-2-7-5.4-7-10V6l7-3z"/><path d="M12 7v9M8.5 10.5h7"/></svg>',
      emergency: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l1 3h3v15H5V6h3l1-3z"/><path d="M9 11h6M12 8v6"/></svg>',
      map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l6-2 4 2v14l-4-2-6 2-4-2V3l4 2z"/><path d="M9 5v14M15 3v14"/></svg>',
      community: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3.5 19c.6-3 2.4-4.5 5.5-4.5s4.9 1.5 5.5 4.5M14 15.5c2.9-.1 4.8 1 5.5 3.5"/></svg>'
    };
    return `<span class="feature-icon-svg">${icons[name] || icons.role}</span>`;
  }

  function assetImg(src, alt, cls='') {
    return `<img src="${src}" alt="${alt}" class="${cls}" onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('div'),{className:'asset-missing',innerHTML:'<span>Imagen pendiente de subir al repositorio.<br>Nombre esperado: <strong>${src.replace('/','')}</strong></span>'}))">`;
  }

  function hero() {
    return `<section class="container hero-section"><div class="hero-carousel" id="hero-carousel" aria-roledescription="carrusel">
      <div class="hero-track" id="hero-track">
        <article class="hero-slide">${assetImg(GALLERY[0],'','hero-slide-img')}<div class="hero-overlay"><div class="hero-text"><span class="eyebrow">Servidor FivePD · Comunidad Valenciana</span><h1 class="hero-title">Un servidor FivePD ambientado<br><span class="accent">en la Comunidad Valenciana.</span></h1><p class="hero-sub">Rol policial, jerarquía e intervenciones reales, con servicios de emergencia españoles.</p><div class="hero-cta"><a href="${FIVEM_PROTOCOL}" data-fivem-launch class="btn btn-primary btn-lg btn-play">▶ Jugar en Valencia PD</a><a href="${DISCORD_CONNECT}" class="btn btn-ghost btn-lg">Conectar con Discord</a></div></div></div></article>
        <article class="hero-slide">${assetImg(GALLERY[1],'','hero-slide-img')}<div class="hero-overlay"><div class="hero-text"><span class="eyebrow">Los cuerpos</span><h1 class="hero-title">Policía Nacional, Guardia Civil,<br><span class="accent">Policía Local, SAMU y Bomberos.</span></h1><p class="hero-sub">Patrulla, sube de rango y vive intervenciones coordinadas entre todos los servicios.</p><div class="hero-cta"><a href="/servidor" class="btn btn-primary btn-lg">Descubrir el servidor</a></div></div></div></article>
        <article class="hero-slide">${assetImg(GALLERY[2],'','hero-slide-img')}<div class="hero-overlay"><div class="hero-text"><span class="eyebrow">La comunidad</span><h1 class="hero-title">Staff activo y normativa clara,<br><span class="accent">rol serio y sin dramas.</span></h1><p class="hero-sub">Una comunidad activa día y noche, con moderación 24/7 y normativa aplicada con criterio.</p><div class="hero-cta"><a href="/normativa" class="btn btn-primary btn-lg">Leer la normativa</a></div></div></div></article>
      </div>
      <button class="hero-arrow hero-prev" aria-label="Diapositiva anterior" data-dir="-1">‹</button><button class="hero-arrow hero-next" aria-label="Diapositiva siguiente" data-dir="1">›</button>
      <div class="hero-dots"><button class="hero-dot active" data-slide="0" aria-label="Ir a la diapositiva 1"></button><button class="hero-dot" data-slide="1" aria-label="Ir a la diapositiva 2"></button><button class="hero-dot" data-slide="2" aria-label="Ir a la diapositiva 3"></button></div>
    </div><ul class="hero-stats" data-reveal><li><strong>FivePD</strong><span>Modalidad de juego</span></li><li><strong>3 AOP</strong><span>Valencia, Torrent y Burjassot</span></li><li><strong>99,9 %</strong><span>Uptime del servidor</span></li><li><strong>24/7</strong><span>Moderación activa</span></li></ul></section>`;
  }

  function home() {
    return `<main>${hero()}
      <section class="section"><div class="container"><div class="section-head"><span class="eyebrow">Por qué unirte</span><h2>Una experiencia cuidada al detalle</h2><p class="section-lead">Todo está calibrado para un roleplay inmersivo, fluido y serio.</p></div><div class="grid grid-3" data-reveal>
        <article class="card feature-card"><span class="feature-icon-wrap">${featureIcon('role')}</span><h3>Rol inmersivo</h3><p>Rol coherente y de calidad, sin EGO RP y con una normativa aplicada con criterio.</p></article>
        <article class="card feature-card"><span class="feature-icon-wrap">${featureIcon('emergency')}</span><h3>Servicios de emergencia completos</h3><p>Policía Nacional, Guardia Civil, Policía Local, SAMU y Bomberos con jerarquía y equipamiento propios.</p></article>
        <article class="card feature-card"><span class="feature-icon-wrap">${featureIcon('map')}</span><h3>Tres AOP distintos</h3><p>Valencia Centro, Torrent y Burjassot: el rol cambia de escenario según la actividad del servidor.</p></article>
      </div></div></section>
      <section class="section section-alt"><div class="container"><div class="section-head"><span class="eyebrow">Empieza en Valencia</span><h2>Todo preparado para tu primera sesión</h2><p class="section-lead">Desde el primer minuto tienes una ruta clara para conectar, informarte y entrar en rol.</p></div><div class="grid grid-3" data-reveal><article class="card feature-card feature-card-soft"><span class="feature-icon-wrap"><span class="feature-number">01</span></span><h3>Lee la guía de inicio</h3><p>Aprende cómo crear tu personaje, entrar en emergencias o desarrollar tu historia como civil o maleante.</p><a class="text-link" href="/guia-inicio">Ver la guía →</a></article><article class="card feature-card feature-card-soft"><span class="feature-icon-wrap"><span class="feature-number">02</span></span><h3>Comprueba el estado</h3><p>Antes de conectar, consulta el estado del servidor y cualquier mantenimiento anunciado por el equipo.</p><a class="text-link" href="/estado">Ver estado →</a></article><article class="card feature-card feature-card-soft"><span class="feature-icon-wrap"><span class="feature-number">03</span></span><h3>Entra cuando estés listo</h3><p>Conecta FiveM directamente desde tu equipo y empieza tu primera historia en Valencia PD.</p><a class="text-link fivem-launch" href="${FIVEM_PROTOCOL}" data-fivem-launch>Jugar ahora →</a></article></div></div></section>
      <section class="section section-alt"><div class="container"><div class="section-head"><span class="eyebrow">Todo lo que necesitas</span><h2>Una comunidad hecha para quedarse</h2><p class="section-lead">Información clara, soporte rápido y un entorno preparado para disfrutar del rol.</p></div><div class="grid grid-3" data-reveal>
        <article class="card feature-card feature-card-soft"><span class="feature-icon-wrap">${featureIcon('community')}</span><h3>Comunidad activa</h3><p>Discord como punto central para avisos, soporte, organización de patrullas y actividad diaria.</p><a class="text-link" href="${DISCORD}">Entrar al Discord →</a></article>
        <article class="card feature-card feature-card-soft"><span class="feature-icon-wrap">${featureIcon('role')}</span><h3>Soporte y desbaneos</h3><p>¿Tienes una sanción o necesitas ayuda? Accede al canal correspondiente y abre tu solicitud.</p><a class="text-link" href="${UNBAN_DISCORD}" target="_blank" rel="noopener">Solicitar revisión →</a></article>
        <article class="card feature-card feature-card-soft"><span class="feature-icon-wrap"><img class="feature-icon-image" src="/site/icons/fivem.svg" alt="" aria-hidden="true"></span><h3>Conexión directa</h3><p>Abre FiveM con un clic y entra directamente al servidor Valencia PD.</p><a class="text-link fivem-launch" href="${FIVEM_PROTOCOL}" data-fivem-launch>Jugar ahora →</a></article>
      </div></div></section>
      <section class="section"><div class="container"><div class="cta-banner card" data-reveal><div><h2>¿Listo para vestir el uniforme?</h2><p>Crea tu personaje, únete a una patrulla y vive el rol policial como nunca.</p></div><div class="cta-banner-actions"><a href="${DISCORD}" target="_blank" rel="noopener" class="btn btn-primary btn-lg">Unirse ahora</a><a href="/servidor" class="btn btn-ghost btn-lg">Saber más</a></div></div></div></section>
    </main>`;
  }

  function pageHero(eyebrow,title,lead) { return `<section class="page-hero"><div class="container"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p class="page-lead">${lead}</p></div></section>`; }

  function servidor() {
    return `<main>${pageHero('El servidor','Bienvenido a Valencia PD','Una comunidad de roleplay en la modalidad FivePD ambientada en la Comunidad Valenciana.')}
      <section class="section"><div class="container grid grid-2 align-center"><div><span class="eyebrow">Qué es un FivePD</span><h2>Emergencias contra maleantes</h2><p class="prose">Un servidor FivePD es una modalidad de roleplay centrada únicamente en los <strong>servicios de emergencia</strong>. Existen dos bandos: los servicios de emergencia y los maleantes, encargados de generar rol protagonizando avisos.</p><p class="prose">El <strong>AOP</strong> es el lugar donde se desarrolla el rol. Habitualmente, si no hay actividad IC el AOP es Torrent o Burjassot; cuando hay más actividad se cambia a Valencia Centro.</p><p class="prose">Para entrar, abre FiveM y usa la conexión directa desde el botón de abajo.</p><a href="${FIVEM_PROTOCOL}" data-fivem-launch class="btn btn-primary btn-lg">▶ Abrir FiveM</a></div><div class="media-frame">${assetImg(GALLERY[1],'Patrulla de Valencia PD en servicio')}</div></div></section>
      <section class="section section-alt"><div class="container"><div class="section-head"><span class="eyebrow">Un equipo atento</span><h2>Staff presente, todos los días</h2><p class="section-lead">Las sanciones se imponen bajo criterio del staff en beneficio del servidor y de los jugadores. La edad mínima es de 15-16 años, según criterios de madurez valorados por la administración.</p></div></div></section>
      <section class="section"><div class="container"><div class="section-head"><span class="eyebrow">Los AOP</span><h2>Tres escenarios, tres plantillas de servicios</h2><p class="section-lead">Los cuerpos disponibles cambian según el AOP establecido.</p></div><div class="grid grid-3" data-reveal>
        <article class="card feature-card"><h3>AOP Valencia Centro (Ciudad)</h3><p>Policía Nacional · Policía Municipal de Valencia · SAMU · Cuerpo de Bomberos del Ayuntamiento de Valencia.</p></article>
        <article class="card feature-card"><h3>AOP Torrent (Paleto Bay)</h3><p>Guardia Civil · Policía Local de Torrent · SAMU · Cuerpo de Bomberos de la Comunidad Valenciana.</p></article>
        <article class="card feature-card"><h3>AOP Burjassot (Sandy Shores y Grapeseed)</h3><p>Guardia Civil · Policía Local de Burjassot · SAMU · Cuerpo de Bomberos de la Comunidad Valenciana.</p></article>
      </div></div></section>
      <section class="section"><div class="container"><div class="section-head"><span class="eyebrow">En cifras</span><h2>La comunidad de un vistazo</h2></div><div class="grid grid-4 stats-grid" data-reveal><div class="card stat-card"><strong>3</strong><span>AOP disponibles</span></div><div class="card stat-card"><strong>5</strong><span>Cuerpos de emergencia</span></div><div class="card stat-card"><strong>99,9 %</strong><span>Uptime del servidor</span></div><div class="card stat-card"><strong>24/7</strong><span>Moderación activa</span></div></div></div></section>
    </main>`;
  }

  function galeria() { return `<main>${pageHero('Galería','Vistazo en juego','Una selección de escenas y detalles visuales de Valencia PD.')}<section class="section"><div class="container"><div class="gallery-grid">${GALLERY.map((src,i)=>`<button type="button" class="gallery-item gallery-item-tall" data-gallery="${i}" aria-label="Ampliar imagen ${i+1}">${assetImg(src,`Valencia PD · imagen ${i+1}`)}</button>`).join('')}</div></div></section><div class="lightbox" id="lightbox"><img class="lightbox-img" id="lightbox-img" alt=""><button class="lightbox-close" id="lightbox-close" aria-label="Cerrar">✕</button><button class="lightbox-nav lightbox-prev" id="lightbox-prev" aria-label="Anterior">‹</button><button class="lightbox-nav lightbox-next" id="lightbox-next" aria-label="Siguiente">›</button></div></main>`; }

  function servicios() {
    const services = [
      ['Discord de emergencias','Canal de coordinación para Policía, Sanidad y Bomberos.',DISCORD_EMERGENCIAS,'Entrar al Discord','discord'],
      ['Discord Valencia PD','Comunidad principal, soporte, avisos y organización del servidor.',DISCORD,'Entrar al Discord','discord']
    ];
    return `<main>${pageHero('Servicios','Servicios oficiales','Accesos directos a los dos espacios de Discord que usamos en la comunidad.')}
      <section class="section section-tight"><div class="container">
        <div class="unban-service-banner card" data-reveal><div class="unban-service-copy"><span class="eyebrow">¿TE HAN BANEADO?</span><h2>Solicita un desbaneo</h2><p>Si crees que tu sanción no ha sido correcta, puedes solicitar una revisión a través de nuestro Discord.</p></div><a href="${UNBAN_DISCORD}" target="_blank" rel="noopener" class="btn btn-primary btn-lg">Solicitud de desbaneo</a></div>
        <div class="grid grid-2 services-grid" data-reveal>${services.map(s=>`<article class="card service-card service-card-large"><div class="service-head"><span class="service-logo-file service-logo-disc">${icon(s[4])}</span><div><span class="eyebrow">Discord</span><h3 class="service-name">${s[0]}</h3></div></div><p class="service-desc">${s[1]}</p><a href="${s[2]}" target="_blank" rel="noopener" class="btn btn-discord btn-block service-join">${s[3]}</a></article>`).join('')}</div>
      </div></section></main>`;
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

  function privacidad() { return `<main>${pageHero('Legal','Política de privacidad','Cómo tratamos los datos cuando utilizas la web y los servicios de Valencia PD.')}<section class="section"><div class="container legal-layout"><aside class="toc card"><h4>Índice</h4><nav><a href="#responsable">1. Responsable</a><a href="#datos">2. Datos tratados</a><a href="#finalidad">3. Finalidad</a><a href="#terceros">4. Terceros</a><a href="#conservacion">5. Conservación</a><a href="#derechos">6. Derechos</a><a href="#contacto">7. Contacto y cambios</a></nav></aside><div class="prose-block legal-page"><article id="responsable" class="rule-section"><h2>1. Responsable</h2><p class="prose">Valencia PD es una comunidad de roleplay sin ánimo de lucro. Esta página resume cómo se puede tratar la información cuando utilizas nuestros servicios.</p></article><article id="datos" class="rule-section"><h2>2. Datos tratados</h2><ul><li>Datos técnicos necesarios para seguridad y funcionamiento, como IP, navegador y registros de acceso.</li><li>Datos básicos de Discord cuando utilizas la autenticación o conectas tu cuenta.</li><li>Información que facilites voluntariamente mediante tickets, formularios u otros servicios.</li></ul></article><article id="finalidad" class="rule-section"><h2>3. Finalidad</h2><p class="prose">La información puede utilizarse para autenticación, seguridad, prevención del abuso, gestión de verificaciones, atención de solicitudes y prestación de los servicios que pidas.</p></article><article id="terceros" class="rule-section"><h2>4. Terceros</h2><p class="prose">La plataforma puede interactuar con Discord, FiveM, Vercel y otros proveedores técnicos necesarios. Cada servicio externo aplica sus propias condiciones y políticas de privacidad.</p></article><article id="conservacion" class="rule-section"><h2>5. Conservación</h2><p class="prose">La información se conserva durante el tiempo razonablemente necesario para las finalidades anteriores, mantener la seguridad y atender obligaciones legales cuando proceda.</p></article><article id="derechos" class="rule-section"><h2>6. Derechos</h2><p class="prose">Puedes solicitar información, corrección o eliminación de datos cuando legalmente corresponda, utilizando los canales oficiales de Valencia PD.</p></article><article id="contacto" class="rule-section"><h2>7. Contacto y cambios</h2><p class="prose">Para cualquier consulta relacionada con tus datos, contacta con la comunidad a través de sus canales oficiales. Esta política puede actualizarse cuando cambien la web o sus servicios.</p></article><div class="legal-note"><strong>Nota:</strong> este texto es informativo y conviene revisarlo profesionalmente antes de utilizarlo como política jurídica definitiva.</div></div></div></section></main>`; }

  function terminos() { return `<main>${pageHero('Legal','Términos y condiciones','Reglas de uso de la web y de los servicios de Valencia PD.')}<section class="section"><div class="container legal-layout"><aside class="toc card"><h4>Índice</h4><nav><a href="#aceptacion">1. Aceptación</a><a href="#uso">2. Uso permitido</a><a href="#discord-fivem">3. Discord y FiveM</a><a href="#cuentas">4. Cuentas y acceso</a><a href="#disponibilidad">5. Disponibilidad</a><a href="#propiedad">6. Propiedad y marcas</a><a href="#cambios">7. Cambios</a></nav></aside><div class="prose-block legal-page"><article id="aceptacion" class="rule-section"><h2>1. Aceptación</h2><p class="prose">Al utilizar la web o cualquiera de los servicios de Valencia PD aceptas estas condiciones y la normativa aplicable a la comunidad.</p></article><article id="uso" class="rule-section"><h2>2. Uso permitido</h2><ul><li>Utiliza los servicios de forma lícita, respetuosa y sin perjudicar a otros usuarios.</li><li>No interfieras con la infraestructura ni intentes obtener acceso no autorizado.</li><li>No suplantes a otros usuarios, al staff o a Valencia PD.</li></ul></article><article id="discord-fivem" class="rule-section"><h2>3. Discord y FiveM</h2><p class="prose">Discord, FiveM y sus sistemas asociados pueden imponer requisitos adicionales. El acceso al servidor y a la comunidad puede limitarse o retirarse por incumplimiento de la normativa.</p></article><article id="cuentas" class="rule-section"><h2>4. Cuentas y acceso</h2><p class="prose">La conexión mediante Discord debe realizarse con tu propia cuenta. No compartas credenciales ni utilices sistemas automatizados para eludir controles o sanciones.</p></article><article id="disponibilidad" class="rule-section"><h2>5. Disponibilidad</h2><p class="prose">Trabajamos para mantener los servicios disponibles, pero pueden existir mantenimientos, errores o interrupciones de terceros. El estado publicado en la web sirve como referencia operativa.</p></article><article id="propiedad" class="rule-section"><h2>6. Propiedad y marcas</h2><p class="prose">Los recursos propios de Valencia PD pertenecen a sus titulares. Las marcas y servicios de terceros pertenecen a sus respectivos propietarios.</p></article><article id="cambios" class="rule-section"><h2>7. Cambios</h2><p class="prose">Estas condiciones pueden actualizarse. La versión publicada en esta página será la vigente desde su publicación.</p></article><div class="legal-note"><strong>Nota:</strong> estos términos son una base informativa y deben revisarse profesionalmente antes de utilizarlos como texto legal definitivo.</div></div></div></section></main>`; }

  function guiaInicio() { const steps=[['01','Creación de personaje','Crea tu personaje con una buena apariencia. En los cuerpos de emergencias, utiliza nombres españoles o valencianos y evita tatuajes visibles en cara y cuello. Una vez creado, puedes usar /tpmenu para desplazarte por el mapa.'],['02','Cuerpos de emergencias','Si quieres formar parte de Policía, Sanidad o Bomberos, únete al Discord de 112 Emergencias, entra en “Trámites” y abre «Número de Placa». Dirígete a la comisaría asignada por el AOP mediante /tpmenu y, una vez tengas tu número de placa, el equipo se pondrá en contacto contigo para la entrega de tu dotación.'],['03','Civiles y maleantes','Crea un personaje diferente al de Emergencias, con otro nombre y apariencia. Desarrolla situaciones creíbles, utiliza correctamente /112 cuando la situación lo requiera, consulta #maleantes y respeta los tiempos de espera y las indicaciones del equipo de Administración.']]; return `<main>${pageHero('Guía inicial','Guía de inicio — Valencia PD','Bienvenido a Valencia. Todos los jugadores nuevos aparecerán inicialmente en el Aeropuerto de Valencia. Desde allí, sigue estos pasos para comenzar tu experiencia en la comunidad.')}<section class="section section-tight"><div class="container"><div class="guide-intro card"><div class="guide-intro-icon">✦</div><div><span class="eyebrow">GUÍA INICIAL · VALENCIA PD</span><h2>Tu primera sesión, paso a paso</h2><p class="prose">Una ruta sencilla para crear tu personaje, entrar en los cuerpos de emergencias o empezar tu historia como civil o maleante.</p></div></div><div class="guide-timeline">${steps.map((st,i)=>`<article class="guide-step card" data-reveal><div class="guide-step-marker"><span>${st[0]}</span>${i<2?'<i></i>':''}</div><div class="guide-step-body"><span class="eyebrow">PASO ${st[0]}</span><h2>${st[1]}</h2><p class="prose">${st[2]}</p></div></article>`).join('')}</div><div class="guide-finish card" data-reveal><span class="eyebrow">INICIO</span><h2>Ya estás preparado.</h2><p class="prose">Una vez completados estos pasos, ya estás preparado para comenzar tu historia en Valencia. Recuerda que un buen roleplay depende del respeto, la coherencia y la colaboración entre todos.</p><div class="cta-banner-actions"><a href="${FIVEM_PROTOCOL}" data-fivem-launch class="btn btn-primary btn-lg">▶ Abrir FiveM</a><a href="${DISCORD_CONNECT}" class="btn btn-ghost btn-lg">${icon('discord')} Conectar Discord</a></div></div></div></section></main>`; }

  function estado() { return `<main>${pageHero('Estado','Estado en desarrollo','El servidor se encuentra actualmente en desarrollo.')}<section class="section section-tight"><div class="container"><div class="status-hero card status-hero-simple" data-reveal><div class="status-orb status-orb-dev"><span></span></div><div class="status-copy"><span class="eyebrow">ESTADO</span><h2>Servidor en desarrollo</h2><p class="section-lead">Estamos trabajando en la infraestructura, los sistemas y el contenido de Valencia PD para preparar la próxima etapa.</p><div class="status-single"><span class="status-dot"></span><strong>En desarrollo</strong></div></div></div></div></section></main>`; }

  function postular() { return `<main>${pageHero('Comunidad','Postular en Valencia PD','Forma parte del equipo y ayuda a construir una comunidad de roleplay activa, organizada y con buen ambiente.')}<section class="section section-tight"><div class="container"><div class="section-head"><span class="eyebrow">Oportunidades</span><h2>Encuentra tu lugar en el equipo</h2><p class="section-lead">Cuando abrimos convocatorias, buscamos personas responsables, constantes y con ganas de aportar.</p></div><div class="grid grid-3" data-reveal><article class="card feature-card"><span class="feature-icon">◆</span><h3>Staff</h3><p>Ayuda con la moderación, el soporte y la organización de la comunidad.</p><span class="status-chip">Convocatorias</span></article><article class="card feature-card"><span class="feature-icon">✦</span><h3>Cuerpos de emergencias</h3><p>Desarrolla tu rol dentro de Policía, Sanidad o Bomberos siguiendo los procesos de la comunidad.</p><span class="status-chip">Según disponibilidad</span></article><article class="card feature-card"><span class="feature-icon">◌</span><h3>Colaboraciones</h3><p>Propuestas, proyectos y otras formas de aportar al crecimiento de Valencia PD.</p><span class="status-chip">Próximamente</span></article></div><div class="postular-cta card" data-reveal><div><span class="eyebrow">¿Quieres participar?</span><h2>Las postulaciones se gestionan desde Discord</h2><p class="section-lead">Entra al Discord oficial para consultar los requisitos, convocatorias y formularios disponibles.</p></div><a href="${DISCORD}" target="_blank" rel="noopener" class="btn btn-primary btn-lg">${icon('discord')} Ir al Discord</a></div></div></section></main>`; }

  const pages = {'/':home,'/servidor':servidor,'/galeria':galeria,'/servicios':servicios,'/normativa':normativa,'/guia-inicio':guiaInicio,'/estado':estado,'/postular':postular,'/legal/privacidad':privacidad,'/legal/terminos':terminos};
  const titles = {
    '/': 'Inicio | ValenciaPD',
    '/servidor': 'El servidor | ValenciaPD',
    '/galeria': 'Galería | ValenciaPD',
    '/servicios': 'Servicios | ValenciaPD',
    '/normativa': 'Normativa | ValenciaPD',
    '/guia-inicio': 'Guía de inicio | ValenciaPD',
    '/estado': 'Estado | ValenciaPD',
    '/postular': 'Postular | ValenciaPD',
    '/legal/privacidad': 'Política de privacidad | ValenciaPD',
    '/legal/terminos': 'Términos y condiciones | ValenciaPD',
  };
  const renderer = pages[path] || (() => `<main><section class="section not-found-section"><div class="container"><div class="not-found-card"><span class="eyebrow">Página no encontrada</span><div class="not-found-code">404</div><h1>Esta página no existe</h1><p>La dirección que has solicitado no está disponible o ha cambiado.</p><div class="not-found-actions"><a href="/" class="btn btn-primary btn-lg">Volver al inicio</a><a href="/normativa" class="btn btn-ghost btn-lg">Ver normativa</a></div></div></div></section></main>`);
  document.title = titles[path] || 'Página no encontrada | ValenciaPD';
  app.className = '';
  app.innerHTML = header() + renderer() + footer();

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (finePointer.matches && !reducedMotion.matches) {
    document.documentElement.classList.add('custom-cursor-enabled');
    let cursor = document.getElementById('cursor-glass');
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = 'cursor-glass';
      cursor.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cursor);
    }
    let targetX = -100, targetY = -100, x = targetX, y = targetY, raf = 0;
    const renderCursor = () => {
      x += (targetX - x) * 0.24;
      y += (targetY - y) * 0.24;
      cursor.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      raf = requestAnimationFrame(renderCursor);
    };
    const move = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add('visible');
      const clickable = event.target instanceof Element && event.target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], summary, .discord-user-trigger');
      cursor.classList.toggle('hover', Boolean(clickable));
    };
    const over = (event) => {
      const clickable = event.target instanceof Element && event.target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], summary, .discord-user-trigger');
      cursor.classList.toggle('hover', Boolean(clickable));
    };
    const press = () => cursor.classList.add('press');
    const release = () => cursor.classList.remove('press');
    const leave = () => cursor.classList.remove('visible');
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('mousedown', press, { passive: true });
    window.addEventListener('mouseup', release, { passive: true });
    window.addEventListener('blur', release, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave, { passive: true });
    window.addEventListener('pageshow', () => { targetX = -100; targetY = -100; x = targetX; y = targetY; cursor.classList.remove('press'); if (!raf) raf = requestAnimationFrame(renderCursor); }, { passive: true });
    renderCursor();
  }

  const headerEl = document.getElementById('site-header');
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('nav-toggle');
  const updateHeader = () => headerEl && headerEl.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', updateHeader, {passive:true}); updateHeader();
  toggle?.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  let slide = 0;
  const track = document.getElementById('hero-track');
  const dots = [...document.querySelectorAll('.hero-dot')];
  const setSlide = i => { slide=(i+3)%3; if(track) track.style.transform=`translateX(-${slide*100}%)`; dots.forEach((d,n)=>d.classList.toggle('active',n===slide)); };
  document.querySelector('.hero-prev')?.addEventListener('click',()=>setSlide(slide-1));
  document.querySelector('.hero-next')?.addEventListener('click',()=>setSlide(slide+1));
  dots.forEach(d=>d.addEventListener('click',()=>setSlide(Number(d.dataset.slide))));
  if(track){ window.setInterval(()=>setSlide(slide+1),6500); }

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

  document.querySelectorAll('[data-fivem-launch]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); window.location.href = FIVEM_PROTOCOL; window.setTimeout(() => { if (!document.hidden) { const fallback = document.getElementById('fivem-fallback'); if (fallback) fallback.classList.add('show'); } }, 1200); }));

  async function hydrateDiscordAccount() {
    const slots = [...document.querySelectorAll('[data-discord-auth], #discord-account-slot')];
    if (!slots.length) return;
    try {
      const response = await fetch('/api/discord/me', { headers: { Accept: 'application/json' }, credentials: 'same-origin', cache: 'no-store' });
      const data = await response.json();
      slots.forEach(slot => {
        if (!data.authenticated) {
          slot.innerHTML = `<a href="${DISCORD_CONNECT}" class="btn btn-discord discord-connect-btn">${icon('discord')} Conectar Discord</a>`;
          return;
        }
        const avatar = data.avatarUrl ? `<img src="${data.avatarUrl}" alt="" class="discord-avatar" referrerpolicy="no-referrer">` : icon('discord');
        slot.innerHTML = `<div class="discord-account"><div class="discord-account-pill"><button type="button" class="discord-user-trigger" data-discord-menu aria-expanded="false">${avatar}<span class="discord-user-name">${escapeHtml(data.displayName)}</span><span class="discord-chevron" aria-hidden="true"><svg viewBox="0 0 18 18" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7l4 4 4-4"/></svg></span></button><button type="button" class="discord-logout" data-discord-logout aria-label="Cerrar sesión de Discord" title="Cerrar sesión">${logoutIcon()}</button></div><div class="discord-account-menu" data-discord-menu-panel hidden><div class="discord-menu-head">${avatar}<div><strong>${escapeHtml(data.displayName)}</strong><span>Discord conectado</span></div></div><button type="button" class="discord-menu-item">Mi cuenta <small>Próximamente</small></button><button type="button" class="discord-menu-item" data-discord-logout>Cerrar sesión</button></div></div>`;
        bindDiscordSlot(slot);
      });
    } catch {
      slots.forEach(slot => { if (!slot.innerHTML.trim()) slot.innerHTML = `<a href="${DISCORD_CONNECT}" class="btn btn-discord discord-connect-btn">${icon('discord')} Conectar Discord</a>`; });
    }
  }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function logoutIcon() { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/></svg>`; }
  function bindDiscordSlot(slot) {
    const trigger = slot.querySelector('[data-discord-menu]');
    const panel = slot.querySelector('[data-discord-menu-panel]');
    if (!trigger || !panel) return;
    trigger.addEventListener('click', event => {
      event.stopPropagation();
      const willOpen = panel.hidden;
      document.querySelectorAll('[data-discord-menu-panel]').forEach(p => { p.hidden = true; p.closest('.discord-account')?.querySelector('[data-discord-menu]')?.setAttribute('aria-expanded','false'); });
      panel.hidden = !willOpen;
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
    slot.querySelectorAll('[data-discord-logout]').forEach(button => button.addEventListener('click', async event => {
      event.stopPropagation();
      try { await fetch('/discord/logout', { method: 'POST', credentials: 'same-origin' }); } finally { window.location.reload(); }
    }));
  }
  document.addEventListener('click', () => document.querySelectorAll('[data-discord-menu-panel]').forEach(p => { p.hidden = true; p.closest('.discord-account')?.querySelector('[data-discord-menu]')?.setAttribute('aria-expanded','false'); }), true);
  hydrateDiscordAccount();
  window.addEventListener('pageshow', () => hydrateDiscordAccount(), { passive: true });

  const showDevtoolsNotice = () => { let toast=document.getElementById('devtools-toast'); if(!toast){ toast=document.createElement('div'); toast.id='devtools-toast'; toast.innerHTML='<strong>Acción no disponible</strong><span>Las herramientas de desarrollador están deshabilitadas en este sitio.</span>'; document.body.appendChild(toast); } toast.classList.add('show'); clearTimeout(window.__devtoolsToastTimer); window.__devtoolsToastTimer=window.setTimeout(()=>toast.classList.remove('show'),3200); };
  document.addEventListener('keydown',e=>{ const k=String(e.key).toLowerCase(); const blocked=e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['i','j','c'].includes(k))||(e.ctrlKey&&k==='u'); if(blocked){e.preventDefault();e.stopPropagation();showDevtoolsNotice();}},true);
  const loader=document.getElementById('site-loader'); if(loader){ const hideLoader=()=>{loader.classList.add('is-hidden');window.setTimeout(()=>loader.remove(),400)}; window.setTimeout(hideLoader,650); window.addEventListener('pageshow',()=>{if(document.getElementById('site-loader'))window.setTimeout(hideLoader,180)},{once:true}); }

  const reveals=[...document.querySelectorAll('[data-reveal]')];
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12});reveals.forEach(e=>io.observe(e));}
  else reveals.forEach(e=>e.classList.add('is-visible'));
})();
