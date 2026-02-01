'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { VerticalTemplate } from '@/lib/verticals';
import VerticalButton from './VerticalButton';
import { 
  LayoutGrid, 
  BarChart3, 
  FileText, 
  Zap, 
  ChevronRight,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Video,
  Eye,
  Edit3,
  Receipt,
  CheckSquare,
  UserPlus,
  AlertTriangle,
  LucideIcon
} from 'lucide-react';

interface DashboardPanelProps {
  vertical: VerticalTemplate
  onAction: (prompt: string) => void
  isOpen: boolean
}

const CARD_ICON_MAP: Record<string, LucideIcon> = {
  'briefcase': Briefcase,
  'clock': Clock,
  'dollar-sign': DollarSign,
  'file-text': FileText,
  'calendar': Calendar,
  'video': Video,
  'eye': Eye,
  'edit-3': Edit3,
  'receipt': Receipt,
  'check-square': CheckSquare,
  'user-plus': UserPlus,
  'alert-triangle': AlertTriangle,
  'bar-chart-3': BarChart3
};

export default function DashboardPanel({ vertical, onAction, isOpen }: DashboardPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          data-tutorial="dashboard-panel"
          className="h-full border-l border-separator bg-surface-primary flex flex-col flex-shrink-0 overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-separator flex items-center gap-2">
            <span className="text-xl">{vertical.icon}</span>
            <span className="font-semibold text-txt-primary text-[15px]">
              {vertical.name}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-hide">
            
            {/* Section 1 - Quick Actions */}
            <div data-tutorial="quick-actions" className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-txt-tertiary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-txt-tertiary">
                  Quick Actions
                </span>
              </div>
              
              <div className="space-y-2">
                {vertical.quickActions.length > 0 ? (
                  vertical.quickActions.map((action, index) => (
                    <VerticalButton
                      key={index}
                      label={action.label}
                      description={action.description}
                      icon={action.icon}
                      color={vertical.color}
                      onClick={() => onAction(action.prompt)}
                    />
                  ))
                ) : (
                  <div className="text-txt-quaternary text-sm italic px-1">
                    No actions configured
                  </div>
                )}
              </div>
            </div>

            {/* Section 2 - Business Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-txt-tertiary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-txt-tertiary">
                  Business Overview
                </span>
              </div>

              {vertical.dashboardCards.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {vertical.dashboardCards.map((card, index) => {
                    const CardIcon = CARD_ICON_MAP[card.icon] || BarChart3;
                    return (
                      <div 
                        key={index}
                        className="bg-surface-secondary rounded-xl p-4 border border-separator flex flex-col gap-2"
                      >
                        <CardIcon className="text-txt-tertiary w-4 h-4" />
                        <div>
                          <div className="text-2xl font-bold text-txt-primary">
                            —
                          </div>
                          <div className="text-xs text-txt-secondary truncate">
                            {card.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-txt-quaternary text-sm italic px-1">
                  No metrics configured
                </div>
              )}
            </div>

            {/* Section 3 - Saved Reports */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-txt-tertiary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-txt-tertiary">
                  Saved Reports
                </span>
              </div>

              <div className="space-y-1">
                {[
                  'Monthly Summary — Jan 2026',
                  'Client Report — Dec 2025',
                  'Annual Review — 2025'
                ].map((report, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer group"
                  >
                    <FileText className="w-4 h-4 text-txt-tertiary" />
                    <span className="text-sm text-txt-secondary flex-1 truncate">
                      {report}
                    </span>
                    <ChevronRight className="w-4 h-4 text-txt-quaternary group-hover:text-txt-secondary transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
