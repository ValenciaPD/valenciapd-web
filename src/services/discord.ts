import { env } from '../config/env.js'

const DISCORD_API =
  'https://discord.com/api/v10'

export interface DiscordUser {
  id: string
  username: string
  global_name?: string | null
  avatar?: string | null
}

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

export function getDiscordOAuthUrl(
  state: string,
): string {

  const params =
    new URLSearchParams({
      response_type: 'code',
      client_id:
        env.discord.clientId,
      scope:
        'identify guilds.join',
      state,
      redirect_uri:
        env.discord.redirectUri,
      prompt: 'consent',
    })

  return (
    `https://discord.com/oauth2/authorize?${params.toString()}`
  )
}

export async function exchangeCode(
  code: string,
): Promise<TokenResponse> {

  const body =
    new URLSearchParams({
      client_id:
        env.discord.clientId,

      client_secret:
        env.discord.clientSecret,

      grant_type:
        'authorization_code',

      code,

      redirect_uri:
        env.discord.redirectUri,
    })

  const response =
    await fetch(
      `${DISCORD_API}/oauth2/token`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },

        body,
      },
    )

  if (!response.ok) {
    const text =
      await response.text()

    throw new Error(
      `Discord token exchange failed: ${text}`,
    )
  }

  return response.json()
}

export async function getDiscordUser(
  accessToken: string,
): Promise<DiscordUser> {

  const response =
    await fetch(
      `${DISCORD_API}/users/@me`,
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    )

  if (!response.ok) {
    throw new Error(
      'Could not retrieve Discord user',
    )
  }

  return response.json()
}

export async function addUserToGuild(
  accessToken: string,
  userId: string,
): Promise<void> {

  const url =
    `${DISCORD_API}/guilds/${env.discord.guildId}/members/${userId}`

  const response =
    await fetch(url, {
      method: 'PUT',

      headers: {
        Authorization:
          `Bot ${env.discord.botToken}`,

        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        access_token:
          accessToken,
      }),
    })

  if (
    !response.ok &&
    response.status !== 204
  ) {

    const text =
      await response.text()

    throw new Error(
      `Could not add member to guild: ${text}`,
    )
  }
}

export async function addVerifiedRole(
  userId: string,
): Promise<void> {

  const url =
    `${DISCORD_API}/guilds/${env.discord.guildId}/members/${userId}/roles/${env.discord.verifiedRoleId}`

  const response =
    await fetch(url, {
      method: 'PUT',

      headers: {
        Authorization:
          `Bot ${env.discord.botToken}`,
      },
    })

  if (
    !response.ok &&
    response.status !== 204
  ) {

    const text =
      await response.text()

    throw new Error(
      `Could not assign verified role: ${text}`,
    )
  }
}
