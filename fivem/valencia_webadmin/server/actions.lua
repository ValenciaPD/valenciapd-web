-- Acciones disponibles desde el panel web. Cada acción declara el permiso de luxu_admin que exige.
-- Los ids de permiso son los mismos de luxu_admin/config/permissions.json.

local ESX = exports.es_extended:getSharedObject()

Actions = {}

local function playerName(src)
    return GetPlayerName(tostring(src)) or ('ID ' .. tostring(src))
end

local function log(staff, text)
    print(('^3[web-admin]^0 %s (%s) %s'):format(staff.name or staff.discordId, staff.group, text))
end

local function trim(s, max)
    s = tostring(s or ''):gsub('^%s+', ''):gsub('%s+$', '')
    return s:sub(1, max or 255)
end

local function positiveInt(v, max)
    v = math.floor(tonumber(v) or 0)
    if v < 1 then return nil end
    return math.min(v, max or 1000000)
end

-- Lista de jugadores conectados (cualquier staff)
Actions['players.list'] = {
    handler = function(staff)
        local list = {}
        local showIds = Perms.has(staff, 'player.view_identifiers')
        for _, id in ipairs(GetPlayers()) do
            local xPlayer = ESX.GetPlayerFromId(id)
            local entry = {
                id = tonumber(id),
                name = GetPlayerName(id),
                ping = GetPlayerPing(id),
                job = xPlayer and xPlayer.job and xPlayer.job.label or nil,
                jobGrade = xPlayer and xPlayer.job and xPlayer.job.grade_label or nil,
                character = xPlayer and xPlayer.getName and xPlayer.getName() or nil,
                staffGroup = Player(id).state.luxu_admin_staff_group,
            }
            if showIds then
                entry.identifiers = {}
                for _, ident in ipairs(GetPlayerIdentifiers(id)) do
                    if not ident:match('^ip:') or Perms.has(staff, 'player.view_ip') then
                        entry.identifiers[#entry.identifiers + 1] = ident
                    end
                end
            end
            list[#list + 1] = entry
        end
        return { players = list }
    end,
}

Actions['player.accounts'] = {
    permission = 'player.view_money_accounts',
    target = true,
    handler = function(_, target)
        local xPlayer = ESX.GetPlayerFromId(target)
        if not xPlayer then return nil, 'Jugador sin personaje cargado' end
        local accounts = {}
        for _, acc in ipairs(xPlayer.getAccounts()) do
            accounts[#accounts + 1] = { name = acc.name, label = acc.label, money = acc.money }
        end
        return { accounts = accounts }
    end,
}

Actions['player.set_account'] = {
    permission = 'player.manage_accounts',
    target = true,
    handler = function(staff, target, data)
        local xPlayer = ESX.GetPlayerFromId(target)
        if not xPlayer then return nil, 'Jugador sin personaje cargado' end
        local account, amount = trim(data.account, 32), math.floor(tonumber(data.amount) or -1)
        if amount < 0 or not xPlayer.getAccount(account) then return nil, 'Cuenta o cantidad no válida' end
        xPlayer.setAccountMoney(account, amount, 'Panel web')
        log(staff, ('fijó %s de %s a %d'):format(account, playerName(target), amount))
        return { ok = true }
    end,
}

Actions['inventory.view'] = {
    permission = 'inventory.view',
    target = true,
    handler = function(_, target)
        local ok, inv = pcall(function() return exports.origen_inventory:GetInventory(target) end)
        if not ok or type(inv) ~= 'table' then
            local xPlayer = ESX.GetPlayerFromId(target)
            inv = xPlayer and xPlayer.getInventory(true) or {}
        end
        local items = {}
        for k, item in pairs(inv) do
            local count = type(item) == 'table' and (item.count or item.amount) or item
            if tonumber(count) and tonumber(count) > 0 then
                items[#items + 1] = {
                    name = type(item) == 'table' and item.name or k,
                    label = type(item) == 'table' and item.label or k,
                    count = tonumber(count),
                    slot = type(item) == 'table' and item.slot or nil,
                }
            end
        end
        return { items = items }
    end,
}

Actions['inventory.give'] = {
    permission = 'inventory.give',
    target = true,
    handler = function(staff, target, data)
        local item, amount = trim(data.item, 64), positiveInt(data.amount, 10000)
        if item == '' or not amount then return nil, 'Objeto o cantidad no válida' end
        local ok = exports.origen_inventory:AddItem(target, item, amount, nil, nil)
        if not ok then return nil, 'No se pudo dar el objeto' end
        log(staff, ('dio %s x%d a %s'):format(item, amount, playerName(target)))
        return { ok = true }
    end,
}

Actions['inventory.remove'] = {
    permission = 'inventory.remove',
    target = true,
    handler = function(staff, target, data)
        local item, amount = trim(data.item, 64), positiveInt(data.amount, 10000)
        if item == '' or not amount then return nil, 'Objeto o cantidad no válida' end
        local ok = exports.origen_inventory:RemoveItem(target, item, amount)
        if not ok then return nil, 'No se pudo quitar el objeto' end
        log(staff, ('quitó %s x%d a %s'):format(item, amount, playerName(target)))
        return { ok = true }
    end,
}

Actions['player.kick'] = {
    permission = 'player.kick',
    target = true,
    hierarchy = true,
    handler = function(staff, target, data)
        local reason = trim(data.reason, 200)
        if #reason < 3 then return nil, 'Indica un motivo' end
        log(staff, ('expulsó a %s: %s'):format(playerName(target), reason))
        DropPlayer(tostring(target), ('Expulsado por el staff: %s'):format(reason))
        return { ok = true }
    end,
}

Actions['player.ban'] = {
    permission = 'player.ban',
    target = true,
    hierarchy = true,
    handler = function(staff, target, data)
        local reason = trim(data.reason, 200)
        if #reason < 3 then return nil, 'Indica un motivo' end
        local hours = tonumber(data.hours) or 0 -- 0 = permanente
        local expires = hours > 0 and (os.time() + math.floor(hours * 3600)) * 1000 or 32503680000000
        log(staff, ('baneó a %s (%s): %s'):format(playerName(target), hours > 0 and (hours .. 'h') or 'permanente', reason))
        local ok = exports.luxu_admin:ban(target, expires, reason, 'Panel web - ' .. (staff.name or staff.group))
        return ok and { ok = true } or nil, not ok and 'No se pudo banear' or nil
    end,
}

Actions['player.warn'] = {
    permission = 'player.warn',
    target = true,
    hierarchy = true,
    handler = function(staff, target, data)
        local reason = trim(data.reason, 200)
        if #reason < 3 then return nil, 'Indica un motivo' end
        exports.luxu_admin:warnPlayer(target, reason, staff.name or staff.group)
        log(staff, ('advirtió a %s: %s'):format(playerName(target), reason))
        return { ok = true }
    end,
}

Actions['player.revive'] = {
    permission = 'player.revive',
    target = true,
    handler = function(staff, target)
        TriggerClientEvent('esx_ambulancejob:revive', target)
        log(staff, ('revivió a %s'):format(playerName(target)))
        return { ok = true }
    end,
}

Actions['player.heal'] = {
    permission = 'player.heal',
    target = true,
    handler = function(staff, target)
        TriggerClientEvent('esx_basicneeds:healPlayer', target)
        log(staff, ('curó a %s'):format(playerName(target)))
        return { ok = true }
    end,
}

Actions['player.freeze'] = {
    permission = 'player.freeze',
    target = true,
    hierarchy = true,
    handler = function(staff, target, data)
        local ped = GetPlayerPed(tostring(target))
        if ped == 0 then return nil, 'Jugador no encontrado' end
        FreezeEntityPosition(ped, data.freeze == true)
        log(staff, ('%s a %s'):format(data.freeze and 'congeló' or 'descongeló', playerName(target)))
        return { ok = true }
    end,
}

Actions['player.update_job'] = {
    permission = 'player.update_job',
    target = true,
    handler = function(staff, target, data)
        local xPlayer = ESX.GetPlayerFromId(target)
        if not xPlayer then return nil, 'Jugador sin personaje cargado' end
        local job, grade = trim(data.job, 50), math.floor(tonumber(data.grade) or 0)
        if not ESX.DoesJobExist(job, grade) then return nil, 'Trabajo o rango no existe' end
        xPlayer.setJob(job, grade)
        log(staff, ('puso a %s el trabajo %s (%d)'):format(playerName(target), job, grade))
        return { ok = true }
    end,
}

Actions['player.notify'] = {
    permission = 'player.notify',
    target = true,
    handler = function(staff, target, data)
        local message = trim(data.message, 300)
        if message == '' then return nil, 'Mensaje vacío' end
        TriggerClientEvent('okokNotify:Alert', target, 'Staff', message, 8000, 'info')
        log(staff, ('notificó a %s: %s'):format(playerName(target), message))
        return { ok = true }
    end,
}
