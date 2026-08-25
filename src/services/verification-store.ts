import { list, put } from '@vercel/blob'

export interface VerificationRecord {
  discordId: string
  username: string
  ipHash: string
  verifiedAt: string
}

interface UsedTicket {
  nonce: string
  discordId: string
  usedAt: string
}

const MEMBERS_FILE =
  'verification-data/members.json'

const USED_TICKETS_FILE =
  'verification-data/used-tickets.json'

async function readBlobJson<T>(
  pathname: string,
  fallback: T,
): Promise<T> {
  const { blobs } = await list({
    prefix: pathname,
  })

  const blob = blobs.find(
    item => item.pathname === pathname,
  )

  if (!blob) {
    return fallback
  }

  const response =
    await fetch(blob.url)

  if (!response.ok) {
    return fallback
  }

  try {
    return await response.json() as T
  } catch {
    return fallback
  }
}

async function writeBlobJson<T>(
  pathname: string,
  data: T,
): Promise<void> {
  await put(
    pathname,
    JSON.stringify(
      data,
      null,
      2,
    ),
    {
      access: 'public',
      contentType:
        'application/json',
      addRandomSuffix: false,
    },
  )
}

// -----------------------------------------------------
// VERIFIED MEMBERS
// -----------------------------------------------------

async function getRecords(): Promise<
  VerificationRecord[]
> {
  return readBlobJson(
    MEMBERS_FILE,
    [],
  )
}

export async function findByDiscordId(
  discordId: string,
): Promise<VerificationRecord | null> {
  const records =
    await getRecords()

  return (
    records.find(
      record =>
        record.discordId ===
        discordId,
    ) || null
  )
}

export async function findByIpHash(
  ipHash: string,
): Promise<VerificationRecord | null> {
  const records =
    await getRecords()

  return (
    records.find(
      record =>
        record.ipHash ===
        ipHash,
    ) || null
  )
}

export async function saveVerification(
  record: VerificationRecord,
): Promise<void> {
  const records =
    await getRecords()

  const existingIndex =
    records.findIndex(
      item =>
        item.discordId ===
        record.discordId,
    )

  if (existingIndex >= 0) {
    records[existingIndex] =
      record
  } else {
    records.push(record)
  }

  await writeBlobJson(
    MEMBERS_FILE,
    records,
  )
}

// -----------------------------------------------------
// USED VERIFICATION TICKETS
// -----------------------------------------------------

async function getUsedTickets(): Promise<
  UsedTicket[]
> {
  return readBlobJson(
    USED_TICKETS_FILE,
    [],
  )
}

export async function isTicketUsed(
  nonce: string,
): Promise<boolean> {
  const tickets =
    await getUsedTickets()

  return tickets.some(
    ticket =>
      ticket.nonce === nonce,
  )
}

export async function markTicketUsed(
  ticket: UsedTicket,
): Promise<void> {
  const tickets =
    await getUsedTickets()

  if (
    tickets.some(
      item =>
        item.nonce === ticket.nonce,
    )
  ) {
    return
  }

  tickets.push(ticket)

  await writeBlobJson(
    USED_TICKETS_FILE,
    tickets,
  )
}
