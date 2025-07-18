// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOFyObRry8y13nFVCKIcQTMaV5m09Z9es",
  authDomain: "zenithlist-661da.firebaseapp.com",
  projectId: "zenithlist-661da",
  storageBucket: "zenithlist-661da.firebasestorage.app",
  messagingSenderId: "20447602088",
  appId: "1:20447602088:web:39dae17fda093e5b6c699d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };