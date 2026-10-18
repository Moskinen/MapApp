// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKH6y7aRLUN1XNPMdfCyrIpdx7qzrcH44",
  authDomain: "react1stmandatory.firebaseapp.com",
  projectId: "react1stmandatory",
  storageBucket: "react1stmandatory.firebasestorage.app",
  messagingSenderId: "906424666945",
  appId: "1:906424666945:web:bc3aa11c3fa941f1d62fc0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app)
export { app, database }