import type { ChatMessage } from 'chatgpt'

export interface RequestOptions {
  message: string
  lastContext?: { conversationId?: string; parentMessageId?: string }
  process?: (chat: ChatMessage) => void
  abortSignal?: AbortSignal
  systemMessage?: string
  temperature?: number
  topP?: number
}
