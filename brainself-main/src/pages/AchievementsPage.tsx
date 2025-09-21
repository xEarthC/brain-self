import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Star, Target, Award, Medal, Crown } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
  earned?: boolean;
  earned_at?: string;
  progress?: number;
}

const AchievementsPage = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    earnedCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      // Fetch all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: false });

      if (achievementsError) throw achievementsError;

      // Fetch user's earned achievements
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', user!.id);

      if (userAchievementsError) throw userAchievementsError;

      // Fetch user stats for progress calculation
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes')
        .eq('user_id', user!.id);

      const { data: testAttempts } = await supabase
        .from('test_attempts')
        .select('score')
        .eq('user_id', user!.id)
        .not('completed_at', 'is', null);

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('progress_percentage')
        .eq('user_id', user!.id);

      // Calculate user stats
      const totalStudyMinutes = studySessions?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0;
      const completedTests = testAttempts?.length || 0;
      const completedCourses = enrollments?.filter(e => e.progress_percentage === 100).length || 0;
      const averageScore = testAttempts?.length 
        ? testAttempts.reduce((sum, test) => sum + (test.score || 0), 0) / testAttempts.length
        : 0;

      // Merge achievements with user progress
      const achievementsWithProgress = allAchievements?.map(achievement => {
        const earned = userAchievements?.find(ua => ua.achievement_id === achievement.id);
        
        let progress = 0;
        switch (achievement.requirement_type) {
          case 'study_time_minutes':
            progress = Math.min(100, (totalStudyMinutes / achievement.requirement_value) * 100);
            break;
          case 'tests_completed':
            progress = Math.min(100, (completedTests / achievement.requirement_value) * 100);
            break;
          case 'courses_completed':
            progress = Math.min(100, (completedCourses / achievement.requirement_value) * 100);
            break;
          case 'average_score':
            progress = Math.min(100, (averageScore / achievement.requirement_value) * 100);
            break;
          default:
            progress = 0;
        }

        return {
          ...achievement,
          earned: !!earned,
          earned_at: earned?.earned_at,
          progress: earned ? 100 : progress,
        };
      }) || [];

      setAchievements(achievementsWithProgress);

      // Calculate stats
      const earnedAchievements = achievementsWithProgress.filter(a => a.earned);
      const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);
      
      setUserStats({
        totalPoints,
        earnedCount: earnedAchievements.length,
        totalCount: achievementsWithProgress.length,
      });

    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className="h-6 w-6" />;
      case 'star':
        return <Star className="h-6 w-6" />;
      case 'target':
        return <Target className="h-6 w-6" />;
      case 'medal':
        return <Medal className="h-6 w-6" />;
      case 'crown':
        return <Crown className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  const formatRequirement = (type: string, value: number) => {
    switch (type) {
      case 'study_time_minutes':
        return `Study for ${Math.round(value / 60)} hours`;
      case 'tests_completed':
        return `Complete ${value} tests`;
      case 'courses_completed':
        return `Complete ${value} courses`;
      case 'average_score':
        return `Achieve ${value}% average score`;
      default:
        return `Complete requirement: ${value}`;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-effect neon-border">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground">Please login to view your achievements.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Achievements</h1>
          <p className="text-muted-foreground">Track your learning progress and unlock rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-effect neon-border">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold gradient-text">{userStats.totalPoints}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </CardContent>
          </Card>

          <Card className="glass-effect neon-border">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold gradient-text">
                {userStats.earnedCount}/{userStats.totalCount}
              </p>
              <p className="text-sm text-muted-foreground">Achievements Earned</p>
            </CardContent>
          </Card>

          <Card className="glass-effect neon-border">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold gradient-text">
                {Math.round((userStats.earnedCount / userStats.totalCount) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`glass-effect transition-all duration-300 hover-glow ${
                achievement.earned ? 'neon-border' : 'border-muted'
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-full ${
                    achievement.earned ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'
                  }`}>
                    {getIcon(achievement.icon)}
                  </div>
                  <Badge 
                    variant={achievement.earned ? "default" : "secondary"}
                    className={achievement.earned ? "neon-glow" : ""}
                  >
                    {achievement.points} pts
                  </Badge>
                </div>
                <CardTitle className={`text-lg ${achievement.earned ? 'gradient-text' : 'text-muted-foreground'}`}>
                  {achievement.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {achievement.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {formatRequirement(achievement.requirement_type, achievement.requirement_value)}
                  </div>
                  
                  {!achievement.earned && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(achievement.progress || 0)}%</span>
                      </div>
                      <Progress value={achievement.progress || 0} className="h-2" />
                    </div>
                  )}

                  {achievement.earned && achievement.earned_at && (
                    <div className="text-sm text-green-400">
                      ✓ Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No achievements available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;