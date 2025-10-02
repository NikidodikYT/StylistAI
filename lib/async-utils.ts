"use client"

export async function simulateAsyncOperation<T>(operation: () => T | Promise<T>, minDelay = 500): Promise<T> {
  const startTime = Date.now()
  const result = await Promise.resolve(operation())
  const elapsed = Date.now() - startTime

  if (elapsed < minDelay) {
    await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed))
  }

  return result
}

export function useAsyncData<T>(
  fetchFn: () => T | Promise<T>,
  deps: any[] = [],
): { data: T | null; isLoading: boolean; error: Error | null } {
  const [data, setData] = React.useState<T | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await simulateAsyncOperation(fetchFn)
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, deps)

  return { data, isLoading, error }
}

// For use in components
import React from "react"
