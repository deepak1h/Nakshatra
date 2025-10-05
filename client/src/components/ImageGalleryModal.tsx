import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  startIndex?: number;
}

export default function ImageGalleryModal({ isOpen, onClose, images, startIndex = 0 }: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // Effect to reset the index when the modal is opened with a new start index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
    }
  }, [isOpen, startIndex]);

  // --- NAVIGATION LOGIC ---
  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] bg-transparent border-none shadow-none p-0 flex flex-col items-center justify-center">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 z-50 text-white bg-black/50 rounded-full hover:bg-black/70 hover:text-white">
          <X className="w-6 h-6" />
        </Button>

        <div className="relative w-full h-full flex items-center justify-center">
          {/* --- MAIN IMAGE: Now uses internal state --- */}
          <img 
            src={images[currentIndex]} 
            alt={`Full screen view ${currentIndex + 1}`} 
            className="max-w-full max-h-full object-contain" 
          />

          {/* --- NAVIGATION ARROWS --- */}
          {images.length > 1 && (
            <>
              <Button variant="ghost" size="icon" onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 rounded-full hover:bg-black/70 hover:text-white h-12 w-12">
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 rounded-full hover:bg-black/70 hover:text-white h-12 w-12">
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}
        </div>

        {/* --- THUMBNAIL STRIP --- */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg backdrop-blur-sm">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-16 h-16 rounded-md overflow-hidden transition-all border-2 ${
                  currentIndex === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}