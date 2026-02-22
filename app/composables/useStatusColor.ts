export function useStatusColor() {
  // Monitor status -> badge variant
  function statusVariant(status: string | null): 'success' | 'warning' | 'danger' | 'default' {
    switch (status) {
      case 'success': return 'success'
      case 'timeout': return 'warning'
      case 'failure':
      case 'error': return 'danger'
      default: return 'default'
    }
  }

  // Monitor status -> dot color class
  function statusDotColor(status: string | null): string {
    switch (status) {
      case 'success': return 'bg-success'
      case 'timeout': return 'bg-warning'
      case 'failure':
      case 'error': return 'bg-danger'
      default: return 'bg-foreground-subtle'
    }
  }

  // Monitor status -> human label
  function statusLabel(status: string | null): string {
    switch (status) {
      case 'success': return 'Operational'
      case 'timeout': return 'Degraded'
      case 'failure':
      case 'error': return 'Down'
      default: return 'Unknown'
    }
  }

  // Monitor status -> text color class
  function statusTextColor(status: string | null): string {
    switch (status) {
      case 'success': return 'text-success'
      case 'timeout': return 'text-warning'
      case 'failure':
      case 'error': return 'text-danger'
      default: return 'text-foreground-subtle'
    }
  }

  // Incident status -> badge variant
  function incidentStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'accent' | 'default' {
    switch (status) {
      case 'resolved': return 'success'
      case 'monitoring': return 'accent'
      case 'identified': return 'warning'
      case 'investigating': return 'danger'
      default: return 'default'
    }
  }

  // Incident impact -> badge variant
  function incidentImpactVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
    switch (status) {
      case 'none': return 'default'
      case 'minor': return 'warning'
      case 'major':
      case 'critical': return 'danger'
      default: return 'default'
    }
  }

  // Uptime percentage -> color class
  function uptimeColor(pct: number | null): string {
    if (pct === null) return 'text-foreground-subtle'
    if (pct >= 99) return 'text-success'
    if (pct >= 95) return 'text-warning'
    return 'text-danger'
  }

  // Format relative time (e.g., "2 hours ago")
  function timeAgo(date: string | Date): string {
    const now = Date.now()
    const d = new Date(date).getTime()
    const diff = now - d
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  return {
    statusVariant,
    statusDotColor,
    statusLabel,
    statusTextColor,
    incidentStatusVariant,
    incidentImpactVariant,
    uptimeColor,
    timeAgo,
  }
}
