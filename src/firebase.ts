// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: "AIzaSyAAcaBiTJ3xOX7199hpvS7hhoXUD0qJ_DM",
  authDomain: "create-blank-screen.firebaseapp.com",
  projectId: "create-blank-screen",
  storageBucket: "create-blank-screen.firebasestorage.app",
  messagingSenderId: "643211367771",
  appId: "1:643211367771:web:a1712c35c55c8bde2b767e",
  measurementId: "G-GH2GVFLEQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
