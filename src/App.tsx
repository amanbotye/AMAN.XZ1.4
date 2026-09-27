import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { liveAmanService } from './services/liveAmanService';
import { AuthScreen } from './components/AuthScreen';
import { CustomerAppLive } from './components/CustomerAppLive';
import { AdminAppLive } from './components/AdminAppLive';
import { Loader2 } from 'lucide-react';
import { User } from './types/aman';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check initial session & user profile
  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        const profile = await liveAmanService.getCurrentUserProfile();
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error('Session check error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const profile = await liveAmanService.getCurrentUserProfile();
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await liveAmanService.signOut();
    setSession(null);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3 font-['Cairo',sans-serif]">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <div className="text-xs">جاري تشغيل منظومة أمان والتحقق من الجلسة...</div>
      </div>
    );
  }

  // Not authenticated -> show Real Auth Screen (Login / Sign Up / Reset Password)
  if (!session) {
    return <AuthScreen onAuthSuccess={checkSession} />;
  }

  // Authenticated as Admin -> Admin App
  if (currentUser?.user_type === 'admin') {
    return <AdminAppLive onSignOut={handleSignOut} adminEmail={session.user.email} />;
  }

  // Authenticated as Customer -> Customer App
  return <CustomerAppLive onSignOut={handleSignOut} userEmail={session.user.email} />;
}
