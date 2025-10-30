// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBZLVezWPfPS_79VSLmJgZvW3w3g_MI-yE",
  authDomain: "thiqah-30599.firebaseapp.com",
  projectId: "thiqah-30599",
  storageBucket: "thiqah-30599.firebasestorage.app",
  messagingSenderId: "1018162172535",
  appId: "1:1018162172535:web:4d1b3469713d74a1f42c72",
  measurementId: "G-2JG9ED48ZS"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
