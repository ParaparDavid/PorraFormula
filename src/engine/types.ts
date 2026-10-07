/** Predicción de un jugador para una carrera. IDs de piloto y escudería son cadenas ('' = vacío). */
export type Pick = {
  pole: string;
  team: string;
  top10: string[];
};

/** Resultado oficial de una carrera (lo carga la API o lo corrige el admin del grupo). */
export type RaceResult = {
  entered: boolean;
  pole: string;
  q1Out: string[];
  dnf: string[];
  top10: string[];
  bonusPos: number | null; // posición bonus sorteada (1-10)
  gafePos: number | null; // posición gafe sorteada (1-10)
};

type RuleBase = { id: string; enabled: boolean };

export type PoleCorrectRule = RuleBase & { type: 'pole_correct'; points: number };
export type PoleQ1OutRule = RuleBase & { type: 'pole_q1_out'; points: number };
export type PoleDnfRule = RuleBase & { type: 'pole_dnf'; points: number };
/** points[i] = puntos por acertar la posición i+1. La longitud fija cuántas posiciones puntúan. */
export type TopPositionsRule = RuleBase & { type: 'top_positions'; points: number[] };
export type BonusPositionRule = RuleBase & { type: 'bonus_position'; points: number };
export type GafePositionRule = RuleBase & { type: 'gafe_position'; points: number };
export type TeamBothFinishRule = RuleBase & { type: 'team_both_finish'; points: number };
export type TeamDnfRule = RuleBase & { type: 'team_dnf'; pointsPerCar: number };
export type BlankFieldRule = RuleBase & { type: 'blank_field'; points: number };

export type Rule =
  | PoleCorrectRule
  | PoleQ1OutRule
  | PoleDnfRule
  | TopPositionsRule
  | BonusPositionRule
  | GafePositionRule
  | TeamBothFinishRule
  | TeamDnfRule
  | BlankFieldRule;

export type RuleType = Rule['type'];

export type BreakdownItem = { ruleId: string; text: string; points: number };

export type ScoreResult = { total: number; breakdown: BreakdownItem[] };

/** Datos del mundo F1 que el motor necesita para escribir el desglose y comprobar escuderías. */
export type ScoringContext = {
  driverName: (driverId: string) => string;
  teamName: (teamId: string) => string;
  teamDrivers: (teamId: string) => string[];
};
