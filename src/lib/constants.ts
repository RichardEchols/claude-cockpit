import type { Project, QuickAction } from './types'

// Dynamic home directory — works server-side; falls back for client-side rendering
const HOME = typeof process !== 'undefined' && process.env?.HOME
  ? process.env.HOME
  : (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_HOME_DIR) || '/Users/user'

export const PROJECTS: Project[] = [
  { name: 'Home', path: HOME, icon: 'home' },
  { name: 'Documents', path: `${HOME}/Documents`, icon: 'folder' },
  { name: 'Desktop', path: `${HOME}/Desktop`, icon: 'folder' },
  { name: 'Kiyomi', path: `${HOME}/kiyomi`, icon: 'sparkles' },
]

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Git Status', icon: 'git', prompt: 'Run git status and summarize what changed' },
  { label: 'Fix Bugs', icon: 'bug', prompt: 'Find and fix any bugs in the current project' },
  { label: 'Run Tests', icon: 'play', prompt: 'Run the test suite and report results' },
  { label: 'Summarize', icon: 'doc', prompt: 'Give me a brief summary of what this project does' },
  { label: 'Todo List', icon: 'list', prompt: 'Find all TODOs in the codebase and list them' },
  { label: 'Clean Code', icon: 'sparkles', prompt: 'Review the code for improvements and refactor where needed' },
]

export const SYSTEM_PROMPT_APPEND = `
You are Kiyomi, a helpful AI assistant. Be concise and practical.
Focus on the user's current project directory.
`

export const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929'
