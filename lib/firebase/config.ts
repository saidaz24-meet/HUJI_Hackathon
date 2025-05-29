// lib/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Replace with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyBAGm7BpLxW-UIQQPMQ1ZHqpVtbbQMPigs",
    authDomain: "shaman-46b8f.firebaseapp.com",
    projectId: "shaman-46b8f",
    storageBucket: "shaman-46b8f.firebasestorage.app",
    messagingSenderId: "33913315470",
    appId: "1:33913315470:web:e532cfb4e172506b7769df",
    databaseURL: "https://shaman-46b8f-default-rtdb.europe-west1.firebasedatabase.app" // Add this
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database
export const db = getDatabase(app);

export default app;