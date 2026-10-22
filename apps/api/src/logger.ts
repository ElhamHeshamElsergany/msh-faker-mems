const REDACTED = new Set(['authorization', 'apikey', 'apiKey', 'openaiApiKey', 'serviceRoleKey', 'password', 'token'])

export function log(level: 'info' | 'warn' | 'error', message: string, fields: Record<string, unknown> = {}): void {
  const safe: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields)) {
    safe[key] = REDACTED.has(key) ? '[redacted]' : value
  }
  const line = JSON.stringify({ time: new Date().toISOString(), level, message, ...safe })
  if (level === 'error') console.error(line)
  else console.log(line)
}
