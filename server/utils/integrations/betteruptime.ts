import type { monitors } from '~~/server/db/schema'

type Monitor = typeof monitors.$inferSelect

interface CheckResult {
  status: string
  errorMessage: string | null
}

export async function notifyBetteruptime(monitor: Monitor, result: CheckResult) {
  if (!monitor.betteruptimeHeartbeatUrl) return

  if (result.status === 'success') {
    // Send heartbeat ping on success
    await fetch(monitor.betteruptimeHeartbeatUrl, { method: 'GET' })
  } else {
    // Report failure
    const failUrl = monitor.betteruptimeHeartbeatUrl.replace(/\/?$/, '/fail')
    await fetch(failUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: result.errorMessage || `Check failed with status: ${result.status}`,
    })
  }
}
