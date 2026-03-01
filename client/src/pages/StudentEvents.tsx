import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, MapPin, Users, Ticket,
    Filter, Search, Sparkles, Loader2, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const API = import.meta.env.VITE_API_URL || 'https://unicampus-backend-1p7e.onrender.com';

interface Event {
    _id: string;
    title: string;
    description: string;
    type: 'hackathon' | 'seminar' | 'workshop' | 'cultural';
    date: string;
    time: string;
    venue: string;
    organizer: string;
    registrationDeadline: string;
    maxParticipants: number;
    registeredStudents: string[];
    image?: string;
}

export default function StudentEvents() {
    const { user, getAuthToken } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRegistering, setIsRegistering] = useState<string | null>(null);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${API}/api/events`);
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast.error('Failed to load events');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRegister = async (eventId: string) => {
        setIsRegistering(eventId);
        try {
            const token = getAuthToken();
            await axios.post(`${API}/api/events/${eventId}/register`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Successfully registered for event!');
            fetchEvents(); // Refresh data
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setIsRegistering(null);
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesFilter = filterType === 'all' || event.type === filterType;
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // AI Recommendation Logic (Simple Mock based on Branch)
    const recommendedEvents = events.filter(event => {
        if (!user?.branch) return false;
        if (user.branch === 'COMP' && (event.type === 'hackathon' || event.type === 'workshop')) return true;
        if (event.title.toLowerCase().includes(user.branch.toLowerCase())) return true;
        return false;
    }).slice(0, 2);

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Calendar className="w-8 h-8 text-primary" />
                    Campus Events & Seminars
                </h1>
                <p className="text-muted-foreground mt-1">Discover workshops, hackathons, and cultural fests happening on campus</p>
            </motion.div>

            {/* AI Recommendations */}
            {recommendedEvents.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                        <h2 className="text-xl font-semibold">Recommended for You</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recommendedEvents.map(event => (
                            <Card key={`rec-${event._id}`} className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                                <CardHeader className="pb-2">
                                    <Badge className="w-fit bg-amber-500/20 text-amber-600 border-amber-500/30 hover:bg-amber-500/30">
                                        Smart Pick
                                    </Badge>
                                    <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex justify-between items-end">
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue}</p>
                                        <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="border-amber-500/30 hover:bg-amber-500/10"
                                        onClick={() => handleRegister(event._id)}>
                                        Quick Register
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/40 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                    {['all', 'hackathon', 'seminar', 'workshop', 'cultural'].map(type => (
                        <Button
                            key={type}
                            variant={filterType === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterType(type)}
                            className="capitalize"
                        >
                            {type}
                        </Button>
                    ))}
                </div>
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
                        className="pl-9 bg-background/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Events Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground mt-4">Loading campus magic...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event, idx) => {
                        const isRegistered = event.registeredStudents.includes(user?.id || '');
                        const seatsLeft = event.maxParticipants - event.registeredStudents.length;

                        return (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="h-full group overflow-hidden border-white/5 hover:border-primary/30 transition-all bg-card/40 backdrop-blur-md">
                                    <div className="h-40 bg-slate-800 relative overflow-hidden">
                                        {event.image ? (
                                            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-slate-900">
                                                <Ticket className="w-12 h-12 text-primary/40" />
                                            </div>
                                        )}
                                        <Badge className="absolute top-3 right-3 capitalize bg-black/60 backdrop-blur-md border-white/10">
                                            {event.type}
                                        </Badge>
                                    </div>

                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{event.title}</CardTitle>
                                        <CardDescription className="line-clamp-2 mt-1">{event.description}</CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                {new Date(event.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="w-4 h-4 text-primary" />
                                                {event.time}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                {event.venue}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                                <Users className="w-4 h-4 text-primary" />
                                                {event.organizer}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Available Slots</div>
                                                <div className={`text-lg font-bold ${seatsLeft <= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {seatsLeft} / {event.maxParticipants}
                                                </div>
                                            </div>

                                            {isRegistered ? (
                                                <Badge variant="outline" className="h-10 px-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Registered
                                                </Badge>
                                            ) : (
                                                <Button
                                                    disabled={seatsLeft <= 0 || isRegistering === event._id}
                                                    onClick={() => handleRegister(event._id)}
                                                    className="shadow-lg shadow-primary/20"
                                                >
                                                    {isRegistering === event._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : seatsLeft <= 0 ? 'Full' : 'Register Now'}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* No Events State */}
            {!isLoading && filteredEvents.length === 0 && (
                <div className="text-center py-20 bg-card/20 rounded-3xl border border-dashed border-border">
                    <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">No events found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                </div>
            )}
        </div>
    );
}
