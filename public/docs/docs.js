(() => {
  const DISCORD = 'https://discord.gg/valenciapd';
  const DISCORD_EMERGENCIAS = 'https://discord.gg/Hxn35UJJmX';
  const UNBAN = 'https://discord.gg/pGXCRVg7yF';
  const FIVEM = 'fivem://connect/gaa58qq';
  const BASE = '/docs';

  /* ---------- Iconos ---------- */
  const P = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
    map: '<path d="M9 5l6-2 4 2v14l-4-2-6 2-4-2V3l4 2z"/><path d="M9 5v14M15 3v14"/>',
    shield: '<path d="M12 3l7 3v5c0 4.6-2.7 8-7 10-4.3-2-7-5.4-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    users: '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3.5 19c.6-3 2.4-4.5 5.5-4.5s4.9 1.5 5.5 4.5M14 15.5c2.9-.1 4.8 1 5.5 3.5"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5M8 7h7"/>',
    hand: '<path d="M7 11V6a1.5 1.5 0 013 0v4M10 10V4.5a1.5 1.5 0 013 0V10M13 10V5.5a1.5 1.5 0 013 0V12M16 9a1.5 1.5 0 013 0v4a7 7 0 01-7 7h-1a6 6 0 01-5-3l-2-3.5a1.5 1.5 0 012.4-1.7L7 13"/>',
    pd: '<path d="M12 3l7 3v5c0 4.6-2.7 8-7 10-4.3-2-7-5.4-7-10V6l7-3z"/><path d="M12 8v6M9 11h6"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>',
    cmd: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10l3 2-3 2M12 15h5"/>',
    scale: '<path d="M12 4v16M6 20h12M5 7h14"/><path d="M5 7l-3 7a3 3 0 006 0zM19 7l-3 7a3 3 0 006 0z"/>',
    discord: '<path d="M7 7c3-1.3 7-1.3 10 0 2 3 3 6 3 9-1.5 1.2-3 1.8-4.5 2.2l-1-1.7M7 7c-2 3-3 6-3 9 1.5 1.2 3 1.8 4.5 2.2l1-1.7"/><circle cx="9.5" cy="12.5" r="1"/><circle cx="14.5" cy="12.5" r="1"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5"/>',
    moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0012 3z"/>',
    play: '<path d="M8 5l11 7-11 7z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.6 1.6-2.3 3-2.3s2.5.7 3 2.3M15 10h3M15 14h3"/>',
  };
  const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || P.file}</svg>`;

  /* ---------- Helpers de contenido ---------- */
  const hint = (type, html) => `<div class="hint ${type}">${ic({ info: 'info', ok: 'check', warn: 'warn', tip: 'bulb' }[type])}<div>${html}</div></div>`;
  const cards = (items) => `<div class="cards">${items.map(([ico, t, d, href]) => {
    const inner = `<span class="c-ico">${ic(ico)}</span><h4>${t}</h4><p>${d}</p>`;
    return href ? `<a class="card" href="${href}" ${/^https?:/.test(href) ? 'target="_blank" rel="noopener"' : ''}>${inner}</a>` : `<div class="card">${inner}</div>`;
  }).join('')}</div>`;
  const table = (head, rows) => `<div class="tbl"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const steps = (items) => `<ol class="steps">${items.map(([t, d]) => `<li><h4>${t}</h4>${d}</li>`).join('')}</ol>`;
  const expand = (t, body) => `<details class="expand"><summary>${t}</summary><div class="ex-body">${body}</div></details>`;
  const tabs = (items) => `<div class="tabs" data-tabs><div class="tab-list" role="tablist">${items.map(([t], i) => `<button role="tab" aria-selected="${i === 0}" data-tab="${i}">${t}</button>`).join('')}</div>${items.map(([, b], i) => `<div class="tab-panel" role="tabpanel" data-panel="${i}" ${i ? 'hidden' : ''}>${b}</div>`).join('')}</div>`;

  /* ---------- Estructura (sidebar) ---------- */
  // groups -> pages. Cada página: slug, title, icon, badge, body()
  const groups = [
    { id: '', title: null, pages: ['inicio'] },
    { id: 'guia', title: 'Guía', icon: 'book', sub: [
      { id: 'tu-llegada', title: 'Tu llegada', badge: ['help', 'Ayuda'], pages: ['nuevo-en-fivem', 'nuevo-en-servidores-pd', 'tengo-experiencia-previa'] },
      { id: 'primeros-pasos', title: 'Tus primeros pasos', badge: ['help', 'Ayuda'], pages: ['personaje', 'cuerpos-de-emergencia-alta', 'civiles-y-maleantes'] },
    ] },
    { id: 'servidor', title: 'El servidor', icon: 'map', pages: ['aop', 'cuerpos', 'comandos'] },
    { id: 'normativa', title: 'Normativa', icon: 'scale', pages: ['resumen', 'documentos'] },
    { id: 'comunidad', title: 'Comunidad', icon: 'users', pages: ['discord', 'postular', 'desbaneos', 'faq'] },
  ];

  const pages = {};
  const def = (group, slug, o) => { pages[`${group}/${slug}`.replace(/^\//, '')] = { group, slug, ...o }; };

  def('', 'inicio', { title: 'Bienvenido a Valencia PD', nav: 'Inicio', icon: 'home', body: () => `
    <div class="hero-card">
      <h2>Documentación oficial de Valencia PD</h2>
      <p>Todo lo que necesitas para entrar a la comunidad de roleplay <strong>FivePD</strong> ambientada en la Comunidad Valenciana: cómo empezar, cómo funcionan los AOP, los cuerpos de emergencia, la normativa y mucho más.</p>
      <div class="btn-row"><a class="btn primary" href="${BASE}/guia/tu-llegada/nuevo-en-fivem">${ic('hand')} Empieza aquí</a><a class="btn" href="${FIVEM}">${ic('play')} Abrir FiveM</a><a class="btn discord" href="${DISCORD}" target="_blank" rel="noopener">${ic('discord')} Discord</a></div>
    </div>
    <h2 id="por-donde-empezar">¿Por dónde empezar?</h2>
    ${cards([
      ['hand', 'Soy nuevo en FiveM', 'Qué es esto, qué necesitas instalado y cómo entrar por primera vez.', `${BASE}/guia/tu-llegada/nuevo-en-fivem`],
      ['pd', 'Nuevo en servidores PD', 'Cómo funciona un servidor FivePD y qué se espera de ti.', `${BASE}/guia/tu-llegada/nuevo-en-servidores-pd`],
      ['flag', 'Ya tengo experiencia', 'Lo que cambia en Valencia PD si vienes de otra comunidad.', `${BASE}/guia/tu-llegada/tengo-experiencia-previa`],
      ['spark', 'Primeros pasos', 'Crea tu personaje y elige tu camino: emergencias, civil o maleante.', `${BASE}/guia/primeros-pasos/personaje`],
    ])}
    <h2 id="el-servidor">Conoce el servidor</h2>
    ${cards([
      ['map', 'AOP', 'Valencia Centro, Meliana y Silla: tres escenarios, tres plantillas de servicios.', `${BASE}/servidor/aop`],
      ['truck', 'Cuerpos de emergencia', 'Policía, Guardia Civil, SESCV y Bomberos.', `${BASE}/servidor/cuerpos`],
      ['cmd', 'Comandos', 'Los comandos que vas a usar desde el primer minuto.', `${BASE}/servidor/comandos`],
      ['scale', 'Normativa', 'Resumen claro de las normas y descarga de los PDF oficiales.', `${BASE}/normativa/resumen`],
    ])}
    ${hint('info', '<p>Un servidor FivePD es una modalidad de roleplay centrada únicamente en los <strong>servicios de emergencia</strong>. Existen dos bandos: los servicios de emergencia y los maleantes, encargados de generar rol protagonizando avisos.</p>')}
  ` });

  def('guia/tu-llegada', 'nuevo-en-fivem', { title: 'Nuevo en FiveM', icon: 'hand', badge: ['help', 'Ayuda'], body: () => `
    <p>¡Te damos la bienvenida a Valencia!</p>
    <p><strong>Si es tu primera vez en FiveM, este mundo puede parecerte algo abrumador al principio…</strong> y es normal. Por eso, en Valencia PD estamos dispuestos a ayudarte al máximo.</p>
    <p>Estás entrando en un <strong>entorno de rol centrado en las emergencias</strong>, ambientado en la Comunidad Valenciana. Aquí no se trata de jugar como en un online cualquiera: cada situación, cada intervención y cada decisión está pensada para simular, con el mayor realismo posible, el trabajo de los servicios de emergencia.</p>
    <p>Dentro del servidor encontrarás cuerpos como la <strong>Policía</strong>, la <strong>Guardia Civil</strong>, el <strong>SESCV</strong> y los <strong>Bomberos</strong>, interpretados por jugadores que, en muchos casos, se toman el rol con un nivel de detalle muy alto.</p>
    <p><strong>Esto no significa que necesites saberlo todo desde el primer día.</strong> Pero sí es importante que entiendas el tipo de entorno en el que estás entrando: un servidor donde se valora el respeto por el rol de los demás y el esfuerzo que cada uno pone en su personaje.</p>
    <h3 id="que-es-el-roleplay">¿Qué es el Roleplay?</h3>
    <p>Roleplay significa interpretar a un personaje como si fuera real, con su propia identidad y un comportamiento coherente. Tus acciones deben tener sentido para ese personaje. El objetivo es construir situaciones junto a otros jugadores, no «ganar».</p>
    <ul><li>Las historias se mantienen <strong>dentro del juego</strong> y del personaje (IC).</li><li>Lo que ocurre fuera del personaje (OOC) no se mezcla con el rol.</li><li>Tú eliges el nombre, la personalidad y la historia de tu personaje.</li></ul>
    <h3 id="que-es-el-pd">¿Qué es el PD?</h3>
    <p>Un servidor PD (FivePD) simula el trabajo diario de los servicios de emergencia. Los jugadores eligen un rol y los procedimientos deben acercarse lo máximo posible a la realidad: coordinación entre servicios, comunicación clara y paciencia.</p>
    ${table(['Rol', 'Qué haces'], [
      ['Policía Nacional / Policía Local', 'Atiendes avisos, controlas el tráfico y resuelves incidentes en la ciudad.'],
      ['Guardia Civil', 'Patrullas las zonas rurales y las carreteras de los AOP de Meliana y Silla.'],
      ['SESCV', 'Atiendes urgencias médicas y asistes a los heridos.'],
      ['Cuerpo de Bomberos', 'Respondes a incendios, accidentes y rescates.'],
      ['Civil / Maleante', 'Generas rol protagonizando avisos y situaciones para los servicios.'],
    ])}
    <h3 id="antes-de-entrar">Antes de entrar</h3>
    <ul><li><strong>FiveM</strong> instalado.</li><li><strong>GTA V</strong> funcionando correctamente.</li><li>Un <strong>micrófono</strong>: la voz es parte esencial del roleplay, ya que la mayoría de la interacción es en tiempo real.</li></ul>
    ${hint('tip', '<p>No hace falta ser perfecto. Lo que importa es la actitud: observar, respetar el entorno y querer aprender.</p>')}
    ${hint('warn', `<p>Antes de unirte, lee la <a href="${BASE}/normativa/resumen">normativa del servidor</a>. El desconocimiento de la normativa no exime de cumplirla.</p>`)}
    <p><strong>Disfruta de Valencia.</strong></p>
  ` });

  def('guia/tu-llegada', 'nuevo-en-servidores-pd', { title: 'Nuevo en servidores formato PD', icon: 'pd', body: () => `
    <p class="lead">Si vienes de servidores de roleplay «clásicos», un FivePD funciona de otra manera.</p>
    <h2 id="como-funciona">Cómo funciona</h2>
    <p>En un servidor FivePD el protagonismo lo tienen los <strong>servicios de emergencia</strong>. Hay dos bandos:</p>
    ${cards([
      ['shield', 'Servicios de emergencia', 'Policía, Guardia Civil, SESCV y Bomberos. Atienden avisos y resuelven situaciones.'],
      ['flag', 'Maleantes y civiles', 'Generan rol protagonizando avisos: persecuciones, robos, accidentes…'],
    ])}
    ${hint('info', '<p>Esto es un PD, no un roleplay habitual: no hay negociación policial ni recompensas en los robos de gran escala.</p>')}
    <h2 id="que-se-espera">Qué se espera de ti</h2>
    <ul><li><strong>Realismo:</strong> actúa como lo haría tu personaje en la vida real.</li><li><strong>Coordinación:</strong> comunícate con otros servicios y espera tu turno.</li><li><strong>Paciencia:</strong> los avisos requieren tiempo; no todo es acción constante.</li><li><strong>Respeto</strong> por el rol de los demás.</li></ul>
    <h2 id="aop">El concepto de AOP</h2>
    <p>El <strong>AOP</strong> (<em>Area of Patrol</em>) es el lugar donde se desarrolla el rol en cada momento. Los cuerpos disponibles cambian según el AOP activo.</p>
    <p>Consulta todos los detalles en <a href="${BASE}/servidor/aop">AOP</a>.</p>
  ` });

  def('guia/tu-llegada', 'tengo-experiencia-previa', { title: 'Tengo experiencia previa', icon: 'flag', body: () => `
    <p class="lead">¿Vienes de otra comunidad FivePD? Perfecto, te lo ponemos fácil.</p>
    ${hint('warn', '<p>Aunque tengas experiencia, <strong>lee la normativa</strong>: cada servidor tiene sus propias reglas y sus propios límites.</p>')}
    <h2 id="lo-que-cambia">Lo que debes tener en cuenta</h2>
    <ul>
      <li><strong>AOP cambiante:</strong> el escenario cambia entre Valencia Centro, Meliana y Silla según la actividad.</li>
      <li><strong>Persecuciones limitadas:</strong> máximo de 2 persecuciones diarias por maleante, y sin rol previo de peso no hay huida.</li>
      <li><strong>Autorizaciones:</strong> robos de gran escala y uso de armas de fuego requieren autorización de la administración.</li>
      <li><strong>Plantilla de servicios:</strong> los cuerpos disponibles dependen del AOP establecido.</li>
    </ul>
    <h2 id="siguientes-pasos">Siguientes pasos</h2>
    ${cards([
      ['scale', 'Normativa', 'Repasa las reglas.', `${BASE}/normativa/resumen`],
      ['spark', 'Primeros pasos', 'Crea tu personaje.', `${BASE}/guia/primeros-pasos/personaje`],
    ])}
  ` });

  def('guia/primeros-pasos', 'personaje', { title: 'Creación de personaje', icon: 'id', body: () => `
    <p class="lead">Todos los jugadores nuevos aparecerán inicialmente en el <strong>Aeropuerto de Valencia</strong>.</p>
    ${steps([
      ['Crea tu personaje', '<p>Crea tu personaje con una buena apariencia.</p>'],
      ['Elige bien el nombre', '<p>En los cuerpos de emergencias utiliza <strong>nombres españoles o valencianos</strong> y evita tatuajes visibles en cara y cuello.</p>'],
      ['Muévete por el mapa', '<p>Una vez creado, puedes usar <code>/tpmenu</code> para desplazarte por el mapa.</p>'],
    ])}
    ${hint('tip', '<p>Si vas a jugar como civil o maleante además de en emergencias, crea un personaje <strong>diferente</strong>, con otro nombre y apariencia.</p>')}
  ` });

  def('guia/primeros-pasos', 'cuerpos-de-emergencia-alta', { title: 'Entrar en un cuerpo de emergencias', icon: 'shield', body: () => `
    <p class="lead">Si quieres formar parte de Policía, Sanidad o Bomberos, sigue este proceso.</p>
    ${steps([
      ['Únete al Discord de emergencias', `<p>Entra en el <a href="${DISCORD_EMERGENCIAS}" target="_blank" rel="noopener">Discord de 112 Emergencias</a>.</p>`],
      ['Pide tu número de placa', '<p>Ve al apartado <strong>«Trámites»</strong> y abre la opción <strong>«Número de Placa»</strong>.</p>'],
      ['Dirígete a la comisaría', '<p>Ve a la comisaría asignada por el AOP usando <code>/tpmenu</code>.</p>'],
      ['Recibe tu dotación', '<p>Una vez tengas tu número de placa, el equipo se pondrá en contacto contigo para la entrega de tu dotación.</p>'],
    ])}
    <a class="btn discord" href="${DISCORD_EMERGENCIAS}" target="_blank" rel="noopener">${ic('discord')} Discord de emergencias</a>
  ` });

  def('guia/primeros-pasos', 'civiles-y-maleantes', { title: 'Civiles y maleantes', icon: 'flag', body: () => `
    <p class="lead">Genera rol y dale vida a la ciudad desde el otro lado de la ley.</p>
    ${steps([
      ['Crea un personaje distinto', '<p>Distinto al de emergencias: otro nombre y otra apariencia.</p>'],
      ['Desarrolla situaciones creíbles', '<p>Todo lo que hagas debe tener sentido para tu personaje.</p>'],
      ['Usa <code>/112</code> cuando toque', '<p>Si la situación requiere a los servicios de emergencia, avísalos con <code>/112</code>.</p>'],
      ['Consulta #maleantes', '<p>Revisa el canal <strong>#maleantes</strong> del Discord y respeta los tiempos de espera y las indicaciones de la Administración.</p>'],
    ])}
    ${hint('warn', `<p>Recuerda los límites: 2 persecuciones diarias por maleante, y robos de gran escala o armas de fuego solo con autorización. Más detalles en la <a href="${BASE}/normativa/resumen">normativa</a>.</p>`)}
  ` });

  def('servidor', 'aop', { title: 'AOP: escenarios del servidor', nav: 'AOP', icon: 'map', body: () => `
    <p>El <strong>AOP</strong> es el lugar donde se desarrolla el rol. Habitualmente, si no hay actividad IC el AOP es <strong>Meliana</strong> o <strong>Silla</strong>; cuando hay más actividad se cambia a <strong>Valencia Centro</strong>.</p>
    ${table(['AOP', 'Zona del mapa', 'Cuerpos disponibles'], [
      ['<strong>Valencia Centro</strong>', 'Ciudad', 'Policía Nacional · Policía Local de Valencia · SESCV · Cuerpo de Bomberos del Ayuntamiento de Valencia'],
      ['<strong>Meliana</strong>', 'Paleto Bay', 'Guardia Civil · Policía Local de Meliana · SESCV · Cuerpo de Bomberos de la Comunidad Valenciana'],
      ['<strong>Silla</strong>', 'Sandy Shores y Grapeseed', 'Guardia Civil · Policía Local de Silla · SESCV · Cuerpo de Bomberos de la Comunidad Valenciana'],
    ])}
    <h2 id="detalle">Detalle por AOP</h2>
    ${tabs([
      ['Valencia Centro', '<p>El escenario con más actividad. Ambientado en la ciudad, con la Policía Nacional y la Policía Local de Valencia, SESCV y el Cuerpo de Bomberos del Ayuntamiento de Valencia.</p>'],
      ['Meliana', '<p>Se desarrolla en la zona de Paleto Bay. Cuerpos: Guardia Civil, Policía Local de Meliana, SESCV y Cuerpo de Bomberos de la Comunidad Valenciana.</p>'],
      ['Silla', '<p>Se desarrolla en Sandy Shores y Grapeseed. Cuerpos: Guardia Civil, Policía Local de Silla, SESCV y Cuerpo de Bomberos de la Comunidad Valenciana.</p>'],
    ])}
    ${hint('info', `<p>Para desplazarte a la comisaría que corresponde al AOP activo usa <code>/tpmenu</code>. Más en <a href="${BASE}/servidor/comandos">Comandos</a>.</p>`)}
  ` });

  def('servidor', 'cuerpos', { title: 'Cuerpos de emergencia', icon: 'truck', body: () => `
    <p class="lead">Los cuerpos disponibles cambian según el AOP establecido.</p>
    ${cards([
      ['shield', 'Policía Nacional', 'Solo en AOP Valencia Centro.'],
      ['shield', 'Policía Local', 'De Valencia, Meliana o Silla según el AOP.'],
      ['shield', 'Guardia Civil', 'En los AOP de Meliana y Silla.'],
      ['pd', 'SESCV', 'Servicio de emergencias sanitarias en todos los AOP.'],
      ['truck', 'Cuerpo de Bomberos', 'Del Ayuntamiento de Valencia o de la Comunidad Valenciana.'],
    ])}
    ${hint('ok', `<p>¿Quieres unirte? Consulta <a href="${BASE}/guia/primeros-pasos/cuerpos-de-emergencia-alta">cómo entrar en un cuerpo de emergencias</a>.</p>`)}
  ` });

  def('servidor', 'comandos', { title: 'Comandos básicos', icon: 'cmd', body: () => `
    <p class="lead">Los comandos que más vas a usar. Úsalos con criterio: su mal uso está sancionado.</p>
    ${table(['Comando', 'Uso'], [
      ['<code>/tpmenu</code>', 'Desplazarte por el mapa (por ejemplo, a la comisaría del AOP).'],
      ['<code>/112</code>', 'Enviar un aviso a los servicios de emergencia cuando la situación lo requiera.'],
      ['<code>/ooc</code>', 'Hablar con todo el servidor fuera de rol.'],
      ['<code>/oop</code>', 'Hablar solo con quienes están en un radio cercano.'],
      ['<code>/me</code>', 'Describir acciones que no se pueden expresar IC.'],
      ['<code>/do</code>', 'Describir sucesos del entorno.'],
      ['<code>/ayuda</code>', 'Solo para preguntas de jugadores.'],
      ['<code>/reportar</code>', 'Pedir atención del staff.'],
      ['<code>/x</code>', 'Mensajes anónimos tipo RRSS; nunca para faltar al respeto.'],
      ['<code>/camara</code>', 'Prohibido usarlo para espiar conversaciones u obtener información que el personaje no debería tener.'],
    ])}
    ${hint('warn', '<p>No enviar avisos por <code>/112</code> cuando la situación requiere emergencias está sancionado, igual que abusar de <code>/ayuda</code>.</p>')}
  ` });

  def('normativa', 'resumen', { title: 'Resumen de la normativa', nav: 'Resumen', icon: 'scale', body: () => `
    ${hint('warn', '<p>La no lectura o el desconocimiento de la normativa <strong>no exime de cumplirla</strong> ni de posibles sanciones. Los documentos PDF oficiales prevalecen sobre este resumen.</p>')}
    <h2 id="introduccion">Introducción</h2>
    <ul><li><strong>Criterio del staff:</strong> las sanciones se imponen bajo criterio del staff en beneficio del servidor y los jugadores. Los vacíos legales los resuelve el equipo de staff.</li><li><strong>Edad mínima:</strong> 15-16 años, bajo criterio de la administración según madurez del jugador y de la voz.</li></ul>
    <h2 id="conducta">Conducta en rol</h2>
    ${expand('Power Gaming (PG)', '<p>Realizar acciones imposibles en la vida real aunque el juego lo permita.</p>')}
    ${expand('VDM y DM', '<p>Atropellar o matar a otro jugador sin contexto previo está prohibido.</p>')}
    ${expand('Valorar la vida y las consecuencias', '<p>Valora la vida de tu personaje y las consecuencias de sus actos.</p>')}
    ${expand('Conducción indebida', '<p>Prohibida la conducción temeraria en zonas de rol.</p>')}
    ${expand('Respeto', '<p>Prohibida cualquier actitud tóxica, insultante o acosadora hacia jugadores y staff.</p>')}
    ${expand('Personajes y peds', '<p>Atuendos y peds deben adecuarse al contexto. Peds de animales solo con autorización del staff.</p>')}
    ${expand('Desconexión y evasión de rol', '<p>Prohibido desconectarse en medio de un rol o evitar sus consecuencias.</p>')}
    ${expand('Modulador de voz', '<p>Prohibido para ocultar una edad no permitida; solo con aprobación y supervisión del staff.</p>')}
    <h2 id="maleantes">Maleantes, robos y armas</h2>
    ${table(['Norma', 'Resumen'], [
      ['Persecuciones', 'Sin rol previo de peso no hay huida. Límite de <strong>2 persecuciones diarias</strong> por maleante.'],
      ['Entorpecer roles', 'No entrometerse en un rol en curso sin autorización de los participantes.'],
      ['Comisarías', 'Prohibido rolear en comisarías o alrededores sin autorización previa del staff.'],
      ['Vehículos', 'Prohibido robar vehículos de emergencia o de NPC.'],
      ['Robos de gran escala', 'Bancos, joyerías, etc. requieren autorización de la administración. No hay negociación policial ni recompensa.'],
      ['Armas', 'Uso de armas de fuego solo con autorización administrativa. Máximo un rol agresivo con armas por hora.'],
      ['Autorizaciones', 'Si pides <code>/ayuda</code> o <code>/reportar</code> y no hay respuesta, acude a la sala de espera. Sin respuesta, el rol queda <strong>NO AUTORIZADO</strong>.'],
    ])}
    <h2 id="trampas">Trampas y programas externos</h2>
    ${hint('warn', '<p>Cualquier programa externo para modificar, dumpear, molestar, crashear o conseguir ventaja conlleva <strong>baneo permanente no apelable</strong>. Tampoco está permitido aprovechar bugs sin reportarlos al staff.</p>')}
    <h2 id="discord">Normativa de Discord</h2>
    <ul>
      <li><strong>Respeto:</strong> prohibida cualquier actitud tóxica, discriminatoria o acosadora.</li>
      <li><strong>Contenido inapropiado:</strong> nada sexual, violento, gore o discriminatorio, incluidos avatar, banner y estado.</li>
      <li><strong>Spam y flood:</strong> sin mensajes repetidos, mayúsculas excesivas ni menciones masivas.</li>
      <li><strong>Publicidad:</strong> prohibido publicitar otros servidores o enlaces, también por privado.</li>
      <li><strong>Multicuentas y suplantación:</strong> prohibidas las cuentas alternativas para evadir sanciones y hacerse pasar por otros o por staff.</li>
      <li><strong>Idioma:</strong> el idioma oficial es el español.</li>
      <li><strong>Voz:</strong> prohibidos soundboards, ruidos molestos y saltos de canal para molestar.</li>
      <li><strong>Privacidad:</strong> prohibido publicar capturas o conversaciones privadas sin consentimiento.</li>
    </ul>
  ` });

  def('normativa', 'documentos', { title: 'Documentos oficiales', icon: 'file', body: () => `
    <p class="lead">Los documentos completos prevalecen sobre el resumen. Consúltalos y descárgalos aquí.</p>
    ${cards([
      ['file', 'Normativa general (PDF)', 'Normas completas de juego en el servidor.', '/normativa-general.pdf'],
      ['file', 'Normativa Discord (PDF)', 'Normas de convivencia en el Discord.', '/normativa-discord.pdf'],
    ])}
    <p>También puedes leer la <a href="/normativa">normativa en la web</a>.</p>
  ` });

  def('comunidad', 'discord', { title: 'Discord y enlaces', icon: 'discord', body: () => `
    <p class="lead">Estos son los espacios oficiales de Valencia PD.</p>
    ${cards([
      ['discord', 'Discord Valencia PD', 'Comunidad principal, soporte, avisos y organización del servidor.', DISCORD],
      ['shield', 'Discord de emergencias', 'Coordinación de los servicios de emergencias y sus trámites internos.', DISCORD_EMERGENCIAS],
      ['play', 'Conectar al servidor', 'Abre FiveM y conecta directamente.', FIVEM],
      ['users', 'Redes sociales', 'Síguenos en Instagram, TikTok y Twitch.', 'https://www.instagram.com/valenciapd_/'],
    ])}
    ${hint('info', '<p>Dirección de conexión: <code>connect cfx.re/join/gaa58qq</code></p>')}
  ` });

  def('comunidad', 'postular', { title: 'Postular al equipo', icon: 'users', body: () => `
    <p>Cuando abrimos convocatorias, buscamos personas responsables, constantes y con ganas de aportar.</p>
    ${cards([
      ['shield', 'Staff', 'Ayuda con la moderación, el soporte y la organización de la comunidad.'],
      ['truck', 'Cuerpos de emergencias', 'Desarrolla tu rol dentro de Policía, Sanidad o Bomberos siguiendo los procesos de la comunidad.'],
      ['users', 'Colaboraciones', 'Propuestas, proyectos y otras formas de aportar.'],
    ])}
    <p>Las postulaciones se gestionan desde Discord: entra para consultar requisitos, convocatorias y formularios.</p>
    <a class="btn discord" href="${DISCORD}" target="_blank" rel="noopener">${ic('discord')} Ir al Discord</a>
  ` });

  def('comunidad', 'desbaneos', { title: 'Desbaneos', icon: 'check', body: () => `
    <p>Si has sido sancionado y quieres apelar, hazlo en el Discord de desbaneos.</p>
    ${hint('warn', '<p>Los baneos por uso de programas externos son <strong>permanentes y no apelables</strong>.</p>')}
    <a class="btn discord" href="${UNBAN}" target="_blank" rel="noopener">${ic('discord')} Discord de desbaneos</a>
  ` });

  def('comunidad', 'faq', { title: 'Preguntas frecuentes', nav: 'FAQ', icon: 'info', body: () => `
    ${expand('¿Qué necesito para jugar?', '<p>FiveM instalado, GTA V funcionando y un micrófono.</p>')}
    ${expand('¿Cuál es la edad mínima?', '<p>15-16 años, según criterios de madurez valorados por la administración.</p>')}
    ${expand('¿Dónde aparezco la primera vez?', '<p>En el Aeropuerto de Valencia. Usa <code>/tpmenu</code> para moverte.</p>')}
    ${expand('¿Cómo entro a Policía, Sanidad o Bomberos?', `<p>Sigue la guía: <a href="${BASE}/guia/primeros-pasos/cuerpos-de-emergencia-alta">entrar en un cuerpo de emergencias</a>.</p>`)}
    ${expand('¿Qué AOP está activo?', '<p>Habitualmente Meliana o Silla; cuando hay más actividad se cambia a Valencia Centro.</p>')}
    ${expand('Pedí ayuda y nadie responde', '<p>Acude a la sala de espera. Sin respuesta allí, el rol queda NO AUTORIZADO.</p>')}
  ` });

  /* ---------- Árbol plano ---------- */
  const flat = [];
  groups.forEach(g => {
    const add = (grp, slugs, label) => slugs.forEach(s => {
      const key = `${grp}/${s}`.replace(/^\//, '');
      const p = pages[key];
      if (p) { p.key = key; p.url = `${BASE}/${key}`.replace(/\/inicio$/, ''); p.crumbs = label; flat.push(p); }
    });
    if (g.pages) add(g.id, g.pages, g.title);
    (g.sub || []).forEach(s => add(`${g.id}/${s.id}`, s.pages, [g.title, s.title].join('|')));
  });
  pages.inicio = pages.inicio || pages[''] || null;

  const strip = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  flat.forEach(p => { p.html = p.body(); p.text = strip(p.html); });

  /* ---------- Ruta ---------- */
  let path = location.pathname.replace(/\/+$/, '');
  const norm = (pth) => pth.replace(/^\/docs\/?/, '').replace(/^\/+|\/+$/g, '');
  const find = (pth) => { const k = norm(pth); return flat.find(p => (p.key === 'inicio' ? '' : p.key) === k); };
  const slug = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* ---------- Render ---------- */
  const app = document.getElementById('docs-app');
  const bodyCls = document.body.classList;

  function sidebar(cur) {
    const link = (p) => `<a class="nav-link ${cur && cur.key === p.key ? 'active' : ''}" href="${p.url}" data-nav>${p.nav || p.title}${p.badge ? `<span class="badge ${p.badge[0]}">${p.badge[1]}</span>` : ''}</a>`;
    return groups.map(g => {
      if (!g.title) return `<div class="nav-group">${g.pages.map(s => link(pages[s === 'inicio' ? 'inicio' : s])).join('')}</div>`;
      const direct = (g.pages || []).map(s => link(pages[`${g.id}/${s}`])).join('');
      const subs = (g.sub || []).map(s => `<div class="nav-label">${s.title}${s.badge ? `<span class="badge ${s.badge[0]}">${s.badge[1]}</span>` : ''}</div><div class="nav-sub">${s.pages.map(sl => link(pages[`${g.id}/${s.id}/${sl}`])).join('')}</div>`).join('');
      return `<div class="nav-group"><div class="nav-title">${ic(g.icon)}${g.title}</div>${direct}${subs}</div>`;
    }).join('');
  }

  function render(p) {
    const idx = flat.indexOf(p);
    const prev = flat[idx - 1], next = flat[idx + 1];
    const crumbs = p.crumbs ? p.crumbs.split('|').map(c => `<span>${c}</span>`).join('<span class="sep">›</span>') : '<span>Inicio</span>';
    const html = p.html.replace(/<h([23])( id="([^"]+)")?>([^<]+)<\/h\1>/g, (m, l, _a, id, t) => { const i = id || slug(t); return `<h${l} id="${i}">${t}<a class="anchor" href="#${i}" aria-label="Enlace">#</a></h${l}>`; })
      .replace(/<h2>([^<]+)<\/h2>/g, (m, t) => `<h2 id="${slug(t)}">${t}</h2>`);
    document.title = p.key === 'inicio' ? 'Valencia PD Docs' : `${p.title} | Valencia PD Docs`;
    app.innerHTML = `
      <header class="topbar">
        <button class="icon-btn menu-btn" id="menu-btn" aria-label="Abrir menú">${ic('menu')}</button>
        <a class="brand" href="${BASE}" data-nav><img src="/site/valenciapd-logo.png" alt=""><span>Valencia PD Docs</span></a>
        <button class="search-btn" id="search-open" aria-label="Buscar">${ic('search')}<span>Buscar…</span><kbd>Ctrl</kbd><kbd>K</kbd></button>
        <div class="top-actions">
          <button class="icon-btn" id="theme-btn" aria-label="Cambiar tema">${ic('moon')}</button>
          <a class="top-link" href="/">${ic('home')} Ir a la web</a>
        </div>
      </header>
      <div class="shell">
        <aside class="sidebar" id="sidebar">${sidebar(p)}<div class="powered"><a href="/">${ic('shield')} Valencia PD · Comunidad FivePD</a></div></aside>
        <main class="main"><article class="page">
          <div class="page-tools"><button class="pill-btn" id="copy-btn">${ic('copy')} Copiar enlace</button></div>
          <div class="crumbs">${crumbs}</div>
          ${p.badge ? `<div class="page-badges"><span class="badge ${p.badge[0]}">${p.badge[1]}</span></div>` : ''}
          <h1><span class="h1-ico">${ic(p.icon)}</span>${p.title}</h1>
          ${html}
          <nav class="pager">${prev ? `<a href="${prev.url}" data-nav><small>← Anterior</small><b>${prev.nav || prev.title}</b></a>` : '<span></span>'}${next ? `<a class="next" href="${next.url}" data-nav><small>Siguiente →</small><b>${next.nav || next.title}</b></a>` : ''}</nav>
          <p class="page-foot">¿Algo no está claro? Pregunta en el <a href="${DISCORD}" target="_blank" rel="noopener">Discord de Valencia PD</a>.</p>
        </article></main>
        <aside class="toc" id="toc"></aside>
      </div>
      <div class="scrim" id="scrim"></div>
      <div class="modal" id="modal" role="dialog" aria-modal="true" aria-label="Buscar"><div class="modal-box"><div class="modal-in">${ic('search')}<input id="q" type="search" placeholder="Buscar en la documentación…" autocomplete="off"><kbd>Esc</kbd></div><div class="results" id="results"></div></div></div>`;
    setupToc(); setupTabs(); setupUi(p);
    const cur = app.querySelector('.nav-link.active'); if (cur) cur.scrollIntoView({ block: 'nearest' });
    if (location.hash) { const el = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (el) el.scrollIntoView(); } else window.scrollTo(0, 0);
  }

  function setupToc() {
    const hs = [...app.querySelectorAll('.page h2[id], .page h3[id]')];
    const toc = document.getElementById('toc');
    if (!hs.length) { toc.innerHTML = ''; return; }
    toc.innerHTML = `<h5>${ic('list')} En esta página</h5>` + hs.map(h => `<a class="${h.tagName === 'H3' ? 'l3' : ''}" href="#${h.id}">${h.childNodes[0].textContent}</a>`).join('');
    const links = [...toc.querySelectorAll('a')];
    const onScroll = () => {
      let active = hs[0];
      hs.forEach(h => { if (h.getBoundingClientRect().top < 120) active = h; });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active.id));
    };
    window.onscroll = onScroll; onScroll();
  }

  function setupTabs() {
    app.querySelectorAll('[data-tabs]').forEach(t => {
      t.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
        t.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === b));
        t.querySelectorAll('[data-panel]').forEach(pn => pn.hidden = pn.dataset.panel !== b.dataset.tab);
      }));
    });
  }

  /* ---------- Búsqueda y UI ---------- */
  function setupUi() {
    const modal = document.getElementById('modal'), q = document.getElementById('q'), res = document.getElementById('results');
    const open = () => { modal.classList.add('open'); q.value = ''; show(''); setTimeout(() => q.focus(), 0); };
    const close = () => modal.classList.remove('open');
    let sel = 0;
    function show(term) {
      const t = term.trim().toLowerCase();
      let list = flat.map(p => {
        if (!t) return { p, s: 1 };
        const inTitle = p.title.toLowerCase().includes(t), inText = p.text.toLowerCase().includes(t);
        return { p, s: inTitle ? 3 : inText ? 2 : 0 };
      }).filter(r => r.s).sort((a, b) => b.s - a.s).slice(0, 12);
      sel = 0;
      res.innerHTML = list.length ? list.map((r, i) => {
        let snip = r.p.text.slice(0, 110) + '…';
        if (t) { const k = r.p.text.toLowerCase().indexOf(t); if (k > -1) snip = (k > 30 ? '…' : '') + r.p.text.slice(Math.max(0, k - 30), k + 90) + '…'; }
        return `<a class="res ${i === 0 ? 'sel' : ''}" href="${r.p.url}" data-nav data-res><small>${(r.p.crumbs || 'Inicio').replace('|', ' › ')}</small><b>${r.p.title}</b><span>${snip}</span></a>`;
      }).join('') : '<div class="res-empty">Sin resultados</div>';
    }
    document.getElementById('search-open').onclick = open;
    q.oninput = () => show(q.value);
    modal.onclick = (e) => { if (e.target === modal || e.target.closest('[data-res]')) close(); };
    q.onkeydown = (e) => {
      const items = [...res.querySelectorAll('.res')];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); items[sel] && items[sel].classList.remove('sel');
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[sel] && (items[sel].classList.add('sel'), items[sel].scrollIntoView({ block: 'nearest' }));
      } else if (e.key === 'Enter' && items[sel]) { e.preventDefault(); items[sel].click(); }
    };
    window.onkeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
      else if (e.key === 'Escape') { close(); bodyCls.remove('nav-open'); }
      else if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
    };
    document.getElementById('menu-btn').onclick = () => bodyCls.toggle('nav-open');
    document.getElementById('scrim').onclick = () => bodyCls.remove('nav-open');
    const themeBtn = document.getElementById('theme-btn');
    const isDark = () => (document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
    const paint = () => { themeBtn.innerHTML = ic(isDark() ? 'sun' : 'moon'); };
    themeBtn.onclick = () => { const n = isDark() ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', n); try { localStorage.setItem('vpd-docs-theme', n); } catch (e) {} paint(); };
    paint();
    const cb = document.getElementById('copy-btn');
    cb.onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(() => { cb.innerHTML = ic('check') + ' Copiado'; setTimeout(() => cb.innerHTML = ic('copy') + ' Copiar enlace', 1600); }).catch(() => {}); };
  }

  /* ---------- Navegación SPA ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-nav]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    const url = new URL(a.href);
    if (url.origin !== location.origin) return;
    const p = find(url.pathname);
    if (!p) return;
    e.preventDefault(); bodyCls.remove('nav-open');
    history.pushState({}, '', url.pathname + url.hash); render(p);
  });
  window.addEventListener('popstate', () => { const p = find(location.pathname); if (p) render(p); });

  const initial = find(path);
  if (initial) render(initial);
  else { history.replaceState({}, '', BASE); render(flat[0]); }
})();
