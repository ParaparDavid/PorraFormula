import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Estos valores identifican el proyecto; no son secretos. La seguridad la dan firestore.rules.
const firebaseConfig = {
  apiKey: 'AIzaSyAnIa8qXrGOwc6qacRGASxeaKwHrJfM25c',
  authDomain: 'porraformula.firebaseapp.com',
  projectId: 'porraformula',
  storageBucket: 'porraformula.firebasestorage.app',
  messagingSenderId: '964490293967',
  appId: '1:964490293967:web:a5f8f1553a7ba67828fdba',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
