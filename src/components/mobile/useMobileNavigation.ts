import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export const useMobileNavigation = () => {
  const location = useLocation();
  const [hasNewFeed, setHasNewFeed] = useState(false);

  // Poll feed notifications and indicate new items
  useEffect(() => {
    let intervalTimer: NodeJS.Timeout | null = null;
    let unsub: any = null;
    const token = localStorage.getItem('session_token') || '';
    
    const load = async (): Promise<void> => {
      try {
        if (!token) return;
        const res = await fetch('/api/feed?action=notifications', { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const j = await res.json() as { notifications?: Array<{ read_at?: string }> };
        const hasUnread = (j.notifications || []).some((n) => !n.read_at);
        setHasNewFeed(hasUnread);
      } catch {
        // Silent fail for better UX
      }
    };

    void load();
    intervalTimer = setInterval(() => {
      void load();
    }, 30000);

    // Optional realtime hook if supabase available
    if (supabase) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const channel = (supabase as any).channel('feed_notifications');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        unsub = channel
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'feed_notifications' 
          }, () => {
            void load();
          })
          .subscribe();
      } catch {
        // Silent fail
      }
    }

    return () => { 
      if (intervalTimer) {
        clearInterval(intervalTimer);
      }
      try { 
        if (unsub && supabase) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          (supabase as any).removeChannel(unsub); 
        }
      } catch {
        // Silent fail
      } 
    };
  }, []);

  // Clear badge on entering feed
  useEffect(() => {
    if (location.pathname === '/feed' && hasNewFeed) {
      const timer = setTimeout(() => setHasNewFeed(false), 300);
      const token = localStorage.getItem('session_token') || '';
      if (token) {
        void fetch('/api/feed?action=notifications-read', { 
          method: 'POST', 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
      }
      return () => clearTimeout(timer);
    }
  }, [location.pathname, hasNewFeed]);

  return {
    currentPath: location.pathname,
    hasNewFeed
  };
};
