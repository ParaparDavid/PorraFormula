import { describe, expect, it } from 'vitest';
import { CLASSIC_5_SENTIDOS, computeStandings, emptyPick, emptyResult, scorePick } from './index';
import type { Pick, RaceResult, Rule, ScoringContext } from './index';

const ctx: ScoringContext = {
  driverName: (id) => id,
  teamName: (id) => id,
  teamDrivers: (t) => (t === 'MCL' ? ['NOR', 'PIA'] : ['VER', 'LAW']),
};

const TOP = ['VER', 'NOR', 'PIA', 'LEC', 'HAM', 'RUS', 'ALO', 'SAI', 'GAS', 'TSU'];

const result = (over: Partial<RaceResult> = {}): RaceResult => ({
  ...emptyResult(),
  entered: true,
  pole: 'VER',
  top10: [...TOP],
  ...over,
});
const pick = (over: Partial<Pick> = {}): Pick => ({ pole: 'VER', team: 'MCL', top10: [...TOP], ...over });
const total = (p: Pick | null, r: RaceResult | null, rules: Rule[] = CLASSIC_5_SENTIDOS) =>
  scorePick(p, r, rules, ctx)?.total;

describe('scorePick (reglas clásicas)', () => {
  it('devuelve null si la carrera no tiene resultado', () => {
    expect(scorePick(pick(), result({ entered: false }), CLASSIC_5_SENTIDOS, ctx)).toBeNull();
    expect(scorePick(pick(), null, CLASSIC_5_SENTIDOS, ctx)).toBeNull();
  });

  it('predicción perfecta: pole 3 + escudería 1 + top10 (10+6+4+7)', () => {
    expect(total(pick(), result())).toBe(3 + 1 + 27);
  });

  it('ejemplo con aciertos parciales', () => {
    const p = pick({ top10: ['VER', 'NOR', 'HAM', 'LEC', 'PIA', 'RUS', 'ALO', 'SAI', 'GAS', 'TSU'] });
    // pole 3 + escudería 1 + P1 10 + P2 6 + P4..P10 (7 aciertos de 1) - P3 y P5 fallan
    // aciertos: P1,P2,P4,P6,P7,P8,P9,P10 => 10+6+1+1+1+1+1+1 = 22
    expect(total(p, result())).toBe(3 + 1 + 22);
  });

  it('posición bonus suma 5 solo si se acierta esa posición', () => {
    expect(total(pick(), result({ bonusPos: 2 }))).toBe(31 + 5);
    const fallo = pick({ top10: ['VER', 'HAM', 'PIA', 'LEC', 'HAM', 'RUS', 'ALO', 'SAI', 'GAS', 'TSU'] });
    expect(total(fallo, result({ bonusPos: 2 }))).toBe(total(fallo, result()));
  });

  it('posición gafe resta 3 solo si se acierta esa posición', () => {
    expect(total(pick(), result({ gafePos: 4 }))).toBe(31 - 3);
  });

  describe('pole', () => {
    it('no pasó Q1: -1', () => {
      expect(total(pick({ pole: 'HAM' }), result({ q1Out: ['HAM'] }))).toBe(1 + 27 - 1);
    });
    it('no acabó la carrera: -3', () => {
      expect(total(pick({ pole: 'HAM' }), result({ dnf: ['HAM'] }))).toBe(1 + 27 - 3);
    });
    it('Q1 y DNF a la vez solo cuenta Q1 (como la web actual)', () => {
      expect(total(pick({ pole: 'HAM' }), result({ q1Out: ['HAM'], dnf: ['HAM'] }))).toBe(1 + 27 - 1);
    });
    it('pole fallada sin más: 0', () => {
      expect(total(pick({ pole: 'HAM' }), result())).toBe(1 + 27);
    });
    it('vacía: -3', () => {
      expect(total(pick({ pole: '' }), result())).toBe(1 + 27 - 3);
    });
  });

  describe('escudería', () => {
    it('un coche no acaba: -2', () => {
      expect(total(pick(), result({ dnf: ['NOR'] }))).toBe(3 + 27 - 2);
    });
    it('dos coches no acaban: -4', () => {
      expect(total(pick(), result({ dnf: ['NOR', 'PIA'] }))).toBe(3 + 27 - 4);
    });
    it('vacía: -3', () => {
      expect(total(pick({ team: '' }), result())).toBe(3 + 27 - 3);
    });
  });

  it('cada posición vacía del top 10 resta 3', () => {
    const p = pick({ top10: [...TOP.slice(0, 8), '', ''] });
    // pierde P9 y P10 (1+1) y resta 3+3
    expect(total(p, result())).toBe(31 - 2 - 6);
  });

  it('sin predicción: todo vacío (1 pole + 1 escudería + 10 posiciones)', () => {
    expect(total(null, result())).toBe(-3 * 12);
    expect(total(emptyPick(), result())).toBe(-3 * 12);
  });
});

