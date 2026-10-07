import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'porraformula-rules-test',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
afterAll(async () => env.cleanup());

// Grupo "g1": ana (dueña y admin), beto (miembro), carla (de fuera). Código ABC123 -> g1.
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'groups/g1'), { name: 'G1', ownerId: 'ana', inviteCode: 'ABC123' });
    await setDoc(doc(db, 'groups/g1/members/ana'), { uid: 'ana', role: 'admin' });
    await setDoc(doc(db, 'groups/g1/members/beto'), { uid: 'beto', role: 'member' });
    await setDoc(doc(db, 'inviteCodes/ABC123'), { groupId: 'g1', createdBy: 'ana' });
    await setDoc(doc(db, 'groups/g1/picks/r01__beto'), { uid: 'beto', raceId: 'r01', pole: 'VER' });
    await setDoc(doc(db, 'f1/races/r01'), { name: 'Australia' });
  });
});

const as = (uid: string) => env.authenticatedContext(uid).firestore();
const anon = () => env.unauthenticatedContext().firestore();

describe('datos de F1', () => {
  it('sin sesión no se leen', () => assertFails(getDoc(doc(anon(), 'f1/races/r01'))));
  it('con sesión se leen', () => assertSucceeds(getDoc(doc(as('carla'), 'f1/races/r01'))));
  it('nadie escribe desde la app', () => assertFails(setDoc(doc(as('ana'), 'f1/races/r02'), { name: 'x' })));
});

describe('perfil y mis grupos', () => {
  it('uno escribe el suyo', () => assertSucceeds(setDoc(doc(as('ana'), 'users/ana'), { displayName: 'Ana' })));
  it('no escribe el de otro', () => assertFails(setDoc(doc(as('ana'), 'users/beto'), { displayName: 'x' })));
  it('escribe sus propias membresías', () => assertSucceeds(setDoc(doc(as('ana'), 'users/ana/memberships/g1'), { name: 'G1' })));
  it('no las de otro', () => assertFails(setDoc(doc(as('ana'), 'users/beto/memberships/g1'), { name: 'G1' })));
});

describe('crear un grupo', () => {
  const create = (db: ReturnType<typeof as>, uid: string, g: string, code: string) => {
    const b = writeBatch(db);
    b.set(doc(db, `groups/${g}`), { name: 'Nuevo', ownerId: uid, inviteCode: code });
    b.set(doc(db, `groups/${g}/members/${uid}`), { uid, role: 'admin' });
    b.set(doc(db, `inviteCodes/${code}`), { groupId: g, createdBy: uid });
    return b.commit();
  };
  it('lote completo: grupo + admin + código', () => assertSucceeds(create(as('carla'), 'carla', 'g2', 'ZZZ999')));
  it('no se puede reutilizar un código existente', () => assertFails(create(as('carla'), 'carla', 'g2', 'ABC123')));
  it('no se puede crear un grupo a nombre de otro', () =>
    assertFails(setDoc(doc(as('carla'), 'groups/g2'), { name: 'x', ownerId: 'ana' })));
  it('no se puede hacerse admin de un grupo ajeno', () =>
    assertFails(setDoc(doc(as('carla'), 'groups/g1/members/carla'), { uid: 'carla', role: 'admin' })));
});

describe('unirse con código', () => {
  it('un código válido da acceso como miembro', () =>
    assertSucceeds(setDoc(doc(as('carla'), 'groups/g1/members/carla'), { uid: 'carla', role: 'member', code: 'ABC123' })));
  it('un código de otro grupo no vale', () =>
    env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'inviteCodes/OTRO11'), { groupId: 'g9', createdBy: 'x' })).then(() =>
      assertFails(setDoc(doc(as('carla'), 'groups/g1/members/carla'), { uid: 'carla', role: 'member', code: 'OTRO11' })),
    ));
  it('un código inexistente no vale', () =>
    assertFails(setDoc(doc(as('carla'), 'groups/g1/members/carla'), { uid: 'carla', role: 'member', code: 'NOEXISTE' })));
  it('no se puede meter a otro', () =>
    assertFails(setDoc(doc(as('carla'), 'groups/g1/members/dani'), { uid: 'dani', role: 'member', code: 'ABC123' })));
  it('con un código no se entra como admin', () =>
    assertFails(setDoc(doc(as('carla'), 'groups/g1/members/carla'), { uid: 'carla', role: 'admin', code: 'ABC123' })));
  it('se puede consultar un código concreto', () => assertSucceeds(getDoc(doc(as('carla'), 'inviteCodes/ABC123'))));
});

