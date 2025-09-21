import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, School } from 'lucide-react';

interface MyGroup {
  id: string;
  groups: {
    id: string;
    name: string;
    description: string;
    school_tag_id: string | null;
    school_tags?: {
      display_name: string;
      color: string;
    } | null;
  };
  joined_at: string;
}

const MyGroupsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState<MyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyGroups();
    }
  }, [user]);

  const fetchMyGroups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('id, joined_at, group_id')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      // Fetch group details separately
      const membershipsWithGroups = await Promise.all(
        (data || []).map(async (membership) => {
          const { data: group } = await supabase
            .from('groups')
            .select('id, name, description, school_tag_id')
            .eq('id', membership.group_id)
            .single();
          
          return {
            ...membership,
            groups: group
          };
        })
      );

      // Fetch school tags for groups that have them
      const groupsWithTags = await Promise.all(
        membershipsWithGroups.map(async (membership) => {
          if (membership.groups?.school_tag_id) {
            const { data: tagData } = await supabase
              .from('school_tags')
              .select('display_name, color')
              .eq('id', membership.groups.school_tag_id)
              .single();
            
            return {
              ...membership,
              groups: {
                ...membership.groups,
                school_tags: tagData
              }
            };
          }
          return {
            ...membership,
            groups: {
              ...membership.groups,
              school_tags: null
            }
          };
        })
      );

      setMyGroups(groupsWithTags);
    } catch (error) {
      console.error('Error fetching my groups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your groups...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">My Groups</h1>
          <p className="text-muted-foreground">Groups you're a member of</p>
        </div>

        {myGroups.length === 0 ? (
          <Card className="glass-effect neon-border">
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No groups yet</h2>
              <p className="text-muted-foreground mb-4">
                You haven't been added to any groups yet. Check your messages for group invitations!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((membership) => (
              <Card key={membership.id} className="glass-effect neon-border hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="gradient-text">{membership.groups.name}</CardTitle>
                    <Button
                      onClick={() => navigate(`/group-chat/${membership.groups.id}`)}
                      variant="ghost"
                      size="sm"
                      className="hover-glow"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  {membership.groups.school_tags && (
                    <Badge 
                      variant="outline" 
                      className="w-fit"
                      style={{ 
                        borderColor: membership.groups.school_tags.color,
                        color: membership.groups.school_tags.color 
                      }}
                    >
                      <School className="h-3 w-3 mr-1" />
                      {membership.groups.school_tags.display_name}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {membership.groups.description && (
                    <p className="text-muted-foreground mb-4">{membership.groups.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Member since
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(membership.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGroupsPage;