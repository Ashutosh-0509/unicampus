import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'student' | 'faculty'>('student');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (password.length < 6) {
            toast.error('Password too short', { description: 'Password must be at least 6 characters' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
                role,
                rollNumber: role === 'student' ? id : undefined,
                facultyId: role === 'faculty' ? id : undefined,
            });

            toast.success(response.data.message || 'Account created! Please wait for admin approval.');
            navigate(role === 'faculty' ? '/login/faculty' : '/login/student');

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || 'Registration failed';
            toast.error('Registration Failed', { description: msg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            <div className="hidden lg:flex w-1/2 bg-slate-950/20 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-500/5 backdrop-blur-[2px]"></div>
                <div className="z-10 text-center p-12 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-32 h-32 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-500/30"
                    >
                        <UserPlus className="w-16 h-16 text-slate-500" />
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-6 text-foreground">Join UniCampus</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Create your account to access the university's digital ecosystem.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 relative bg-background overflow-y-auto">
                <Link to="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="max-w-md w-full mx-auto mt-12 mb-12">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0">
                            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Enter your details to register.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <form onSubmit={handleSubmit} className="space-y-4">

                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>

                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Select value={role} onValueChange={(val: 'student' | 'faculty') => setRole(val)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="student">Student</SelectItem>
                                                <SelectItem value="faculty">Faculty</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>ID Number</Label>
                                        <Input
                                            value={id}
                                            onChange={(e) => setId(e.target.value)}
                                            placeholder={role === 'student' ? '2024CS001' : 'FAC001'}
                                            required
                                        />
                                    </div>
                                </div>



                                <Button type="submit" disabled={isLoading} className="w-full h-11 mt-4">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </Button>

                            </form>
                        </CardContent>
                        <CardFooter className="px-0 justify-center border-t pt-6 mt-2">
                            <p className="text-sm">
                                Already have an account? <Link to="/login/student" className="text-primary hover:underline font-medium">Log in</Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Register;
