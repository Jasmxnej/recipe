
import { ReactNode, useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useFolders } from '../contexts/FolderContext';
import {
  Home, Search, Info, LogOut, Menu, X, ChevronRight, Heart,
  Clock, Calendar, BookOpen, PlusCircle, Twitter, Facebook, Instagram,
  User, Settings, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose 
} from '@/components/ui/sheet';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  hideNavigation?: boolean;
}

const Layout = ({ children, title, hideNavigation = false }: LayoutProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const { getUserFolders } = useFolders();
  const [isMounted, setIsMounted] = useState(false);
  const userFolders = getUserFolders();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: BookOpen, label: 'Bookmarks', path: '/bookmarks' },
    { icon: PlusCircle, label: 'Create', path: '/create-recipe' },
    { icon: Info, label: 'About', path: '/about' },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header
        className="fixed bg-white/95 top-0 left-0 right-0 z-30 transition-all duration-300 border-b py-4 bg-transparent border-transparent"
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-primary">
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="font-display text-xl font-semibold">Savory</span>
          </Link>

          {!hideNavigation && (
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-4 py-2 rounded-md flex items-center space-x-1 transition-colors",
                    location.pathname === item.path
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {!hideNavigation && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="font-display text-xl">Savory</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <nav className="space-y-1">
                      {navItems.map((item) => (
                        <SheetClose asChild key={item.path}>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center px-4 py-3 w-full",
                              location.pathname === item.path
                                ? "bg-secondary text-foreground font-medium"
                                : "text-muted-foreground"
                            )}
                          >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.label}
                            {location.pathname === item.path && (
                              <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>

                    {isAuthenticated && (
                      <>
                        <div className="px-4 pt-6 pb-2">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Bookmark Folders
                          </div>
                        </div>
                        <nav className="space-y-1">
                          {userFolders.map((folder) => {
                            const FolderIcon = folder.icon === 'heart'
                              ? Heart
                              : folder.icon === 'clock'
                                ? Clock
                                : folder.icon === 'calendar'
                                  ? Calendar
                                  : BookOpen;
                            
                            return (
                              <SheetClose asChild key={folder.id}>
                                <Link
                                  to={`/bookmarks?folder=${folder.id}`}
                                  className="flex items-center px-4 py-2 text-muted-foreground"
                                >
                                  <FolderIcon className="mr-3 h-4 w-4" style={{ color: folder.color }} />
                                  {folder.name}
                                </Link>
                              </SheetClose>
                            );
                          })}
                          <SheetClose asChild>
                            <Link
                              to="/bookmarks?new=folder"
                              className="flex items-center px-4 py-2 text-muted-foreground"
                            >
                              <PlusCircle className="mr-3 h-4 w-4" />
                              Add new folder
                            </Link>
                          </SheetClose>
                        </nav>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full border overflow-hidden focus-visible:ring-offset-0 focus-visible:ring-primary"
                  >
                    <Avatar className="h-8 w-8">
                      {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : (
                        <AvatarFallback>
                          {user?.name ? getInitials(user.name) : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        @{user?.username}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Setting</span>
                    </Link>
                  </DropdownMenuItem>
                
                  <DropdownMenuItem asChild>
                    <Link to="/bookmarks" className="flex items-center w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>My Bookmarks</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history" className="flex items-center w-full">
                      <History className="mr-2 h-4 w-4" />
                      <span>History</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth?tab=login"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.startsWith('/auth') ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  Login
                </Link>
                <Link
                  to="/auth?tab=register"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.startsWith('/auth') ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-12 md:pt-16 overflow-y-auto">
        {title && (
          <div className="container px-4 py-4 md:py-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold">{title}</h1>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {!hideNavigation && (
        <div className="md:hidden shrink-0 bg-card border-t">
          <div className="flex justify-around px-2 py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center py-2 px-2 flex-1 transition-colors",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <footer className="border-t bg-card py-8 ">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6 justify-items-center">
            <div className="space-y-2 text-center">
              <Link to="/" className="flex items-center justify-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-display text-xl font-semibold">Savory</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                Discover amazing recipes and share your culinary creations with our community.
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
              <nav className="space-y-2 text-sm">
                <Link to="/" className="text-muted-foreground hover:text-foreground block">Home</Link>
                <Link to="/search" className="text-muted-foreground hover:text-foreground block">Search</Link>
                <Link to="/bookmarks" className="text-muted-foreground hover:text-foreground block">Bookmarks</Link>
              
              </nav>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-4 text-foreground">About</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-4 text-foreground">Connect</h4>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            <p>Supharat Saelee 652115048 &copy;2024</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Layout;
