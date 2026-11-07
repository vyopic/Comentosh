import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  Database,
  RotateCcw,
  CheckCircle2,
  User,
  LogIn,
  UserPlus,
  LogOut,
  ArrowLeft,
  Users,
  AlertTriangle,
  X,
  Phone,
} from 'lucide-react';
import { INITIAL_POSTS, INITIAL_COMMENTS, INITIAL_NOTIFICATIONS, CURRENT_USER } from '../data/initialData';

export const SettingsPage: React.FC = () => {
  const { showToast, currentUser, updateUserProfile, navigateTo, logout, allUsers, switchUser } = useApp();

  const [slowModeEnabled, setSlowModeEnabled] = useState(true);
  const [notifyOnLikes, setNotifyOnLikes] = useState(true);
  const [notifyOnReplies, setNotifyOnReplies] = useState(true);
  const [highlightNuance, setHighlightNuance] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleResetData = () => {
    localStorage.removeItem('comentosh_posts');
    localStorage.removeItem('comentosh_comments');
    localStorage.removeItem('comentosh_notifications');
    localStorage.removeItem('comentosh_user');
    window.location.reload();
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-6 pb-20">
      {/* Top Navigation */}
      <div className="w-full flex items-center justify-between px-3 sm:px-0 pt-2 sm:pt-0">
        <button
          onClick={() => navigateTo('profile')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-semibold transition-colors shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Header */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-[#2F80ED]" />
          <h1 className="text-base font-bold text-slate-900">Platform Settings</h1>
        </div>
        <p className="text-xs text-slate-500">
          Manage your account session, conversation dynamics, notifications, and civility filters.
        </p>
      </div>

      {/* Account & Authentication Card */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <User className="w-4 h-4 text-[#2F80ED]" />
            <span>Active Account Session</span>
          </div>

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Authenticated
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full bg-slate-100 object-cover border border-slate-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm">{currentUser.name}</span>
                <span className="text-xs text-[#2F80ED] font-mono">@{currentUser.username}</span>
              </div>
              {currentUser.phoneNumber && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                  <Phone className="w-3 h-3 text-[#2F80ED]" />
                  <span>{currentUser.phoneNumber}</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.2 rounded-md border border-emerald-200">
                    Verified Mobile
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-0.5">{currentUser.bio || 'Active Thinker on Comentosh'}</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-semibold transition-colors shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
            <button
              onClick={() => navigateTo('login')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-[#2F80ED]" />
              <span>Switch / Sign In</span>
            </button>
            <button
              onClick={() => navigateTo('signup')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2F80ED] text-white hover:bg-[#256fd1] text-xs font-semibold transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conversation Civility Controls */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Sliders className="w-4 h-4 text-[#2F80ED]" />
          <span>Conversational Civility & Reading Filters</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
          <div>
            <p className="text-xs font-semibold text-slate-900">
              Thoughtful Friction (Reading Dwell)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Prompts readers to pause before replying to avoid reactionary knee-jerk comments.
            </p>
          </div>
          <button
            onClick={() => {
              setSlowModeEnabled(!slowModeEnabled);
              showToast(slowModeEnabled ? 'Friction mode disabled' : 'Friction mode enabled', 'info');
            }}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              slowModeEnabled ? 'bg-[#2F80ED]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                slowModeEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
          <div>
            <p className="text-xs font-semibold text-slate-900">
              Prioritize In-Depth Perspectives
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Automatically order comments by substantive upvotes and debate depth rather than timestamps alone.
            </p>
          </div>
          <button
            onClick={() => {
              setHighlightNuance(!highlightNuance);
              showToast('Ordering preference saved', 'info');
            }}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              highlightNuance ? 'bg-[#2F80ED]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                highlightNuance ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Bell className="w-4 h-4 text-[#2F80ED]" />
          <span>Notification Preferences</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
          <div>
            <p className="text-xs font-semibold text-slate-900">Notify on Comment Replies</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Get alerted when someone directly answers your perspective.
            </p>
          </div>
          <button
            onClick={() => setNotifyOnReplies(!notifyOnReplies)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              notifyOnReplies ? 'bg-[#2F80ED]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                notifyOnReplies ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
          <div>
            <p className="text-xs font-semibold text-slate-900">Notify on Comment Likes / Agrees</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Get notified when your comment receives upvotes from other thinkers.
            </p>
          </div>
          <button
            onClick={() => setNotifyOnLikes(!notifyOnLikes)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              notifyOnLikes ? 'bg-[#2F80ED]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                notifyOnLikes ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Backend & Cloudflare Readiness Note */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Database className="w-4 h-4 text-[#2F80ED]" />
          <span>Backend & Cloudflare D1 Architecture</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Comentosh's state models (Posts, Comments, Nested Replies, Author Profiles) are engineered with normalized relational foreign keys. When connecting Cloudflare Workers with Cloudflare D1 (SQLite) and R2 Object Storage for image uploads, the API contracts match the current TypeScript interfaces 1:1.
        </p>

        <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 font-mono">
          Ready endpoints: /api/posts, /api/comments, /api/replies, /api/reactions, /api/upload-r2
        </div>
      </div>

      {/* Demo Reset Action */}
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-x-0 sm:border border-y border-rose-100 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Reset Demo Data</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Clear locally created posts/comments and restore the initial curated discussions.
          </p>
        </div>
        <button
          onClick={handleResetData}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Log Out Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-sm overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <LogOut className="w-5 h-5" />
              </div>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Log out of Comentosh?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                You will be logged out of <strong className="text-slate-800">@{currentUser.username}</strong> on this browser. You can sign back in anytime.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
