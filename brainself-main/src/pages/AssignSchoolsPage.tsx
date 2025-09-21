import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';
import { Shield, Building, Users, Plus, Trash2, Search, Tag } from 'lucide-react';

interface UserProfile {
  id: string;
  nickname: string;
  registration_number?: string;
  role: string;
  email: string;
}

interface SchoolTag {
  id: string;
  name: string;
  display_name: string;
  color: string;
  description?: string;
}

interface UserSchoolTag {
  id: string;
  user_id: string;
  school_tag_id: string;
  assigned_at: string;
  school_tags: SchoolTag;
  profiles: UserProfile;
}

const AssignSchoolsPage = () => {
  const { isAdmin, profile } = useRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [schoolTags, setSchoolTags] = useState<SchoolTag[]>([]);
  const [userTags, setUserTags] = useState<UserSchoolTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const [assignForm, setAssignForm] = useState({
    user_id: '',
    school_tag_id: '',
  });

  const [createTagForm, setCreateTagForm] = useState({
    name: '',
    display_name: '',
    description: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
      fetchSchoolTags();
      fetchUserTags();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, registration_number, role, email')
        .order('nickname');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const fetchUserTags = async () => {
    try {
      const { data, error } = await supabase
        .from('user_school_tags')
        .select(`
          *,
          school_tags(*),
          profiles!user_school_tags_user_id_fkey(id, nickname, registration_number, role, email)
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setUserTags((data as any) || []);
    } catch (error) {
      console.error('Error fetching user tags:', error);
    }
  };

  const handleAssignTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_school_tags')
        .insert({
          user_id: assignForm.user_id,
          school_tag_id: assignForm.school_tag_id,
          assigned_by: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "School tag assigned successfully!",
      });

      setAssignForm({ user_id: '', school_tag_id: '' });
      setShowAssignDialog(false);
      fetchUserTags();
    } catch (error) {
      console.error('Error assigning tag:', error);
      toast({
        title: "Error",
        description: "Failed to assign school tag",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUserTag = async (userTagId: string) => {
    if (!confirm('Are you sure you want to remove this school assignment?')) return;

    try {
      const { error } = await supabase
        .from('user_school_tags')
        .delete()
        .eq('id', userTagId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "School assignment removed successfully!",
      });

      fetchUserTags();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove school assignment",
        variant: "destructive",
      });
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('school_tags')
        .insert({
          name: createTagForm.name,
          display_name: createTagForm.display_name,
          description: createTagForm.description,
          color: createTagForm.color,
          created_by: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "School tag created successfully!",
      });

      setCreateTagForm({ name: '', display_name: '', description: '', color: '#3b82f6' });
      setShowCreateTagDialog(false);
      fetchSchoolTags();
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "Failed to create school tag",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.registration_number && user.registration_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredUserTags = userTags.filter(userTag => {
    const user = userTag.profiles;
    const matchesSearch = user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.registration_number && user.registration_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-effect neon-border">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin access to assign school tags.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Assign Schools to Users</h1>
          <p className="text-muted-foreground">Manage school tag assignments for users</p>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex gap-2">
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button className="neon-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign School Tag
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign School Tag to User</DialogTitle>
                <DialogDescription>
                  Select a user and assign them a school tag
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAssignTag} className="space-y-4">
                <div>
                  <Label>User</Label>
                  <Select value={assignForm.user_id} onValueChange={(value) => setAssignForm(prev => ({ ...prev, user_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.nickname}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.role} - {user.email}
                              {user.registration_number && ` - Reg: ${user.registration_number}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>School Tag</Label>
                  <Select value={assignForm.school_tag_id} onValueChange={(value) => setAssignForm(prev => ({ ...prev, school_tag_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school tag" />
                    </SelectTrigger>
                    <SelectContent>
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
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Assigning..." : "Assign Tag"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateTagDialog} onOpenChange={setShowCreateTagDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="neon-glow">
                <Tag className="h-4 w-4 mr-2" />
                Create School Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New School Tag</DialogTitle>
                <DialogDescription>
                  Create a new school tag to assign to users
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTag} className="space-y-4">
                <div>
                  <Label>Tag Name (Internal)</Label>
                  <Input
                    placeholder="e.g., school_a"
                    value={createTagForm.name}
                    onChange={(e) => setCreateTagForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Display Name</Label>
                  <Input
                    placeholder="e.g., School A"
                    value={createTagForm.display_name}
                    onChange={(e) => setCreateTagForm(prev => ({ ...prev, display_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Description (Optional)</Label>
                  <Input
                    placeholder="Brief description of the school"
                    value={createTagForm.description}
                    onChange={(e) => setCreateTagForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={createTagForm.color}
                    onChange={(e) => setCreateTagForm(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Tag"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>

          <div className="flex gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Assignments */}
        <Card className="glass-effect neon-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-6 w-6" />
              <span>Current School Assignments</span>
            </CardTitle>
            <CardDescription>
              Users currently assigned to school tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUserTags.map((userTag) => (
                <div key={userTag.id} className="flex items-center justify-between p-4 glass-effect rounded-lg hover-glow">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-semibold">{userTag.profiles.nickname}</p>
                      <p className="text-sm text-muted-foreground">
                        {userTag.profiles.role} - {userTag.profiles.email}
                        {userTag.profiles.registration_number && ` - Reg: ${userTag.profiles.registration_number}`}
                      </p>
                    </div>
                    <Badge 
                      style={{ 
                        backgroundColor: userTag.school_tags.color, 
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      {userTag.school_tags.display_name}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(userTag.assigned_at).toLocaleDateString()}
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleRemoveUserTag(userTag.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredUserTags.length === 0 && (
                <div className="text-center py-8">
                  <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No school assignments found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unassigned Users */}
        <Card className="glass-effect neon-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>All Users</span>
            </CardTitle>
            <CardDescription>
              View all users and their current school assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const userAssignments = userTags.filter(ut => ut.user_id === user.id);
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 glass-effect rounded-lg hover-glow">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold">{user.nickname}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.role} - {user.email}
                          {user.registration_number && ` - Reg: ${user.registration_number}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {userAssignments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {userAssignments.map((assignment) => (
                            <Badge 
                              key={assignment.id}
                              style={{ 
                                backgroundColor: assignment.school_tags.color, 
                                color: 'white',
                                border: 'none'
                              }}
                              className="text-xs"
                            >
                              {assignment.school_tags.display_name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No school assigned
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignSchoolsPage;