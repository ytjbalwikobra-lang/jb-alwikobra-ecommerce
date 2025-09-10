/* eslint-disable no-empty, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-floating-promises, prefer-const */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { feedService } from '../services/feedService';
import { supabase } from '../services/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

type FeedNotification = {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'system';
  message: string;
  created_at: string;
  read_at?: string | null;
  post_id?: string;
};

const STORAGE_KEYS = {
  dismissedUntil: 'feed_float_dismissed_until',
  lastSeenId: 'feed_last_seen_notification_id',
};

const FloatingFeedNotification: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notif, setNotif] = React.useState<FeedNotification | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const isOnFeed = location.pathname.startsWith('/feed');

  const load = React.useCallback(async () => {
    if (!user) return;
    if (isOnFeed) return;
    // Respect temporary dismissal
    try {
      const until = localStorage.getItem(STORAGE_KEYS.dismissedUntil);
      if (until && Date.now() < Number(until)) return;
    } catch {}
    setLoading(true);
    try {
      const data = await feedService.getNotifications();
      const list: FeedNotification[] = data?.notifications || [];
      const unread = list.find(n => !n.read_at);
      if (unread) {
        // Avoid re-showing the same notification repeatedly
        try {
          const lastSeen = localStorage.getItem(STORAGE_KEYS.lastSeenId);
          if (lastSeen === unread.id) {
            setLoading(false);
            return;
          }
        } catch {}
        setNotif(unread);
        setVisible(true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user, isOnFeed]);

  // Polling + optional realtime via Supabase
  React.useEffect(() => {
    if (!user) return;
  let interval: ReturnType<typeof setInterval> | undefined;
  let channel: RealtimeChannel | undefined;
    load();
    interval = setInterval(load, 30000);
    try {
      if (supabase) {
        channel = supabase
          .channel('feed_notifications_float')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_notifications' }, () => {
            load();
          })
          .subscribe();
      }
    } catch {}
    return () => {
  if (interval) clearInterval(interval);
  try { if (channel) supabase?.removeChannel(channel); } catch {}
    };
  }, [user, load]);

  if (!user || isOnFeed) return null;
  if (!notif || !visible) return null;

  const onClose = (snoozeMs?: number) => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEYS.lastSeenId, notif.id);
      if (snoozeMs) {
        localStorage.setItem(STORAGE_KEYS.dismissedUntil, String(Date.now() + snoozeMs));
      }
    } catch {}
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      <div className="max-w-xs rounded-2xl border border-pink-500/30 bg-gradient-to-b from-gray-950 to-black shadow-2xl p-4 text-gray-200 animate-in fade-in slide-in-from-bottom-2">
        <div className="text-xs text-pink-300/90">Aktivitas baru di Feed</div>
        <div className="mt-1 text-sm leading-snug">{notif.message || 'Ada update baru di feed komunitas.'}</div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => { onClose(); navigate('/feed'); }}
            className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-sm"
            disabled={loading}
          >
            Lihat sekarang
          </button>
          <button
            onClick={() => onClose(5 * 60 * 1000)}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-sm"
            disabled={loading}
          >
            Nanti
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingFeedNotification;
