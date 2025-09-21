import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, User, MessageSquare, Copyright } from 'lucide-react';

const AuthPage = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ 
    email: '', 
    password: '', 
    nickname: '', 
    confirmPassword: '',
    contactNumber: '',
    contactEmail: '',
    schoolTag: ''
  });
  const [schoolTags, setSchoolTags] = useState<any[]>([]);
  const [showContactAdmin, setShowContactAdmin] = useState(true); // show by default
  const [contactAdminData, setContactAdminData] = useState({
    name: '',
    contact: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchoolTags();
  }, []);
  
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

  const handleContactAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.rpc('send_message_to_all_admins', {
        sender_name: contactAdminData.name,
        sender_contact: contactAdminData.contact,
        message_title: 'Request for New School Tag',
        message_content: contactAdminData.message
      });

      if (error) throw error;

      alert('Your message has been sent to all administrators!');
      setShowContactAdmin(true);
      setContactAdminData({ name: '', contact: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white relative overflow-hidden">
      {showContactAdmin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <Card className="w-full max-w-md glass-effect neon-border relative overflow-hidden">
            
            <span className="absolute w-16 h-16 border-2 border-cyan-400 rounded-full top-[-20px] left-[-20px] animate-ping opacity-60"></span>
            <span className="absolute w-16 h-16 border-2 border-fuchsia-500 rounded-full bottom-[-20px] right-[-20px] animate-ping opacity-60"></span>
            <span className="absolute w-10 h-10 border border-cyan-500 rotate-45 top-[-10px] right-[-10px] animate-spin-slow"></span>
            <span className="absolute w-10 h-10 border border-fuchsia-400 rotate-45 bottom-[-10px] left-[-10px] animate-spin-slow"></span>

            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <MessageSquare className="h-6 w-6" />
                <span>Contact Administrators</span>
              </CardTitle>
              <CardDescription className="text-cyan-200">
                Is something wrong? Report it here.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleContactAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Your Name</Label>
                  <Input
                    id="admin-name"
                    value={contactAdminData.name}
                    onChange={(e) => setContactAdminData({ ...contactAdminData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="neon-border hover-glow text-white placeholder-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-contact">Contact Information</Label>
                  <Input
                    id="admin-contact"
                    value={contactAdminData.contact}
                    onChange={(e) => setContactAdminData({ ...contactAdminData, contact: e.target.value })}
                    placeholder="Email or phone number"
                    className="neon-border hover-glow text-white placeholder-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-message">Report</Label>
                  <Input
                    id="admin-message"
                    value={contactAdminData.message}
                    onChange={(e) => setContactAdminData({ ...contactAdminData, message: e.target.value })}
                    placeholder="Reports (Please only add reports)"
                    className="neon-border hover-glow text-white placeholder-white"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1 neon-glow hover-glow"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>

              <div className="mt-6 border-t border-cyan-500/30 pt-4 text-sm text-cyan-300 space-y-2">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> gcccode1@gmail.com</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> +94 765 792 041</div>
                <div className="flex items-center gap-2 text-cyan-400 mt-2">
                  <Copyright className="w-4 h-4" /> 2025 BrainSelf
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
