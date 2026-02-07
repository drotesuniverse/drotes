import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyDSv2nm_EqLJ_KJOrF4cFyrwGq3pefcpgM",
    authDomain: "otp-drotes.firebaseapp.com",
    projectId: "otp-drotes",
    storageBucket: "otp-drotes.firebasestorage.app",
    messagingSenderId: "934728104379",
    appId: "1:934728104379:web:bdfecc5bd350efa870ac9e",
    measurementId: "G-BC50N9Q6B0"
};
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}
export { app, auth, analytics, db };
