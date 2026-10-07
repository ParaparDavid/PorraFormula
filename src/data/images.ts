import type { ImageSourcePropType } from 'react-native';

/**
 * Imágenes opcionales. Mientras estén vacías, la app dibuja avatares propios (siglas + color de escudería).
 * Para añadir una imagen de la que tengas derechos de uso: copia el archivo a `assets/` y añade una línea:
 *   NOR: require('../../assets/pilotos/NOR.png'),
 */
export const DRIVER_IMAGES: Record<string, ImageSourcePropType> = {};
export const TEAM_LOGOS: Record<string, ImageSourcePropType> = {};
