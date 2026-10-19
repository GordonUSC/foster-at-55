/* FANGSPEARE · The Descent. Assembles Higgsfield art + ElevenLabs sound; every diagram runs on one 140 BPM clock. */
(()=>{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const BPM=140, BEAT=60/BPM, C={ember:'#E8743B',jade:'#6FB59A',ice:'#CFE3EC',bone:'#ECE2CC',verm:'#C4412F',abyss:'#0B1220'};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const state={completed:{},ratings:{},notes:[]};
const order=$$('.lesson').map(a=>a.dataset.id);
if(reduce)$$('video').forEach(v=>{v.removeAttribute('autoplay');v.pause();});

/* ---------- sound ---------- */
const snd={}; ['bed','ignite','reveal','saved','n1','n2','n3','n4','c-signal','c-timing','c-map','c-transitions','c-selection','c-presence','c-signature','c-capstone','enter-grid','enter-set','enter-room','enter-show'].forEach(k=>{snd[k]=new Audio('snd/'+k+'.mp3');snd[k].preload=k==='bed'?'none':'auto';});
snd.bed.loop=true; let soundOn=false, coachNow=null;
function sfx(k,v=1){ if(!soundOn&&!k.startsWith('n'))return; try{const a=snd[k].cloneNode();a.volume=c01(v);a.play().catch(()=>{});}catch(e){} }
function fade(a,to,ms=900){const from=a.volume,t0=performance.now();(function f(t){const p=Math.max(0,Math.min(1,(t-t0)/ms));a.volume=from+(to-from)*p;if(p<1)requestAnimationFrame(f);else if(to===0)a.pause();})(t0);}
$('#sound').onclick=e=>{soundOn=!soundOn;e.currentTarget.setAttribute('aria-pressed',soundOn);e.currentTarget.textContent=soundOn?'Sound on':'Sound off';
  if(soundOn){snd.bed.volume=0;snd.bed.play().catch(()=>{});fade(snd.bed,1);audioCtx();if(openId&&vizOn)startSong();}else{fade(snd.bed,0);vizStop();}};
document.addEventListener('click',e=>{const b=e.target.closest('.coach');if(!b)return;e.preventDefault();
  if(coachNow){coachNow.pause();$$('.coach.playing').forEach(x=>x.classList.remove('playing'));}
  const a=snd[b.dataset.narr];a.currentTime=0;a.volume=.95;coachNow=a;b.classList.add('playing');
  if(soundOn)fade(snd.bed,.5,300); if(vizOn) vizStop();
  a.onended=()=>{b.classList.remove('playing');if(soundOn)fade(snd.bed,1,600);};a.play().catch(()=>b.classList.remove('playing'));});

/* ---------- chamber videos + gauge ---------- */
const vids=$$('.chamber video, .kit video');
const io=new IntersectionObserver(es=>es.forEach(en=>{const v=en.target;
  if(en.isIntersecting){ if(!v.src&&v.dataset.src)v.src=v.dataset.src; if(!reduce)v.play().catch(()=>{}); } else v.pause();}),{rootMargin:'200px'});
vids.forEach(v=>io.observe(v));
let lastLevel=0;
const lio=new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting)return; const n=+en.target.dataset.level;
  $$('.gauge a').forEach(a=>a.classList.toggle('here',+a.dataset.g===n));
  if(n>lastLevel){sfx('enter-'+en.target.id,1);} lastLevel=n;}),{threshold:.35});
$$('.chamber').forEach(c=>lio.observe(c));

/* ---------- lesson sheets ---------- */
let openId=null;
const closeBtn=document.createElement('button');closeBtn.className='sheet-close';closeBtn.type='button';closeBtn.textContent='Back to the chamber';closeBtn.hidden=true;document.body.append(closeBtn);
$$('.lesson').forEach(a=>{const hv=document.createElement('button');hv.type='button';hv.className='hearviz';hv.textContent='Hear the diagram';hv.onclick=()=>{ if(vizOn){ vizStop(); return; } vizOn=true; vizLabel(); if(!soundOn) $('#sound').click(); else { audioCtx(); if(openId) startSong(); } };a.querySelector('.l-left').append(hv);});
$$('.lesson').forEach(a=>{const nav=document.createElement('div');nav.className='sheet-nav';
  const i=order.indexOf(a.dataset.id);
  nav.innerHTML=(i>0?`<button type="button" data-go="${order[i-1]}">← Previous stone</button>`:'')+(i<order.length-1?`<button type="button" data-go="${order[i+1]}">Next stone →</button>`:'');
  a.querySelector('.l-body').append(nav);});
function openLesson(id,push=true){ const a=$('#lesson-'+id); if(!a)return; if(openId)shut(false);
  openId=id; a.classList.add('open'); document.body.style.overflow='hidden'; document.body.classList.add('sheet-open'); closeBtn.hidden=false;
  a.scrollTop=0; a.querySelector('h3').setAttribute('tabindex','-1'); a.querySelector('h3').focus({preventScroll:true});
  sfx('ignite',1); startViz(a); if(push)history.replaceState(null,'','#lesson-'+id); }
function shut(restore=true){ if(!openId)return; const a=$('#lesson-'+openId); a.classList.remove('open','viz-on'); stopViz(); vizStop();
  document.body.style.overflow=''; document.body.classList.remove('sheet-open'); closeBtn.hidden=true; const st=$(`.stone[data-open="${openId}"]`); const lvl=a.dataset.level; openId=null;
  if(restore){history.replaceState(null,'','#'+lvl); st&&st.focus({preventScroll:true}); st&&st.scrollIntoView({block:'center'});} }
document.addEventListener('click',e=>{const s=e.target.closest('[data-open]');if(s){e.preventDefault();openLesson(s.dataset.open);return;}
  const g=e.target.closest('[data-go]');if(g){openLesson(g.dataset.go);return;}
  const ev=e.target.closest('.evchip');if(ev&&openId){e.preventDefault();shut(false);const t=document.querySelector(ev.getAttribute('href'));history.replaceState(null,'',ev.getAttribute('href'));if(t){const d=t.querySelector('details');if(d)d.open=true;requestAnimationFrame(()=>requestAnimationFrame(()=>t.scrollIntoView({block:'center'})));}} });
closeBtn.onclick=()=>shut(); document.addEventListener('keydown',e=>{if(e.key==='Escape'){ if(!$('#notes').hidden)toggleNotes(false); else shut(); }});
if(location.hash.startsWith('#lesson-'))setTimeout(()=>openLesson(location.hash.slice(8),false),300);

$$('.drill-tabs button').forEach(b=>b.onclick=()=>{const d=b.closest('.drill');d.dataset.mode=b.dataset.mode;
  d.querySelectorAll('.drill-tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));
  d.querySelectorAll('.steps.'+b.dataset.mode+' li').forEach(li=>{li.style.animation='none';li.offsetWidth;li.style.animation='';});});
$$('.rungs li').forEach(li=>li.onclick=()=>{const id=li.closest('.lesson').dataset.id,crit=li.closest('.rub').querySelector('b').textContent;
  li.parentElement.querySelectorAll('li').forEach(x=>x.classList.toggle('me',x===li)); state.ratings[id+'|'+crit]=li.dataset.r; toast('Self-rating noted: '+li.querySelector('span').textContent);});
$$('[data-done]').forEach(cb=>cb.onchange=()=>{state.completed[cb.dataset.done]=cb.checked; if(cb.checked){sfx('reveal',1);toast('Practice logged. Save a recording or note for review; this is not a skill assessment.');} paint();});

function paint(){ const done=Object.keys(state.completed).filter(k=>state.completed[k]);
  $$('.stone').forEach(s=>s.classList.toggle('lit',!!state.completed[s.dataset.open]));
  $$('[data-done]').forEach(cb=>cb.checked=!!state.completed[cb.dataset.done]);
  $$('.gauge a').forEach((a,i)=>{const ids=$$(`.lesson[data-level="${$$('.chamber')[i].id}"]`).map(x=>x.dataset.id);a.classList.toggle('lit',ids.every(x=>state.completed[x]));});
  $('#floor-stones').innerHTML=order.map(id=>`<i class="${state.completed[id]?'lit':''}"></i>`).join('');
  $('#floor-p').textContent=`${done.length} of 12 practices logged. Review your evidence and revisit any skill that needs work before the final recording.`;
  $('#notes-n').textContent=state.notes.length;
  $('#note-list').innerHTML=state.notes.map((n,i)=>`<li><b>${esc(n.date||'')} ${esc(n.source)}${n.time?' '+esc(n.time):''}${n.end?' to '+esc(n.end):''}</b><br><b>Heard</b> ${esc(n.observed)}${n.seen?'<br><b>Seen</b> '+esc(n.seen):''}${n.hypothesis?'<br><b>Might explain</b> '+esc(n.hypothesis):''}${n.confidence?'<br><i>'+esc(n.confidence)+'</i>':''}</li>`).join('');
  $$('.rungs li.me').forEach(li=>li.classList.remove('me'));
  Object.entries(state.ratings).forEach(([k,v])=>{const [id,crit]=k.split('|');$$(`#lesson-${id} .rub`).forEach(r=>{if(r.querySelector('b').textContent===crit)r.querySelectorAll('li').forEach(li=>li.classList.toggle('me',li.dataset.r===v));});});
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let tt; function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,3200);}

/* ---------- field notes (session only; export/import is the save) ---------- */
function toggleNotes(on){const n=$('#notes');n.hidden=!on;if(on)$('#n-obs').focus();else if(typeof cancelImport==='function')cancelImport(true);}
$('#notes-btn').onclick=()=>toggleNotes($('#notes').hidden); $('#notes-close').onclick=()=>toggleNotes(false);
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);};$('#n-date').value=today();
$$('[data-record]').forEach(b=>b.onclick=()=>{toggleNotes(true);$('#n-src').value=b.dataset.record;$('#n-date').value=today();$('#n-time').focus();});
$('#note-form').onsubmit=e=>{e.preventDefault();const v=id=>$('#'+id).value.trim();
  state.notes.unshift({date:v('n-date'),source:$('#n-src').value,time:v('n-time'),end:v('n-end'),observed:v('n-obs'),seen:v('n-seen'),hypothesis:v('n-hyp'),confidence:$('#n-conf').value,alternative:v('n-alt'),function:v('n-fn'),ownVersion:v('n-own')});
  e.target.reset();$('#n-date').value=today();sfx('saved',1);toast('Note added. Export progress to keep it.');paint();};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({app:'fangspeare-descent',v:4,saved:new Date().toISOString(),...state},null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='fangspeare-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Progress file saved. Keep it to resume next time.');};
$('#import').onclick=()=>$('#import-file').click();
let pending=null;
const RATE=['beginning','secure','adaptable'];
function validFile(d){ if(!d||d.app!=='fangspeare-descent') return 'Not a FANGSPEARE progress file.';
  for(const k of ['completed','ratings','notes']) if(d[k]==null) return 'This file is missing its '+({completed:'practice logs',ratings:'self-ratings',notes:'field notes'})[k]+'. Nothing was changed.';
  if(d.completed!=null&&(typeof d.completed!=='object'||Array.isArray(d.completed)||!Object.values(d.completed).every(v=>typeof v==='boolean'))) return 'This file has invalid practice logs. Nothing was changed.';
  if(d.ratings!=null&&(typeof d.ratings!=='object'||Array.isArray(d.ratings)||!Object.values(d.ratings).every(v=>RATE.includes(v)))) return 'This file has invalid self-ratings. Nothing was changed.';
  if(d.notes!=null&&(!Array.isArray(d.notes)||!d.notes.every(n=>n&&typeof n==='object'&&typeof n.observed==='string'))) return 'This file has invalid field notes. Nothing was changed.';
  return ''; }
$('#import-file').onchange=async e=>{let d;try{d=JSON.parse(await e.target.files[0].text());}catch(_){d=null;} const bad=validFile(d); if(bad){toast(bad);e.target.value='';return;} try{pending=d;
  const lit=Object.values(state.completed).filter(Boolean).length,rat=Object.keys(state.ratings).length,nn=state.notes.length;
  $('#import-msg').textContent=`Importing replaces everything in this tab: your lit stones (${lit}), self-ratings (${rat}) and field notes (${nn}). The file has ${Object.values(d.completed||{}).filter(Boolean).length} lit stones, ${Object.keys(d.ratings||{}).length} self-ratings and ${(d.notes||[]).length} notes.`;
  $('#import-confirm').hidden=false;$('#import-yes').focus();}
  catch(_){toast('Not a FANGSPEARE progress file.');} e.target.value='';};
$('#import-yes').onclick=()=>{if(!pending)return;state.completed=pending.completed||{};state.ratings=pending.ratings||{};state.notes=(pending.notes||[]).slice(0,500);pending=null;
  $('#import-confirm').hidden=true;paint();toast('Progress restored from your file.');};
function cancelImport(quiet){if(!pending&&$('#import-confirm').hidden)return;pending=null;$('#import-confirm').hidden=true;if(!quiet)toast('Kept what you have. Nothing replaced.');}
$('#import-no').onclick=()=>cancelImport(false);


/* ---------- diagram sound: every circle plays its own picture, on the diagram's clock ---------- */
const KIT=['kick','snare','hat','sub','crash','impact','riser','tape','crowd','sand']; let actx=null, master=null, bufs={}, kitReady=null;
function audioCtx(){ if(!actx){ try{ actx=new (window.AudioContext||window.webkitAudioContext)(); master=actx.createGain(); master.gain.value=.55; master.connect(actx.destination);
  kitReady=Promise.all(KIT.map(k=>fetch('snd/kit/'+k+'.mp3').then(r=>r.arrayBuffer()).then(b=>new Promise((ok,no)=>actx.decodeAudioData(b,ok,no))).then(x=>bufs[k]=x).catch(()=>{}))); }catch(e){} }
  if(actx&&actx.state==='suspended') actx.resume(); return actx; }
function hit(k,when,g=1,rate=1,pan=0){ const b=bufs[k]; if(!b||!actx) return; const s=actx.createBufferSource(); s.buffer=b; s.playbackRate.value=rate; const v=actx.createGain(); v.gain.value=c01(g);
  let n=v; if(actx.createStereoPanner){ const pn=actx.createStereoPanner(); pn.pan.value=pan; v.connect(pn); n=pn; } s.connect(v); n.connect(master); s.start(Math.max(when,actx.currentTime)); live.add(s); s.onended=()=>live.delete(s); }
const B=BEAT, grid=(a,b,step,off=0,f)=>{ for(let k=Math.ceil((a-off)/step);k*step+off<b;k++) f(k*step+off,k); };
const SONG={
 hear:(a,b,E)=>grid(a,b,B,0,(t,k)=>{ E(t,'kick',k%4===0?1:.45); if(k%4===0)E(t,'hat',.5); if(k%32===0)E(t,'crash',.7); }),
 signal:(a,b,E)=>{ const g=(t,l)=>Math.floor(t/B/8)%4===l?1:.1;
   grid(a,b,2*B,0,t=>E(t,'kick',g(t,0))); grid(a,b,4*B,2*B,t=>E(t,'snare',g(t,1))); grid(a,b,B/2,0,t=>E(t,'hat',.7*g(t,2))); grid(a,b,2*B,B,t=>E(t,'sub',g(t,3))); },
 timing:(a,b,E)=>{ const off=t=>Math.max(0,1-((t%12)/12)*1.6)*.42;
   grid(a,b,B,0,t=>E(t,'kick',.9,1,-.7)); grid(a-B,b+B,B,0,t=>{ const tb=t-off(t)*B; if(tb>=a&&tb<b) E(tb,'kick',.9,1.08,.7); }); },
 map:(a,b,E)=>grid(a,b,B/2,0,(t,k)=>{ const p=(t%16)/16, on=k%2===0;
   if(p<.25){ if(on)E(t,'hat',.5); } else if(p<.5){ E(t,'snare',.15+(p-.25)*2.4); } else if(p<.75){ if(on){E(t,'kick',1); if(k%4===0)E(t,'sub',.8);} } else { if(k%4===0)E(t,'hat',.35); } }),
 space:(a,b,E)=>{ const ph=t=>(Math.sin(t*2*Math.PI/(B*32))+1)/2; grid(a,b,B,0,t=>E(t,'kick',.55));
   grid(a,b,2*B,0,t=>E(t,'sub',ph(t),1)); grid(a,b,2*B,B,t=>E(t,'sub',1-ph(t),1.19)); },
 transitions:(a,b,E)=>grid(a,b,B/2,0,(t,k)=>{ const p=(t%10)/10, after=p>=1/1.4; if(k%2===0)E(t,'kick',.8);
   if(!after){ if(k%2===1)E(t,'hat',.6); } else { if(k%4===2)E(t,'snare',.8); if(k%2===1)E(t,'hat',.35); }
   const swap=Math.floor(t/10)*10+10/1.4; if(swap>=t&&swap<t+B/2&&swap>=a&&swap<b)E(swap,'crash',.6); }),
 selection:(a,b,E)=>{ const p=t=>(Math.sin(t*1.2)+1)/2; grid(a,b,B,0,t=>E(t,'kick',.5));
   grid(a,b,B/4,0,t=>E(t,'hat',.45*(1-p(t)))); grid(a,b,2*B,0,t=>E(t,'sub',.9*p(t))); },
 arc:(a,b,E)=>{ const En=u=>.25+.5*u+.22*Math.sin(u*9)*Math.sin(u*3.1)+(u>.78&&u<.9?.25:0);
   grid(a,b,B,0,t=>{ const e=Math.min(1,En((t%14)/14)); E(t,'kick',.2+e*.8); if(e>.55)E(t+B/2,'hat',.5*e); });
   grid(a,b,14,14*.78,t=>E(t,'crash',.7)); },
 presence:(a,b,E)=>{ grid(a,b,B,0,t=>E(t,'kick',.7)); const w=t=>(Math.sin(t*.7)+1)/2;
   grid(a,b,B,0,t=>{ if(w(t)>.55&&w(t-B)<=.55)E(t,'crowd',.8); }); },
 signature:(a,b,E)=>{ const T=B*36;
   grid(a,b,T,.8*T-6.59,t=>E(t,'riser',.7));
   grid(a,b,T,.8*T,t=>{E(t,'impact',1);E(t,'sub',1);E(t,'crash',.6);});
   for(let c=Math.floor(a/T)*T;c<b;c+=T){ let t=c+B*2; while(t<c+.8*T){ const bl=Math.min(1,(t-c)/(.8*T)); if(t>=a&&t<b)E(t,'snare',.15+bl*.6); t+=B/(1+Math.floor(bl*4)); }
     grid(Math.max(a,c+.8*T+B),Math.min(b,c+T),B,c%B,tt=>E(tt,'kick',.9)); } },
 identity:(a,b,E)=>{ grid(a,b,2,0,t=>{E(t,'sand',.6);E(t,'sub',.35,.5);}); grid(a,b,6,0,t=>E(t,'crash',.25)); },
 capstone:(a,b,E)=>{ grid(a,b,15,0,t=>E(t,'tape',.9)); grid(a,b,15,15*.12,t=>E(t,'hat',.7)); grid(a,b,15,15*.45,t=>E(t,'hat',.7)); grid(a,b,15,14.9,t=>E(t,'crash',.5)); }
};
let sched=null, schedTo=0, vizOn=false; const live=new Set();
const c01=x=>Math.max(0,Math.min(1,+x||0));
function vizLabel(){ $$('.hearviz').forEach(h=>{h.textContent=vizOn?'Stop the sound':'Hear the diagram';h.setAttribute('aria-pressed',vizOn);}); }
function vizStop(){ vizOn=false; stopSong(); vizLabel(); }
function startSong(){ stopSong(); if(!vizOn||!soundOn||!SONG[vid]||document.hidden) return; const c=audioCtx(); if(!c) return; master.gain.cancelScheduledValues(c.currentTime); master.gain.setValueAtTime(.55,c.currentTime); schedTo=(performance.now()-t0)/1000;
  kitReady&&kitReady.then(()=>{ if(!openId) return; sched=setInterval(()=>{ if(!soundOn||!openId||!vizOn){stopSong();return;}
    const now=(performance.now()-t0)/1000, base=actx.currentTime-now, to=now+.15; if(to<=schedTo) return;
    SONG[vid](schedTo,to,(t,k,g,r,p)=>hit(k,base+t,g==null?1:g,r==null?1:r,p==null?0:p)); schedTo=to; },25); }); }
function stopSong(){ clearInterval(sched); sched=null; if(actx){ const n=actx.currentTime; master.gain.cancelScheduledValues(n); master.gain.setValueAtTime(master.gain.value,n); master.gain.linearRampToValueAtTime(0,n+.08); live.forEach(x=>{try{x.stop(n+.1)}catch(e){}}); live.clear(); } }
document.addEventListener('visibilitychange',()=>{ if(document.hidden){ vizStop(); try{snd.bed.pause();}catch(e){} } else if(soundOn){ snd.bed.play().catch(()=>{}); } });
/* ---------- the twelve living diagrams ---------- */
let raf=null,vctx=null,vid=null,t0=0;
function startViz(a){const cv=a.querySelector('canvas.viz');vctx=cv.getContext('2d');vid=a.dataset.id;a.classList.add('viz-on');t0=performance.now();
  if(reduce){draw(4.2);startSong();return;} const loop=t=>{draw((t-t0)/1000);raf=requestAnimationFrame(loop);};raf=requestAnimationFrame(loop); startSong();}
function stopViz(){cancelAnimationFrame(raf);raf=null;stopSong();}
function draw(t){const g=vctx,W=720,H=720;g.clearRect(0,0,W,H);(VIZ[vid]||(()=>{}))(g,t,W,H);}
const beatOf=t=>t/BEAT, ease=x=>1-Math.pow(1-x,3);
function label(g,txt,x,y,col=C.bone,size=30,align='center'){g.font=`800 ${size}px "Shippori Mincho B1",Georgia,serif`;g.textAlign=align;g.fillStyle=col;g.shadowColor='#0B1220';g.shadowBlur=12;g.fillText(txt,x,y);g.shadowBlur=0;}
function small(g,txt,x,y,col=C.ice,align='center'){g.font='600 20px Archivo,system-ui';g.textAlign=align;g.fillStyle=col;g.fillText(txt,x,y);}
function dot(g,x,y,r,col,glow=0){g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=col;if(glow){g.shadowColor=col;g.shadowBlur=glow;}g.fill();g.shadowBlur=0;}
const VIZ={
 hear(g,t){const b=beatOf(t),bi=Math.floor(b)%32,bar=Math.floor(bi/4),beat=bi%4,ph=b%1,blk=Math.floor(bar/4);
  label(g,`Bar ${bar+1} of 8`,360,150,C.bone,56); small(g,'count, and tap only beat one',360,192);
  for(let r=0;r<4;r++)for(let i=0;i<4;i++){const k=(blk*4+r)*4+i,cur=k===bi,past=k<bi,x=225+i*90,y=270+r*72,one=i===0;
   const c=cur?(one?C.ember:C.ice):past?(one?'#E8743B88':'#CFE3EC55'):'#ECE2CC26'; dot(g,x,y,one?(cur?26:18):(cur?18:11),c,cur?40:0);}
  for(let r=0;r<4;r++)small(g,'bar '+(blk*4+r+1),150,277+r*72,'#ECE2CC88');
  if(bi===0&&ph<.7){g.strokeStyle=C.ember;g.lineWidth=5;g.globalAlpha=1-ph/.7;g.beginPath();g.arc(360,380,140+ph*180,0,7);g.stroke();g.globalAlpha=1;label(g,'new phrase',360,600,C.ember,44);}
  else label(g,['ONE','two','three','four'][beat],360,600,beat===0?C.ember:C.ice,beat===0?58:42);},
 signal(g,t){const b=beatOf(t),focus=Math.floor(b/8)%4,lanes=['kick','snare','hats','bass'];
  label(g,'Hear the '+lanes[focus],360,150,C.jade,46); small(g,'one element at a time',360,190);
  lanes.forEach((n,i)=>{const y=270+i*95,on=i===focus,col=on?C.jade:'#ECE2CC40';small(g,n,110,y+7,col,'left');
   g.strokeStyle=col;g.lineWidth=on?4:2;g.beginPath();
   for(let x=190;x<620;x+=2){const ph=b-(620-x)/110;let v=0;
    if(i===0)v=(ph%2<.12)?-34:0; if(i===1)v=(Math.abs((ph%4)-2)<.08)?-30:0; if(i===2)v=(ph%.5<.06)?-16:0; if(i===3)v=Math.sin(ph*Math.PI)*24;
    x===190?g.moveTo(x,y+v):g.lineTo(x,y+v);} g.stroke();});},
 timing(g,t){const cyc=(t%12)/12,off=Math.max(0,1-cyc*1.6)*.42,b=beatOf(t);
  label(g,off<.01?'Example: kicks aligned':'Lock the groove',360,150,off<.01?C.jade:C.bone,off<.01?38:46); small(g,off<.01?'an illustration, not a check of your mix':'nudge B until the kicks meet',360,192);
  [['A',0,C.ember],['B',off,C.ice]].forEach(([n,o,col],r)=>{const y=330+r*130;small(g,n,110,y+7,col,'left');
   g.strokeStyle='#ECE2CC22';g.lineWidth=2;g.beginPath();g.moveTo(160,y);g.lineTo(640,y);g.stroke();
   for(let k=-1;k<9;k++){const x=160+((k-((b+o)%1))*60);if(x<160||x>640)continue;const hit=Math.abs(x-400)<8;dot(g,x,y,hit?16:10,col,hit?24:0);}});
  g.strokeStyle=C.bone;g.globalAlpha=.4;g.setLineDash([6,8]);g.beginPath();g.moveTo(400,280);g.lineTo(400,510);g.stroke();g.setLineDash([]);g.globalAlpha=1;},
 map(g,t){const p=(t%16)/16;label(g,'Know what each track can do',360,140,C.bone,34);
  const tr=[[C.ember,'your track (example)',0],[C.ice,'track B',1.7],[C.jade,'track C',3.1]];
  tr.forEach(([col,n,s],i)=>{const y=290+i*120;g.strokeStyle=col;g.lineWidth=5;g.beginPath();
   for(let x=120;x<=620;x+=4){const u=(x-120)/500;const e=.25+.6*Math.max(0,Math.sin((u*3.2+s)))*(u>.35&&u<.75?1.3:.7);x===120?g.moveTo(x,y-e*60):g.lineTo(x,y-e*60);}g.stroke();
   small(g,n,120,y+34,col,'left');});
  ['intro','build','drop','outro'].forEach((s,i)=>{const x=120+i*140+40;small(g,s,x,600,'#ECE2CC88');});
  const x=120+p*500;g.strokeStyle=C.bone;g.lineWidth=2;g.beginPath();g.moveTo(x,220);g.lineTo(x,570);g.stroke();dot(g,x,220,8,C.bone,20);},
 space(g,t){const ph=(Math.sin(t*2*Math.PI/(BEAT*32))+1)/2;label(g,'Make room for the bass',360,140,C.bone,40);small(g,'one low end at a time',360,180);
  for(let i=0;i<22;i++){const x=120+i*22,low=i<6,f=low?1:.7+.3*Math.sin(t*3+i);
   const a=(low?ph:1)*(110+60*Math.sin(t*5+i*.7))*f,bb=(low?1-ph:1)*(100+50*Math.cos(t*4+i*.6))*f;
   g.fillStyle=C.ember;g.globalAlpha=.85;g.fillRect(x,560-a,14,a);g.fillStyle=C.ice;g.globalAlpha=.6;g.fillRect(x+3,560-a-bb*.55,8,bb*.55);g.globalAlpha=1;}
  g.strokeStyle=C.verm;g.lineWidth=2;g.setLineDash([5,6]);g.strokeRect(112,250,138,320);g.setLineDash([]);small(g,'bass zone',181,600,C.verm);
  small(g,ph>.5?'A owns the bass':'B owns the bass',520,600,ph>.5?C.ember:C.ice);},
 transitions(g,t){const p=(t%10)/10;label(g,'Exit on the phrase',360,140,C.bone,44);
  for(let k=0;k<=4;k++){const x=110+k*125;g.strokeStyle='#ECE2CC30';g.lineWidth=2;g.beginPath();g.moveTo(x,220);g.lineTo(x,560);g.stroke();small(g,(k*16+1)+'',x,595,'#ECE2CC88');}
  g.fillStyle=C.ember;g.globalAlpha=.8;g.fillRect(110,270,375,90);g.fillStyle=C.ice;g.globalAlpha=.75;g.fillRect(360,410,250,90);g.globalAlpha=1;
  small(g,'track A',120,322,C.abyss,'left');small(g,'track B',600,462,C.abyss,'right');
  const snap=ease(Math.min(1,p*1.4)),x=180+(360-180)*snap;g.strokeStyle=C.jade;g.lineWidth=5;g.strokeRect(x,250,125,270);
  small(g,snap>.98?'the blend lands on bar 49':'find the boundary',360,650,snap>.98?C.jade:C.ice);},
 selection(g,t){label(g,'Connect two worlds',360,130,C.bone,42);
  const cl=(cx,col,s)=>{for(let i=0;i<14;i++){const a=i/14*6.28+t*.4*s,r=60+(i%3)*22;dot(g,cx+Math.cos(a)*r,360+Math.sin(a)*r,8,col);}};
  cl(200,C.ice,1);cl(520,C.ember,-1);small(g,'icy, melodic',200,500);small(g,'volcanic, heavy',520,500,C.ember);
  const p=(Math.sin(t*1.2)+1)/2,x=260+p*200;g.strokeStyle=C.jade;g.lineWidth=3;g.beginPath();g.moveTo(260,360);g.lineTo(460,360);g.stroke();dot(g,x,360,16,C.jade,30);
  small(g,'the bridge track shares tempo, key or texture',360,600,C.jade);},
 arc(g,t){label(g,'Give the set a shape',360,130,C.bone,42);const p=(t%14)/14;
  const E=u=>.25+.5*u+.22*Math.sin(u*9)*Math.sin(u*3.1)+(u>.78&&u<.9?.25:0);
  g.strokeStyle='#ECE2CC30';g.lineWidth=2;g.beginPath();g.moveTo(100,560);g.lineTo(620,560);g.stroke();
  g.strokeStyle=C.ember;g.lineWidth=5;g.beginPath();for(let x=100;x<=620;x+=3){const u=(x-100)/520,y=560-E(u)*300;x===100?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();
  const x=100+p*520;dot(g,x,560-E(p)*300,13,C.bone,30);small(g,'0 min',100,595,'#ECE2CC88','left');small(g,'30 min',620,595,'#ECE2CC88','right');
  small(g,p<.3?'set the floor':p<.75?'tension and release':'the peak, then land it',360,640);},
 presence(g,t){label(g,'Play with the room',360,130,C.bone,42);const b=beatOf(t),wave=(Math.sin(t*.7)+1)/2;
  g.strokeStyle=C.ember;g.lineWidth=3;for(let k=0;k<3;k++){const r=((b+k/3)%1)*160;g.globalAlpha=1-((b+k/3)%1);g.beginPath();g.arc(360,250,30+r,0,7);g.stroke();}g.globalAlpha=1;dot(g,360,250,24,C.ember,30);
  for(let i=0;i<64;i++){const x=110+(i%16)*33,row=Math.floor(i/16),y=470+row*36,j=Math.abs(Math.sin(b*Math.PI+i*.37))*(8+wave*22)*(row<2?1:.7);dot(g,x,y-j,7,wave>.55?C.jade:C.ice);}
  const cue=wave>.55?['Possible cue: people lean in.','Observe before deciding.']:['If energy changes, check the musical','context and ask what people noticed.'];small(g,cue[0],360,604,wave>.55?C.jade:C.ice);small(g,cue[1],360,630,wave>.55?C.jade:C.ice);},
 signature(g,t){const T=BEAT*36,p=(t%T)/T,build=Math.min(1,p/.8);
  if(p<.8){label(g,'Build',360,140,C.bone,54);small(g,'one memorable moment needs a setup',360,182);
   g.strokeStyle=C.ice;g.lineWidth=4;g.beginPath();g.moveTo(120,560);g.lineTo(120+500*build,560-320*build*build);g.stroke();
   const rate=1+build*7;if((t*rate)%1<.2)dot(g,120+500*build,560-320*build*build,14,C.bone,30);}
  else{const q=(p-.8)/.2;label(g,'THE DROP',360,360+q*10,C.ember,80);for(let i=0;i<70;i++){const a=i*2.4,r=ease(q)*(150+(i%7)*30);
   g.fillStyle=i%3?C.ember:C.ice;g.globalAlpha=1-q;g.fillRect(360+Math.cos(a)*r,360+Math.sin(a)*r,i%3?8:4,i%3?8:14);}g.globalAlpha=1;}},
 identity(g,t){label(g,'Make it yours',360,120,C.bone,42);small(g,'a sigil drawn by a standing wave',360,160);
  if(!VIZ._sand){VIZ._sand=Array.from({length:1600},()=>[Math.random(),Math.random()]);}
  const m=3+Math.floor((t/6)%3),n=5,f=(x,y)=>Math.cos(n*Math.PI*x)*Math.cos(m*Math.PI*y)-Math.cos(m*Math.PI*x)*Math.cos(n*Math.PI*y);
  g.save();g.beginPath();g.arc(360,400,250,0,7);g.clip();
  VIZ._sand.forEach(s=>{const v=f(s[0],s[1]),e=.004*Math.sign(v);const dx=(f(s[0]+.002,s[1])-v)/.002,dy=(f(s[0],s[1]+.002)-v)/.002;
   s[0]=Math.min(1,Math.max(0,s[0]-e*dx*.02+(Math.random()-.5)*.002*Math.abs(v)));s[1]=Math.min(1,Math.max(0,s[1]-e*dy*.02+(Math.random()-.5)*.002*Math.abs(v)));
   g.fillStyle=Math.abs(v)<.08?C.jade:'#ECE2CC88';g.fillRect(110+s[0]*500,150+s[1]*500,2.4,2.4);});g.restore();
  g.strokeStyle=C.ember;g.lineWidth=4;g.beginPath();g.arc(360,400,252,0,7);g.stroke();small(g,`mode (${n},${m}), simulated`,360,690,'#ECE2CC99');},
 capstone(g,t){label(g,'Record the truth',360,130,C.bone,46);const p=(t%15)/15;
  if((t%1)<.6)dot(g,140,210,14,C.verm,24);small(g,'REC',165,217,C.verm,'left');
  const ms=[['plan',0,.12],['10-min rehearsal',.12,.45],['30-min set',.45,1]];
  ms.forEach(([n,a,b2],i)=>{const y=320+i*105,fill=Math.max(0,Math.min(1,(p-a)/(b2-a)));g.strokeStyle='#ECE2CC40';g.lineWidth=2;g.strokeRect(120,y,480,44);
   g.fillStyle=[C.ice,C.ember,C.jade][i];g.globalAlpha=.85;g.fillRect(120,y,480*fill,44);g.globalAlpha=1;small(g,n,130,y-12,C.bone,'left');if(fill>=1)small(g,'done',590,y-12,C.jade,'right');});
  small(g,'three separate milestones, in order',360,660);}
};

paint();
})();
