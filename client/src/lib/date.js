export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export function dateKeyAt(date = new Date(), timezone = DEFAULT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone || DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function dateFromKey(key) {
  return new Date(`${key}T12:00:00Z`);
}

export function dateKeyMonth(key) {
  return key.slice(0, 7);
}

export function shiftDateKey(key, amount) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + amount)).toISOString().slice(0, 10);
}
