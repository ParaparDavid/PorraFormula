/** Sin 0/O ni 1/I/L para que no se confundan al dictarlo o copiarlo. */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

export function generateCode(random: () => number = Math.random, length: number = CODE_LENGTH): string {
  let out = '';
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return out;
}

/** Acepta lo que pegue el usuario: minúsculas, espacios o guiones. */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidCode(code: string): boolean {
  return code.length === CODE_LENGTH && [...code].every((c) => CODE_ALPHABET.includes(c));
}
