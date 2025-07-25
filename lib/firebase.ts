// /lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAr-5PMxZTeZ60pVlAmW39OQAFIRtP3w0A",
  authDomain: "hero-scale-cs.firebaseapp.com",
  projectId: "hero-scale-cs",
  storageBucket: "hero-scale-cs.firebasestorage.app",
  messagingSenderId: "444576253763",
  appId: "1:444576253763:web:7b7ba1fc2d4cd9f29091f6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// ✅ app を export に追加
export { app, auth, provider, db };
