import { mlApi } from '@/services/mlApi'
import type { ChatResponse } from '@/types/api'

export function sendChatMessage(message: string) {
  return mlApi.post<ChatResponse>('/chat', { message }).then((r) => r.data)
}
