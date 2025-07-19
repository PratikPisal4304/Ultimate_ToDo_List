// app/context/TasksContext.js
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getTasks, getUserData } from '../firebase/firestore';

const TasksContext = createContext();

const tasksReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'SET_USER_DATA':
        return { ...state, userData: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const TasksProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(tasksReducer, {
    tasks: [],
    userData: null,
    loading: true,
  });

  useEffect(() => {
    // Define placeholder unsubscribe functions to be used in the cleanup return.
    let unsubscribeTasks = () => {};
    let unsubscribeUserData = () => {};

    if (user) {
      // If user is logged in, set loading and subscribe to their data.
      dispatch({ type: 'SET_LOADING', payload: true });
      
      unsubscribeTasks = getTasks(user.uid, (tasks) => {
        dispatch({ type: 'SET_TASKS', payload: tasks });
      });

      unsubscribeUserData = getUserData(user.uid, (data) => {
          dispatch({ type: 'SET_USER_DATA', payload: data });
      });
    } else {
      // FIX: If user is null (logged out), clear all data from the context.
      // This prevents components from trying to render stale data with a null user.
      dispatch({ type: 'SET_TASKS', payload: [] });
      dispatch({ type: 'SET_USER_DATA', payload: null });
      dispatch({ type: 'SET_LOADING', payload: false });
    }

    // This cleanup function will run when the user dependency changes or on unmount.
    return () => {
      unsubscribeTasks();
      unsubscribeUserData();
    };
  }, [user]);

  return (
    <TasksContext.Provider value={{ ...state }}>
      {children}
    </TasksContext.Provider>
  );
};

export { TasksContext, TasksProvider };