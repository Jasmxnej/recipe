// RecipeContext: Manages all recipe data, search, ratings, reviews. Provides functions to get recipes by category, add reviews, etc. Uses context for sharing state across app.
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export interface Recipe {
  RecipeId: number;
  Name: string;
  AuthorId: string;
  AuthorName: string;
  CookTime: string;
  PrepTime: string;
  TotalTime: string;
  DatePublished: string;
  Description: string;
  Images: string[];
  RecipeCategory: string;
  Keywords: string[];
  RecipeIngredientQuantities: string[];
  RecipeIngredientParts: string[];
  AggregatedRating: number;
  ReviewCount: number;
  Calories: number;
  FatContent: number;
  SaturatedFatContent: number;
  CholesterolContent: number;
  SodiumContent: number;
  CarbohydrateContent: number;
  FiberContent: number;
  SugarContent: number;
  ProteinContent: number;
  RecipeServings: number;
  RecipeYield: string;
  RecipeInstructions: string[];
}

export interface Review {
  ReviewId: number;
  RecipeId: number;
  AuthorId: number;
  AuthorName: string;
  Rating: number;
  Review: string;
  DateSubmitted?: string;
  DateModified: string;
}

export interface RecipeContextType {
  recipes: Recipe[];
  reviews: Review[];
  isLoading: boolean;
  searchRecipes: (query: string) => Promise<Recipe[]>;
  getRecipeById: (id: number) => Recipe | undefined;
  getReviewsForRecipe: (recipeId: number) => Review[];
  addReview: (reviewData: Omit<Review, 'ReviewId' | 'DateSubmitted' | 'DateModified'>) => Promise<void>;
  addRecipe: (data: { name: string; description: string; instructions: string; category: string; authorId: string; authorName: string; prepTime: number; cookTime: number; servings: number; keywords?: string; imageUrl?: string; recipeYield?: string; ingredientQuantities: string[]; ingredientParts: string[]; }) => Promise<{newId: number}>;
  findSimilarTerms: (query: string) => string[];
  getRandomRecipes: (count: number) => Recipe[];
  getTopRatedRecipes: (count: number) => Recipe[];
  getRecentRecipes: (count: number) => Recipe[];
  getTrendingRecipes: (count: number) => Recipe[];
  getCategoryRecipes: (category: string, count: number) => Recipe[];
}
import { toast } from 'sonner';
import recipesData from '../data/recipes.json';
import reviewsData from '../data/reviews.json';

// Helper function to sanitize and clean text
const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()  // Remove leading and trailing spaces
    .replace(/[^\w\s,.-]/g, ' ')  // Replace non-word chars with space
    .replace(/\s+/g, ' ');  // Replace multiple spaces with a single space
};

// Function to calculate string similarity for fuzzy matching (Levenshtein distance)
const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
};

// Function to check if a string matches another with tolerance for typos
const isFuzzyMatch = (source: string, target: string, tolerance = 0.2): boolean => {
  if (!source || !target) return false;
  
  // Convert to lowercase for case-insensitive comparison
  const sourceLower = source.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // Exact match
  if (sourceLower.includes(targetLower) || targetLower.includes(sourceLower)) return true;
  
  // For short strings, be more strict
  const maxDistance = Math.max(Math.floor(targetLower.length * tolerance), 1);
  
  // Check if it's a partial fuzzy match
  const words = targetLower.split(/\s+/);
  for (const word of words) {
    if (word.length < 3) continue; // Skip very short words
    
    if (sourceLower.split(/\s+/).some(sourceWord => {
      if (sourceWord.length < 3) return false;
      const distance = getLevenshteinDistance(sourceWord, word);
      return distance <= maxDistance;
    })) {
      return true;
    }
  }
  
  return false;
};

// Helper function to parse array representations
const parseArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    if (value.startsWith('[') && value.includes(']')) return JSON.parse(value);
    if (value.includes(';')) return value.split(';').map(item => item.trim());
    if (value.includes(',')) return value.split(',').map(item => item.trim());
    return [value];
  } catch (e) {
    console.error('Error parsing array:', value, e);
    return [String(value)];
  }
};

// Process recipe data to correct format
const processRecipes = (data: unknown[]): Recipe[] => {
  if (!Array.isArray(data)) return [];

  return data
    .filter(recipe => recipe && typeof recipe === 'object' && recipe !== null)
    .map(recipe => {
      const recipeObj = recipe as Record<string, unknown>;
      return {
        ...recipeObj,
        RecipeId: Number(recipeObj.RecipeId) || 0,
        Name: sanitizeText(String(recipeObj.Name || '')),
        Description: recipeObj.Description ? sanitizeText(String(recipeObj.Description)) : '',
        Images: parseArray(recipeObj.Images),
        Keywords: parseArray(recipeObj.Keywords),
        RecipeIngredientQuantities: parseArray(recipeObj.RecipeIngredientQuantities),
        RecipeIngredientParts: parseArray(recipeObj.RecipeIngredientParts),
        RecipeInstructions: parseArray(recipeObj.RecipeInstructions),
        AggregatedRating: Number(recipeObj.AggregatedRating) || 0,
        ReviewCount: Number(recipeObj.ReviewCount) || 0,
      } as Recipe;
    });
};

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      try {
        let initialData = recipesData;
        const storedRecipesStr = localStorage.getItem('savory_recipes');
        if (storedRecipesStr) {
          try {
            const stored = JSON.parse(storedRecipesStr);
            if (Array.isArray(stored) && stored.length > 0) {
              initialData = stored;
            }
          } catch (e) {
            console.error('Invalid stored recipes:', e);
          }
        }
        const processedRecipes = processRecipes(initialData);
        setRecipes(processedRecipes);
        localStorage.setItem('savory_recipes', JSON.stringify(processedRecipes));
        console.log(`Successfully loaded ${processedRecipes.length} recipes from local data`);
  
        if (reviewsData && Array.isArray(reviewsData) && reviewsData.length > 0) {
          setReviews(reviewsData);
          console.log(`Successfully loaded ${reviewsData.length} reviews from local data`);

          // Recalculate aggregated ratings and review counts for each recipe based on loaded reviews
          setRecipes(prevRecipes =>
            prevRecipes.map(recipe => {
              const recipeReviews = reviewsData.filter(r => r.RecipeId === recipe.RecipeId);
              const reviewCount = recipeReviews.length;
              const aggregatedRating = reviewCount > 0
                ? recipeReviews.reduce((sum, r) => sum + r.Rating, 0) / reviewCount
                : recipe.AggregatedRating; // Keep existing if no reviews

              return {
                ...recipe,
                AggregatedRating: aggregatedRating,
                ReviewCount: reviewCount
              };
            })
          );
        } else {
          console.warn('No reviews found or invalid review data format.');
        }
       
      } catch (error) {
        console.error('Error loading local data:', error);
        toast.error('Failed to load local recipe data.');
      } finally {
        setIsLoading(false);
      }
    };
  
    loadData();
  }, []);

  const findSimilarTerms = (query: string, recipes: Recipe[]): string[] => {
    const allTerms = new Set<string>();
    
    // Collect all relevant terms from recipes
    recipes.forEach(recipe => {
      // Add recipe name words
      recipe.Name.split(/\s+/).forEach(word => {
        if (word.length > 3) allTerms.add(word.toLowerCase());
      });
      
      // Add ingredients
      recipe.RecipeIngredientParts.forEach(ingredient => {
        if (typeof ingredient === 'string') {
          ingredient.split(/\s+/).forEach(word => {
            if (word.length > 3) allTerms.add(word.toLowerCase());
          });
        }
      });
      
      // Add keywords
      recipe.Keywords.forEach(keyword => {
        if (typeof keyword === 'string') {
          allTerms.add(keyword.toLowerCase());
        }
      });
    });
    
    // Find similar terms to the query
    const queryLower = query.toLowerCase();
    const similarTerms: string[] = [];
    
    allTerms.forEach(term => {
      const distance = getLevenshteinDistance(term, queryLower);
      // Accept terms with close distance relative to their length
      const similarityThreshold = Math.min(2, Math.floor(term.length * 0.3));
      if (distance <= similarityThreshold) {
        similarTerms.push(term);
      }
    });
    
    // Sort by similarity (closest matches first)
    return similarTerms.sort((a, b) => 
      getLevenshteinDistance(a, queryLower) - getLevenshteinDistance(b, queryLower)
    ).slice(0, 5); // Return top 5 similar terms
  };

  const searchRecipesWithFuzzy = (query: string, recipesToSearch: Recipe[]): Recipe[] => {
    const queryLower = query.toLowerCase().trim();
    
    if (!queryLower) return recipesToSearch.slice(0, 20); // Return first 20 if empty query
    
    // First pass: exact matches (highest priority)
    const exactMatches = recipesToSearch.filter(recipe => {
      const nameMatch = recipe.Name.toLowerCase().includes(queryLower);
      const descriptionMatch = recipe.Description?.toLowerCase().includes(queryLower);
      const keywordMatch = recipe.Keywords.some(k => 
        typeof k === 'string' && k.toLowerCase().includes(queryLower)
      );
      const ingredientMatch = recipe.RecipeIngredientParts.some(i => 
        typeof i === 'string' && i.toLowerCase().includes(queryLower)
      );
      
      return nameMatch || descriptionMatch || keywordMatch || ingredientMatch;
    });
    
    if (exactMatches.length > 0) return exactMatches;
    
    // Second pass: fuzzy matching
    const fuzzyMatches = recipesToSearch.filter(recipe => {
      // Check name with fuzzy matching
      if (isFuzzyMatch(recipe.Name.toLowerCase(), queryLower)) return true;
      
      // Check description with fuzzy matching
      if (recipe.Description && isFuzzyMatch(recipe.Description.toLowerCase(), queryLower)) return true;
      
      // Check ingredients with fuzzy matching
      if (recipe.RecipeIngredientParts.some(ingredient => 
        typeof ingredient === 'string' && isFuzzyMatch(ingredient.toLowerCase(), queryLower)
      )) return true;
      
      // Check keywords with fuzzy matching
      if (recipe.Keywords.some(keyword => 
        typeof keyword === 'string' && isFuzzyMatch(keyword.toLowerCase(), queryLower)
      )) return true;
      
      return false;
    });
    
    return fuzzyMatches;
  };

  const addRecipe = async (data: { name: string; description: string; instructions: string; category: string; authorId: string; authorName: string; prepTime: number; cookTime: number; servings: number; keywords?: string; imageUrl?: string; recipeYield?: string; ingredientQuantities: string[]; ingredientParts: string[]; }) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const maxId = recipes.length > 0 ? Math.max(...recipes.map(r => r.RecipeId)) : 0;
      const newId = maxId + 1;
  
      const instructionSteps = data.instructions.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const keywords = data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(Boolean) : [];
    
      const newRecipe: Recipe = {
        RecipeId: newId,
        Name: data.name,
        AuthorId: data.authorId,
        AuthorName: data.authorName,
        CookTime: `PT${data.cookTime}M`,
        PrepTime: `PT${data.prepTime}M`,
        TotalTime: `PT${data.prepTime + data.cookTime}M`,
        DatePublished: new Date().toISOString(),
        Description: data.description,
        Images: data.imageUrl ? [data.imageUrl] : [],
        RecipeCategory: data.category,
        Keywords: keywords,
        RecipeIngredientQuantities: data.ingredientQuantities,
        RecipeIngredientParts: data.ingredientParts,
        AggregatedRating: 0,
        ReviewCount: 0,
        Calories: 0,
        FatContent: 0,
        SaturatedFatContent: 0,
        CholesterolContent: 0,
        SodiumContent: 0,
        CarbohydrateContent: 0,
        FiberContent: 0,
        SugarContent: 0,
        ProteinContent: 0,
        RecipeServings: data.servings,
        RecipeYield: data.recipeYield || '',
        RecipeInstructions: instructionSteps,
      };
  
      setRecipes(prevRecipes => {
        const updated = [newRecipe, ...prevRecipes];
        localStorage.setItem('savory_recipes', JSON.stringify(updated));
        return updated;
      });

      return { newId };
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const contextValue = useMemo(
    () => ({
      recipes,
      reviews,
      isLoading,
      searchRecipes: async (query: string) => {
        setIsLoading(true);
        try {
          console.log('Using client-side fuzzy search for:', query);
          const fuzzyResults = searchRecipesWithFuzzy(query, recipes);
          
          if (fuzzyResults.length > 0) {
            console.log(`Found ${fuzzyResults.length} fuzzy matches for "${query}"`);
            const similarTerms = findSimilarTerms(query, recipes);
            if (similarTerms.length > 0) {
              console.log('Search term suggestions:', similarTerms);
            }
            return fuzzyResults;
          }
          
          return [];
        } catch (error) {
          console.error('Search error:', error);
          toast.error('Search failed. Please try again.');
          return [];
        } finally {
          setIsLoading(false);
        }
      },
      getRecipeById: (id: number) => recipes.find(recipe => recipe.RecipeId === id),
      getReviewsForRecipe: (recipeId: number) => reviews.filter(review => review.RecipeId === recipeId),
      addReview: async (reviewData: Omit<Review, 'ReviewId' | 'DateSubmitted' | 'DateModified'>) => {
        try {
          const newReview: Review = {
            ...reviewData,
            ReviewId: Date.now(),
            DateSubmitted: new Date().toISOString(),
            DateModified: new Date().toISOString()
          };
          setReviews(prev => [newReview, ...prev]);
  
          // Update recipe rating locally (simple average)
          const currentReviews = reviews.filter(r => r.RecipeId === reviewData.RecipeId);
          const totalRatings = currentReviews.reduce((sum, r) => sum + r.Rating, 0) + reviewData.Rating;
          const newRating = totalRatings / (currentReviews.length + 1);
  
          setRecipes(prev => prev.map(recipe =>
            recipe.RecipeId === reviewData.RecipeId
              ? { ...recipe, AggregatedRating: newRating, ReviewCount: recipe.ReviewCount + 1 }
              : recipe
          ));
        } catch (error) {
          console.error('Error adding review:', error);
          throw error;
        }
      },
      findSimilarTerms: (query: string) => findSimilarTerms(query, recipes),
      getRandomRecipes: (count: number) => {
        // Get random recipes
        const shuffled = [...recipes].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      },
      getTopRatedRecipes: (count: number) => {
        // Get top rated recipes
        return [...recipes]
          .filter(recipe => recipe.AggregatedRating > 0)
          .sort((a, b) => b.AggregatedRating - a.AggregatedRating)
          .slice(0, count);
      },
      getRecentRecipes: (count: number) => {
        // Get the most recent recipes
        return [...recipes].slice(0, count);
      },
      getTrendingRecipes: (count: number) => {
        // Get trending recipes (by review count in this simplified example)
        return [...recipes]
          .sort((a, b) => b.ReviewCount - a.ReviewCount)
          .slice(0, count);
      },
      getCategoryRecipes: (category: string, count: number) => {
        // Get recipes by category
        return recipes
          .filter(recipe =>
            typeof recipe.RecipeCategory === 'string' &&
            recipe.RecipeCategory.toLowerCase().includes(category.toLowerCase()) ||
            recipe.Keywords.some(keyword =>
              typeof keyword === 'string' &&
              keyword.toLowerCase().includes(category.toLowerCase())
            )
          )
          .slice(0, count || recipes.length);
      },
      addRecipe,
    }),
    [recipes, reviews, isLoading]
  );

  return <RecipeContext.Provider value={contextValue}>{children}</RecipeContext.Provider>;
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};
