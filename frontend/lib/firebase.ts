import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDkYdvbBLTyesi3NevAEz8MyGuqa9jrCgI",
  authDomain: "scriptshot-app.firebaseapp.com",
  projectId: "scriptshot-app",
  storageBucket: "scriptshot-app.firebasestorage.app",
  messagingSenderId: "778934483904",
  appId: "1:778934483904:web:c3314d457cd1423aec2625"
};

// アプリの二重初期化を防ぐ
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };