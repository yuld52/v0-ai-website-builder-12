export function useAnalytics() {
  const track = async (event: string, properties?: Record<string, any>) => {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, properties }),
      })
    } catch (err) {
      console.error("Analytics error:", err)
    }
  }

  return { track }
}