describe('reglas editables', () => {
  it('una regla desactivada no puntúa', () => {
    const rules = CLASSIC_5_SENTIDOS.map((r) => (r.id === 'pole_hit' ? { ...r, enabled: false } : r));
    expect(total(pick(), result(), rules)).toBe(28);
  });

  it('cambiar los puntos de una regla', () => {
    const rules = CLASSIC_5_SENTIDOS.map((r) => (r.id === 'pole_hit' && r.type === 'pole_correct' ? { ...r, points: 10 } : r));
    expect(total(pick(), result(), rules)).toBe(10 + 1 + 27);
  });

  it('top 5 en vez de top 10 (la longitud del array fija las posiciones)', () => {
    const rules = CLASSIC_5_SENTIDOS.map((r) =>
      r.type === 'top_positions' ? { ...r, points: [10, 6, 4, 2, 1] } : r,
    );
    expect(total(pick(), result(), rules)).toBe(3 + 1 + 23);
  });

  it('sin reglas: todo vale 0', () => {
    expect(total(pick(), result(), [])).toBe(0);
  });

  it('el desglose etiqueta cada punto con la regla que lo originó', () => {
    const s = scorePick(pick(), result(), CLASSIC_5_SENTIDOS, ctx)!;
    expect(s.breakdown[0]).toEqual({ ruleId: 'pole_hit', text: 'Acertó la pole (VER)', points: 3 });
    expect(s.breakdown.reduce((a, b) => a + b.points, 0)).toBe(s.total);
  });
});

describe('computeStandings', () => {
  const races = [
    { id: 'r01', result: result(), picks: { a: pick(), b: pick({ pole: 'HAM' }) }, rules: CLASSIC_5_SENTIDOS },
    // b no participa en r02: ni suma ni resta
    { id: 'r02', result: result(), picks: { a: pick() }, rules: CLASSIC_5_SENTIDOS },
    // carrera sin resultado: se ignora
    { id: 'r03', result: result({ entered: false }), picks: { a: pick() }, rules: CLASSIC_5_SENTIDOS },
  ];

  it('ordena por puntos y cuenta solo las carreras jugadas', () => {
    const s = computeStandings(['a', 'b'], races, ctx);
    expect(s.map((r) => r.memberId)).toEqual(['a', 'b']);
    expect(s[0]).toMatchObject({ memberId: 'a', total: 62, racesScored: 2 });
    expect(s[1]).toMatchObject({ memberId: 'b', total: 28, racesScored: 1 });
  });

  it('cada carrera usa sus propias reglas (versionado)', () => {
    const rules2 = CLASSIC_5_SENTIDOS.map((r) => (r.id === 'pole_hit' && r.type === 'pole_correct' ? { ...r, points: 0 } : r));
    const s = computeStandings(['a'], [{ ...races[0], rules: rules2 }, races[1]], ctx);
    expect(s[0].perRace).toEqual({ r01: 28, r02: 31 });
  });
});
