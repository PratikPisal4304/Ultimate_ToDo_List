// app/context/AuthContext.js
import React, { createContext, useReducer, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SIGN_IN':
      return { ...state, user: action.payload, isLoading: false };
    case 'SIGN_OUT':
      return { ...state, user: null, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch({ type: 'SIGN_IN', payload: user });
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };