import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Plus, UserPlus, Tag, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Group {
  id: string;
  name: string;
  description: string;
  school_tag_id: string | null;
  created_at: string;
  school_tags?: {
    display_name: string;
    color: string;
  } | null;
}

interface SchoolTag {
  id: string;
  display_name: string;
  color: string;
}

interface Student {
  id: string;
  nickname: string;
  role: string;
  user_id: string;
  user_school_tags?: {
    school_tag_id: string;
  }[];
}

const GroupsPage = () => {
  const { user } = useAuth();
  const { isTeacher, profile } = useRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [schoolTags, setSchoolTags] = useState<SchoolTag[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [currentUserSchoolTags, setCurrentUserSchoolTags] = useState<string[]>([]);
  
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    school_tag_id: '',
  });

  const [memberForm, setMemberForm] = useState({
    user_id: '',
  });

  useEffect(() => {
    if (isTeacher()) {
      fetchGroups();
      fetchSchoolTags();
      fetchCurrentUserSchoolTags();
    }
  }, [isTeacher, profile]);

  const fetchCurrentUserSchoolTags = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_school_tags')
        .select('school_tag_id')
        .eq('user_id', profile.id);

      if (error) throw error;
      setCurrentUserSchoolTags(data?.map(tag => tag.school_tag_id) || []);
    } catch (error) {
      console.error('Error fetching user school tags:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          school_tag_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch school tags separately for groups that have them
      const groupsWithTags = await Promise.all(
        (data || []).map(async (group) => {
          if (group.school_tag_id) {
            const { data: tagData } = await supabase
              .from('school_tags')
              .select('display_name, color')
              .eq('id', group.school_tag_id)
              .single();
            
            return { ...group, school_tags: tagData };
          }
          return { ...group, school_tags: null };
        })
      );
      
      setGroups(groupsWithTags);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        variant: "destructive",
      });
    }
  };

  const fetchSchoolTags = async () => {
    try {
      const { data, error } = await supabase
        .from('school_tags')
        .select('*')
        .order('display_name');

      if (error) throw error;
      setSchoolTags(data || []);
    } catch (error) {
      console.error('Error fetching school tags:', error);
    }
  };

  const fetchStudentsForGroup = async (schoolTagId: string) => {
    if (!user?.id) return;

    try {
      // Get current user's school tags  
      const { data: userSchoolTags } = await supabase
        .from('user_school_tags')
        .select('school_tag_id')
        .eq('user_id', user.id);

      const currentUserTagIds = userSchoolTags?.map(tag => tag.school_tag_id) || [];

      if (currentUserTagIds.length === 0) {
        setStudents([]);
        return;
      }

      // Fetch students who have at least one school tag in common with current user
      const { data: studentsWithTags, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          nickname, 
          role, 
          user_id,
          user_school_tags!inner(school_tag_id)
        `)
        .in('user_school_tags.school_tag_id', currentUserTagIds)
        .eq('role', 'student')
        .order('nickname');

      if (error) throw error;

      // Remove duplicates (students might appear multiple times if they have multiple matching tags)
      const uniqueStudents = studentsWithTags?.reduce((acc, student) => {
        if (!acc.find(s => s.id === student.id)) {
          acc.push(student);
        }
        return acc;
      }, [] as any[]) || [];

      setStudents(uniqueStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast({
        title: "Error",
        description: "User profile not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    console.log('Creating group with profile:', profile);
    console.log('Group form data:', groupForm);

    setLoading(true);
    try {
      // Validate input
      if (!groupForm.name.trim()) {
        throw new Error('Group name is required');
      }

      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupForm.name.trim(),
          description: groupForm.description.trim() || null,
          school_tag_id: groupForm.school_tag_id || null,
          created_by: profile.id,
        })
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Group created successfully:', data);

      toast({
        title: "Success",
        description: "Group created successfully!",
      });

      setGroupForm({ name: '', description: '', school_tag_id: '' });
      setShowCreateDialog(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: `Failed to create group: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: selectedGroupId,
          user_id: memberForm.user_id,
          added_by: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added successfully!",
      });

      setMemberForm({ user_id: '' });
      setShowAddMemberDialog(false);
      fetchGroups();
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddMemberDialog = (groupId: string, schoolTagId: string | null) => {
    setSelectedGroupId(groupId);
    if (schoolTagId) {
      fetchStudentsForGroup(schoolTagId);
    } else {
      // If no school tag restriction, fetch all students from user's school tags
      fetchStudentsForGroup('');
    }
    setShowAddMemberDialog(true);
  };

  if (!isTeacher()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-effect neon-border">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need teacher or admin access to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Groups</h1>
            <p className="text-muted-foreground">
              Create and manage student groups {profile && `(Role: ${profile.role})`}
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="neon-glow">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect neon-border">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new group for students and teachers
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group-name">Group Name *</Label>
                    <Input
                      id="group-name"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter group name"
                      required
                      minLength={1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="group-description">Description</Label>
                    <Textarea
                      id="group-description"
                      value={groupForm.description}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter group description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="school-tag">School Tag (Optional)</Label>
                    <Select
                      value={groupForm.school_tag_id}
                      onValueChange={(value) => setGroupForm(prev => ({ ...prev, school_tag_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select school tag" />
                      </SelectTrigger>
                       <SelectContent className="bg-background border border-border z-50">
                         <SelectItem value="">No restriction</SelectItem>
                         {schoolTags.map((tag) => (
                           <SelectItem key={tag.id} value={tag.id}>
                             <div className="flex items-center space-x-2">
                               <div 
                                 className="w-3 h-3 rounded-full" 
                                 style={{ backgroundColor: tag.color }}
                               />
                               <span>{tag.display_name}</span>
                             </div>
                           </SelectItem>
                         ))}
                       </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button 
                    type="submit" 
                    disabled={loading || !groupForm.name.trim()} 
                    className="neon-glow"
                  >
                    {loading ? "Creating..." : "Create Group"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {groups.length === 0 ? (
          <Card className="glass-effect neon-border">
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No groups yet</h2>
              <p className="text-muted-foreground mb-4">
                Create your first group to start organizing students and teachers.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="neon-glow">
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="glass-effect neon-border hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="gradient-text">{group.name}</CardTitle>
                    <Button
                      onClick={() => openAddMemberDialog(group.id, group.school_tag_id)}
                      variant="ghost"
                      size="sm"
                      className="hover-glow"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  {group.school_tags && (
                    <Badge 
                      variant="outline" 
                      className="w-fit"
                      style={{ 
                        borderColor: group.school_tags.color,
                        color: group.school_tags.color 
                      }}
                    >
                      <School className="h-3 w-3 mr-1" />
                      {group.school_tags.display_name}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {group.description && (
                    <p className="text-muted-foreground mb-4">{group.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        0 members
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => navigate(`/group-chat/${group.id}`)}
                        variant="ghost"
                        size="sm"
                        className="hover-glow text-xs"
                      >
                        Chat
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {new Date(group.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Member Dialog */}
        <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
          <DialogContent className="glass-effect neon-border">
            <DialogHeader>
              <DialogTitle>Add Group Member</DialogTitle>
              <DialogDescription>
                Add a student or teacher to this group
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="member-select">Select Member</Label>
                  <Select
                    value={memberForm.user_id}
                    onValueChange={(value) => setMemberForm({ user_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member to add" />
                    </SelectTrigger>
                     <SelectContent className="bg-background border border-border z-50">
                       {students.map((student) => (
                         <SelectItem key={student.id} value={student.user_id}>
                           <div className="flex items-center space-x-2">
                             <Badge variant="outline" className="text-xs">
                               {student.role}
                             </Badge>
                             <span>{student.nickname}</span>
                           </div>
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only users with the same school tag are shown
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={loading} className="neon-glow">
                  {loading ? "Adding..." : "Add Member"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GroupsPage;