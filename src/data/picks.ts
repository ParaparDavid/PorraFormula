import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Pick } from '../engine';
import { isOpen } from './deadlines';
import { raceById } from './f1';
import { listMyGroups } from './groups';
import { getGroupIds, replacePicks, setGroupIds } from './picksStore';

export class PicksError extends Error {
  constructor(public code: 'closed' | 'no-groups' | 'unknown-race' | 'failed', message: string) {
    super(message);
  }
}

export const pickDocId = (raceId: string, uid: string) => `${raceId}__${uid}`;

/** Guarda la predicción en todos los grupos del usuario. El servidor vuelve a comprobar el cierre. */
export async function savePickToGroups(uid: string, groupIds: string[], raceId: string, pick: Pick, nowMs: number = Date.now()): Promise<void> {
  const race = raceById(raceId);
  if (!race) throw new PicksError('unknown-race', 'Carrera desconocida.');
  if (!isOpen(race.date, nowMs)) throw new PicksError('closed', 'Esta carrera ya está cerrada.');
  if (!groupIds.length) throw new PicksError('no-groups', 'Primero crea un grupo o únete a uno.');
  const b = writeBatch(db);
  for (const g of groupIds) {
    b.set(doc(db, 'groups', g, 'picks', pickDocId(raceId, uid)), {
      uid,
      raceId,
      pole: pick.pole,
      team: pick.team,
      top10: Array.from({ length: 10 }, (_, i) => pick.top10[i] ?? ''),
      updatedAt: serverTimestamp(),
    });
  }
  try {
    await b.commit();
  } catch (e) {
    const code = (e as { code?: string }).code;
    // Si el reloj del móvil iba atrasado, el servidor es quien manda.
    if (code === 'permission-denied') throw new PicksError('closed', 'No se pudo guardar: la carrera ya está cerrada o no eres miembro.');
    throw new PicksError('failed', 'No se pudo guardar. Comprueba la conexión.');
  }
}

/** Mis predicciones de un grupo, por carrera. */
export async function loadMyPicks(groupId: string, uid: string): Promise<Record<string, Pick>> {
  const snap = await getDocs(query(collection(db, 'groups', groupId, 'picks'), where('uid', '==', uid)));
  const out: Record<string, Pick> = {};
  for (const d of snap.docs) {
    const x = d.data() as { raceId: string; pole?: string; team?: string; top10?: string[] };
    out[x.raceId] = { pole: x.pole ?? '', team: x.team ?? '', top10: Array.from({ length: 10 }, (_, i) => x.top10?.[i] ?? '') };
  }
  return out;
}

/** Recarga mis grupos y mis predicciones desde Firestore. */
export async function refreshPicks(uid: string): Promise<void> {
  const groups = await listMyGroups(uid);
  const ids = groups.map((g) => g.groupId);
  const all: Record<string, Pick> = {};
  for (const id of ids) {
    const mine = await loadMyPicks(id, uid);
    for (const [raceId, p] of Object.entries(mine)) if (!all[raceId]) all[raceId] = p;
  }
  replacePicks(all);
  setGroupIds(ids);
}

export { getGroupIds };
