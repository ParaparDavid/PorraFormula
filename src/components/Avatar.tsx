import { Image, Text, View } from 'react-native';
import { driverById, teamById, teamColor } from '../data/f1';
import { DRIVER_IMAGES, TEAM_LOGOS } from '../data/images';

/** Negro o blanco según el brillo del fondo, para que se lea. */
function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 150 ? '#0b0d10' : '#ffffff';
}

export function DriverAvatar({ id, size = 48 }: { id: string; size?: number }) {
  const d = driverById(id);
  const color = d ? teamColor(d.team) : '#555555';
  const img = DRIVER_IMAGES[id];
  if (img) return <Image source={img} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: textOn(color), fontWeight: '800', fontSize: size * 0.3 }}>{id}</Text>
    </View>
  );
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}

export function TeamBadge({ id, size = 48 }: { id: string; size?: number }) {
  const t = teamById(id);
  const color = t?.color ?? '#555555';
  const img = TEAM_LOGOS[id];
  if (img) return <Image source={img} style={{ width: size, height: size, borderRadius: size * 0.22 }} resizeMode="contain" />;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.22, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: textOn(color), fontWeight: '800', fontSize: size * 0.34 }}>{initials(t?.name ?? '?')}</Text>
    </View>
  );
}
