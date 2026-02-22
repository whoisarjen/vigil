import type { MonitorWithLatest } from '~~/shared/types'

export function useMonitors() {
  const { data, refresh, pending, error } = useFetch<MonitorWithLatest[]>('/api/monitors', {
    default: () => [],
  })

  return {
    monitors: data,
    refresh,
    loading: pending,
    error,
  }
}
