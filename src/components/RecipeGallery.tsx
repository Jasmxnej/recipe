import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type RecipeGalleryProps = {
  images: string[];
  alt: string;
  className?: string;
};

const RecipeGallery = ({ images, alt, className }: RecipeGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allImagesLoaded, setAllImagesLoaded] = useState<boolean[]>([]);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Set up initial loading state for all images
  useEffect(() => {
    setAllImagesLoaded(new Array(images.length).fill(false));
  }, [images.length]);

  // Function to handle image load
  const handleImageLoad = (index: number) => {
    setAllImagesLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      
      // If this is the current image, set loading to false
      if (index === currentIndex) {
        setLoading(false);
      }
      
      return newState;
    });
  };

  // Navigation functions
  const nextImage = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setLoading(!allImagesLoaded[newIndex]);
    scrollToThumbnail(newIndex);
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    setLoading(!allImagesLoaded[newIndex]);
    scrollToThumbnail(newIndex);
  };

  const selectImage = (index: number) => {
    setCurrentIndex(index);
    setLoading(!allImagesLoaded[index]);
  };

  // Scroll to keep the selected thumbnail in view
  const scrollToThumbnail = (index: number) => {
    if (thumbnailsRef.current) {
      const thumbnail = thumbnailsRef.current.children[index] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  // If no images, show placeholder
  if (!images.length) {
    return (
      <div className={cn("rounded-xl overflow-hidden", className)}>
        <AspectRatio ratio={4/3}>
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No images available</span>
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main image */}
      <div className="relative rounded-xl overflow-hidden">
        <AspectRatio ratio={4/3}>
          {/* Loading overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-muted z-10"
              >
                <div className="loader" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`image-${currentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <img
                src={images[currentIndex]}
                alt={`${alt} - Image ${currentIndex + 1}`}
                onLoad={() => handleImageLoad(currentIndex)}
                className="object-cover w-full h-full"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                onClick={prevImage}
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 z-20"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                onClick={nextImage}
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 z-20"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
          
          {/* Image counter */}
          <div className="absolute bottom-2 right-2 bg-background/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs z-20">
            {currentIndex + 1} / {images.length}
          </div>
        </AspectRatio>
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          ref={thumbnailsRef}
          className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin"
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all",
                index === currentIndex 
                  ? "border-primary ring-2 ring-primary/30" 
                  : "border-transparent hover:border-primary/40"
              )}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                onLoad={() => handleImageLoad(index)} 
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeGallery;
