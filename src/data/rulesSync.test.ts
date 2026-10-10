import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { closesLines } from './deadlines';
import { RACES } from './f1';

// Si cambias el calendario en f1.ts, ejecuta `npm run gen:rules` para actualizar firestore.rules.
describe('firestore.rules y calendario', () => {
  it('el mapa de cierres de las reglas coincide con el calendario', () => {
    const rules = readFileSync('firestore.rules', 'utf8');
    const m = rules.match(/\/\/ BEGIN CLOSES\r?\n([\s\S]*?)\r?\n\s*\/\/ END CLOSES/);
    expect(m).not.toBeNull();
    const inRules = m![1].split(/\r?\n/).map((l) => l.trim().replace(/,$/, ''));
    expect(inRules).toEqual(closesLines(RACES));
  });
});
