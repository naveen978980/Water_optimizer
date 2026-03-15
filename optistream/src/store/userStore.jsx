// User authentication store using React Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

// Create context
const UserContext = createContext(null);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setUid(firebaseUser.uid);
      } else {
        setUser(null);
        setUid(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const clearUser = () => {
    setUser(null);
    setUid(null);
  };

  const value = {
    user,
    uid,
    loading,
    setUid,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hooks to use the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const useUserActions = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserActions must be used within UserProvider');
  }
  return {
    setUid: context.setUid,
    clearUser: context.clearUser,
  };
};
