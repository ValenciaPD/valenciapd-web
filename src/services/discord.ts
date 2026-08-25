export async function getGuildMember(
  userId: string,
): Promise<boolean> {
  const response =
    await fetch(
      `${DISCORD_API}/guilds/${env.discord.guildId}/members/${userId}`,
      {
        headers: {
          Authorization:
            `Bot ${env.discord.botToken}`,
        },
      },
    )

  return response.ok
}
