import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { 
  Menu, 
  Home, 
  BookOpen, 
  Calendar, 
  Trophy, 
  MessageSquare,
  TestTube,
  Users,
  BarChart3,
  UserCheck,
  Settings,
  FileText,
  TrendingUp,
  Brain,
  Zap,
  Languages,
  LogOut,
  User as UserIcon,
  GraduationCap,
  Target,
  Clock,
  Star
} from 'lucide-react';

const QuickNavigation = () => {
  const { user, signOut } = useAuth();
  const { isTeacher, isAdmin, profile } = useRole();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const publicPages = [
    { 
      href: '/', 
      icon: Home, 
      label: 'Home', 
      description: 'Dashboard and overview',
      badge: null 
    },
    { 
      href: '/courses', 
      icon: BookOpen, 
      label: 'Courses', 
      description: 'Browse learning materials',
      badge: 'Free' 
    },

    { 
      href: '/ainote', 
      icon: MessageSquare, 
      label: 'ShortNote Generator', 
      description: 'Generate Shortnote with AI',
      badge: 'API key Expired' 
    },
    { 
      href: '/ai-assistant', 
      icon: MessageSquare, 
      label: 'AI Assistant', 
      description: 'AI Assistant ',
      badge: 'API key Expired' 
    },
    { 
      href: '/msg', 
      icon: MessageSquare, 
      label: 'Messages', 
      description: 'View notifications',
      badge: user ? null : 'Login Required' 
    },
{ 
      href: '/about', 
      icon: MessageSquare, 
      label: 'About', 
      description: 'Things about the Site/Creaters ',
      badge: 'Free' 
    },

    { 
      href: '/contact', 
      icon: MessageSquare, 
      label: 'Contact Us', 
      description: 'To Contact Us or To Report Something ',
      badge: 'Free' 
    },


    { 
      href: '/marks', 
      icon: FileText, 
      label: 'Check Marks', 
      description: 'View your test results',
      badge: user ? null : 'Login Required' 
    },
  ];

  const studentPages = [
    { 
      href: '/tests', 
      icon: TestTube, 
      label: 'Tests', 
      description: 'Take practice tests',
      badge: 'Login Required' 
    },
    { 
      href: '/schedule', 
      icon: Calendar, 
      label: 'Schedule', 
      description: 'Manage your timetable',
      badge: null 
    },
    { 
      href: '/achievements', 
      icon: Trophy, 
      label: 'Achievements', 
      description: 'Track your progress',
      badge: null 
    },
     { 
      href: '/ppp', 
      icon: TestTube, 
      label: 'Past Papers', 
      description: 'Download Past Papers',
      badge: 'Free' 
    },
    { 
      href: '/my-groups', 
      icon: Users, 
      label: 'My Groups', 
      description: 'Groups you are a member of',
      badge: null 
    },
  ];

  const teacherPages = [
    { 
      href: '/add-results', 
      icon: FileText, 
      label: 'Add Results', 
      description: 'Enter student marks',
      badge: 'Teacher' 
    },
    { 
      href: '/student-analysis', 
      icon: BarChart3, 
      label: 'Student Analysis', 
      description: 'View student progress',
      badge: 'Teacher' 
    },
    { 
      href: '/groups', 
      icon: Users, 
      label: 'Manage Groups', 
      description: 'Create and manage student groups',
      badge: 'Teacher' 
    },
    { 
      href: '/my-groups', 
      icon: MessageSquare, 
      label: 'My Groups', 
      description: 'Groups you are a member of',
      badge: null 
    },
    { 
      href: '/hwtd', 
      icon: TrendingUp, 
      label: 'HWTD', 
      description: 'How Well They Doing',
      badge: 'Teacher' 
    },
  ];

  const adminPages = [
    { 
      href: '/give-access', 
      icon: UserCheck, 
      label: 'Give Access', 
      description: 'Manage user permissions',
      badge: 'Admin Only' 
    },
    { 
      href: '/school-tags', 
      icon: Target, 
      label: 'School Tags', 
      description: 'Manage custom school roles',
      badge: 'Admin Only' 
    },
    { 
      href: '/assign-schools', 
      icon: Users, 
      label: 'Assign Schools', 
      description: 'Assign users to school tags',
      badge: 'Admin Only' 
    },
  ];

  const handleNavigation = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  const NavSection = ({ title, pages, icon: SectionIcon }) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 px-2">
        <SectionIcon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-1">
        {pages.map((page) => (
          <Button
            key={page.href}
            variant="ghost"
            className="w-full justify-start h-auto p-3 hover:bg-accent/50 transition-colors"
            onClick={() => handleNavigation(page.href)}
          >
            <div className="flex items-center space-x-3 w-full">
              <page.icon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{page.label}</span>
                  {page.badge && (
                    <Badge 
                      variant={page.badge === 'Free' ? 'secondary' : 'outline'} 
                      className="text-xs"
                    >
                      {page.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{page.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-accent/50 transition-colors relative">
          <Menu className="h-5 w-5" />
          <span className="hidden sm:inline ml-2">Quick Nav</span>
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto bg-background border-r">
        <SheetHeader className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl text-foreground">BrainSelf</SheetTitle>
              <p className="text-sm text-muted-foreground">AI-Powered Learning Platform</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/10">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {user.user_metadata?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{user.user_metadata?.nickname || 'User'}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {profile?.role?.charAt(0)?.toUpperCase() + profile?.role?.slice(1) || 'Student'}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-accent" />
                    <span className="text-xs text-muted-foreground">Level 1</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Public Pages */}
          <NavSection title="Explore" pages={publicPages} icon={Zap} />

          <Separator />

          {/* Student Pages */}
          {user && (
            <>
              <NavSection title="Learning Hub" pages={studentPages} icon={GraduationCap} />
              <Separator />
            </>
          )}

          {/* Teacher Pages */}
          {isTeacher() && (
            <>
              <NavSection title="Teacher Tools" pages={teacherPages} icon={Users} />
              <Separator />
            </>
          )}

          {/* Admin Pages */}
          {isAdmin() && (
            <>
              <NavSection title="Administration" pages={adminPages} icon={Settings} />
              <Separator />
            </>
          )}

            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-2">
                <Settings className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Account</h3>
              </div>
              
              {user ? (
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-accent/50 transition-colors"
                    onClick={() => handleNavigation('/profile')}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>Profile Settings</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-accent/50 transition-colors">
                    <Languages className="h-4 w-4 mr-2" />
                    <span>Language: English</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 transition-colors" 
                    onClick={() => handleNavigation('/auth')}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Sign Up Free
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-accent/50 transition-colors" 
                    onClick={() => handleNavigation('/auth')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      🎉 Try AI Assistant for free!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Features Highlight */}
            <div className="p-4 rounded-lg bg-accent/10 border border-border">
              <div className="text-center space-y-2">
                <Brain className="h-8 w-8 mx-auto text-primary" />
                <h4 className="font-semibold text-foreground">AI-Powered Learning</h4>
                <p className="text-xs text-muted-foreground">
                  Experience the future of education with smart tutoring and personalized learning paths.
                </p>
                {!user && (
                  <Button 
                    size="sm" 
                    className="w-full bg-primary hover:bg-primary/90 transition-colors" 
                    onClick={() => handleNavigation('/auth')}
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickNavigation;