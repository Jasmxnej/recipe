// RecipeCard Component: Displays one recipe card with image, rating, cooking time, and tags. Clicks to go to recipe details page.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Recipe } from '../contexts/RecipeContext';
import { Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

type RecipeCardProps = {
  recipe: Recipe;
  personalRating?: number;
  index?: number;
  className?: string;
  featured?: boolean;
};

const RecipeCard = ({ recipe, personalRating, index = 0, className, featured = false }: RecipeCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const mainImage = Array.isArray(recipe.Images) && recipe.Images.length > 0 
    ? recipe.Images[0]
    : 'https://via.placeholder.com/300x200/f5f5f5/aaaaaa?text=No+Image';

  // Format cooking time to be more readable
  const formatCookTime = (time: string): string => {
    if (!time) return 'N/A';
    
    // PT1H30M -> 1h 30m
    const hourMatch = time.match(/(\d+)H/);
    const minuteMatch = time.match(/(\d+)M/);
    
    let result = '';
    if (hourMatch) result += `${hourMatch[1]}h `;
    if (minuteMatch) result += `${minuteMatch[1]}m`;
    
    return result.trim() || 'Quick';
  };

  // Get relevant tags from keywords or category
  const getTags = (): string[] => {
    if (Array.isArray(recipe.Keywords) && recipe.Keywords.length > 0) {
      return recipe.Keywords.slice(0, 2);
    }
    
    if (recipe.RecipeCategory) {
      return [recipe.RecipeCategory];
    }
    
    return [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link 
        to={`/recipe/${recipe.RecipeId}`}
        className={cn(
          "block bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 recipe-card h-full",
          className
        )}
      >
        <div className="recipe-card-image-container">
          <AspectRatio ratio={16/9}>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                <span className="sr-only">Loading image</span>
              </div>
            )}
            <img
              src={mainImage}
              alt={recipe.Name}
              className={cn(
                "object-cover w-full h-full recipe-card-image",
                !imageLoaded && "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </AspectRatio>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-500 mr-1" />
              <span className="text-sm font-medium">
                {typeof recipe.AggregatedRating === 'number' 
                  ? recipe.AggregatedRating.toFixed(1) 
                  : '—'
                }
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                ({recipe.ReviewCount || 0})
              </span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-xs">{formatCookTime(recipe.TotalTime)}</span>
            </div>
          </div>

          {personalRating && (
            <div className="flex items-center text-amber-500 mt-2">
              <span className="text-xs font-medium mr-2">Your Rating:</span>
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i < personalRating ? "fill-amber-500" : "text-amber-400"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs ml-1">{personalRating} stars</span>
            </div>
          )}
          
          <h3 
            className={cn(
              "font-medium line-clamp-2 mb-2",
              featured ? "text-xl font-display" : "text-base"
            )}
          >
            {recipe.Name}
          </h3>
          
          {featured && recipe.Description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {recipe.Description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {getTags().map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RecipeCard;
