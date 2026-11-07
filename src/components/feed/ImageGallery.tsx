import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const validImages = (images || []).filter((img) => img && typeof img === 'string' && img.trim().length > 0 && !failedImages[img]);

  if (validImages.length === 0) return null;

  return (
    <>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/80">
        {validImages.length === 1 ? (
          <div
            onClick={() => setSelectedImage(validImages[0])}
            className="cursor-zoom-in max-h-96 w-full overflow-hidden bg-slate-100 flex items-center justify-center"
          >
            <img
              src={validImages[0]}
              alt="Post attachment"
              className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-200"
              referrerPolicy="no-referrer"
              onError={() => {
                setFailedImages((prev) => ({ ...prev, [validImages[0]]: true }));
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 bg-slate-200">
            {validImages.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                className="relative aspect-video overflow-hidden bg-slate-100 cursor-zoom-in group"
              >
                <img
                  src={img}
                  alt={`Attachment ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    setFailedImages((prev) => ({ ...prev, [img]: true }));
                  }}
                />
                {idx === 3 && validImages.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                    +{validImages.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Expanded view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </>
  );
};
