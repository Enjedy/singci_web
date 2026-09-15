import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCTSJgtcYts5WFMwIHh6A68fXrYrSv9yjQ",
  authDomain: "singci.firebaseapp.com",
  projectId: "singci",
  storageBucket: "singci.firebasestorage.app",
  messagingSenderId: "802463248388",
  appId: "1:802463248388:web:69cb418a4727351324c551",
  measurementId: "G-20RCKX0JMN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
