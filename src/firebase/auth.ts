import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp } from 'firebase/app';
import { getReactNativePersistence, GoogleAuthProvider, initializeAuth, signInWithCredential, signOut as fbSignOut, type Auth } from '@firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import './config';
import { db, GOOGLE_WEB_CLIENT_ID } from './config';

let authInstance: Auth | undefined;
/** Auth con sesión persistente entre aperturas de la app. */
export function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = initializeAuth(getApp(), { persistence: getReactNativePersistence(AsyncStorage) });
  }
  return authInstance;
}

type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');

/** El módulo nativo no existe en Expo Go: se carga solo cuando se usa y devuelve null si falta. */
function googleModule(): GoogleSigninModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-google-signin/google-signin') as GoogleSigninModule;
  } catch {
    return null;
  }
}

export type SignInOutcome = 'ok' | 'cancelled' | 'unavailable' | 'not-configured';

export async function signInWithGoogle(): Promise<SignInOutcome> {
  const g = googleModule();
  if (!g) return 'unavailable';
  if (!GOOGLE_WEB_CLIENT_ID) return 'not-configured';
  g.GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  await g.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await g.GoogleSignin.signIn();
  if (!g.isSuccessResponse(response)) return 'cancelled';
  const idToken = response.data.idToken;
  if (!idToken) throw new Error('Google no devolvió el token de acceso.');
  const cred = await signInWithCredential(getAuthInstance(), GoogleAuthProvider.credential(idToken));
  const u = cred.user;
  try {
    await setDoc(
      doc(db, 'users', u.uid),
      { displayName: u.displayName ?? '', photoURL: u.photoURL ?? '', lastLoginAt: serverTimestamp() },
      { merge: true },
    );
  } catch {
    /* el perfil se reintenta en el próximo acceso; no debe impedir entrar */
  }
  return 'ok';
}

export async function signOut(): Promise<void> {
  const g = googleModule();
  try {
    await g?.GoogleSignin.signOut();
  } catch {
    /* sin sesión de Google: nada que cerrar */
  }
  await fbSignOut(getAuthInstance());
}
