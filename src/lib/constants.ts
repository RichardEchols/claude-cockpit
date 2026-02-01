import type { Project, QuickAction } from './types'

export const PROJECTS: Project[] = [
  { name: 'Claude Cockpit', path: '/Users/richardechols/Apps/claude-cockpit', icon: 'terminal' },
  { name: 'Nano Banana Studio', path: '/Users/richardechols/Apps/nano-banana-studio', icon: 'palette' },
  { name: 'ScribbleStokes Remotion', path: '/Users/richardechols/Apps/scribblestokes-remotion', icon: 'video' },
  { name: 'Premier Intelligence', path: '/Users/richardechols/Desktop/Work/premier-intelligence-assistant', icon: 'brain' },
  { name: 'JW Companion', path: '/Users/richardechols/Apps/jw-companion', icon: 'book' },
  { name: 'HealthQuest', path: '/Users/richardechols/Apps/HealthQuest', icon: 'heart' },
  { name: 'YT Automation', path: '/Users/richardechols/Apps/YTAutomation', icon: 'play' },
]

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Deploy', icon: 'rocket', prompt: 'Run npm run build, fix any errors, then deploy with vercel --prod --force' },
  { label: 'Git Status', icon: 'git-branch', prompt: 'Show me the git status and recent commits' },
  { label: 'Run Dev', icon: 'play', prompt: 'Start the dev server with npm run dev' },
  { label: 'Fix Bugs', icon: 'bug', prompt: 'Check for any bugs or errors in the codebase and fix them' },
  { label: 'Load Alex', icon: 'user', prompt: 'Read /Users/richardechols/Apps/claude-skills/employees/SALES_CONSULTANT.md and act as Alex for this session' },
  { label: 'Load Jordan', icon: 'user', prompt: 'Read /Users/richardechols/Apps/claude-skills/employees/SOLUTIONS_ARCHITECT.md and act as Jordan for this session' },
  { label: 'Load Sam', icon: 'user', prompt: 'Read /Users/richardechols/Apps/claude-skills/employees/PROJECT_MANAGER.md and act as Sam for this session' },
  { label: 'Make Video', icon: 'video', prompt: 'Read /Users/richardechols/Apps/claude-skills/REMOTION_VIDEO_SKILL.md and help me create a new video' },
]

export const SYSTEM_PROMPT_APPEND = `
You are running inside Claude Cockpit, Richard Echols' personal AI development interface.
Read and follow /Users/richardechols/CLAUDE.md for all instructions.
Read /Users/richardechols/Apps/claude-skills/MASTER_SKILL.md for environment setup.
Be autonomous. Build fast. Don't ask unnecessary questions.
`

export const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929'
