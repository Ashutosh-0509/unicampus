import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const BRANCHES = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering'
];

const StudentSignup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [branch, setBranch] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [year, setYear] = useState('1');
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
            // Validate roll number format
            if (!/^\d{4}[A-Z]{2,}\d{3}$/.test(rollNumber.toUpperCase())) {
                throw new Error('Invalid roll number format (e.g., 2024CS001)');
            }

            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                role: 'student',
                branch,
                rollNumber: rollNumber.toUpperCase(),
                year: parseInt(year),
                semester: parseInt(year) * 2 - 1
            });

            toast.success('🎓 Signup successful!', {
                description: 'Your application is pending admin approval. You\'ll be notified once approved.'
            });

            // Navigate to login after a short delay
            setTimeout(() => {
                navigate('/login/student');
            }, 2000);
        } catch (error: any) {
            console.error('Signup error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Signup failed';
            toast.error('Signup Failed', { description: errorMsg });
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
                    <h2 className="text-4xl font-bold mb-6 text-foreground">Join Smart Campus</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Register as a student to access your academic dashboard, track attendance, manage assignments, and explore campus opportunities.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 relative bg-background">
                <Link to="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <div className="max-w-md w-full mx-auto">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0">
                            <CardTitle className="text-3xl font-bold">Student Registration</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Create your account with your branch and roll number
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="h-11"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="h-11"
                                        required
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-muted-foreground">Use a valid email for account verification</p>
                                </div>

                                {/* Branch Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="branch" className="text-sm font-medium">Branch *</Label>
                                    <Select value={branch} onValueChange={setBranch} disabled={isLoading}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select your branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BRANCHES.map((b) => (
                                                <SelectItem key={b} value={b}>
                                                    {b}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Roll Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="rollNumber" className="text-sm font-medium">Roll Number *</Label>
                                    <Input
                                        id="rollNumber"
                                        type="text"
                                        value={rollNumber}
                                        onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                                        placeholder="2024CS001"
                                        className="h-11 uppercase"
                                        pattern="^\d{4}[A-Z]{2,}\d{3}$"
                                        required
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-muted-foreground">Format: YYYYBB### (e.g., 2024CS001)</p>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" title="Password is required" className="text-sm font-medium">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-11"
                                        required
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-muted-foreground">Minimum 6 characters required</p>
                                </div>

                                {/* Year Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="year" className="text-sm font-medium">Year *</Label>
                                    <Select value={year} onValueChange={setYear} disabled={isLoading}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select your year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1st Year</SelectItem>
                                            <SelectItem value="2">2nd Year</SelectItem>
                                            <SelectItem value="3">3rd Year</SelectItem>
                                            <SelectItem value="4">4th Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading || !name || !email || !branch || !rollNumber || !password}
                                    className="w-full h-11 mt-6 bg-blue-600 hover:bg-blue-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Register as Student'
                                    )}
                                </Button>

                                {/* Login Link */}
                                <p className="text-center text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <Link to="/login/student" className="text-blue-600 hover:underline font-medium">
                                        Login here
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentSignup;
