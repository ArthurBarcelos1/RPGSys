// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAM-ZU4ho0qs3jRWUXZEHrUM82bz3vvlro",
  authDomain: "rpgsys-ae4bc.firebaseapp.com",
  databaseURL: "https://rpgsys-ae4bc-default-rtdb.firebaseio.com",
  projectId: "rpgsys-ae4bc",
  storageBucket: "rpgsys-ae4bc.firebasestorage.app",
  messagingSenderId: "22232601003",
  appId: "1:22232601003:web:cf38df9fbcf442c79b42ee",
  measurementId: "G-3KLBEM1LWV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);