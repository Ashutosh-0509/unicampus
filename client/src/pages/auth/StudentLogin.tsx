import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const StudentLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState<'pending' | 'rejected' | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setApprovalStatus(null);
        setRejectionReason('');

        try {
            if (!identifier.trim()) {
                throw new Error("Please enter your Roll Number or Email");
            }

            const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const response = await axios.post(`${API_BASE}/api/auth/login`, {
                identifier: identifier.trim(),
                password: password
            });

            console.log('API Response:', response.data);

            const result = response.data.data;

            if (result.status === 'pending_approval') {
                setApprovalStatus('pending');
                toast.error('Account Pending', {
                    description: 'Your account is awaiting admin approval.'
                });
                return;
            }

            if (result.status === 'rejected') {
                setApprovalStatus('rejected');
                setRejectionReason(result.rejectionReason || 'No reason provided');
                toast.error('Account Rejected', {
                    description: result.rejectionReason || 'Your application was rejected.'
                });
                return;
            }

            loginWithToken(result, result.token);
            toast.success('Welcome back, ' + result.name + '!');
            navigate('/student/dashboard');

        } catch (error: any) {
            console.error('Login error:', error.response?.data || error.message);
            const code = error.response?.data?.code;
            const errorMsg = error.response?.data?.message || error.message || 'Login failed';

            if (code === 'USER_NOT_FOUND') {
                toast.error('Account Not Found', {
                    description: "Don't have an account? Sign up as a new student."
                });
            } else if (code === 'ACCOUNT_PENDING_APPROVAL') {
                setApprovalStatus('pending');
                toast.error('Account Pending', {
                    description: 'Your account is awaiting admin approval.'
                });
            } else if (code === 'ACCOUNT_REJECTED') {
                setApprovalStatus('rejected');
                setRejectionReason(error.response?.data?.rejectionReason || 'No reason provided');
                toast.error('Account Rejected', {
                    description: error.response?.data?.rejectionReason || 'Your application was rejected.'
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
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900/20 to-purple-900/20 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 backdrop-blur-[2px]"></div>
                <div className="z-10 text-center p-12 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/30"
                    >
                        <GraduationCap className="w-16 h-16 text-blue-500" />
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-6 text-foreground">Student Portal</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Access your academic dashboard, track attendance, and stay connected with campus life.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 relative bg-background">
                <Link to="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="max-w-md w-full mx-auto">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0">
                            <CardTitle className="text-3xl font-bold flex items-center gap-3">
                                <LogIn className="w-8 h-8 text-blue-600" />
                                Student Login
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                Enter your credentials to access your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {approvalStatus === 'pending' && (
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                                        Your account is pending admin approval. You will be able to log in once approved.
                                    </div>
                                )}

                                {approvalStatus === 'rejected' && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                        <p className="font-bold mb-1">Account Rejected</p>
                                        <p>{rejectionReason}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="identifier">Roll Number or Email</Label>
                                    <Input
                                        id="identifier"
                                        placeholder="e.g. 2024CS001 or john@example.com"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-sm text-blue-600 hover:underline font-medium"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : 'Sign In'}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="px-0 pt-6 border-t mt-6 flex flex-col gap-4">
                            <p className="text-muted-foreground text-sm">
                                Don't have an account?{' '}
                                <Link to="/signup/student" className="text-blue-600 hover:underline font-medium">
                                    Create one here
                                </Link>
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-4 w-full">
                                <Link to="/login/faculty" className="hover:text-foreground transition-colors">Faculty Login</Link>
                                <span className="text-muted-foreground/30">•</span>
                                <Link to="/login/admin" className="hover:text-foreground transition-colors">Admin Portal</Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
