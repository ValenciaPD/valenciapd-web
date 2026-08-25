export class FFraudError extends Error {
  readonly status: number
  readonly errorCode?: number

  constructor(message: string, status = 500, errorCode?: number) {
    super(message)
    this.name = 'FFraudError'
    this.status = status
    this.errorCode = errorCode
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
  error_code?: number
  error?: string
}

export async function checkIp(ip: string): Promise<FFraudResult> {
  const response = await fetch(
    `https://api.ffraud.com/public/ip/${encodeURIComponent(ip)}`,
    {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    },
  )

  const data = await response.json().catch(() => ({})) as FFraudResult

  if (!response.ok || data.success === false) {
    throw new FFraudError(
      data.message || data.error || `FFraud HTTP ${response.status}`,
      response.status,
      data.error_code,
    )
  }

  return data
}
