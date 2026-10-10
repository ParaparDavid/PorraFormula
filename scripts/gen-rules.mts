// Actualiza en firestore.rules el mapa de cierres de predicciones a partir del calendario.
// Uso: npm run gen:rules   (necesita Node 22.18 o superior)
import { readFileSync, writeFileSync } from 'node:fs';
import { closesLines } from '../src/data/deadlines.ts';
import { RACES } from '../src/data/f1.ts';

const path = new URL('../firestore.rules', import.meta.url);
const src = readFileSync(path, 'utf8');
const re = /(\/\/ BEGIN CLOSES\r?\n)[\s\S]*?(\r?\n\s*\/\/ END CLOSES)/;
if (!re.test(src)) throw new Error('No encuentro BEGIN CLOSES / END CLOSES en firestore.rules');
const body = closesLines(RACES).map((l) => `        ${l}`).join(',\n');
writeFileSync(path, src.replace(re, `$1${body}$2`));
console.log(`firestore.rules actualizado con ${closesLines(RACES).length} cierres.`);
