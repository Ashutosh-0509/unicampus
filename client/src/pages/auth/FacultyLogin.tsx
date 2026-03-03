import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const FacultyLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!identifier.trim()) {
                toast.error('Input Required', {
                    description: 'Please enter your Faculty ID or Email'
                });
                setIsLoading(false);
                return;
            }

            // Make API call to login
            const response = await axios.post('https://unicampus-backend-1p7e.onrender.com/api/auth/login', {
                identifier: identifier.trim(),
                password: password,
                role: 'faculty'
            });

            const result = response.data.data;

            // Login and navigate
            loginWithToken(result, result.token);
            toast.success('Welcome, Professor ' + result.name + '!');
            navigate('/faculty/dashboard');
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || error.message || 'Login failed';
            const code = error.response?.data?.code;

            if (code === 'USER_NOT_FOUND') {
                toast.error('Faculty Account Not Found', {
                    description: 'Please check your Faculty ID and try again.'
                });
            } else {
                toast.error('Login Failed', { description: errorMsg });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-amber-950/20 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/5 backdrop-blur-[2px]"></div>
                <div className="z-10 text-center p-12 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-32 h-32 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/30"
                    >
                        <Users className="w-16 h-16 text-amber-500" />
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-6 text-foreground">Faculty Portal</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Manage your courses, grading, and student interactions with precision and ease.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 relative bg-background">
                <Link to="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Role Selection
                </Link>

                <div className="max-w-md w-full mx-auto">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0">
                            <CardTitle className="text-3xl font-bold text-amber-500/90">Faculty Login</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Enter your Faculty Credentials to continue.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="identifier">Faculty ID or Email</Label>
                                    <Input
                                        id="identifier"
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="e.g. FAC2024001 or faculty@nitcampus.edu"
                                        className="h-11 focus-visible:ring-amber-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-11 focus-visible:ring-amber-500"
                                        required
                                    />
                                </div>



                                <Button
                                    type="submit"
                                    disabled={isLoading || !password}
                                    className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="px-0 flex-col gap-4 border-t border-border pt-6 mt-2">
                            <p className="text-sm text-muted-foreground">
                                New Faculty Member? <Link to="/register" className="text-amber-500 hover:underline font-medium">Register here</Link>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Need access? <a href="#" className="text-amber-500 hover:underline">Contact Administration</a>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FacultyLogin;
