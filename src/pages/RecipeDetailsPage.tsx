// RecipeDetailsPage: Shows full details of one recipe, including images, ingredients, instructions, nutrition, reviews form, and related recipes.

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecipes, Recipe } from '../contexts/RecipeContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import RecipeGallery from '../components/RecipeGallery';
import RecipeGrid from '../components/RecipeGrid';
import BookmarkButton from '../components/BookmarkButton';
import { 
  Clock, ChefHat, Utensils, Info, User, Calendar, 
  Star, MessageSquare, Heart, Share, ArrowLeft, Plus, Minus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const RecipeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRecipeById, getReviewsForRecipe, addReview, getRandomRecipes, getTopRatedRecipes } = useRecipes();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(4);
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([]);
  
  // Fetch recipe by ID when page loads, set state, get related recipes by category then top rated
  useEffect(() => {
    if (!id) return;
    
    const recipeId = parseInt(id);
    const fetchedRecipe = getRecipeById(recipeId);
    
    if (fetchedRecipe) {
      setRecipe(fetchedRecipe);
      
      // Set initial servings based on recipe
      if (fetchedRecipe.RecipeServings) {
        setServings(parseInt(fetchedRecipe.RecipeServings.toString()) || 4);
      }
      
      // Get related recipes
      const category = fetchedRecipe.RecipeCategory;
      let similar: Recipe[] = [];
      
      if (category) {
        // Get recipes in same category, exclude current one
        similar = getRandomRecipes(30)
          .filter(r => r.RecipeId !== recipeId && r.RecipeCategory === category)
          .slice(0, 6);
      }
      
      if (similar.length < 6) {
        // Not enough in same category, backfill with top rated
        const backfill = getTopRatedRecipes(20)
          .filter(r => r.RecipeId !== recipeId && !similar.some(s => s.RecipeId === r.RecipeId))
          .slice(0, 6 - similar.length);
        
        similar = [...similar, ...backfill];
      }
      
      setRelatedRecipes(similar);
    } else {
      toast.error('Recipe not found');
      setTimeout(() => navigate('/search'), 2000);
    }
    
    setLoading(false);
  }, [id]);
  // Track viewed recipe in localStorage for user history (limit to 50)
  useEffect(() => {
    if (!user || !recipe) return;
    
    const viewedKey = `viewed_${user.id}`;
    const viewed = JSON.parse(localStorage.getItem(viewedKey) || '[]');
    const recipeId = recipe.RecipeId;
    
    if (!viewed.includes(recipeId)) {
      const updatedViewed = [recipeId, ...viewed.filter(id => id !== recipeId)].slice(0, 50);
      localStorage.setItem(viewedKey, JSON.stringify(updatedViewed));
    }
  }, [user, recipe]);
  
  // Format cooking time to a readable format like "1 hr 30 mins"
  const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';
    
    const hourMatch = timeString.match(/(\d+)H/);
    const minuteMatch = timeString.match(/(\d+)M/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    
    if (hours === 0 && minutes === 0) return 'Quick';
    
    let result = '';
    if (hours > 0) {
      result += `${hours} hr${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
      result += `${minutes} min${minutes > 1 ? 's' : ''}`;
    }
    
    return result.trim();
  };
  
  // Adjust ingredient quantities based on servings (e.g., double for 8 servings)
  const adjustQuantity = (originalQuantity: string, originalServings: number = 4): string => {
    if (!originalQuantity) return '';
    
    const parsedOriginal = parseFloat(originalQuantity);
    if (isNaN(parsedOriginal)) return originalQuantity;
    
    const ratio = servings / originalServings;
    const adjustedValue = parsedOriginal * ratio;
    
    // Format to avoid excessive decimal places
    return adjustedValue % 1 === 0
      ? adjustedValue.toString()
      : adjustedValue.toFixed(1).replace(/\.0$/, '');
  };
  
  // Handle review submission - add to context, show toast, reset form
  const handleSubmitReview = () => {
    if (!recipe) return;

    const authorId = user ? parseInt(user.id.split('_')[1] || '0') : 0;
    const authorName = user ? user.name : 'Anonymous';

    if (!userReview.trim()) {
      toast.error('Please provide a review.');
      return;
    }

    setSubmittingReview(true);
    
    try {
      addReview({
        RecipeId: recipe.RecipeId,
        AuthorId: authorId,
        AuthorName: authorName,
        Rating: userRating,
        Review: userReview
      });
      
      // Reset form
      setUserReview('');
      toast.success(`Your review has been added${!user ? ' as Anonymous!' : ''}!`);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  // Get reviews for this recipe
  const reviews = recipe ? getReviewsForRecipe(recipe.RecipeId) : [];
  
  if (loading) {
    return (
      <Layout>
        <div className="container px-4 mx-auto py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <Skeleton className="h-96 rounded-xl" />
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-32 w-full mt-8" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!recipe) {
    return (
      <Layout>
        <div className="container px-4 mx-auto py-16 text-center">
          <h1 className="text-2xl font-medium mb-4">Recipe not found</h1>
          <p className="text-muted-foreground mb-8">The recipe you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/search">Browse Recipes</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  const images = Array.isArray(recipe.Images) ? recipe.Images : [];
  const ingredients = Array.isArray(recipe.RecipeIngredientParts) ? recipe.RecipeIngredientParts : [];
  const quantities = Array.isArray(recipe.RecipeIngredientQuantities) ? recipe.RecipeIngredientQuantities : [];
  const instructions = Array.isArray(recipe.RecipeInstructions) ? recipe.RecipeInstructions : [];
  
  return (
    <Layout>
      <div className="container px-4 mx-auto py-6 mt-20">
        {/* Back button and bookmark */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <BookmarkButton recipe={recipe} size="lg" />
        </div>
        
        {/* Recipe header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recipe gallery */}
          <div>
            <RecipeGallery images={images} alt={recipe.Name} />
          </div>
          
          {/* Recipe info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl md:text-4xl font-display font-semibold mb-3">
                {recipe.Name}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.RecipeCategory && (
                  <Badge variant="secondary">{recipe.RecipeCategory}</Badge>
                )}
                {Array.isArray(recipe.Keywords) && recipe.Keywords.slice(0, 3).map((keyword, index) => (
                  <Badge key={index} variant="outline">{keyword}</Badge>
                ))}
              </div>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center text-amber-500">
                  <Star className="w-5 h-5 fill-amber-500 mr-1" />
                  <span className="font-medium">{recipe.AggregatedRating.toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">
                    ({recipe.ReviewCount} {recipe.ReviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">{recipe.Description}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-secondary/50 rounded-lg p-3 flex items-start">
                  <Clock className="w-5 h-5 text-muted-foreground mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Cooking Time</div>
                    <div className="font-medium">{formatTime(recipe.TotalTime)}</div>
                  </div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-3 flex items-start">
                  <Utensils className="w-5 h-5 text-muted-foreground mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Prep Time</div>
                    <div className="font-medium">{formatTime(recipe.PrepTime)}</div>
                  </div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-3 flex items-start">
                  <Calendar className="w-5 h-5 text-muted-foreground mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Published</div>
                    <div className="font-medium">
                      {new Date(recipe.DatePublished).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">Servings</div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      disabled={servings <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{servings}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setServings(servings + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{recipe.AuthorName?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <span className="text-muted-foreground">Recipe by </span>
                  <span className="font-medium">{recipe.AuthorName || 'Anonymous Chef'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Recipe detailed information */}
        <Tabs defaultValue="ingredients" className="mt-8">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="ingredients" className="text-sm sm:text-base">
              <Utensils className="mr-2 h-4 w-4 hidden sm:inline" />
              Ingredients
            </TabsTrigger>
            <TabsTrigger value="instructions" className="text-sm sm:text-base">
              <ChefHat className="mr-2 h-4 w-4 hidden sm:inline" />
              Instructions
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="text-sm sm:text-base">
              <Info className="mr-2 h-4 w-4 hidden sm:inline" />
              Nutrition & Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ingredients" className="mt-0">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Ingredients</h2>
              <Separator className="mb-5" />
              
              {ingredients.length === 0 ? (
                <p className="text-muted-foreground italic">No ingredients listed for this recipe.</p>
              ) : (
                <ul className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-6 w-6 rounded-full border flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-xs">{index + 1}</span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {quantities[index] ? adjustQuantity(quantities[index]) : ''} 
                        </span>{' '}
                        {ingredient}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="instructions" className="mt-0">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Cooking Instructions</h2>
              <Separator className="mb-5" />
              
              {instructions.length === 0 ? (
                <p className="text-muted-foreground italic">No instructions provided for this recipe.</p>
              ) : (
                <ol className="space-y-6">
                  {instructions.map((instruction, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative pl-12"
                    >
                      <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <p>{instruction}</p>
                    </motion.li>
                  ))}
                </ol>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nutrition info */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-display font-semibold mb-4">Nutrition Information</h2>
                <Separator className="mb-5" />
                
                <div className="grid grid-cols-2 gap-4">
                  {['Calories', 'FatContent', 'CarbohydrateContent', 'ProteinContent', 
                  'FiberContent', 'SugarContent', 'SodiumContent'].map(nutrient => {
                    const value = recipe[nutrient];
                    const label = nutrient.replace('Content', '');
                    
                    return (
                      <div key={nutrient} className="bg-secondary/50 rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">{label}</div>
                        <div className="font-medium">
                          {value ? `${value}${nutrient === 'Calories' ? ' kcal' : 'g'}` : 'N/A'}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <p className="text-xs text-muted-foreground mt-6">
                  Nutrition information is estimated and may vary based on preparation method, 
                  serving size, ingredient variants, and other factors.
                </p>
              </div>
              
              {/* Reviews */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-display font-semibold mb-4">Reviews</h2>
                <Separator className="mb-5" />
                
                {reviews.length === 0 ? (
                  <div className="text-center py-6">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium">No reviews yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to review this recipe!</p>
                  </div>
                ) : (
                  <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
                    {reviews.map((review) => (
                      <div key={review.ReviewId} className="border-b pb-4 last:border-none">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>{review.AuthorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.AuthorName}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(review.DateSubmitted).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < review.Rating ? "fill-amber-500" : "text-muted"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm">{review.Review}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add review form */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium mb-3">Add Your Review</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm mb-1">Your Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="text-amber-500 focus:outline-none"
                        >
                          <Star
                            className={cn(
                              "h-6 w-6",
                              star <= userRating ? "fill-amber-500" : "text-muted"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm mb-1">Your Review</label>
                    <textarea
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Share your experience with this recipe..."
                    ></textarea>
                  </div>
                  
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={!userReview.trim() || submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Related recipes */}
        {relatedRecipes.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-display font-semibold mb-6">Related Recipes</h2>
            <RecipeGrid recipes={relatedRecipes} columns={3} />
          </section>
        )}
      </div>
    </Layout>
  );
};

export default RecipeDetailsPage;
