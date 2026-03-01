import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircleQuestion, Sparkles, Send, Loader2,
    Search, Plus, X, MessageSquare, CheckCircle2,
    User, Clock, Filter, ChevronRight, UserCircle, Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

const API = import.meta.env.VITE_API_URL || 'https://unicampus-backend-1p7e.onrender.com';

interface DoubtResponse {
    _id: string;
    sender: string;
    message: string;
    timestamp: string;
}

interface Doubt {
    _id: string;
    title: string;
    description: string;
    subject: string;
    studentId: any;
    status: 'open' | 'resolved';
    responses: DoubtResponse[];
    createdAt: string;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    message: string;
    suggestions?: string[];
    timestamp: number;
}

export default function DoubtSolver() {
    const { user, getAuthToken } = useAuth();
    const [activeTab, setActiveTab] = useState('community');

    // AI Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Community Feed State
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [isDoubtsLoading, setIsDoubtsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPostingDoubt, setIsPostingDoubt] = useState(false);
    const [newDoubt, setNewDoubt] = useState({ title: '', description: '', subject: 'General' });

    // Selected Doubt for Details
    const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
    const [replyText, setReplyText] = useState('');

    const fetchDoubts = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API}/api/doubts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoubts(response.data);
        } catch (error) {
            console.error('Failed to fetch doubts:', error);
            toast.error('Failed to load community doubts');
        } finally {
            setIsDoubtsLoading(false);
        }
    };

    useEffect(() => {
        fetchDoubts();
        // Initial AI message
        setChatMessages([{
            id: '1',
            sender: 'bot',
            message: `Hi ${user?.name}! I'm your AI Academic-Buddy. How can I help you with your studies today?`,
            suggestions: ['Explain Quantum Physics', 'Help with Calculus', 'How to write a thesis?'],
            timestamp: Date.now()
        }]);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleAiSend = async (messageText: string = currentInput) => {
        const textToSend = messageText.trim();
        if (!textToSend) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            message: textToSend,
            timestamp: Date.now()
        };

        setChatMessages(prev => [...prev, userMsg]);
        setCurrentInput('');
        setIsAiLoading(true);

        try {
            const token = getAuthToken();
            const response = await axios.post(`${API}/api/chat`, {
                message: textToSend,
                context: { page: 'doubt-solver' }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                message: response.data.message,
                suggestions: response.data.suggestions,
                timestamp: Date.now()
            };
            setChatMessages(prev => [...prev, botMsg]);
        } catch (error) {
            toast.error('AI Service is currently busy');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handlePostDoubt = async () => {
        if (!newDoubt.title || !newDoubt.description) {
            toast.error('Please fill in all fields');
            return;
        }
        setIsPostingDoubt(true);
        try {
            const token = getAuthToken();
            await axios.post(`${API}/api/doubts`, newDoubt, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Doubt posted to community!');
            setNewDoubt({ title: '', description: '', subject: 'General' });
            setIsPostingDoubt(false);
            fetchDoubts();
        } catch (error) {
            toast.error('Failed to post doubt');
            setIsPostingDoubt(false);
        }
    };

    const handleReply = async (doubtId: string) => {
        if (!replyText.trim()) return;
        try {
            const token = getAuthToken();
            const response = await axios.post(`${API}/api/doubts/${doubtId}/respond`, {
                message: replyText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedDoubt(response.data);
            setReplyText('');
            fetchDoubts();
            toast.success('Reponse posted!');
        } catch (error) {
            toast.error('Failed to post reply');
        }
    };

    const filteredDoubts = doubts.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <MessageCircleQuestion className="w-8 h-8 text-primary" />
                        Doubt Solver
                    </h1>
                    <p className="text-muted-foreground mt-1">AI-powered support & peer discussions</p>
                </div>
                <Tabs defaultValue="community" className="w-[400px]" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-xl border border-white/5">
                        <TabsTrigger value="ai" className="gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            AI Buddy
                        </TabsTrigger>
                        <TabsTrigger value="community" className="gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            Community
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 flex overflow-hidden gap-6">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-card/20 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">

                    {/* AI Tab Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'ai' ? (
                            <motion.div
                                key="ai-pane"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="flex flex-col h-full p-4"
                            >
                                <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-hide">
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${msg.sender === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                                : 'bg-card border border-white/5 rounded-bl-none'
                                                }`}>
                                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                                {msg.suggestions && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {msg.suggestions.map((s, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleAiSend(s)}
                                                                className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-full transition-colors font-medium border border-primary/20"
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <span className="text-[10px] opacity-40 mt-2 block">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {isAiLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-card border border-white/5 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-75" />
                                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150" />
                                                </div>
                                                <span className="text-xs text-muted-foreground">AI is thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-4 bg-background/50 border-t border-white/5 flex gap-3">
                                    <Input
                                        placeholder="Ask your academic buddy anything..."
                                        value={currentInput}
                                        onChange={(e) => setCurrentInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                                        className="bg-card/40 border-white/10 rounded-xl"
                                    />
                                    <Button onClick={() => handleAiSend()} size="icon" className="h-10 w-10 shrink-0 shadow-lg shadow-primary/20">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            /* Community Tab Content */
                            <motion.div
                                key="community-pane"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="flex flex-col h-full overflow-hidden"
                            >
                                {/* Community Feed / Details */}
                                {selectedDoubt ? (
                                    /* Doubt Details View */
                                    <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedDoubt(null)} className="w-fit mb-4 gap-1">
                                            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Feed
                                        </Button>
                                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                                            <Card className="border-primary/20 bg-primary/5">
                                                <CardHeader>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline">{selectedDoubt.subject}</Badge>
                                                        <span className="text-xs text-muted-foreground">{new Date(selectedDoubt.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <CardTitle className="text-2xl">{selectedDoubt.title}</CardTitle>
                                                    <CardDescription className="text-base text-foreground/80 mt-2">{selectedDoubt.description}</CardDescription>
                                                    <div className="flex items-center gap-2 mt-4">
                                                        <Avatar className="w-6 h-6">
                                                            <AvatarFallback>{selectedDoubt.studentId?.name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs font-semibold">{selectedDoubt.studentId?.name || 'Anonymous'}</span>
                                                    </div>
                                                </CardHeader>
                                            </Card>

                                            <div className="space-y-4">
                                                <h3 className="font-bold flex items-center gap-2 px-2">
                                                    <MessageSquare className="w-4 h-4 text-primary" />
                                                    Discussion ({selectedDoubt.responses.length})
                                                </h3>
                                                {selectedDoubt.responses.map((resp, idx) => (
                                                    <div key={idx} className="bg-card/40 border border-white/5 p-4 rounded-3xl relative">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                                            <span className="text-xs font-bold">{resp.sender}</span>
                                                            <span className="text-[10px] text-muted-foreground">{new Date(resp.timestamp).toLocaleTimeString()}</span>
                                                        </div>
                                                        <p className="text-sm text-foreground/90 leading-relaxed">{resp.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                                            <Textarea
                                                placeholder="Add your expert perspective..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                className="bg-card/40 border-white/10 rounded-2xl min-h-[80px]"
                                            />
                                            <Button onClick={() => handleReply(selectedDoubt._id)} className="h-[80px] w-16 shadow-lg shadow-primary/20">
                                                <Send className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Feed View */
                                    <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search doubts by subject or topic..."
                                                    className="pl-9 bg-background/40"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={() => setIsPostingDoubt(!isPostingDoubt)} className="gap-2">
                                                {isPostingDoubt ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                {isPostingDoubt ? 'Cancel' : 'Post Doubt'}
                                            </Button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                                            {isDoubtsLoading ? (
                                                <div className="flex flex-col items-center justify-center py-20">
                                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                                    <p className="text-muted-foreground mt-4">Connecting to student brain hive...</p>
                                                </div>
                                            ) : isPostingDoubt ? (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-2xl mx-auto w-full p-4">
                                                    <h2 className="text-xl font-bold">Ask the Community</h2>
                                                    <div className="space-y-3">
                                                        <Input placeholder="What's your question about? (Title)"
                                                            value={newDoubt.title}
                                                            onChange={(e) => setNewDoubt({ ...newDoubt, title: e.target.value })}
                                                        />
                                                        <select
                                                            className="w-full bg-card/40 border-white/10 rounded-xl p-2.5 text-sm"
                                                            value={newDoubt.subject}
                                                            onChange={(e) => setNewDoubt({ ...newDoubt, subject: e.target.value })}
                                                        >
                                                            <option>General</option>
                                                            <option>Computer Science</option>
                                                            <option>Mathematics</option>
                                                            <option>Physics</option>
                                                            <option>Electronics</option>
                                                        </select>
                                                        <Textarea
                                                            placeholder="Describe your doubt in detail. What have you tried so far?"
                                                            rows={5}
                                                            value={newDoubt.description}
                                                            onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })}
                                                        />
                                                        <Button className="w-full" onClick={handlePostDoubt}>Share Doubt</Button>
                                                    </div>
                                                </motion.div>
                                            ) : filteredDoubts.length === 0 ? (
                                                <div className="text-center py-20">
                                                    <p className="text-muted-foreground italic">No doubts in this universe yet. Be the first to ask!</p>
                                                </div>
                                            ) : (
                                                filteredDoubts.map((doubt, idx) => (
                                                    <motion.div
                                                        key={doubt._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                    >
                                                        <Card
                                                            className="cursor-pointer hover:border-primary/30 transition-all bg-card/40 backdrop-blur-md group"
                                                            onClick={() => setSelectedDoubt(doubt)}
                                                        >
                                                            <CardHeader className="p-4">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                                                                                {doubt.subject}
                                                                            </Badge>
                                                                            {doubt.responses.length > 0 && (
                                                                                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                                                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                                                    {doubt.responses.length} responses
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{doubt.title}</CardTitle>
                                                                        <p className="text-xs text-muted-foreground flex items-center gap-4 mt-2">
                                                                            <span className="flex items-center gap-1"><UserCircle className="w-3 h-3" /> {doubt.studentId?.name || 'Student'}</span>
                                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(doubt.createdAt).toLocaleDateString()}</span>
                                                                        </p>
                                                                    </div>
                                                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                                </div>
                                                            </CardHeader>
                                                        </Card>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Sidebar - Info/Stats */}
                <div className="w-80 hidden lg:flex flex-col gap-6">
                    <Card className="bg-card/40 border-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Solving Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold">{doubts.length}</span>
                                    <span className="text-[10px] text-muted-foreground font-semibold">Total Doubts</span>
                                </div>
                                <Users className="w-5 h-5 text-blue-500 opacity-60" />
                            </div>
                            <div className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-2xl">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-emerald-500">
                                        {doubts.filter(d => d.responses.length > 0).length}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-semibold font-semibold">Under Discussion</span>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-60" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 bg-gradient-to-br from-primary/10 to-transparent border-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Your Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                                <User size={40} className="text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold">{user?.name}</h4>
                                <p className="text-xs text-muted-foreground">{user?.branch} • Sem {user?.semester || 'N/A'}</p>
                            </div>
                            <div className="pt-4 grid grid-cols-2 gap-4 w-full">
                                <div className="text-center">
                                    <p className="text-xl font-bold">0</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Solved</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold">0</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Points</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
