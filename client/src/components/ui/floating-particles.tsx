import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingParticlesProps {
  className?: string;
}

/**
 * FloatingParticles Component
 * Generates a circuit-board inspired animated background with floating nodes and connecting traces.
 * Uses Framer Motion for high-performance GPU-accelerated animations.
 */
export function FloatingParticles({ className }: FloatingParticlesProps) {
  // Generate static positions once to avoid re-renders during animation cycles
  const nodes = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    })), []);

  const traces = useMemo(() => 
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      width: Math.random() * 150 + 50,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 2,
      horizontal: Math.random() > 0.5,
    })), []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {/* Grid Overlay for subtle texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Animated Circuit Traces (Lines) */}
      {traces.map((trace) => (
        <motion.div
          key={`trace-${trace.id}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.2, 0],
            x: trace.horizontal ? [-20, 20] : 0,
            y: !trace.horizontal ? [-20, 20] : 0,
          }}
          transition={{
            duration: trace.duration,
            repeat: Infinity,
            delay: trace.delay,
            ease: "linear",
          }}
          className={cn(
            "absolute bg-primary/30",
            trace.horizontal ? "h-[1px]" : "w-[1px]"
          )}
          style={{
            width: trace.horizontal ? `${trace.width}px` : '1px',
            height: !trace.horizontal ? `${trace.width}px` : '1px',
            top: `${trace.top}%`,
            left: `${trace.left}%`,
            boxShadow: '0 0 8px var(--primary)',
          }}
        />
      ))}

      {/* Animated Nodes (Dots) */}
      {nodes.map((node) => (
        <motion.div
          key={`node-${node.id}`}
          initial={{ 
            x: `${node.x}%`, 
            y: `${node.y}%`, 
            opacity: 0 
          }}
          animate={{
            y: [`${node.y}%`, `${(node.y + 10) % 100}%`, `${node.y}%`],
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: node.duration,
            repeat: Infinity,
            delay: node.delay,
            ease: "easeInOut",
          }}
          className="absolute rounded-full bg-primary/40"
          style={{
            width: `${node.size}px`,
            height: `${node.size}px`,
            boxShadow: `0 0 ${node.size * 2}px var(--primary)`,
          }}
        />
      ))}

      {/* Gradient Vignette for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
    </div>
  );
}
