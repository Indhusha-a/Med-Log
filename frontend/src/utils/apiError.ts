import axios from 'axios'
import type { ApiErrorShape } from '@/types/api'

// FastAPI's default error body is {"detail": "..."} for a plain
// HTTPException, or {"detail": [{..., "msg": "..."}]} for a Pydantic
// validation error. Both get flattened to one readable string here, so
// no page has to know which shape it's looking at.
export function toApiError(err: unknown): ApiErrorShape {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? null
    const detail = err.response?.data?.detail

    if (typeof detail === 'string') {
      return { status, message: detail }
    }
    if (Array.isArray(detail)) {
      const message = detail
        .map((d: { msg?: string }) => d.msg)
        .filter(Boolean)
        .join('; ')
      return { status, message: message || 'Request was rejected.' }
    }
    if (err.code === 'ECONNABORTED') {
      return { status: null, message: 'The request timed out. Please try again.' }
    }
    if (!err.response) {
      return { status: null, message: 'Could not reach the server. Is it running?' }
    }
    return { status, message: 'Something went wrong. Please try again.' }
  }
  return { status: null, message: 'Something went wrong. Please try again.' }
}
