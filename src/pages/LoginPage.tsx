import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { Lock, Phone, ArrowRight, ArrowLeft, Sparkles, Check, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { allUsers, switchUser, navigateTo, showToast, loginUser } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 8) {
      showToast('বৈধ মোবাইল নাম্বার প্রদান করুন (Enter a valid mobile phone number)', 'alert');
      return;
    }

    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+880 ${cleanPhone}`;
    setIsLoading(true);

    try {
      const success = await loginUser(formattedPhone, password || 'comentosh123');
      if (success) {
        navigateTo('home');
        return;
      }

      // Fallback to local demo list
      const existing = allUsers.find(
        (u) =>
          (u.phoneNumber && u.phoneNumber.replace(/[^0-9]/g, '').includes(cleanPhone.replace(/[^0-9]/g, ''))) ||
          cleanPhone.includes(u.username)
      );

      if (existing) {
        switchUser(existing.id);
        navigateTo('home');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (userId: string) => {
    switchUser(userId);
    navigateTo('home');
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-8 px-4 flex flex-col gap-5 sm:gap-6 min-h-screen justify-center">
      {/* Top back navigation */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>
        <button
          onClick={() => navigateTo('signup')}
          className="text-xs font-semibold text-[#2F80ED] hover:underline"
        >
          Create account →
        </button>
      </div>
      {/* Brand Header */}
      <div className="text-center flex flex-col items-center">
        <BrandLogo size="lg" showTagline={true} />
        <h1 className="text-xl font-bold text-slate-900 mt-4">Welcome back to Comentosh</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Sign in with your mobile number to participate in thoughtful conversations.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col gap-5">
        <form onSubmit={handleFormLogin} className="flex flex-col gap-4">
          {/* Mobile Phone Number (No Email Alternative) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Mobile Phone Number <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Phone Only
              </span>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1 text-xs font-semibold text-slate-500 pr-2 border-r border-slate-200">
                <Phone className="w-3.5 h-3.5 text-[#2F80ED]" />
                <span>+880</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="17XXXXXXXX"
                className="w-full pl-22 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED] font-mono tracking-wide"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => showToast('Password reset code sent via SMS (demo)', 'info')}
                className="text-[11px] text-[#2F80ED] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED]"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#2F80ED] text-white hover:bg-[#256fd1] text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
            Or Demo 1-Click
          </span>
        </div>

        {/* Quick Demo Logins for Testing Perspectives */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] text-slate-500 font-medium">
            Test as one of the platform thinkers:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {allUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleQuickDemoLogin(user.id)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center gap-2 text-left transition-colors group"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full bg-slate-200 object-cover shrink-0"
                />
                <div className="truncate">
                  <p className="text-[11px] font-semibold text-slate-800 group-hover:text-[#2F80ED] truncate">
                    {user.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user.phoneNumber ? user.phoneNumber : `@${user.username}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer switcher */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => navigateTo('signup')}
            className="text-[#2F80ED] font-semibold hover:underline"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};
