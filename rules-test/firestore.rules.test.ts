import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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

// Grupo "g1": ana (dueña y admin), beto (miembro), carla (de fuera).
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'groups/g1'), { name: 'G1', ownerId: 'ana', adminIds: ['ana'], memberIds: ['ana', 'beto'] });
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

describe('perfil', () => {
  it('uno escribe el suyo', () => assertSucceeds(setDoc(doc(as('ana'), 'users/ana'), { displayName: 'Ana' })));
  it('no escribe el de otro', () => assertFails(setDoc(doc(as('ana'), 'users/beto'), { displayName: 'x' })));
});

describe('grupos', () => {
  it('crear un grupo siendo el único miembro y admin', () =>
    assertSucceeds(setDoc(doc(as('carla'), 'groups/g2'), { name: 'G2', ownerId: 'carla', adminIds: ['carla'], memberIds: ['carla'] })));
  it('no se puede crear metiendo a otros', () =>
    assertFails(setDoc(doc(as('carla'), 'groups/g2'), { name: 'G2', ownerId: 'carla', adminIds: ['carla'], memberIds: ['carla', 'ana'] })));
  it('no se puede crear a nombre de otro', () =>
    assertFails(setDoc(doc(as('carla'), 'groups/g2'), { name: 'G2', ownerId: 'ana', adminIds: ['carla'], memberIds: ['carla'] })));
  it('un miembro lee el grupo', () => assertSucceeds(getDoc(doc(as('beto'), 'groups/g1'))));
  it('quien no es miembro no lo lee', () => assertFails(getDoc(doc(as('carla'), 'groups/g1'))));
  it('el admin edita las reglas', () => assertSucceeds(updateDoc(doc(as('ana'), 'groups/g1'), { rules: [] })));
  it('un miembro normal no edita', () => assertFails(updateDoc(doc(as('beto'), 'groups/g1'), { rules: [] })));
  it('un miembro no puede hacerse admin', () => assertFails(updateDoc(doc(as('beto'), 'groups/g1'), { adminIds: ['ana', 'beto'] })));
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
