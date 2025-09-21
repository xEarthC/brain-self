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
import { Brain, Mail, Lock, User, Sparkles, Phone, School, MessageSquare } from 'lucide-react';

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
  const [showContactAdmin, setShowContactAdmin] = useState(false);
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
      setShowContactAdmin(false);
      setContactAdminData({ name: '', contact: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    if (!error) {
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      return;
    }
    setLoading(true);
    const { error } = await signUp(
      signUpData.email, 
      signUpData.password, 
      signUpData.nickname,
      signUpData.contactNumber,
      signUpData.contactEmail,
      signUpData.schoolTag
    );
    if (!error) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
      
      <Card className="w-full max-w-md glass-effect neon-border relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">BrainSelf</h1>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <Sparkles className="h-4 w-4 text-accent" />
            <CardDescription className="text-muted-foreground">
              Your futuristic learning companion
            </CardDescription>
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-effect">
              <TabsTrigger value="login" className="hover-glow">Login</TabsTrigger>
              <TabsTrigger value="signup" className="hover-glow">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="neon-border hover-glow"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Password</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="neon-border hover-glow"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full neon-glow hover-glow"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Nickname</span>
                  </Label>
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="Choose a nickname"
                    value={signUpData.nickname}
                    onChange={(e) => setSignUpData({ ...signUpData, nickname: e.target.value })}
                    className="neon-border hover-glow"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className="neon-border hover-glow"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Password</span>
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className="neon-border hover-glow"
                    required
                  />
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="confirm-password" className="flex items-center space-x-2">
                     <Lock className="h-4 w-4" />
                     <span>Confirm Password</span>
                   </Label>
                   <Input
                     id="confirm-password"
                     type="password"
                     placeholder="Confirm your password"
                     value={signUpData.confirmPassword}
                     onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                     className="neon-border hover-glow"
                     required
                   />
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="contact-number" className="flex items-center space-x-2">
                     <Phone className="h-4 w-4" />
                     <span>Contact Number (Optional)</span>
                   </Label>
                   <Input
                     id="contact-number"
                     type="tel"
                     placeholder="Your phone number"
                     value={signUpData.contactNumber}
                     onChange={(e) => setSignUpData({ ...signUpData, contactNumber: e.target.value })}
                     className="neon-border hover-glow"
                   />
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="contact-email" className="flex items-center space-x-2">
                     <Mail className="h-4 w-4" />
                     <span>Alternative Contact Email (Optional)</span>
                   </Label>
                   <Input
                     id="contact-email"
                     type="email"
                     placeholder="Alternative email address"
                     value={signUpData.contactEmail}
                     onChange={(e) => setSignUpData({ ...signUpData, contactEmail: e.target.value })}
                     className="neon-border hover-glow"
                   />
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="school-tag" className="flex items-center space-x-2">
                     <School className="h-4 w-4" />
                     <span>School (Optional)</span>
                   </Label>
                   <Select value={signUpData.schoolTag} onValueChange={(value) => setSignUpData({ ...signUpData, schoolTag: value })}>
                     <SelectTrigger className="neon-border hover-glow">
                       <SelectValue placeholder="Select your school" />
                     </SelectTrigger>
                     <SelectContent>
                       {schoolTags.map((tag) => (
                         <SelectItem key={tag.id} value={tag.id}>
                           {tag.display_name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <div className="flex items-center justify-between text-xs text-muted-foreground">
                     <span>Don't see your school?</span>
                     <Button
                       type="button"
                       variant="link"
                       size="sm"
                       onClick={() => setShowContactAdmin(true)}
                       className="h-auto p-0 hover-glow"
                     >
                       Contact Admins
                     </Button>
                   </div>
                 </div>
                <Button 
                  type="submit" 
                  className="w-full neon-glow hover-glow"
                  disabled={loading || signUpData.password !== signUpData.confirmPassword}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Contact Admin Dialog */}
      {showContactAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md glass-effect neon-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6" />
                <span>Contact Administrators</span>
              </CardTitle>
              <CardDescription>
                Request to add your school to the system
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
                    className="neon-border hover-glow"
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
                    className="neon-border hover-glow"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-message">Message</Label>
                  <Input
                    id="admin-message"
                    value={contactAdminData.message}
                    onChange={(e) => setContactAdminData({ ...contactAdminData, message: e.target.value })}
                    placeholder="Please add my school: [School Name]"
                    className="neon-border hover-glow"
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
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowContactAdmin(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AuthPage;