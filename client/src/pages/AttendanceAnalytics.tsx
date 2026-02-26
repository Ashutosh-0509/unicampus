import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Brain,
    RefreshCw,
    BookOpen,
    Target,
    Zap,
    Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

interface SubjectAnalytics {
    subject: string;
    subjectCode: string;
    attended: number;
    total: number;
    percentage: number;
    risk: 'safe' | 'medium' | 'high';
    safeLeaves: number;
    classesNeeded: number;
}

interface AnalyticsData {
    records: SubjectAnalytics[];
    avgPercentage: number;
    suggestions: string[];
}

const riskConfig = {
    safe: {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        bar: 'bg-emerald-500',
        label: '✅ SAFE',
        icon: CheckCircle,
    },
    medium: {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        bar: 'bg-yellow-500',
        label: '⚠️ WARNING',
        icon: AlertTriangle,
    },
    high: {
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        bar: 'bg-red-500',
        label: '🔴 DANGER',
        icon: TrendingDown,
    },
};

export default function AttendanceAnalytics() {
    const { user, getAuthToken } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAnalytics = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const studentId = user?.id || user?.studentId;
            const res = await axios.get(
                `http://localhost:5000/api/attendance/analytics/${studentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setData(res.data);
        } catch (err) {
            setError('Could not load analytics. Make sure you have attendance records.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchAnalytics();
    }, [user]);

    const highRiskCount = data?.records.filter(r => r.risk === 'high').length || 0;
    const mediumRiskCount = data?.records.filter(r => r.risk === 'medium').length || 0;
    const safeCount = data?.records.filter(r => r.risk === 'safe').length || 0;

    return (
        <div className="min-h-screen bg-background p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">AI Attendance Analytics</h1>
                        <p className="text-sm text-muted-foreground">Smart insights powered by AI</p>
                    </div>
                </div>
                <button
                    onClick={fetchAnalytics}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <Brain className="w-12 h-12 text-primary animate-pulse" />
                        <p className="text-muted-foreground">AI is analyzing your attendance...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {data && !isLoading && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-4 rounded-xl bg-card border border-border"
                        >
                            <p className="text-xs text-muted-foreground mb-1">Overall Average</p>
                            <p className={`text-3xl font-bold ${data.avgPercentage >= 75 ? 'text-emerald-400' :
                                    data.avgPercentage >= 65 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {data.avgPercentage?.toFixed(1) || 0}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">attendance</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30"
                        >
                            <p className="text-xs text-red-400 mb-1">High Risk</p>
                            <p className="text-3xl font-bold text-red-400">{highRiskCount}</p>
                            <p className="text-xs text-muted-foreground mt-1">subjects</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
                        >
                            <p className="text-xs text-yellow-400 mb-1">Warning</p>
                            <p className="text-3xl font-bold text-yellow-400">{mediumRiskCount}</p>
                            <p className="text-xs text-muted-foreground mt-1">subjects</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
                        >
                            <p className="text-xs text-emerald-400 mb-1">Safe</p>
                            <p className="text-3xl font-bold text-emerald-400">{safeCount}</p>
                            <p className="text-xs text-muted-foreground mt-1">subjects</p>
                        </motion.div>
                    </div>

                    {/* AI Suggestions */}
                    {data.suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="p-5 rounded-xl bg-primary/5 border border-primary/20"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-5 h-5 text-primary" />
                                <h2 className="font-semibold text-primary">AI Suggestions</h2>
                            </div>
                            <div className="space-y-2">
                                {data.suggestions.map((s, i) => (
                                    <p key={i} className="text-sm text-foreground/80">{s}</p>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Subject Cards */}
                    {data.records.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No attendance records found.</p>
                            <p className="text-sm mt-1">Ask your faculty to mark attendance first.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.records
                                .sort((a, b) => a.percentage - b.percentage)
                                .map((record, i) => {
                                    const config = riskConfig[record.risk];
                                    return (
                                        <motion.div
                                            key={record.subjectCode}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`p-5 rounded-xl border ${config.bg} ${config.border}`}
                                        >
                                            {/* Subject Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-sm">{record.subject}</h3>
                                                    <p className="text-xs text-muted-foreground">{record.subjectCode}</p>
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                                                    {config.label}
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-muted-foreground">{record.attended}/{record.total} classes</span>
                                                    <span className={`font-bold ${config.color}`}>{record.percentage}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${record.percentage}%` }}
                                                        transition={{ duration: 1, delay: i * 0.1 }}
                                                        className={`h-full rounded-full ${config.bar}`}
                                                    />
                                                </div>
                                                {/* 75% marker */}
                                                <div className="relative h-1 mt-1">
                                                    <div
                                                        className="absolute top-0 w-0.5 h-3 bg-white/30 -mt-1"
                                                        style={{ left: '75%' }}
                                                    />
                                                    <span
                                                        className="absolute text-[9px] text-white/30 -mt-1"
                                                        style={{ left: '74%' }}
                                                    >75%</span>
                                                </div>
                                            </div>

                                            {/* AI Insight */}
                                            <div className="mt-4 p-3 rounded-lg bg-black/20 text-xs">
                                                {record.risk === 'safe' && (
                                                    <div className="flex items-center gap-2 text-emerald-400">
                                                        <Target className="w-3.5 h-3.5 shrink-0" />
                                                        <span>You can safely skip <strong>{record.safeLeaves}</strong> more class{record.safeLeaves !== 1 ? 'es' : ''}.</span>
                                                    </div>
                                                )}
                                                {record.risk === 'medium' && (
                                                    <div className="flex items-center gap-2 text-yellow-400">
                                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Attend next <strong>{record.classesNeeded}</strong> class{record.classesNeeded !== 1 ? 'es' : ''} to reach 75%.</span>
                                                    </div>
                                                )}
                                                {record.risk === 'high' && (
                                                    <div className="flex items-center gap-2 text-red-400">
                                                        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Attend next <strong>{record.classesNeeded}</strong> consecutive classes — detention risk!</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
