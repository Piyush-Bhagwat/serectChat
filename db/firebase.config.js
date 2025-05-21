
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAbRCw8AuRvc9BlFHVpgUDzXCmdKb1O8Qg",
    authDomain: "anuchat-67748.firebaseapp.com",
    projectId: "anuchat-67748",
    storageBucket: "anuchat-67748.firebasestorage.app",
    messagingSenderId: "570049080004",
    appId: "1:570049080004:web:3f74e2990d0a32f5713791",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };