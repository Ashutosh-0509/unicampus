import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const API = import.meta.env.VITE_API_URL || 'https://unicampus-backend-1p7e.onrender.com';

interface SubjectPrediction {
    subject: string;
    current_percentage: number;
    risk_level: 'HIGH' | 'MEDIUM' | 'SAFE';
    lectures_needed: number;
    can_miss: number;
    predicted_percentage: number;
    advice: string;
}

interface Prediction {
    overall_risk: 'HIGH' | 'MEDIUM' | 'SAFE';
    overall_message: string;
    subjects: SubjectPrediction[];
}

export default function AIAttendancePrediction({ studentId }: { studentId: string }) {
    const { getAuthToken } = useAuth();
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchPrediction = async () => {
        if (!studentId) return;
        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const res = await fetch(`${API}/api/attendance/predict/${studentId}?totalLectures=60`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setPrediction(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchPrediction(); }, [studentId]);

    const riskColor = {
        HIGH: 'text-red-500 bg-red-500/10 border-red-500/30',
        MEDIUM: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
        SAFE: 'text-green-500 bg-green-500/10 border-green-500/30',
    };

    const riskBadge = {
        HIGH: 'destructive' as const,
        MEDIUM: 'secondary' as const,
        SAFE: 'default' as const,
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        AI Attendance Prediction
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchPrediction} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Gemini AI analyzing your attendance...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-6 text-destructive">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">{error}</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={fetchPrediction}>Retry</Button>
                    </div>
                ) : prediction ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                        {/* Overall Risk Banner */}
                        <div className={`p-4 rounded-xl border ${riskColor[prediction.overall_risk]}`}>
                            <div className="flex items-center gap-2 mb-1">
                                {prediction.overall_risk === 'SAFE'
                                    ? <CheckCircle className="w-5 h-5" />
                                    : <AlertTriangle className="w-5 h-5" />}
                                <span className="font-bold">Overall Risk: {prediction.overall_risk}</span>
                            </div>
                            <p className="text-sm">{prediction.overall_message}</p>
                        </div>

                        {/* Subject Predictions */}
                        <div className="space-y-3">
                            {prediction.subjects?.map((sub, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-3 rounded-lg bg-background/40 border border-white/10"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">{sub.subject}</span>
                                        <Badge variant={riskBadge[sub.risk_level]}>{sub.risk_level}</Badge>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${sub.current_percentage >= 75 ? 'bg-primary' : 'bg-destructive'}`}
                                                style={{ width: `${Math.min(sub.current_percentage, 100)}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-bold w-10 text-right ${sub.current_percentage < 75 ? 'text-destructive' : 'text-primary'}`}>
                                            {sub.current_percentage}%
                                        </span>
                                    </div>

                                    {/* Key info */}
                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                                        {sub.risk_level !== 'SAFE' ? (
                                            <div className="flex items-center gap-1 text-destructive">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>{sub.lectures_needed} lectures zaroori</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-green-500">
                                                <CheckCircle className="w-3 h-3" />
                                                <span>{sub.can_miss} lectures chhod sakte ho</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 justify-end">
                                            <TrendingUp className="w-3 h-3" />
                                            <span>Predicted: {sub.predicted_percentage}%</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground italic">💡 {sub.advice}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : null}
            </CardContent>
        </Card>
    );
}