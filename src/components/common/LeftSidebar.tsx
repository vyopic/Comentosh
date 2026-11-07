import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  Home,
  Compass,
  TrendingUp,
  Bell,
  Bookmark,
  User as UserIcon,
  BookOpen,
  Settings,
  PlusCircle,
  ChevronUp,
  Check,
  Users,
} from 'lucide-react';
import { PageView } from '../../types';

export const LeftSidebar: React.FC = () => {
  const {
    activePage,
    navigateTo,
    currentUser,
    allUsers,
    switchUser,
    unreadNotificationsCount,
    setIsCreateModalOpen,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems: { label: string; page: PageView; icon: React.ReactNode; badge?: number }[] = [
    { label: 'Home Feed', page: 'home', icon: <Home className="w-5 h-5" /> },
    { label: 'Explore Topics', page: 'explore', icon: <Compass className="w-5 h-5" /> },
    { label: 'Trending Debates', page: 'trending', icon: <TrendingUp className="w-5 h-5" /> },
    {
      label: 'Notifications',
      page: 'notifications',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadNotificationsCount,
    },
    { label: 'Saved Threads', page: 'profile', icon: <Bookmark className="w-5 h-5" /> },
    { label: 'My Profile', page: 'profile', icon: <UserIcon className="w-5 h-5" /> },
    { label: 'About Comentosh', page: 'about', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Settings', page: 'settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 h-screen sticky top-0 border-r border-slate-200/80 bg-white p-5 select-none shrink-0">
      <div className="flex flex-col gap-6">
        {/* Brand Lockup */}
        <div
          onClick={() => navigateTo('home')}
          className="cursor-pointer px-2 py-1 -ml-2 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <BrandLogo size="md" showTagline={true} />
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2F80ED] hover:bg-[#256fd1] text-white font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start Discussion</span>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              activePage === item.page &&
              (item.label !== 'Saved Threads' || activePage === 'profile');

            return (
              <button
                key={item.label}
                onClick={() => navigateTo(item.page)}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100/90 text-[#2F80ED] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#2F80ED]' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#2F80ED] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Perspective Switcher / User Profile Card */}
      <div className="relative pt-4 border-t border-slate-100">
        {isUserMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-20 flex flex-col gap-1">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Switch Perspective (Demo)</span>
            </div>
            {allUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  switchUser(user.id);
                  setIsUserMenuOpen(false);
                }}
                className={`flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                  currentUser.id === user.id
                    ? 'bg-slate-100 font-semibold text-slate-900'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full bg-slate-100 object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">@{user.username}</p>
                  </div>
                </div>
                {currentUser.id === user.id && (
                  <Check className="w-4 h-4 text-[#2F80ED] shrink-0" />
                )}
              </button>
            ))}

            <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
              <button
                onClick={() => {
                  navigateTo('login');
                  setIsUserMenuOpen(false);
                }}
                className="flex-1 py-1.5 px-2 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold text-center transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  navigateTo('signup');
                  setIsUserMenuOpen(false);
                }}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#2F80ED] text-white hover:bg-[#256fd1] font-semibold text-center transition-colors shadow-xs"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full bg-slate-100 object-cover shrink-0 border border-slate-200"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400 truncate">@{currentUser.username}</p>
            </div>
          </div>
          <ChevronUp
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isUserMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </aside>
  );
};
