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

/**
 * ID de cliente web de Google (Firebase → Authentication → Método de acceso → Google →
 * "Configuración del SDK web" → ID de cliente web). Hace falta para el acceso con Google.
 */
export const GOOGLE_WEB_CLIENT_ID = '964490293967-ejr0512ska3d7vevlidgp2q6ue2oa5kj.apps.googleusercontent.com';
