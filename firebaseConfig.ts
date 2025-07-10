import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Tu configuración de Firebase
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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db, firebase };

