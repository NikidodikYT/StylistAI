"use client"

import { useState, useEffect, useCallback } from "react"

export interface UseAsyncState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(immediate)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { data, isLoading, error, refetch: execute }
}

// Example usage:
/*
import { useAsync } from '@/hooks/use-async'
import { api } from '@/lib/api-client'

function OutfitsList() {
  const { data, isLoading, error, refetch } = useAsync(
    () => api.get('/api/outfits'),
    true
  )

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null

  return (
    <div>
      {data.map(outfit => (
        <OutfitCard key={outfit.id} outfit={outfit} />
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
*/
