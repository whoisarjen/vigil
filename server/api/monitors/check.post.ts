export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  try {
    const result = await runAllChecks()
    return {
      success: true,
      checked: result.checked,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error('Manual check failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Check failed',
    })
  }
})
