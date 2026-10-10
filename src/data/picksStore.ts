import { useSyncExternalStore } from 'react';
import { emptyPick, type Pick } from '../engine';

// Copia local de mis predicciones (la fuente de verdad es Firestore, en cada grupo mío).
const picks = new Map<string, Pick>();
let groupIds: string[] = [];
const listeners = new Set<() => void>();
let version = 0;
const notify = () => {
  version++;
  listeners.forEach((l) => l());
};

const copy = (p: Pick): Pick => ({ ...p, top10: [...p.top10] });

export function getPick(raceId: string): Pick {
  const p = picks.get(raceId);
  return p ? copy(p) : emptyPick();
}
export function hasPick(raceId: string): boolean {
  return picks.has(raceId);
}
export function countPicks(): number {
  return picks.size;
}
export function savePick(raceId: string, pick: Pick) {
  picks.set(raceId, copy(pick));
  notify();
}
/** Sustituye todo lo guardado por lo que hay en Firestore. */
export function replacePicks(all: Record<string, Pick>) {
  picks.clear();
  for (const [id, p] of Object.entries(all)) picks.set(id, copy(p));
  notify();
}
export function setGroupIds(ids: string[]) {
  groupIds = ids;
  notify();
}
export const getGroupIds = () => groupIds;
export function resetPicks() {
  picks.clear();
  groupIds = [];
  notify();
}
/** Re-renderiza al cambiar cualquier predicción o la lista de grupos. */
export function usePicksVersion(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
  );
}
