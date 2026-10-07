import type { ScoringContext } from '../engine';

export type Team = { id: string; name: string; color: string };
export type Driver = { id: string; name: string; team: string };
export type Race = { id: string; name: string; date: string; month: string };

export const TEAMS: Team[] = [
  { id: 'mclaren', name: 'McLaren', color: '#FF8700' },
  { id: 'ferrari', name: 'Ferrari', color: '#E80020' },
  { id: 'redbull', name: 'Red Bull', color: '#4781D7' },
  { id: 'mercedes', name: 'Mercedes', color: '#00D7B6' },
  { id: 'astonmartin', name: 'Aston Martin', color: '#229971' },
  { id: 'alpine', name: 'Alpine', color: '#FF87BC' },
  { id: 'williams', name: 'Williams', color: '#1868DB' },
  { id: 'haas', name: 'Haas', color: '#B6BABD' },
  { id: 'racingbulls', name: 'Racing Bulls', color: '#6C98FF' },
  { id: 'audi', name: 'Audi', color: '#B0323C' },
  { id: 'cadillac', name: 'Cadillac', color: '#C7A252' },
  { id: 'otros', name: 'Otros / Sin escudería activa', color: '#555555' },
];

export const DRIVERS: Driver[] = [
  { id: 'NOR', name: 'Lando Norris', team: 'mclaren' },
  { id: 'PIA', name: 'Oscar Piastri', team: 'mclaren' },
  { id: 'LEC', name: 'Charles Leclerc', team: 'ferrari' },
  { id: 'HAM', name: 'Lewis Hamilton', team: 'ferrari' },
  { id: 'VER', name: 'Max Verstappen', team: 'redbull' },
  { id: 'HAD', name: 'Isack Hadjar', team: 'redbull' },
  { id: 'RUS', name: 'George Russell', team: 'mercedes' },
  { id: 'ANT', name: 'Kimi Antonelli', team: 'mercedes' },
  { id: 'ALO', name: 'Fernando Alonso', team: 'astonmartin' },
  { id: 'STR', name: 'Lance Stroll', team: 'astonmartin' },
  { id: 'GAS', name: 'Pierre Gasly', team: 'alpine' },
  { id: 'COL', name: 'Franco Colapinto', team: 'alpine' },
  { id: 'ALB', name: 'Alex Albon', team: 'williams' },
  { id: 'SAI', name: 'Carlos Sainz', team: 'williams' },
  { id: 'OCO', name: 'Esteban Ocon', team: 'haas' },
  { id: 'BEA', name: 'Oliver Bearman', team: 'haas' },
  { id: 'LAW', name: 'Liam Lawson', team: 'racingbulls' },
  { id: 'LIN', name: 'Arvid Lindblad', team: 'racingbulls' },
  { id: 'HUL', name: 'Nico Hülkenberg', team: 'audi' },
  { id: 'BOR', name: 'Gabriel Bortoleto', team: 'audi' },
  { id: 'PER', name: 'Sergio Pérez', team: 'cadillac' },
  { id: 'BOT', name: 'Valtteri Bottas', team: 'cadillac' },
  { id: 'TSU', name: 'Yuki Tsunoda', team: 'otros' },
];

export const RACES: Race[] = [
  { id: 'r01', name: 'Australia', date: '2026-03-08', month: 'Marzo' },
  { id: 'r02', name: 'China', date: '2026-03-15', month: 'Marzo' },
  { id: 'r03', name: 'Japón', date: '2026-03-29', month: 'Marzo' },
  { id: 'r04', name: 'Miami', date: '2026-05-03', month: 'Mayo' },
  { id: 'r05', name: 'Canadá', date: '2026-05-24', month: 'Mayo' },
  { id: 'r06', name: 'Mónaco', date: '2026-06-07', month: 'Junio' },
  { id: 'r07', name: 'España (Barcelona)', date: '2026-06-14', month: 'Junio' },
  { id: 'r08', name: 'Austria', date: '2026-06-28', month: 'Junio' },
  { id: 'r09', name: 'Gran Bretaña', date: '2026-07-05', month: 'Julio' },
  { id: 'r10', name: 'Bélgica', date: '2026-07-19', month: 'Julio' },
  { id: 'r11', name: 'Hungría', date: '2026-07-26', month: 'Julio' },
  { id: 'r12', name: 'Países Bajos', date: '2026-08-23', month: 'Agosto' },
  { id: 'r13', name: 'Italia', date: '2026-09-06', month: 'Septiembre' },
  { id: 'r14', name: 'España (Madrid)', date: '2026-09-13', month: 'Septiembre' },
  { id: 'r15', name: 'Azerbaiyán', date: '2026-09-26', month: 'Septiembre' },
  { id: 'r16', name: 'Singapur', date: '2026-10-11', month: 'Octubre' },
  { id: 'r17', name: 'Estados Unidos', date: '2026-10-25', month: 'Octubre' },
  { id: 'r18', name: 'Ciudad de México', date: '2026-11-01', month: 'Noviembre' },
  { id: 'r19', name: 'São Paulo', date: '2026-11-08', month: 'Noviembre' },
  { id: 'r20', name: 'Las Vegas', date: '2026-11-21', month: 'Noviembre' },
  { id: 'r21', name: 'Catar', date: '2026-11-29', month: 'Noviembre' },
  { id: 'r22', name: 'Abu Dabi', date: '2026-12-06', month: 'Diciembre' },
];

export const driverById = (id: string) => DRIVERS.find((d) => d.id === id);
export const teamById = (id: string) => TEAMS.find((t) => t.id === id);
export const raceById = (id: string) => RACES.find((r) => r.id === id);
export const driverName = (id: string) => driverById(id)?.name ?? '—';
export const teamName = (id: string) => teamById(id)?.name ?? '—';
export const teamColor = (id: string) => teamById(id)?.color ?? '#555555';
export const driversOfTeam = (teamId: string) => DRIVERS.filter((d) => d.team === teamId);

/** Hoy en formato AAAA-MM-DD (hora local). */
export function todayISO(now: Date = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

/** Primera carrera cuya fecha no ha pasado. */
export function nextRace(today: string = todayISO()): Race | undefined {
  return RACES.find((r) => r.date >= today);
}

/** Días hasta una fecha AAAA-MM-DD (0 = hoy). */
export function daysUntil(date: string, today: string = todayISO()): number {
  const a = Date.parse(`${today}T00:00:00Z`);
  const b = Date.parse(`${date}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${meses[m - 1]} ${y}`;
}

export const scoringContext: ScoringContext = {
  driverName,
  teamName,
  teamDrivers: (teamId) => driversOfTeam(teamId).map((d) => d.id),
};
