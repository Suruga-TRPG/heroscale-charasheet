// firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAr-5PMxZTeZ60pVlAmW39OQAFIRtP3w0A",
  authDomain: "hero-scale-cs.firebaseapp.com",
  projectId: "hero-scale-cs",
  storageBucket: "hero-scale-cs.firebasestorage.app",
  messagingSenderId: "444576253763",
  appId: "1:444576253763:web:7b7ba1fc2d4cd9f29091f6"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app, "us-central1");

export { db, auth, functions };
