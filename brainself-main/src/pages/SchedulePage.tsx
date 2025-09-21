import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Plus, Bell, Repeat, Edit, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const SchedulePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_name: '',
    start_time: '',
    end_time: '',
    entry_type: 'study',
    is_recurring: false,
    recurrence_pattern: '',
    notification_enabled: true
  });

  useEffect(() => {
    if (user) {
      fetchEntries();
      requestNotificationPermission();
    }
  }, [user]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('timetable_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast({
        title: "Error",
        description: "Failed to load schedule entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleNotification = (entry) => {
    if ('Notification' in window && Notification.permission === 'granted' && entry.notification_enabled) {
      const startTime = new Date(entry.start_time);
      const now = new Date();
      const timeUntilStart = startTime.getTime() - now.getTime();
      
      // Schedule notification 5 minutes before start time
      const notificationTime = timeUntilStart - (5 * 60 * 1000);
      
      if (notificationTime > 0) {
        setTimeout(() => {
          new Notification(`Upcoming: ${entry.title}`, {
            body: `Starting in 5 minutes - ${entry.subject_name}`,
            icon: '/favicon.ico'
          });
        }, notificationTime);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const entryData = {
        ...formData,
        user_id: user.id,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('timetable_entries')
          .update(entryData)
          .eq('id', editingEntry.id);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Schedule entry updated successfully",
        });
      } else {
        const { data, error } = await supabase
          .from('timetable_entries')
          .insert(entryData)
          .select()
          .single();
        
        if (error) throw error;
        
        // Schedule notification for new entry
        scheduleNotification(data);
        
        toast({
          title: "Success",
          description: "Schedule entry created successfully",
        });
      }

      fetchEntries();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule entry",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('timetable_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchEntries();
      toast({
        title: "Success",
        description: "Schedule entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule entry",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject_name: '',
      start_time: '',
      end_time: '',
      entry_type: 'study',
      is_recurring: false,
      recurrence_pattern: '',
      notification_enabled: true
    });
    setEditingEntry(null);
  };

  const startEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      description: entry.description || '',
      subject_name: entry.subject_name || '',
      start_time: new Date(entry.start_time).toISOString().slice(0, 16),
      end_time: new Date(entry.end_time).toISOString().slice(0, 16),
      entry_type: entry.entry_type,
      is_recurring: entry.is_recurring,
      recurrence_pattern: entry.recurrence_pattern || '',
      notification_enabled: entry.notification_enabled
    });
    setIsDialogOpen(true);
  };

  const getEntryTypeColor = (type) => {
    switch (type) {
      case 'study': return 'bg-blue-500/20 text-blue-400';
      case 'break': return 'bg-green-500/20 text-green-400';
      case 'revision': return 'bg-yellow-500/20 text-yellow-400';
      case 'homework': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const todayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.start_time).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  });

  const upcomingEntries = entries.filter(entry => {
    const entryDate = new Date(entry.start_time);
    const today = new Date();
    return entryDate > today;
  }).slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="glass-effect rounded-xl p-6 neon-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Smart Schedule</h1>
              <p className="text-muted-foreground">
                Organize your study time with intelligent scheduling and notifications
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="neon-glow hover-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-effect neon-border max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? 'Edit Schedule Entry' : 'Add Schedule Entry'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="neon-border hover-glow"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject_name">Subject</Label>
                    <Input
                      id="subject_name"
                      value={formData.subject_name}
                      onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                      className="neon-border hover-glow"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="neon-border hover-glow"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="neon-border hover-glow"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entry_type">Type</Label>
                    <Select value={formData.entry_type} onValueChange={(value) => setFormData({ ...formData, entry_type: value })}>
                      <SelectTrigger className="neon-border hover-glow">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-effect neon-border">
                        <SelectItem value="study">Study</SelectItem>
                        <SelectItem value="break">Break</SelectItem>
                        <SelectItem value="revision">Revision</SelectItem>
                        <SelectItem value="homework">Homework</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="neon-border hover-glow"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notification_enabled"
                      checked={formData.notification_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, notification_enabled: checked })}
                    />
                    <Label htmlFor="notification_enabled" className="flex items-center space-x-1">
                      <Bell className="h-4 w-4" />
                      <span>Enable Notifications</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_recurring"
                      checked={formData.is_recurring}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                    />
                    <Label htmlFor="is_recurring" className="flex items-center space-x-1">
                      <Repeat className="h-4 w-4" />
                      <span>Recurring</span>
                    </Label>
                  </div>

                  {formData.is_recurring && (
                    <div className="space-y-2">
                      <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
                      <Select 
                        value={formData.recurrence_pattern} 
                        onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
                      >
                        <SelectTrigger className="neon-border hover-glow">
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect neon-border">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="submit" className="w-full neon-glow hover-glow">
                    {editingEntry ? 'Update Entry' : 'Create Entry'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Today's Schedule</span>
                </CardTitle>
                <CardDescription>
                  {formatDate(new Date())}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayEntries.length > 0 ? (
                  todayEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg glass-effect hover-glow">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{entry.title}</h3>
                          <Badge className={getEntryTypeColor(entry.entry_type)}>
                            {entry.entry_type}
                          </Badge>
                          {entry.is_recurring && <Repeat className="h-4 w-4 text-muted-foreground" />}
                          {entry.notification_enabled && <Bell className="h-4 w-4 text-accent" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                        </p>
                        {entry.subject_name && (
                          <p className="text-sm text-primary">{entry.subject_name}</p>
                        )}
                        {entry.description && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No entries scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <span>Upcoming</span>
                </CardTitle>
                <CardDescription>Next scheduled events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEntries.length > 0 ? (
                  upcomingEntries.map((entry) => (
                    <div key={entry.id} className="p-3 rounded-lg glass-effect">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{entry.title}</h4>
                        <Badge variant="outline" className={getEntryTypeColor(entry.entry_type)}>
                          {entry.entry_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.start_time)} at {formatTime(entry.start_time)}
                      </p>
                      {entry.subject_name && (
                        <p className="text-xs text-primary mt-1">{entry.subject_name}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notification Status */}
        {Notification.permission !== 'granted' && (
          <Card className="glass-effect border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <p className="text-sm">
                  Enable browser notifications to receive reminders for your scheduled activities.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={requestNotificationPermission}
                  className="hover-glow"
                >
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;