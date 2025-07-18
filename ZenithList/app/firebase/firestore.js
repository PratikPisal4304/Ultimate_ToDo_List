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
  runTransaction
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Fetch tasks in real-time
export const getTasks = (userId, callback) => {
  const tasksCol = collection(db, 'users', userId, 'tasks');
  const q = query(tasksCol); // Add ordering later if needed: orderBy('createdAt', 'desc')

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    callback(tasks);
  });

  return unsubscribe;
};

// Fetch User Gamification Data
export const getUserData = (userId, callback) => {
  const userDocRef = doc(db, 'users', userId);
  const unsubscribe = onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      console.log("No such user document!");
      callback(null);
    }
  });
  return unsubscribe;
};


// Add a new task
export const addTask = (userId, task) => {
  return addDoc(collection(db, 'users', userId, 'tasks'), {
    ...task,
    createdAt: serverTimestamp(),
    isCompleted: false,
  });
};

// Update a task
export const updateTask = (userId, taskId, updates) => {
  const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
  return updateDoc(taskDoc, updates);
};

// Delete a task
export const deleteTask = (userId, taskId) => {
  const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
  return deleteDoc(taskDoc);
};

// Handle task completion logic with gamification
export const handleCompleteTask = async (userId, taskId, priority) => {
    const userDocRef = doc(db, 'users', userId);
    const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);

    // Points mapping
    const pointsMap = { 'High': 25, 'Medium': 15, 'Low': 10 };
    const pointsToAdd = pointsMap[priority] || 10;

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw "User document does not exist!";
            }

            // Mark task as complete
            transaction.update(taskDocRef, { isCompleted: true, completedAt: serverTimestamp() });

            // Gamification logic
            const userData = userDoc.data();
            const newPoints = (userData.points || 0) + pointsToAdd;
            const newLevel = Math.floor(newPoints / 100) + 1; // Level up every 100 points

            // Streak Logic
            let newStreak = userData.streak || 0;
            const lastCompletion = userData.lastCompletionDate?.toDate();
            const now = new Date();
            
            if (lastCompletion) {
                const isSameDay = now.toDateString() === lastCompletion.toDateString();
                // If not same day, check if it was yesterday to continue streak
                const yesterday = new Date();
                yesterday.setDate(now.getDate() - 1);
                if (!isSameDay) {
                   if (yesterday.toDateString() === lastCompletion.toDateString()) {
                        newStreak++;
                   } else {
                        newStreak = 1; // Reset streak
                   }
                }
            } else {
                newStreak = 1; // First completion
            }

            transaction.update(userDocRef, { 
                points: newPoints,
                level: newLevel,
                streak: newStreak,
                lastCompletionDate: now,
            });
        });
        console.log("Transaction successfully committed!");
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
};