import React, { useEffect, useState } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Award, BookOpen, Briefcase } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  suffix?: string;
}

export function StatsCard({ title, value, icon, trend, suffix = '' }: StatsCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
  const isNumeric = !isNaN(numericValue) && typeof value !== 'string';
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (numericValue % 1 === 0) return Math.floor(latest).toString();
    return latest.toFixed(1);
  });

  const [displayValue, setDisplayValue] = useState(isNumeric ? '0' : value.toString());

  useEffect(() => {
    if (isNumeric) {
      const controls = animate(count, numericValue, {
        duration: 1.5,
        ease: [0.23, 1, 0.32, 1],
      });
      return controls.stop;
    } else {
      setDisplayValue(value.toString());
    }
  }, [value, isNumeric, count, numericValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group overflow-hidden rounded-xl border border-white/10 bg-card/40 backdrop-blur-xl p-5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.3)]"
    >
      {/* Ambient Glow */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {isNumeric ? <motion.span>{rounded}</motion.span> : displayValue}
              {suffix}
            </h3>
          </div>
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          {icon}
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          <div
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              trend > 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : trend < 0
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">vs last semester</span>
        </div>
      )}
    </motion.div>
  );
}

export function QuickStatsBar() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatsCard
        title="Cumulative GPA"
        value={9.2}
        suffix="/10"
        icon={<Award className="h-5 w-5" />}
        trend={0.4}
      />
      <StatsCard
        title="Pending Assignments"
        value={4}
        icon={<BookOpen className="h-5 w-5" />}
        trend={-25}
      />
      <StatsCard
        title="Active Placements"
        value={12}
        icon={<Briefcase className="h-5 w-5" />}
        trend={12}
      />
    </div>
  );
}
