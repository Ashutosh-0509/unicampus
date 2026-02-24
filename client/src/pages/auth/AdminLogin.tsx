import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const AdminLogin = () => {
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
                    description: 'Please enter your Admin ID or Email'
                });
                setIsLoading(false);
                return;
            }

            // Make API call to login
            const response = await axios.post('https://unicampus-backend-1p7e.onrender.com/api/auth/login', {
                identifier: identifier.trim(),
                password: password,
                role: 'admin'
            });

            const result = response.data.data;

            // Login and navigate
            loginWithToken(result, result.token);
            toast.success('System Access Granted - Welcome!');
            navigate('/admin/dashboard');
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
            const code = error.response?.data?.code;

            if (code === 'USER_NOT_FOUND') {
                toast.error('Admin Account Not Found', {
                    description: 'Please check your credentials and try again.'
                });
            } else {
                toast.error('Access Denied', { description: errorMsg });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-red-950/20 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[2px]"></div>
                <div className="z-10 text-center p-12 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/30"
                    >
                        <ShieldCheck className="w-16 h-16 text-red-500" />
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-6 text-foreground">Admin Console</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Centralized control panel for university administration, user management, and system analytics.
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
                            <CardTitle className="text-3xl font-bold text-red-500/90">System Login</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Authorized Personnel Only.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="identifier">Admin ID or Email</Label>
                                    <Input
                                        id="identifier"
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="e.g. ADM2024001 or admin@nitcampus.edu"
                                        className="h-11 focus-visible:ring-red-500"
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
                                        className="h-11 focus-visible:ring-red-500"
                                        required
                                    />
                                </div>



                                <Button
                                    type="submit"
                                    disabled={isLoading || !password}
                                    className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    {isLoading ? 'Accessing...' : 'Access Console'}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="px-0 justify-center border-t border-border pt-6 mt-2">
                            <p className="text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Secure System
                                </span>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
