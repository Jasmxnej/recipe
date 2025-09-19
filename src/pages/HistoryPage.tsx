import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../contexts/RecipeContext';
import { useFolders } from '../contexts/FolderContext';
import Layout from '../components/Layout';
import RecipeGrid from '../components/RecipeGrid';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Eye, Edit, Bookmark, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const HistoryPage = () => {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { bookmarks, getBookmarkByRecipeId } = useFolders();
  const [activeTab, setActiveTab] = useState('viewed');
  const [isLoading, setIsLoading] = useState(true);
  const [viewedRecipeIds, setViewedRecipeIds] = useState<number[]>([]);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    // Load viewed recipes from localStorage
    const viewedKey = `viewed_${user.id}`;
    const viewed = JSON.parse(localStorage.getItem(viewedKey) || '[]');
    setViewedRecipeIds(viewed);

    setIsLoading(false);
  }, [user]);

  if (!user) {
    return (
      <Layout >
        <div className="container py-8">
          <p className="text-center text-muted-foreground">Please log in to view your history.</p>
        </div>
      </Layout>
    );
  }

  // Viewed recipes
  const viewedRecipes = viewedRecipeIds
    .map(id => recipes.find(r => r.RecipeId === id))
    .filter(Boolean);
  const viewedPersonalRatings = {};
  viewedRecipes.forEach(recipe => {
    const bookmark = getBookmarkByRecipeId(recipe.RecipeId);
    if (bookmark) viewedPersonalRatings[recipe.RecipeId] = bookmark.rating;
  });

  // Created recipes
  const createdRecipes = recipes.filter(r => r.AuthorId === user.id);
  const createdPersonalRatings = {};
  createdRecipes.forEach(recipe => {
    const bookmark = getBookmarkByRecipeId(recipe.RecipeId);
    if (bookmark) createdPersonalRatings[recipe.RecipeId] = bookmark.rating;
  });

  // Bookmarked recipes
  const bookmarkedRecipesData = bookmarks
    .filter(b => b.userId === user.id)
    .map(b => recipes.find(r => r.RecipeId === b.recipeId))
    .filter(Boolean);
  const bookmarkedRecipes = [...new Set(bookmarkedRecipesData)]; // unique
  const bookmarkedPersonalRatings = {};
  bookmarkedRecipes.forEach(recipe => {
    const bookmark = bookmarks.find(b => b.recipeId === recipe.RecipeId && b.userId === user.id);
    if (bookmark) bookmarkedPersonalRatings[recipe.RecipeId] = bookmark.rating;
  });

  // Rated recipes - use bookmarked recipes with a rating
  const ratedRecipesData = bookmarkedRecipes.filter(recipe => bookmarkedPersonalRatings[recipe.RecipeId] != null);
  const ratedPersonalRatings = { ...bookmarkedPersonalRatings };

  if (isLoading) {
    return (
      <Layout >
        <div className="container py-8">
          <div className="space-y-8">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout >
      <div className="container px-4 py-8 max-w-6xl mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-6 ">Your History</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="viewed" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Viewed
            </TabsTrigger>
            <TabsTrigger value="created" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Created
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarked
            </TabsTrigger>
            <TabsTrigger value="rated" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="viewed" className="mt-6">
            {viewedRecipes.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No viewed recipes yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring recipes to see your viewing history here.
                </p>
              </div>
            ) : (
              <RecipeGrid
                recipes={viewedRecipes}
                personalRatings={viewedPersonalRatings}
                emptyMessage="No viewed recipes"
              />
            )}
          </TabsContent>

          <TabsContent value="created" className="mt-6">
            {createdRecipes.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center">
                <Edit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No created recipes yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first recipe to see it here.
                </p>
              </div>
            ) : (
              <RecipeGrid
                recipes={createdRecipes}
                personalRatings={createdPersonalRatings}
                emptyMessage="No created recipes"
              />
            )}
          </TabsContent>

          <TabsContent value="bookmarked" className="mt-6">
            {bookmarkedRecipes.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookmarked recipes yet</h3>
                <p className="text-muted-foreground mb-6">
                  Bookmark your favorite recipes to see them here.
                </p>
              </div>
            ) : (
              <RecipeGrid
                recipes={bookmarkedRecipes}
                personalRatings={bookmarkedPersonalRatings}
                emptyMessage="No bookmarked recipes"
              />
            )}
          </TabsContent>

          <TabsContent value="rated" className="mt-6">
            {ratedRecipesData.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No rated recipes yet</h3>
                <p className="text-muted-foreground mb-6">
                  Rate some recipes to see your ratings here.
                </p>
              </div>
            ) : (
              <RecipeGrid
                recipes={ratedRecipesData}
                personalRatings={ratedPersonalRatings}
                emptyMessage="No rated recipes"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HistoryPage;