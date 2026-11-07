import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative shrink-0 ${iconSizes[size]} flex items-center justify-center`}>
        <img
          src="/assets/aistudio/comment-first-2slice-dot_54740924.svg"
          alt="Comentosh"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col">
        <span
          className={`font-extrabold tracking-tight text-slate-900 ${textSizes[size]} leading-none`}
        >
          Comentosh
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 tracking-normal mt-1">
            Where Conversations Matter
          </span>
        )}
      </div>
    </div>
  );
};
