import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRole = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);
        
        if (user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          console.log('Profile data:', profileData, 'Error:', error);
          if (profileData) {
            setProfile(profileData);
            setUserRole(profileData.role || null);
          } else {
            setProfile(null);
            setUserRole(null);
          }
        } else {
          console.log('No user found');
          setProfile(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      fetchUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = () => {
    const result = userRole === 'admin';
    console.log('isAdmin check:', userRole, '=>', result);
    return result;
  };
  const isTeacher = () => userRole === 'teacher' || userRole === 'admin';
  const isStudent = () => userRole === 'student';

  return {
    userRole,
    profile,
    loading,
    isAdmin,
    isTeacher,
    isStudent
  };
};