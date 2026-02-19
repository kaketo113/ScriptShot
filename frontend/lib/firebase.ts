import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDkYdvbBLTyesi3NevAEz8MyGuqa9jrCgI",
    authDomain: "scriptshot-app.firebaseapp.com",
    projectId: "scriptshot-app",
    storageBucket: "scriptshot-app.firebasestorage.app",
    messagingSenderId: "778934483904",
    appId: "1:778934483904:web:c3314d457cd1423aec2625"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

export { db, auth, googleProvider, storage };