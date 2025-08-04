// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyCbR-UsMABkxypLWQR3tmkwJXWoZzIdKQ4",
  authDomain: "filementor-2dae4.firebaseapp.com",
  projectId: "filementor-2dae4",
  storageBucket: "filementor-2dae4.appspot.com",
  messagingSenderId: "14603282976",
  appId: "1:14603282976:web:1b1900e19685d116cd6a45",
  measurementId: "G-2V0351BMXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;