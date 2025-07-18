// app/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

// Handle User Sign Up
export const handleSignUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Create a user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      points: 0,
      level: 1,
      streak: 0,
      lastCompletionDate: null,
    });
    return { user };
  } catch (error) {
    return { error };
  }
};

// Handle User Sign In
export const handleSignIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    return { error };
  }
};

// Handle Anonymous Sign In
export const handleAnonymousSignIn = async () => {
    try {
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        // Create a user document for the anonymous user
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: 'Anonymous User',
            points: 0,
            level: 1,
            streak: 0,
            lastCompletionDate: null,
        });
        return { user };
    } catch (error) {
        return { error };
    }
};


// Handle User Sign Out
export const handleSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
  }
};