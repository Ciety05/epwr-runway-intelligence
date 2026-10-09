import {HOUR,dayKey,timeLabel,dateLabel,components,parseWeather,periodsForDay,countFlights,demoWeather,demoFlights} from './model.js';
const $ = id => document.getElementById(id);
let rows = [], selectedDay = dayKey(Date.now()), selectedPeriod = 0, allFlights = false, mode = 'loading', fetchedAt = null, busy = false;
let selectedAnchor = null;
const names = r => r === '29' ? 'Pas 29' : r === '11' ? 'Pas 11' : r === 'neutral' ? 'Neutralny' : 'Brak danych';
const cls = r => r === '29' ? 'r29' : r === '11' ? 'r11' : r === 'neutral' ? 'neutral' : 'missing';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function showNotice(message, demoButton=false) {
  $('notice').hidden = !message;
  $('notice').textContent = message;
  if(demoButton) {
    const button = document.createElement('button'); button.className = 'outline'; button.textContent = 'Włącz pogodę DEMO';
    button.onclick = () => {rows = demoWeather(Date.now());mode = 'demo';fetchedAt = null;selectedPeriod=0;selectedAnchor=null;showNotice('Pogoda DEMO i fikcyjne przyloty. Dane służą wyłącznie do podglądu.');render();};
    $('notice').append(button);
  }
}
function dayDates(now) {
  // Noon UTC stays inside the same Warsaw calendar date, including DST.
  const base = Date.parse(dayKey(now)+'T12:00:00Z');
  return Array.from({length:7},(_,i)=>base+i*24*HOUR);
}
function render() {
  const now = Date.now(), today = dayKey(now);
  const dates = dayDates(now);
  if(!dates.some(d=>dayKey(d)===selectedDay)){selectedDay=today;selectedPeriod=0;selectedAnchor=null;}
  $('clock').textContent = timeLabel(now)+' WRO';
  $('days').innerHTML = dates.map((d,i)=>'<button class="day" data-day="'+dayKey(d)+'" aria-pressed="'+(selectedDay===dayKey(d))+'"><span>'+(i===0?'Dzisiaj':dateLabel(d,{weekday:'short'}))+'</span><strong>'+dateLabel(d,{day:'2-digit',month:'2-digit'})+'</strong></button>').join('');
  $('weather-status').className = 'badge '+(mode==='live'?'live':'amber');
  $('weather-status').textContent = mode==='live'?'POGODA · LIVE / PROGNOZA':mode==='demo'?'POGODA · DEMO':mode==='loading'?'POGODA · ŁADOWANIE':'POGODA · NIEDOSTĘPNA';
  $('updated').textContent = fetchedAt?'Pobrano '+timeLabel(fetchedAt)+' · Open-Meteo · Europe/Warsaw':mode==='demo'?'Syntetyczny scenariusz · Europe/Warsaw':'Open-Meteo · Europe/Warsaw';
  const periods = periodsForDay(rows,selectedDay,now);
  if(selectedAnchor!==null) selectedPeriod = Math.max(0,periods.findIndex(v=>v.start<=selectedAnchor && selectedAnchor<v.end));
  selectedPeriod = Math.min(selectedPeriod,Math.max(0,periods.length-1));
  const p = periods[selectedPeriod], next = periods[selectedPeriod+1], flights = demoFlights(rows.length?rows:demoWeather(now),selectedDay);
  $('hero').className = 'panel hero '+cls(p?.runway);
  $('runway').textContent = p?.runway==='29'?'29':p?.runway==='11'?'11':p?.runway==='neutral'?'—':'—';
  $('runway').className = 'runway';
  $('confidence').textContent = mode==='demo'?'DEMO':p?.runway==null?'BRAK DANYCH':'PROGNOZA';
  $('runway-description').textContent = p?.runway==='neutral'?'Wiatr słaby lub niejednoznaczny':p?.runway? 'Orientacyjna preferencja lądowania':'Brak prognozy dla tego przedziału';
  $('window-label').textContent = selectedPeriod===0?(selectedDay===today?'OD TERAZ · GŁÓWNY PRZEDZIAŁ':'OD PÓŁNOCY · GŁÓWNY PRZEDZIAŁ'):'WYBRANY PRZEDZIAŁ';
  $('window-time').textContent = p ? timeLabel(p.start)+' – '+(dayKey(p.end)!==selectedDay?'24:00':timeLabel(p.end)) : '—';
  $('window-note').textContent = p ? (next?'Do następnej granicy przedziału':'Do końca dostępnych danych dnia'):'Odśwież pogodę lub włącz jawny podgląd DEMO';
  $('arrival-count').textContent = p?countFlights(flights,p):'—';
  $('next-change').textContent = p?(next?timeLabel(next.start):'Brak'):'—';
  $('change-detail').textContent = next?(next.runway===null?'Brak danych od tej godziny':'→ '+names(next.runway)):'w wybranym dniu';
  const row = p?.row, valid = row && row.runway!==null;
  $('wind-speed').textContent = valid?row.speed.toFixed(0):'—';
  $('wind-direction').textContent = valid?Math.round(row.direction)+'°':'—°';
  $('needle').style.transform = 'rotate('+(valid?row.direction:0)+'deg)';
  $('needle').style.opacity = valid?'1':'.2';
  const wind = valid?components(row.speed,row.direction,p.runway==='11'?110:290):null;
  $('headwind').textContent = wind?(p.runway==='neutral'?'—':wind.head.toFixed(1)+' kt'):'—';
  $('crosswind').textContent = wind?(p.runway==='neutral'?'—':wind.cross.toFixed(1)+' kt'):'—';
  $('gusts').textContent = valid?row.gust.toFixed(0)+' kt':'—';
  const duration = periods.length?periods.at(-1).end-periods[0].start:1;
  $('timeline').innerHTML = periods.map(v=>'<span class="'+cls(v.runway)+'" style="flex:'+((v.end-v.start)/duration)+'" title="'+names(v.runway)+' '+timeLabel(v.start)+'–'+timeLabel(v.end)+'"></span>').join('');
  // Timeline begins at now on the current day; midpoint is calculated, not fixed at noon.
  $('timeline-start').textContent = periods.length?timeLabel(periods[0].start):'—';
  document.querySelector('.timeline-labels span:nth-child(2)').textContent = periods.length?timeLabel(periods[0].start+duration/2):'—';
  $('periods').innerHTML = periods.length?periods.map((v,i)=>'<button class="period" data-period="'+i+'" aria-pressed="'+(i===selectedPeriod)+'"><b class="'+cls(v.runway)+'">'+names(v.runway)+'</b><span>'+timeLabel(v.start)+' – '+(dayKey(v.end)!==selectedDay?'24:00':timeLabel(v.end))+'</span><small>'+countFlights(flights,v)+' przylotów · DEMO</small></button>').join(''):'<p class="empty">Brak okresów — prognoza niedostępna.</p>';
  const search = $('flight-search').value.toLocaleLowerCase('pl');
  const visible = flights.filter(f=>(allFlights || p && f.time>=p.start && f.time<p.end) && (f.city+' '+f.flight).toLocaleLowerCase('pl').includes(search));
  $('all-flights').setAttribute('aria-pressed',String(allFlights));
  $('all-flights').textContent = allFlights?'Wybrany przedział':'Cały dzień';
  $('arrivals-title').textContent = allFlights?'Przyloty w wybranym dniu':'Przyloty w przedziale';
  $('flights').innerHTML = visible.length?visible.map(f=>'<tr><td>'+timeLabel(f.time)+'</td><td>'+esc(f.city)+'<small>'+esc(f.flight)+' · fikcyjny lot</small></td><td><span class="badge amber">DEMO</span></td></tr>').join(''):'<tr><td colspan="3" class="empty">'+(!p&&!allFlights?'Wybierz „Cały dzień”, aby zobaczyć fikcyjne loty.':'Brak pasujących lotów DEMO.')+'</td></tr>';
  const hours = rows.filter(r=>dayKey(r.time)===selectedDay);
  $('hours').innerHTML = hours.length?hours.map(r=>'<tr><td>'+timeLabel(r.time)+'</td><td>'+(r.runway===null?'—':Math.round(r.direction)+'°')+'</td><td>'+(r.runway===null?'—':r.speed.toFixed(0)+' / '+r.gust.toFixed(0))+'</td><td class="'+cls(r.runway)+'">'+names(r.runway)+'</td></tr>').join(''):'<tr><td colspan="4" class="empty">Brak danych pogodowych</td></tr>';
  const max = Math.max(1,...hours.map(r=>Number.isFinite(r.speed)?r.speed:0));
  $('wind-chart').innerHTML = hours.map(r=>'<span class="bar '+cls(r.runway)+'" style="height:'+(Number.isFinite(r.speed)?Math.max(2,r.speed/max*100):2)+'%" title="'+timeLabel(r.time)+'"></span>').join('');
}
async function loadWeather() {
  if(busy) return;
  busy=true; $('refresh').disabled=true;
  const controller = new AbortController(), timeout=setTimeout(()=>controller.abort(),15000);
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({latitude:'51.1027',longitude:'16.8858',hourly:'wind_speed_10m,wind_direction_10m,wind_gusts_10m',wind_speed_unit:'kn',timeformat:'unixtime',timezone:'Europe/Warsaw',forecast_days:'7'});
    const response = await fetch(url,{signal:controller.signal});
    if(!response.ok) throw new Error('HTTP '+response.status);
    const parsed = parseWeather(await response.json());
    if(!parsed.some(r=>dayKey(r.time)===dayKey(Date.now()))) throw new Error('Nieaktualna prognoza.');
    rows=parsed;mode='live';fetchedAt=Date.now();selectedPeriod=0;selectedAnchor=null;showNotice('');
  } catch {
    // Never label old or synthetic weather LIVE after a failed refresh.
    rows=[];mode='error';fetchedAt=null;selectedPeriod=0;selectedAnchor=null;
    showNotice('Nie udało się pobrać prognozy. Spróbuj ponownie lub włącz pogodę DEMO.',true);
  } finally {clearTimeout(timeout);busy=false;$('refresh').disabled=false;render();}
}
$('days').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(b){selectedDay=b.dataset.day;selectedPeriod=0;selectedAnchor=null;render();}});
$('periods').addEventListener('click',e=>{const b=e.target.closest('[data-period]');if(b){selectedPeriod=Number(b.dataset.period);selectedAnchor=periodsForDay(rows,selectedDay,Date.now())[selectedPeriod]?.start??null;render();}});
$('flight-search').addEventListener('input',render);
$('all-flights').onclick=()=>{allFlights=!allFlights;render();};
$('refresh').onclick=loadWeather;
let previousMinute=Math.floor(Date.now()/60000), lastToday=dayKey(Date.now());
setInterval(()=>{
  const currentMinute=Math.floor(Date.now()/60000);
  if(currentMinute!==previousMinute){previousMinute=currentMinute;
    if(lastToday!==dayKey(Date.now())){lastToday=dayKey(Date.now());selectedDay=lastToday;loadWeather();}
    render();
  }
  if(mode==='live' && fetchedAt && Date.now()-fetchedAt>30*60000 && !busy) loadWeather();
},1000);
render();loadWeather();
