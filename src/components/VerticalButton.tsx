'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Clock, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Calendar, 
  PenTool, 
  Image, 
  TrendingUp, 
  Subtitles, 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Users, 
  Package, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Video, 
  CheckSquare, 
  UserPlus, 
  Rocket,
  LucideIcon
} from 'lucide-react';

interface VerticalButtonProps {
  label: string
  description: string
  icon: string      // lucide-react icon name in kebab-case
  color: string     // hex color
  onClick: () => void
  disabled?: boolean
}

const ICON_MAP: Record<string, LucideIcon> = {
  'briefcase': Briefcase,
  'clock': Clock,
  'file-text': FileText,
  'dollar-sign': DollarSign,
  'bar-chart-3': BarChart3,
  'calendar': Calendar,
  'pen-tool': PenTool,
  'image': Image,
  'trending-up': TrendingUp,
  'subtitles': Subtitles,
  'layout-dashboard': LayoutDashboard,
  'receipt': Receipt,
  'wallet': Wallet,
  'users': Users,
  'package': Package,
  'alert-triangle': AlertTriangle,
  'eye': Eye,
  'edit-3': Edit3,
  'video': Video,
  'check-square': CheckSquare,
  'user-plus': UserPlus,
  'rocket': Rocket
};

export default function VerticalButton({ 
  label, 
  description, 
  icon, 
  color, 
  onClick, 
  disabled 
}: VerticalButtonProps) {
  const IconComponent = ICON_MAP[icon] || Rocket;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-4 rounded-xl flex items-center gap-3 text-left border ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
      style={{ 
        backgroundColor: `${color}10`, // 10% opacity
        borderColor: `${color}4D`      // 30% opacity
      }}
      whileHover={!disabled ? { scale: 1.01, backgroundColor: `${color}1A` } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        <IconComponent className="text-white w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-txt-primary truncate">
          {label}
        </div>
        <div className="text-xs text-txt-secondary truncate">
          {description}
        </div>
      </div>
    </motion.button>
  );
}
