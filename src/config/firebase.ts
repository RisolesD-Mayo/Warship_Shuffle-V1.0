import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAE_OEaLR74Vg_M7xAW0DYGSP2LQtoVzjM",
  authDomain: "uass-ded83.firebaseapp.com",
  projectId: "uass-ded83",
  storageBucket: "uass-ded83.firebasestorage.app",
  messagingSenderId: "380216437571",
  appId: "1:380216437571:web:c93306e6cf17c629295df6",
  measurementId: "G-SKJZQZ79ZL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);