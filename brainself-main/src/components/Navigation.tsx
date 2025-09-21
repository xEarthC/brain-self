import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import QuickNavigation from '@/components/QuickNavigation';
import { 
  Brain, 
  Home, 
  BookOpen, 
  Calendar, 
  Trophy, 
  MessageSquare, 
  Settings, 
  LogOut, 
  User,
  Languages,
  Clock,
  TestTube,
  FileText,
  BarChart3,
  UserCheck,
  TrendingUp
} from 'lucide-react';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { isTeacher, isAdmin, profile } = useRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (nickname: string) => {
    return nickname ? nickname.charAt(0).toUpperCase() : 'U';
  };

  return (
    <nav className="glass-effect border-b border-border/50 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-2 hover-glow p-2 rounded-lg transition-all duration-300">
          <div className="relative">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <span className="text-2xl font-bold gradient-text">
            BrainSelf
          </span>
        </Link>

        {/* Spacer to push content to the right */}
        <div className="flex-1" />

        {/* User Menu or Auth Buttons */}
        <div className="flex items-center space-x-2">
          {/* Quick Navigation */}
          <QuickNavigation />
          
          {/* Language Toggle */}
          <Button variant="ghost" size="sm" className="hover-glow">
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">EN</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover-glow">
                  <Avatar className="h-8 w-8 neon-border">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {getInitials(user.user_metadata?.nickname || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline gradient-text font-medium">
                    {user.user_metadata?.nickname || 'User'}
                  </span>
                  <Badge variant="secondary" className="hidden lg:inline-flex neon-glow">
                    {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) || 'Student'}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-effect neon-border">
                <DropdownMenuItem asChild>
                  <Link to="/marks" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>My Marks</span>
                  </Link>
                </DropdownMenuItem>
                {isTeacher() && (
                  <DropdownMenuItem asChild>
                    <Link to="/hwtd" className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>HWTD</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="hover-glow">
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild className="neon-glow">
                <Link to="/auth">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;