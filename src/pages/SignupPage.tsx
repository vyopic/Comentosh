import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { POPULAR_TOPICS } from '../data/initialData';
import { ArrowRight, ArrowLeft, Sparkles, Check, Phone, ShieldCheck } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { navigateTo, showToast, registerUser } = useApp();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Software Architecture', 'Design & Craft']);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTopic = (topicName: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName) ? prev.filter((t) => t !== topicName) : [...prev, topicName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      showToast('নাম এবং ইউজারনেম দিন', 'alert');
      return;
    }

    const cleanPhone = phoneNumber.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 8) {
      showToast('মোবাইল নাম্বার দেওয়া বাধ্যতামূলক (Mobile number is required without exception)', 'alert');
      return;
    }

    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+880 ${cleanPhone}`;
    const cleanUsername = username.trim().replace(/^@+/, '').toLowerCase();
    setIsLoading(true);

    try {
      const success = await registerUser({
        name: name.trim(),
        username: cleanUsername,
        phoneNumber: formattedPhone,
        password: password || 'comentosh123',
        bio: bio.trim() || 'Passionate thinker and conversationalist on Comentosh.',
      });

      if (success) {
        navigateTo('home');
      }
    } finally {
      setIsLoading(false);
    }
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
          onClick={() => navigateTo('login')}
          className="text-xs font-semibold text-[#2F80ED] hover:underline"
        >
          Sign in instead →
        </button>
      </div>

      {/* Brand Header */}
      <div className="text-center flex flex-col items-center">
        <BrandLogo size="lg" showTagline={true} />
        <h1 className="text-xl font-bold text-slate-900 mt-4">Join Comentosh</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          A social network where conversations matter and post likes do not exist.
        </p>
      </div>

      {/* Main Signup Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED]"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Username Handle</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. mayalin"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED]"
              required
            />
          </div>

          {/* Mandatory Mobile Phone Number (No Email Alternative) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Mobile Phone Number <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                বাধ্যতামূলক (Mandatory)
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
            <p className="text-[10px] text-slate-400 mt-1">
              মোবাইল নাম্বার ছাড়া কোনো একাউন্ট খোলা যাবে না (Mobile number is strictly required).
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED]"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What questions or topics do you care about discussing?"
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2F80ED] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Topics You Care About:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TOPICS.map((top) => {
                const isSelected = selectedTopics.includes(top.name);
                return (
                  <button
                    key={top.id}
                    type="button"
                    onClick={() => toggleTopic(top.name)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#2F80ED] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{top.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#2F80ED] text-white hover:bg-[#256fd1] text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            <span>Complete Registration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{' '}
          <button
            onClick={() => navigateTo('login')}
            className="text-[#2F80ED] font-semibold hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
