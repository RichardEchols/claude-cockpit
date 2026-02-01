

// Interfaces
export interface VerticalQuickAction {
  label: string
  prompt: string
  icon: string // lucide-react icon name in kebab-case
  description: string
}

export interface DashboardCard {
  label: string
  type: 'count' | 'sum' | 'list'
  source: string // path to memory data source
  icon: string // lucide-react icon name
}

export interface VerticalTemplate {
  id: string
  name: string
  icon: string // emoji
  color: string // hex color
  quickActions: VerticalQuickAction[]
  dashboardCards: DashboardCard[]
}

// Templates Data
export const VERTICALS: VerticalTemplate[] = [
  {
    id: 'lawyer',
    name: 'Legal Assistant',
    icon: '⚖️',
    color: '#3B82F6',
    quickActions: [
      {
        label: 'Case Overview',
        prompt: 'Show me all my active cases with status updates',
        icon: 'briefcase',
        description: 'View all active cases'
      },
      {
        label: 'SOL Deadlines',
        prompt: 'Show statute of limitations deadlines this month',
        icon: 'clock',
        description: 'Upcoming filing deadlines'
      },
      {
        label: 'Draft Demand Letter',
        prompt: 'Help me draft a demand letter for a new case',
        icon: 'file-text',
        description: 'Generate legal documents'
      },
      {
        label: 'Billing Summary',
        prompt: 'Show my billing summary and outstanding invoices',
        icon: 'dollar-sign',
        description: 'Revenue and billing overview'
      },
      {
        label: 'Monthly Report',
        prompt: 'Generate my monthly case activity report',
        icon: 'bar-chart-3',
        description: 'Comprehensive monthly summary'
      }
    ],
    dashboardCards: [
      {
        label: 'Active Cases',
        type: 'count',
        source: 'memory/cases/active.json',
        icon: 'briefcase'
      },
      {
        label: 'SOL This Month',
        type: 'count',
        source: 'memory/deadlines/sol.json',
        icon: 'alert-triangle'
      },
      {
        label: 'Revenue MTD',
        type: 'sum',
        source: 'memory/billing/current.json',
        icon: 'dollar-sign'
      },
      {
        label: 'Pending Documents',
        type: 'count',
        source: 'memory/documents/pending.json',
        icon: 'file-text'
      }
    ]
  },
  {
    id: 'content-creator',
    name: 'Content Studio',
    icon: '🎬',
    color: '#8B5CF6',
    quickActions: [
      {
        label: 'Content Calendar',
        prompt: 'Show my content calendar for this week',
        icon: 'calendar',
        description: 'View scheduled content'
      },
      {
        label: 'Script Writer',
        prompt: 'Help me write a script for my next video',
        icon: 'pen-tool',
        description: 'AI-assisted scriptwriting'
      },
      {
        label: 'Thumbnail Ideas',
        prompt: 'Generate thumbnail concepts for my latest video',
        icon: 'image',
        description: 'Creative thumbnail suggestions'
      },
      {
        label: 'Analytics Review',
        prompt: 'Show my channel analytics and growth metrics',
        icon: 'trending-up',
        description: 'Performance dashboard'
      },
      {
        label: 'Batch Captions',
        prompt: 'Generate captions and descriptions for my recent uploads',
        icon: 'subtitles',
        description: 'Bulk caption generation'
      }
    ],
    dashboardCards: [
      {
        label: 'Scheduled Posts',
        type: 'count',
        source: 'memory/content/scheduled.json',
        icon: 'calendar'
      },
      {
        label: 'Videos This Month',
        type: 'count',
        source: 'memory/content/published.json',
        icon: 'video'
      },
      {
        label: 'Total Views MTD',
        type: 'sum',
        source: 'memory/analytics/views.json',
        icon: 'eye'
      },
      {
        label: 'Drafts in Progress',
        type: 'count',
        source: 'memory/content/drafts.json',
        icon: 'edit-3'
      }
    ]
  },
  {
    id: 'small-business',
    name: 'Business Manager',
    icon: '🏪',
    color: '#10B981',
    quickActions: [
      {
        label: 'Daily Summary',
        prompt: 'Give me today\'s business summary - sales, tasks, and priorities',
        icon: 'layout-dashboard',
        description: 'Overview of today\'s business'
      },
      {
        label: 'Invoice Generator',
        prompt: 'Help me create a new invoice for a client',
        icon: 'receipt',
        description: 'Generate professional invoices'
      },
      {
        label: 'Expense Tracker',
        prompt: 'Log and categorize my recent business expenses',
        icon: 'wallet',
        description: 'Track and categorize expenses'
      },
      {
        label: 'Client Follow-ups',
        prompt: 'Show clients that need follow-up this week',
        icon: 'users',
        description: 'Pending client communications'
      },
      {
        label: 'Inventory Check',
        prompt: 'Check current inventory levels and reorder alerts',
        icon: 'package',
        description: 'Stock and supply status'
      }
    ],
    dashboardCards: [
      {
        label: 'Revenue Today',
        type: 'sum',
        source: 'memory/sales/today.json',
        icon: 'dollar-sign'
      },
      {
        label: 'Open Invoices',
        type: 'count',
        source: 'memory/invoices/open.json',
        icon: 'receipt'
      },
      {
        label: 'Tasks Due',
        type: 'count',
        source: 'memory/tasks/due.json',
        icon: 'check-square'
      },
      {
        label: 'New Clients',
        type: 'count',
        source: 'memory/clients/new.json',
        icon: 'user-plus'
      }
    ]
  },
  {
    id: 'custom',
    name: 'Custom Assistant',
    icon: '✨',
    color: '#6366F1',
    quickActions: [],
    dashboardCards: []
  }
];

// Helper
export function getVertical(id: string): VerticalTemplate {
  return VERTICALS.find(v => v.id === id) || VERTICALS.find(v => v.id === 'custom')!;
}
