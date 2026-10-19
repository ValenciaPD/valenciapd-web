function required(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Falta la variable de entorno: ${name}`)
  }

  return value
}

export const env = {
  discord: {
    clientId: required('DISCORD_CLIENT_ID'),
    clientSecret: required('DISCORD_CLIENT_SECRET'),
    redirectUri: required('DISCORD_REDIRECT_URI'),
    botToken: required('DISCORD_TOKEN'),
    guildId: required('GUILD_ID'),
    verifiedRoleId: required('VERIFIED_ROLE_ID'),
  },

  security: {
    sessionSecret: required('SESSION_SECRET'),
    multiaccountSalt: required('MULTIACCOUNT_SALT'),
    botApiSecret: required('BOT_API_SECRET'),
  },

  // Panel web integrado en luxu_admin (server/webadmin.js). Opcional: sin él, /admin muestra un aviso.
  fivem: {
    apiUrl: (process.env.FIVEM_API_URL || 'http://83.150.218.223:30004/luxu_admin').replace(/\/+$/, ''),
    apiSecret: process.env.FIVEM_API_SECRET || '',
  },

  publicUrl:
    process.env.VERIFICATION_URL ||
    'https://verificacion.valenciapd.es',
}
