import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Clock, CheckCircle, Trophy, Download, ArrowLeft } from "lucide-react";
import html2canvas from "html2canvas";

interface Question {
  id: string;
  question_text: string;
  options: any; // JSON object with options
  correct_answer: string;
  question_type: string;
  explanation: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  total_questions: number;
  time_limit_minutes: number;
  subject: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

const TestTaking = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string>("");
  const [studySessionId, setStudySessionId] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !testId) {
      navigate('/tests');
      return;
    }
    fetchTestData();
  }, [testId, user, authLoading]);

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      handleSubmitTest();
    }
  }, [timeLeft, isCompleted]);

  const fetchTestData = async () => {
    try {
      // Fetch test details
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select(`
          id,
          title,
          description,
          difficulty_level,
          total_questions,
          time_limit_minutes,
          subject:subjects(id, name, icon, color)
        `)
        .eq('id', testId)
        .single();

      if (testError) throw testError;

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_id', testId)
        .order('created_at');

      if (questionsError) throw questionsError;

      setTest(testData);
      setQuestions(questionsData || []);
      setTimeLeft(testData.time_limit_minutes * 60);

      // Create test attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('test_attempts')
        .insert({
          user_id: user?.id,
          test_id: testId
        })
        .select()
        .single();

      if (attemptError) throw attemptError;
      setAttemptId(attemptData.id);

      // Create study session
      const { data: sessionData, error: sessionError } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user?.id,
          activity_type: 'test_taking',
          activity_id: testId,
          duration_minutes: 0
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setStudySessionId(sessionData.id);

    } catch (error) {
      console.error('Error fetching test:', error);
      toast({
        title: "Error",
        description: "Failed to load test",
        variant: "destructive"
      });
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestionIndex].id]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = async () => {
    try {
      // Calculate score
      let correctAnswers = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          correctAnswers++;
        }
      });

      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      setScore(finalScore);

      // Calculate study time
      const studyTimeMinutes = Math.round((test!.time_limit_minutes * 60 - timeLeft) / 60);

      // Update test attempt
      await supabase
        .from('test_attempts')
        .update({
          score: finalScore,
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId);

      // Update study session
      await supabase
        .from('study_sessions')
        .update({
          duration_minutes: studyTimeMinutes,
          completed_at: new Date().toISOString()
        })
        .eq('id', studySessionId);

      setIsCompleted(true);

      toast({
        title: "Test Completed!",
        description: `You scored ${finalScore}% and earned ${studyTimeMinutes} minutes of study time!`
      });

    } catch (error) {
      console.error('Error submitting test:', error);
      toast({
        title: "Error",
        description: "Failed to submit test",
        variant: "destructive"
      });
    }
  };

  const exportResultAsPNG = async () => {
    try {
      const resultElement = document.getElementById('test-result');
      if (!resultElement) return;

      const canvas = await html2canvas(resultElement, {
        backgroundColor: '#1a1a2e',
        scale: 2
      });

      const link = document.createElement('a');
      link.download = `${test?.title}-result.png`;
      link.href = canvas.toDataURL();
      link.click();

      // Award achievement for exporting results
      try {
        const { data: exportAchievement } = await supabase
          .from('achievements')
          .select('id')
          .eq('name', 'Export Master')
          .single();

        if (exportAchievement) {
          await supabase
            .from('user_achievements')
            .insert({
              user_id: user?.id,
              achievement_id: exportAchievement.id
            });
        }
      } catch (error) {
        // Achievement might already exist or other error
        console.log('Achievement award attempt:', error);
      }

      toast({
        title: "Result Exported!",
        description: "Your test result has been saved as a PNG file"
      });
    } catch (error) {
      console.error('Error exporting result:', error);
      toast({
        title: "Export Failed",
        description: "Could not export result",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Test not found</p>
          <Button onClick={() => navigate('/tests')} className="mt-4">
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-2xl">
          <div id="test-result" className="glass-card p-8 rounded-lg">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Test Completed!</h1>
              <h2 className="text-xl text-muted-foreground">{test.title}</h2>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold gradient-text mb-2">{score}%</div>
                <p className="text-muted-foreground">Your Score</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{Object.keys(answers).length}</div>
                  <p className="text-sm text-muted-foreground">Questions Answered</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{Math.round((test.time_limit_minutes * 60 - timeLeft) / 60)}min</div>
                  <p className="text-sm text-muted-foreground">Study Time Earned</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={exportResultAsPNG} className="flex-1 btn-gradient">
                  <Download className="mr-2 h-4 w-4" />
                  Export as PNG
                </Button>
                <Button onClick={() => navigate('/tests')} variant="outline" className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tests
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Completed on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/tests')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Test
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{test.title}</h1>
              <p className="text-muted-foreground">{test.subject.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(timeLeft)}
            </Badge>
            <Badge variant="secondary">
              {currentQuestionIndex + 1} of {questions.length}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Question */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, value], index) => {
              const letter = key.toUpperCase(); // Use the key as letter (A, B, C, D)
              const isSelected = answers[currentQuestion.id] === letter;
              
              return (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(letter)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                    }`}>
                      {letter}
                    </div>
                    <span>{value as string}</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmitTest} className="btn-gradient">
              <CheckCircle className="mr-2 h-4 w-4" />
              Finish Test
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} className="btn-gradient">
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestTaking;