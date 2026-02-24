import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    GraduationCap,
    Users,
    ShieldCheck,
    ArrowRight,
    School,
    BookOpen,
    Trophy,
    Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary text-white p-1.5 rounded-lg">
                                <School className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">UniCampus</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Academics</a>
                            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Research</a>
                            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Campus Life</a>
                            <div className="flex items-center gap-2">
                                <Link to="/login/student">
                                    <Button variant="ghost" className="text-slate-700 hover:text-primary hover:bg-slate-50">Log In</Button>
                                </Link>
                                <Link to="/contact">
                                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm">Contact Us</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                            Excellence in <span className="text-primary">Education Management</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            A unified platform for students, faculty, and administration to streamline academic operations and foster institutional growth.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/login/student">
                                <Button size="lg" className="h-12 px-8 text-base bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10">
                                    Access Student Portal
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Subtle Background Decoration */}
                <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                    <div className="absolute -top-[30%] -right-[10%] w-[50%] h-[80%] rounded-full bg-blue-50/50 blur-3xl"></div>
                    <div className="absolute -bottom-[30%] -left-[10%] w-[50%] h-[80%] rounded-full bg-indigo-50/50 blur-3xl"></div>
                </div>
            </section>

            {/* Role Portals */}
            <section className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Select Your Portal</h2>
                        <p className="text-slate-600 max-w-xl mx-auto">
                            Secure, dedicated environments for every member of our academic community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Student Portal",
                                desc: "Manage your courses, view grades, and access learning resources.",
                                icon: GraduationCap,
                                href: "/login/student",
                                color: "text-blue-600",
                                bg: "bg-blue-50"
                            },
                            {
                                title: "Faculty Portal",
                                desc: "Attendance tracking, grading tools, and curriculum planning.",
                                icon: Users,
                                href: "/login/faculty",
                                color: "text-indigo-600",
                                bg: "bg-indigo-50"
                            },
                            {
                                title: "Administration",
                                desc: "Campus oversight, resource allocation, and reporting.",
                                icon: ShieldCheck,
                                href: "/login/admin",
                                color: "text-slate-600",
                                bg: "bg-slate-100"
                            }
                        ].map((role, idx) => (
                            <Link key={idx} to={role.href} className="group">
                                <Card className="h-full border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <CardHeader>
                                        <div className={`w-12 h-12 ${role.bg} ${role.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <role.icon className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                                            {role.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-slate-600 text-base leading-relaxed mb-6">
                                            {role.desc}
                                        </CardDescription>
                                        <div className="flex items-center text-sm font-semibold text-primary">
                                            Login <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats / Proof */}
            <section className="py-20 bg-white border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "Active Students", value: "12,000+", icon: Users },
                            { label: "Research Papers", value: "850+", icon: BookOpen },
                            { label: "Global Partners", value: "45", icon: Globe },
                            { label: "National Ranking", value: "#1", icon: Trophy },
                        ].map((stat, idx) => (
                            <div key={idx} className="p-4">
                                <div className="flex justify-center mb-3 text-slate-400">
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 py-12 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <School className="w-5 h-5 text-slate-500" />
                            <span className="font-semibold text-slate-700">UniCampus</span>
                        </div>
                        <p className="text-sm text-slate-500">© 2026 UniCampus Systems. All rights reserved.</p>
                    </div>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
