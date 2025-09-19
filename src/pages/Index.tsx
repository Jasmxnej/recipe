
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import RecipeGrid from '@/components/RecipeGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, ChefHat, Database, LineChart, Star } from 'lucide-react';

interface ClusterData {
  id: number;
  name: string;
  count: number;
  topTerms: string[];

}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('featured');
  
  // Fetch recommended recipes for the logged-in user
  const { data: recommendedRecipes, isLoading: loadingRecommended } = useQuery({
    queryKey: ['recommended-recipes', user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return [];
        const response = await fetch(`/api/search/recommend/${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        return await response.json();
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast({
          title: 'Error',
          description: 'Could not load personalized recommendations',
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!user?.id,
  });
  
  // Fetch recipe clusters for visualization
  const { data: recipeClusters, isLoading: loadingClusters } = useQuery({
    queryKey: ['recipe-clusters'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/search/clusters');
        if (!response.ok) throw new Error('Failed to fetch recipe clusters');
        return await response.json();
      } catch (error) {
        console.error('Error fetching recipe clusters:', error);
        toast({
          title: 'Error',
          description: 'Could not load recipe clusters visualization',
          variant: 'destructive',
        });
        return [];
      }
    },
  });
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Recipe Reviews
          </h1>
          <p className="mt-3 max-w-md mx-auto text-xl text-gray-500 sm:text-2xl">
            Discover, review, and share your favorite recipes
          </p>
        </div>
        
        {/* New: Personalized Recommendations Banner (if user is logged in) */}
        {user && recommendedRecipes && recommendedRecipes.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-primary" />
                Recommended For You
              </h2>
              <Button variant="outline" onClick={() => navigate('/search?type=recommended')}>
                View All
              </Button>
            </div>
            
            {loadingRecommended ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-60 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <RecipeGrid 
                recipes={recommendedRecipes.slice(0, 3)} 
                columns={3}
                featured={[true, true, true]} 
                className="mb-4"
              />
            )}
            
            <p className="text-sm text-muted-foreground mt-2">
              Recommendations based on your preferences and browsing history.
            </p>
          </div>
        )}
        
        {/* Main content tabs */}
        <Tabs defaultValue="featured" value={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="featured">Featured Recipes</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="ir-features">IR Visualization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Browse Recipes</CardTitle>
                  <CardDescription>
                    Explore our collection of delicious recipes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Find recipes by category, search for specific ingredients, or discover new cooking ideas.</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => navigate('/home')} className="w-full">
                    Browse Now
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Search</CardTitle>
                  <CardDescription>
                    Find exactly what you're looking for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Use our advanced search to filter recipes by ingredients, cooking time, or dietary restrictions.</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => navigate('/search')} className="w-full">
                    Search Recipes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Profile</CardTitle>
                  <CardDescription>
                    Manage your account and saved recipes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>View your bookmarked recipes, track your reviews, and update your profile preferences.</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => navigate('/profile')} className="w-full">
                    Go to Profile
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="explore">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Star className="mr-2 h-6 w-6 text-amber-500" />
                Popular Recipes
              </h2>
              
             
            </div>
          </TabsContent>
          
          <TabsContent value="ir-features">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center">
                  <LineChart className="mr-2 h-6 w-6 text-primary" />
                  Recipe Clusters Visualization
                </h2>
                <Button variant="outline" onClick={() => navigate('/search')}>
                  Advanced Search
                </Button>
              </div>
              
              {loadingClusters ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-60 w-full rounded-xl" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    Explore our recipe database organized by ingredient similarity and cooking techniques.
                    These clusters help you discover related recipes within the same culinary domain.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(recipeClusters || []).slice(0, 3).map((cluster: ClusterData) => (
                      <Card key={cluster.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle>{cluster.name}</CardTitle>
                          <CardDescription>{cluster.count} recipes</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium mb-2">Common Ingredients:</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {cluster.topTerms.map((term, i) => (
                              <span key={i} className="bg-secondary px-2 py-1 rounded-full text-xs">
                                {term}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate(`/search?cluster=${cluster.id}`)}
                          >
                            Explore Cluster
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Data management and administration tools are available for site administrators.
          </p>
          <Button 
            onClick={() => navigate('/csv-management')} 
            variant="outline" 
            className="mt-4"
          >
            CSV Management
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
