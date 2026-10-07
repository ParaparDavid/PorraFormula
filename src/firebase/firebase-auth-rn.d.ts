import type { Persistence } from '@firebase/auth';

// @firebase/auth declara sus tipos "web" primero y no incluye esta función, que sí existe en el build de
// React Native (Metro usa la condición "react-native"). Se declara aquí para que TypeScript la conozca.
declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
