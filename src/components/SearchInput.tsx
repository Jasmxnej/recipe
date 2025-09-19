
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchInputProps = {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  fullWidth?: boolean;
  placeholder?: string;
  className?: string;
};

const SearchInput = ({
  initialQuery = '',
  onSearch,
  fullWidth = false,
  placeholder = 'Search for recipes, ingredients...',
  className
}: SearchInputProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Update query when initialQuery changes
  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div
      className={cn(
        "relative group search-input-container",
        fullWidth ? "w-full" : "max-w-md",
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-center overflow-hidden rounded-lg border bg-background transition-all",
          isFocused && "ring-2 ring-primary/30 border-primary/50"
        )}
      >
        <div className="flex items-center pl-3 text-muted-foreground">
          <SearchIcon className="h-4 w-4" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm h-10"
        />
        
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={clearSearch}
              className="flex items-center pr-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchInput;
