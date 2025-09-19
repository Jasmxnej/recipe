// AuthContext: Handles user login, logout, and auth state. Uses localStorage for persistence. Provides user data and login/logout functions.

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import usersData from '../data/users.json';

type User = {
  id: string;
  username: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updatedUser: Partial<User>) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsers = localStorage.getItem('savory_users');
    let initialUsers: User[];
    if (storedUsers) {
      initialUsers = JSON.parse(storedUsers);
    } else {
      initialUsers = usersData as User[];
      localStorage.setItem('savory_users', JSON.stringify(initialUsers));
    }
    setUsers(initialUsers);

    // Restore user session
    const storedUser = localStorage.getItem('savory_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const validUser = initialUsers.find(u => u.id === parsedUser.id);
        if (validUser) {
          setUser(validUser);
        }
      } catch (e) {
        console.error('Failed to restore user session:', e);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('savory_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('savory_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
 
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
 
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        return true;
      } else {
        toast.error('Invalid email or password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    setIsLoading(true);
 
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
 
      const existingUser = users.find(u => u.email === email || u.username === username);
      if (existingUser) {
        toast.error('User already exists with this email or username');
        return false;
      }
 
      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        email,
        password,
        name: name || username,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}`
      };
 
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('savory_users', JSON.stringify(updatedUsers));
 
      setUser(newUser);
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('savory_user');
    navigate('/auth');
    toast.info('You have been logged out');
  };

  const updateUser = async (updatedUser: Partial<User>) => {
    if (!user) return;
 
    try {
      setIsLoading(true);
 
      const updated = { ...user, ...updatedUser };
 
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
 
      const updatedUsers = users.map(u => u.id === user.id ? updated : u);
      setUsers(updatedUsers);
      localStorage.setItem('savory_users', JSON.stringify(updatedUsers));
 
      setUser(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};