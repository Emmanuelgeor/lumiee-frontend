import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyCwGYxTonWFkaWUMqlK7hGr8jP2j-p411o",
    authDomain: "kids-chatbot-fyp.firebaseapp.com",
    projectId: "kids-chatbot-fyp",
    storageBucket: "kids-chatbot-fyp.firebasestorage.app",
    messagingSenderId: "831887514421",
    appId: "1:831887514421:web:d30db2c7a8d2d5fc25ca7c"
};

const app = initializeApp(firebaseConfig);

// 🔐 Auth with persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// 📊 Firestore
export const db = getFirestore(app);