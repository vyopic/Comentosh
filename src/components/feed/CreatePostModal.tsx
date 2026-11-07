import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { POPULAR_TOPICS } from '../../data/initialData';

export const CreatePostModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createPost, currentUser, openPostDetails } = useApp();

  const [content, setContent] = useState('');
  const [topic, setTopic] = useState(POPULAR_TOPICS[0].name);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCreateModalOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedImages((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newId = createPost({
      content: content.trim(),
      topic,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
    });

    setContent('');
    setUploadedImages([]);
    setIsCreateModalOpen(false);
    openPostDetails(newId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-2xl overflow-hidden my-0 sm:my-8 max-h-[92vh] sm:max-h-none flex flex-col animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-150">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2F80ED]" />
            <h2 className="text-sm font-bold text-slate-900">Start a Discussion</h2>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4 overflow-y-auto">
          {/* Author info & Topic Picker */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full bg-slate-100 object-cover"
              />
              <span className="text-xs font-semibold text-slate-900">{currentUser.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="topic-select" className="text-xs text-slate-500 font-medium">
                Topic:
              </label>
              <select
                id="topic-select"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#2F80ED]"
              >
                {POPULAR_TOPICS.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="What question, thesis, or nuance do you want to explore with the community? (Aim for depth rather than brevity...)"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2F80ED] focus:bg-white transition-all resize-none leading-relaxed"
          />

          {/* Image Upload Preview Grid */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {uploadedImages.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                  <img
                    src={imgUrl}
                    alt={`Preview ${idx}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Ethos Reminder */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-normal">
            <strong>Comment-First Design:</strong> This post will not have a Like button. Thoughtful community comments and constructive replies are how ideas earn reputation.
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-[#2F80ED]" />
                <span>Add Images ({uploadedImages.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#2F80ED] text-white hover:bg-[#256fd1] disabled:opacity-40 disabled:hover:bg-[#2F80ED] transition-all shadow-xs"
              >
                Publish Discussion
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
