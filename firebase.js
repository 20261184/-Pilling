import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyD33b5IstDUfZoBnREjbyuNZiogp9JK_NU",
  authDomain: "pilling-30c08.firebaseapp.com",
  projectId: "pilling-30c08",
  storageBucket: "pilling-30c08.firebasestorage.app",
  messagingSenderId: "324600052477",
  appId: "1:324600052477:web:e9d8b3bdf17b8a77271c94",
  measurementId: "G-JJ7BCZTV8W"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = getMessaging(app);