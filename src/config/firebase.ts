import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_IXMkJ8H5XOqIK_Q9IrldVlDLG8JgJig",
  authDomain: "azurlane-beta.firebaseapp.com",
  projectId: "azurlane-beta",
  storageBucket: "azurlane-beta.firebasestorage.app",
  messagingSenderId: "95992262059",
  appId: "1:95992262059:web:440ee2aa1fd39851ab36ee"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);