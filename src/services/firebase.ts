import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tes clés personnelles
const firebaseConfig = {
  apiKey: "AIzaSyAAKdOZCiJ9uGqmgmdoqp_-IioTScFsU0I",
  authDomain: "financeflowbystoxor.firebaseapp.com",
  projectId: "financeflowbystoxor",
  storageBucket: "financeflowbystoxor.firebasestorage.app",
  messagingSenderId: "43977997722",
  appId: "1:43977997722:web:d055af7410b66567538e23"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
