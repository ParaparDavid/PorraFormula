import type {
  BreakdownItem,
  Pick,
  RaceResult,
  Rule,
  RuleType,
  ScoreResult,
  ScoringContext,
  TopPositionsRule,
} from './types';

export const emptyPick = (): Pick => ({ pole: '', team: '', top10: Array(10).fill('') });

export const emptyResult = (): RaceResult => ({
  entered: false,
  pole: '',
  q1Out: [],
  dnf: [],
  top10: Array(10).fill(''),
  bonusPos: null,
  gafePos: null,
});

/** Primera regla activa de un tipo, o undefined. */
function active<T extends RuleType>(rules: Rule[], type: T): Extract<Rule, { type: T }> | undefined {
  return rules.find((r) => r.enabled && r.type === type) as Extract<Rule, { type: T }> | undefined;
}

/**
 * Puntúa la predicción de un jugador con las reglas de su grupo.
 * Devuelve null si la carrera aún no tiene resultado. Mismo comportamiento que la web actual:
 *  - pole: acierto, si no pasó Q1, y si no acabó la carrera (solo cuenta la primera que se cumpla)
 *  - escudería: +1 si ambos acaban, -2 por coche que no acaba
 *  - top 10: puntos por posición exacta; bonus/gafe solo cuando esa posición se acierta
 *  - campo vacío: penalización
 */
export function scorePick(
  pick: Pick | null | undefined,
  result: RaceResult | null | undefined,
  rules: Rule[],
  ctx: ScoringContext,
): ScoreResult | null {
  if (!result || !result.entered) return null;
  const p: Pick = pick ?? { pole: '', team: '', top10: [] };
  const breakdown: BreakdownItem[] = [];
  const add = (ruleId: string, text: string, points: number) => {
    if (points !== 0) breakdown.push({ ruleId, text, points });
  };
  const blank = active(rules, 'blank_field');

  // Pole
  if (!p.pole) {
    if (blank) add(blank.id, 'Pole vacía', blank.points);
  } else if (p.pole === result.pole) {
    const r = active(rules, 'pole_correct');
    if (r) add(r.id, `Acertó la pole (${ctx.driverName(p.pole)})`, r.points);
  } else {
    const q1 = active(rules, 'pole_q1_out');
    const dnf = active(rules, 'pole_dnf');
    if (q1 && result.q1Out.includes(p.pole)) {
      add(q1.id, `${ctx.driverName(p.pole)} no pasó de Q1`, q1.points);
    } else if (dnf && result.dnf.includes(p.pole)) {
      add(dnf.id, `${ctx.driverName(p.pole)} no acabó la carrera`, dnf.points);
    }
  }

  // Escudería
  if (!p.team) {
    if (blank) add(blank.id, 'Escudería vacía', blank.points);
  } else {
    const dnfCount = ctx.teamDrivers(p.team).filter((d) => result.dnf.includes(d)).length;
    if (dnfCount === 0) {
      const r = active(rules, 'team_both_finish');
      if (r) add(r.id, `${ctx.teamName(p.team)}: los 2 coches acabaron`, r.points);
    } else {
      const r = active(rules, 'team_dnf');
      if (r) add(r.id, `${ctx.teamName(p.team)}: ${dnfCount} coche(s) no acabaron`, r.pointsPerCar * dnfCount);
    }
  }

  // Top N
  const top: TopPositionsRule | undefined = active(rules, 'top_positions');
  const places = top ? top.points.length : 10;
  const bonus = active(rules, 'bonus_position');
  const gafe = active(rules, 'gafe_position');
  for (let i = 0; i < places; i++) {
    const predicted = p.top10[i];
    if (!predicted) {
      if (blank) add(blank.id, `Posición ${i + 1} vacía`, blank.points);
      continue;
    }
    const actual = result.top10[i];
    if (actual && predicted === actual) {
      if (top) add(top.id, `Acertó P${i + 1} (${ctx.driverName(predicted)})`, top.points[i]);
      if (bonus && result.bonusPos === i + 1) add(bonus.id, `¡Posición bonus! P${i + 1}`, bonus.points);
      if (gafe && result.gafePos === i + 1) add(gafe.id, `Posición gafe P${i + 1}`, gafe.points);
    }
  }

  return { total: breakdown.reduce((s, b) => s + b.points, 0), breakdown };
}

export type RaceForStandings = {
  id: string;
  result: RaceResult | null | undefined;
  picks: Record<string, Pick | undefined>; // memberId -> predicción
  /** Reglas con las que se puntúa ESTA carrera (permite cambiar reglas a mitad de temporada). */
  rules: Rule[];
};

export type StandingRow = {
  memberId: string;
  total: number;
  racesScored: number;
  perRace: Record<string, number>;
};

/** Clasificación general. Quien no tiene predicción en una carrera no suma ni resta en ella. */
export function computeStandings(
  memberIds: string[],
  races: RaceForStandings[],
  ctx: ScoringContext,
): StandingRow[] {
  const rows: Record<string, StandingRow> = {};
  for (const id of memberIds) rows[id] = { memberId: id, total: 0, racesScored: 0, perRace: {} };
  for (const race of races) {
    if (!race.result?.entered) continue;
    for (const id of memberIds) {
      const pick = race.picks[id];
      if (!pick) continue;
      const s = scorePick(pick, race.result, race.rules, ctx);
      if (!s) continue;
      rows[id].total += s.total;
      rows[id].racesScored += 1;
      rows[id].perRace[race.id] = s.total;
    }
  }
  return Object.values(rows).sort((a, b) => b.total - a.total);
}
