// Navigation Component: The main menu bar at bottom (mobile) or side (desktop). Shows links like Home, Search. For logged-in users, shows avatar menu with Bookmarks, Logout.
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Search, BookOpen, User, Database, LogOut,
  LogIn, UserPlus, Settings, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type MinimalUser = {
  id?: string; uid?: string; email?: string;
  displayName?: string; name?: string;
  photoURL?: string; avatarUrl?: string; avatar?: string;
};

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const userData = (user as MinimalUser) || null;

  // Check if user is really logged in - must have id, uid, or email
  const loggedIn = Boolean(userData && (userData.id || userData.uid || userData.email));

  const isActive = (path: string) => location.pathname === path;

  // Get avatar URL from different possible fields
  const avatarSrc = loggedIn ? (userData.avatarUrl || userData.photoURL || userData.avatar) : undefined;
  
  // Get initials from name or email for avatar fallback
  const initials = loggedIn
    ? (() => {
        const base = (userData.name || userData.displayName || userData.email || 'U').replace(/@.*/, '');
        const parts = base.trim().split(/\s+/);
        return ((parts[0]?.[0] || 'U') + (parts[1]?.[0] || '')).toUpperCase().slice(0, 2);
      })()
    : '';
    
  // Get first name part for display
  const displayName = loggedIn
    ? (userData.name || userData.displayName || userData.email || 'Account').split(' ')[0]
    : '';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 md:py-0 md:px-0 md:top-0 md:left-0 md:w-16 md:h-screen md:border-r md:border-t-0 z-10">
      <div className="flex justify-around md:flex-col md:justify-start md:h-full md:py-8 md:space-y-8">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center text-sm md:text-xs transition-colors",
            isActive('/') ? "text-primary" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <Home className="h-6 w-6 md:h-5 md:w-5 mb-1" />
          <span className="md:text-[10px]">Home</span>
        </Link>

        <Link
          to="/search"
          className={cn(
            "flex flex-col items-center text-sm md:text-xs transition-colors",
            isActive('/search') ? "text-primary" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <Search className="h-6 w-6 md:h-5 md:w-5 mb-1" />
          <span className="md:text-[10px]">Search</span>
        </Link>

        {loggedIn && (
          <Link
            to="/history"
            className={cn(
              "flex flex-col items-center text-sm md:text-xs transition-colors",
              isActive('/history') ? "text-primary" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <History className="h-6 w-6 md:h-5 md:w-5 mb-1" />
            <span className="md:text-[10px]">History</span>
          </Link>
        )}

        <Link
          to="/csv-management"
          className={cn(
            "flex flex-col items-center text-sm md:text-xs transition-colors",
            isActive('/csv-management') ? "text-primary" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <Database className="h-6 w-6 md:h-5 md:w-5 mb-1" />
          <span className="md:text-[10px]">CSV</span>
        </Link>

        {!loggedIn ? (
          <>
            <Link
              to="/auth?tab=login"
              className={cn(
                "flex flex-col items-center text-sm md:text-xs transition-colors",
                location.pathname.startsWith('/auth') ? "text-primary" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <LogIn className="h-6 w-6 md:h-5 md:w-5 mb-1" />
              <span className="md:text-[10px]">Login</span>
            </Link>
            <Link
              to="/auth?tab=register"
              className={cn(
                "flex flex-col items-center text-sm md:text-xs transition-colors",
                location.pathname.startsWith('/auth') ? "text-primary" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <UserPlus className="h-6 w-6 md:h-5 md:w-5 mb-1" />
              <span className="md:text-[10px]">Sign up</span>
            </Link>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center text-sm md:text-xs transition-colors outline-none",
                  (location.pathname === '/bookmarks' || location.pathname === '/history')
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-900"
                )}
                aria-label="Account menu"
              >
                <Avatar className="h-6 w-6 md:h-5 md:w-5 mb-1">
                  <AvatarImage src={avatarSrc} alt="User avatar" />
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <span className="md:text-[10px]">{displayName}</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem asChild>
                <Link to="/bookmarks" className="flex items-center w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>My Bookmark</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/history" className="flex items-center w-full">
                  <History className="mr-2 h-4 w-4" />
                  <span>History</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => { await logout?.(); }}
                className="flex items-center w-full cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
