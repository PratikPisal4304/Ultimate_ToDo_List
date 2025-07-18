// app/context/TasksContext.js
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getTasks, getUserData, getProjects } from '../firebase/firestore';

const TasksContext = createContext();

const tasksReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'SET_PROJECTS':
        return { ...state, projects: action.payload };
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
    projects: [],
    userData: null,
    loading: true,
  });

  useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Subscribe to tasks
      const unsubscribeTasks = getTasks(user.uid, (tasks) => {
        dispatch({ type: 'SET_TASKS', payload: tasks });
      });

      // Subscribe to projects
      const unsubscribeProjects = getProjects(user.uid, (projects) => {
          dispatch({ type: 'SET_PROJECTS', payload: projects });
      });

      // Subscribe to user data
      const unsubscribeUserData = getUserData(user.uid, (data) => {
          dispatch({ type: 'SET_USER_DATA', payload: data });
      });

      return () => {
        unsubscribeTasks();
        unsubscribeProjects();
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
