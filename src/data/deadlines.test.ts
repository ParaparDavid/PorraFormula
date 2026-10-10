import { describe, expect, it } from 'vitest';
import { RACES } from './f1';
import { closeInstant, closeLabel, isMadridDST, isOpen, nextOpenRace, thursdayOf } from './deadlines';

const iso = (ms: number) => new Date(ms).toISOString();

describe('jueves de la semana de la carrera', () => {
  it('domingo -> jueves anterior', () => expect(thursdayOf('2026-10-11')).toBe('2026-10-08'));
  it('sábado -> jueves anterior (Las Vegas)', () => expect(thursdayOf('2026-11-21')).toBe('2026-11-19'));
  it('viernes y jueves', () => {
    expect(thursdayOf('2026-11-20')).toBe('2026-11-19');
    expect(thursdayOf('2026-11-19')).toBe('2026-11-19');
  });
});

describe('horario de verano de España', () => {
  it('2026: del 29 mar al 25 oct', () => {
    expect(isMadridDST(Date.UTC(2026, 2, 29, 0, 59))).toBe(false);
    expect(isMadridDST(Date.UTC(2026, 2, 29, 1, 0))).toBe(true);
    expect(isMadridDST(Date.UTC(2026, 9, 25, 0, 59))).toBe(true);
    expect(isMadridDST(Date.UTC(2026, 9, 25, 1, 0))).toBe(false);
  });
});

describe('instante de cierre (viernes 00:00 hora de España)', () => {
  it('verano: Singapur 11 oct -> jueves 8 oct 23:59 CEST = 21:59:59 UTC', () => {
    expect(iso(closeInstant('2026-10-11'))).toBe('2026-10-08T22:00:00.000Z');
  });
  it('EEUU 25 oct (aún verano)', () => expect(iso(closeInstant('2026-10-25'))).toBe('2026-10-22T22:00:00.000Z'));
  it('México 1 nov: ya horario de invierno (CET = UTC+1)', () => {
    expect(iso(closeInstant('2026-11-01'))).toBe('2026-10-29T23:00:00.000Z');
  });
  it('Las Vegas (sábado) cierra el jueves anterior', () => expect(iso(closeInstant('2026-11-21'))).toBe('2026-11-19T23:00:00.000Z'));
  it('Australia 8 mar (invierno)', () => expect(iso(closeInstant('2026-03-08'))).toBe('2026-03-05T23:00:00.000Z'));
});

describe('abierta o cerrada', () => {
  const close = closeInstant('2026-10-11');
  it('un milisegundo antes está abierta', () => expect(isOpen('2026-10-11', close - 1)).toBe(true));
  it('en el instante de cierre ya no', () => expect(isOpen('2026-10-11', close)).toBe(false));
  it('el domingo de la carrera está cerrada', () => expect(isOpen('2026-10-11', Date.UTC(2026, 9, 11, 9))).toBe(false));
  it('la siguiente abierta tras cerrar Singapur es EEUU', () => {
    expect(nextOpenRace(RACES, Date.UTC(2026, 9, 10, 10))?.id).toBe('r17');
  });
  it('etiqueta legible', () => expect(closeLabel('2026-10-11')).toBe('jue 8 oct, 23:59'));
});
