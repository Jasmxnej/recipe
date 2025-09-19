import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecipes } from '../contexts/RecipeContext';
import { useFolders, Folder } from '../contexts/FolderContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import RecipeGrid from '../components/RecipeGrid';
import { 
  Bookmark, FolderPlus, Edit, Trash, X, Check, BookmarkPlus, 
  Heart, Clock, BookOpen, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Color palette for folder selection
const folderColors = [
  "#ff9f7f",
  "#7fb1ff",
  "#7fdfb5",
  "#d89ffc",
  "#ffce7f",
  "#ff7f7f",
  "#7fdede",
  "#b59fff",
];

// Icon options for folders
const folderIcons = [
  { value: "heart", label: "Heart", component: Heart },
  { value: "clock", label: "Clock", component: Clock },
  { value: "bookmark", label: "Bookmark", component: Bookmark },
  { value: "book", label: "BookOpen", component: BookOpen },
];

const BookmarksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { getRecipeById } = useRecipes();
  const { 
    getUserFolders, 
    getBookmarksByFolder, 
    getFolderById,
    createFolder,
    updateFolder,
    deleteFolder,
    removeBookmark
  } = useFolders();
  
  // Get folder ID from URL or use the first folder
  const initialFolderId = searchParams.get('folder') || '';
  const shouldCreateNewFolder = searchParams.get('new') === 'folder';
  
  const [selectedFolderId, setSelectedFolderId] = useState(initialFolderId);
  const [createFolderOpen, setCreateFolderOpen] = useState(shouldCreateNewFolder);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(folderColors[0]);
  const [newFolderIcon, setNewFolderIcon] = useState(folderIcons[0].value);
  const [loading, setLoading] = useState(true);
  
  const userFolders = getUserFolders();
  const selectedFolder = getFolderById(selectedFolderId);
  const bookmarksInFolder = selectedFolderId 
    ? getBookmarksByFolder(selectedFolderId)
    : [];
  
  // Get the recipes that correspond to the bookmarks
  const bookmarkedRecipes = bookmarksInFolder.map(bookmark => {
    const recipe = getRecipeById(bookmark.recipeId);
    return recipe;
  }).filter(recipe => recipe !== undefined); // Remove undefined recipes

  const personalRatings = bookmarksInFolder.reduce((acc, bookmark) => {
    acc[bookmark.recipeId] = bookmark.rating;
    return acc;
  }, {} as Record<number, number>);
  
  // Set selected folder from URL param or default to first folder
  useEffect(() => {
    if (userFolders.length > 0) {
      if (!selectedFolderId || !userFolders.some(f => f.id === selectedFolderId)) {
        setSelectedFolderId(userFolders[0].id);
      }
    }
    setLoading(false);
  }, [userFolders, selectedFolderId]);
  
  // Update URL when folder changes
  useEffect(() => {
    if (selectedFolderId) {
      searchParams.set('folder', selectedFolderId);
      setSearchParams(searchParams);
    }
  }, [selectedFolderId]);
  
  // Handle folder selection
  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
  };
  
  // Handle create folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }
    
    createFolder(newFolderName, newFolderColor, newFolderIcon);
    setNewFolderName('');
    setNewFolderColor(folderColors[0]);
    setNewFolderIcon(folderIcons[0].value);
    setCreateFolderOpen(false);
    
    // Select the new folder after a short delay
    setTimeout(() => {
      const newFolder = getUserFolders().find(f => f.name === newFolderName);
      if (newFolder) {
        setSelectedFolderId(newFolder.id);
      }
    }, 100);
  };
  
  // Open edit folder dialog
  const openEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderColor(folder.color);
    setNewFolderIcon(folder.icon);
    setEditFolderOpen(true);
  };
  
  // Handle update folder
  const handleUpdateFolder = () => {
    if (!editingFolder || !newFolderName.trim()) return;
    
    updateFolder(editingFolder.id, {
      name: newFolderName,
      color: newFolderColor,
      icon: newFolderIcon
    });
    
    setEditFolderOpen(false);
    setEditingFolder(null);
  };
  
  // Handle delete folder
  const handleDeleteFolder = () => {
    if (!editingFolder) return;
    
    deleteFolder(editingFolder.id);
    
    setEditFolderOpen(false);
    setEditingFolder(null);
    
    // If the deleted folder was selected, select another one
    if (selectedFolderId === editingFolder.id && userFolders.length > 1) {
      const remainingFolders = userFolders.filter(f => f.id !== editingFolder.id);
      if (remainingFolders.length > 0) {
        setSelectedFolderId(remainingFolders[0].id);
      }
    }
  };
  
  // Handle remove bookmark
  const handleRemoveBookmark = (bookmarkId: string) => {
    removeBookmark(bookmarkId);
  };
  
  // Get icon component for folder
  const getFolderIcon = (iconName: string) => {
    const icon = folderIcons.find(i => i.value === iconName);
    return icon ? icon.component : Bookmark;
  };

  return (
    <Layout >
      <div className="container px-4 mx-auto py-6">
      <h1 className="text-5xl font-display font-semibold text-black mb-10 mt-20">My Recipe Bookmarks</h1>
        {loading ? (
          <div className="space-y-8">
            <div className="flex gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-48 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          </div>
        ) : userFolders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Bookmark className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No bookmark folders yet</h3>
            <p className="text-muted-foreground max-w-lg mb-6">
              Start by creating your first folder to organize your favorite recipes.
            </p>
            <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create your first folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new folder</DialogTitle>
                  <DialogDescription>
                    Create a new folder to organize your bookmarked recipes.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Folder Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Favorite Desserts"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Folder Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {folderColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-8 h-8 rounded-full transition-all",
                            newFolderColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewFolderColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Folder Icon</Label>
                    <div className="flex flex-wrap gap-2">
                      {folderIcons.map((icon) => {
                        const IconComponent = icon.component;
                        return (
                          <button
                            key={icon.value}
                            type="button"
                            className={cn(
                              "w-10 h-10 rounded-lg border flex items-center justify-center transition-all",
                              newFolderIcon === icon.value 
                                ? "bg-primary/10 border-primary text-primary" 
                                : "hover:bg-muted"
                            )}
                            onClick={() => setNewFolderIcon(icon.value)}
                          >
                            <IconComponent className="h-5 w-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateFolder}>Create Folder</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <>
            {/* Folder list */}
            <div className="flex overflow-x-auto pb-4 mb-6 space-x-4 scrollbar-thin">
              {userFolders.map((folder) => {
                const FolderIcon = getFolderIcon(folder.icon);
                return (
                  <motion.div
                    key={folder.id}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "min-w-[180px] border rounded-xl cursor-pointer p-4 transition-all",
                      selectedFolderId === folder.id 
                        ? "bg-primary/5 border-primary/20" 
                        : "hover:bg-secondary/50"
                    )}
                    onClick={() => handleSelectFolder(folder.id)}
                  >
                    <div className="mb-3 flex justify-between items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${folder.color}30` }}
                      >
                        <FolderIcon 
                          className="w-5 h-5" 
                          style={{ color: folder.color }} 
                        />
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditFolder(folder)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit folder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              openEditFolder(folder);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete folder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <h3 className="font-medium line-clamp-1">{folder.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getBookmarksByFolder(folder.id).length} recipes
                    </p>
                  </motion.div>
                );
              })}
              
              {/* Add folder button */}
              <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
                <DialogTrigger asChild>
                  <motion.div
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="min-w-[180px] border border-dashed rounded-xl cursor-pointer flex flex-col items-center justify-center p-4 hover:bg-secondary/50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                      <FolderPlus className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">Add new folder</h3>
                  </motion.div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create new folder</DialogTitle>
                    <DialogDescription>
                      Create a new folder to organize your bookmarked recipes.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Folder Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Favorite Desserts"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Folder Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {folderColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={cn(
                              "w-8 h-8 rounded-full transition-all",
                              newFolderColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewFolderColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Folder Icon</Label>
                      <div className="flex flex-wrap gap-2">
                        {folderIcons.map((icon) => {
                          const IconComponent = icon.component;
                          return (
                            <button
                              key={icon.value}
                              type="button"
                              className={cn(
                                "w-10 h-10 rounded-lg border flex items-center justify-center transition-all",
                                newFolderIcon === icon.value 
                                  ? "bg-primary/10 border-primary text-primary" 
                                  : "hover:bg-muted"
                              )}
                              onClick={() => setNewFolderIcon(icon.value)}
                            >
                              <IconComponent className="h-5 w-5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleCreateFolder}>Create Folder</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Edit folder dialog */}
            <Dialog open={editFolderOpen} onOpenChange={setEditFolderOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit folder</DialogTitle>
                  <DialogDescription>
                    Update the name, color or icon of your folder.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Folder Name</Label>
                    <Input
                      id="edit-name"
                      placeholder="e.g., Favorite Desserts"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Folder Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {folderColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-8 h-8 rounded-full transition-all",
                            newFolderColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewFolderColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Folder Icon</Label>
                    <div className="flex flex-wrap gap-2">
                      {folderIcons.map((icon) => {
                        const IconComponent = icon.component;
                        return (
                          <button
                            key={icon.value}
                            type="button"
                            className={cn(
                              "w-10 h-10 rounded-lg border flex items-center justify-center transition-all",
                              newFolderIcon === icon.value 
                                ? "bg-primary/10 border-primary text-primary" 
                                : "hover:bg-muted"
                            )}
                            onClick={() => setNewFolderIcon(icon.value)}
                          >
                            <IconComponent className="h-5 w-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Folder
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete folder</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this folder? This action cannot be undone, 
                          and all bookmarks within this folder will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteFolder}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <DialogClose asChild>
                      <Button variant="outline" className="flex-1">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpdateFolder} className="flex-1">
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Selected folder contents */}
            {selectedFolder && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${selectedFolder.color}30` }}
                    >
                      {(() => {
                        const FolderIcon = getFolderIcon(selectedFolder.icon);
                        return <FolderIcon className="w-5 h-5" style={{ color: selectedFolder.color }} />;
                      })()}
                    </div>
                    <h2 className="text-xl font-semibold">{selectedFolder.name}</h2>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditFolder(selectedFolder)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Folder
                  </Button>
                </div>
                
                {bookmarkedRecipes.length === 0 ? (
                  <div className="bg-card border rounded-xl p-8 text-center">
                    <BookmarkPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No recipes bookmarked yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start exploring recipes and save your favorites to this folder.
                    </p>
                    <Button asChild>
                      <Link to="/search">Browse Recipes</Link>
                    </Button>
                  </div>
                ) : (
                  <RecipeGrid
                    recipes={bookmarkedRecipes}
                    personalRatings={personalRatings}
                    emptyMessage="No recipes in this folder"
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default BookmarksPage;
