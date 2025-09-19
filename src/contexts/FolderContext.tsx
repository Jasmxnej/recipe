// FolderContext: Manages user's personal folders for organizing recipes. Allows creating folders, adding/removing recipes from folders.

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useRecipes, Recipe } from './RecipeContext';

export type Bookmark = {
  id: string;
  recipeId: number;
  userId: string;
  folderId: string;
  rating: number;
  createdAt: string;
};

export type Folder = {
  id: string;
  name: string;
  userId: string;
  color: string;
  icon: string;
  createdAt: string;
};

type FolderContextType = {
  folders: Folder[];
  bookmarks: Bookmark[];
  isLoading: boolean;
  createFolder: (name: string, color?: string, icon?: string) => void;
  updateFolder: (folderId: string, data: Partial<Omit<Folder, 'id' | 'userId' | 'createdAt'>>) => void;
  deleteFolder: (folderId: string) => void;
  addBookmark: (recipeId: number, folderId: string, rating: number) => void;
  removeBookmark: (bookmarkId: string) => void;
  updateBookmark: (bookmarkId: string, data: Partial<Pick<Bookmark, 'folderId' | 'rating'>>) => void;
  getBookmarksByFolder: (folderId: string) => Bookmark[];
  getBookmarkByRecipeId: (recipeId: number) => Bookmark | undefined;
  getUserFolders: () => Folder[];
  getFolderById: (folderId: string) => Folder | undefined;
  getRecommendationsForFolder: (folderId: string) => Promise<Recipe[]>;
  getRecommendationsForUser: () => Promise<Recipe[]>;
};

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const FolderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      try {
        const storedFolders = localStorage.getItem('savory_folders');
        const storedBookmarks = localStorage.getItem('savory_bookmarks');
        
        if (storedFolders) {
          const parsedFolders: Folder[] = JSON.parse(storedFolders);
          setFolders(parsedFolders);
        } else {
          const defaultFolders: Folder[] = [
            {
              id: `folder_${Date.now()}`,
              name: 'Favorites',
              userId: user.id,
              color: '#ff9f7f',
              icon: 'heart',
              createdAt: new Date().toISOString()
            },
            {
              id: `folder_${Date.now() + 1}`,
              name: 'Try Later',
              userId: user.id,
              color: '#7fb1ff',
              icon: 'clock',
              createdAt: new Date().toISOString()
            }
          ];
          setFolders(defaultFolders);
          localStorage.setItem('savory_folders', JSON.stringify(defaultFolders));
        }
        
        if (storedBookmarks) {
          const parsedBookmarks: Bookmark[] = JSON.parse(storedBookmarks);
          setBookmarks(parsedBookmarks);
        } else {
          localStorage.setItem('savory_bookmarks', JSON.stringify([]));
        }
      } catch (error) {
        console.error('Error loading bookmarks/folders', error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('savory_folders', JSON.stringify(folders));
      localStorage.setItem('savory_bookmarks', JSON.stringify(bookmarks));
      
      saveUserFoldersToServer();
    }
  }, [folders, bookmarks, user]);

  const saveUserFoldersToServer = async () => {
    if (!user) return;
    
    try {
      const folderData = folders.map(folder => {
        const folderBookmarks = bookmarks.filter(b => b.folderId === folder.id);
        return {
          id: folder.id,
          name: folder.name,
          userId: user.id,
          color: folder.color,
          icon: folder.icon,
          recipeIds: folderBookmarks.map(b => b.recipeId)
        };
      });
      
  
    } catch (error) {
      console.error('Error saving folders to server:', error);
    }
  };

  const { recipes } = useRecipes();

  const getRecommendationsForFolder = async (folderId: string): Promise<Recipe[]> => {
    if (!user || recipes.length === 0) return [];
    
    try {
      setIsLoading(true);
      // Mock recommendations based on folder bookmarks
      const folderBookmarks = getBookmarksByFolder(folderId);
      const bookmarkedRecipeIds = folderBookmarks.map(b => b.recipeId);
      
      // Find recipes with similar categories or keywords to bookmarked ones
      const recommendedRecipes = recipes.filter(recipe =>
        !bookmarkedRecipeIds.includes(recipe.RecipeId) &&
        folderBookmarks.some(bookmark =>
          recipe.RecipeCategory === recipes.find(r => r.RecipeId === bookmark.recipeId)?.RecipeCategory ||
          recipe.Keywords.some(kw =>
            (recipes.find(r => r.RecipeId === bookmark.recipeId)?.Keywords || []).includes(kw)
          )
        )
      ).slice(0, 5);
      
      return recommendedRecipes;
    } catch (error) {
      console.error('Error fetching folder recommendations:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationsForUser = async (): Promise<Recipe[]> => {
    if (!user || recipes.length === 0) return [];
    
    try {
      setIsLoading(true);
      // Mock user recommendations based on all bookmarks
      const allBookmarkedIds = bookmarks.map(b => b.recipeId);
      
      const recommendedRecipes = recipes.filter(recipe =>
        !allBookmarkedIds.includes(recipe.RecipeId) &&
        bookmarks.some(bookmark =>
          recipe.RecipeCategory === recipes.find(r => r.RecipeId === bookmark.recipeId)?.RecipeCategory
        )
      ).slice(0, 5);
      
      return recommendedRecipes;
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = (name: string, color = '#ff9f7f', icon = 'bookmark') => {
    if (!user) return;
    
    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name,
      userId: user.id,
      color,
      icon,
      createdAt: new Date().toISOString()
    };
    
    setFolders(prev => [...prev, newFolder]);
    toast.success(`Folder "${name}" created successfully`);
  };

  const updateFolder = (
    folderId: string, 
    data: Partial<Omit<Folder, 'id' | 'userId' | 'createdAt'>>
  ) => {
    if (!user) return;
    
    setFolders(prev => prev.map(folder => 
      folder.id === folderId ? { ...folder, ...data } : folder
    ));
    
    toast.success(`Folder updated successfully`);
  };

  const deleteFolder = (folderId: string) => {
    if (!user) return;
    
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    
    setBookmarks(prev => prev.filter(bookmark => bookmark.folderId !== folderId));
    
    toast.success(`Folder deleted successfully`);
  };

  const addBookmark = (recipeId: number, folderId: string, rating: number) => {
    if (!user) return;
    
    const existingBookmark = bookmarks.find(
      b => b.recipeId === recipeId && b.userId === user.id
    );
    
    if (existingBookmark) {
      updateBookmark(existingBookmark.id, { folderId, rating });
      toast.success(`Recipe moved to different folder`);
      return;
    }
    
    const newBookmark: Bookmark = {
      id: `bookmark_${Date.now()}`,
      recipeId,
      userId: user.id,
      folderId,
      rating,
      createdAt: new Date().toISOString()
    };
    
    setBookmarks(prev => [...prev, newBookmark]);
    
    
  };

  const removeBookmark = (bookmarkId: string) => {
    if (!user) return;
    
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
    toast.success(`Bookmark removed successfully`);
  };

  const updateBookmark = (
    bookmarkId: string, 
    data: Partial<Pick<Bookmark, 'folderId' | 'rating'>>
  ) => {
    if (!user) return;
    
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === bookmarkId ? { ...bookmark, ...data } : bookmark
    ));
  };

  const getBookmarksByFolder = (folderId: string): Bookmark[] => {
    if (!user) return [];
    
    return bookmarks.filter(
      bookmark => bookmark.userId === user.id && bookmark.folderId === folderId
    );
  };

  const getBookmarkByRecipeId = (recipeId: number): Bookmark | undefined => {
    if (!user) return undefined;
    
    return bookmarks.find(
      bookmark => bookmark.userId === user.id && bookmark.recipeId === recipeId
    );
  };

  const getUserFolders = (): Folder[] => {
    if (!user) return [];
    
    return folders.filter(folder => folder.userId === user.id);
  };

  const getFolderById = (folderId: string): Folder | undefined => {
    return folders.find(folder => folder.id === folderId);
  };

  return (
    <FolderContext.Provider
      value={{
        folders,
        bookmarks,
        isLoading,
        createFolder,
        updateFolder,
        deleteFolder,
        addBookmark,
        removeBookmark,
        updateBookmark,
        getBookmarksByFolder,
        getBookmarkByRecipeId,
        getUserFolders,
        getFolderById,
        getRecommendationsForFolder,
        getRecommendationsForUser
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};

export const useFolders = () => {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error('useFolders must be used within a FolderProvider');
  }
  return context;
};
