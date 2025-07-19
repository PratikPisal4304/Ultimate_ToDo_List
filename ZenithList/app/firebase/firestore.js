// app/firebase/firestore.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  serverTimestamp,
  getDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
// Import additional date-fns functions for robust date comparison
import { addDays, addWeeks, addMonths, isSameDay, subDays, startOfDay } from 'date-fns';

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

export const handleCompleteTask = async (userId, task) => {
    const { id: taskId, priority, recurrence } = task;
    const userDocRef = doc(db, 'users', userId);
    const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
    const pointsMap = { 'High': 25, 'Medium': 15, 'Low': 10 };
    const pointsToAdd = pointsMap[priority] || 10;

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) throw "User document does not exist!";

            // If the task is recurring, create the next instance of the task
            if (recurrence && recurrence.frequency && recurrence.frequency !== 'none') {
                const taskDoc = await transaction.get(taskDocRef);
                const taskData = taskDoc.data();
                let nextDueDate = new Date(taskData.dueDate.toDate());

                const interval = recurrence.interval || 1;

                switch (recurrence.frequency) {
                    case 'daily':
                        nextDueDate = addDays(nextDueDate, interval);
                        break;
                    case 'weekly':
                        nextDueDate = addWeeks(nextDueDate, interval);
                        break;
                    case 'monthly':
                        nextDueDate = addMonths(nextDueDate, interval);
                        break;
                }

                const newTask = {
                    ...taskData,
                    dueDate: nextDueDate,
                    isCompleted: false,
                    completedAt: null, // Ensure the new task is not marked as completed
                    createdAt: serverTimestamp(),
                };

                const newTasksCol = collection(db, 'users', userId, 'tasks');
                transaction.set(doc(newTasksCol), newTask);
            }
            
            transaction.update(taskDocRef, { isCompleted: true, completedAt: serverTimestamp() });
            
            const userData = userDoc.data();
            const newPoints = (userData.points || 0) + pointsToAdd;
            const newLevel = Math.floor(newPoints / 100) + 1;
            
            // --- REFACTORED STREAK LOGIC ---
            let newStreak = userData.streak || 0;
            const lastCompletion = userData.lastCompletionDate?.toDate();
            const now = new Date();
            const today = startOfDay(now);
            
            if (lastCompletion) {
                const lastCompletionDay = startOfDay(lastCompletion);
                const yesterday = subDays(today, 1);
                
                // Only update streak if the last completion wasn't today
                if (!isSameDay(today, lastCompletionDay)) {
                    if (isSameDay(lastCompletionDay, yesterday)) {
                        // Completed yesterday, so increment streak
                        newStreak++;
                    } else {
                        // Missed a day, so reset streak to 1
                        newStreak = 1;
                    }
                }
            } else {
                // First ever completion
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