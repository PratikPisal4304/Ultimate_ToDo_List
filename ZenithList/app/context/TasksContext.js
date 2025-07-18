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
    if (user) {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const unsubscribeTasks = getTasks(user.uid, (tasks) => {
        dispatch({ type: 'SET_TASKS', payload: tasks });
      });

      const unsubscribeUserData = getUserData(user.uid, (data) => {
          dispatch({ type: 'SET_USER_DATA', payload: data });
      });

      return () => {
        unsubscribeTasks();
        unsubscribeUserData();
      };
    }
  }, [user]);

  return (
    <TasksContext.Provider value={{ ...state }}>
      {children}
    </TasksContext.Provider>
  );
};

export { TasksContext, TasksProvider };