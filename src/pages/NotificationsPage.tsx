import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCheck,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Award,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    openPostDetails,
    openUserProfile,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'replies' | 'likes'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'replies') return n.type === 'comment_reply' || n.type === 'post_comment';
    if (filter === 'likes') return n.type === 'comment_like';
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'comment_like':
        return <ThumbsUp className="w-4 h-4 text-[#2F80ED]" />;
      case 'comment_reply':
      case 'post_comment':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'milestone':
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#2F80ED]" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-6 pb-20">
      {/* Header */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-[#2F80ED]" />
            <h1 className="text-base font-bold text-slate-900">Notifications</h1>
          </div>
          <p className="text-xs text-slate-500">
            Track reactions to your comments, replies to your thoughts, and conversation milestones.
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Segmented Filter */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-none sm:rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 sm:flex-none text-center px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter('replies')}
          className={`flex-1 sm:flex-none text-center px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            filter === 'replies'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Replies & Comments
        </button>
        <button
          onClick={() => setFilter('likes')}
          className={`flex-1 sm:flex-none text-center px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            filter === 'likes'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Comment Likes
        </button>
      </div>

      {/* Notifications List */}
      <div className="w-full flex flex-col gap-2.5">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                openPostDetails(notif.postId);
              }}
              className={`w-full p-4 rounded-none sm:rounded-2xl border-x-0 sm:border border-y transition-all cursor-pointer flex items-start gap-3.5 ${
                notif.isRead
                  ? 'bg-white border-slate-200/80 hover:bg-slate-50'
                  : 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/80'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={notif.actor.avatar}
                  alt={notif.actor.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    openUserProfile(notif.actor.id);
                  }}
                  className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center">
                  {getNotifIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {notif.actor.name}
                  </p>
                  <span className="text-[11px] text-slate-400 shrink-0">{notif.createdAt}</span>
                </div>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                  {notif.contentSnippet}
                </p>
              </div>

              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-[#2F80ED] shrink-0 mt-2" />
              )}
            </div>
          ))
        ) : (
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center gap-2">
            <Sparkles className="w-8 h-8 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">No notifications</h3>
            <p className="text-xs text-slate-500">
              When other thinkers reply to your comments or agree with your perspectives, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
