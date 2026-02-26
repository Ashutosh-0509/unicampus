import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  User,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Fingerprint,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS, UserRole, parseStudentId } from '@/lib/index';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { IMAGES } from '@/assets/images';

const ROLES: { id: UserRole; label: string; icon: typeof User }[] = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'faculty', label: 'Faculty', icon: User },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

const Login = () => {
  const navigate = useNavigate();
  // ✅ FIX: Added loginWithToken to the destructured values
  const { loginWithToken, isAuthenticated, user } = useAuth();

  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('');
  // ✅ FIX: Added password state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedInfo, setParsedInfo] = useState<{ branch: string; year: number } | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const path =
        user.role === 'admin' ? ROUTE_PATHS.ADMIN_DASHBOARD :
          user.role === 'faculty' ? ROUTE_PATHS.FACULTY_DASHBOARD :
            ROUTE_PATHS.STUDENT_DASHBOARD;
      navigate(path);
    }
  }, [isAuthenticated, user, navigate]);

  // Smart Parsing Logic for Student ID
  useEffect(() => {
    if (activeRole === 'student' && identifier.includes('_')) {
      const info = parseStudentId(identifier);
      setParsedInfo(info);
    } else {
      setParsedInfo(null);
    }
  }, [identifier, activeRole]);

  // ✅ FIX: Real API login — hits your actual backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier) {
      setError('Please enter your Roll Number or Email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier,   // your backend accepts email or rollNumber
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the error message from the server
        setError(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      // ✅ Save real user + token from server
      loginWithToken(data.user, data.token);

      // ✅ Navigate to the correct dashboard based on role
      const targetPath =
        data.user.role === 'admin' ? ROUTE_PATHS.ADMIN_DASHBOARD :
          data.user.role === 'faculty' ? ROUTE_PATHS.FACULTY_DASHBOARD :
            ROUTE_PATHS.STUDENT_DASHBOARD;

      navigate(targetPath);

    } catch (err) {
      setError('Cannot reach server. Make sure your backend is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
          style={{ backgroundImage: `url(${IMAGES.CIRCUIT_BG_7})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/20" />
        <FloatingParticles className="opacity-40" />

        {/* Animated Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-[100px]"
        />
      </div>

      {/* Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
          >
            <Cpu className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            UniCampus
          </h1>
          <p className="text-muted-foreground text-sm">
            Unified Intelligence for NIT/IIT Institutions • 2026
          </p>
        </div>

        {/* Main Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-card/40 border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">

          {/* Role Tabs */}
          <div className="flex p-1 bg-muted/30 rounded-xl mb-8 relative">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`relative flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors z-10 ${activeRole === role.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <role.icon className="w-5 h-5 mb-1" />
                {role.label}
                {activeRole === role.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* ── Identifier Field ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 text-foreground/80">
                {activeRole === 'student' ? 'Roll Number or Email' : activeRole === 'faculty' ? 'Faculty ID or Email' : 'Admin Email'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Fingerprint className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={activeRole === 'student' ? 'e.g. 2024CS101 or email' : 'Enter your email'}
                  className="w-full bg-background/50 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
              </div>

              {/* Smart ID Parsing Display */}
              <AnimatePresence>
                {parsedInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 mt-2 px-1"
                  >
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono">
                      BRANCH: {parsedInfo.branch}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono">
                      YEAR: {parsedInfo.year}
                    </span>
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Password Field ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 text-foreground/80">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-background/50 border border-border/50 rounded-xl py-3 pl-4 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
                {/* Show/Hide Password Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
              </div>
            </div>

            {/* ── Error Message ── */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* ── Submit Button ── */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3.5 px-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_25px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Secure Login
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-muted-foreground text-xs">
              Trouble logging in? <span className="text-primary hover:underline cursor-pointer">Contact IT Support</span>
            </p>
          </div>
        </div>

        {/* Floating Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-4 text-muted-foreground/50">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest">Biometric AES-256</span>
          </div>
          <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest">AI-Powered Core</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
