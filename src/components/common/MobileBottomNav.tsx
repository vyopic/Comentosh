import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';
import { PageView } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const {
    activePage,
    navigateTo,
    setIsCreateModalOpen,
    unreadNotificationsCount,
  } = useApp();

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Scroll detection to hide on scroll down, show on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // Threshold of 8px to prevent tiny jitter
          if (Math.abs(currentScrollY - lastScrollY.current) > 8) {
            if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
              // Scrolling down
              setIsVisible(false);
            } else {
              // Scrolling up or at top
              setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Always reveal nav bar when switching pages
  useEffect(() => {
    setIsVisible(true);
  }, [activePage]);

  const navItems: { label: string; page: PageView; icon: React.ReactNode; isAction?: boolean }[] = [
    { label: 'Home', page: 'home', icon: <Home className="w-5 h-5" /> },
    { label: 'Explore', page: 'explore', icon: <Compass className="w-5 h-5" /> },
    {
      label: 'Discuss',
      page: 'create_post',
      icon: <Plus className="w-6 h-6 text-white" />,
      isAction: true,
    },
    {
      label: 'Alerts',
      page: 'notifications',
      icon: (
        <div className="relative">
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#2F80ED]" />
          )}
        </div>
      ),
    },
    { label: 'Profile', page: 'profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 safe-area-bottom transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <div key={item.label} className="flex justify-center items-center">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-11 h-11 rounded-full bg-[#2F80ED] flex items-center justify-center shadow-md active:scale-95 transition-transform"
                  aria-label="Start Discussion"
                >
                  {item.icon}
                </button>
              </div>
            );
          }

          const isActive = activePage === item.page;

          return (
            <button
              key={item.label}
              onClick={() => navigateTo(item.page)}
              aria-label={item.label}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors relative ${
                isActive ? 'text-[#2F80ED]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {item.icon}
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F80ED] mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
