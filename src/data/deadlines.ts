import type { Race } from './f1';

// Las predicciones de una carrera se cierran el jueves de su semana a las 23:59 (hora de España).
// Aquí se calcula como el instante exacto en que empieza el viernes en España, y se compara con
// "ahora" (< cierre = abierta). Solo usa sintaxis que Node puede ejecutar sin compilar (scripts/gen-rules.mts).

const DAY = 86_400_000;
const HOUR = 3_600_000;

/** Día del mes del último domingo de un mes (monthIdx 0-11). */
function lastSundayDay(year: number, monthIdx: number): number {
  const last = new Date(Date.UTC(year, monthIdx + 1, 0));
  return last.getUTCDate() - last.getUTCDay();
}

/** Horario de verano en España: del último domingo de marzo al último de octubre, a la 01:00 UTC. */
export function isMadridDST(utcMs: number): boolean {
  const y = new Date(utcMs).getUTCFullYear();
  const start = Date.UTC(y, 2, lastSundayDay(y, 2), 1);
  const end = Date.UTC(y, 9, lastSundayDay(y, 9), 1);
  return utcMs >= start && utcMs < end;
}

/** Fecha (AAAA-MM-DD) del jueves de la semana de la carrera: el jueves más reciente en o antes de la fecha. */
export function thursdayOf(raceDate: string): string {
  const [y, m, d] = raceDate.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d);
  const back = (new Date(t).getUTCDay() - 4 + 7) % 7;
  return new Date(t - back * DAY).toISOString().slice(0, 10);
}

/** Instante (ms UTC) en que se cierra: 00:00 del viernes en España. */
export function closeInstant(raceDate: string): number {
  const [y, m, d] = thursdayOf(raceDate).split('-').map(Number);
  const fridayMidnight = Date.UTC(y, m - 1, d + 1);
  // Los cambios de hora son en domingo, lejos del viernes, así que basta mirar este instante.
  return fridayMidnight - (isMadridDST(fridayMidnight) ? 2 : 1) * HOUR;
}

export function isOpen(raceDate: string, nowMs: number = Date.now()): boolean {
  return nowMs < closeInstant(raceDate);
}

/** Primera carrera con predicciones aún abiertas. */
export function nextOpenRace(races: Race[], nowMs: number = Date.now()): Race | undefined {
  return races.find((r) => isOpen(r.date, nowMs));
}

export function closeLabel(raceDate: string): string {
  const [y, m, d] = thursdayOf(raceDate).split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  void y;
  return `jue ${d} ${meses[m - 1]}, 23:59`;
}

/** Líneas del mapa de cierres que se pegan en firestore.rules (entre BEGIN CLOSES y END CLOSES). */
export function closesLines(races: Race[]): string[] {
  return races.map((r) => `'${r.id}': ${closeInstant(r.date)}`);
}
