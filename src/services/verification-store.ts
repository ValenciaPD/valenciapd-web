import { list, put } from '@vercel/blob'

export interface VerificationRecord {
  discordId: string
  username: string
  ipHash: string
  verifiedAt: string
}

export interface UsedTicket {
  nonce: string
  discordId: string
  usedAt: string
}

const MEMBERS_FILE = 'verification-data/members.json'
const USED_TICKETS_FILE = 'verification-data/used-tickets.json'

async function readJson<T>(
  pathname: string,
  fallback: T,
): Promise<T> {
  const { blobs } = await list({ prefix: pathname })

  const blob = blobs.find(
    item => item.pathname === pathname,
  )

  if (!blob) {
    return fallback
  }

  const response = await fetch(blob.url)

  if (!response.ok) {
    return fallback
  }

  try {
    return await response.json() as T
  } catch {
    return fallback
  }
}

async function writeJson<T>(
  pathname: string,
  data: T,
): Promise<void> {
  await put(
    pathname,
    JSON.stringify(data, null, 2),
    {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    },
  )
}

async function getMembers(): Promise<VerificationRecord[]> {
  return readJson(MEMBERS_FILE, [])
}

export async function findByDiscordId(
  discordId: string,
): Promise<VerificationRecord | null> {
  const members = await getMembers()
  return members.find(
    member => member.discordId === discordId,
  ) || null
}

export async function findByIpHash(
  ipHash: string,
): Promise<VerificationRecord | null> {
  const members = await getMembers()
  return members.find(
    member => member.ipHash === ipHash,
  ) || null
}

export async function saveVerification(
  record: VerificationRecord,
): Promise<void> {
  const members = await getMembers()

  const index = members.findIndex(
    member => member.discordId === record.discordId,
  )

  if (index >= 0) {
    members[index] = record
  } else {
    members.push(record)
  }

  await writeJson(MEMBERS_FILE, members)
}

async function getUsedTickets(): Promise<UsedTicket[]> {
  return readJson(USED_TICKETS_FILE, [])
}

export async function isTicketUsed(
  nonce: string,
): Promise<boolean> {
  const tickets = await getUsedTickets()
  return tickets.some(
    ticket => ticket.nonce === nonce,
  )
}

export async function markTicketUsed(
  ticket: UsedTicket,
): Promise<void> {
  const tickets = await getUsedTickets()

  if (
    tickets.some(
      item => item.nonce === ticket.nonce,
    )
  ) {
    return
  }

  tickets.push(ticket)
  await writeJson(USED_TICKETS_FILE, tickets)
}
