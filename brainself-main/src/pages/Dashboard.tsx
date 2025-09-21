import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Brain,
  Zap,
  Star,
  PlayCircle,
  TestTube,
  MessageSquare,
  FileText,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Courses Enrolled', value: '8', icon: BookOpen, color: 'text-primary' },
    { label: 'Hours Studied', value: '24', icon: Clock, color: 'text-accent' },
    { label: 'Tests Completed', value: '12', icon: TestTube, color: 'text-secondary' },
    { label: 'Achievements', value: '5', icon: Trophy, color: 'text-primary' },
  ];

  const recentCourses = [
    { id: 1, title: 'Advanced Mathematics', progress: 75, subject: 'Math', level: 'Advanced' },
    { id: 2, title: 'Physics Fundamentals', progress: 45, subject: 'Physics', level: 'Beginner' },
    { id: 3, title: 'Chemistry Basics', progress: 90, subject: 'Chemistry', level: 'Intermediate' },
  ];

  const upcomingSchedule = [
    { time: '09:00 AM', subject: 'Mathematics', type: 'Study Session' },
    { time: '02:00 PM', subject: 'Physics', type: 'Test' },
    { time: '04:00 PM', subject: 'Chemistry', type: 'Assignment Due' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="glass-effect rounded-xl p-6 neon-border">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold gradient-text">
                {user ? `Welcome back, ${user.user_metadata?.nickname || 'Learner'}!` : 'Welcome to BrainSelf!'}
              </h1>
              <p className="text-muted-foreground">
                {user ? 'Ready to continue your learning journey today?' : 'Your AI-powered learning platform. Sign up to unlock all features!'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-accent" />
              <Badge className="neon-glow">{user ? 'Level 1' : 'Guest'}</Badge>
              {!user && (
                <Button asChild className="neon-glow ml-4">
                  <Link to="/auth">Sign Up Free</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid - Only show for authenticated users */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-effect neon-border hover-glow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-primary/10`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Courses or Welcome Content */}
          <div className="lg:col-span-2">
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>{user ? 'Continue Learning' : 'Explore Courses'}</span>
                </CardTitle>
                <CardDescription>
                  {user ? 'Pick up where you left off' : 'Discover our comprehensive learning materials'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <>
                    {recentCourses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 rounded-lg glass-effect hover-glow">
                        <div className="flex-1">
                          <h3 className="font-semibold">{course.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{course.subject}</Badge>
                            <Badge variant="secondary">{course.level}</Badge>
                          </div>
                          <div className="mt-2">
                            <Progress value={course.progress} className="h-2" />
                            <p className="text-sm text-muted-foreground mt-1">{course.progress}% complete</p>
                          </div>
                        </div>
                        <Button size="sm" className="ml-4 hover-glow">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 rounded-lg glass-effect text-center">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-bold mb-2">AI-Powered Learning</h3>
                      <p className="text-muted-foreground mb-4">
                        Experience the future of education with our advanced AI assistant, interactive courses, and personalized learning paths.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-accent" />
                          <span>Smart Study Plans</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <span>Interactive Tests</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-accent" />
                          <span>AI Tutor</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span>Achievement System</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <Button asChild variant="outline" className="w-full hover-glow">
                  <Link to="/courses">View All Courses</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Schedule or Features */}
          <div>
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  <span>{user ? "Today's Schedule" : 'Quick Access'}</span>
                </CardTitle>
                <CardDescription>
                  {user ? 'Your upcoming tasks' : 'Try our features without signing up'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {user ? (
                  <>
                    {upcomingSchedule.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg glass-effect">
                        <div className="text-sm font-medium text-primary">{item.time}</div>
                        <div className="flex-1">
                          <p className="font-medium">{item.subject}</p>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="w-full hover-glow">
                      <Link to="/schedule">View Full Schedule</Link>
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full hover-glow">
                      <Link to="/ai-assistant" className="flex items-center justify-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Try AI Assistant</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full hover-glow">
                      <Link to="/courses" className="flex items-center justify-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Browse Courses</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full hover-glow">
                      <Link to="/marks" className="flex items-center justify-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Check Marks</span>
                      </Link>
                    </Button>
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground text-center mb-3">
                        Sign up to unlock all features
                      </p>
                      <Button asChild className="w-full neon-glow">
                        <Link to="/auth">Join BrainSelf</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="glass-effect neon-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Jump into your learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-20 flex flex-col hover-glow">
                <Link to="/ai-assistant">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span>AI Assistant</span>
                </Link>
              </Button>
              {user ? (
                <>
                  <Button asChild variant="outline" className="h-20 flex flex-col hover-glow">
                    <Link to="/tests">
                      <TestTube className="h-6 w-6 mb-2" />
                      <span>Take Test</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex flex-col hover-glow">
                    <Link to="/schedule">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span>Schedule</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex flex-col hover-glow">
                    <Link to="/achievements">
                      <Trophy className="h-6 w-6 mb-2" />
                      <span>Achievements</span>
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="h-20 flex flex-col hover-glow">
                    <Link to="/courses">
                      <BookOpen className="h-6 w-6 mb-2" />
                      <span>Courses</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex flex-col hover-glow">
                    <Link to="/marks">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Check Marks</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex flex-col hover-glow">
                    <Link to="/auth">
                      <User className="h-6 w-6 mb-2" />
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;