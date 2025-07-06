// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8MrTsPH7TSzMFAmLCar6-Um925eeezVQ",
  authDomain: "finanzas-app-7b0ef.firebaseapp.com",
  projectId: "finanzas-app-7b0ef",
  storageBucket: "finanzas-app-7b0ef.firebasestorage.app",
  messagingSenderId: "443737390258",
  appId: "1:443737390258:web:8ed3e308a93ef5a88eddab",
  measurementId: "G-CK0Q393W8Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

