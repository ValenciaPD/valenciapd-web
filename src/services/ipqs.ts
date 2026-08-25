import { env } from '../config/env.js'

export interface IPQSResult {
  success: boolean
  proxy?: boolean
  vpn?: boolean
  tor?: boolean
  active_vpn?: boolean
  active_tor?: boolean
  fraud_score?: number
  recent_abuse?: boolean
  frequent_abuser?: boolean
  high_risk_attacks?: boolean
  bot_status?: boolean
  shared_connection?: boolean
  dynamic_connection?: boolean
  trusted_network?: boolean
  country_code?: string
  connection_type?: string
  message?: string
  errors?: string[]
}

export async function checkIP(
  ip: string,
  userAgent?: string,
  language?: string,
): Promise<IPQSResult> {

  const url = new URL(
    `https://www.ipqualityscore.com/api/json/ip/${env.ipqs.apiKey}/${encodeURIComponent(ip)}`
  )

  url.searchParams.set(
    'strictness',
    '1',
  )

  url.searchParams.set(
    'allow_public_access_points',
    'true',
  )

  if (userAgent) {
    url.searchParams.set(
      'user_agent',
      userAgent,
    )
  }

  if (language) {
    url.searchParams.set(
      'user_language',
      language,
    )
  }

  const response = await fetch(
    url.toString(),
  )

  if (!response.ok) {
    throw new Error(
      `IPQS HTTP ${response.status}`,
    )
  }

  const data =
    (await response.json()) as IPQSResult

  if (!data.success) {
    throw new Error(
      data.message ||
        'IPQS request failed',
    )
  }

  return data
}
