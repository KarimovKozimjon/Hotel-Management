const normalize = (value) => String(value ?? '').trim().toLowerCase();

export const ROOM_TYPE_KEYS = ['standard', 'deluxe', 'presidential'];

const AMENITY_KEYS = [
  'wifi',
  'tv',
  'airConditioning',
  'miniBar',
  'balcony',
  'kitchen',
  'jacuzzi',
];

const ROOM_TYPE_DEFAULT_AMENITIES = {
  standard: ['wifi', 'tv', 'airConditioning'],
  deluxe: ['wifi', 'tv', 'airConditioning', 'miniBar', 'balcony'],
  presidential: ['wifi', 'tv', 'airConditioning', 'miniBar', 'balcony', 'kitchen', 'jacuzzi'],
};

export function getRoomTypeKey(roomTypeOrName) {
  const rawName =
    typeof roomTypeOrName === 'object' && roomTypeOrName !== null
      ? roomTypeOrName.name
      : roomTypeOrName;

  const name = normalize(rawName);

  if (!name) return null;

  if (name === 'standard' || name === 'standard room') return 'standard';
  if (name === 'deluxe' || name === 'deluxe room') return 'deluxe';

  if (
    name === 'presidential' ||
    name === 'presidential suite' ||
    name === 'suite'
  ) {
    return 'presidential';
  }

  return null;
}

export function getRoomTypeLabel(roomTypeOrName, t) {
  const key = getRoomTypeKey(roomTypeOrName);
  const fallback =
    typeof roomTypeOrName === 'object' && roomTypeOrName !== null
      ? roomTypeOrName.name
      : String(roomTypeOrName ?? '');

  if (!key) return fallback;

  return t(`roomTypeNames.${key}`, {
    defaultValue: fallback || key,
  });
}

export function getRoomTypeDescription(roomTypeOrName, t) {
  const key = getRoomTypeKey(roomTypeOrName);
  const fallback =
    typeof roomTypeOrName === 'object' && roomTypeOrName !== null
      ? roomTypeOrName.description
      : '';

  if (!key) return fallback || '';

  return t(`roomTypeDescriptions.${key}`, {
    defaultValue: fallback || '',
  });
}

export function getAmenityKey(value) {
  const name = normalize(value);
  const raw = String(value ?? '').trim();
  if (!name) return null;

  if (name === 'wifi' || name === 'wi-fi' || name === 'wi fi') return 'wifi';
  if (name === 'tv' || name === 'television') return 'tv';
  if (
    name === 'air conditioning' ||
    name === 'aircondition' ||
    name === 'air conditioner' ||
    name === 'airconditioning' ||
    raw === 'airConditioning' ||
    name === 'ac'
  ) {
    return 'airConditioning';
  }
  if (name === 'mini bar' || name === 'minibar') return 'miniBar';
  if (name === 'balcony') return 'balcony';
  if (name === 'kitchen') return 'kitchen';
  if (name === 'jacuzzi') return 'jacuzzi';

  // If backend already sends a known key (case-sensitive camelCase)
  if (AMENITY_KEYS.includes(raw)) return raw;

  return null;
}

export function getAmenityLabel(value, t) {
  const key = getAmenityKey(value);
  const fallback = String(value ?? '').trim();

  if (!key) return fallback;

  return t(`amenities.${key}`, {
    defaultValue: fallback || key,
  });
}

export function getRoomTypeAmenities(roomTypeOrName, t) {
  const key = getRoomTypeKey(roomTypeOrName);
  const amenitiesRaw =
    typeof roomTypeOrName === 'object' && roomTypeOrName !== null
      ? roomTypeOrName.amenities
      : null;

  const amenityValues = Array.isArray(amenitiesRaw)
    ? amenitiesRaw
    : key
      ? ROOM_TYPE_DEFAULT_AMENITIES[key] || []
      : [];

  return amenityValues
    .map((a) => getAmenityLabel(a, t))
    .filter((a) => Boolean(String(a).trim()));
}
