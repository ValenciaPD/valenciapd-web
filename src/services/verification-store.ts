import { list, put } from '@vercel/blob'

export interface VerificationRecord {
  discordId: string
  username: string
  ipHash: string
  verifiedAt: string
}

const FILE_NAME =
  'verification-data/members.json'

async function getRecords(): Promise<
  VerificationRecord[]
> {
  const { blobs } = await list({
    prefix: FILE_NAME,
  })

  const blob = blobs.find(
    item => item.pathname === FILE_NAME,
  )

  if (!blob) {
    return []
  }

  const response =
    await fetch(blob.url)

  if (!response.ok) {
    return []
  }

  try {
    const data =
      await response.json()

    if (!Array.isArray(data)) {
      return []
    }

    return data
  } catch {
    return []
  }
}

async function saveRecords(
  records: VerificationRecord[],
): Promise<void> {

  await put(
    FILE_NAME,
    JSON.stringify(
      records,
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

  await saveRecords(records)
}
