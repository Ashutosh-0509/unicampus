import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  FileText,
  Briefcase,
  Book,
  Home,
  CreditCard,
  MessageSquare,
  ClipboardCheck,
  ClipboardList,
  Share2,
  FileEdit,
  Building2,
  Library,
  Landmark,
  PieChart,
  Users,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
  ShieldAlert,
  Sparkles,
  Settings
} from 'lucide-react';
import { ROUTE_PATHS, UserRole } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/NotificationCenter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <>{children}</>;

  const studentNav: NavItem[] = [
    { label: 'Dashboard', path: ROUTE_PATHS.STUDENT_DASHBOARD, icon: LayoutDashboard },
    { label: 'Academics', path: ROUTE_PATHS.ACADEMICS, icon: GraduationCap },
    { label: 'Attendance', path: ROUTE_PATHS.ATTENDANCE, icon: CalendarCheck },
    { label: 'Assignments', path: ROUTE_PATHS.ASSIGNMENTS, icon: FileText },

    { label: 'Library', path: ROUTE_PATHS.LIBRARY, icon: Book },
    { label: 'Hostel', path: ROUTE_PATHS.HOSTEL, icon: Home },
    { label: 'Placements', path: ROUTE_PATHS.PLACEMENTS, icon: Briefcase },
    { label: 'Feedback', path: ROUTE_PATHS.FEEDBACK, icon: MessageSquare },
  ];

  const facultyNav: NavItem[] = [
    { label: 'Overview', path: ROUTE_PATHS.FACULTY_DASHBOARD, icon: LayoutDashboard },
    { label: 'Attendance', path: ROUTE_PATHS.FACULTY_ATTENDANCE, icon: ClipboardCheck },
    { label: 'Grading', path: ROUTE_PATHS.GRADING, icon: ClipboardList },
    { label: 'Resources', path: ROUTE_PATHS.RESOURCES, icon: Share2 },
    { label: 'Recommendations', path: ROUTE_PATHS.RECOMMENDATIONS, icon: FileEdit },
  ];

  const adminNav: NavItem[] = [
    { label: 'Control Panel', path: ROUTE_PATHS.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { label: 'Student Approvals', path: ROUTE_PATHS.ADMIN_SIGNUP_MANAGEMENT, icon: UserCircle },
    { label: 'Placement Mgmt', path: ROUTE_PATHS.PLACEMENT_MGMT, icon: Building2 },
    { label: 'Library Inventory', path: ROUTE_PATHS.LIBRARY_MGMT, icon: Library },
    { label: 'Finance Ledger', path: ROUTE_PATHS.FINANCE_LEDGER, icon: Landmark },
    { label: 'Analytics', path: ROUTE_PATHS.FEEDBACK_ANALYTICS, icon: PieChart },
    { label: 'Faculty Oversight', path: ROUTE_PATHS.FACULTY_OVERSIGHT, icon: Users },
  ];

  const navItems = user.role === 'admin' ? adminNav : user.role === 'faculty' ? facultyNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.LOGIN);
  };



  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? '80px' : '260px' }}
        className="hidden lg:flex flex-col h-full bg-card/40 backdrop-blur-xl border-r border-white/5 relative z-40"
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)]">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isSidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-foreground"
            >
              UniCampus
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.8)]"
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                  {!isSidebarCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium">
                      {item.label}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Footer Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                <Avatar className="w-8 h-8 border border-white/10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">{user.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-primary font-bold">{user.role}</span>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-white/10">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <UserCircle className="w-4 h-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Settings className="w-4 h-4" /> Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary border border-white/20 text-primary-foreground shadow-lg lg:flex items-center justify-center hidden"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Global Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md border-b border-white/5 z-30">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search across modules..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-mono text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-[10px] text-primary font-bold">NIT CAMPUS • 2026</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Navigation (Bottom Bar) */}
        <div className="lg:hidden flex items-center justify-around h-16 bg-card/80 backdrop-blur-xl border-t border-white/10 px-2">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-card z-[60] lg:hidden p-6 flex flex-col border-r border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary" />
                  <span className="font-bold text-xl">UniCampus</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
                        isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} />
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.role}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-4 text-destructive hover:bg-destructive/10 justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
