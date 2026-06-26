import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setInitializing(false);
      return undefined;
    }

    let active = true;
    let unsubscribe = () => {};

    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Auth persistence failed:', error);
      })
      .finally(() => {
        if (!active) return;

        unsubscribe = onAuthStateChanged(
          auth,
          (nextUser) => {
            setUser(nextUser);
            setInitializing(false);
          },
          (error) => {
            console.error('Auth state failed:', error);
            setInitializing(false);
          }
        );
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      hasFirebaseConfig,
      signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
      signUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
      resetPassword: (email) => sendPasswordResetEmail(auth, email),
      logout: () => signOut(auth)
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
