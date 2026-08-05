// firebase-config.js — Firebase initialisatie voor GoFitness
// Gebruikt de compat-versie van de Firebase Web SDK (geschikt voor vanilla JS zonder bundler)

const firebaseConfig = {
  apiKey: "AIzaSyBOwknjKjHMZ2M9lyui3MoyoOuY_tmrqsQ",
  authDomain: "gofitness-503220.firebaseapp.com",
  projectId: "gofitness-503220",
  storageBucket: "gofitness-503220.firebasestorage.app",
  messagingSenderId: "1064597245112",
  appId: "1:1064597245112:web:68fe85d72e2f666734f84d",
  measurementId: "G-4FHXG8JQ5K"
};

// Initialiseer Firebase (alleen als firebase geladen is)
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
}

const getDb = () => (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;
const getAuth = () => (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth() : null;
