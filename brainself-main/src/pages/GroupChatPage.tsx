import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';

interface GroupChat {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles?: {
    nickname: string;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
}

const GroupChatPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const { profile } = useRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [group, setGroup] = useState<Group | null>(null);
  const [chats, setChats] = useState<GroupChat[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (groupId) {
      checkMembership();
      fetchGroup();
      fetchChats();
      setupRealtimeSubscription();
    }
  }, [groupId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkMembership = async () => {
    if (!user || !groupId) return;

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      setIsMember(!!data);
    } catch (error) {
      console.error('Error checking membership:', error);
      setIsMember(false);
    }
  };

  const fetchGroup = async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, description')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      setGroup(data);
    } catch (error) {
      console.error('Error fetching group:', error);
      toast({
        title: "Error",
        description: "Failed to load group information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('group_chats')
        .select('id, message, created_at, user_id')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles separately to avoid relationship issues
      const chatsWithProfiles = await Promise.all(
        (data || []).map(async (chat) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('user_id', chat.user_id)
            .single();
          
          return {
            ...chat,
            profiles: profile
          };
        })
      );

      setChats(chatsWithProfiles);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group_chat_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chats',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          // Fetch user profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('user_id', payload.new.user_id)
            .single();

          const newChat = {
            ...payload.new,
            profiles: profile,
          } as GroupChat;

          setChats((prev) => [...prev, newChat]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !groupId || !isMember) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('group_chats')
        .insert({
          group_id: groupId,
          user_id: user.id,
          message: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getInitials = (nickname: string) => {
    return nickname ? nickname.charAt(0).toUpperCase() : 'U';
  };

  if (!isMember && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-effect neon-border">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You are not a member of this group.</p>
            <Button onClick={() => navigate('/groups')} className="neon-glow">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
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
            <p className="text-muted-foreground">Loading group chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="glass-effect neon-border mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/groups')}
                variant="ghost"
                size="sm"
                className="hover-glow"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="gradient-text">{group?.name}</CardTitle>
                {group?.description && (
                  <CardDescription>{group.description}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="glass-effect neon-border mb-6">
          <CardContent className="p-6">
            <div className="h-96 overflow-y-auto space-y-4 mb-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex ${
                    chat.user_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`flex space-x-3 max-w-xs lg:max-w-md ${
                    chat.user_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <Avatar className="h-8 w-8 neon-border">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                        {getInitials(chat.profiles?.nickname || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        chat.user_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {chat.profiles?.nickname || 'Unknown User'}
                      </p>
                      <p className="text-sm">{chat.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(chat.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || !newMessage.trim()} className="neon-glow">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupChatPage;