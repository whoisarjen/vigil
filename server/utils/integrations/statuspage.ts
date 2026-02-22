import type { monitors } from '~~/server/db/schema'

type Monitor = typeof monitors.$inferSelect

interface CheckResult {
  status: string
  errorMessage: string | null
}

function mapStatusToComponent(status: string): string {
  switch (status) {
    case 'success': return 'operational'
    case 'failure': return 'degraded_performance'
    case 'timeout': return 'partial_outage'
    case 'error': return 'major_outage'
    default: return 'operational'
  }
}

export async function notifyStatuspage(monitor: Monitor, result: CheckResult) {
  if (!monitor.statuspageApiKey || !monitor.statuspagePageId || !monitor.statuspageComponentId) {
    return
  }

  const componentStatus = mapStatusToComponent(result.status)

  // Update component status
  await fetch(
    `https://api.statuspage.io/v1/pages/${monitor.statuspagePageId}/components/${monitor.statuspageComponentId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `OAuth ${monitor.statuspageApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        component: { status: componentStatus },
      }),
    },
  )

  // If failure, create an incident
  if (result.status !== 'success') {
    await fetch(
      `https://api.statuspage.io/v1/pages/${monitor.statuspagePageId}/incidents`,
      {
        method: 'POST',
        headers: {
          'Authorization': `OAuth ${monitor.statuspageApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incident: {
            name: `${monitor.name} — ${result.status}`,
            status: 'investigating',
            body: result.errorMessage || `Monitor check returned ${result.status}`,
            component_ids: [monitor.statuspageComponentId],
            components: {
              [monitor.statuspageComponentId]: componentStatus,
            },
          },
        }),
      },
    )
  }
}
