import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, MessageSquare, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { mockAttendanceData, AttendanceData } from '@/lib/index';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  recommendation?: {
    status: 'safe' | 'warning' | 'critical';
    subject: string;
    impact: string;
    reason: string;
  };
  timestamp: Date;
}

export function AILeaveAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: "Hello Aryan! I'm your AI Leave Advisor. Ask me things like 'Can I skip Data Structures tomorrow?' to see how it affects your attendance goals.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const analyzeRequest = (text: string) => {
    const lowerText = text.toLowerCase();
    const subject = mockAttendanceData.find((s) => 
      lowerText.includes(s.subject.toLowerCase()) || 
      lowerText.includes(s.subject.split(' ')[0].toLowerCase())
    );

    if (subject) {
      const newPercentage = ((subject.attended / (subject.total + 1)) * 100).toFixed(1);
      const isSafe = parseFloat(newPercentage) >= 80;
      const isWarning = parseFloat(newPercentage) >= 75 && parseFloat(newPercentage) < 80;

      return {
        subject: subject.subject,
        status: isSafe ? 'safe' : isWarning ? 'warning' : 'critical' as any,
        impact: `${subject.percentage}% → ${newPercentage}%`,
        reason: isSafe 
          ? "You have a healthy buffer. One miss won't hurt much."
          : isWarning 
            ? "You are approaching the 75% danger zone. Exercise caution."
            : "Mandatory attendance required. Skipping will drop you below institution requirements.",
      };
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const analysis = analyzeRequest(userMsg.text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: analysis 
          ? `I've analyzed your attendance for ${analysis.subject}. here is the projected impact:`
          : "I couldn't find that specific subject in your current semester list. Could you please specify which course you're referring to?",
        recommendation: analysis || undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[380px] h-[520px] bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">UniCampus AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Leave Advisor Active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-foreground border border-white/5'}`}>
                    {msg.text}
                    
                    {msg.recommendation && (
                      <div className="mt-3 p-3 bg-background/50 rounded-xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs uppercase text-muted-foreground">{msg.recommendation.subject}</span>
                          {msg.recommendation.status === 'safe' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          {msg.recommendation.status === 'warning' && <Info className="w-4 h-4 text-amber-500" />}
                          {msg.recommendation.status === 'critical' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold">{msg.recommendation.impact}</span>
                          <span className="text-[10px] text-muted-foreground">Attendance Impact</span>
                        </div>
                        <p className="text-xs text-muted-foreground italic">"{msg.recommendation.reason}"</p>
                        <div className={`mt-2 py-1 px-2 rounded-md text-[10px] font-bold text-center uppercase tracking-widest ${
                          msg.recommendation.status === 'safe' ? 'bg-green-500/10 text-green-500' : 
                          msg.recommendation.status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                          'bg-destructive/10 text-destructive'
                        }`}>
                          Recommendation: {msg.recommendation.status.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted/50 rounded-2xl p-3 border border-white/5">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Can I skip Data Structures?"
                  className="w-full bg-background border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary/20 hover:bg-primary/40 text-primary rounded-lg transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter">
                AI suggestions are based on current data. Final decision is yours.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-white/20 group relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
            >
              <MessageSquare className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pulse Ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
        )}
      </motion.button>
    </div>
  );
}
