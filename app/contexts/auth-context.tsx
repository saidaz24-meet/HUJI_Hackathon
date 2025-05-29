// contexts/auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase/config";
import { ref, onValue, set, push } from "firebase/database";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signInWithGoogle: (rememberMe: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUserEmailConsent: (consent: boolean) => void;
  getEmailConsent: () => boolean;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoggedIn(!!user);
      setLoading(false);

      // If user just logged in, initialize their data in the database
      if (user && !localStorage.getItem(`userInitialized_${user.uid}`)) {
        // Initialize tasks structure
        const tasksRef = ref(db, `users/${user.uid}/tasks`);
        set(tasksRef, {});

        // Initialize notifications structure
        const notificationsRef = ref(db, `users/${user.uid}/notifications`);
        set(notificationsRef, {});

        localStorage.setItem(`userInitialized_${user.uid}`, 'true');
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    try {
      // Set the persistence based on the remember me checkbox
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async (rememberMe: boolean) => {
    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const setUserEmailConsent = (consent: boolean) => {
    localStorage.setItem("emailConsent", JSON.stringify(consent));
  };

  const getEmailConsent = () => {
    const consent = localStorage.getItem("emailConsent");
    return consent ? JSON.parse(consent) : false;
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            loading,
            signUp,
            signIn,
            signInWithGoogle,
            signOut,
            resetPassword,
            setUserEmailConsent,
            getEmailConsent,
            isLoggedIn
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};