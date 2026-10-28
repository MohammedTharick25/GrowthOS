export function dateKeyAt(date = new Date(), timezone = 'Asia/Kolkata') {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}
export function localTimeAt(date = new Date(), timezone = 'Asia/Kolkata') {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.hour}:${values.minute}`;
}
export function shiftDateKey(key, amount) { const [year, month, day] = key.split('-').map(Number); const date = new Date(Date.UTC(year, month - 1, day + amount)); return date.toISOString().slice(0, 10); }
export function weekKeyForDateKey(key) { const day = new Date(`${key}T00:00:00Z`).getUTCDay(); return shiftDateKey(key, -((day + 6) % 7)); }
export function weekKeyAt(date = new Date(), timezone = 'Asia/Kolkata') { return weekKeyForDateKey(dateKeyAt(date, timezone)); }
export function validDateKey(key) { return /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(Date.parse(`${key}T00:00:00Z`)); }
