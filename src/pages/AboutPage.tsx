import React from 'react';
import { BrandLogo } from '../components/common/BrandLogo';
import {
  Sparkles,
  HeartOff,
  MessageSquare,
  ShieldCheck,
  Server,
  Cloud,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { navigateTo, setIsCreateModalOpen } = useApp();

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-8 pb-24">
      {/* Hero section */}
      <div className="w-full bg-white rounded-none sm:rounded-3xl border-x-0 sm:border border-y border-slate-200/80 p-5 sm:p-8 shadow-xs text-center flex flex-col items-center">
        <BrandLogo size="lg" showTagline={false} />
        <span className="text-xs uppercase tracking-widest font-bold text-[#2F80ED] mt-4">
          The Comentosh Manifesto
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Where Conversations Matter.
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-3 max-w-xl leading-relaxed">
          Comentosh is a comment-first social network built on a radical yet simple premise: <span className="font-semibold text-slate-900">we completely removed the Post Like button</span>. In its place, thoughtful dialogue, constructive debate, and comment reactions drive social standing.
        </p>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#2F80ED] text-white text-xs font-semibold hover:bg-[#256fd1] transition-all shadow-xs"
          >
            Start a Discussion
          </button>
          <button
            onClick={() => navigateTo('home')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Explore the Feed
          </button>
        </div>
      </div>

      {/* Principle 1: Why We Killed the Like Button */}
      <div className="w-full bg-white rounded-none sm:rounded-3xl border-x-0 sm:border border-y border-slate-200/80 p-5 sm:p-8 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
            <HeartOff className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Foundational Shift
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Why We Killed the Post Like Button
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          The 1-tap "Like" button was invented as a convenience, but it quickly became the digital world's slot machine lever. Algorithms learned that provoking quick outrage or showing superficial vanity photos earned millions of thoughtless clicks.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          By removing post likes, Comentosh changes the incentive structure entirely. You cannot gain validation simply by posting empty photos or sensational headlines. If your idea cannot inspire someone to spend 30 seconds articulating a response, it has no currency here.
        </p>
      </div>

      {/* Principle 2: The Comment-First Interaction Loop */}
      <div className="w-full bg-white rounded-none sm:rounded-3xl border-x-0 sm:border border-y border-slate-200/80 p-5 sm:p-8 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-[#2F80ED]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Interaction Mechanics
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              How Comment-First Social Works
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-50 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-900">01. Seed a Question</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Posts act as intellectual catalysts. Authors introduce a thesis, share an architectural diagram, or pose an open inquiry.
            </p>
          </div>

          <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-50 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-900">02. Community Perspectives</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thinkers contribute nuanced perspectives. Readers upvote and agree with the strongest comments.
            </p>
          </div>

          <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-50 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-900">03. Spotlight Elevation</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              The highest quality comment is showcased directly in the feed as the "Top Community Perspective".
            </p>
          </div>
        </div>
      </div>

      {/* Architecture & Future Roadmap */}
      <div className="w-full bg-white rounded-none sm:rounded-3xl border-x-0 sm:border border-y border-slate-200/80 p-5 sm:p-8 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Technical Readiness
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Cloudflare Workers, D1 & R2 Architecture
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Comentosh's frontend is architected to seamlessly plug into a serverless edge backend:
        </p>

        <div className="space-y-2.5 text-xs text-slate-700">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
            <Cloud className="w-4 h-4 text-[#2F80ED] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Cloudflare Workers:</span> Ultra-low latency edge compute for handling routing, authentication, and comment stream broadcasts worldwide in under 20ms.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
            <Code2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Cloudflare D1 (Serverless SQLite):</span> Normalized tables for <code className="bg-slate-200 px-1 py-0.5 rounded">users</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">discussions</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">comments</code>, and <code className="bg-slate-200 px-1 py-0.5 rounded">comment_reactions</code> with instantaneous indexed recursive queries.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
            <Server className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Cloudflare R2 Object Storage:</span> Zero-egress fee media storage for high-resolution multiple image attachments with presigned upload URLs.
            </div>
          </div>
        </div>
      </div>

      {/* Community Charter */}
      <div className="w-full bg-white rounded-none sm:rounded-3xl border-x-0 sm:border border-y border-slate-200/80 p-5 sm:p-8 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Our Community Charter</span>
        </div>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <li><strong>Argue with ideas, never with identities:</strong> Critique logic and evidence, not individuals.</li>
          <li><strong>Assume good faith:</strong> Seek to understand what the writer meant before attacking assumptions.</li>
          <li><strong>Add nuance:</strong> If a discussion is already unanimous, contribute edge cases and counter-arguments.</li>
          <li><strong>Upvote depth over agreement:</strong> Like comments that made you rethink, even if you disagree.</li>
        </ul>
      </div>
    </div>
  );
};
