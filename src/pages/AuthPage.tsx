import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User, LogIn, ChefHat, Lock, AtSign, Mail, UserPlus, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AuthPage = () => {
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Set auth mode based on URL param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setAuthMode('register');
    } else {
      setAuthMode('login');
    }
  }, [searchParams]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form based on current mode
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (authMode === 'login') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (authMode === 'login') {
        const success = await login(formData.email, formData.password);
        if (success) {
          navigate('/');
        }
      } else {
        const success = await register(
          formData.username,
          formData.email,
          formData.password,
          formData.username
        );
        if (success) {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Switch between login and register modes
  const toggleAuthMode = () => {
    setAuthMode(prev => (prev === 'login' ? 'register' : 'login'));
    setErrors({});
  };
  
  // Demo login handler
  const handleDemoLogin = async () => {
    setSubmitting(true);
    try {
      const success = await login('demo@example.com', 'password123');
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Demo login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-30 py-3 px-4 md:py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-primary">
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="font-display text-lg md:text-xl font-semibold">Savory</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 pt-12 md:pt-16 overflow-y-auto">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Left side - Form */}
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-lg bg-card/80 backdrop-blur-sm w-full">
                  <CardContent className="pt-6">
                    <div className="mb-6 text-center">
                      <h1 className="text-xl md:text-2xl font-display font-semibold mb-2">
                        {authMode === 'login' ? 'Welcome Back!' : 'Create an Account'}
                      </h1>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {authMode === 'login'
                          ? 'Sign in to access your recipes and bookmarks'
                          : 'Join Savory to discover and save amazing recipes'}
                      </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <AnimatePresence mode="wait">
                        {authMode === 'register' && (
                          <motion.div
                            key="username"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="space-y-2">
                              <Label htmlFor="username">Username</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="username"
                                  name="username"
                                  placeholder="johndoe"
                                  className={cn(
                                    "pl-10",
                                    errors.username && "border-destructive focus-visible:ring-destructive/30"
                                  )}
                                  value={formData.username}
                                  onChange={handleChange}
                                  disabled={submitting}
                                />
                              </div>
                              {errors.username && (
                                <p className="text-destructive text-xs mt-1">{errors.username}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            className={cn(
                              "pl-10",
                              errors.email && "border-destructive focus-visible:ring-destructive/30"
                            )}
                            value={formData.email}
                            onChange={handleChange}
                            disabled={submitting}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-destructive text-xs mt-1">{errors.email}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder={authMode === 'login' ? 'Your password' : 'Create a password'}
                            className={cn(
                              "pl-10",
                              errors.password && "border-destructive focus-visible:ring-destructive/30"
                            )}
                            value={formData.password}
                            onChange={handleChange}
                            disabled={submitting}
                          />
                        </div>
                        {errors.password && (
                          <p className="text-destructive text-xs mt-1">{errors.password}</p>
                        )}
                      </div>
                      
                      <AnimatePresence mode="wait">
                        {authMode === 'register' && (
                          <>
                            <motion.div
                              key="confirmPassword"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    className={cn(
                                      "pl-10",
                                      errors.confirmPassword && "border-destructive focus-visible:ring-destructive/30"
                                    )}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={submitting}
                                  />
                                </div>
                                {errors.confirmPassword && (
                                  <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>
                                )}
                              </div>
                            </motion.div>
                            
                          </>
                        )}
                      </AnimatePresence>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={submitting}
                      >
                        {submitting ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {authMode === 'login' ? 'Signing in...' : 'Creating account...'}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            {authMode === 'login' ? (
                              <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Sign In
                              </>
                            ) : (
                              <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Create Account
                              </>
                            )}
                          </span>
                        )}
                      </Button>
                      
                      {authMode === 'login' && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleDemoLogin}
                          disabled={submitting}
                        >
                          <ChefHat className="mr-2 h-4 w-4" />
                          Try Demo Account
                        </Button>
                      )}
                    </form>
                    
                    <div className="mt-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <Button 
                          variant="link" 
                          className="text-primary px-2 py-0 h-auto"
                          onClick={toggleAuthMode}
                          disabled={submitting}
                        >
                          {authMode === 'login' ? 'Sign up' : 'Sign in'}
                        </Button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            {/* Right side - Image and info */}
            <div className="order-1 lg:order-2 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold mb-4 leading-tight">
                    Discover & Save <span className="text-primary">Delicious Recipes</span>
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
                    Join thousands of food lovers who use Savory to organize their favorite recipes and discover new dishes.
                  </p>
                </div>
                
                <div className="relative flex justify-center">
                  <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-md">
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg transform rotate-[-3deg]">
                      <img
                        src="https://images.unsplash.com/photo-1495461199391-8c39ab674295?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                        alt="Delicious Food"
                        className="w-full h-32 md:h-40 object-cover rounded-md mb-2"
                      />
                      <h3 className="font-medium mb-1 text-sm md:text-base">Italian Pasta</h3>
                      <div className="flex items-center text-xs md:text-sm text-amber-500">
                        ★★★★★ <span className="text-xs text-muted-foreground ml-1">(42)</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg transform translate-y-4 rotate-[3deg]">
                      <img
                        src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                        alt="Delicious Food"
                        className="w-full h-32 md:h-40 object-cover rounded-md mb-2"
                      />
                      <h3 className="font-medium mb-1 text-sm md:text-base">Chocolate Cake</h3>
                      <div className="flex items-center text-xs md:text-sm text-amber-500">
                        ★★★★☆ <span className="text-xs text-muted-foreground ml-1">(38)</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg">
                      <img
                        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                        alt="Delicious Food"
                        className="w-full h-32 md:h-40 object-cover rounded-md mb-2"
                      />
                      <h3 className="font-medium mb-1 text-sm md:text-base">Perfect Pizza</h3>
                      <div className="flex items-center text-xs md:text-sm text-amber-500">
                        ★★★★★ <span className="text-xs text-muted-foreground ml-1">(56)</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg transform translate-y-2 rotate-[-2deg]">
                      <img
                        src="https://images.unsplash.com/photo-1529042410759-befb1204b468?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                        alt="Delicious Food"
                        className="w-full h-32 md:h-40 object-cover rounded-md mb-2"
                      />
                      <h3 className="font-medium mb-1 text-sm md:text-base">Fruit Salad</h3>
                      <div className="flex items-center text-xs md:text-sm text-amber-500">
                        ★★★★☆ <span className="text-xs text-muted-foreground ml-1">(29)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Mobile hero text - show instead of images */}
            <div className="lg:hidden order-1 text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-display font-semibold mb-4">
                Discover & Save <span className="text-primary">Delicious Recipes</span>
              </h2>
              <p className="text-base text-muted-foreground max-w-md mx-auto">
                Join thousands of food lovers who use Savory to organize their favorite recipes and discover new dishes.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="shrink-0 border-t bg-card/80 backdrop-blur-sm py-3 md:py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs md:text-sm text-muted-foreground">
          Supharat Saelee 652115048 &copy;2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
