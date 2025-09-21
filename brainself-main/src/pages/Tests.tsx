import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { Clock, FileText, Trophy, Play, CheckCircle, Filter } from "lucide-react";
import Navigation from "@/components/Navigation";
import GradeSelector from "@/components/GradeSelector";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Test {
  id: string;
  title: string;
  title_si?: string;
  description: string;
  description_si?: string;
  difficulty_level: string;
  grade_level: string;
  total_questions: number;
  time_limit_minutes: number;
  subject: Subject;
  attempt?: {
    score: number;
    completed_at: string;
  };
}

const Tests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const { user } = useAuth();
  const { getLocalizedText } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, [user]);

  useEffect(() => {
    if (selectedGrade === "all") {
      setFilteredTests(tests);
    } else {
      setFilteredTests(tests.filter(test => test.grade_level === selectedGrade));
    }
  }, [tests, selectedGrade]);

  const fetchTests = async () => {
    try {
      let testsQuery = supabase
        .from('tests')
        .select(`
          id,
          title,
          title_si,
          description,
          description_si,
          difficulty_level,
          grade_level,
          total_questions,
          time_limit_minutes,
          subject:subjects(id, name, icon, color)
        `)
        .eq('is_published', true);

      const { data: testsData, error: testsError } = await testsQuery;

      if (testsError) throw testsError;

      if (user) {
        // Fetch user test attempts
        const { data: attemptsData } = await supabase
          .from('test_attempts')
          .select('test_id, score, completed_at')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null);

        const attemptMap = new Map(
          attemptsData?.map(a => [a.test_id, a]) || []
        );

        const testsWithAttempts = testsData?.map(test => ({
          ...test,
          attempt: attemptMap.get(test.id)
        }));

        setTests(testsWithAttempts || []);
      } else {
        setTests(testsData || []);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        title: "Error",
        description: "Failed to load tests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (testId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to take tests",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a new test attempt
      const { error } = await supabase
        .from('test_attempts')
        .insert({
          user_id: user.id,
          test_id: testId
        });

      if (error) throw error;

      // Start study session
      await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          activity_type: 'test_taking',
          activity_id: testId,
          duration_minutes: 0
        });

      toast({
        title: "Test Started!",
        description: "Good luck with your test!"
      });

      // Navigate to test taking page
      navigate(`/test/${testId}`);
    } catch (error: any) {
      toast({
        title: "Failed to Start Test",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            {t('tests.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('tests.subtitle')}
          </p>
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <GradeSelector 
                value={selectedGrade} 
                onChange={setSelectedGrade} 
                showAll={true}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTests.map((test) => (
            <Card key={test.id} className="glass-card border-primary/20 hover-glow group animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{test.subject?.icon}</span>
                    <Badge className={getDifficultyColor(test.difficulty_level)}>
                      {test.difficulty_level}
                    </Badge>
                  </div>
                  {test.attempt && (
                    <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {getLocalizedText(test.title, test.title_si)}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {test.subject?.name} • {t(`grades.${test.grade_level}`)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {test.description}
                </p>

                {test.attempt && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Your Score</span>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-green-700 dark:text-green-300">{test.attempt.score}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{test.total_questions} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{test.time_limit_minutes}min</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => startTest(test.id)}
                  className="w-full btn-gradient"
                  disabled={!user}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {test.attempt ? 'Retake Test' : 'Start Test'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTests.length === 0 && tests.length > 0 && (
          <div className="text-center py-12 col-span-full">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No Tests for Selected Grade</h3>
            <p className="text-muted-foreground">Try selecting a different grade level!</p>
          </div>
        )}

        {tests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No Tests Available</h3>
            <p className="text-muted-foreground">Check back later for new tests!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests;