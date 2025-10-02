# Async Patterns and Best Practices

This document outlines the async/await patterns and best practices used in the StylistAI frontend.

## API Client Usage

The `api-client.ts` utility provides a clean interface for making HTTP requests:

\`\`\`typescript
import { api } from '@/lib/api-client'

// GET request
const outfits = await api.get('/api/outfits')

// POST request
const newOutfit = await api.post('/api/outfits', {
  name: 'Summer Look',
  style: 'Casual'
})

// With error handling
try {
  const data = await api.get('/api/outfits')
  console.log(data)
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error ${error.status}:`, error.message)
  }
}
\`\`\`

## React Hook for Async Operations

Use the `useAsync` hook for component-level async operations:

\`\`\`typescript
import { useAsync } from '@/hooks/use-async'

function MyComponent() {
  const { data, isLoading, error, refetch } = useAsync(
    () => api.get('/api/outfits'),
    true // immediate execution
  )

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return <OutfitsList outfits={data} onRefresh={refetch} />
}
\`\`\`

## Loading States

Always show loading indicators during async operations:

\`\`\`typescript
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await api.post('/api/outfits', formData)
  } finally {
    setIsLoading(false)
  }
}

return (
  <Button disabled={isLoading}>
    {isLoading ? <LoadingSpinner size="sm" /> : 'Submit'}
  </Button>
)
\`\`\`

## Error Handling

Always handle errors gracefully:

\`\`\`typescript
try {
  const result = await api.get('/api/outfits')
  setData(result)
} catch (error) {
  if (error instanceof APIError) {
    // Handle API errors
    toast.error(error.message)
  } else {
    // Handle network errors
    toast.error('Network error occurred')
  }
}
\`\`\`

## Best Practices

1. **Always use try/catch** for async operations
2. **Show loading states** to improve UX
3. **Handle errors gracefully** with user-friendly messages
4. **Use AbortController** for cancellable requests
5. **Implement timeouts** to prevent hanging requests
6. **Clean up effects** to prevent memory leaks
7. **Use TypeScript** for type safety
8. **Log errors** for debugging (with [v0] prefix)
