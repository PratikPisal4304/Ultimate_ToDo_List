// app/firebase/firestore.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs, // <-- Import getDocs
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// --- Task Functions ---

export const getTasks = (userId, callback) => {
  const tasksCol = collection(db, 'users', userId, 'tasks');
  const q = query(tasksCol);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    callback(tasks);
  });
  return unsubscribe;
};

export const addTask = (userId, task) => {
  return addDoc(collection(db, 'users', userId, 'tasks'), {
    ...task,
    createdAt: serverTimestamp(),
    isCompleted: false,
  });
};

export const updateTask = (userId, taskId, updates) => {
  const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
  return updateDoc(taskDoc, updates);
};

export const deleteTask = (userId, taskId) => {
  const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
  return deleteDoc(taskDoc);
};

// --- Project Functions ---

export const getProjects = (userId, callback) => {
    const projectsCol = collection(db, 'users', userId, 'projects');
    const q = query(projectsCol); // You could order this, e.g., orderBy('name')
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const projects = [{ id: 'all', name: 'All Tasks', icon: 'view-list', color: '#808080' }]; // Default project
        querySnapshot.forEach((doc) => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        callback(projects);
    });
    return unsubscribe;
};

export const addProject = (userId, project) => {
    return addDoc(collection(db, 'users', userId, 'projects'), {
        ...project,
        createdAt: serverTimestamp(),
    });
};

export const updateProject = (userId, projectId, updates) => {
    const projectDoc = doc(db, 'users', userId, 'projects', projectId);
    return updateDoc(projectDoc, updates);
};

export const deleteProject = async (userId, projectId) => {
    const projectDocRef = doc(db, 'users', userId, 'projects', projectId);
    const tasksQuery = query(collection(db, 'users', userId, 'tasks'), where('projectId', '==', projectId));

    const batch = writeBatch(db);

    // Get all tasks in the project and add their deletion to the batch
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.forEach(taskDoc => {
        batch.delete(taskDoc.ref);
    });

    // Add the project deletion to the batch
    batch.delete(projectDocRef);

    // Commit the batch
    return batch.commit();
};


// --- Gamification & User Data ---

export const getUserData = (userId, callback) => {
  const userDocRef = doc(db, 'users', userId);
  const unsubscribe = onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  });
  return unsubscribe;
};

export const handleCompleteTask = async (userId, taskId, priority) => {
    const userDocRef = doc(db, 'users', userId);
    const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
    const pointsMap = { 'High': 25, 'Medium': 15, 'Low': 10 };
    const pointsToAdd = pointsMap[priority] || 10;

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) throw "User document does not exist!";

            transaction.update(taskDocRef, { isCompleted: true, completedAt: serverTimestamp() });

            const userData = userDoc.data();
            const newPoints = (userData.points || 0) + pointsToAdd;
            const newLevel = Math.floor(newPoints / 100) + 1;
            let newStreak = userData.streak || 0;
            const lastCompletion = userData.lastCompletionDate?.toDate();
            const now = new Date();

            if (lastCompletion) {
                const isSameDay = now.toDateString() === lastCompletion.toDateString();
                const yesterday = new Date();
                yesterday.setDate(now.getDate() - 1);
                if (!isSameDay) {
                   if (yesterday.toDateString() === lastCompletion.toDateString()) {
                        newStreak++;
                   } else {
                        newStreak = 1;
                   }
                }
            } else {
                newStreak = 1;
            }

            transaction.update(userDocRef, {
                points: newPoints,
                level: newLevel,
                streak: newStreak,
                lastCompletionDate: now,
            });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
};