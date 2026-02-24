import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  AlertCircle, 
  GraduationCap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineCardProps {
  type: 'class' | 'assignment' | 'library' | 'event';
  title: string;
  time: string;
  urgent?: boolean;
}

/**
 * UniCampus TimelineCard Component
 * Displaying chronological campus events with glassmorphism and neon accents.
 * Year: 2026
 */
export function TimelineCard({ type, title, time, urgent }: TimelineCardProps) {
  // Configuration mapping based on activity type
  const config = {
    class: {
      icon: GraduationCap,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      label: 'Lecture',
      glow: 'shadow-[0_0_15px_-3px_rgba(101,133,255,0.3)]',
    },
    assignment: {
      icon: BookOpen,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/20',
      label: 'Deadline',
      glow: 'shadow-[0_0_15px_-3px_rgba(255,101,101,0.3)]',
    },
    library: {
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      label: 'Library Due',
      glow: 'shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]',
    },
    event: {
      icon: Calendar,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      border: 'border-cyan-400/20',
      label: 'Campus Event',
      glow: 'shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)]',
    },
  };

  const { icon: Icon, color, bg, border, label, glow } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02, x: 4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        "relative group flex items-start gap-4 p-4 rounded-xl border backdrop-blur-xl transition-all",
        "bg-card/40 border-white/5",
        glow
      )}
    >
      {/* Vertical Indicator Line Accent */}
      <div className={cn("absolute left-0 top-4 bottom-4 w-1 rounded-r-full", bg.replace('/10', ''))} />

      {/* Icon Container */}
      <div className={cn("flex-shrink-0 p-3 rounded-lg border", bg, border, color)}>
        <Icon size={20} />
      </div>

      {/* Content Area */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", color)}>
            {label}
          </span>
          {urgent && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/20 border border-destructive/30 text-destructive text-[10px] font-bold"
            >
              <AlertCircle size={10} />
              URGENT
            </motion.div>
          )}
        </div>

        <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {title}
        </h4>

        <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
          <Clock size={12} />
          <span className="text-xs font-mono">{time}</span>
        </div>
      </div>

      {/* Subtle Background Glow on Hover */}
      <div className={cn(
        "absolute inset-0 -z-10 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl",
        bg
      )} />
    </motion.div>
  );
}
