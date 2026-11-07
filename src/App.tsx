import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LeftSidebar } from './components/common/LeftSidebar';
import { RightSidebar } from './components/common/RightSidebar';
import { MobileHeader } from './components/common/MobileHeader';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { CreatePostModal } from './components/feed/CreatePostModal';

// Pages
import { HomeFeed } from './pages/HomeFeed';
import { ExplorePage } from './pages/ExplorePage';
import { TrendingPage } from './pages/TrendingPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

const MainContent: React.FC = () => {
  const { activePage } = useApp();

  // If on pure login/signup views, render dedicated auth views with notifications
  if (activePage === 'login') {
    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#111111] w-full flex items-center justify-center p-4">
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  if (activePage === 'signup') {
    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#111111] w-full flex items-center justify-center p-4">
        <SignupPage />
        <ToastContainer />
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomeFeed />;
      case 'explore':
        return <ExplorePage />;
      case 'trending':
        return <TrendingPage />;
      case 'post_details':
        return <PostDetailPage />;
      case 'profile':
        return <ProfilePage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'search':
        return <SearchPage />;
      case 'settings':
        return <SettingsPage />;
      case 'about':
        return <AboutPage />;
      case 'create_post':
        return <HomeFeed />;
      default:
        return <HomeFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#111111] w-full">
      <div className="w-full flex min-h-screen">
        {/* Desktop Left Sidebar */}
        <LeftSidebar />

        {/* Center Main Feed Column - Full Width */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#F5F7FA] overflow-x-hidden">
          {/* Mobile Top Header */}
          <MobileHeader />

          {/* Main Content Area - Edge-to-Edge on Mobile, Full-Width on Desktop */}
          <main className="flex-1 w-full pt-0 pb-24 sm:py-6 px-0 sm:px-4 lg:px-6 min-w-0">
            {renderActivePage()}
          </main>
        </div>

        {/* Desktop Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals & Notifications */}
      <CreatePostModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