describe('lectura y edición del grupo', () => {
  it('un miembro lee el grupo', () => assertSucceeds(getDoc(doc(as('beto'), 'groups/g1'))));
  it('quien no es miembro no lo lee', () => assertFails(getDoc(doc(as('carla'), 'groups/g1'))));
  it('un miembro ve a los demás miembros', () => assertSucceeds(getDoc(doc(as('beto'), 'groups/g1/members/ana'))));
  it('el admin edita las reglas', () => assertSucceeds(updateDoc(doc(as('ana'), 'groups/g1'), { rules: [] })));
  it('un miembro normal no edita', () => assertFails(updateDoc(doc(as('beto'), 'groups/g1'), { rules: [] })));
  it('nadie cambia al dueño', () => assertFails(updateDoc(doc(as('ana'), 'groups/g1'), { ownerId: 'beto' })));
  it('un miembro no puede hacerse admin', () => assertFails(updateDoc(doc(as('beto'), 'groups/g1/members/beto'), { role: 'admin' })));
  it('el admin asciende a un miembro', () => assertSucceeds(updateDoc(doc(as('ana'), 'groups/g1/members/beto'), { role: 'admin' })));
});

describe('salir y expulsar', () => {
  it('un miembro sale', () => assertSucceeds(deleteDoc(doc(as('beto'), 'groups/g1/members/beto'))));
  it('el admin expulsa', () => assertSucceeds(deleteDoc(doc(as('ana'), 'groups/g1/members/beto'))));
  it('un miembro no expulsa a otro', () => assertFails(deleteDoc(doc(as('beto'), 'groups/g1/members/ana'))));
  it('el dueño no puede salir', () => assertFails(deleteDoc(doc(as('ana'), 'groups/g1/members/ana'))));
});

describe('predicciones', () => {
  it('escribir la propia', () =>
    assertSucceeds(setDoc(doc(as('beto'), 'groups/g1/picks/r02__beto'), { uid: 'beto', raceId: 'r02', pole: 'HAM' })));
  it('no a nombre de otro', () =>
    assertFails(setDoc(doc(as('beto'), 'groups/g1/picks/r02__ana'), { uid: 'ana', raceId: 'r02', pole: 'HAM' })));
  it('el id debe coincidir con carrera y usuario', () =>
    assertFails(setDoc(doc(as('beto'), 'groups/g1/picks/otra'), { uid: 'beto', raceId: 'r02', pole: 'HAM' })));
  it('quien no es miembro no escribe', () =>
    assertFails(setDoc(doc(as('carla'), 'groups/g1/picks/r02__carla'), { uid: 'carla', raceId: 'r02', pole: 'HAM' })));
  it('lee la suya', () => assertSucceeds(getDoc(doc(as('beto'), 'groups/g1/picks/r01__beto'))));
  it('no lee la de otro antes del cierre', () => assertFails(getDoc(doc(as('ana'), 'groups/g1/picks/r01__beto'))));
});

describe('correcciones de resultados', () => {
  it('el admin escribe', () => assertSucceeds(setDoc(doc(as('ana'), 'groups/g1/overrides/r01'), { pole: 'NOR' })));
  it('un miembro normal no', () => assertFails(setDoc(doc(as('beto'), 'groups/g1/overrides/r01'), { pole: 'NOR' })));
  it('un miembro lee', () => assertSucceeds(getDoc(doc(as('beto'), 'groups/g1/overrides/r01'))));
});
