import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';
import { Shield, Plus, Edit, Trash2, Tag, Users } from 'lucide-react';

interface SchoolTag {
  id: string;
  name: string;
  display_name: string;
  color: string;
  description?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  nickname: string;
  registration_number?: string;
  role: string;
}

interface UserSchoolTag {
  id: string;
  user_id: string;
  school_tag_id: string;
  assigned_at: string;
  school_tags: SchoolTag;
  profiles: UserProfile;
}

const SchoolTagsPage = () => {
  const { isAdmin, profile } = useRole();
  const { toast } = useToast();
  const [schoolTags, setSchoolTags] = useState<SchoolTag[]>([]);
  const [userTags, setUserTags] = useState<UserSchoolTag[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<SchoolTag | null>(null);

  const [tagForm, setTagForm] = useState({
    name: '',
    display_name: '',
    color: '#3b82f6',
    description: '',
  });

  const [assignForm, setAssignForm] = useState({
    user_id: '',
    school_tag_id: '',
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchSchoolTags();
      fetchUserTags();
      fetchUsers();
    }
  }, [isAdmin]);

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
          profiles!user_school_tags_user_id_fkey(id, nickname, registration_number, role)
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setUserTags((data as any) || []);
    } catch (error) {
      console.error('Error fetching user tags:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, registration_number, role')
        .in('role', ['student', 'teacher'])
        .order('nickname');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
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
          ...tagForm,
          created_by: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "School tag created successfully!",
      });

      setTagForm({ name: '', display_name: '', color: '#3b82f6', description: '' });
      setShowCreateDialog(false);
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

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('school_tags')
        .update(tagForm)
        .eq('id', editingTag.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "School tag updated successfully!",
      });

      setEditingTag(null);
      setTagForm({ name: '', display_name: '', color: '#3b82f6', description: '' });
      fetchSchoolTags();
    } catch (error) {
      console.error('Error updating tag:', error);
      toast({
        title: "Error",
        description: "Failed to update school tag",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this school tag?')) return;

    try {
      const { error } = await supabase
        .from('school_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "School tag deleted successfully!",
      });

      fetchSchoolTags();
      fetchUserTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete school tag",
        variant: "destructive",
      });
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
    if (!confirm('Are you sure you want to remove this tag assignment?')) return;

    try {
      const { error } = await supabase
        .from('user_school_tags')
        .delete()
        .eq('id', userTagId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tag assignment removed successfully!",
      });

      fetchUserTags();
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: "Error",
        description: "Failed to remove tag assignment",
        variant: "destructive",
      });
    }
  };

  const startEditTag = (tag: SchoolTag) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      display_name: tag.display_name,
      color: tag.color,
      description: tag.description || '',
    });
    setShowCreateDialog(true);
  };

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-effect neon-border">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin access to manage school tags.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">School Tags Management</h1>
          <p className="text-muted-foreground">Create and manage custom school-specific roles and tags</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="neon-glow" onClick={() => {
                setEditingTag(null);
                setTagForm({ name: '', display_name: '', color: '#3b82f6', description: '' });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create School Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTag ? 'Edit School Tag' : 'Create New School Tag'}</DialogTitle>
                <DialogDescription>
                  Create custom tags for your school (e.g., "Senior Prefect", "Sports Captain", "House Leader")
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={editingTag ? handleUpdateTag : handleCreateTag} className="space-y-4">
                <div>
                  <Label htmlFor="name">Internal Name</Label>
                  <Input
                    id="name"
                    value={tagForm.name}
                    onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="senior_prefect"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={tagForm.display_name}
                    onChange={(e) => setTagForm(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Senior Prefect"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={tagForm.color}
                    onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={tagForm.description}
                    onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description of this school tag..."
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Saving..." : editingTag ? "Update Tag" : "Create Tag"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Tag className="h-4 w-4 mr-2" />
                Assign Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign School Tag</DialogTitle>
                <DialogDescription>
                  Assign a school tag to a user
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
                            <span>{user.nickname}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.role} {user.registration_number && `- Reg: ${user.registration_number}`}
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
                      <SelectValue placeholder="Select tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          <Badge style={{ backgroundColor: tag.color, color: 'white' }}>
                            {tag.display_name}
                          </Badge>
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
        </div>

        {/* School Tags List */}
        <Card className="glass-effect neon-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-6 w-6" />
              <span>School Tags</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schoolTags.map((tag) => (
                <div key={tag.id} className="glass-effect rounded-lg p-4 hover-glow">
                  <div className="flex items-center justify-between mb-2">
                    <Badge style={{ backgroundColor: tag.color, color: 'white' }}>
                      {tag.display_name}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => startEditTag(tag)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteTag(tag.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{tag.name}</p>
                  {tag.description && (
                    <p className="text-xs text-muted-foreground">{tag.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Tag Assignments */}
        <Card className="glass-effect neon-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Tag Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userTags.map((userTag) => (
                <div key={userTag.id} className="flex items-center justify-between p-4 glass-effect rounded-lg hover-glow">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-semibold">{userTag.profiles.nickname}</p>
                      <p className="text-sm text-muted-foreground">
                        {userTag.profiles.role} 
                        {userTag.profiles.registration_number && ` - Reg: ${userTag.profiles.registration_number}`}
                      </p>
                    </div>
                    <Badge style={{ backgroundColor: userTag.school_tags.color, color: 'white' }}>
                      {userTag.school_tags.display_name}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(userTag.assigned_at).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveUserTag(userTag.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {userTags.length === 0 && (
                <div className="text-center py-8">
                  <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tag assignments found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolTagsPage;