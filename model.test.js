import test from 'node:test';
import assert from 'node:assert/strict';
import {HOUR,dayKey,timeLabel,rawRunway,stabilize,periodsForDay,countFlights,parseWeather} from './model.js';
const start=Date.parse('2026-10-09T00:00:00+02:00');
const row=(i,direction=290,speed=10)=>({time:start+i*HOUR,direction,speed,gust:15});
test('headwind chooses 29 or 11; calm and near crosswind are neutral',()=>{
 assert.equal(rawRunway(row(0)), '29');assert.equal(rawRunway(row(0,110)),'11');
 assert.equal(rawRunway(row(0,290,2)),'neutral');assert.equal(rawRunway(row(0,20)),'neutral');
 assert.equal(rawRunway({...row(0),speed:null}),null);
 assert.equal(rawRunway({...row(0),direction:361}),null);
});
test('single-hour reversal is ignored; two hours confirm without backdating',()=>{
 const result=stabilize([row(0),row(1,110),row(2),row(3,110),row(4,110)]);
 assert.deepEqual(result.map(r=>r.runway),['29','29','29','29','11']);
});
test('calm changes are stabilized too; gaps reset state',()=>{
 assert.deepEqual(stabilize([row(0),row(1,290,1),row(2,290,1)]).map(r=>r.runway),['29','29','neutral']);
 assert.deepEqual(stabilize([row(0),{...row(1),speed:null},row(2,110)]).map(r=>r.runway),['29',null,'11']);
 assert.deepEqual(stabilize([row(0),row(2,110)]).map(r=>r.runway),['29','11']);
});
test('today starts at exact current minute and clips at change',()=>{
 const now=start+8*HOUR+37*60000;
 const rows=stabilize(Array.from({length:24},(_,i)=>row(i,i>=10?110:290)));
 const periods=periodsForDay(rows,'2026-10-09',now);
 assert.equal(periods[0].start,now);assert.equal(periods[0].end,start+11*HOUR);
 assert.equal(periods[1].end,start+24*HOUR);
});
test('future day starts at midnight; a last-hour reversal stays unconfirmed',()=>{
 const rows=stabilize(Array.from({length:24},(_,i)=>row(i,i===23?110:290)));
 const p=periodsForDay(rows,'2026-10-09',start-HOUR);
 assert.equal(p.length,1);assert.equal(p[0].start,start);assert.equal(p[0].end,start+24*HOUR);
});
test('flight boundaries use [start,end), exclude cancellations',()=>{
 const p={start:100,end:200};
 assert.equal(countFlights([{time:99},{time:100},{time:199},{time:200},{time:150,cancelled:true}],p),2);
});
test('Warsaw dates do not depend on device timezone',()=>{
 assert.equal(dayKey(Date.parse('2026-10-08T22:15:00Z')),'2026-10-09');
 assert.equal(timeLabel(Date.parse('2026-10-08T22:15:00Z')),'00:15');
});
test('DST days contain 23 or 25 real hours and end at local midnight',()=>{
 for(const [a,b,key,hours] of [
 ['2026-03-29T00:00:00+01:00','2026-03-30T00:00:00+02:00','2026-03-29',23],
 ['2026-10-25T00:00:00+02:00','2026-10-26T00:00:00+01:00','2026-10-25',25]]) {
 const from=Date.parse(a),to=Date.parse(b);
 const rows=stabilize(Array.from({length:hours},(_,i)=>({...row(i),time:from+i*HOUR})));
 const p=periodsForDay(rows,key,from-HOUR);
 assert.equal(p[0].end,to);assert.equal(p[0].end-p[0].start,hours*HOUR);
 }
});
test('weather parsing rejects missing data, bad units and irregular time',()=>{
 const payload={hourly_units:{time:'unixtime',wind_speed_10m:'kn',wind_gusts_10m:'kn'},hourly:{time:Array.from({length:24},(_,i)=>(start+i*HOUR)/1000),wind_speed_10m:Array(24).fill(10),wind_direction_10m:Array(24).fill(290),wind_gusts_10m:Array(24).fill(15)}};
 assert.equal(parseWeather(payload).length,24);
 assert.throws(()=>parseWeather({...payload,hourly_units:{}}));
 assert.throws(()=>parseWeather({...payload,hourly:{...payload.hourly,wind_speed_10m:[]}}));
 assert.throws(()=>parseWeather({...payload,hourly:{...payload.hourly,time:Array(24).fill(start/1000)}}));
 assert.throws(()=>parseWeather({...payload,hourly:{...payload.hourly,wind_speed_10m:Array(24).fill(null)}}));
});
