
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecipes } from '../contexts/RecipeContext';
import Layout from '../components/Layout';
import SearchInput from '../components/SearchInput';
import RecipeGrid from '../components/RecipeGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, SlidersHorizontal, Filter, Clock, ChefHat, Utensils, Search } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

// Helper function to format cooking time
const formatCookTime = (time: string): string => {
  if (!time) return 'Any';
  
  // PT1H30M -> 1h 30m
  const hourMatch = time.match(/(\d+)H/);
  const minuteMatch = time.match(/(\d+)M/);
  
  let result = '';
  if (hourMatch) result += `${hourMatch[1]}h `;
  if (minuteMatch) result += `${minuteMatch[1]}m`;
  
  return result.trim() || 'Quick';
};

// Array of common categories
const categories = [
  'Appetizer',
  'Breakfast',
  'Dessert', 
  'Dinner',
  'Lunch',
  'Snack',
  'Soup',
  'Salad',
  'Main Course',
  'Side Dish'
];

// Array of common cooking times
const cookingTimes = [
  { label: 'Quick (< 30 min)', value: 'quick' },
  { label: 'Medium (30-60 min)', value: 'medium' },
  { label: 'Long (> 60 min)', value: 'long' }
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchRecipes, getRandomRecipes, recipes } = useRecipes();
  
  // Get search query from URL or default to empty string
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<number>(0);
  
  // Search results query
  const {
    data: searchResults = [],
    isLoading: isSearching,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['search', query, selectedCategories, selectedTimes, recipes.length],
    queryFn: async () => {
      if (!query && selectedCategories.length === 0 && selectedTimes.length === 0) {
        return getRandomRecipes(recipes.length);
      }
      
      let results = await searchRecipes(query);
      
      // Filter by category if selected
      if (selectedCategories.length > 0) {
        results = results.filter(recipe => {
          // Check in RecipeCategory
          if (recipe.RecipeCategory && 
              selectedCategories.some(cat => 
                recipe.RecipeCategory.toLowerCase().includes(cat.toLowerCase())
              )) {
            return true;
          }
          
          // Check in Keywords
          if (Array.isArray(recipe.Keywords) && 
              selectedCategories.some(cat => 
                recipe.Keywords.some((keyword: string) => 
                  keyword.toLowerCase().includes(cat.toLowerCase())
                )
              )) {
            return true;
          }
          
          return false;
        });
      }
      
      // Filter by cooking time if selected
      if (selectedTimes.length > 0) {
        results = results.filter(recipe => {
          const totalTime = recipe.TotalTime || '';
          
          // Extract minutes from PT format
          const hourMatch = totalTime.match(/(\d+)H/);
          const minuteMatch = totalTime.match(/(\d+)M/);
          
          let totalMinutes = 0;
          if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
          if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
          
          if (selectedTimes.includes('quick') && totalMinutes < 30) {
            return true;
          }
          
          if (selectedTimes.includes('medium') && totalMinutes >= 30 && totalMinutes <= 60) {
            return true;
          }
          
          if (selectedTimes.includes('long') && totalMinutes > 60) {
            return true;
          }
          
          return false;
        });
      }
      
      return results;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Update URL when query changes
  useEffect(() => {
    if (query) {
      searchParams.set('q', query);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  }, [query]);
  
  // Update active filters count
  useEffect(() => {
    setActiveFilters(selectedCategories.length + selectedTimes.length);
  }, [selectedCategories, selectedTimes]);
  
  // Handle search submission
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };
  
  // Toggle category filter
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };
  
  // Toggle time filter
  const toggleTime = (time: string) => {
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else {
        return [...prev, time];
      }
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTimes([]);
  };
  
  // Determine message based on search state
  const getSearchMessage = () => {
    if (isSearching || isFetching) {
      return 'Searching recipes...';
    }
    
    if (query && searchResults.length === 0) {
      return `No results found for "${query}"`;
    }
    
    if (query) {
      return `Search results for "${query}"`;
    }
    
    if (activeFilters > 0) {
      return 'Filtered recipes';
    }
    
    return 'Discover recipes';
  };

  return (
    <Layout >
      <div className="container px-4 mx-auto py-6">
      <h1 className="text-5xl font-display font-semibold text-black mb-6 mt-20">Search Recipes</h1>
        <div className="flex flex-col gap-6">
          {/* Search bar and filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center ">
            <SearchInput
              initialQuery={query}
              onSearch={handleSearch}
              fullWidth
              placeholder="Search by recipe name, ingredient, or cooking process..."
              className="flex-grow"
            />
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 whitespace-nowrap">
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFilters > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {activeFilters}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Recipes</DialogTitle>
                  <DialogDescription>
                    Narrow down your search results with these filters.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                  <Accordion type="single" collapsible defaultValue="categories">
                    <AccordionItem value="categories">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center gap-2">
                          <Utensils className="w-4 h-4" />
                          Categories
                          {selectedCategories.length > 0 && (
                            <Badge className="ml-2">{selectedCategories.length}</Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {categories.map((category) => (
                            <Badge
                              key={category}
                              variant={selectedCategories.includes(category) ? "default" : "outline"}
                              className={cn(
                                "cursor-pointer py-1 px-3",
                                selectedCategories.includes(category)
                                  ? "bg-primary hover:bg-primary/90"
                                  : "hover:bg-secondary"
                              )}
                              onClick={() => toggleCategory(category)}
                            >
                              {category}
                              {selectedCategories.includes(category) && (
                                <Check className="ml-1 h-3 w-3" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="cookingTime">
                      <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Cooking Time
                          {selectedTimes.length > 0 && (
                            <Badge className="ml-2">{selectedTimes.length}</Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {cookingTimes.map((time) => (
                            <Badge
                              key={time.value}
                              variant={selectedTimes.includes(time.value) ? "default" : "outline"}
                              className={cn(
                                "cursor-pointer py-1 px-3",
                                selectedTimes.includes(time.value)
                                  ? "bg-primary hover:bg-primary/90"
                                  : "hover:bg-secondary"
                              )}
                              onClick={() => toggleTime(time.value)}
                            >
                              {time.label}
                              {selectedTimes.includes(time.value) && (
                                <Check className="ml-1 h-3 w-3" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <DialogFooter className="flex flex-row gap-2 sm:space-x-0">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearFilters}
                    disabled={activeFilters === 0}
                  >
                    Clear Filters
                  </Button>
                  <DialogClose asChild>
                    <Button className="flex-1">Apply Filters</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Active filters display */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="py-1 pl-3 pr-2 flex items-center gap-1"
                >
                  <span>{category}</span>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="ml-1 p-1 rounded-full hover:bg-secondary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {selectedTimes.map(time => {
                const timeItem = cookingTimes.find(t => t.value === time);
                return (
                  <Badge
                    key={time}
                    variant="secondary"
                    className="py-1 pl-3 pr-2 flex items-center gap-1"
                  >
                    <span>{timeItem?.label || time}</span>
                    <button
                      onClick={() => toggleTime(time)}
                      className="ml-1 p-1 rounded-full hover:bg-secondary/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
          
          {/* Search message */}
          <div className="py-2">
            <h2 className="text-xl font-semibold">{getSearchMessage()}</h2>
            <p className="text-muted-foreground">
              {!isSearching && !isFetching && searchResults.length > 0 && 
                `Found ${searchResults.length} recipe${searchResults.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          
          {/* Search results */}
          {isSearching || isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-72 rounded-xl"
                />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-16 text-center"
            >
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
              <p className="text-muted-foreground max-w-lg mb-6">
                {query 
                  ? `We couldn't find any recipes matching "${query}". Try using different keywords or removing some filters.`
                  : 'Try adjusting your filters or search for something else.'}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="outline" onClick={clearFilters} disabled={activeFilters === 0}>
                  Clear filters
                </Button>
                <Button onClick={() => setQuery('')} disabled={!query}>
                  Clear search
                </Button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              <RecipeGrid 
                recipes={searchResults} 
                emptyMessage="No recipes match your search criteria."
              />
            </AnimatePresence>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
