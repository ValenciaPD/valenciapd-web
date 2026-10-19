// Panel web de staff (valenciapd.es/admin) integrado en luxu_admin.
//
// La web llama a  POST https://<servidor>/luxu_admin/webadmin/<ruta>  con JSON firmado:
//   X-VPD-Timestamp: <ms unix>
//   X-VPD-Signature: hex(HMAC_SHA256(secreto, `${timestamp}.${ruta}.${cuerpo}`))
// Secreto en config/webadmin.json (no se envía a los clientes). Firmas válidas 60 s y de un solo uso.
//
// Cada operación pasa por una lista blanca con su permiso de luxu, y después por los mismos manejadores que usa
// el panel externo oficial de luxu (hooks inyectados en server/index.js con inject_webadmin_hooks.py), que a su vez
// vuelven a comprobar jerarquía y registran el log de staff.
;(() => {
  const crypto = require('crypto')
  const RESOURCE = GetCurrentResourceName()
  const W = (globalThis.__vpdWeb ??= { cbs: new Map() })

  // La acción "curar" de luxu llama a SetEntityHealth en el servidor, pero esa nativa solo existe en el cliente
  // (fallaba también desde el juego). luxu ya cura al jugador con su evento de cliente, así que basta con no romper.
  if (typeof globalThis.SetEntityHealth !== 'function') globalThis.SetEntityHealth = () => {}
  W.virtual ??= new Map()

  // ---------------------------------------------------------------- configuración
  function loadConfig() {
    try {
      return JSON.parse(LoadResourceFile(RESOURCE, 'config/webadmin.json') || '{}')
    } catch {
      return {}
    }
  }
  const CONFIG = loadConfig()
  const SECRET = String(CONFIG.secret || GetConvar('luxu_webadmin_secret', ''))
  const MAX_SKEW_MS = 60_000
  const MAX_BODY = 256 * 1024
  const log = (...a) => console.log('^5[webadmin]^0', ...a)
  class UserError extends Error {} // error con mensaje apto para mostrar en la web

  if (CONFIG.enabled === false || SECRET.length < 32) {
    log('^1Panel web desactivado (config/webadmin.json: enabled=false o secret con menos de 32 caracteres).^0')
    return
  }

  // ---------------------------------------------------------------- base de datos
  const db = (method, sql, params = []) =>
    new Promise((resolve, reject) => {
      try {
        exports.oxmysql[method](sql, params, (r) => resolve(r))
      } catch (e) {
        reject(e)
      }
    })

  // ---------------------------------------------------------------- staff
  const staffCache = new Map() // clave -> { staff, exp }

  async function resolveStaff(discordId, roles, name) {
    discordId = String(discordId || '').replace(/^discord:/, '')
    if (!/^\d{5,25}$/.test(discordId)) return null
    roles = Array.isArray(roles) ? roles.map(String).filter((r) => /^\d{5,25}$/.test(r)).slice(0, 100) : []
    const key = discordId + ':' + roles.slice().sort().join(',')
    const hit = staffCache.get(key)
    if (hit && hit.exp > Date.now()) return hit.staff

    const member = await db('single', 'SELECT * FROM luxu_admin_group_members WHERE discord = ? OR discord = ? LIMIT 1', [
      'discord:' + discordId,
      discordId,
    ])
    let group = member?.group ?? null
    if (!group && roles.length) {
      const g = await db('single', 'SELECT name FROM luxu_admin_groups WHERE discord_role_id IN (?) ORDER BY hierarchy ASC LIMIT 1', [roles])
      group = g?.name ?? null
    }
    if (!group) return null
    const groupRow = await db('single', 'SELECT name, label, hierarchy FROM luxu_admin_groups WHERE name = ? LIMIT 1', [group])
    if (!groupRow) return null

    const staff = {
      id: member?.id ?? null,
      nickname: member?.nickname || String(name || 'Staff web').slice(0, 64),
      group,
      groupLabel: groupRow.label || group,
      hierarchy: group === 'owner' ? 0 : Number(groupRow.hierarchy),
      avatar: member?.avatar ?? null,
      license2: member?.license2 ?? null,
      discord: 'discord:' + discordId,
      steam: member?.steam ?? null,
      fivem: member?.fivem ?? null,
      gender: member?.gender ?? 'male',
      onDuty: true,
      isMember: !!member,
    }
    staffCache.set(key, { staff, exp: Date.now() + 30_000 })
    return staff
  }

  const can = (staff, perm) => !perm || (typeof W.hasPermission === 'function' && W.hasPermission(staff.group, perm))

  // ---------------------------------------------------------------- ejecución en nombre del staff web
  let nextVirtual = 0
  async function withVirtualSource(staff, fn) {
    const src = 0x3fff0000 + (nextVirtual++ % 0xffff) // nunca coincide con un jugador real
    W.virtual.set(src, { ...staff, source: src })
    try {
      return await fn(src)
    } finally {
      W.virtual.delete(src)
    }
  }

  // Con un origen virtual (y no null) los avisos que luxu manda "al staff que ejecutó la acción" no fallan
  const runAction = (key, staff, data) => withVirtualSource(staff, (src) => W.actions[key].handler(src, data, { ...staff, source: src }))
  const runOffline = (key, staff, data) => withVirtualSource(staff, (src) => W.offline[key].handler(src, data, { ...staff, source: src }))
  const runNonAction = (key, staff, data) => {
    const h = W.webPanel?.nonActionHandlers?.get(key)
    if (!h) throw new UserError('Función no disponible: ' + key)
    return h({ staff: { ...staff, source: null }, data })
  }
  const runCallback = (key, staff, args) => {
    const cb = W.cbs.get(key)
    if (!cb) throw new UserError('Función no disponible: ' + key)
    return withVirtualSource(staff, (src) => cb(src, ...args))
  }

  // ---------------------------------------------------------------- consola (últimas líneas)
  const consoleLines = []
  try {
    RegisterConsoleListener((channel, message) => {
      for (const line of String(message).split('\n')) {
        if (!line.trim()) continue
        consoleLines.push({ t: Date.now(), c: channel, m: line.replace(/\^\d/g, '').slice(0, 1000) })
      }
      if (consoleLines.length > 400) consoleLines.splice(0, consoleLines.length - 400)
    })
  } catch (e) {
    log('No se pudo capturar la consola:', e?.message)
  }

  // ---------------------------------------------------------------- observar pantalla (WebRTC por polling)
  const streams = new Map() // sessionId -> { discordId, viewerToken, streamId, queue, exp }
  // Se registra al iniciar cada retransmisión: así siempre gana al reenvío hacia luxu.app (desactivado aquí)
  function installSignalHandler() {
    if (typeof W.setSignalHandler !== 'function') throw new UserError('Retransmisión no disponible (faltan los hooks de luxu)')
    W.setSignalHandler((data) => {
      const s = streams.get(data?.sessionId)
      if (!s) return
      s.queue.push({ type: data.type, payload: data.payload })
      if (s.queue.length > 200) s.queue.splice(0, s.queue.length - 200)
    })
  }
  setInterval(() => {
    const now = Date.now()
    for (const [id, s] of streams) if (s.exp < now) streams.delete(id)
  }, 60_000)

  function ownStream(staff, data) {
    const s = streams.get(String(data?.sessionId || ''))
    if (!s || s.discordId !== staff.discord || s.viewerToken !== data?.viewerToken) throw new UserError('Sesión de retransmisión no válida')
    s.exp = Date.now() + 10 * 60_000
    return s
  }

  // ---------------------------------------------------------------- inventario de un jugador conectado
  function onlineInventory(target) {
    let items = null
    try {
      items = exports.origen_inventory.GetInventory(target)
    } catch {}
    if (!items) {
      try {
        const ESX = exports.es_extended.getSharedObject()
        items = ESX.GetPlayerFromId(target)?.getInventory?.(false)
      } catch {}
    }
    const list = Array.isArray(items) ? items : Object.values(items || {})
    return list
      .filter((i) => i && (i.count ?? i.amount) > 0)
      .map((i) => ({ name: i.name, label: i.label || i.name, count: i.count ?? i.amount, slot: i.slot ?? null }))
  }

  // ---------------------------------------------------------------- lista blanca de operaciones
  // kind: action | offline | nonaction | cb | custom.  perm: permiso de luxu exigido (null = cualquier staff).
  // Si no se indica perm en una acción/offline, se usa el permiso que declara luxu para ese manejador.
  const ACTION_KEYS = [
    // jugador conectado
    'kick', 'warn', 'ban', 'jail', 'kill', 'revive', 'heal', 'give_armor', 'give_food_and_water', 'slap', 'freeze', 'handcuff',
    'explosion', 'burn', 'ragdoll', 'teleport_to_coords', 'teleport_last_location', 'routing_bucket', 'send_message',
    'update_job', 'update_gang', 'get_jobs', 'get_gangs', 'get_player_accounts', 'update_money_account', 'removeMoney',
    'give_item', 'remove_item', 'change_ped_model', 'reset_ped_model', 'get_player_vehicles', 'give_vehicle_key',
    'give_vehicle', 'spawn_vehicle', 'fix_vehicle', 'flip_vehicle', 'delete_vehicle', 'delete_character',
    'get_health_and_armor', 'get_player_ping', 'get_player_bucket', 'get_flag', 'set_flag', 'get_warnings', 'warn_remove',
    'is_jailed', 'get_players_with_item',
    // varios jugadores
    'multi_kick', 'multi_warn', 'multi_ban', 'multi_kill', 'multi_revive', 'multi_slap', 'multi_freeze', 'multi_message',
    'multi_teleport_to_coords', 'multi_teleport_last_location',
    // moderación y servidor
    'unban', 'un_jail', 'announcment', 'update_weather', 'update_time', 'teleport_everyone',
    'get_logs_paginated', 'get_log_counts', 'get_staff_logs_paginated', 'get_staff_log_counts', 'get_staff_with_log_counts',
    'get_tasks', 'enable_task', 'disable_task', 'update_task_delay', 'force_wipe_vehicles',
    // vehículos
    'get_vehicle_owners', 'unlock_vehicle_doors_by_plate', 'update_vehicle_plate', 'update_vehicle_owner', 'remove_vehicle',
    'send_to_garage',
  ]
  const ACTION_PERM_OVERRIDE = {
    get_flag: 'player.view_notes', set_flag: 'player.create_notes', get_warnings: 'player.warn', get_tasks: 'tasks.manage',
    is_jailed: 'player.jail', get_health_and_armor: null, get_player_ping: null, get_player_bucket: null,
  }
  const OFFLINE_KEYS = [
    'search_players', 'get_player', 'check_ban_status', 'get_notes', 'add_note', 'delete_note', 'add_ban', 'jail', 'un_jail',
    'is_jailed', 'get_warnings', 'get_inventory', 'give_item_offline', 'remove_item_offline', 'update_money_account',
    'get_vehicles', 'update_vehicle_plate', 'remove_vehicle', 'send_to_garage', 'update_job', 'update_gang',
    'update_character_name', 'delete_player', 'delete_character',
  ]
  const OFFLINE_PERM_OVERRIDE = { get_notes: 'player.view_notes', add_note: 'player.create_notes', get_warnings: 'player.warn', is_jailed: 'player.jail' }

  const OPS = {}
  for (const k of ACTION_KEYS) OPS[k] = { kind: 'action', key: k, perm: k in ACTION_PERM_OVERRIDE ? ACTION_PERM_OVERRIDE[k] : undefined }
  for (const k of OFFLINE_KEYS) OPS['offline.' + k] = { kind: 'offline', key: k, perm: k in OFFLINE_PERM_OVERRIDE ? OFFLINE_PERM_OVERRIDE[k] : undefined }
  Object.assign(OPS, {
    // datos generales
    panel: { kind: 'cb', key: 'getPanelData', perm: null, args: () => [false] },
    statistics: { kind: 'cb', key: 'getStatistics', perm: 'statistics.view', args: () => [] },
    player_chart: { kind: 'cb', key: 'getPlayerCountChartData', perm: 'statistics.view', args: () => [] },
    money_transactions: { kind: 'cb', key: 'getMoneyTransactions', perm: 'statistics.view', args: (d) => [d] },
    statistic_blocks: { kind: 'nonaction', key: 'custom_functions:statistic_blocks:get', perm: 'statistics.view' },
    item_list: { kind: 'nonaction', key: 'inventory:getItemList', perm: 'inventory.give' },
    vehicle_models: { kind: 'nonaction', key: 'getAllVehicleModels', perm: null },
    teleports: { kind: 'nonaction', key: 'getTeleports', perm: 'player.teleport' },
    // moderación
    bans: { kind: 'cb', key: 'getBans', perm: 'moderation.view.bans', args: () => [] },
    warnings: { kind: 'cb', key: 'getWarnings', perm: 'moderation.view.warnings', args: () => [] },
    jail_list: { kind: 'cb', key: 'getJail', perm: 'moderation.view.jail', args: () => [] },
    // staff
    staff_list: { kind: 'cb', key: 'staff:getGroupsAndStaff', perm: 'staff.view', args: () => [] },
    staff_create_member: { kind: 'cb', key: 'staff:createMember', perm: 'staff.manage', args: (d) => [d] },
    staff_update_member: { kind: 'cb', key: 'staff:updateMember', perm: 'staff.manage', args: (d) => [d] },
    staff_remove_member: { kind: 'cb', key: 'staff:removeMember', perm: 'staff.manage', args: (d) => [d?.id] },
    staff_create_group: { kind: 'cb', key: 'staff:createGroup', perm: 'staff.manage', args: (d) => [d] },
    staff_update_group: { kind: 'cb', key: 'staff:updateGroup', perm: 'staff.manage', args: (d) => [d] },
    staff_delete_group: { kind: 'cb', key: 'staff:deleteGroup', perm: 'staff.manage', args: (d) => [d?.name] },
    duty_overview: { kind: 'nonaction', key: 'dutyTracking:getOverview', perm: 'staff.view' },
    duty_leaderboard: { kind: 'nonaction', key: 'dutyTracking:getLeaderboard', perm: 'staff.view' },
    duty_staff: { kind: 'nonaction', key: 'dutyTracking:getStaffStats', perm: 'staff.view' },
    // reportes y chats
    chats: { kind: 'nonaction', key: 'chat:staff:fetchAll', perm: 'chats.view' },
    chat_messages: { kind: 'nonaction', key: 'chat:join', perm: 'chats.view', value: true },
    chat_send: { kind: 'nonaction', key: 'chat:sendMessage', perm: 'chats.view' },
    chat_create: { kind: 'nonaction', key: 'chat:staff:createChat', perm: 'chats.create' },
    chat_delete: { kind: 'nonaction', key: 'chat:staff:deleteChat', perm: 'chats.delete', value: true },
    chat_rename: { kind: 'nonaction', key: 'chat:staff:updateName', perm: 'chats.update' },
    report_claim: { kind: 'nonaction', key: 'chat:staff:claimReport', perm: 'chats.view', value: true },
    report_unclaim: { kind: 'nonaction', key: 'chat:staff:unclaimReport', perm: 'chats.view', value: true },
    report_close: { kind: 'nonaction', key: 'chat:staff:closeReport', perm: 'reports.close', value: true },
    // servidor
    resources: { kind: 'nonaction', key: 'resources:getResources', perm: 'resources.read' },
    resource_start: { kind: 'nonaction', key: 'resources:start', perm: 'resources.manage', value: true },
    resource_stop: { kind: 'nonaction', key: 'resources:stop', perm: 'resources.manage', value: true },
    console_exec: { kind: 'nonaction', key: 'console:sendCommand', perm: 'console.execute', value: true },
    console_read: { kind: 'custom', perm: 'console.read', run: (_s, d) => consoleLines.filter((l) => l.t > (Number(d?.since) || 0)).slice(-300) },
    // inventario de jugador conectado
    inventory: {
      kind: 'custom', perm: 'inventory.view',
      run: (_s, d) => {
        const target = Number(d?.target)
        if (!GetPlayerName(String(target))) throw new UserError('El jugador no está conectado')
        return onlineInventory(target)
      },
    },
    // observar pantalla
    stream_start: {
      kind: 'custom', perm: 'player.monitoring',
      run: async (staff, d) => {
        const target = Number(d?.target)
        installSignalHandler()
        const res = await runNonAction('spectate:remote:start', staff, { svId: target })
        if (!res?.signalingSessionId) throw new UserError('No se pudo iniciar la retransmisión')
        streams.set(res.signalingSessionId, {
          discordId: staff.discord, viewerToken: res.viewerToken, streamId: res.streamId, queue: [], exp: Date.now() + 10 * 60_000,
        })
        const ice = await runNonAction('getTurnServers', staff, null).catch(() => [])
        return { sessionId: res.signalingSessionId, viewerToken: res.viewerToken, streamId: res.streamId, iceServers: ice || [] }
      },
    },
    stream_signal: {
      kind: 'custom', perm: 'player.monitoring',
      run: (staff, d) => {
        ownStream(staff, d)
        if (!['offer', 'answer', 'ice-candidate'].includes(d.type)) throw new UserError('Señal no válida')
        return runNonAction('signaling:to:host', staff, { sessionId: d.sessionId, viewerToken: d.viewerToken, type: d.type, payload: d.payload })
      },
    },
    stream_poll: {
      kind: 'custom', perm: 'player.monitoring',
      run: (staff, d) => {
        const s = ownStream(staff, d)
        return s.queue.splice(0, s.queue.length)
      },
    },
    stream_stop: {
      kind: 'custom', perm: 'player.monitoring',
      run: (staff, d) => {
        const s = ownStream(staff, d)
        streams.delete(String(d.sessionId))
        runNonAction('signaling:session:close', staff, { sessionId: d.sessionId, viewerToken: d.viewerToken })
        return runNonAction('spectate:remote:stop', staff, { streamId: s.streamId, viewerToken: d.viewerToken })
      },
    },
  })

  const READ_ONLY = /^(stream_signal|panel|statistics|player_chart|money_transactions|statistic_blocks|item_list|vehicle_models|teleports|bans|warnings|jail_list|staff_list|duty_|chats|chat_messages|resources|console_read|inventory|stream_poll|get_|is_|offline\.(search_players|get_|check_ban_status|is_jailed))/

  // Gestión de staff: solo sobre grupos/miembros de rango inferior al propio (en luxu, menor número = más rango)
  async function guardStaffOp(name, staff, data) {
    if (!name.startsWith('staff_') || name === 'staff_list' || staff.group === 'owner') return
    const lower = (h) => Number.isFinite(Number(h)) && Number(h) > staff.hierarchy
    const groupHier = async (g) => (g === 'owner' ? 0 : (await db('single', 'SELECT hierarchy FROM luxu_admin_groups WHERE name = ? LIMIT 1', [String(g ?? '')]))?.hierarchy)
    const deny = () => { throw new UserError('No puedes gestionar staff o grupos de rango igual o superior al tuyo') }
    if (name === 'staff_create_group' || name === 'staff_update_group') {
      if (!lower(data.hierarchy)) deny()
      if (name === 'staff_update_group') { const h = await groupHier(data.name); if (h != null && !lower(h)) deny() }
      if (data.name === 'owner') deny()
    }
    if (name === 'staff_delete_group') { const h = await groupHier(data.name); if (h == null || !lower(h)) deny() }
    if (name === 'staff_create_member' || name === 'staff_update_member') { const h = await groupHier(data.group); if (h == null || !lower(h)) deny() }
    if (name === 'staff_update_member' || name === 'staff_remove_member') {
      const m = await db('single', 'SELECT `group` FROM luxu_admin_group_members WHERE id = ? LIMIT 1', [Number(data.id)])
      if (!m) throw new UserError('Miembro no encontrado')
      const h = await groupHier(m.group)
      if (h == null || !lower(h)) deny()
    }
  }

  // Valida los campos que los manejadores de luxu dan por buenos (vienen de su propia interfaz).
  // Importante: en FiveM el destino -1 significa "todos los jugadores".
  const isOnline = (v) => Number.isInteger(v) && v > 0 && !!GetPlayerName(String(v))
  function sanitize(data) {
    if ('target' in data && data.target != null) {
      const t = Number(data.target)
      if (!isOnline(t)) throw new UserError('El jugador no está conectado')
      data.target = t
    }
    if ('targets' in data) {
      if (!Array.isArray(data.targets) || data.targets.length === 0 || data.targets.length > 128) throw new UserError('Lista de jugadores no válida')
      data.targets = data.targets.map(Number)
      if (!data.targets.every(isOnline)) throw new UserError('Algún jugador ya no está conectado')
    }
    for (const k of ['amount', 'duration', 'grade', 'bucket', 'hour', 'minute', 'delay', 'radius']) {
      if (k in data && data[k] != null) {
        const n = Number(data[k])
        if (!Number.isFinite(n) || n < 0) throw new UserError(`Valor no válido: ${k}`)
        data[k] = n
      }
    }
    if ('amount' in data && data.amount === 0 && !('account' in data)) throw new UserError('La cantidad debe ser mayor que 0')
    if ('hour' in data && data.hour > 23) throw new UserError('Hora no válida')
    if ('minute' in data && data.minute > 59) throw new UserError('Minuto no válido')
    for (const [k, v] of Object.entries(data)) if (typeof v === 'string' && v.length > 2000) throw new UserError(`Texto demasiado largo: ${k}`)
    return data
  }
  function opPermission(op) {
    if (op.perm !== undefined) return op.perm
    if (op.kind === 'action') return W.actions?.[op.key]?.permission ?? null
    if (op.kind === 'offline') return W.offline?.[op.key]?.permission ?? null
    return null
  }

  async function runOp(name, staff, data) {
    const op = Object.prototype.hasOwnProperty.call(OPS, name) ? OPS[name] : null
    if (!op) return [404, { error: 'Operación desconocida' }]
    if (op.kind === 'action' && !W.actions?.[op.key]) return [503, { error: 'Acción no disponible en esta versión de luxu_admin' }]
    if (op.kind === 'offline' && !W.offline?.[op.key]) return [503, { error: 'Acción no disponible en esta versión de luxu_admin' }]
    const perm = opPermission(op)
    if (!can(staff, perm)) return [403, { error: 'No tienes permiso para esta acción' }]

    try {
      data = sanitize(data)
    } catch (e) {
      if (e instanceof UserError) return [400, { error: e.message }]
      throw e
    }

    await guardStaffOp(name, staff, data)

    let result
    switch (op.kind) {
      case 'action': result = await runAction(op.key, staff, data); break
      case 'offline': result = await runOffline(op.key, staff, data); break
      case 'nonaction': {
        // algunas funciones de luxu reciben un valor simple (id de chat, comando, recurso) en vez de un objeto
        let arg = data
        if (op.value) {
          arg = data.value
          if (!['string', 'number'].includes(typeof arg) || String(arg).length === 0 || String(arg).length > 500) return [400, { error: 'Valor no válido' }]
        }
        result = await runNonAction(op.key, staff, arg)
        break
      }
      case 'cb': result = await runCallback(op.key, staff, op.args(data)); break
      case 'custom': result = await op.run(staff, data); break
    }
    if (!READ_ONLY.test(name)) log(`${staff.nickname} [${staff.group}] -> ${name}`, data && data.target != null ? `objetivo ${data.target}` : '')
    return [200, { result: result === undefined ? null : result }]
  }

  // ---------------------------------------------------------------- petición firmada (común a todos los transportes)
  const usedSignatures = new Map()
  function verify(path, body, tsRaw, sigRaw) {
    const ts = Number(tsRaw)
    const sig = String(sigRaw ?? '')
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) return false
    if (!/^[0-9a-f]{64}$/.test(sig) || usedSignatures.has(sig)) return false
    const expected = crypto.createHmac('sha256', SECRET).update(`${ts}.${path}.${body}`).digest()
    const given = Buffer.from(sig, 'hex')
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return false
    const now = Date.now()
    for (const [s, exp] of usedSignatures) if (exp < now) usedSignatures.delete(s)
    usedSignatures.set(sig, now + MAX_SKEW_MS * 2)
    return true
  }

  // Ejecuta una petición ya recibida. Devuelve [estado HTTP, respuesta].
  async function handle(path, raw, ts, sig) {
    const reply = (_res, status, payload) => [status, payload]
    const res = null
    {
      try {
        raw = raw || ''
        if (raw.length > MAX_BODY) return reply(res, 413, { error: 'Petición demasiado grande' })
        if (!verify(path, raw, ts, sig)) return reply(res, 401, { error: 'No autorizado' })
        const body = JSON.parse(raw)
        if (!body || typeof body !== 'object') return reply(res, 400, { error: 'JSON no válido' })

        const staff = await resolveStaff(body.discordId, body.roles, body.name)
        if (!staff) return reply(res, 403, { error: 'Tu cuenta de Discord no tiene un grupo de staff en luxu_admin' })

        if (path === '/webadmin/me') {
          const permCfg = JSON.parse(LoadResourceFile(RESOURCE, 'config/permissions.json') || '{}')
          const permMap = { ...(permCfg.system || {}), ...(permCfg.addon_permissions || {}) }
          delete permMap.custom_permission_id
          const perms = W.actions ? Object.keys(permMap) : []
          // nombres en español de los permisos (para editar grupos desde la web)
          let permissionLabels
          if (can(staff, 'staff.manage')) {
            const lang = (() => { try { return JSON.parse(LoadResourceFile(RESOURCE, 'config/config.json')).locales.lang } catch { return 'es' } })()
            const loc = (() => { try { return JSON.parse(LoadResourceFile(RESOURCE, `locales/${lang}.json`)) } catch { return {} } })()
            permissionLabels = Object.fromEntries(perms.map((p) => [p, loc[permMap[p]] || p]))
          }
          return reply(res, 200, {
            staff: { id: staff.id, nickname: staff.nickname, group: staff.group, groupLabel: staff.groupLabel, hierarchy: staff.hierarchy, isMember: staff.isMember },
            permissions: perms.filter((p) => can(staff, p)),
            // operaciones que este staff puede usar: la web solo muestra esos botones
            ops: Object.keys(OPS).filter((n) => {
              const op = OPS[n]
              if (op.kind === 'action' && !W.actions?.[op.key]) return false
              if (op.kind === 'offline' && !W.offline?.[op.key]) return false
              return can(staff, opPermission(op))
            }),
            permissionLabels,
            meta: {
              jailCells: jailCells(),
              hooks: { actions: !!W.actions, offline: !!W.offline, webPanel: !!W.webPanel, signals: typeof W.setSignalHandler === 'function' },
            },
          })
        }
        if (path === '/webadmin/call') {
          const name = String(body.op || '')
          const data = body.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : {}
        const [status, payload] = await runOp(name, staff, data).catch((e) => {
          if (e instanceof UserError) return [400, { error: e.message }]
          throw e
        })
          return reply(res, status, payload)
        }
        return reply(res, 404, { error: 'Ruta no encontrada' })
      } catch (e) {
        log('^1Error:^0', e?.stack || e)
        return reply(res, 500, { error: 'Error interno del servidor de FiveM' })
      }
    }
  }

  // ---------------------------------------------------------------- transporte 1: HTTP directo (si algún día el puerto es accesible)
  SetHttpHandler((req, res) => {
    const send = (status, payload) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
      res.send(JSON.stringify(payload))
    }
    const path = String(req.path || '').split('?')[0]
    if (!path.startsWith('/webadmin/')) return send(404, { error: 'No encontrado' })
    if (req.method !== 'POST') return send(405, { error: 'Método no permitido' })
    const h = Object.fromEntries(Object.entries(req.headers || {}).map(([k, v]) => [String(k).toLowerCase(), v]))
    req.setDataHandler(async (raw) => send(...(await handle(path, raw, h['x-vpd-timestamp'], h['x-vpd-signature']))))
  })

  // ---------------------------------------------------------------- transporte 2: buzón en MySQL
  // La web (Vercel) no puede abrir conexiones con este servidor, así que deja las peticiones firmadas en esta
  // tabla y luxu las recoge con su propia conexión a la base de datos.
  const QUEUE = 'luxu_admin_webadmin_queue'
  let lastActivity = 0
  let polling = false
  async function pollQueue() {
    if (polling) return
    polling = true
    try {
      const rows = (await db('query', `SELECT id, route, body, ts, sig FROM ${QUEUE} WHERE status = 'pending' ORDER BY id LIMIT 25`)) || []
      if (rows.length) lastActivity = Date.now()
      await Promise.all(rows.map(async (r) => {
        const claimed = await db('update', `UPDATE ${QUEUE} SET status = 'processing' WHERE id = ? AND status = 'pending'`, [r.id])
        if (claimed !== 1) return
        const path = r.route === '/webadmin/me' || r.route === '/webadmin/call' ? r.route : ''
        const [status, payload] = path ? await handle(path, r.body, r.ts, r.sig) : [404, { error: 'Ruta no encontrada' }]
        await db('update', `UPDATE ${QUEUE} SET status = 'done', http_status = ?, result = ? WHERE id = ?`, [status, JSON.stringify(payload ?? null), r.id])
      }))
    } catch (e) {
      log('^1Error en el buzón:^0', e?.message || e)
    } finally {
      polling = false
    }
  }
  ;(async () => {
    try {
      await db('query', `CREATE TABLE IF NOT EXISTS ${QUEUE} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        route VARCHAR(32) NOT NULL,
        body MEDIUMTEXT NOT NULL,
        ts VARCHAR(20) NOT NULL,
        sig CHAR(64) NOT NULL,
        status ENUM('pending','processing','done') NOT NULL DEFAULT 'pending',
        http_status SMALLINT UNSIGNED DEFAULT NULL,
        result MEDIUMTEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY status_id (status, id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
      const cleanup = () => db('update', `DELETE FROM ${QUEUE} WHERE created_at < NOW() - INTERVAL 2 MINUTE`).catch(() => {})
      await cleanup()
      setInterval(cleanup, 60_000)
      // rápido mientras hay actividad, más lento en reposo
      const loop = async () => {
        await pollQueue()
        setTimeout(loop, Date.now() - lastActivity < 60_000 ? 150 : 400)
      }
      loop()
      log('Buzón MySQL del panel web listo.')
    } catch (e) {
      log('^1No se pudo preparar el buzón MySQL:^0', e?.message || e)
    }
  })()

  function jailCells() {
    try {
      const cfg = JSON.parse(LoadResourceFile(RESOURCE, 'config/config.json') || '{}')
      return (cfg.jail?.jail_cells || []).map((c) => c.name)
    } catch {
      return []
    }
  }

  // ---------------------------------------------------------------- diagnóstico (sin datos sensibles)
  setTimeout(async () => {
    try {
      const groups = await db('query', 'SELECT name, label, discord_role_id, hierarchy FROM luxu_admin_groups ORDER BY hierarchy')
      const members = await db('query', 'SELECT `group`, COUNT(*) AS total, SUM(discord IS NOT NULL) AS with_discord FROM luxu_admin_group_members GROUP BY `group`')
      const status = {
        updatedAt: new Date().toISOString(),
        webBaseUrl: GetConvar('web_baseUrl', ''),
        hooks: { actions: !!W.actions, offline: !!W.offline, webPanel: !!W.webPanel, signals: typeof W.setSignalHandler === 'function', callbacks: W.cbs.size },
        groups,
        members,
      }
      SaveResourceFile(RESOURCE, 'webadmin_status.json', JSON.stringify(status, null, 2), -1)
      log(`Panel web activo. Hooks: acciones=${!!W.actions} offline=${!!W.offline} panel=${!!W.webPanel} señales=${status.hooks.signals} callbacks=${W.cbs.size}`)
    } catch (e) {
      log('^1No se pudo generar webadmin_status.json:^0', e?.message)
    }
  }, 5000)
})()
