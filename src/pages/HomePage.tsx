// HomePage: The main landing page. Shows hero with search, create recipe promo, trending recipes, sweet treats section, and call to action.
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRecipes } from '../contexts/RecipeContext';
import { useAuth } from '../contexts/AuthContext';
import { useFolders } from '../contexts/FolderContext';
import Layout from '../components/Layout';
import RecipeGrid from '../components/RecipeGrid';
import SearchInput from '../components/SearchInput';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Search, Bookmark, ChefHat, Heart, Clock, Star, PlusCircle, Users } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();
  const {
    getTopRatedRecipes,
    getTrendingRecipes,
    getCategoryRecipes,
    isLoading: globalLoading
  } = useRecipes();
  const { bookmarks, getUserFolders } = useFolders();
  
  const [heroLoaded, setHeroLoaded] = useState(false);
  
  const userBookmarks = bookmarks.filter(bookmark => bookmark.userId === user?.id);
  const userFolders = getUserFolders();
  
  
  const trendingRecipes = useMemo(() => getTrendingRecipes(6), [getTrendingRecipes]);
  const quickRecipes = useMemo(() => getCategoryRecipes('dessert', 6), [getCategoryRecipes]);
  const personalizedRecipes = useMemo(() => {
    if (!user) return [];
    return getTopRatedRecipes(6);
  }, [getTopRatedRecipes, user]);

  return (
    <Layout>
      {/* Hero section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background pt-8 pb-16 ">
        <div className="container px-4 mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col space-y-4"
            >
              <div className="badge bg-primary/10 text-primary px-3 py-1 rounded-full text-sm w-fit">
                Welcome to Savory
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold leading-tight">
                Discover & Save Your Favorite <span className="text-primary">Recipes</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg">
                Search thousands of recipes, save your favorites, and get personalized recommendations based on your taste.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <SearchInput 
                  fullWidth={false} 
                  placeholder="Search for recipes, ingredients..."
                  className="w-full sm:max-w-sm"
                />
                <Button asChild size="lg" className="gap-2">
                  <Link to="/search">
                    <Search className="w-4 h-4" />
                    Explore All Recipes
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center space-x-4 pt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <ChefHat className="w-4 h-4 mr-1" />
                  <span>10,000+ Recipes</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-amber-500 text-amber-500" />
                  <span>Top-rated Dishes</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                {!heroLoaded && (
                  <div className="absolute inset-0 bg-muted animate-pulse rounded-2xl"></div>
                )}
                <img
                  src="https://images.unsplash.com/photo-1554998171-89445e31c52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Delicious Food"
                  className="w-full rounded-2xl"
                  onLoad={() => setHeroLoaded(true)}
                  style={{ display: heroLoaded ? 'block' : 'none' }}
                />
                
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary rounded-full flex items-center justify-center transform rotate-12 shadow-lg">
                  <span className="text-white font-display text-xl font-semibold transform -rotate-12">Yum!</span>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -left-10 top-1/4 bg-white p-3 rounded-xl shadow-lg flex items-center space-x-2"
              >
                <div className="bg-amber-500/10 text-amber-600 p-2 rounded-lg">
                  <Star className="w-5 h-5 fill-amber-500" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Rated</div>
                  <div className="text-muted-foreground text-xs">From community</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -right-6 top-16 bg-white p-3 rounded-xl shadow-lg flex items-center space-x-2"
              >
                <div className="bg-blue-500/10 text-blue-600 p-2 rounded-lg">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Easy Save</div>
                  <div className="text-muted-foreground text-xs">Bookmark favorites</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-8 left-16 bg-white p-3 rounded-xl shadow-lg flex items-center space-x-2 z-10"
              >
                <div className="bg-red-500/10 text-red-600 p-2 rounded-lg">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Personalized</div>
                  <div className="text-muted-foreground text-xs">Just for you</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      
      </section>
      
    
      {/* Create Recipe section */}
      <section className="py-12 bg-white/75">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">Create Your Recipe</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/create-recipe" className="flex items-center">
                Start Creating <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side: Illustration or promo image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-primary/5 to-secondary/30 p-8">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Create your recipe"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Your Creation
                </div>
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2">
                  <PlusCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="mt-6 space-y-4 text-center">
                <p className="text-muted-foreground">
                  Share your culinary masterpiece with the community. From simple family recipes to gourmet creations, every dish has a story.
                </p>
                <div className="flex justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Easy to use editor</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-primary" />
                    <span>Community inspired</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Right side: Call to action */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-primary">Why Create with Savory?</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start space-x-3">
                    <PlusCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Step-by-step recipe builder with ingredient management</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Get feedback and ratings from the community</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Connect with other home cooks and chefs</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Save your creations to personal folders</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <Button asChild size="lg" className="w-full max-w-sm mx-auto">
                  <Link to="/create-recipe">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Create Your First Recipe
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  No account? <Link to="/auth" className="text-primary hover:underline">Sign up free</Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Trending recipes section */}
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">Trending Now</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/search" className="flex items-center">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {globalLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <RecipeGrid recipes={trendingRecipes} />
          )}
        </div>
      </section>
      
      {/* Quick meals section */}
      <section className="py-12 bg-white/75">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-semibold">Sweet Treats</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/search" className="flex items-center">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {globalLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <RecipeGrid recipes={quickRecipes} />
          )}
        </div>
      </section>
      
      {/* Call to action section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">
              Hungry for More?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Create your personal collection of recipes, organize them into folders, and discover new dishes tailored to your taste.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Find Recipes
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/bookmarks">
                  <Bookmark className="mr-2 h-5 w-5" />
                  Manage Bookmarks
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
