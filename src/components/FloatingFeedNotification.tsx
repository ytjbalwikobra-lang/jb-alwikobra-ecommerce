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
    <div className="fixed bottom-6 right-6 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative max-w-sm rounded-2xl border border-pink-500/30 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-lg shadow-2xl p-5 text-white group hover:shadow-pink-500/20 transition-all duration-300 hover:-translate-y-1">
        {/* Animated background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent rounded-2xl animate-pulse opacity-60" />
        
        {/* Close button */}
        <button
          onClick={() => onClose()}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors duration-200 text-gray-400 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse" />
            <div className="text-xs font-medium text-pink-300 uppercase tracking-wide">Aktivitas Baru di Feed</div>
          </div>
          
          <div className="mb-4 text-sm leading-relaxed text-gray-100 font-medium">
            {notif.message || 'Ada update baru di feed komunitas.'}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => { onClose(); navigate('/feed'); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-pink-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat Sekarang
                  </>
                )}
              </span>
            </button>
            <button
              onClick={() => onClose(5 * 60 * 1000)}
              className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-sm font-medium transition-all duration-300 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Nanti
            </button>
          </div>
        </div>
        
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
      </div>
    </div>
  );
};

export default FloatingFeedNotification;
