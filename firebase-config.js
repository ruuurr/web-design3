
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  signInAnonymously
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFirestore
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

export const firebaseConfig = {
  apiKey: "AIzaSyCOrFoHsR_5Vcm9oWKu1lmR_RIs3qEedz0",
  authDomain: "neon-krossvord.firebaseapp.com",
  projectId: "neon-krossvord",
  storageBucket: "neon-krossvord.firebasestorage.app",
  messagingSenderId: "983853887681",
  appId: "1:983853887681:web:9c20fe08b3bbbd6e1ca440",
  measurementId: "G-EQC5GRGHVC"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const authReady = signInAnonymously(auth);