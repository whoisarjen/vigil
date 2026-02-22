export default defineEventHandler(async (event) => {
  // Verify CRON_SECRET
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')

  if (authHeader !== `Bearer ${config.cronSecret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    const result = await runAllChecks()
    return {
      success: true,
      checked: result.checked,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error('Cron check failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Cron check failed',
    })
  }
})
