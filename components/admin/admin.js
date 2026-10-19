// Panel de staff de Valencia PD. Todo el HTML se crea con el DOM (textContent), nunca con innerHTML,
// para que ningún dato de jugadores pueda inyectar código. Los botones solo aparecen si el servidor
// devuelve esa operación en `ops` (calculado con los permisos de luxu_admin), y el servidor vuelve a comprobarlo.
;(() => {
  'use strict'

  // ------------------------------------------------------------------ utilidades
  const $ = (id) => document.getElementById(id)
  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag)
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue
      if (k === 'class') node.className = v
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v)
      else if (k === 'dataset') Object.assign(node.dataset, v)
      else if (k === 'style') node.style.cssText = v // CSSOM: permitido por la CSP (los atributos style no)
      else if (k in node && !['list', 'form', 'type'].includes(k)) node[k] = v
      else node.setAttribute(k, v === true ? '' : String(v))
    }
    for (const c of children.flat(Infinity)) if (c != null && c !== false) node.append(c instanceof Node ? c : String(c))
    return node
  }
  const S = { me: null, ops: new Set(), perms: new Set(), section: null, players: [], selected: new Set(), detail: null, cleanup: [] }
  const can = (op) => S.ops.has(op)
  const any = (...ops) => ops.some(can)

  function toast(msg, kind = 'ok') {
    const t = el('div', { class: `toast ${kind}` }, msg)
    $('toasts').append(t)
    setTimeout(() => t.remove(), 5000)
  }

  async function api(path, body) {
    const opts = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' } : { credentials: 'same-origin' }
    const res = await fetch(path, opts)
    let data = {}
    try { data = await res.json() } catch {}
    if (res.status === 401 && S.me) { location.href = '/discord?next=admin'; throw new Error('Sesión caducada') }
    if (!res.ok) { const e = new Error(data.error || `Error ${res.status}`); e.status = res.status; e.data = data; throw e }
    return data
  }
  const call = (op, data = {}) => api('/api/admin/call', { op, data }).then((r) => r.result)
  // Ejecuta una acción y muestra el resultado. luxu devuelve false cuando no se pudo hacer.
  async function run(op, data, okMsg) {
    try {
      const r = await call(op, data)
      if (r === false) { toast('La acción no se pudo completar (jerarquía, jugador no válido o datos incorrectos)', 'err'); return r }
      if (okMsg) toast(okMsg)
      return r
    } catch (e) { toast(e.message, 'err'); throw e }
  }

  const fmtNum = (n) => new Intl.NumberFormat('es-ES').format(Number(n) || 0)
  function fmtDate(v) {
    if (v == null || v === '') return '—'
    const d = typeof v === 'number' || /^\d+$/.test(String(v)) ? new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v)) : new Date(v)
    return isNaN(d) ? String(v) : d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  }
  function fmtDur(ms) {
    ms = Number(ms) || 0
    const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
    return [d && `${d}d`, h && `${h}h`, `${m}m`].filter(Boolean).join(' ')
  }
  const PERMANENT = new Date('2200-01-01').getTime()
  const DURATIONS = [
    ['1 hora', 3600e3], ['6 horas', 6 * 3600e3], ['1 día', 864e5], ['3 días', 3 * 864e5], ['7 días', 7 * 864e5],
    ['14 días', 14 * 864e5], ['30 días', 30 * 864e5], ['Permanente', 0],
  ]
  const JAIL_DURATIONS = [['5 min', 300e3], ['10 min', 600e3], ['15 min', 900e3], ['30 min', 1800e3], ['1 hora', 3600e3], ['2 horas', 7200e3], ['1 día', 864e5]]
  const banExpiry = (ms) => (Number(ms) === 0 ? PERMANENT : Date.now() + Number(ms))
  const STAT_LABELS = {
    onlinePlayerCount: 'Jugadores conectados', totalUniquePlayers: 'Jugadores únicos', totalCharacters: 'Personajes', playerRetention: 'Retención de jugadores (%)',
    totalBankMoney: 'Dinero total en bancos', totalBans: 'Baneos', totalWarnings: 'Advertencias', totalReports: 'Reportes', newPlayers: 'Jugadores nuevos',
    averagePlaytime: 'Tiempo medio de juego', peakPlayers: 'Pico de jugadores', totalJailed: 'Encarcelados', totalVehicles: 'Vehículos',
  }
  const TASK_LABELS = { deleteVehicles: 'Borrar vehículos abandonados' }
  // Los mismos que usa luxu_admin en el juego para la retransmisión
  const LUXU_ICE = [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478'], username: 'peerjs', credential: 'peerjsp' },
  ]
  const WEATHERS = ['EXTRASUNNY', 'CLEAR', 'NEUTRAL', 'SMOG', 'FOGGY', 'OVERCAST', 'CLOUDS', 'CLEARING', 'RAIN', 'THUNDER', 'SNOW', 'BLIZZARD', 'SNOWLIGHT', 'XMAS', 'HALLOWEEN']

  // ------------------------------------------------------------------ diálogos
  const dlg = $('dlg')
  function closeDialog() { if (dlg.open) dlg.close() }
  dlg.addEventListener('close', () => { dlg.classList.remove('wide'); dlg.onclose?.(); dlg.onclose = null })

  function field(f) {
    const id = 'f_' + f.name
    let input
    if (f.type === 'select') {
      input = el('select', { id }, (f.options || []).map((o) => el('option', { value: String(o.value), selected: String(o.value) === String(f.value ?? '') }, o.label)))
    } else if (f.type === 'textarea') {
      input = el('textarea', { id, maxLength: f.maxLength || 1000, placeholder: f.placeholder || '' })
      input.value = f.value ?? ''
    } else if (f.type === 'checkbox') {
      input = el('input', { id, type: 'checkbox', checked: !!f.value })
      return { input, node: el('label', { class: 'check field' }, input, f.label) }
    } else {
      input = el('input', { id, type: f.type || 'text', min: f.min, max: f.max, step: f.step, maxLength: f.maxLength || 200, placeholder: f.placeholder || '', autocomplete: 'off' })
      if (f.list) { const lid = id + '_list'; input.setAttribute('list', lid); f._dl = el('datalist', { id: lid }, f.list.slice(0, 3000).map((v) => el('option', { value: v }))) }
      input.value = f.value ?? ''
    }
    return { input, node: el('div', { class: 'field' }, el('label', { for: id }, f.label), input, f._dl, f.hint && el('div', { class: 'hint' }, f.hint)) }
  }

  // Formulario modal. Devuelve los valores o null si se cancela.
  function form(title, fields, submitLabel = 'Aceptar', { danger = false } = {}) {
    return new Promise((resolve) => {
      $('dlg-title').textContent = title
      const inputs = {}
      $('dlg-body').replaceChildren(...fields.map((f) => { const { input, node } = field(f); inputs[f.name] = { input, f }; return node }))
      const submit = el('button', { class: `btn ${danger ? 'danger' : 'primary'}`, value: 'ok', type: 'submit' }, submitLabel)
      $('dlg-foot').replaceChildren(el('button', { class: 'btn ghost', value: 'cancel', formNoValidate: true }, 'Cancelar'), submit)
      let done = false
      $('dlg-form').onsubmit = (ev) => {
        if (ev.submitter?.value !== 'ok') return
        ev.preventDefault()
        const values = {}
        for (const [k, { input, f }] of Object.entries(inputs)) {
          let v = f.type === 'checkbox' ? input.checked : input.value.trim()
          if (f.required && v === '') { toast(`Rellena: ${f.label}`, 'err'); input.focus(); return }
          if (f.type === 'number' && v !== '') {
            v = Number(v)
            if (!Number.isFinite(v) || (f.min != null && v < f.min) || (f.max != null && v > f.max)) { toast(`Valor no válido: ${f.label}`, 'err'); input.focus(); return }
          }
          values[k] = v
        }
        done = true
        closeDialog()
        resolve(values)
      }
      dlg.onclose = () => { if (!done) resolve(null) }
      if (!dlg.open) dlg.showModal()
      const first = fields.length && inputs[fields[0].name].input
      if (first) first.focus()
    })
  }
  const confirmBox = (text, label = 'Confirmar') => form(text, [], label, { danger: true }).then((v) => v !== null)

  function sheet(title, content, footer = [], { wide = true, onclose } = {}) {
    $('dlg-title').textContent = title
    $('dlg-body').replaceChildren(content)
    $('dlg-foot').replaceChildren(...footer.filter(Boolean), el('button', { class: 'btn', value: 'cancel', formNoValidate: true }, 'Cerrar'))
    $('dlg-form').onsubmit = null
    dlg.classList.toggle('wide', wide)
    dlg.onclose = onclose || null
    if (!dlg.open) dlg.showModal()
  }

  // ------------------------------------------------------------------ tablas
  function table(rows, cols, actions) {
    if (!rows || rows.length === 0) return el('div', { class: 'empty' }, 'No hay datos.')
    return el('div', { class: 'table-wrap' }, el('table', {},
      el('thead', {}, el('tr', {}, cols.map((c) => el('th', { class: c.num ? 'num' : '' }, c.label)), actions && el('th', {}))),
      el('tbody', {}, rows.map((r) => el('tr', {},
        cols.map((c) => el('td', { class: c.num ? 'num' : '' }, c.fmt ? c.fmt(r[c.key], r) : r[c.key] == null || r[c.key] === '' ? '—' : typeof r[c.key] === 'object' ? JSON.stringify(r[c.key]) : String(r[c.key]))),
        actions && el('td', { class: 'actions' }, actions(r).filter(Boolean)),
      )))))
  }
  const btn = (label, onclick, cls = '') => el('button', { class: `btn sm ${cls}`, type: 'button', onclick }, label)
  const asList = (r) => (Array.isArray(r) ? r : r && typeof r === 'object' ? Object.values(r) : [])

  // ------------------------------------------------------------------ navegación
  const SECTIONS = [
    { id: 'inicio', label: 'Inicio', show: () => true, render: renderHome },
    { id: 'jugadores', label: 'Jugadores', show: () => can('panel'), render: renderPlayers },
    { id: 'offline', label: 'Jugadores offline', show: () => can('offline.search_players'), render: renderOffline },
    { id: 'moderacion', label: 'Moderación', show: () => any('bans', 'warnings', 'jail_list'), render: renderModeration },
    { id: 'reportes', label: 'Reportes y chats', show: () => can('chats'), render: renderChats },
    { id: 'staff', label: 'Staff', show: () => can('staff_list'), render: renderStaff },
    { id: 'registros', label: 'Registros', show: () => can('get_log_counts'), render: renderLogs },
    { id: 'vehiculos', label: 'Vehículos', show: () => any('unlock_vehicle_doors_by_plate', 'update_vehicle_plate', 'update_vehicle_owner', 'remove_vehicle', 'send_to_garage', 'get_vehicle_owners', 'force_wipe_vehicles'), render: renderVehicles },
    { id: 'servidor', label: 'Servidor', show: () => any('announcment', 'update_weather', 'update_time', 'resources', 'console_read', 'console_exec', 'get_tasks', 'teleport_everyone'), render: renderServer },
  ]

  function go(id) {
    const sec = SECTIONS.find((s) => s.id === id && s.show()) || SECTIONS[0]
    S.cleanup.splice(0).forEach((fn) => { try { fn() } catch {} })
    S.section = sec.id
    if (location.hash !== '#' + sec.id) history.replaceState(null, '', '#' + sec.id)
    for (const b of $('nav').children) b.classList.toggle('active', b.dataset.id === sec.id)
    $('nav').classList.remove('open')
    const root = el('div')
    $('content').replaceChildren(root)
    Promise.resolve(sec.render(root)).catch((e) => root.replaceChildren(el('div', { class: 'empty' }, e.message)))
  }
  // intervalos que se limpian al cambiar de sección
  function every(ms, fn) { const t = setInterval(() => { if (!document.hidden && !dlg.open) fn() }, ms); S.cleanup.push(() => clearInterval(t)) }

  // ------------------------------------------------------------------ inicio
  async function renderHome(root) {
    root.append(el('h2', { class: 'title' }, `Hola, ${S.me.staff.nickname}`))
    root.append(el('p', { class: 'muted' }, `Grupo en luxu_admin: ${S.me.staff.groupLabel}. ${S.me.staff.isMember ? '' : 'Entras por tu rol de Discord: pide que te añadan como miembro en luxu para que tus notas y sanciones queden a tu nombre.'}`))
    const cards = el('div', { class: 'stats' })
    root.append(cards)
    if (can('panel')) {
      const p = await call('panel')
      const info = p?.serverInformation || {}
      cards.append(
        el('div', { class: 'stat' }, el('b', {}, `${asList(p?.players).length} / ${info.maxSlots ?? '?'}`), el('span', {}, 'Jugadores conectados')),
        el('div', { class: 'stat' }, el('b', {}, fmtDur(info.uptime)), el('span', {}, 'Tiempo encendido')),
        el('div', { class: 'stat' }, el('b', {}, fmtNum(info.uniquePlayers)), el('span', {}, 'Jugadores únicos (sesión)')),
      )
    }
    if (can('statistics')) {
      const st = await call('statistics').catch(() => null)
      if (st && typeof st === 'object') {
        root.append(el('h3', { class: 'sub' }, 'Estadísticas'))
        const box = el('div', { class: 'stats' })
        for (const [k, v] of Object.entries(st)) {
          const val = v && typeof v === 'object' ? v.current ?? v.value ?? v.total : v
          if (val == null || typeof val === 'object') continue
          box.append(el('div', { class: 'stat' }, el('b', {}, typeof val === 'number' ? fmtNum(val) : String(val)), el('span', {}, STAT_LABELS[k] || k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' '))))
        }
        root.append(box)
      }
    }
    if (can('statistic_blocks')) {
      const blocks = asList(await call('statistic_blocks').catch(() => []))
      if (blocks.length) root.append(el('h3', { class: 'sub' }, 'Bloques personalizados'), el('div', { class: 'stats' }, blocks.map((b) => el('div', { class: 'stat' }, el('b', {}, String(b.value ?? '')), el('span', {}, `${b.title ?? ''} ${b.description ? '· ' + b.description : ''}`)))))
    }
  }

  // ------------------------------------------------------------------ jugadores conectados
  async function loadPlayers() {
    const p = await call('panel')
    S.players = asList(p?.players).sort((a, b) => a.source - b.source)
    for (const id of [...S.selected]) if (!S.players.some((x) => x.source === id)) S.selected.delete(id)
  }

  async function renderPlayers(root) {
    const search = el('input', { class: 'search', type: 'search', placeholder: 'Buscar por nombre, ID, personaje o trabajo…', autocomplete: 'off' })
    const list = el('ul', { class: 'list' })
    const bulk = el('div', { class: 'bulk', hidden: true })
    const detail = el('section', { class: 'card' })
    const count = el('span', { class: 'muted' })
    root.append(el('div', { class: 'grid2' },
      el('section', { class: 'card' }, el('h2', { class: 'title' }, 'Jugadores conectados', count, el('span', { class: 'spacer' }), btn('Actualizar', () => refresh())), search, list, bulk),
      detail))

    const draw = () => {
      const q = search.value.trim().toLowerCase()
      const rows = S.players.filter((p) => !q || String(p.source) === q || [p.name, p.char?.name, p.char?.job?.label, p.uniqueId].some((v) => v && String(v).toLowerCase().includes(q)))
      count.textContent = `(${S.players.length})`
      list.replaceChildren(...(rows.length ? rows.map((p) => el('li', { class: 'item' + (S.detail === p.source ? ' active' : ''), onclick: () => { S.detail = p.source; draw(); renderPlayerDetail(detail) } },
        el('input', { type: 'checkbox', checked: S.selected.has(p.source), onclick: (e) => { e.stopPropagation(); e.target.checked ? S.selected.add(p.source) : S.selected.delete(p.source); drawBulk() } }),
        el('span', { class: 'pid' }, '#' + p.source),
        el('span', {}, el('div', { class: 'name' }, p.name || '—', p.group && el('span', { class: 'tag' }, p.groupLabel || 'STAFF'), p.usingVpn && el('span', { class: 'tag red' }, 'VPN')),
          el('div', { class: 'sub' }, [p.char?.name, p.char?.job && `${p.char.job.label}${p.char.job.gradeName ? ' · ' + p.char.job.gradeName : ''}`].filter(Boolean).join(' — ') || 'Sin personaje cargado')),
        el('span', {}))) : [el('li', { class: 'empty' }, S.players.length ? 'Ningún jugador coincide.' : 'No hay jugadores conectados.')]))
      drawBulk()
    }
    const drawBulk = () => {
      const n = S.selected.size
      bulk.hidden = n === 0
      if (!n) return
      const targets = [...S.selected]
      const b = (label, op, data, msg, cls) => can(op) && btn(label, async () => { await run(op, { targets, ...(await data?.()) }, msg); refresh() }, cls)
      const reason = async () => { const v = await form('Motivo', [{ name: 'reason', label: 'Motivo', required: true }], 'Aceptar'); if (!v) throw new Error('cancel'); return v }
      bulk.replaceChildren(el('div', { class: 'row' }, el('b', {}, `${n} seleccionados`), btn('Quitar selección', () => { S.selected.clear(); draw() }, 'ghost'),
        b('Revivir', 'multi_revive', null, 'Revividos', 'ok'),
        b('Mensaje', 'multi_message', async () => { const v = await form('Mensaje a los seleccionados', [{ name: 'message', label: 'Mensaje', type: 'textarea', required: true }], 'Enviar'); if (!v) throw new Error('cancel'); return v }, 'Mensaje enviado'),
        b('Congelar', 'multi_freeze', () => ({ state: true }), 'Congelados'), b('Descongelar', 'multi_freeze', () => ({ state: false }), 'Descongelados'),
        b('Abofetear', 'multi_slap', null, 'Hecho'), b('Matar', 'multi_kill', null, 'Hecho', 'danger'),
        b('Última posición', 'multi_teleport_last_location', null, 'Teletransportados'),
        b('Advertir', 'multi_warn', reason, 'Advertidos'), b('Expulsar', 'multi_kick', reason, 'Expulsados', 'danger'),
        b('Banear', 'multi_ban', async () => { const v = await form('Banear seleccionados', [{ name: 'reason', label: 'Motivo', required: true }, durationField()], 'Banear', { danger: true }); if (!v) throw new Error('cancel'); return { reason: v.reason, duration: banExpiry(v.duration) } }, 'Baneados', 'danger'),
      ))
    }
    async function refresh() {
      try { await loadPlayers(); draw(); if (S.detail && !S.players.some((p) => p.source === S.detail)) { S.detail = null } renderPlayerDetail(detail, true) } catch (e) { toast(e.message, 'err') }
    }
    search.addEventListener('input', draw)
    detail.append(el('div', { class: 'empty' }, 'Selecciona un jugador para ver sus opciones.'))
    await refresh()
    every(20000, refresh)
  }
  const durationField = (name = 'duration', label = 'Duración', opts = DURATIONS) => ({ name, label, type: 'select', options: opts.map(([l, v]) => ({ label: l, value: v })) })

  function renderPlayerDetail(box, soft = false) {
    const p = S.players.find((x) => x.source === S.detail)
    if (!p) { box.replaceChildren(el('div', { class: 'empty' }, 'Selecciona un jugador para ver sus opciones.')); return }
    if (soft && box.dataset.id === String(p.source)) return
    box.dataset.id = String(p.source)
    const t = p.source
    const label = `${p.name} (#${t})`
    const B = (text, op, handler, cls) => can(op) && btn(text, handler, cls)
    const ask = async (title, fields, label2, op, extra = {}, msg = 'Hecho', danger) => { const v = await form(title, fields, label2, { danger }); if (v) await run(op, { target: t, ...v, ...extra }, msg) }
    const simple = (op, msg, data = {}) => () => run(op, { target: t, ...data }, msg).catch(() => {})

    const groups = [
      ['Observar', [B('Ver pantalla en directo', 'stream_start', () => openStream(p), 'primary')]],
      ['Moderación', [
        B('Advertir', 'warn', () => ask(`Advertir · ${label}`, [{ name: 'reason', label: 'Motivo', required: true }], 'Advertir', 'warn', {}, 'Advertencia registrada')),
        B('Encarcelar', 'jail', () => jailForm(label, (v) => run('jail', { target: t, ...v }, 'Jugador encarcelado'))),
        B('Expulsar', 'kick', () => ask(`Expulsar · ${label}`, [{ name: 'reason', label: 'Motivo', required: true }], 'Expulsar', 'kick', {}, 'Jugador expulsado', true), 'danger'),
        B('Banear', 'ban', async () => { const v = await form(`Banear · ${label}`, [{ name: 'reason', label: 'Motivo', required: true }, durationField()], 'Banear', { danger: true }); if (v) await run('ban', { target: t, reason: v.reason, duration: banExpiry(v.duration) }, 'Jugador baneado') }, 'danger'),
        B('Advertencias', 'get_warnings', () => openWarnings(p.uniqueId, label)),
        (can('offline.get_notes')) && btn('Notas', () => openNotes(p.uniqueId, label)),
        B('Etiqueta', 'set_flag', () => flagForm(p.uniqueId, t)),
      ]],
      ['Salud', [
        B('Revivir', 'revive', simple('revive', 'Revivido'), 'ok'), B('Curar', 'heal', simple('heal', 'Curado'), 'ok'),
        B('Dar chaleco', 'give_armor', simple('give_armor', 'Chaleco dado')), B('Comida y agua', 'give_food_and_water', simple('give_food_and_water', 'Hecho')),
        B('Ver vida y chaleco', 'get_health_and_armor', async () => { const r = await call('get_health_and_armor', { target: t }); toast(`Vida: ${r?.health ?? '?'} · Chaleco: ${r?.armor ?? '?'}`) }),
        B('Matar', 'kill', simple('kill', 'Hecho'), 'danger'),
      ]],
      ['Control', [
        B('Congelar', 'freeze', simple('freeze', 'Congelado', { state: true })), B('Descongelar', 'freeze', simple('freeze', 'Descongelado', { state: false })),
        B('Esposar', 'handcuff', simple('handcuff', 'Esposado', { state: true })), B('Quitar esposas', 'handcuff', simple('handcuff', 'Sin esposas', { state: false })),
        B('Abofetear', 'slap', simple('slap', 'Hecho')), B('Tirar al suelo', 'ragdoll', simple('ragdoll', 'Hecho')),
        B('Quemar', 'burn', simple('burn', 'Hecho'), 'danger'), B('Explosión', 'explosion', simple('explosion', 'Hecho'), 'danger'),
      ]],
      ['Teletransporte y mundo', [
        B('Teletransportar a coordenadas', 'teleport_to_coords', () => teleportForm(`Teletransportar · ${label}`, (coords, keep) => run('teleport_to_coords', { target: t, coords, keepVehicle: keep }, 'Teletransportado'))),
        B('Devolver a su última posición', 'teleport_last_location', simple('teleport_last_location', 'Teletransportado', { keepVehicle: false })),
        B('Cambiar dimensión', 'routing_bucket', async () => { const cur = await call('get_player_bucket', { target: t }).catch(() => '?'); await ask(`Dimensión · ${label}`, [{ name: 'bucket', label: `Dimensión (actual: ${cur})`, type: 'number', min: 0, value: 0, required: true }], 'Cambiar', 'routing_bucket', {}, 'Dimensión cambiada') }),
        B('Enviar mensaje', 'send_message', () => ask(`Mensaje · ${label}`, [{ name: 'message', label: 'Mensaje', type: 'textarea', required: true }], 'Enviar', 'send_message', {}, 'Mensaje enviado')),
      ]],
      ['Personaje', [
        B('Cambiar trabajo', 'update_job', () => jobForm(label, 'job', (v) => run('update_job', { target: t, ...v }, 'Trabajo actualizado'))),
        B('Cambiar banda', 'update_gang', () => jobForm(label, 'gang', (v) => run('update_gang', { target: t, ...v }, 'Banda actualizada'))),
        B('Dinero', 'get_player_accounts', () => openAccounts(p)),
        B('Quitar dinero en mano', 'removeMoney', () => ask(`Quitar dinero · ${label}`, [{ name: 'amount', label: 'Cantidad', type: 'number', min: 1, required: true }], 'Quitar', 'removeMoney', {}, 'Dinero quitado', true)),
        B('Cambiar modelo (ped)', 'change_ped_model', () => ask(`Modelo · ${label}`, [{ name: 'model', label: 'Modelo', required: true, placeholder: 'a_m_y_skater_01' }], 'Cambiar', 'change_ped_model', {}, 'Modelo cambiado')),
        B('Restaurar modelo', 'reset_ped_model', simple('reset_ped_model', 'Modelo restaurado')),
        B('Borrar personaje', 'delete_character', async () => { if (await confirmBox(`¿Borrar el personaje de ${label}? No se puede deshacer.`, 'Borrar')) await run('delete_character', { target: t }, 'Personaje borrado') }, 'danger'),
      ]],
      ['Inventario', [
        B('Abrir inventario', 'inventory', () => openInventory(p)),
        B('Dar objeto', 'give_item', () => giveItemForm(p)),
      ]],
      ['Vehículos', [
        B('Vehículos del jugador', 'get_player_vehicles', () => openVehicles(p)),
        B('Aparecer vehículo', 'spawn_vehicle', () => vehicleForm(`Aparecer vehículo · ${label}`, (model) => run('spawn_vehicle', { target: t, model }, 'Vehículo aparecido'))),
        B('Regalar vehículo', 'give_vehicle', () => vehicleForm(`Regalar vehículo · ${label}`, (model) => run('give_vehicle', { target: t, model: model.toLowerCase() }, 'Vehículo regalado'))),
        B('Dar llaves', 'give_vehicle_key', () => ask(`Llaves · ${label}`, [{ name: 'plate', label: 'Matrícula', required: true }], 'Dar', 'give_vehicle_key', {}, 'Llaves dadas')),
        B('Reparar', 'fix_vehicle', simple('fix_vehicle', 'Reparado')), B('Voltear', 'flip_vehicle', simple('flip_vehicle', 'Hecho')),
        B('Borrar vehículos cercanos', 'delete_vehicle', () => ask(`Borrar vehículos · ${label}`, [{ name: 'radius', label: 'Radio (m)', type: 'number', min: 0, max: 200, value: 5, required: true }], 'Borrar', 'delete_vehicle', {}, 'Vehículos borrados', true), 'danger'),
      ]],
    ].map(([title, btns]) => [title, btns.filter(Boolean)]).filter(([, b]) => b.length)

    const c = p.char || {}
    box.replaceChildren(
      el('h2', { class: 'title' }, p.name, el('span', { class: 'pid' }, '#' + t), p.usingVpn && el('span', { class: 'tag red' }, 'VPN')),
      el('dl', { class: 'kv' },
        el('dt', {}, 'Personaje'), el('dd', {}, c.name || '—'),
        el('dt', {}, 'Trabajo'), el('dd', {}, c.job ? `${c.job.label} · ${c.job.gradeName ?? c.job.grade}` : '—'),
        c.gang && [el('dt', {}, 'Banda'), el('dd', {}, `${c.gang.label} · ${c.gang.gradeName ?? c.gang.grade}`)],
        c.phoneNumber && [el('dt', {}, 'Teléfono'), el('dd', {}, c.phoneNumber)],
        p.group && [el('dt', {}, 'Staff'), el('dd', {}, p.groupLabel || p.group)],
        p.uniqueId && [el('dt', {}, 'ID único'), el('dd', {}, p.uniqueId)],
        typeof p.ip === 'string' && p.ip !== 'Hidden' && [el('dt', {}, 'IP'), el('dd', {}, p.ip)],
        Array.isArray(p.identifiers) && p.identifiers.length > 0 && [el('dt', {}, 'Identificadores'), el('dd', {}, p.identifiers.map((i) => el('div', {}, i)))],
      ),
      ...(groups.length ? groups.flatMap(([title, b]) => [el('h3', { class: 'sub' }, title), el('div', { class: 'row' }, b)]) : [el('p', { class: 'muted' }, 'Tu rango no tiene acciones sobre jugadores.')]),
    )
  }

  async function jailForm(label, submit, extraFields = []) {
    const cells = S.me.meta?.jailCells || []
    const v = await form(`Encarcelar · ${label}`, [
      ...extraFields,
      { name: 'reason', label: 'Motivo', required: true },
      durationField('duration', 'Duración', JAIL_DURATIONS),
      { name: 'cell', label: 'Celda', type: 'select', options: cells.map((c) => ({ label: c, value: c })) },
    ], 'Encarcelar', { danger: true })
    if (v) await submit({ ...v, duration: Number(v.duration), bucket: 0 })
  }

  async function flagForm(uniqueId, source) {
    const cur = await call('get_flag', { uniqueId }).catch(() => null)
    const v = await form('Etiqueta del jugador', [{ name: 'flag', label: 'Etiqueta', type: 'select', value: cur || '', options: [{ label: 'Ninguna', value: '' }, { label: 'Sospechoso', value: 'suspicious' }, { label: 'De confianza', value: 'trusted' }, { label: 'Streamer', value: 'streamer' }] }], 'Guardar')
    if (v) await run('set_flag', { uniqueId, flag: v.flag || null, source }, 'Etiqueta guardada')
  }

  async function teleportForm(title, submit) {
    const presets = can('teleports') ? asList(await call('teleports').catch(() => [])) : []
    const v = await form(title, [
      presets.length && { name: 'preset', label: 'Ubicación guardada', type: 'select', options: [{ label: '— Coordenadas manuales —', value: '' }, ...presets.map((p, i) => ({ label: p.name || p.label || `#${i + 1}`, value: i }))] },
      { name: 'coords', label: 'Coordenadas x, y, z', placeholder: '215.7, -810.1, 30.7' },
      { name: 'keep', label: 'Mantener vehículo', type: 'checkbox' },
    ].filter(Boolean), 'Teletransportar')
    if (!v) return
    let coords
    if (v.preset !== undefined && v.preset !== '') { const p = presets[Number(v.preset)]; const c = p.coords || p; coords = { x: Number(c.x), y: Number(c.y), z: Number(c.z) } }
    else { const [x, y, z] = String(v.coords).split(/[\s,]+/).map(Number); coords = { x, y, z } }
    if (![coords.x, coords.y, coords.z].every(Number.isFinite)) return toast('Coordenadas no válidas', 'err')
    await submit(coords, !!v.keep)
  }

  let jobsCache = null
  async function jobForm(label, kind, submit) {
    if (!jobsCache) jobsCache = { job: await call('get_jobs').catch(() => ({})), gang: can('get_gangs') ? await call('get_gangs').catch(() => ({})) : {} }
    const list = jobsCache[kind] || {}
    const names = Array.isArray(list) ? list.map((j) => j.name) : Object.keys(list)
    const v = await form(`${kind === 'job' ? 'Trabajo' : 'Banda'} · ${label}`, [
      { name: kind, label: kind === 'job' ? 'Trabajo' : 'Banda', required: true, list: names, placeholder: 'police' },
      { name: 'grade', label: 'Rango (número)', type: 'number', min: 0, value: 0, required: true },
    ], 'Guardar')
    if (v) await submit(v)
  }

  let itemsCache = null
  async function giveItemForm(p, offline = false) {
    if (!itemsCache && can('item_list')) itemsCache = asList(await call('item_list').catch(() => [])).map((i) => (typeof i === 'string' ? i : i.name)).filter(Boolean)
    const v = await form(`Dar objeto · ${p.name || p.charName || ''}`, [
      { name: 'item', label: 'Objeto (nombre interno)', required: true, list: itemsCache || [], placeholder: 'water' },
      { name: 'amount', label: 'Cantidad', type: 'number', min: 1, max: 100000, value: 1, required: true },
    ], 'Dar')
    if (!v) return
    if (offline) { await run('offline.give_item_offline', { charId: p.charId, item: v.item, amount: v.amount }, 'Objeto dado'); return openInventory(p, true) }
    await run('give_item', { target: p.source, item: v.item, amount: v.amount }, `Dado ${v.item} x${v.amount}`)
    if (can('inventory')) openInventory(p)
  }

  async function openInventory(p, offline = false) {
    try {
      const items = offline ? asList(await call('offline.get_inventory', { charId: p.charId })) : asList(await call('inventory', { target: p.source }))
      const removeOp = offline ? 'offline.remove_item_offline' : 'remove_item'
      const content = table(items, [{ key: 'label', label: 'Objeto', fmt: (v, r) => el('span', {}, v || r.name, el('div', { class: 'faint' }, r.name)) }, { key: 'count', label: 'Cantidad', num: true, fmt: (v, r) => 'x' + (v ?? r.amount) }, { key: 'slot', label: 'Hueco', num: true }],
        can(removeOp) ? (it) => [btn('Quitar', async () => {
          const max = it.count ?? it.amount
          const v = await form(`Quitar ${it.label || it.name}`, [{ name: 'amount', label: `Cantidad (tiene ${max})`, type: 'number', min: 1, max, value: max, required: true }], 'Quitar', { danger: true })
          if (!v) return
          if (offline) await run(removeOp, { charId: p.charId, slot: it.slot, amount: v.amount }, 'Objeto quitado')
          else await run(removeOp, { target: p.source, name: it.name, amount: v.amount, slot: it.slot }, 'Objeto quitado')
          openInventory(p, offline)
        }, 'danger')] : null)
      sheet(`Inventario · ${p.name || p.charName || ''}`, content, [can(offline ? 'offline.give_item_offline' : 'give_item') && btn('Dar objeto', () => giveItemForm(p, offline), 'primary')])
    } catch (e) { toast(e.message, 'err') }
  }

  async function openAccounts(p, offline = false) {
    try {
      const raw = offline ? (p.accounts || {}) : await call('get_player_accounts', { target: p.source })
      const rows = Array.isArray(raw) ? raw : Object.entries(raw || {}).map(([name, v]) => (typeof v === 'object' ? { name, ...v } : { name, money: v }))
      const op = offline ? 'offline.update_money_account' : 'update_money_account'
      sheet(`Dinero · ${p.name || p.charName || ''}`, table(rows, [{ key: 'label', label: 'Cuenta', fmt: (v, r) => v || r.name }, { key: 'money', label: 'Saldo', num: true, fmt: (v, r) => fmtNum(v ?? r.amount ?? r.balance) + ' €' }],
        can(op) ? (a) => [btn('Cambiar', async () => {
          const v = await form(`Saldo de ${a.label || a.name}`, [{ name: 'amount', label: 'Nuevo saldo', type: 'number', min: 0, value: a.money ?? a.amount ?? 0, required: true }], 'Guardar')
          if (!v) return
          await run(op, offline ? { charId: p.charId, account: a.name, amount: v.amount } : { target: p.source, account: a.name, amount: v.amount }, 'Saldo actualizado')
          if (!offline) openAccounts(p); else closeDialog()
        })] : null), [], { wide: false })
    } catch (e) { toast(e.message, 'err') }
  }

  async function openVehicles(p, offline = false) {
    try {
      const rows = asList(offline ? await call('offline.get_vehicles', { charId: p.charId }) : await call('get_player_vehicles', { target: p.source }))
      const pre = offline ? 'offline.' : ''
      sheet(`Vehículos · ${p.name || p.charName || ''}`, table(rows, [{ key: 'plate', label: 'Matrícula' }, { key: 'model', label: 'Modelo', fmt: (v, r) => v || r.vehicle?.model || r.name || '—' }, { key: 'stored', label: 'Guardado', fmt: (v) => (v == null ? '—' : v ? 'Sí' : 'No') }],
        (v) => [
          can(pre + 'send_to_garage') && btn('Al garaje', () => run(pre + 'send_to_garage', { plate: v.plate }, 'Enviado al garaje')),
          can(pre + 'update_vehicle_plate') && btn('Matrícula', async () => { const f = await form('Nueva matrícula', [{ name: 'newPlate', label: 'Matrícula', required: true, maxLength: 8 }], 'Cambiar'); if (f) { await run(pre + 'update_vehicle_plate', { plate: v.plate, newPlate: f.newPlate.toUpperCase() }, 'Matrícula cambiada'); openVehicles(p, offline) } }),
          can('give_vehicle_key') && !offline && btn('Llaves', () => run('give_vehicle_key', { target: p.source, plate: v.plate }, 'Llaves dadas')),
          can(pre + 'remove_vehicle') && btn('Eliminar', async () => { if (await confirmBox(`¿Eliminar el vehículo ${v.plate}?`, 'Eliminar')) { await run(pre + 'remove_vehicle', { plate: v.plate }, 'Vehículo eliminado'); openVehicles(p, offline) } }, 'danger'),
        ]))
    } catch (e) { toast(e.message, 'err') }
  }

  let modelsCache = null
  async function vehicleForm(title, submit) {
    if (!modelsCache && can('vehicle_models')) modelsCache = asList(await call('vehicle_models').catch(() => [])).map((m) => (typeof m === 'string' ? m : m.model || m.name)).filter(Boolean)
    const v = await form(title, [{ name: 'model', label: 'Modelo', required: true, list: modelsCache || [], placeholder: 'adder' }], 'Aceptar')
    if (v) await submit(v.model)
  }

  async function openNotes(uniqueId, label) {
    try {
      const notes = asList(await call('offline.get_notes', { uniqueId }))
      sheet(`Notas · ${label}`, table(notes, [{ key: 'text', label: 'Nota' }, { key: 'staff_name', label: 'Staff' }, { key: 'created_at', label: 'Fecha', fmt: fmtDate }],
        can('offline.delete_note') ? (n) => [btn('Borrar', async () => { await run('offline.delete_note', { id: n.id }, 'Nota borrada'); openNotes(uniqueId, label) }, 'danger')] : null),
        [can('offline.add_note') && btn('Añadir nota', async () => { const v = await form('Nueva nota', [{ name: 'text', label: 'Nota', type: 'textarea', required: true }], 'Guardar'); if (v) { await run('offline.add_note', { uniqueId, text: v.text }, 'Nota guardada'); openNotes(uniqueId, label) } }, 'primary')])
    } catch (e) { toast(e.message, 'err') }
  }

  async function openWarnings(uniqueId, label) {
    try {
      const rows = asList(await call('get_warnings', { uniqueId }))
      sheet(`Advertencias · ${label}`, table(rows, [{ key: 'id', label: 'ID', num: true }, { key: 'reason', label: 'Motivo' }, { key: 'staff_name', label: 'Staff', fmt: (v, r) => v || r.author_name || r.staff_id || '—' }, { key: 'created_at', label: 'Fecha', fmt: fmtDate }],
        can('warn_remove') ? (w) => [btn('Quitar', async () => { await run('warn_remove', { id: w.id }, 'Advertencia quitada'); openWarnings(uniqueId, label) }, 'danger')] : null))
    } catch (e) { toast(e.message, 'err') }
  }

  // ------------------------------------------------------------------ observar pantalla (WebRTC)
  async function openStream(p) {
    const video = el('video', { class: 'stream', autoplay: true, playsInline: true, muted: true, controls: true })
    const status = el('p', { class: 'muted' }, 'Conectando con la pantalla del jugador…')
    let session = null, pc = null, stopped = false
    const pendingIce = []
    const stop = () => {
      if (stopped) return
      stopped = true
      try { pc?.close() } catch {}
      if (session) call('stream_stop', { sessionId: session.sessionId, viewerToken: session.viewerToken }).catch(() => {})
    }
    sheet(`Observando · ${p.name} (#${p.source})`, el('div', {}, video, status), [], { onclose: stop })
    try {
      session = await call('stream_start', { target: p.source })
      // mismos servidores ICE que usa el jugador en luxu (STUN + TURN público) más los del servidor
      const iceServers = [...asList(session.iceServers).filter((s) => s && s.urls), ...LUXU_ICE]
      pc = new RTCPeerConnection({ iceServers })
      pc.addTransceiver('video', { direction: 'recvonly' })
      pc.ontrack = (e) => { video.srcObject = e.streams[0] || new MediaStream([e.track]); status.textContent = 'En directo'; video.play().catch(() => {}) }
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connecting') status.textContent = 'Conectando el vídeo…'
        if (['failed', 'disconnected'].includes(pc.connectionState)) status.textContent = 'Conexión perdida (puede que la red del jugador no permita la retransmisión).'
      }
      const signal = (type, payload) => call('stream_signal', { sessionId: session.sessionId, viewerToken: session.viewerToken, type, payload })
      // los candidatos ICE se agrupan para no enviar decenas de peticiones
      let iceBatch = []
      pc.onicecandidate = (e) => { if (e.candidate) iceBatch.push(e.candidate.toJSON()) }
      const flushIce = () => { const b = iceBatch.splice(0); for (const c of b) signal('ice-candidate', c).catch(() => {}) }
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      // El juego del jugador prepara su lado de la conexión de forma asíncrona y no avisa cuando está listo:
      // si la oferta llega antes, se pierde. Esperamos un poco y la reenviamos hasta recibir respuesta.
      status.textContent = 'Esperando a que el juego del jugador prepare la retransmisión…'
      const sendOffer = () => signal('offer', { type: pc.localDescription.type, sdp: pc.localDescription.sdp })
      await new Promise((r) => setTimeout(r, 2500))
      if (stopped) return
      await sendOffer()
      let offerAttempts = 1, lastOffer = Date.now()
      let delay = 500
      while (!stopped) {
        if (!pc.remoteDescription && Date.now() - lastOffer > 5000 && offerAttempts < 4) { offerAttempts++; lastOffer = Date.now(); await sendOffer().catch(() => {}) }
        if (pc.remoteDescription && iceBatch.length) flushIce()
        if (!pc.remoteDescription && offerAttempts >= 4 && Date.now() - lastOffer > 8000) { status.textContent = 'El jugador no respondió. Puede que su juego no permita retransmitir (menú abierto, pantalla minimizada…).'; break }
        await new Promise((r) => setTimeout(r, delay))
        if (stopped) break
        const msgs = asList(await call('stream_poll', { sessionId: session.sessionId, viewerToken: session.viewerToken }).catch((e) => { status.textContent = e.message; stopped = true; return [] }))
        for (const m of msgs) {
          if (m.type === 'answer') { await pc.setRemoteDescription(m.payload); for (const c of pendingIce.splice(0)) await pc.addIceCandidate(c).catch(() => {}) }
          else if (m.type === 'ice-candidate') { if (pc.remoteDescription) await pc.addIceCandidate(m.payload).catch(() => {}); else pendingIce.push(m.payload) }
          else if (m.type === 'offer') { await pc.setRemoteDescription(m.payload); const ans = await pc.createAnswer(); await pc.setLocalDescription(ans); await signal('answer', { type: ans.type, sdp: ans.sdp }) }
          else if (m.type === 'session-closed') { status.textContent = 'El jugador cerró la retransmisión.'; stopped = true }
        }
        delay = pc.connectionState === 'connected' ? 3000 : 700
      }
    } catch (e) { status.textContent = e.message; stop() }
  }

  // ------------------------------------------------------------------ jugadores offline
  async function renderOffline(root) {
    const input = el('input', { class: 'search', type: 'search', placeholder: 'Nombre del personaje, ID de personaje o identificador…' })
    const results = el('div')
    const detail = el('section', { class: 'card' }, el('div', { class: 'empty' }, 'Busca un jugador.'))
    const doSearch = async () => {
      const term = input.value.trim()
      if (term.length < 2) return toast('Escribe al menos 2 caracteres', 'err')
      results.replaceChildren(el('div', { class: 'empty' }, 'Buscando…'))
      const rows = asList(await call('offline.search_players', { term }).catch((e) => { toast(e.message, 'err'); return [] }))
      results.replaceChildren(table(rows, [{ key: 'charId', label: 'Personaje', fmt: (v, r) => `${r.name || r.charName || '—'} (${v})` }, { key: 'lastSeen', label: 'Última vez', fmt: (v, r) => fmtDate(v ?? r.last_seen) }], (r) => [btn('Abrir', () => offlineDetail(detail, r))]))
    }
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch() })
    root.append(el('div', { class: 'grid2' }, el('section', { class: 'card' }, el('h2', { class: 'title' }, 'Jugadores offline'), el('div', { class: 'row' }, input, btn('Buscar', doSearch, 'primary')), el('div', { class: 'card', style: 'margin-top:12px;padding:0;border:0' }, results)), detail))
  }

  async function offlineDetail(box, row) {
    box.replaceChildren(el('div', { class: 'empty' }, 'Cargando…'))
    const p = { ...row, ...(await call('offline.get_player', { charId: row.charId }).catch(() => ({}))) }
    p.charId = p.charId ?? row.charId
    p.name = p.name || p.charName || row.name
    const label = `${p.name} (${p.charId})`
    const B = (text, op, h, cls) => can(op) && btn(text, h, cls)
    const ban = can('offline.check_ban_status') ? await call('offline.check_ban_status', { uniqueId: p.uniqueId }).catch(() => null) : null
    const jail = can('offline.is_jailed') ? await call('offline.is_jailed', { charId: p.charId }).catch(() => null) : null
    box.replaceChildren(
      el('h2', { class: 'title' }, p.name, el('span', { class: 'faint' }, `Personaje ${p.charId}`), ban && el('span', { class: 'tag red' }, 'BANEADO'), jail && el('span', { class: 'tag red' }, 'EN CÁRCEL')),
      el('dl', { class: 'kv' },
        p.uniqueId && [el('dt', {}, 'ID único'), el('dd', {}, p.uniqueId)],
        p.job && [el('dt', {}, 'Trabajo'), el('dd', {}, typeof p.job === 'object' ? `${p.job.label ?? p.job.name} · ${p.job.grade ?? ''}` : String(p.job))],
        ban && [el('dt', {}, 'Baneo'), el('dd', {}, `${ban.reason ?? ''} · hasta ${fmtDate(ban.expires_at)}`)],
        Array.isArray(p.identifiers) && p.identifiers.length > 0 && [el('dt', {}, 'Identificadores'), el('dd', {}, p.identifiers.map((i) => el('div', {}, i)))],
      ),
      el('h3', { class: 'sub' }, 'Acciones'),
      el('div', { class: 'row' }, [
        B('Banear', 'offline.add_ban', async () => { const v = await form(`Banear · ${label}`, [{ name: 'reason', label: 'Motivo', required: true }, durationField()], 'Banear', { danger: true }); if (v) await run('offline.add_ban', { playerName: p.name, identifiers: p.identifiers || [], reason: v.reason, duration: banExpiry(v.duration) }, 'Baneado') }, 'danger'),
        B('Encarcelar', 'offline.jail', () => jailForm(label, (v) => run('offline.jail', { charId: p.charId, name: p.name, ...v }, 'Encarcelado'))),
        jail && B('Sacar de la cárcel', 'offline.un_jail', () => run('offline.un_jail', { sentenceId: jail.id ?? jail.sentenceId ?? jail }, 'Liberado')),
        p.uniqueId && can('offline.get_notes') && btn('Notas', () => openNotes(p.uniqueId, label)),
        p.uniqueId && B('Advertencias', 'offline.get_warnings', () => openWarnings(p.uniqueId, label)),
        B('Inventario', 'offline.get_inventory', () => openInventory(p, true)),
        B('Dinero', 'offline.update_money_account', () => openAccounts(p, true)),
        B('Vehículos', 'offline.get_vehicles', () => openVehicles(p, true)),
        B('Cambiar trabajo', 'offline.update_job', () => jobForm(label, 'job', (v) => run('offline.update_job', { charId: p.charId, ...v }, 'Trabajo actualizado'))),
        B('Cambiar banda', 'offline.update_gang', () => jobForm(label, 'gang', (v) => run('offline.update_gang', { charId: p.charId, ...v }, 'Banda actualizada'))),
        B('Cambiar nombre', 'offline.update_character_name', async () => { const v = await form('Nuevo nombre', [{ name: 'newName', label: 'Nombre y apellido', required: true, value: p.name }], 'Guardar'); if (v) await run('offline.update_character_name', { charId: p.charId, newName: v.newName }, 'Nombre cambiado') }),
        B('Borrar personaje', 'offline.delete_character', async () => { if (await confirmBox(`¿Borrar el personaje ${label}?`, 'Borrar')) await run('offline.delete_character', { charId: p.charId }, 'Personaje borrado') }, 'danger'),
        B('Borrar jugador', 'offline.delete_player', async () => { if (await confirmBox(`¿Borrar TODOS los datos de ${label}? No se puede deshacer.`, 'Borrar')) await run('offline.delete_player', { charId: p.charId }, 'Jugador borrado') }, 'danger'),
      ].filter(Boolean)),
    )
  }

  // ------------------------------------------------------------------ moderación
  async function renderModeration(root) {
    const tabs = [['bans', 'Baneos'], ['warnings', 'Advertencias'], ['jail_list', 'Cárcel']].filter(([op]) => can(op))
    const bar = el('div', { class: 'tabs' })
    const search = el('input', { class: 'search', type: 'search', placeholder: 'Filtrar…' })
    const box = el('div', { style: 'margin-top:10px' })
    root.append(el('h2', { class: 'title' }, 'Moderación'), bar, search, box)
    let current = tabs[0][0], rows = []
    const draw = () => {
      const q = search.value.trim().toLowerCase()
      const f = rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q)).slice(0, 500)
      if (current === 'bans') box.replaceChildren(table(f, [{ key: 'id', label: 'ID', num: true }, { key: 'player_name', label: 'Jugador' }, { key: 'reason', label: 'Motivo' }, { key: 'created_at', label: 'Fecha', fmt: fmtDate }, { key: 'expires_at', label: 'Expira', fmt: (v) => (Number(v) >= PERMANENT - 864e5 ? 'Permanente' : fmtDate(v)) }],
        can('unban') ? (b) => [btn('Desbanear', async () => { if (await confirmBox(`¿Desbanear a ${b.player_name}?`, 'Desbanear')) { await run('unban', { id: b.id }, 'Desbaneado'); load() } })] : null))
      if (current === 'warnings') box.replaceChildren(table(f, [{ key: 'id', label: 'ID', num: true }, { key: 'player_name', label: 'Jugador', fmt: (v, r) => v || r.player_id }, { key: 'reason', label: 'Motivo' }, { key: 'staff_name', label: 'Staff', fmt: (v, r) => v || r.author_name || '—' }, { key: 'created_at', label: 'Fecha', fmt: fmtDate }],
        can('warn_remove') ? (w) => [btn('Quitar', async () => { await run('warn_remove', { id: w.id }, 'Advertencia quitada'); load() }, 'danger')] : null))
      if (current === 'jail_list') box.replaceChildren(table(f, [{ key: 'id', label: 'ID', num: true }, { key: 'char_name', label: 'Jugador' }, { key: 'reason', label: 'Motivo' }, { key: 'cell_name', label: 'Celda' }, { key: 'remaining_ms', label: 'Restante', fmt: (v, r) => (r.time_mode === 'playtime' ? fmtDur(v) : fmtDate(r.expires_at)) }, { key: 'staff_name', label: 'Staff' }],
        can('un_jail') ? (j) => [btn('Liberar', async () => { await run('un_jail', { sentenceId: j.id }, 'Liberado'); load() })] : null))
    }
    const load = async () => { box.replaceChildren(el('div', { class: 'empty' }, 'Cargando…')); rows = asList(await call(current).catch((e) => { toast(e.message, 'err'); return [] })); draw() }
    bar.replaceChildren(...tabs.map(([op, l]) => el('button', { type: 'button', class: op === current ? 'active' : '', onclick: (e) => { current = op; for (const b of bar.children) b.classList.remove('active'); e.target.classList.add('active'); load() } }, l)))
    search.addEventListener('input', draw)
    load()
  }

  // ------------------------------------------------------------------ reportes y chats
  async function renderChats(root) {
    const list = el('div', { class: 'list' })
    const pane = el('section', { class: 'card' }, el('div', { class: 'empty' }, 'Selecciona un chat o reporte.'))
    root.append(el('h2', { class: 'title' }, 'Reportes y chats', el('span', { class: 'spacer' }),
      can('chat_create') && btn('Nuevo chat de staff', async () => { const v = await form('Nuevo chat', [{ name: 'name', label: 'Nombre', required: true }], 'Crear'); if (v) { await run('chat_create', { name: v.name, staffRestrictions: [] }, 'Chat creado'); load() } }, 'primary')),
    el('div', { class: 'chat' }, el('div', {}, list), pane))
    let chats = [], openId = null
    const load = async () => {
      chats = asList(await call('chats').catch((e) => { toast(e.message, 'err'); return [] })).sort((a, b) => Number(b.is_report) - Number(a.is_report) || Number(b.id) - Number(a.id))
      list.replaceChildren(...(chats.length ? chats.map((c) => el('div', { class: 'item' + (c.id === openId ? ' active' : ''), style: 'grid-template-columns:1fr auto', onclick: () => { openId = c.id; load(); openChat(c) } },
        el('span', {}, el('div', { class: 'name' }, c.name || `#${c.id}`), el('div', { class: 'sub' }, c.is_report ? `Reporte${c.claimed_by ? ' · reclamado' : ''}${c.is_closed ? ' · cerrado' : ''}` : 'Chat de staff')),
        c.is_report ? el('span', { class: c.claimed_by ? 'tag' : 'tag red' }, c.claimed_by ? 'EN CURSO' : 'NUEVO') : el('span'))) : [el('div', { class: 'empty' }, 'No hay chats ni reportes abiertos.')]))
    }
    const openChat = async (c) => {
      const msgs = el('div', { class: 'msgs' })
      const input = el('textarea', { class: 'inline-input', maxLength: 1000, placeholder: 'Escribe un mensaje…', rows: 2 })
      const send = async () => { const m = input.value.trim(); if (!m) return; input.value = ''; await run('chat_send', { chatId: c.id, message: m, attachments: [] }); refresh() }
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } })
      const refresh = async () => {
        if (openId !== c.id) return
        const rows = asList(await call('chat_messages', { value: c.id }).catch(() => []))
        const atBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 40
        msgs.replaceChildren(...rows.map((m) => el('div', { class: 'msg' }, el('b', {}, m.author_name || m.sender_name || m.author || 'Jugador'), ' ', el('span', { class: 'faint' }, fmtDate(m.created_at)), el('p', {}, m.message || ''), asList(m.attachments).length > 0 && el('div', { class: 'faint' }, `${asList(m.attachments).length} adjunto(s)`))))
        if (atBottom) msgs.scrollTop = msgs.scrollHeight
      }
      pane.replaceChildren(
        el('h2', { class: 'title' }, c.name || `#${c.id}`, el('span', { class: 'spacer' }),
          c.is_report && !c.claimed_by && can('report_claim') && btn('Reclamar', async () => { await run('report_claim', { value: c.id }, 'Reporte reclamado'); load() }),
          c.is_report && c.claimed_by && can('report_unclaim') && btn('Soltar', async () => { await run('report_unclaim', { value: c.id }, 'Reporte liberado'); load() }),
          c.is_report && can('report_close') && btn('Cerrar reporte', async () => { await run('report_close', { value: c.id }, 'Reporte cerrado'); openId = null; load() }, 'danger'),
          !c.is_report && can('chat_rename') && btn('Renombrar', async () => { const v = await form('Renombrar chat', [{ name: 'name', label: 'Nombre', required: true, value: c.name }], 'Guardar'); if (v) { await run('chat_rename', { chatId: c.id, name: v.name }, 'Renombrado'); load() } }),
          can('chat_delete') && btn('Borrar', async () => { if (await confirmBox('¿Borrar este chat?', 'Borrar')) { await run('chat_delete', { value: c.id }, 'Chat borrado'); openId = null; load() } }, 'danger')),
        msgs, el('div', { class: 'row', style: 'margin-top:8px;flex-wrap:nowrap' }, input, btn('Enviar', send, 'primary')))
      await refresh()
    }
    await load()
    every(8000, async () => { await load(); const c = chats.find((x) => x.id === openId); if (c) openChat(c) })
  }

  // ------------------------------------------------------------------ staff
  async function renderStaff(root) {
    root.append(el('h2', { class: 'title' }, 'Staff'))
    const data = await call('staff_list')
    const groups = asList(data?.groups).sort((a, b) => a.hierarchy - b.hierarchy)
    const staff = asList(data?.staff)
    const manage = can('staff_update_group')
    // solo se gestionan grupos de rango inferior al propio (el servidor también lo comprueba)
    const below = (g) => S.me.staff.group === 'owner' || (g.name !== 'owner' && Number(g.hierarchy) > Number(S.me.staff.hierarchy))
    const groupOf = (name) => groups.find((g) => g.name === name)
    const allPerms = Object.keys(S.me.permissionLabels || {})

    root.append(el('h3', { class: 'sub' }, 'Grupos'), table(groups, [
      { key: 'label', label: 'Grupo', fmt: (v, g) => `${v || g.name} (${g.name})` },
      { key: 'hierarchy', label: 'Jerarquía', num: true },
      { key: 'discord_role_id', label: 'Rol de Discord' },
      { key: 'permissions', label: 'Permisos', num: true, fmt: (v, g) => (g.name === 'owner' ? 'Todos' : asList(v).length) },
    ], manage ? (g) => [below(g) && btn('Editar', () => editGroup(g)), can('staff_delete_group') && below(g) && btn('Borrar', async () => { if (await confirmBox(`¿Borrar el grupo ${g.label}?`, 'Borrar')) { await run('staff_delete_group', { name: g.name }, 'Grupo borrado'); go('staff') } }, 'danger')] : null))

    root.append(el('h3', { class: 'sub' }, 'Miembros'), el('div', { class: 'row', style: 'margin-bottom:8px' }, can('staff_create_member') && btn('Añadir miembro', () => editMember(null), 'primary')), table(staff, [
      { key: 'nickname', label: 'Nombre' }, { key: 'group', label: 'Grupo' }, { key: 'discord', label: 'Discord' }, { key: 'license2', label: 'License2' },
      { key: 'total_duty_seconds', label: 'Horas de servicio', num: true, fmt: (v) => (Number(v) / 3600).toFixed(1) },
    ], (m) => [can('duty_staff') && btn('Servicio', () => dutyStats(m)), can('staff_update_member') && below(groupOf(m.group) || {}) && btn('Editar', () => editMember(m)), can('staff_remove_member') && below(groupOf(m.group) || {}) && btn('Quitar', async () => { if (await confirmBox(`¿Quitar a ${m.nickname} del staff?`, 'Quitar')) { await run('staff_remove_member', { id: m.id }, 'Miembro quitado'); go('staff') } }, 'danger')]))

    if (can('duty_overview')) {
      const ov = asList(await call('duty_overview').catch(() => []))
      root.append(el('h3', { class: 'sub' }, 'Servicio'), table(ov, [
        { key: 'nickname', label: 'Staff' }, { key: 'group', label: 'Grupo' },
        { key: 'is_on_duty', label: 'Estado', fmt: (v, r) => (v ? el('span', { class: 'tag green' }, 'DE SERVICIO') : r.is_online ? 'Conectado' : 'Desconectado') },
        { key: 'today_total_seconds', label: 'Hoy', num: true, fmt: (v) => fmtDur(v * 1000) }, { key: 'week_total_seconds', label: '7 días', num: true, fmt: (v) => fmtDur(v * 1000) }, { key: 'month_total_seconds', label: '30 días', num: true, fmt: (v) => fmtDur(v * 1000) },
      ]))
    }

    async function editGroup(g) {
      const body = el('div')
      const fields = [{ name: 'label', label: 'Nombre visible', value: g.label, required: true }, { name: 'discord_role_id', label: 'ID del rol de Discord', value: g.discord_role_id || '', hint: 'Los miembros con este rol entran al panel con este grupo' }, { name: 'hierarchy', label: 'Jerarquía (menor = más rango)', type: 'number', min: 1, value: g.hierarchy, required: true }]
      const inputs = fields.map((f) => { const r = field(f); body.append(r.node); return [f, r.input] })
      const own = new Set(asList(g.permissions))
      const checks = allPerms.map((p) => [p, el('input', { type: 'checkbox', checked: own.has(p) })])
      body.append(el('h3', { class: 'sub' }, 'Permisos'), el('div', { class: 'perm-grid' }, checks.map(([p, c]) => el('label', { class: 'check' }, c, S.me.permissionLabels?.[p] || p))))
      sheet(`Editar grupo · ${g.label}`, body, [btn('Guardar', async () => {
        const v = Object.fromEntries(inputs.map(([f, i]) => [f.name, f.type === 'number' ? Number(i.value) : i.value.trim()]))
        const updated = { ...g, label: v.label, discord_role_id: v.discord_role_id || null, hierarchy: v.hierarchy, permissions: checks.filter(([, c]) => c.checked).map(([p]) => p) }
        const ok = await run('staff_update_group', updated, 'Grupo guardado').catch(() => false)
        if (ok !== false) { closeDialog(); go('staff') }
      }, 'primary')])
    }

    async function editMember(m) {
      const v = await form(m ? `Editar · ${m.nickname}` : 'Añadir miembro', [
        { name: 'nickname', label: 'Nombre', value: m?.nickname || '', required: true },
        { name: 'group', label: 'Grupo', type: 'select', value: m?.group, options: groups.filter(below).map((g) => ({ label: g.label || g.name, value: g.name })) },
        { name: 'discord', label: 'ID de Discord', value: (m?.discord || '').replace('discord:', ''), placeholder: '123456789012345678' },
        { name: 'license2', label: 'license2 (opcional)', value: m?.license2 || '' },
      ], 'Guardar')
      if (!v) return
      const payload = { ...(m || { gender: 'male', steam: null, fivem: null, avatar: null }), nickname: v.nickname, group: v.group, discord: v.discord ? `discord:${v.discord.replace('discord:', '')}` : null, license2: v.license2 || null }
      await run(m ? 'staff_update_member' : 'staff_create_member', payload, 'Guardado')
      go('staff')
    }

    async function dutyStats(m) {
      const st = await call('duty_staff', { staffId: m.id }).catch((e) => { toast(e.message, 'err'); return null })
      if (!st) return
      sheet(`Servicio · ${m.nickname}`, el('div', {},
        el('div', { class: 'stats' }, el('div', { class: 'stat' }, el('b', {}, fmtDur(st.total_time * 1000)), el('span', {}, 'Total')), el('div', { class: 'stat' }, el('b', {}, st.sessions_count), el('span', {}, 'Sesiones')), el('div', { class: 'stat' }, el('b', {}, fmtDur(st.average_session_duration * 1000)), el('span', {}, 'Media'))),
        el('h3', { class: 'sub' }, 'Últimos 30 días'), table(asList(st.daily_stats), [{ key: 'date', label: 'Día', fmt: (v) => String(v).slice(0, 10) }, { key: 'total_seconds', label: 'Tiempo', num: true, fmt: (v) => fmtDur(v * 1000) }, { key: 'session_count', label: 'Sesiones', num: true }])), [], { wide: false })
    }
  }

  // ------------------------------------------------------------------ registros
  async function renderLogs(root) {
    const counts = await call('get_log_counts').catch(() => ({}))
    const types = [['staff', 'Staff'], ['players', 'Jugadores'], ['deaths', 'Muertes'], ['chat', 'Chat'], ['reports', 'Reportes'], ['bans', 'Baneos'], ['warnings', 'Advertencias']]
    const bar = el('div', { class: 'tabs' })
    const search = el('input', { class: 'search', type: 'search', placeholder: 'Buscar en los registros… (Enter)' })
    const box = el('div', { style: 'margin-top:10px' })
    const pager = el('div', { class: 'row', style: 'margin-top:8px' })
    root.append(el('h2', { class: 'title' }, 'Registros'), bar, search, box, pager)
    let type = 'staff', page = 1
    const load = async () => {
      box.replaceChildren(el('div', { class: 'empty' }, 'Cargando…'))
      const op = type === 'staff' ? 'get_staff_logs_paginated' : 'get_logs_paginated'
      const r = await call(op, { type, page, limit: 50, search: search.value.trim() }).catch((e) => { toast(e.message, 'err'); return null })
      const rows = asList(r?.logs ?? r?.data ?? r?.rows ?? r)
      const total = Number(r?.total ?? r?.count ?? rows.length)
      box.replaceChildren(table(rows, [{ key: 'created_at', label: 'Fecha', fmt: fmtDate }, type === 'staff' && { key: 'staff_name', label: 'Staff' }, { key: 'text', label: 'Registro', fmt: (v, x) => v ?? x.message ?? x.action ?? '' }].filter(Boolean)))
      const pages = Math.max(1, Math.ceil(total / 50))
      pager.replaceChildren(btn('‹ Anterior', () => { if (page > 1) { page--; load() } }), el('span', { class: 'muted' }, `Página ${page} de ${pages}`), btn('Siguiente ›', () => { if (page < pages) { page++; load() } }))
    }
    bar.replaceChildren(...types.map(([t, l]) => el('button', { type: 'button', class: t === type ? 'active' : '', onclick: (e) => { type = t; page = 1; for (const b of bar.children) b.classList.remove('active'); e.target.classList.add('active'); load() } }, `${l} (${fmtNum(counts?.[t] ?? 0)})`)))
    search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { page = 1; load() } })
    load()
  }

  // ------------------------------------------------------------------ vehículos (por matrícula)
  async function renderVehicles(root) {
    const plateAct = (label, op, fields, build, msg, danger) => can(op) && btn(label, async () => { const v = await form(label, fields, 'Aceptar', { danger }); if (v) await run(op, build(v), msg) }, danger ? 'danger' : '')
    const plate = { name: 'plate', label: 'Matrícula', required: true, maxLength: 8 }
    root.append(el('h2', { class: 'title' }, 'Vehículos'), el('section', { class: 'card' }, el('h3', { class: 'sub' }, 'Por matrícula'), el('div', { class: 'row' }, [
      plateAct('Abrir puertas', 'unlock_vehicle_doors_by_plate', [plate], (v) => ({ plate: v.plate.toUpperCase() }), 'Puertas abiertas'),
      plateAct('Cambiar matrícula', 'update_vehicle_plate', [plate, { name: 'newPlate', label: 'Nueva matrícula', required: true, maxLength: 8 }], (v) => ({ plate: v.plate.toUpperCase(), newPlate: v.newPlate.toUpperCase() }), 'Matrícula cambiada'),
      plateAct('Cambiar dueño', 'update_vehicle_owner', [plate, { name: 'newOwnerCharId', label: 'ID de personaje del nuevo dueño', required: true }], (v) => ({ plate: v.plate.toUpperCase(), newOwnerCharId: v.newOwnerCharId }), 'Dueño cambiado'),
      plateAct('Enviar al garaje', 'send_to_garage', [plate], (v) => ({ plate: v.plate.toUpperCase() }), 'Enviado al garaje'),
      plateAct('Eliminar vehículo', 'remove_vehicle', [plate], (v) => ({ plate: v.plate.toUpperCase() }), 'Vehículo eliminado', true),
    ].filter(Boolean))))
    if (can('get_vehicle_owners')) {
      const out = el('div', { style: 'margin-top:10px' })
      root.append(el('section', { class: 'card' }, el('h3', { class: 'sub' }, 'Dueños por modelo'), el('div', { class: 'row' }, btn('Buscar modelo', async () => {
        const v = await form('Dueños de un modelo', [{ name: 'model', label: 'Modelo', required: true, placeholder: 'adder' }], 'Buscar')
        if (v) out.replaceChildren(table(asList(await call('get_vehicle_owners', { model: v.model }).catch((e) => { toast(e.message, 'err'); return [] })), [{ key: 'plate', label: 'Matrícula' }, { key: 'owner', label: 'Dueño', fmt: (x, r) => x || r.charName || r.name || r.citizenid || '—' }]))
      })), out))
    }
    if (can('force_wipe_vehicles')) root.append(el('section', { class: 'card' }, el('h3', { class: 'sub' }, 'Limpieza'), btn('Borrar todos los vehículos sin ocupantes', async () => { if (await confirmBox('¿Borrar todos los vehículos vacíos del mapa?', 'Borrar')) await run('force_wipe_vehicles', {}, 'Vehículos borrados') }, 'danger')))
  }

  // ------------------------------------------------------------------ servidor
  async function renderServer(root) {
    root.append(el('h2', { class: 'title' }, 'Servidor'))
    const quick = el('div', { class: 'row' }, [
      can('announcment') && btn('Enviar anuncio', async () => { const v = await form('Anuncio para todos', [{ name: 'message', label: 'Mensaje', type: 'textarea', required: true }, { name: 'duration', label: 'Duración (segundos)', type: 'number', min: 1, max: 120, value: 8 }, { name: 'useSound', label: 'Con sonido', type: 'checkbox', value: true }], 'Enviar'); if (v) await run('announcment', { message: v.message, type: 'message', duration: v.duration * 1000, useSound: v.useSound }, 'Anuncio enviado') }, 'primary'),
      can('update_weather') && btn('Cambiar clima', async () => { const v = await form('Clima', [{ name: 'weather', label: 'Clima', type: 'select', options: WEATHERS.map((w) => ({ label: w, value: w })) }], 'Cambiar'); if (v) await run('update_weather', { weather: v.weather }, 'Clima cambiado') }),
      can('update_time') && btn('Cambiar hora', async () => { const v = await form('Hora del juego', [{ name: 'hour', label: 'Hora', type: 'number', min: 0, max: 23, value: 12, required: true }, { name: 'minute', label: 'Minuto', type: 'number', min: 0, max: 59, value: 0, required: true }], 'Cambiar'); if (v) await run('update_time', v, 'Hora cambiada') }),
      can('teleport_everyone') && btn('Teletransportar a todos', () => teleportForm('Teletransportar a todos los jugadores', (coords, keep) => run('teleport_everyone', { coords, keepVehicle: keep }, 'Hecho')), 'danger'),
    ].filter(Boolean))
    root.append(el('section', { class: 'card' }, el('h3', { class: 'sub' }, 'Acciones rápidas'), quick))

    if (can('get_tasks')) {
      const box = el('div')
      const load = async () => box.replaceChildren(table(asList(await call('get_tasks').catch(() => [])), [{ key: 'task', label: 'Tarea', fmt: (v) => TASK_LABELS[v] || v }, { key: 'enabled', label: 'Estado', fmt: (v) => (v ? el('span', { class: 'tag green' }, 'ACTIVA') : 'Parada') }, { key: 'delay', label: 'Intervalo', fmt: (v) => fmtDur(v) }, { key: 'nextRunDate', label: 'Próxima', fmt: fmtDate }],
        (t) => [t.enabled ? can('disable_task') && btn('Parar', async () => { await run('disable_task', { task: t.task }, 'Tarea parada'); load() }) : can('enable_task') && btn('Activar', async () => { await run('enable_task', { task: t.task }, 'Tarea activada'); load() }),
          can('update_task_delay') && btn('Intervalo', async () => { const v = await form(`Intervalo de ${t.task}`, [{ name: 'min', label: 'Minutos', type: 'number', min: 1, value: Math.round(t.delay / 60000), required: true }], 'Guardar'); if (v) { await run('update_task_delay', { task: t.task, delay: v.min * 60000 }, 'Guardado'); load() } })]))
      root.append(el('section', { class: 'card' }, el('h3', { class: 'sub' }, 'Tareas automáticas'), box))
      load()
    }

    if (can('resources')) {
      const search = el('input', { class: 'search', type: 'search', placeholder: 'Buscar recurso…' })
      const box = el('div', { style: 'margin-top:8px' })
      let res = []
      const draw = () => { const q = search.value.trim().toLowerCase(); box.replaceChildren(table(res.filter((r) => !q || r.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name)), [{ key: 'name', label: 'Recurso' }, { key: 'status', label: 'Estado', fmt: (v) => (v ? el('span', { class: 'tag green' }, 'INICIADO') : 'Parado') }, { key: 'version', label: 'Versión' }],
        can('resource_start') ? (r) => [r.status ? btn('Parar', async () => { if (await confirmBox(`¿Parar ${r.name}?`, 'Parar')) { await run('resource_stop', { value: r.name }, 'Recurso parado'); setTimeout(load, 800) } }, 'danger') : btn('Iniciar', async () => { await run('resource_start', { value: r.name }, 'Recurso iniciado'); setTimeout(load, 800) })] : null)) }
      const load = async () => { res = asList(await call('resources').catch(() => [])); draw() }
      search.addEventListener('input', draw)
      root.append(el('section', { class: 'card' }, el('h3', { class: 'sub' }, 'Recursos'), search, box))
      load()
    }

    if (can('console_read') || can('console_exec')) {
      const out = el('div', { class: 'console' })
      const input = el('input', { class: 'inline-input', placeholder: 'Comando de consola (Enter para ejecutar)', maxLength: 500 })
      let since = 0
      const poll = async () => {
        if (!can('console_read')) return
        const lines = asList(await call('console_read', { since }).catch(() => []))
        if (!lines.length) return
        since = lines[lines.length - 1].t
        const atBottom = out.scrollHeight - out.scrollTop - out.clientHeight < 40
        out.append(...lines.map((l) => el('div', {}, el('span', { class: 'ch' }, `[${l.c || ''}] `), l.m)))
        while (out.childElementCount > 600) out.firstChild.remove()
        if (atBottom) out.scrollTop = out.scrollHeight
      }
      input.addEventListener('keydown', async (e) => {
        if (e.key !== 'Enter' || !input.value.trim()) return
        const cmd = input.value.trim()
        if (!(await confirmBox(`¿Ejecutar «${cmd}» en la consola del servidor?`, 'Ejecutar'))) return
        input.value = ''
        await run('console_exec', { value: cmd }, 'Comando enviado').catch(() => {})
        setTimeout(poll, 600)
      })
      root.append(el('section', { class: 'card' }, el('h3', { class: 'sub' }, 'Consola'), can('console_read') ? out : el('p', { class: 'muted' }, 'No tienes permiso para leer la consola.'), can('console_exec') && el('div', { style: 'margin-top:8px' }, input)))
      poll()
      every(3000, poll)
    }
  }

  // ------------------------------------------------------------------ arranque
  function gate(title, text, actions = []) {
    $('gate-title').textContent = title
    $('gate-text').textContent = text
    $('gate-actions').replaceChildren(...actions)
    $('gate').hidden = false
    $('layout').hidden = true
  }
  function showMe(user, groupLabel) {
    $('me').hidden = false
    $('me-name').textContent = user.displayName
    $('me-group').textContent = groupLabel || (user.discordRoles || []).join(', ')
    if (user.avatarUrl && /^https:\/\/cdn\.discordapp\.com\//.test(user.avatarUrl)) $('me-avatar').src = user.avatarUrl
    else $('me-avatar').hidden = true
  }

  async function init() {
    $('menu-toggle').addEventListener('click', () => $('nav').classList.toggle('open'))
    try {
      const me = await api('/api/admin/me')
      S.me = me
      S.ops = new Set(me.ops || [])
      S.perms = new Set(me.permissions || [])
      showMe(me.user, me.staff?.groupLabel)
      $('nav').replaceChildren(...SECTIONS.filter((s) => s.show()).map((s) => el('button', { type: 'button', dataset: { id: s.id }, onclick: () => go(s.id) }, s.label)))
      $('gate').hidden = true
      $('layout').hidden = false
      go(location.hash.slice(1))
      window.addEventListener('hashchange', () => { if (location.hash.slice(1) !== S.section) go(location.hash.slice(1)) })
    } catch (e) {
      if (e.data?.user) showMe(e.data.user)
      if (e.status === 401) return gate('Acceso de staff', 'Inicia sesión con tu cuenta de Discord para entrar al panel.', [el('a', { class: 'btn discord', href: '/discord?next=admin' }, 'Entrar con Discord')])
      if (e.status === 403) return gate('Sin acceso', e.message, [el('a', { class: 'btn', href: '/' }, 'Volver a la web'), el('a', { class: 'btn ghost', href: '/admin/logout' }, 'Cambiar de cuenta')])
      gate('Panel no disponible', e.message, [el('button', { class: 'btn primary', type: 'button', onclick: () => location.reload() }, 'Reintentar')])
    }
  }
  init()
})()
