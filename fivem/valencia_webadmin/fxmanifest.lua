fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'valencia_webadmin'
description 'Puente HTTP entre luxu_admin y el panel web valenciapd.es/admin'
author 'Valencia PD'
version '1.0.0'

dependencies {
    'oxmysql',
    'es_extended',
    'luxu_admin',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/permissions.lua',
    'server/actions.lua',
    'server/http.lua',
    'server/http.js',
}
