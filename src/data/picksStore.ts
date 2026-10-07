import { useSyncExternalStore } from 'react';
import { emptyPick, type Pick } from '../engine';

// Almacén en memoria (provisional): se sustituirá por Firestore al conectar la cuenta.
const picks = new Map<string, Pick>();
const listeners = new Set<() => void>();
let version = 0;

export function getPick(raceId: string): Pick {
  const p = picks.get(raceId);
  return p ? { ...p, top10: [...p.top10] } : emptyPick();
}
export function hasPick(raceId: string): boolean {
  return picks.has(raceId);
}
export function savePick(raceId: string, pick: Pick) {
  picks.set(raceId, { ...pick, top10: [...pick.top10] });
  version++;
  listeners.forEach((l) => l());
}
/** Re-renderiza al guardar cualquier predicción. */
export function usePicksVersion(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
  );
}
