// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxXoHrEC-yfeMXWHNaPRhoxD5oG7NY-gg",
  authDomain: "tulipgardener.firebaseapp.com",
  projectId: "tulipgardener",
  storageBucket: "tulipgardener.firebasestorage.app",
  messagingSenderId: "919491145541",
  appId: "1:919491145541:web:9eec4ba01f7d030ffc182c",
  measurementId: "G-0REKNQS1JH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Auth and Firestore
const auth = firebase.auth();
const db = firebase.firestore();