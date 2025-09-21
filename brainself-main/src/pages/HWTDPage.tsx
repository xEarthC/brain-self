import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';
import { TrendingUp, Users, Award, BookOpen, Clock, Target, Search, BarChart3, TrendingDown, AlertTriangle, CheckCircle2, Calendar, FileText } from 'lucide-react';

interface StudentOverview {
  id: string;
  nickname: string;
  registration_number?: string;
  grade_level: string;
  avgMarks: number;
  totalStudyTime: number;
  completedCourses: number;
  recentActivity: string;
  subjectPerformance: { [subject: string]: number };
  totalTests: number;
  improvementTrend: 'up' | 'down' | 'stable';
}

interface SubjectAnalysis {
  subject: string;
  avgMarks: number;
  studentCount: number;
  bestStudent: string;
  worstStudent: string;
}

interface GradeDistribution {
  grade: string;
  A: number; // 80-100
  B: number; // 60-79
  C: number; // 40-59
  F: number; // 0-39
  total: number;
}

const HWTDPage = () => {
  const { isTeacher } = useRole();
  const [students, setStudents] = useState<StudentOverview[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentOverview[]>([]);
  const [subjectAnalysis, setSubjectAnalysis] = useState<SubjectAnalysis[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedPerformance, setSelectedPerformance] = useState<string>('all');
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgClassPerformance: 0,
    totalStudyHours: 0,
    activeStudents: 0,
    atRiskStudents: 0,
    excellentStudents: 0,
  });

  useEffect(() => {
    if (isTeacher()) {
      fetchStudentOverview();
    }
  }, [isTeacher()]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedGrade, selectedPerformance]);

  const fetchStudentOverview = async () => {
    setLoading(true);
    try {
      // Fetch all students
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (!profiles) return;

      const studentOverviews: StudentOverview[] = [];
      const subjectMap = new Map<string, { total: number, count: number, students: string[] }>();
      const gradeMap = new Map<string, { A: number, B: number, C: number, F: number, total: number }>();
      let totalMarksSum = 0;
      let totalStudyTimeSum = 0;
      let studentsWithMarks = 0;
      let atRiskCount = 0;
      let excellentCount = 0;

      for (const profile of profiles) {
        // Fetch marks for each student
        const { data: marks } = await supabase
          .from('student_marks')
          .select('marks, subject_name, created_at')
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false });

        // Calculate average marks and subject performance
        const avgMarks = marks && marks.length > 0 
          ? Math.round(marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length)
          : 0;

        const subjectPerformance: { [subject: string]: number } = {};
        if (marks) {
          const subjectGroups = marks.reduce((acc, mark) => {
            if (!acc[mark.subject_name]) acc[mark.subject_name] = [];
            acc[mark.subject_name].push(mark.marks);
            return acc;
          }, {} as { [key: string]: number[] });

          Object.entries(subjectGroups).forEach(([subject, subjectMarks]) => {
            const avg = Math.round(subjectMarks.reduce((sum, mark) => sum + mark, 0) / subjectMarks.length);
            subjectPerformance[subject] = avg;

            // Update subject analysis
            if (!subjectMap.has(subject)) {
              subjectMap.set(subject, { total: 0, count: 0, students: [] });
            }
            const subjectData = subjectMap.get(subject)!;
            subjectData.total += avg;
            subjectData.count += 1;
            subjectData.students.push(`${profile.nickname}: ${avg}%`);
          });
        }

        // Calculate improvement trend (simplified)
        let improvementTrend: 'up' | 'down' | 'stable' = 'stable';
        if (marks && marks.length >= 2) {
          const recent = marks.slice(0, Math.min(3, marks.length));
          const older = marks.slice(-Math.min(3, marks.length));
          const recentAvg = recent.reduce((sum, m) => sum + m.marks, 0) / recent.length;
          const olderAvg = older.reduce((sum, m) => sum + m.marks, 0) / older.length;
          improvementTrend = recentAvg > olderAvg + 5 ? 'up' : recentAvg < olderAvg - 5 ? 'down' : 'stable';
        }

        if (avgMarks > 0) {
          totalMarksSum += avgMarks;
          studentsWithMarks++;
          
          if (avgMarks < 50) atRiskCount++;
          if (avgMarks >= 85) excellentCount++;
        }

        // Grade distribution
        const gradeLevel = profile.grade_level;
        if (!gradeMap.has(gradeLevel)) {
          gradeMap.set(gradeLevel, { A: 0, B: 0, C: 0, F: 0, total: 0 });
        }
        const gradeData = gradeMap.get(gradeLevel)!;
        gradeData.total += 1;
        if (avgMarks >= 80) gradeData.A += 1;
        else if (avgMarks >= 60) gradeData.B += 1;
        else if (avgMarks >= 40) gradeData.C += 1;
        else if (avgMarks > 0) gradeData.F += 1;

        // Fetch study sessions
        const { data: studySessions } = await supabase
          .from('study_sessions')
          .select('duration_minutes, started_at')
          .eq('user_id', profile.user_id)
          .order('started_at', { ascending: false });

        const totalStudyTime = studySessions 
          ? studySessions.reduce((sum, session) => sum + session.duration_minutes, 0)
          : 0;

        totalStudyTimeSum += totalStudyTime;

        // Fetch completed courses
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('progress_percentage')
          .eq('user_id', profile.user_id);

        const completedCourses = enrollments 
          ? enrollments.filter(e => e.progress_percentage === 100).length
          : 0;

        // Recent activity
        const recentActivity = studySessions && studySessions.length > 0
          ? new Date(studySessions[0].started_at).toLocaleDateString()
          : 'No recent activity';

        studentOverviews.push({
          id: profile.id,
          nickname: profile.nickname,
          registration_number: profile.registration_number,
          grade_level: profile.grade_level,
          avgMarks,
          totalStudyTime,
          completedCourses,
          recentActivity,
          subjectPerformance,
          totalTests: marks?.length || 0,
          improvementTrend,
        });
      }

      // Process subject analysis
      const subjects: SubjectAnalysis[] = [];
      subjectMap.forEach((data, subject) => {
        const avgMarks = Math.round(data.total / data.count);
        const studentPerformances = data.students.map(s => {
          const [name, mark] = s.split(': ');
          return { name, mark: parseInt(mark) };
        });
        const best = studentPerformances.reduce((max, s) => s.mark > max.mark ? s : max);
        const worst = studentPerformances.reduce((min, s) => s.mark < min.mark ? s : min);
        
        subjects.push({
          subject,
          avgMarks,
          studentCount: data.count,
          bestStudent: `${best.name} (${best.mark}%)`,
          worstStudent: `${worst.name} (${worst.mark}%)`,
        });
      });

      // Process grade distribution
      const grades: GradeDistribution[] = [];
      gradeMap.forEach((data, grade) => {
        grades.push({
          grade: grade.replace('_', ' '),
          ...data,
        });
      });

      // Calculate class statistics
      const avgClassPerformance = studentsWithMarks > 0 
        ? Math.round(totalMarksSum / studentsWithMarks)
        : 0;

      const activeStudents = studentOverviews.filter(
        s => s.recentActivity !== 'No recent activity'
      ).length;

      setStats({
        totalStudents: profiles.length,
        avgClassPerformance,
        totalStudyHours: Math.round(totalStudyTimeSum / 60),
        activeStudents,
        atRiskStudents: atRiskCount,
        excellentStudents: excellentCount,
      });

      setStudents(studentOverviews.sort((a, b) => b.avgMarks - a.avgMarks));
      setSubjectAnalysis(subjects.sort((a, b) => b.avgMarks - a.avgMarks));
      setGradeDistribution(grades);
    } catch (error) {
      console.error('Error fetching student overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.registration_number && student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(student => student.grade_level === selectedGrade);
    }

    if (selectedPerformance !== 'all') {
      if (selectedPerformance === 'excellent') {
        filtered = filtered.filter(student => student.avgMarks >= 85);
      } else if (selectedPerformance === 'good') {
        filtered = filtered.filter(student => student.avgMarks >= 70 && student.avgMarks < 85);
      } else if (selectedPerformance === 'average') {
        filtered = filtered.filter(student => student.avgMarks >= 50 && student.avgMarks < 70);
      } else if (selectedPerformance === 'at-risk') {
        filtered = filtered.filter(student => student.avgMarks < 50 && student.avgMarks > 0);
      } else if (selectedPerformance === 'no-data') {
        filtered = filtered.filter(student => student.avgMarks === 0);
      }
    }

    setFilteredStudents(filtered);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPerformanceColor = (marks: number) => {
    if (marks >= 80) return "text-green-400";
    if (marks >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getPerformanceVariant = (marks: number): "default" | "secondary" | "destructive" => {
    if (marks >= 80) return "default";
    if (marks >= 60) return "secondary";
    return "destructive";
  };

  if (!isTeacher()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-effect neon-border">
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need teacher access to view this page.</p>
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
            <p className="text-muted-foreground">Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">How Well They're Doing (HWTD)</h1>
          <p className="text-muted-foreground">Comprehensive analytics of student performance and engagement</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="grades">Grade Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Class Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="glass-effect neon-border">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold gradient-text">{stats.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </CardContent>
              </Card>

              <Card className="glass-effect neon-border">
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold gradient-text">{stats.avgClassPerformance}%</p>
                  <p className="text-xs text-muted-foreground">Class Average</p>
                </CardContent>
              </Card>

              <Card className="glass-effect neon-border">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-green-400">{stats.excellentStudents}</p>
                  <p className="text-xs text-muted-foreground">Excellent (85%+)</p>
                </CardContent>
              </Card>

              <Card className="glass-effect neon-border">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-red-400">{stats.atRiskStudents}</p>
                  <p className="text-xs text-muted-foreground">At Risk (&lt;50%)</p>
                </CardContent>
              </Card>

              <Card className="glass-effect neon-border">
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold gradient-text">{stats.totalStudyHours}h</p>
                  <p className="text-xs text-muted-foreground">Study Hours</p>
                </CardContent>
              </Card>

              <Card className="glass-effect neon-border">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold gradient-text">{stats.activeStudents}</p>
                  <p className="text-xs text-muted-foreground">Active Students</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-effect neon-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Performance Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Class Performance Distribution</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Excellent (85%+)</span>
                      <Badge variant="default">{stats.excellentStudents} students</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>At Risk (&lt;50%)</span>
                      <Badge variant="destructive">{stats.atRiskStudents} students</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Overall Class Health</span>
                      <Badge variant={stats.avgClassPerformance >= 70 ? "default" : stats.avgClassPerformance >= 50 ? "secondary" : "destructive"}>
                        {stats.avgClassPerformance >= 70 ? "Good" : stats.avgClassPerformance >= 50 ? "Average" : "Needs Attention"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect neon-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Engagement Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Students</span>
                      <span>{stats.activeStudents} of {stats.totalStudents}</span>
                    </div>
                    <Progress value={(stats.activeStudents / stats.totalStudents) * 100} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Engagement Rate</span>
                      <Badge variant={stats.activeStudents / stats.totalStudents >= 0.7 ? "default" : "secondary"}>
                        {Math.round((stats.activeStudents / stats.totalStudents) * 100)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Filters */}
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Filter Students</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Search Students</Label>
                    <Input
                      placeholder="Name or registration number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Grade Level</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {Array.from({ length: 8 }, (_, i) => i + 6).map((grade) => (
                          <SelectItem key={grade} value={`grade_${grade}`}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Performance Level</Label>
                    <Select value={selectedPerformance} onValueChange={setSelectedPerformance}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="excellent">Excellent (85%+)</SelectItem>
                        <SelectItem value="good">Good (70-84%)</SelectItem>
                        <SelectItem value="average">Average (50-69%)</SelectItem>
                        <SelectItem value="at-risk">At Risk (&lt;50%)</SelectItem>
                        <SelectItem value="no-data">No Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Performance Table */}
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-6 w-6" />
                    <span>Student Performance Overview</span>
                  </div>
                  <Badge variant="outline">{filteredStudents.length} students</Badge>
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of each student's academic progress and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className="p-4 glass-effect rounded-lg border hover-glow transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-center">
                        <div className="lg:col-span-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getTrendIcon(student.improvementTrend)}
                              <div>
                                <p className="font-semibold gradient-text">{student.nickname}</p>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <span>{student.grade_level.replace('_', ' ')}</span>
                                  {student.registration_number && (
                                    <span>• Reg: {student.registration_number}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <Badge variant={getPerformanceVariant(student.avgMarks)}>
                            {student.avgMarks > 0 ? `${student.avgMarks}%` : 'No data'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Avg. Score</p>
                        </div>

                        <div className="text-center">
                          <p className="font-semibold">{student.totalTests}</p>
                          <p className="text-xs text-muted-foreground">Tests Taken</p>
                        </div>

                        <div className="text-center">
                          <p className="font-semibold">{Math.round(student.totalStudyTime / 60)}h</p>
                          <p className="text-xs text-muted-foreground">Study Time</p>
                        </div>

                        <div className="text-center">
                          <p className="font-semibold">{student.completedCourses}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm">{student.recentActivity}</p>
                          <p className="text-xs text-muted-foreground">Last Activity</p>
                        </div>

                        <div className="text-center">
                          <Button size="sm" variant="outline" onClick={() => window.open(`/student-analysis?search=${student.nickname}`, '_blank')}>
                            View Details
                          </Button>
                        </div>
                      </div>

                      {student.avgMarks > 0 && (
                        <div className="mt-3 space-y-2">
                          <Progress 
                            value={student.avgMarks} 
                            className="h-2" 
                          />
                          {Object.keys(student.subjectPerformance).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(student.subjectPerformance).map(([subject, score]) => (
                                <Badge 
                                  key={subject} 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {subject}: {score}%
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No students match your current filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Subject Performance Analysis</span>
                </CardTitle>
                <CardDescription>
                  Performance breakdown by subject across all students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectAnalysis.map((subject) => (
                    <div key={subject.subject} className="p-4 glass-effect rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <p className="font-semibold gradient-text">{subject.subject}</p>
                          <p className="text-sm text-muted-foreground">{subject.studentCount} students</p>
                        </div>
                        <div className="text-center">
                          <Badge variant={getPerformanceVariant(subject.avgMarks)}>
                            {subject.avgMarks}%
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Average</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-400">{subject.bestStudent}</p>
                          <p className="text-xs text-muted-foreground">Top Performer</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-red-400">{subject.worstStudent}</p>
                          <p className="text-xs text-muted-foreground">Needs Support</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={subject.avgMarks} className="h-2" />
                      </div>
                    </div>
                  ))}
                  {subjectAnalysis.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No subject data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Grade Level Distribution</span>
                </CardTitle>
                <CardDescription>
                  Performance distribution across different grade levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gradeDistribution.map((grade) => (
                    <div key={grade.grade} className="p-4 glass-effect rounded-lg">
                      <div className="mb-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold gradient-text">{grade.grade}</h3>
                          <span className="text-sm text-muted-foreground">{grade.total} students</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-400">{grade.A}</p>
                          <p className="text-xs text-muted-foreground">A (80-100%)</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-400">{grade.B}</p>
                          <p className="text-xs text-muted-foreground">B (60-79%)</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-yellow-400">{grade.C}</p>
                          <p className="text-xs text-muted-foreground">C (40-59%)</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-red-400">{grade.F}</p>
                          <p className="text-xs text-muted-foreground">F (0-39%)</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-1 h-2">
                        <div className="bg-green-400 rounded" style={{ width: `${(grade.A / grade.total) * 100}%` }}></div>
                        <div className="bg-blue-400 rounded" style={{ width: `${(grade.B / grade.total) * 100}%` }}></div>
                        <div className="bg-yellow-400 rounded" style={{ width: `${(grade.C / grade.total) * 100}%` }}></div>
                        <div className="bg-red-400 rounded" style={{ width: `${(grade.F / grade.total) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {gradeDistribution.length === 0 && (
                    <div className="text-center py-8">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No grade distribution data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HWTDPage;