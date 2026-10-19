-- Procesa las peticiones ya autenticadas por http.js.
-- Rutas:
--   /me      { discordId, roles }                                  -> { group, label, permissions[] }
--   /action  { discordId, roles, name?, action, target?, data? }   -> resultado de la acción

local function handle(path, body)
    local staff = Perms.resolve(body.discordId, body.roles)
    if not staff then return 403, { error = 'Tu rol de Discord no tiene un grupo de staff en luxu_admin' } end
    staff.discordId = body.discordId
    staff.name = type(body.name) == 'string' and body.name:sub(1, 64) or nil

    if path == '/me' then
        return 200, { group = staff.group, label = staff.label, hierarchy = staff.hierarchy, permissions = Perms.list(staff) }
    end

    if path == '/action' then
        local action = Actions[body.action]
        if not action then return 404, { error = 'Acción desconocida' } end
        if action.permission and not Perms.has(staff, action.permission) then
            return 403, { error = 'No tienes permiso para esta acción' }
        end

        local target
        if action.target then
            target = tonumber(body.target)
            if not target or not GetPlayerName(tostring(target)) then
                return 404, { error = 'El jugador no está conectado' }
            end
            if action.hierarchy and not Perms.canActOn(staff, target) then
                return 403, { error = 'No puedes actuar sobre un staff de rango igual o superior' }
            end
        end

        local ok, result, err = pcall(action.handler, staff, target, type(body.data) == 'table' and body.data or {})
        if not ok then
            print(('^1[valencia_webadmin] Error en %s: %s^0'):format(body.action, result))
            return 500, { error = 'Error interno' }
        end
        if not result then return 400, { error = err or 'La acción falló' } end
        return 200, result
    end

    return 404, { error = 'Ruta no encontrada' }
end

-- Evento local (solo desde http.js de este mismo recurso; los clientes no pueden dispararlo)
AddEventHandler('valencia_webadmin:request', function(id, path, rawBody)
    if source and source ~= '' and tonumber(source) and tonumber(source) > 0 then return end
    CreateThread(function()
        local body = json.decode(rawBody) or {}
        local ok, status, payload = pcall(handle, path, body)
        if not ok then
            print(('^1[valencia_webadmin] Error: %s^0'):format(status))
            status, payload = 500, { error = 'Error interno' }
        end
        TriggerEvent('valencia_webadmin:result', id, status, json.encode(payload))
    end)
end)
