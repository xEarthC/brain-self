import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/hooks/useRole';
import { UserCheck, Users, Crown, GraduationCap, User, Search, UserCog, Shield, AlertTriangle } from 'lucide-react';

interface UserProfile {
  id: string;
  nickname: string;
  role: 'student' | 'teacher' | 'admin';
  email: string;
  created_at: string;
  contact_number?: string;
  grade_level?: string;
}

const GiveAccessPage = () => {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [newRole, setNewRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState<'student' | 'teacher' | 'admin'>('student');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, role, email, created_at, contact_number, grade_level')
        .order('nickname');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleRoleUpdate = async (userId?: string, role?: 'student' | 'teacher' | 'admin') => {
    const targetUserId = userId || selectedUser;
    const targetRole = role || newRole;

    if (!targetUserId) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: targetRole })
        .eq('id', targetUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${targetRole} successfully!`,
      });

      // Refresh users list
      await fetchUsers();
      setSelectedUser('');
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRoleUpdate = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select users to update",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: bulkAction })
        .in('id', selectedUsers);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Updated ${selectedUsers.length} users to ${bulkAction} role!`,
      });

      // Refresh users list
      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error updating roles:', error);
      toast({
        title: "Error",
        description: "Failed to update user roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-destructive" />;
      case 'teacher':
        return <GraduationCap className="h-4 w-4 text-primary" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleVariant = (role: string): "default" | "secondary" | "destructive" => {
    switch (role) {
      case 'admin':
        return "destructive";
      case 'teacher':
        return "default";
      default:
        return "secondary";
    }
  };

  const filteredUsers = users.filter(user =>
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleStats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-2 border-destructive/20">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only administrators can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <UserCog className="h-6 w-6" />
              <span>User Role Management</span>
            </CardTitle>
            <CardDescription>
              Manage user roles and permissions across the platform
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{roleStats.total}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{roleStats.students}</p>
              <p className="text-sm text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-4 text-center">
              <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{roleStats.teachers}</p>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="text-2xl font-bold">{roleStats.admins}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Role Assignment */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Quick Role Assignment</span>
            </CardTitle>
            <CardDescription>
              Quickly assign roles to individual users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose user" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span>{user.nickname}</span>
                          <span className="text-xs text-muted-foreground">({user.role})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>New Role</Label>
                <Select value={newRole} onValueChange={(value: 'student' | 'teacher' | 'admin') => setNewRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Student</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="teacher">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Teacher</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4" />
                        <span>Administrator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => handleRoleUpdate()} 
                  disabled={loading || !selectedUser}
                  className="w-full"
                >
                  {loading ? "Updating..." : "Update Role"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Bulk Actions</span>
            </CardTitle>
            <CardDescription>
              Select multiple users and update their roles at once
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={selectAllUsers}
              >
                {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
              </Button>
              <div className="flex items-center gap-2">
                <Label>Bulk Role:</Label>
                <Select value={bulkAction} onValueChange={(value: 'student' | 'teacher' | 'admin') => setBulkAction(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleBulkRoleUpdate}
                disabled={loading || selectedUsers.length === 0}
              >
                Update {selectedUsers.length} Users
              </Button>
            </div>
            {selectedUsers.length > 0 && (
              <div className="p-3 bg-secondary/20 rounded-lg">
                <p className="text-sm">
                  <strong>{selectedUsers.length}</strong> users selected for bulk update to <strong>{bulkAction}</strong> role
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Search and Management */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>User Directory</span>
            </CardTitle>
            <CardDescription>
              Search and manage all users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search by nickname, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 cursor-pointer transition-all ${
                    selectedUsers.includes(user.id) ? 'ring-2 ring-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-border"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {getRoleIcon(user.role)}
                    <div>
                      <p className="font-semibold">{user.nickname}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.contact_number && (
                        <p className="text-xs text-muted-foreground">{user.contact_number}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant={getRoleVariant(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleUpdate(user.id, 'student');
                        }}
                        disabled={loading || user.role === 'student'}
                        className="px-2"
                      >
                        <User className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleUpdate(user.id, 'teacher');
                        }}
                        disabled={loading || user.role === 'teacher'}
                        className="px-2"
                      >
                        <GraduationCap className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleUpdate(user.id, 'admin');
                        }}
                        disabled={loading || user.role === 'admin'}
                        className="px-2"
                      >
                        <Crown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found matching your search</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Role Permissions Guide</span>
            </CardTitle>
            <CardDescription>
              Understanding different access levels and their capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg border-l-4 border-l-muted-foreground/30">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Student</h4>
                  <Badge variant="secondary">Basic Access</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Access to courses and lessons</li>
                  <li>• Take tests and quizzes</li>
                  <li>• View personal schedule</li>
                  <li>• AI assistant access</li>
                  <li>• View own progress and marks</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg border-l-4 border-l-primary/50">
                <div className="flex items-center space-x-2 mb-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Teacher</h4>
                  <Badge variant="default">Extended Access</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All student permissions</li>
                  <li>• Add and manage student marks</li>
                  <li>• View student performance analytics</li>
                  <li>• Access HWTD reports</li>
                  <li>• Create and manage groups</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg border-l-4 border-l-destructive/50">
                <div className="flex items-center space-x-2 mb-3">
                  <Crown className="h-5 w-5 text-destructive" />
                  <h4 className="font-semibold">Administrator</h4>
                  <Badge variant="destructive">Full Access</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All teacher permissions</li>
                  <li>• Manage user roles and permissions</li>
                  <li>• System configuration access</li>
                  <li>• User management dashboard</li>
                  <li>• Platform administration tools</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-orange-800 dark:text-orange-200">Important Security Notice</h5>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Role changes take effect immediately. Always verify the user identity before granting elevated permissions. 
                    Admin roles should be assigned with extreme caution as they provide full system access.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GiveAccessPage;