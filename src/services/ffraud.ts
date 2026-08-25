export class FFraudError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FFraudError'
  }
}

export interface FFraudResult {
  success: boolean
  ip?: string
  fraud_score?: number
  risk?: 'none' | 'low' | 'medium' | 'high' | 'critical' | string
  reason?: string
  vpn?: boolean
  proxy?: boolean
  tor?: boolean
  relay?: boolean
  hosting?: boolean
  mobile?: boolean
  is_abuser?: boolean
  recent_abuse?: boolean
  connection_type?: string
  is_residential_proxy?: boolean
  confidence?: 'high' | 'medium' | 'low' | string
  vpn_provider?: string
  cloud_provider?: string
  threat_tags?: string[]
  message?: string
}

export async function checkIp(
  ip: string,
): Promise<FFraudResult> {
  const response = await fetch(
    `https://api.ffraud.com/public/ip/${encodeURIComponent(ip)}`,
    {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    },
  )

  const data = await response.json() as FFraudResult

  if (!response.ok || data.success === false) {
    throw new FFraudError(
      data.message ||
      `FFraud HTTP ${response.status}`,
    )
  }

  return data
}
