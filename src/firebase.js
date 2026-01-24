// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHotPqW1YCwO6TQWOHEKfszPf5ICQOFXQ",
  authDomain: "foes-terminal.firebaseapp.com",
  projectId: "foes-terminal",
  storageBucket: "foes-terminal.firebasestorage.app",
  messagingSenderId: "324758845848",
  appId: "1:324758845848:web:56f6def06d685148ff13ed"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);