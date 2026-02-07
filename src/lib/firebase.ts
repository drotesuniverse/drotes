import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
<<<<<<< HEAD

=======
>>>>>>> 978c6cfd7a1c53190512a6031a87d389aab56f0b
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
<<<<<<< HEAD

=======
>>>>>>> 978c6cfd7a1c53190512a6031a87d389aab56f0b
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}
<<<<<<< HEAD

=======
>>>>>>> 978c6cfd7a1c53190512a6031a87d389aab56f0b
export { app, auth, analytics };
