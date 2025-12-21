import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDq8csaEKWALhQ-raLkXReno6pjT1fmRqE",
  authDomain: "market-pulse-6fd01.firebaseapp.com",
  projectId: "market-pulse-6fd01",
  storageBucket: "market-pulse-6fd01.firebasestorage.app",
  messagingSenderId: "226109869716",
  appId: "1:226109869716:web:ea02253e233c3ba0f1ae81",
  measurementId: "G-21SDLVWTVZ"
};

const app = initializeApp(firebaseConfig);

// Initialize analytics without assigning to an unused variable
getAnalytics(app);

export const db = getFirestore(app);