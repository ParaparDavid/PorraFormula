import type { Rule } from './types';

/** Las reglas de "Porra F1 5 Sentidos 2026", tal cual. */
export const CLASSIC_5_SENTIDOS: Rule[] = [
  { id: 'pole_hit', type: 'pole_correct', enabled: true, points: 3 },
  { id: 'pole_q1_out', type: 'pole_q1_out', enabled: true, points: -1 },
  { id: 'pole_dnf', type: 'pole_dnf', enabled: true, points: -3 },
  { id: 'top10', type: 'top_positions', enabled: true, points: [10, 6, 4, 1, 1, 1, 1, 1, 1, 1] },
  { id: 'bonus_pos', type: 'bonus_position', enabled: true, points: 5 },
  { id: 'gafe_pos', type: 'gafe_position', enabled: true, points: -3 },
  { id: 'team_both_finish', type: 'team_both_finish', enabled: true, points: 1 },
  { id: 'team_dnf', type: 'team_dnf', enabled: true, pointsPerCar: -2 },
  { id: 'blank', type: 'blank_field', enabled: true, points: -3 },
];

/** Solo pole y top 10. */
export const SIMPLE: Rule[] = [
  { id: 'pole_hit', type: 'pole_correct', enabled: true, points: 3 },
  { id: 'top10', type: 'top_positions', enabled: true, points: [10, 6, 4, 1, 1, 1, 1, 1, 1, 1] },
];

export const BLANK: Rule[] = [];

export const TEMPLATES = {
  classic: { name: 'Clásica 5 Sentidos', rules: CLASSIC_5_SENTIDOS },
  simple: { name: 'Simple', rules: SIMPLE },
  blank: { name: 'En blanco', rules: BLANK },
} as const;

export type TemplateKey = keyof typeof TEMPLATES;

/** Copia profunda para que editar las reglas de un grupo no toque la plantilla. */
export function rulesFromTemplate(key: TemplateKey): Rule[] {
  return JSON.parse(JSON.stringify(TEMPLATES[key].rules)) as Rule[];
}
