import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, TrendingUp, Award, Search, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRole } from '@/hooks/useRole';
import { useToast } from '@/components/ui/use-toast';

interface StudentMark {
  id: string;
  subject_name: string;
  marks: number;
  grade_level: string;
  term: string;
  year: number;
  created_at: string;
  teacher_name?: string;
  custom_student_name?: string;
  teacher_id: string;
}

const MarksPage = () => {
  const { user } = useAuth();
  const { profile, isTeacher } = useRole();
  const { toast } = useToast();
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [filteredMarks, setFilteredMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [editingMark, setEditingMark] = useState<StudentMark | null>(null);
  const [editMarks, setEditMarks] = useState<number>(0);

  useEffect(() => {
    fetchMarks();
  }, []);

  useEffect(() => {
    filterMarks();
  }, [marks, searchTerm, selectedGrade, selectedTerm, selectedYear]);

  const fetchMarks = async () => {
    if (!user) return;

    try {
      // First get the user's profile details
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, nickname')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Fetch student marks (both direct assignment and custom name mentions)
      const { data, error } = await supabase
        .from('student_marks')
        .select('*')
        .or(`student_id.eq.${profile.id},custom_student_name.eq.${profile.nickname}`)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMarks(data || []);
    } catch (error) {
      console.error('Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMarks = () => {
    let filtered = [...marks];

    if (searchTerm) {
      filtered = filtered.filter(mark =>
        mark.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(mark => mark.grade_level === selectedGrade);
    }

    if (selectedTerm !== 'all') {
      filtered = filtered.filter(mark => mark.term === selectedTerm);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(mark => mark.year === parseInt(selectedYear));
    }

    setFilteredMarks(filtered);
  };

  const calculateAverage = (marksArray: StudentMark[]) => {
    if (marksArray.length === 0) return 0;
    return Math.round(marksArray.reduce((sum, mark) => sum + mark.marks, 0) / marksArray.length);
  };

  const getGradeVariant = (marks: number): "default" | "secondary" | "destructive" => {
    if (marks >= 80) return "default";
    if (marks >= 60) return "secondary";
    return "destructive";
  };

  const getGradeColor = (marks: number) => {
    if (marks >= 80) return "text-green-400";
    if (marks >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getUniqueYears = () => {
    const years = [...new Set(marks.map(mark => mark.year))];
    return years.sort((a, b) => b - a);
  };

  const handleEditMark = async () => {
    if (!editingMark) return;

    try {
      const { error } = await supabase
        .from('student_marks')
        .update({ marks: editMarks })
        .eq('id', editingMark.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mark updated successfully!",
      });

      setEditingMark(null);
      fetchMarks(); // Refresh marks
    } catch (error) {
      console.error('Error updating mark:', error);
      toast({
        title: "Error",
        description: "Failed to update mark",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (mark: StudentMark) => {
    setEditingMark(mark);
    setEditMarks(mark.marks);
  };

  const canEditMark = (mark: StudentMark) => {
    return isTeacher() && profile && mark.teacher_id === profile.id;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your marks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">My Term Test Results</h1>
          <p className="text-muted-foreground">View your academic performance across all subjects and terms</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-effect neon-border">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold gradient-text">{calculateAverage(filteredMarks)}%</p>
              <p className="text-sm text-muted-foreground">Overall Average</p>
            </CardContent>
          </Card>

          <Card className="glass-effect neon-border">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold gradient-text">{filteredMarks.length}</p>
              <p className="text-sm text-muted-foreground">Total Tests</p>
            </CardContent>
          </Card>

          <Card className="glass-effect neon-border">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold gradient-text">
                {filteredMarks.filter(mark => mark.marks >= 80).length}
              </p>
              <p className="text-sm text-muted-foreground">High Grades (80%+)</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-effect neon-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-6 w-6" />
              <span>Filter Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Search Subject</Label>
                <Input
                  placeholder="Enter subject name"
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
                <Label>Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Terms</SelectItem>
                    <SelectItem value="term_1">Term 1</SelectItem>
                    <SelectItem value="term_2">Term 2</SelectItem>
                    <SelectItem value="term_3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {getUniqueYears().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="glass-effect neon-border">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Your term test performance across all subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="space-y-3">
                {filteredMarks.map((mark) => (
                  <div key={mark.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center p-4 glass-effect rounded-lg hover-glow">
                    <div className="md:col-span-2">
                      <p className="font-semibold gradient-text">{mark.subject_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {mark.grade_level.replace('_', ' ')}
                      </p>
                      {mark.custom_student_name && (
                        <p className="text-xs text-primary mt-1">
                          Student: {mark.custom_student_name}
                        </p>
                      )}
                    </div>

                    <div className="text-center">
                      <Badge variant={getGradeVariant(mark.marks)} className="text-lg px-3 py-1">
                        {mark.marks}%
                      </Badge>
                    </div>

                    <div className="text-center">
                      <p className="font-medium">{mark.term.replace('_', ' ')}</p>
                    </div>

                    <div className="text-center">
                      <p className="font-medium">{mark.year}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Added by: {mark.teacher_name || 'Unknown'}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {new Date(mark.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-center">
                      {canEditMark(mark) && (
                        <Button
                          onClick={() => openEditDialog(mark)}
                          variant="ghost"
                          size="sm"
                          className="hover-glow"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredMarks.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {marks.length === 0 ? "No test results found. Check back after your teachers add your marks!" : "No results match your current filters."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Mark Dialog */}
        <Dialog open={!!editingMark} onOpenChange={() => setEditingMark(null)}>
          <DialogContent className="glass-effect neon-border">
            <DialogHeader>
              <DialogTitle>Edit Mark</DialogTitle>
              <DialogDescription>
                Update the mark for {editingMark?.subject_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-marks">Marks (0-100)</Label>
                <Input
                  id="edit-marks"
                  type="number"
                  min="0"
                  max="100"
                  value={editMarks}
                  onChange={(e) => setEditMarks(Number(e.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditMark} className="neon-glow">
                Update Mark
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MarksPage;