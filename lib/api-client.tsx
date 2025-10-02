"use client"

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message)
    this.name = "APIError"
  }
}

export interface APIRequestOptions extends RequestInit {
  timeout?: number
}

export async function apiRequest<T>(url: string, options: APIRequestOptions = {}): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(errorData.message || `HTTP Error: ${response.status}`, response.status, errorData)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof APIError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new APIError("Request timeout", 408)
      }
      throw new APIError(error.message, 0)
    }

    throw new APIError("Unknown error occurred", 0)
  }
}

// Convenience methods
export const api = {
  get: (url: string, options?: APIRequestOptions) => apiRequest(url, { ...options, method: "GET" }),

  post: (url: string, data?: any, options?: APIRequestOptions) =>
    apiRequest(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (url: string, data?: any, options?: APIRequestOptions) =>
    apiRequest(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (url: string, options?: APIRequestOptions) => apiRequest(url, { ...options, method: "DELETE" }),
}

// Example usage in a component:
/*
import { api } from '@/lib/api-client'
import { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

function MyComponent() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await api.get('/api/outfits')
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {error && <div>Error: {error}</div>}
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  )
}
*/
