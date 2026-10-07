import { describe, expect, it } from 'vitest';
import { CODE_ALPHABET, CODE_LENGTH, generateCode, isValidCode, normalizeCode } from './inviteCode';

describe('códigos de invitación', () => {
  it('genera códigos de 6 caracteres del alfabeto permitido', () => {
    for (let i = 0; i < 200; i++) {
      const c = generateCode();
      expect(c).toHaveLength(CODE_LENGTH);
      expect(isValidCode(c)).toBe(true);
    }
  });
  it('el alfabeto no tiene caracteres confusos', () => {
    for (const bad of ['0', 'O', '1', 'I', 'L']) expect(CODE_ALPHABET).not.toContain(bad);
  });
  it('es determinista con un generador fijo', () => {
    expect(generateCode(() => 0)).toBe('AAAAAA');
  });
  it('normaliza lo que escribe el usuario', () => {
    expect(normalizeCode(' ab c-123 ')).toBe('ABC123');
  });
  it('rechaza códigos mal formados', () => {
    expect(isValidCode('ABC12')).toBe(false);
    expect(isValidCode('ABC10O')).toBe(false);
  });
});
