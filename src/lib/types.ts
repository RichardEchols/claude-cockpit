export interface Project {
  name: string
  path: string
  icon: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  toolCalls?: ToolCall[]
  isStreaming?: boolean
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output?: string
  status: 'pending' | 'running' | 'complete' | 'error'
}

export interface Session {
  id: string
  title: string
  project: string
  projectPath: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export interface QuickAction {
  label: string
  icon: string
  prompt: string
}

export type ViewMode = 'chat' | 'terminal'

export interface StreamEvent {
  type: 'system' | 'assistant' | 'user' | 'result' | 'stream_event'
  [key: string]: unknown
}

export interface AppSettings {
  pin: string
  defaultProject: string
  defaultView: ViewMode
  skipPermissions: boolean
  model: string
}
