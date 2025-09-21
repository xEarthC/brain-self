import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';
import { FileText, Users, Plus } from 'lucide-react';

interface Student {
  id: string;
  nickname: string;
  registration_number?: string;
  email: string;
  role?: string;
}

const AddResultsPage = () => {
  const { isTeacher, profile, loading: roleLoading } = useRole();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    subject_name: '',
    marks: '',
    grade_level: '',
    term: '',
    year: new Date().getFullYear().toString(),
    registration_number: '',
  });

  useEffect(() => {
    if (profile) {
      fetchStudents();
    }
  }, [profile]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, registration_number, email, role')
        .order('nickname');

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch all users",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !isTeacher()) {
      toast({
        title: "Error",
        description: "You need teacher access to add marks",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const insertData: any = {
        subject_name: formData.subject_name,
        marks: parseInt(formData.marks),
        grade_level: formData.grade_level,
        term: formData.term,
        year: parseInt(formData.year),
        teacher_id: profile.id,
        teacher_name: profile.nickname,
      };

      // Add student_id if a student is selected, otherwise use the custom name
      if (formData.student_id) {
        insertData.student_id = formData.student_id;
      } else if (formData.student_name.trim()) {
        insertData.custom_student_name = formData.student_name;
      } else {
        toast({
          title: "Error",
          description: "Please select a student or enter a custom name",
          variant: "destructive",
        });
        return;
      }

      // Add registration_number if provided
      if (formData.registration_number.trim()) {
        insertData.registration_number = formData.registration_number;
      }

      console.log('Inserting marks data:', insertData);

      const { data, error } = await supabase
        .from('student_marks')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully inserted:', data);

      toast({
        title: "Success",
        description: "Marks added successfully!",
      });

      // Reset form
      setFormData({
        student_id: '',
        student_name: '',
        subject_name: '',
        marks: '',
        grade_level: '',
        term: '',
        year: new Date().getFullYear().toString(),
        registration_number: '',
      });
    } catch (error: any) {
      console.error('Error adding marks:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add marks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-effect neon-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTeacher()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-effect neon-border">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need teacher access to view this page.</p>
            {profile && (
              <p className="text-sm text-muted-foreground mt-2">
                Current role: {profile.role || 'student'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-effect neon-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 gradient-text">
              <Plus className="h-6 w-6" />
              <span>Add Student Results</span>
            </CardTitle>
            <CardDescription>
              Add term test marks for students
              {profile && (
                <span className="block text-sm mt-1">
                  Logged in as: {profile.nickname} ({profile.role})
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="student">User (Optional)</Label>
                  <Select value={formData.student_id} onValueChange={(value) => setFormData(prev => ({ ...prev, student_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user (optional)" />
                     </SelectTrigger>
                     <SelectContent className="bg-background border border-border z-50">
                       {students.map((student) => (
                         <SelectItem key={student.id} value={student.id}>
                           <div className="flex flex-col">
                             <span className="font-medium">{student.nickname}</span>
                             <span className="text-xs text-muted-foreground">
                               {student.email} • {student.role || 'student'}
                               {student.registration_number && ` • Reg: ${student.registration_number}`}
                             </span>
                           </div>
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="student_name">Custom Student Name</Label>
                  <Input
                    id="student_name"
                    placeholder="Enter student name manually"
                    value={formData.student_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, student_name: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use this if student is not in the dropdown
                  </p>
                </div>

                <div>
                  <Label htmlFor="reg-number">Registration Number (Optional)</Label>
                  <Input
                    id="reg-number"
                    value={formData.registration_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                    placeholder="e.g., STU001"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Student's registration number</p>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject_name: e.target.value }))}
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="marks">Marks (0-100)</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.marks}
                    onChange={(e) => setFormData(prev => ({ ...prev, marks: e.target.value }))}
                    placeholder="85"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="grade">Grade Level</Label>
                  <Select 
                    value={formData.grade_level} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, grade_level: value }))}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select grade" />
                     </SelectTrigger>
                     <SelectContent className="bg-background border border-border z-50">
                       {Array.from({ length: 8 }, (_, i) => i + 6).map((grade) => (
                         <SelectItem key={grade} value={`grade_${grade}`}>
                           Grade {grade}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="term">Term</Label>
                  <Select 
                    value={formData.term} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, term: value }))}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select term" />
                     </SelectTrigger>
                     <SelectContent className="bg-background border border-border z-50">
                       <SelectItem value="term_1">Term 1</SelectItem>
                       <SelectItem value="term_2">Term 2</SelectItem>
                       <SelectItem value="term_3">Term 3</SelectItem>
                     </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="2024"
                    required
                  />
                </div>
              </div>

                <Button 
                  type="submit" 
                  className="w-full neon-glow" 
                  disabled={loading || (!formData.student_id && !formData.student_name.trim())}
                >
                  {loading ? "Adding..." : "Add Results"}
                </Button>
                {(!formData.student_id && !formData.student_name.trim()) && (
                  <p className="text-xs text-destructive text-center">
                    Please select a student or enter a custom name
                  </p>
                )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddResultsPage;