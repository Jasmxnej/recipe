
import { Recipe } from '../contexts/RecipeContext';
import RecipeCard from './RecipeCard';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

type RecipeGridProps = {
  recipes: Recipe[];
  personalRatings?: Record<number, number>;
  emptyMessage?: string;
  className?: string;
  cardClassName?: string;
  columns?: number;
  featured?: boolean[];
  isLoading?: boolean;
};

const RecipeGrid = ({
  recipes,
  personalRatings,
  emptyMessage = 'No recipes found',
  className,
  cardClassName,
  columns = 3,
  featured = [],
  isLoading = false
}: RecipeGridProps) => {
  // State to track if we should show progressive loading
  const [showProgressiveLoading, setShowProgressiveLoading] = useState(false);
  
  // Show progressive loading after a shorter delay
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowProgressiveLoading(true);
      }, 150); // Reduced from 300ms for faster feedback
      return () => clearTimeout(timer);
    } else {
      setShowProgressiveLoading(false);
    }
  }, [isLoading]);
  
  // Loading state with improved progressive skeleton loading
  if (isLoading && showProgressiveLoading) {
    return (
      <div 
        className={cn(
          "grid gap-6",
          columns === 1 ? "grid-cols-1" : 
          columns === 2 ? "grid-cols-1 sm:grid-cols-2" : 
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          className
        )}
      >
        {Array(columns * 2).fill(0).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3 animate-pulse">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state with a better message for loading or no recipes
  if (!recipes || !recipes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">{isLoading ? 'Loading recipes...' : emptyMessage}</h3>
        <p className="text-muted-foreground mt-1">
          {isLoading 
            ? 'This should only take a moment' 
            : 'Try adjusting your search or filters'}
        </p>
      </div>
    );
  }

  // Filled state with recipes - implement lazy loading for better performance
  return (
    <div 
      className={cn(
        "grid gap-6",
        columns === 1 ? "grid-cols-1" : 
        columns === 2 ? "grid-cols-1 sm:grid-cols-2" : 
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={recipe.RecipeId}
          recipe={recipe}
          personalRating={personalRatings?.[recipe.RecipeId]}
          index={index}
          className={cardClassName}
          featured={featured[index]}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
