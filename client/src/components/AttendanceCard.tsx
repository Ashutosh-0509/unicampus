import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AttendanceCardProps {
  subject: string;
  percentage: number;
  attended: number;
  total: number;
}

/**
 * AttendanceCard Component
 * Features glassmorphism, animated circular progress, and role-based color coding.
 * Year: 2026
 */
export function AttendanceCard({ subject, percentage, attended, total }: AttendanceCardProps) {
  const isLow = percentage < 75;
  const isWarning = percentage >= 75 && percentage <= 80;
  const isGood = percentage > 80;

  // Color logic mapping
  const statusColor = isLow 
    ? 'text-destructive' 
    : isWarning 
    ? 'text-[oklch(0.88_0.15_45)]' // Amber
    : 'text-[oklch(0.78_0.18_150)]'; // Emerald

  const statusBg = isLow 
    ? 'bg-destructive/10' 
    : isWarning 
    ? 'bg-[oklch(0.88_0.15_45)]/10' 
    : 'bg-[oklch(0.78_0.18_150)]/10';

  const strokeColor = isLow
    ? 'var(--destructive)'
    : isWarning
    ? 'oklch(0.88 0.15 45)'
    : 'oklch(0.78 0.18 150)';

  // Circle constants
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Animation variants for the card
  const cardVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
    },
    shake: {
      x: [0, -2, 2, -2, 2, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 3,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isLow ? ['visible', 'shake'] : 'visible'}
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl p-5 transition-all",
        "bg-card/40 hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5",
        isLow && "border-destructive/30"
      )}
    >
      {/* Status Header Banner */}
      {isLow && (
        <div className="absolute top-0 left-0 right-0 bg-destructive/20 py-1 flex items-center justify-center gap-1.5 border-b border-destructive/20">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">
            ⚠️ HIGH ALERT
          </span>
        </div>
      )}

      <div className={cn("flex flex-col items-center gap-4", isLow && "mt-4")}>
        {/* Circular Progress Ring */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90">
            {/* Background Circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-white/5"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="48"
              cy="48"
              r={radius}
              stroke={strokeColor}
              strokeWidth="6"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              fill="transparent"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-xl font-bold font-mono", statusColor)}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-sm line-clamp-1 text-foreground/90">
            {subject}
          </h3>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{attended}/{total}</span>
            </div>
            <div className={cn("px-2 py-0.5 rounded-full flex items-center gap-1", statusBg, statusColor)}>
              {isGood ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <AlertTriangle className="w-3 h-3" />
              )}
              <span className="font-medium">
                {isGood ? 'Safe' : isWarning ? 'Borderline' : 'At Risk'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Glow Effect */}
      <div className={cn(
        "absolute -bottom-10 -right-10 w-24 h-24 blur-3xl rounded-full opacity-20 pointer-events-none",
        isLow ? "bg-destructive" : isWarning ? "bg-amber-500" : "bg-primary"
      )} />
    </motion.div>
  );
}