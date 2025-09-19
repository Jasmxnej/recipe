
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message }: LoadingScreenProps) => {
  const [loadingTime, setLoadingTime] = useState(0);
  const [showTips, setShowTips] = useState(false);
  
  // Track loading time
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const newTime = Math.floor((Date.now() - startTime) / 1000);
      setLoadingTime(newTime);
      
      // Show tips after 3 seconds
      if (newTime >= 3 && !showTips) {
        setShowTips(true);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get loading message based on time
  const getLoadingMessage = () => {
    if (message) return message;
    
    if (loadingTime < 3) {
      return "Loading recipes...";
    } else if (loadingTime < 6) {
      return "Almost there! Getting your recipes...";
    } else {
      return "Taking longer than expected. Trying local data...";
    }
  };

  // Action handlers
  const handleRefresh = () => {
    toast.info("Refreshing page...");
    window.location.reload();
  };

  const handleUseLocalData = () => {
    toast.info("Switching to local data...");
    localStorage.setItem('useLocalDataOnly', 'true');
    window.location.reload();
  };

  const handleClearCache = () => {
    toast.info("Clearing cache and refreshing...");
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        {/* Loading spinner */}
        <div className="relative h-24 w-24 mb-6">
          <motion.div 
            className="absolute inset-0 bg-primary/20 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute inset-0 border-4 border-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <path 
                d="M16 2V6" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <path 
                d="M8 2V6" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <path 
                d="M3 10H21" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <path 
                d="M9 16L11 14L13 16L15 14" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
        
        {/* App title */}
        <motion.h1 
          className="font-display text-2xl font-semibold text-foreground mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Savory
        </motion.h1>
        
        {/* Loading message */}
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {getLoadingMessage()}
        </motion.p>
        
        {/* Buttons (show after delay) */}
        {loadingTime > 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 space-y-2"
          >
            <Button 
              onClick={handleUseLocalData}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Use Local Data
            </Button>
            
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="w-full px-4 py-2 rounded-md text-sm"
            >
              Refresh Page
            </Button>
            
            {loadingTime > 8 && (
              <Button 
                onClick={handleClearCache}
                variant="destructive"
                className="w-full px-4 py-2 rounded-md text-sm"
              >
                Clear Cache & Refresh
              </Button>
            )}
          </motion.div>
        )}
        
        {/* Tips section */}
        {showTips && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-md text-center p-4 bg-muted/50 rounded-lg"
          >
            <h3 className="text-sm font-medium mb-2">Loading Options:</h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Try using "Use Local Data" to bypass server data loading</li>
              <li>Initial data loading can take up to a minute</li>
              <li>Subsequent loads will be faster</li>
              <li>Check your console for server log messages</li>
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
