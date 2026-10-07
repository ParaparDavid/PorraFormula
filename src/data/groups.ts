import type { User } from '@firebase/auth';
import { collection, doc, getDoc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { rulesFromTemplate, type Rule, type TemplateKey } from '../engine';
import { generateCode, isValidCode, normalizeCode } from './inviteCode';

export type Role = 'admin' | 'member';
export type Membership = { groupId: string; name: string; role: Role };
export type GroupInfo = { id: string; name: string; ownerId: string; inviteCode: string; rules: Rule[] };
export type Member = { uid: string; role: Role; displayName: string; photoURL: string };

export class GroupError extends Error {
  constructor(public code: 'bad-code' | 'code-not-found' | 'name-required' | 'failed', message: string) {
    super(message);
  }
}

const isDenied = (e: unknown) => typeof e === 'object' && e !== null && (e as { code?: string }).code === 'permission-denied';
const profile = (u: User) => ({ displayName: u.displayName ?? 'Jugador', photoURL: u.photoURL ?? '' });

/** Crea el grupo, hace admin a quien lo crea y reserva su código de invitación, todo en un solo lote. */
export async function createGroup(user: User, rawName: string, template: TemplateKey): Promise<string> {
  const name = rawName.trim();
  if (!name) throw new GroupError('name-required', 'Ponle un nombre al grupo.');
  const groupId = doc(collection(db, 'groups')).id;
  const rules = rulesFromTemplate(template);
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const b = writeBatch(db);
    b.set(doc(db, 'groups', groupId), {
      name,
      ownerId: user.uid,
      inviteCode: code,
      template,
      rules,
      rulesVersion: 1,
      createdAt: serverTimestamp(),
    });
    b.set(doc(db, 'groups', groupId, 'members', user.uid), { uid: user.uid, role: 'admin', ...profile(user), joinedAt: serverTimestamp() });
    b.set(doc(db, 'inviteCodes', code), { groupId, createdBy: user.uid, createdAt: serverTimestamp() });
    b.set(doc(db, 'users', user.uid, 'memberships', groupId), { name, role: 'admin', joinedAt: serverTimestamp() });
    try {
      await b.commit();
      return groupId;
    } catch (e) {
      // Un código ya usado hace fallar la regla de creación: probamos con otro.
      if (!isDenied(e)) throw e;
    }
  }
  throw new GroupError('failed', 'No se pudo crear el grupo. Inténtalo de nuevo.');
}

/** Entra en un grupo con un código. Si ya eras miembro, devuelve ese grupo sin error. */
export async function joinGroup(user: User, rawCode: string): Promise<string> {
  const code = normalizeCode(rawCode);
  if (!isValidCode(code)) throw new GroupError('bad-code', 'El código tiene 6 letras y números.');
  const codeSnap = await getDoc(doc(db, 'inviteCodes', code));
  if (!codeSnap.exists()) throw new GroupError('code-not-found', 'No existe ningún grupo con ese código.');
  const groupId = (codeSnap.data() as { groupId: string }).groupId;

  try {
    await writeBatch(db)
      .set(doc(db, 'groups', groupId, 'members', user.uid), { uid: user.uid, role: 'member', code, ...profile(user), joinedAt: serverTimestamp() })
      .commit();
  } catch (e) {
    if (!isDenied(e)) throw e;
    // Si ya eras miembro, la regla impide reescribir tu ficha: lo comprobamos leyendo el grupo.
    try {
      await getDoc(doc(db, 'groups', groupId));
    } catch {
      throw new GroupError('failed', 'No se pudo entrar en el grupo.');
    }
  }
  const g = await getDoc(doc(db, 'groups', groupId));
  const name = (g.data() as { name?: string } | undefined)?.name ?? 'Grupo';
  const mem = await getDoc(doc(db, 'groups', groupId, 'members', user.uid));
  const role: Role = (mem.data() as { role?: Role } | undefined)?.role ?? 'member';
  await writeBatch(db).set(doc(db, 'users', user.uid, 'memberships', groupId), { name, role, joinedAt: serverTimestamp() }, { merge: true }).commit();
  return groupId;
}

export async function listMyGroups(uid: string): Promise<Membership[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'memberships'));
  return snap.docs.map((d) => ({ groupId: d.id, ...(d.data() as { name: string; role: Role }) })).sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export async function getGroup(groupId: string): Promise<GroupInfo | null> {
  const s = await getDoc(doc(db, 'groups', groupId));
  return s.exists() ? ({ id: s.id, ...(s.data() as Omit<GroupInfo, 'id'>) }) : null;
}

export async function listMembers(groupId: string): Promise<Member[]> {
  const snap = await getDocs(collection(db, 'groups', groupId, 'members'));
  return snap.docs.map((d) => d.data() as Member).sort((a, b) => (a.role === b.role ? a.displayName.localeCompare(b.displayName, 'es') : a.role === 'admin' ? -1 : 1));
}

export async function leaveGroup(uid: string, groupId: string): Promise<void> {
  await writeBatch(db)
    .delete(doc(db, 'groups', groupId, 'members', uid))
    .delete(doc(db, 'users', uid, 'memberships', groupId))
    .commit();
}
