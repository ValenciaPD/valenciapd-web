-- Resuelve el grupo de staff de luxu_admin y sus permisos a partir de un usuario de Discord.
-- Misma lógica que luxu_admin: primero se busca al miembro por su discord en luxu_admin_group_members;
-- si no está, se usan los grupos cuyo discord_role_id coincide con alguno de sus roles de Discord.

Perms = {}

local OWNER_GROUP = 'owner' -- grupo reservado de luxu_admin con todos los permisos

local function decode(str)
    local ok, value = pcall(json.decode, str)
    return ok and value or nil
end

local function decodePermissions(raw)
    local ok, list = pcall(json.decode, raw or '[]')
    return ok and type(list) == 'table' and list or {}
end

---@param discordId string
---@param roles string[]
---@return { group: string, label: string, hierarchy: number, permissions: table<string, boolean>, isOwner: boolean } | nil
function Perms.resolve(discordId, roles)
    discordId = tostring(discordId or ''):gsub('^discord:', '')
    if not discordId:match('^%d+$') then return nil end

    local groups = {}

    local member = MySQL.single.await(
        'SELECT g.name, g.label, g.hierarchy, g.permissions FROM luxu_admin_group_members m JOIN luxu_admin_groups g ON g.name = m.`group` WHERE m.discord = ? OR m.discord = ? LIMIT 1',
        { discordId, 'discord:' .. discordId })
    if member then
        groups[1] = member
    elseif type(roles) == 'table' and #roles > 0 then
        local valid = {}
        for _, r in ipairs(roles) do
            r = tostring(r)
            if r:match('^%d+$') then valid[#valid + 1] = r end
        end
        if #valid > 0 then
            groups = MySQL.query.await(
                'SELECT name, label, hierarchy, permissions FROM luxu_admin_groups WHERE discord_role_id IN (?)', { valid }) or {}
        end
    end

    if #groups == 0 then return nil end

    -- En luxu_admin un número de jerarquía menor = más rango
    table.sort(groups, function(a, b) return a.hierarchy < b.hierarchy end)
    local top = groups[1]
    local result = {
        group = top.name,
        label = top.label or top.name,
        hierarchy = top.hierarchy,
        permissions = {},
        isOwner = false,
    }
    for _, g in ipairs(groups) do
        if g.name == OWNER_GROUP then result.isOwner = true end
        for _, p in ipairs(decodePermissions(g.permissions)) do
            result.permissions[p] = true
        end
    end
    return result
end

function Perms.has(staff, permission)
    return staff ~= nil and (staff.isOwner or staff.permissions[permission] == true)
end

-- Lista plana de permisos para enviar al panel web (para ocultar botones)
function Perms.list(staff)
    if staff.isOwner then
        local all = {}
        local raw = LoadResourceFile('luxu_admin', 'config/permissions.json')
        local cfg = raw and decode(raw)
        for _, section in pairs(cfg or {}) do
            if type(section) == 'table' then
                for id in pairs(section) do all[#all + 1] = id end
            end
        end
        return all
    end
    local list = {}
    for p in pairs(staff.permissions) do list[#list + 1] = p end
    table.sort(list)
    return list
end

-- Jerarquía: no se puede actuar sobre staff de rango igual o superior (como hierarchy_protection de luxu)
function Perms.canActOn(staff, targetSource)
    if staff.isOwner then return true end
    local targetGroup = Player(targetSource).state.luxu_admin_staff_group
    if not targetGroup then return true end
    if targetGroup == staff.group then return true end
    local row = MySQL.single.await('SELECT hierarchy FROM luxu_admin_groups WHERE name = ?', { targetGroup })
    return not row or staff.hierarchy < row.hierarchy
end
