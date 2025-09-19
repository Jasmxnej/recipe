
import { useState } from 'react';
import { Bookmark, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe } from '../contexts/RecipeContext';
import { useFolders, Folder } from '../contexts/FolderContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type BookmarkButtonProps = {
  recipe: Recipe;
  variant?: 'default' | 'outline' | 'card';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
};

const BookmarkButton = ({ 
  recipe,
  variant = 'default',
  size = 'default',
  className
}: BookmarkButtonProps) => {
  const { user } = useAuth();
  const {
    getUserFolders,
    getBookmarkByRecipeId,
    addBookmark,
    updateBookmark,
    removeBookmark
  } = useFolders();

  const [isBookmarking, setIsBookmarking] = useState(false);
  const [rating, setRating] = useState<number>(5);

  if (!user) {
    if (variant === 'card') {
      return (
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full absolute top-2 right-2 z-10 shadow-sm bg-background/80 hover:bg-background/95 opacity-60",
            className
          )}
          disabled
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
        className={cn("opacity-60", className)}
        disabled
      >
        <Bookmark className="mr-2 h-4 w-4" />
        Login to save recipes
      </Button>
    );
  }
  
  const userFolders = getUserFolders();
  const existingBookmark = getBookmarkByRecipeId(recipe.RecipeId);
  const currentFolder = existingBookmark ? userFolders.find(f => f.id === existingBookmark.folderId) : undefined;
  
  const handleBookmark = (folderId: string) => {
    setIsBookmarking(true);
    
    try {
      if (existingBookmark) {
        if (existingBookmark.folderId === folderId) {
          // Remove bookmark if clicking the same folder
          removeBookmark(existingBookmark.id);
        } else {
          // Update existing bookmark to new folder
          updateBookmark(existingBookmark.id, { folderId, rating });
        }
      } else {
        // Add new bookmark
        addBookmark(recipe.RecipeId, folderId, rating);
      }
    } finally {
      setIsBookmarking(false);
    }
  };

  // If no folders exist, disable bookmarking
  if (userFolders.length === 0) {
    return (
      <Button
        variant="outline"
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
        className={cn("opacity-60", className)}
        disabled
      >
        <Bookmark className="mr-2 h-4 w-4" />
        Create a folder first
      </Button>
    );
  }

  // Helper function to render folder item
  const renderFolderItem = (folder: Folder) => {
    const isActive = existingBookmark && existingBookmark.folderId === folder.id;
    
    return (
      <DropdownMenuItem
        key={folder.id}
        onSelect={(e) => {
          e.preventDefault();
          handleBookmark(folder.id);
        }}
        className="flex items-center justify-between py-2"
      >
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: folder.color || '#ff9f7f' }} 
          />
          <span>{folder.name}</span>
        </div>
        {isActive && <Check className="h-4 w-4 text-primary" />}
      </DropdownMenuItem>
    );
  };
  
  // Display different button based on context
  if (variant === 'card') {
    // Simple icon button for cards
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={existingBookmark ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full absolute top-2 right-2 z-10 shadow-sm",
              existingBookmark ? "bg-primary hover:bg-primary/90" : "bg-background/80 hover:bg-background/95",
              className
            )}
            disabled={isBookmarking}
          >
            <Bookmark 
              className={cn(
                "h-4 w-4", 
                existingBookmark ? "fill-primary-foreground text-primary-foreground" : "text-foreground"
              )} 
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <AnimatePresence>
            {userFolders.map(renderFolderItem)}
          </AnimatePresence>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  // For detailed pages - show rating as well
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={existingBookmark ? "default" : "outline"}
          size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
          className={cn(
            existingBookmark ? "bg-primary hover:bg-primary/90" : "",
            className
          )}
          disabled={isBookmarking}
        >
          <Bookmark 
            className={cn(
              "mr-2 h-4 w-4", 
              existingBookmark ? "fill-primary-foreground" : ""
            )} 
          />
          {existingBookmark ? `Saved in ${currentFolder?.name}` : "Save recipe"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <div className="flex items-center">
              <span className="mr-1">Rating:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star}
                    className={`w-4 h-4 ${star <= (existingBookmark?.rating || rating) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={existingBookmark?.rating.toString() || rating.toString()}
                onValueChange={(value) => setRating(parseInt(value))}
              >
                {[5, 4, 3, 2, 1].map((star) => (
                  <DropdownMenuRadioItem key={star} value={star.toString()}>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg 
                            key={s}
                            className={`w-4 h-4 ${s <= star ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <span>{star} star{star !== 1 ? 's' : ''}</span>
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <AnimatePresence>
          {userFolders.map(renderFolderItem)}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BookmarkButton;
