import React from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { Bell, Search, ArrowLeft, Share2 } from 'lucide-react';
import { PageView } from '../../types';

export const MobileHeader: React.FC = () => {
  const {
    activePage,
    navigateTo,
    unreadNotificationsCount,
    currentUser,
    viewingUserId,
    allUsers,
    showToast,
  } = useApp();

  const isHome = activePage === 'home';

  // Get active profile user for profile share button
  const profileUser =
    (viewingUserId && allUsers.find((u) => u.id === viewingUserId)) || currentUser;

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/#profile-${profileUser.username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
    }
    showToast(`Profile link for @${profileUser.username} copied!`, 'info');
  };

  const getPageTitle = (page: PageView): string => {
    switch (page) {
      case 'explore':
        return 'Explore';
      case 'trending':
        return 'Trending Discussions';
      case 'post_details':
        return 'Discussion Thread';
      case 'profile':
        return isHome ? 'Profile' : `@${profileUser.username}`;
      case 'notifications':
        return 'Notifications';
      case 'search':
        return 'Search';
      case 'settings':
        return 'Settings';
      case 'about':
        return 'About Comentosh';
      case 'login':
        return 'Sign In';
      case 'signup':
        return 'Create Account';
      case 'create_post':
        return 'Start Discussion';
      default:
        return 'Comentosh';
    }
  };

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 h-14 flex items-center justify-between">
      {isHome ? (
        <>
          {/* Home View: Standard Brand Header */}
          <div onClick={() => navigateTo('home')} className="cursor-pointer">
            <BrandLogo size="sm" showTagline={false} />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateTo('search')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigateTo('notifications')}
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#2F80ED]" />
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Other Views: Back Button + Page Name (+ Profile Share on Profile) */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => navigateTo('home')}
              className="min-h-[44px] min-w-[44px] -ml-1.5 flex items-center justify-center text-slate-700 hover:text-slate-900 rounded-lg active:bg-slate-100 transition-colors shrink-0"
              aria-label="Back to Home Feed"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {getPageTitle(activePage)}
            </h1>
          </div>

          {/* Right Action: Profile Share Button if on Profile Page */}
          <div className="flex items-center">
            {activePage === 'profile' ? (
              <button
                onClick={handleShareProfile}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#2F80ED] hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Share Profile"
                title="Share Profile"
              >
                <Share2 className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        </>
      )}
    </header>
  );
};

