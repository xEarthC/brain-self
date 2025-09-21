import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, CheckCircle, Clock, Tag, User } from 'lucide-react';

interface Message {
  id: string;
  message_type: string;
  title: string;
  content: string;
  read_status: boolean;
  created_at: string;
}

const MSGPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_status: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, read_status: true }
            : msg
        )
      );

      toast({
        title: "Success",
        description: "Message marked as read",
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_status: true })
        .eq('read_status', false);

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => ({ ...msg, read_status: true }))
      );

      toast({
        title: "Success",
        description: "All messages marked as read",
      });
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark messages as read",
        variant: "destructive",
      });
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'new_tag':
      case 'tag_change':
        return <Tag className="h-5 w-5 text-green-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'mention':
        return 'Mention';
      case 'new_tag':
        return 'New Tag';
      case 'tag_change':
        return 'Tag Change';
      default:
        return 'Message';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-effect neon-border">
            <CardContent className="p-8 text-center">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading messages...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter(msg => !msg.read_status).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Messages</h1>
            <p className="text-muted-foreground">
              Your notifications and mentions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="neon-glow">
                {unreadCount} unread
              </Badge>
            )}
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {messages.length === 0 ? (
          <Card className="glass-effect neon-border">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No messages yet</h2>
              <p className="text-muted-foreground">
                You'll see notifications here when teachers mention you or when your tags change.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card 
                key={message.id} 
                className={`glass-effect transition-all duration-200 hover:shadow-lg ${
                  !message.read_status 
                    ? 'neon-border border-primary/50' 
                    : 'border-border/50'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMessageIcon(message.message_type)}
                      <div>
                        <CardTitle className="text-lg">
                          {message.title}
                          {!message.read_status && (
                            <Badge className="ml-2 neon-glow" variant="secondary">
                              New
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">
                            {getMessageTypeLabel(message.message_type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleDateString()} at{' '}
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!message.read_status && (
                      <Button
                        onClick={() => markAsRead(message.id)}
                        variant="ghost"
                        size="sm"
                        className="hover-glow"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark as read
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{message.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MSGPage;