export const ZONE = 'Europe/Warsaw';
export const dayKey = ms => new Intl.DateTimeFormat('en-CA', {timeZone:ZONE, year:'numeric', month:'2-digit', day:'2-digit'}).format(ms);
export const timeLabel = ms => new Intl.DateTimeFormat('pl-PL', {timeZone:ZONE, hour:'2-digit', minute:'2-digit', hourCycle:'h23'}).format(ms);
export const dateLabel = (ms, options) => new Intl.DateTimeFormat('pl-PL', {timeZone:ZONE, ...options}).format(ms);
export const HOUR = 3600000;
export function components(speed, direction, heading = 290) {
  const angle = (direction - heading) * Math.PI / 180;
  return {head: speed * Math.cos(angle), cross: Math.abs(speed * Math.sin(angle))};
}
export function rawRunway(row) {
  if (![row.speed, row.direction, row.gust].every(Number.isFinite) || row.speed < 0 || row.gust < 0 || row.direction < 0 || row.direction > 360) return null;
  const {head} = components(row.speed, row.direction);
  if (row.speed < 3 || Math.abs(head) < 2) return 'neutral';
  return head > 0 ? '29' : '11';
}
export function stabilize(rows) {
  let active = null, candidate = null, streak = 0, previous = null;
  return rows.map(row => {
    const raw = rawRunway(row);
    if (previous !== null && row.time - previous !== HOUR) {active = null; candidate = null; streak = 0;}
    previous = row.time;
    if (raw === null) {active = null; candidate = null; streak = 0;}
    else if (active === null) {active = raw; candidate = null; streak = 0;}
    else if (raw === active) {candidate = null; streak = 0;}
    else {
      if (candidate === raw) streak++; else {candidate = raw; streak = 1;}
      if (streak >= 2) {active = raw; candidate = null; streak = 0;}
    }
    return {...row, raw, runway:active};
  });
}
export function parseWeather(data) {
  const h = data.hourly;
  if (data.hourly_units?.wind_speed_10m !== 'kn' || data.hourly_units?.wind_gusts_10m !== 'kn' || data.hourly_units?.time !== 'unixtime') throw new Error('Nieprawidłowe jednostki danych.');
  const fields = ['time','wind_speed_10m','wind_direction_10m','wind_gusts_10m'];
  if (!h || !fields.every(f => Array.isArray(h[f]) && h[f].length === h.time.length) || h.time.length < 24) throw new Error('Niepełna prognoza.');
  const rows = h.time.map((t,i) => ({time:t*1000, speed:h.wind_speed_10m[i], direction:h.wind_direction_10m[i], gust:h.wind_gusts_10m[i]}));
  if (!rows.every((r,i) => Number.isFinite(r.time) && (!i || r.time - rows[i-1].time === HOUR))) throw new Error('Nieprawidłowa oś czasu.');
  if (!rows.some(r => rawRunway(r) !== null)) throw new Error('Brak poprawnych danych wiatru.');
  return stabilize(rows);
}
export function periodsForDay(rows, key, now) {
  const day = rows.filter(r => dayKey(r.time) === key);
  if (!day.length) return [];
  const start = key === dayKey(now) ? now : day[0].time;
  const end = day.at(-1).time + HOUR;
  const slots = day.filter(r => r.time + HOUR > start);
  const periods = [];
  for (const row of slots) {
    const a = Math.max(start,row.time), b = Math.min(end,row.time + HOUR);
    if (b <= a) continue;
    const last = periods.at(-1);
    if (last && last.runway === row.runway && last.end === a) last.end = b;
    else periods.push({start:a,end:b,runway:row.runway,row});
  }
  return periods;
}
export function countFlights(flights, period) {
  return period ? flights.filter(f => !f.cancelled && f.time >= period.start && f.time < period.end).length : 0;
}
export function demoWeather(now) {
  // UTC hourly epochs preserve DST and timezone behavior.
  const start = Math.floor((now - 24*HOUR)/HOUR)*HOUR;
  return stabilize(Array.from({length:9*24}, (_,i) => {
    const time = start+i*HOUR;
    const hour = Number(dateLabel(time,{hour:'2-digit',hourCycle:'h23'}));
    return {time,speed:hour<7?2:8+Math.sin(i/5)*4,direction:hour<15?270:90,gust:15+Math.sin(i/5)*5};
  }));
}
export function demoFlights(rows, key) {
  const day = rows.filter(r=>dayKey(r.time)===key);
  const cities = ['Warszawa','Frankfurt','Londyn','Amsterdam','Oslo','Monachium'];
  return day.filter((_,i)=>i>=6 && i%2===0).map((r,i)=>({time:r.time+20*60000,city:cities[i%cities.length],flight:'DEMO'+String(i+1).padStart(2,'0'),cancelled:false}));
}
