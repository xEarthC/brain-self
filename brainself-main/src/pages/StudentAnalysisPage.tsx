import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';
import { Search, User, TrendingUp, BookOpen, Clock, Award } from 'lucide-react';

interface StudentData {
  profile: {
    id: string;
    nickname: string;
    grade_level: string;
  };
  marks: Array<{
    subject_name: string;
    marks: number;
    grade_level: string;
    term: string;
    year: number;
  }>;
  enrollments: Array<{
    course: {
      title: string;
    };
    progress_percentage: number;
  }>;
  studySessions: Array<{
    duration_minutes: number;
    activity_type: string;
    started_at: string;
  }>;
}

const StudentAnalysisPage = () => {
  const { isTeacher } = useRole();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(false);

  const searchStudent = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Search for student profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('nickname', `%${searchTerm}%`)
        .eq('role', 'student')
        .single();

      if (profileError) {
        toast({
          title: "Student not found",
          description: "No student found with that name",
          variant: "destructive",
        });
        return;
      }

      // Fetch student marks
      const { data: marks } = await supabase
        .from('student_marks')
        .select('*')
        .eq('student_id', profile.id)
        .order('year', { ascending: false })
        .order('term');

      // Fetch enrollments with course progress
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          progress_percentage,
          course:courses(title)
        `)
        .eq('user_id', profile.user_id);

      // Fetch study sessions
      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes, activity_type, started_at')
        .eq('user_id', profile.user_id)
        .order('started_at', { ascending: false })
        .limit(10);

      setStudentData({
        profile,
        marks: marks || [],
        enrollments: enrollments || [],
        studySessions: studySessions || [],
      });
    } catch (error) {
      console.error('Error searching student:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (marks: Array<{ marks: number }>) => {
    if (marks.length === 0) return 0;
    return Math.round(marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length);
  };

  const getTotalStudyTime = (sessions: Array<{ duration_minutes: number }>) => {
    return sessions.reduce((total, session) => total + session.duration_minutes, 0);
  };

  if (!isTeacher()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-effect neon-border">
          <CardContent className="p-8 text-center">
            <User className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need teacher access to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Card className="glass-effect neon-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 gradient-text">
              <Search className="h-6 w-6" />
              <span>Student Analysis</span>
            </CardTitle>
            <CardDescription>
              Search and analyze student performance and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="search">Student Name</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter student nickname"
                  onKeyPress={(e) => e.key === 'Enter' && searchStudent()}
                />
              </div>
              <Button onClick={searchStudent} disabled={loading} className="neon-glow mt-6">
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {studentData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Info */}
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Student Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <p className="text-lg font-semibold gradient-text">{studentData.profile.nickname}</p>
                  </div>
                  <div>
                    <Label>Grade Level</Label>
                    <Badge variant="secondary">{studentData.profile.grade_level.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Performance */}
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Academic Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Overall Average</Label>
                    <p className="text-2xl font-bold gradient-text">
                      {calculateAverage(studentData.marks)}%
                    </p>
                  </div>
                  <div>
                    <Label>Total Assessments</Label>
                    <p className="text-lg">{studentData.marks.length} tests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Marks */}
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Recent Test Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {studentData.marks.slice(0, 10).map((mark, index) => (
                    <div key={index} className="flex justify-between items-center p-2 glass-effect rounded">
                      <div>
                        <p className="font-medium">{mark.subject_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {mark.term.replace('_', ' ')} - {mark.year}
                        </p>
                      </div>
                      <Badge 
                        variant={mark.marks >= 80 ? "default" : mark.marks >= 60 ? "secondary" : "destructive"}
                      >
                        {mark.marks}%
                      </Badge>
                    </div>
                  ))}
                  {studentData.marks.length === 0 && (
                    <p className="text-muted-foreground text-center">No test results found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Course Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {studentData.enrollments.map((enrollment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 glass-effect rounded">
                      <p className="font-medium">{enrollment.course.title}</p>
                      <Badge variant="secondary">
                        {enrollment.progress_percentage}%
                      </Badge>
                    </div>
                  ))}
                  {studentData.enrollments.length === 0 && (
                    <p className="text-muted-foreground text-center">No enrolled courses</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Study Activity */}
            <Card className="glass-effect neon-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Study Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 glass-effect rounded">
                    <p className="text-2xl font-bold gradient-text">
                      {getTotalStudyTime(studentData.studySessions)} min
                    </p>
                    <p className="text-sm text-muted-foreground">Total Study Time</p>
                  </div>
                  <div className="text-center p-4 glass-effect rounded">
                    <p className="text-2xl font-bold gradient-text">
                      {studentData.studySessions.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Study Sessions</p>
                  </div>
                  <div className="text-center p-4 glass-effect rounded">
                    <p className="text-2xl font-bold gradient-text">
                      {studentData.studySessions.length > 0 ? 
                        Math.round(getTotalStudyTime(studentData.studySessions) / studentData.studySessions.length) : 0} min
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Session</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnalysisPage;