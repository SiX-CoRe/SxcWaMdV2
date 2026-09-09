// ============================================================
//  SPEEDY DASH v4 — "LASER & BOSS EDITION"
//  🦔 Hedgehog + diggle-riggle ZZZ (jelly squash, wobble, hitstop)
//  🔴 TURRET LASER di pojok kanan: garis merah tracking posisi,
//     kedip cepat = akan nembak → LOMPPT! Beam gelombang sinus,
//     durasi 16 frame < airtime lompat (33f) → mendarat aman
//  💍 Kena = ring hilang 10% saja (min 1), terlepas bisa diambil lagi
//  👹 BOSS tiap 50 ring: notif DANGER (sirene+strip merah+goyang),
//     HP 3, serangan: 3x laser volley + swoop tanah (stomp/boost!)
//     Kalah → +500 skor +25 ring, boss berikut +60 ring
//  🔊 Mute persisten · 🌀 whirr gangsing dinamis · 🎵 musik 2 mode
//  ✅ Kirim via FORWARD + SIGNATURE (bisa di-reply) · 2x res
// ============================================================

import { randomUUID } from 'crypto'

const DASH_HTML = `<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
html,body{width:100%}
body{background:linear-gradient(165deg,#071538,#040a1e 60%,#02061a);padding:8px;color:#eaf2ff;overflow-y:auto}
#app{max-width:420px;margin:0 auto}
.hdr{display:flex;justify-content:space-between;align-items:center;padding:2px 2px 7px;gap:8px}
.tt{font:900 18px 'Arial Black';color:#58c7ff;text-shadow:0 0 12px #58c7ff66;letter-spacing:1px}
.tt small{display:block;font:700 6.5px Arial;letter-spacing:2px;color:#7a9cc8;text-shadow:none}
.hrs{display:flex;gap:6px;align-items:center}
.hr{background:rgba(0,0,0,.42);border:1px solid rgba(88,199,255,.3);border-radius:9px;padding:3px 9px;text-align:center;min-width:52px}
.hr i{display:block;font:700 7px Arial;font-style:normal;letter-spacing:1px;color:#7a9cc8}
.hr b{font:900 13px 'Arial Black';color:#ffd75e;font-variant-numeric:tabular-nums}
.mbtn{width:34px;height:34px;border:2px solid rgba(88,199,255,.3);border-radius:9px;background:rgba(0,0,0,.42);color:#fff;font-size:15px;cursor:pointer;touch-action:none}
.mbtn:active{filter:brightness(1.6)}
.gw{position:relative;border:2px solid rgba(88,199,255,.3);border-radius:14px;overflow:hidden;background:#000;box-shadow:0 0 18px rgba(88,199,255,.15)}
canvas{width:100%;display:block;touch-action:none}
.pads{display:grid;grid-template-columns:1fr 1.3fr;gap:10px;margin-top:8px}
.pd{height:52px;border:2px solid rgba(255,255,255,.18);border-radius:14px;font:900 14px 'Arial Black';color:#fff;cursor:pointer;touch-action:none;box-shadow:0 4px 0 rgba(0,0,0,.5)}
.pd:active{transform:translateY(3px);box-shadow:none;filter:brightness(1.5)}
#boostB{background:linear-gradient(#ffd75e,#e09406 60%,#7a5205);color:#3a2805}
#jumpB{background:linear-gradient(#58c7ff,#1f7fd6 60%,#0a3a6e)}
.hint{text-align:center;font:600 9px Arial;color:#7a9cc8;margin-top:6px}
</style>
<div id="app">
<div class="hdr"><div class="tt">🌀 SPEEDY DASH<small>EMERALD COAST RUN</small></div><div class="hrs"><div class="hr"><i>RINGS</i><b id="rg">0</b></div><div class="hr"><i>SCORE</i><b id="sc">0</b></div><div class="hr"><i>BEST</i><b id="bs">0</b></div><button class="mbtn" id="muteB">🔊</button></div></div>
<div class="gw"><canvas id="cv" width="404" height="300"></canvas></div>
<div class="pads"><button class="pd" id="boostB">⚡ BOOST</button><button class="pd" id="jumpB">⤒ JUMP</button></div>
<div class="hint">Lompat saat garis merah LASER kedip cepat! · kena musuh = ring turun 10% saja · tiap 50 ring = BOSS! · 🔊 = sound</div>
</div>
<script>
window.onerror=function(m,s,l){var e=document.getElementById('hint');if(e){e.textContent='⚠ '+m+' @'+l;e.style.color='#ff7a8a'}};
(function(){
/* ============ SETUP + RES 2X ============ */
var cv=document.getElementById('cv'),x=cv.getContext('2d'),W=404,H=300;
var DPR=2;cv.width=W*DPR;cv.height=H*DPR;
var rgEl=document.getElementById('rg'),scEl=document.getElementById('sc'),bsEl=document.getElementById('bs');
var BEST=0;try{BEST=parseInt(localStorage.getItem('dash_best')||'0',10)||0}catch(e){}
bsEl.textContent=BEST;
function saveBest(){try{localStorage.setItem('dash_best',String(BEST))}catch(e){}}

/* ============ AUDIO CORE ============ */
var AC=null,MUTED=false;
try{MUTED=localStorage.getItem('dash_mute')==='1'}catch(e){}
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(AC&&AC.state==='suspended'){try{AC.resume()}catch(e){}}return AC}
function tone(f,d,t,v,at,sl){var a=AC;if(!a||MUTED)return;try{var n=a.currentTime+(at||0),o=a.createOscillator(),g=a.createGain();o.type=t||'square';o.frequency.setValueAtTime(f,n);if(sl)o.frequency.exponentialRampToValueAtTime(sl,n+d);g.gain.setValueAtTime(v||.1,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(a.destination);o.start(n);o.stop(n+d+.03)}catch(e){}}
function noiz(d,v,at,fc){var a=AC;if(!a||MUTED)return;try{var n=a.currentTime+(at||0),len=Math.floor(a.sampleRate*d),b=a.createBuffer(1,len,a.sampleRate),c=b.getChannelData(0),i;for(i=0;i<len;i++)c[i]=Math.random()*2-1;var s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();s.buffer=b;f.type='lowpass';f.frequency.value=fc||1200;g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);s.connect(f);f.connect(g);g.connect(a.destination);s.start(n);s.stop(n+d+.03)}catch(e){}}

/* ============ SFX ============ */
function sJump(){tone(260,.12,'sine',.13,0,780);tone(150,.06,'square',.05)}
function sRing(){tone(988,.045,'triangle',.12);tone(1319,.16,'sine',.14,.04);tone(2637,.11,'sine',.05,.04)}
function sSpring(){tone(760,.05,'square',.12,0,1300);tone(300,.3,'sine',.2,.05,1600)}
function sBoost(){noiz(.35,.22,0,700);tone(160,.4,'sawtooth',.12,0,720);tone(80,.4,'sawtooth',.1,0,320)}
function sPop(){noiz(.16,.28,0,500);tone(420,.1,'square',.1,0,50);tone(880,.07,'square',.07,.05)}
function sHurt(){tone(600,.1,'sawtooth',.14,0,150);tone(430,.16,'sawtooth',.12,.09,80);noiz(.22,.14,.04,800)}
function sDie(){[523,392,330,262,196,131].forEach(function(f,i){tone(f,.2,'triangle',.13,i*.14)});noiz(.5,.2,.84,300)}
function sMile(){[659,784,1047,1319].forEach(function(f,i){tone(f,.1,'square',.1,i*.07)});tone(2093,.2,'sine',.08,.28)}
function sReady(){tone(1319,.07,'sine',.12);tone(1760,.12,'sine',.1,.06)}
function sBest(at){at=at||0;[523,659,784,1047,784,1047,1319,1568].forEach(function(f,i){tone(f,.13,'square',.11,at+i*.09)})}
/* laser + boss */
function sAlarm(){tone(988,.08,'square',.1);tone(740,.08,'square',.1,.11)}
function sTick(){tone(1080,.05,'square',.09)}
function sTickF(){tone(1500,.045,'square',.11)}
function sLaser(){noiz(.3,.3,0,2600);tone(1400,.3,'sawtooth',.16,0,180);tone(2200,.24,'square',.1,0,300)}
function sSwoop(){tone(280,.55,'sawtooth',.14,0,950);tone(140,.55,'sawtooth',.1,0,470)}
function sBossHit(){tone(180,.16,'square',.2,0,60);noiz(.2,.25,0,1500);tone(1200,.08,'square',.1)}
function sBossDie(){noiz(.7,.32,0,900);[300,220,150,90,60].forEach(function(f,i){tone(f,.3,'sawtooth',.16,i*.12,f*.4)})}

/* ============ WHIRR GANGSING ============ */
var whr=null,hum=null;
function whirrOn(){
var a=ac();if(!a||MUTED||whr)return;try{
var o=a.createOscillator(),o2=a.createOscillator(),g=a.createGain(),
f=a.createBiquadFilter(),tr=a.createOscillator(),tg=a.createGain(),
wf=a.createOscillator(),wg=a.createGain();
o.type='sawtooth';o.frequency.value=620;
o2.type='triangle';o2.frequency.value=930;
f.type='bandpass';f.frequency.value=850;f.Q.value=1.1;
tr.type='sine';tr.frequency.value=26;tg.gain.value=.038;
tr.connect(tg);tg.connect(g.gain);
wf.type='sine';wf.frequency.value=13;wg.gain.value=70;
wf.connect(wg);wg.connect(o.frequency);wg.connect(o2.frequency);
g.gain.value=.05;
o.connect(f);o2.connect(f);f.connect(g);g.connect(a.destination);
o.start();o2.start();tr.start();wf.start();
whr={o:o,o2:o2,g:g,wf:wf,tr:tr}
}catch(e){}}
function whirrOff(){if(!whr)return;try{var a=AC,t=a.currentTime;whr.g.gain.setTargetAtTime(0,t,.04);whr.o.stop(t+.2);whr.o2.stop(t+.2);whr.wf.stop(t+.2);whr.tr.stop(t+.2)}catch(e){}whr=null}
function humOn(){var a=ac();if(!a||MUTED||hum)return;try{
var o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();
o.type='sawtooth';o.frequency.value=55;f.type='lowpass';f.frequency.value=300;
g.gain.value=0;g.gain.setTargetAtTime(.09,a.currentTime,.08);
o.connect(f);f.connect(g);g.connect(a.destination);o.start();hum={o:o,g:g}}catch(e){}}
function humOff(){if(!hum)return;try{var a=AC,t=a.currentTime;hum.g.gain.setTargetAtTime(0,t,.06);hum.o.stop(t+.25)}catch(e){}hum=null}

/* ============ MUSIK ============ */
var mStep=0,mNext=0,BOOSTM=false;
var LEAD=[523,659,784,1047,440,523,659,880,349,440,523,698,392,494,587,784];
var BASS=[65,0,0,65,55,0,0,55,44,0,0,44,49,0,49,0];
function mTick(){
var a=AC;if(!a)return;
var SPB=60/(BOOSTM?164:136)/2;
while(mNext<a.currentTime+.15){
var s=mStep%16,at=Math.max(0,mNext-a.currentTime);
if(s%8===0)tone(92,.1,'sine',.4,at,38);
if(s%8===4){noiz(.05,.12,at,2200);tone(190,.04,'triangle',.09,at)}
if(s%2)noiz(.012,.02,at,6500);
var b=BASS[s];if(b)tone(b,.16,'sawtooth',.08,at);
var l=LEAD[s];if(l){tone(l,.09,'square',BOOSTM?.05:.038,at);tone(l,.07,'square',BOOSTM?.018:.013,at+SPB*.75)}
if(BOOSTM&&s%4===2)tone(LEAD[(s+4)%16]*2,.05,'square',.02,at);
mStep++;mNext+=SPB;
}}
setInterval(function(){var a=AC;if(!a)return;if(state!=='play'){mNext=a.currentTime+.06;return}mTick()},40);

/* ============ STATE ============ */
var state='ready',score=0,rings=0,best=BEST,boost=0,boostOn=false,boostT=0,
camX=0,speed=6.2,milestone=1,shake=0,flash=0,wflash=0,iframe=0,frame=0,
CY=200,CX=120,vy=0,grounded=true,rot=0,overT=0,eyeB=0,
bestNew=false,banner=null,pinged=false,runF=.8,hitstop=0,
wob={p:0,v:0},qwob={p:0,v:0},
ents=[],parts=[],pops=[],dusts=[],lostRings=[],clouds=[],clouds2=[],trail=[];
/* laser & boss */
var laser=null,laserCd=520,boss=null,bossWarnT=0,bossNext=50;
function gy(wx){return 242-(Math.sin(wx*0.0045)*13+Math.sin(wx*0.012)*5)}
for(var i=0;i<5;i++)clouds.push({x:Math.random()*404,y:14+Math.random()*55,s:.08+Math.random()*.12,w:44+Math.random()*46});
for(i=0;i<4;i++)clouds2.push({x:Math.random()*404,y:48+Math.random()*45,s:.26+Math.random()*.16,w:62+Math.random()*58});
function reset(){
score=0;rings=0;boost=0;boostOn=false;boostT=0;speed=6.2;milestone=1;
camX=0;CY=gy(120)-16;vy=0;grounded=true;rot=0;iframe=0;
wob.p=0;wob.v=0;qwob.p=0;qwob.v=0;hitstop=0;
ents=[];parts=[];pops=[];dusts=[];lostRings=[];trail=[];
banner=null;bestNew=false;pinged=false;whirrOff();humOff();
laser=null;boss=null;bossWarnT=0;bossNext=50;laserCd=520;
rgEl.textContent='0';scEl.textContent='0';
nextRing=200;nextFoe=600;nextStuff=900;nextDecor=1500;
}
var nextRing=200,nextFoe=600,nextStuff=900,nextDecor=1500;

/* ============ INPUT ============ */
function jump(){
ac();
if(state==='ready'){state='play';reset();return}
if(state==='dead'){if(performance.now()-overT>800){state='play';reset()}return}
if(grounded){vy=-13.2;grounded=false;wob.v=-.35;qwob.v=-.55;sJump();whirrOn()}
}
function doBoost(){
ac();
if(state!=='play')return;
if(!boostOn&&boost>=25){boostOn=true;boostT=0;wflash=1;sBoost();humOn()}
}
document.getElementById('jumpB').addEventListener('pointerdown',function(e){e.preventDefault();jump()});
document.getElementById('boostB').addEventListener('pointerdown',function(e){e.preventDefault();doBoost()});
document.addEventListener('pointerdown',function(e){if(e.target.closest('.pads,.mbtn'))return;if(e.clientX<innerWidth/2)doBoost();else jump()});
document.addEventListener('keydown',function(e){if((e.code==='Space'||e.code==='ArrowUp')&&!e.repeat){e.preventDefault();jump()}if(e.code==='KeyB'&&!e.repeat)doBoost()});

/* ============ SETTING SOUND ============ */
var mb=document.getElementById('muteB');
mb.addEventListener('pointerdown',function(e){
e.preventDefault();e.stopPropagation();
MUTED=!MUTED;mb.textContent=MUTED?'🔇':'🔊';
try{localStorage.setItem('dash_mute',MUTED?'1':'0')}catch(e2){}
if(MUTED){whirrOff();humOff()}
else{ac();if(state==='play'){if(!grounded)whirrOn();if(boostOn)humOn()}}
});
if(MUTED)mb.textContent='🔇';

/* ============ SPAWN (dihambat saat boss) ============ */
function spawn(){
var wx=camX+W+40;
while(nextRing<wx){
var arc=3+Math.floor(Math.random()*4),bx=nextRing;
for(var k=0;k<arc;k++)ents.push({t:'ring',x:bx+k*34,y:-30-Math.sin(k/arc*Math.PI)*34,got:false,ph:Math.random()*6});
nextRing+=140+Math.random()*220;
}
if(!boss&&bossWarnT<=0&&nextFoe<wx){
ents.push({t:Math.random()<.55?'foe':'spike',x:nextFoe,hp:1,ph:Math.random()*6,v:1+Math.random()});
nextFoe+=420+Math.random()*420;
}
if(!boss&&bossWarnT<=0&&nextStuff<wx){
var r=Math.random();
ents.push({t:r<.45?'spring':r<.75?'pad':'ringline',x:nextStuff,ph:0});
nextStuff+=520+Math.random()*500;
}
if(nextDecor<wx){
var dr=Math.random();
if(dr<.5){var n2=1+Math.floor(Math.random()*3);for(var d2=0;d2<n2;d2++)ents.push({t:'flower',x:nextDecor+d2*16,ph:Math.random()*6,col:Math.floor(Math.random()*3)})}
else if(dr<.8)ents.push({t:'bush',x:nextDecor,ph:Math.random()*6});
else ents.push({t:'sign',x:nextDecor});
nextDecor+=260+Math.random()*340;
}
ents=ents.filter(function(e2){return e2.x>camX-80});
}

/* ============ FX ============ */
function burst(px,py,n,c){for(var i=0;i<n;i++)parts.push({x:camX+px,y:py,vx:(Math.random()-.5)*7,vy:-Math.random()*5,life:1,c:c,s:2+Math.random()*2.5})}
function dustF(n){for(var i=0;i<n;i++)dusts.push({x:camX+CX+(Math.random()-.5)*16,y:gy(camX+CX)-2,vx:-1-Math.random()*2,vy:-Math.random()*.6,r:2+Math.random()*3,t:1})}
function popup(sx,y,txt,c){pops.push({sx:sx,y:y,t:1,txt:txt,c:c})}
/* RING: hilang 10% saja (min 1, max 14 visual) — sisanya tetep */
function scatterRings(){
var n=Math.min(14,Math.max(1,Math.floor(rings*.1)));
for(var i=0;i<n;i++)lostRings.push({x:camX+CX,y:CY-10,vx:(Math.random()-.5)*7,vy:-4-Math.random()*5,life:2.6,ph:Math.random()*6});
rings-=n;rgEl.textContent=rings;
return n;
}

/* ============ DIE / HURT (laserHit bypass boost) ============ */
function die(){
state='dead';overT=performance.now();whirrOff();humOff();
sDie();shake=14;flash=1;wob.v=2.4;
laser=null;boss=null;bossWarnT=0;
burst(CX,CY,40,'#58c7ff');
if(score>best){best=score;bsEl.textContent=best;saveBest();bestNew=true;sBest(.9)}
}
function hurt(laserHit){
if(iframe>0)return;
if(!laserHit&&boostOn)return;
if(rings>0){var n=scatterRings();iframe=110;sHurt();shake=10;flash=.6;wob.v=1.1;qwob.v=1.4;popup(CX,CY-26,'-'+n,'#ff5c7a')}
else die();
}

/* ============ TURRET LASER (musuh pojok kanan) ============ */
/* fase: 0 enter(22f) · 1 warn 50f (tracking merah, 16f akhir kedip cepat) ·
   2 FIRE 16f (< airtime lompat 33f → lompat = aman sampai mendarat) ·
   3 cool keluar */
function updLaser(){
if(!laser)return;
laser.t++;
if(laser.ph===0){
laser.ex+=(W-34-laser.ex)*.14;
laser.y+=(CY-laser.y)*.2;
if(laser.t>=22){laser.ph=1;laser.t=0}
}else if(laser.ph===1){
if(laser.fromBoss)laser.ex=boss?boss.x-28:laser.ex;
laser.y+=(CY-laser.y)*.3;
var fast=laser.t>=34;
if(!fast){if(laser.t%10===0)sTick()}
else{if(laser.t%4===0)sTickF()}
if(laser.t>=50){laser.ph=2;laser.t=0;laser.lockY=laser.y;sLaser();shake=Math.max(shake,4)}
}else if(laser.ph===2){
shake=Math.max(shake,2.2);
if(frame%2===0)parts.push({x:camX+Math.random()*W,y:laser.lockY+(Math.random()-.5)*9,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2.5,life:.4,c:Math.random()<.5?'#fff':'#ff9a8a',s:1.8});
if(iframe<=0&&Math.abs(CY-laser.lockY)<17)hurt(true);
if(laser.t>=16){laser.ph=3;laser.t=0}
}else{
if(laser.fromBoss){if(laser.t>=14)laser=null}
else{laser.ex+=7;if(laser.t>=22||laser.ex>W+70)laser=null}
}
}

/* ============ BOSS ============ */
function spawnBoss(){boss={x:W+70,y:70,hp:3,t:0,mode:'enter',shots:3,gap:12,flash:0}}
function bossHit(){
if(!boss||boss.mode==='die')return;
boss.hp--;boss.flash=12;hitstop=5;shake=8;
burst(boss.x,boss.y,20,'#ffd75e');burst(boss.x,boss.y,14,'#ff8a8a');
sBossHit();popup(boss.x,boss.y-34,'HIT!','#ffd75e');
if(boss.hp<=0){boss.mode='die';boss.t=0;sBossDie()}
else{boss.mode='return';boss.t=0}
}
function updBoss(){
if(!boss)return;
boss.t++;
if(boss.flash>0)boss.flash--;
if(boss.mode==='enter'){
boss.x+=(W-70-boss.x)*.07;boss.y=70+Math.sin(frame*.05)*6;
if(boss.t>40){boss.mode='hover';boss.t=0}
}else if(boss.mode==='hover'){
boss.x+=(W-70-boss.x)*.05;boss.y=70+Math.sin(frame*.05)*8;
if(boss.t>50){boss.mode='laser';boss.t=0;boss.shots=3;boss.gap=10}
}else if(boss.mode==='laser'){
var ty=(laser?laser.y:CY)-20;
boss.y+=(ty-boss.y)*.12;
if(!laser){
if(boss.gap>0)boss.gap--;
else if(boss.shots>0){laser={t:0,ph:1,y:CY,lockY:0,ex:boss.x-28,fromBoss:true};boss.shots--;boss.gap=58}
else{boss.mode='hover2';boss.t=0}
}
}else if(boss.mode==='hover2'){
boss.y+=(78-boss.y)*.08;
if(boss.t>34){boss.mode='swoop';boss.t=0;sSwoop()}
}else if(boss.mode==='swoop'){
var gY=gy(camX+CX)-40;
if(boss.t<22){boss.y+=(gY-boss.y)*.16;boss.x+=(W-52-boss.x)*.1}
else{boss.x-=7.6;boss.y=gY+Math.sin(frame*.3)*2}
var dx=Math.abs(boss.x-CX),dy=Math.abs(boss.y-CY);
if(dx<42&&dy<36){
if(boostOn)bossHit();
else if(!grounded&&vy>0.5&&CY<boss.y-6){bossHit();vy=-12}
else hurt(true);
}
if(boss.x<-80){boss.mode='return';boss.t=0}
}else if(boss.mode==='return'){
boss.x+=(W-70-boss.x)*.08;boss.y+=(70-boss.y)*.09;
if(boss.t>26){boss.mode='hover';boss.t=0}
}else if(boss.mode==='die'){
boss.x+=Math.sin(frame*.8)*1.5;boss.y+=Math.sin(frame*.5)*1;
if(boss.t%6===0){burst(boss.x+(Math.random()-.5)*44,boss.y+(Math.random()-.5)*22,12,Math.random()<.5?'#ffd75e':'#ff9a8a');noiz(.12,.12,0,1200)}
if(boss.t>=64){
burst(boss.x,boss.y,50,'#ffd75e');burst(boss.x,boss.y,30,'#ff8a8a');
rings+=25;rgEl.textContent=rings;score+=500;
popup(CX,CY-40,'+25 RINGS','#ffd75e');
banner={t:0,txt:'BOSS DOWN! +500'};
sBest(.3);
boss=null;bossNext=rings+60;laserCd=Math.max(laserCd,300);
}
}
}

/* ============ UPDATE ============ */
function update(){
frame++;
if(hitstop>0){hitstop--;return}
shake=Math.max(0,shake-.5);flash=Math.max(0,flash-.035);wflash=Math.max(0,wflash-.06);
wob.v+=-wob.p*.3-wob.v*.12;wob.p+=wob.v;
qwob.v+=-qwob.p*.32-qwob.v*.16;qwob.p+=qwob.v;
if(iframe>0)iframe--;
if(frame%160===0)eyeB=5;if(eyeB>0)eyeB--;
if(banner){banner.t+=.016;if(banner.t>1)banner=null}
for(var i=parts.length-1;i>=0;i--){var q=parts[i];q.x+=q.vx;q.y+=q.vy;q.vy+=.22;if((q.life-=.03)<=0)parts.splice(i,1)}
for(i=dusts.length-1;i>=0;i--){var du=dusts[i];du.x+=du.vx;du.y+=du.vy;du.r+=.32;if((du.t-=.05)<=0)dusts.splice(i,1)}
for(i=pops.length-1;i>=0;i--){if((pops[i].t-=.045)<=0)pops.splice(i,1)}
clouds.forEach(function(c){c.x-=c.s*(state==='play'?1:.3);if(c.x<-70)c.x=404+Math.random()*80});
clouds2.forEach(function(c){c.x-=c.s*(state==='play'?1:.3);if(c.x<-90)c.x=404+Math.random()*90});
if(state!=='play')return;
var sp=speed+(boostOn?4.5:0);
runF=speed*.13;
camX+=sp;
score+=Math.round(sp*.12);
if(frame%6===0)scEl.textContent=score;
if(boostOn){boost-=1.4;boostT++;if(boost<=0||boostT>110){boostOn=false;humOff()}}
if(boost>=25&&!pinged){pinged=true;sReady()}
if(boost<20)pinged=false;
if(score>=milestone*500){milestone++;speed=Math.min(9.2,speed+.5);banner={t:0,txt:'SPEED UP!'};sMile()}
/* --- turret laser scheduler --- */
if(!laser&&!boss&&bossWarnT<=0&&score>700){
laserCd--;
if(laserCd<=0){
laser={t:0,ph:0,y:CY,lockY:0,ex:W+60,fromBoss:false};
sAlarm();popup(W-72,150,'⚠ LASER!','#ff5c7a');
laserCd=470+Math.random()*260;
}
}
updLaser();
/* --- boss trigger + danger notif --- */
if(!boss&&bossWarnT<=0&&rings>=bossNext){bossWarnT=150}
if(bossWarnT>0){
bossWarnT--;
if(frame%26===0){var kk=Math.floor(bossWarnT/26)%2;tone(kk?460:690,.2,'sawtooth',.15);tone(kk?690:460,.2,'sawtooth',.1,.21)}
if(bossWarnT===0){spawnBoss();tone(150,.5,'sawtooth',.18,0,60)}
}
BOOSTM=(bossWarnT>0||!!boss);
updBoss();
/* fisika */
var wasG=grounded,g=gy(camX+CX);
if(!grounded){vy+=.8;CY+=vy;if(CY>=g-16){CY=g-16;vy=0;grounded=true}}
else{CY=g-16}
if(!wasG&&grounded){dustF(8);wob.v=.5;qwob.v=.9;whirrOff()}
if(whr&&!grounded){try{var bf=430+sp*38+Math.abs(vy)*13;whr.o.frequency.value=bf;whr.o2.frequency.value=bf*1.5}catch(e){}}
rot+=(grounded?sp*.045:.42);
if(grounded&&!boostOn)rot=0;
if(boostOn){trail.push({x:camX+CX,y:CY});if(trail.length>12)trail.shift()}
else trail.length=0;
/* entitas */
spawn();
for(var j=ents.length-1;j>=0;j--){
var e2=ents[j],sx=e2.x-camX;
if(e2.t==='ring'&&!e2.got){
e2.ph+=.15;
var ey=gy(e2.x)+e2.y,dx=sx-CX,dy=ey-CY;
if(dx*dx+dy*dy<24*24){e2.got=true;rings++;rgEl.textContent=rings;score+=10;boost=Math.min(100,boost+7);sRing();burst(sx,ey,5,'#ffd75e');popup(sx,ey-8,'+10','#ffd75e')}
}else if(e2.t==='foe'){
e2.x-=e2.v;
if(frame%40===0&&Math.random()<.6)parts.push({x:camX+e2.x-14,y:gy(e2.x)-6,vx:-1,vy:-.3,life:.4,c:'#99a',s:2.5});
var fy=gy(e2.x),fsx=e2.x-camX;
var hitX=Math.abs(fsx-CX)<22,hitY=Math.abs((CY+10)-(fy-10))<20;
if(hitX&&hitY){
if(boostOn||(!grounded&&vy>1&&CY<fy-18)){
ents.splice(j,1);score+=100;hitstop=4;sPop();burst(fsx,fy-12,16,'#ff8a8a');popup(fsx,fy-24,'+100','#ff8a8a');if(!boostOn)vy=-9;
}else hurt();
}
}else if(e2.t==='spike'){
var ssx=e2.x-camX,sy2=gy(e2.x);
if(Math.abs(ssx-CX)<14&&CY+14>sy2-16&&CY<sy2)hurt();
}else if(e2.t==='spring'){
var psx=e2.x-camX,py2=gy(e2.x);
if(Math.abs(psx-CX)<16&&CY+14>py2-20&&CY<py2+6){vy=-19;grounded=false;wob.v=-.6;qwob.v=-1;sSpring();whirrOn();e2.ph=1;burst(psx,py2-10,7,'#ff5c7a');popup(psx,py2-30,'BOING!','#ff5c7a')}
}else if(e2.t==='pad'){
var px2=e2.x-camX;
if(Math.abs(px2-CX)<16&&!e2.used){e2.used=true;boost=Math.min(100,boost+35);boostOn=true;boostT=0;wflash=1;sBoost();humOn();popup(px2,gy(e2.x)-30,'DASH!','#ffd75e')}
}else if(e2.t==='ringline'){
for(var k=0;k<5;k++){var rx=e2.x+k*36;ents.push({t:'ring',x:rx,y:-24,got:false,ph:Math.random()*6})}
ents.splice(j,1);continue;
}
}
/* ring terlepas (ambil lagi) */
for(i=lostRings.length-1;i>=0;i--){var r2=lostRings[i];
r2.x+=r2.vx;r2.vx*=.99;r2.vy+=.34;r2.y+=r2.vy;r2.life-=.016;r2.ph+=.2;
var g2=gy(r2.x);
if(r2.y>g2-8){r2.y=g2-8;r2.vy*=-.5}
var rdx=(r2.x-camX)-CX,rdy=r2.y-CY;
if(r2.life<2.3&&rdx*rdx+rdy*rdy<22*22){r2.life=0;rings++;rgEl.textContent=rings;sRing();burst(CX,CY,5,'#ffd75e')}
if(r2.life<=0)lostRings.splice(i,1);
}
if(boostOn&&frame%3===0)parts.push({x:camX+CX-14,y:CY+8,vx:-2,vy:(Math.random()-.5)*2,life:.5,c:'#ffd75e',s:2});
if(CY>H+60)die();
}

/* ============ DRAW HELPERS ============ */
function ell(px,py,rx,ry){x.beginPath();x.ellipse(px,py,rx,ry,0,0,7);x.fill()}
function rr(px,py,w2,h2,r2){x.beginPath();x.moveTo(px+r2,py);x.lineTo(px+w2-r2,py);x.quadraticCurveTo(px+w2,py,px+w2,py+r2);x.lineTo(px+w2,py+h2-r2);x.quadraticCurveTo(px+w2,py+h2,px+w2-r2,py+h2);x.lineTo(px+r2,py+h2);x.quadraticCurveTo(px,py+h2,px,py+h2-r2);x.lineTo(px,py+r2);x.quadraticCurveTo(px,py,px+r2,py);x.closePath()}
function cloudC(cx2,cy2,w3,al){
x.fillStyle='rgba(255,255,255,'+al+')';ell(cx2,cy2,w3/2,11);ell(cx2+w3*.28,cy2-7,w3*.3,9);ell(cx2-w3*.25,cy2-4,w3*.26,8);
x.fillStyle='rgba(150,200,255,'+(al*.3)+')';ell(cx2,cy2+5,w3*.42,5.5);
}
function frond(a3){
x.save();x.rotate(a3);
x.fillStyle='#2f9e4f';x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(14,-9,27,-2);x.quadraticCurveTo(15,3,0,4);x.closePath();x.fill();
x.fillStyle='rgba(190,255,190,.3)';x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(13,-5,24,-1);x.quadraticCurveTo(13,1,0,2);x.closePath();x.fill();
x.restore();
}
function palm(px,py){
x.save();x.translate(px,py);x.rotate(-.06);
var tg2=x.createLinearGradient(-4,0,4,0);tg2.addColorStop(0,'#7a5230');tg2.addColorStop(1,'#4a2c12');
x.fillStyle=tg2;x.fillRect(-3.5,-52,7,52);
x.fillStyle='rgba(0,0,0,.18)';for(var s4=0;s4<5;s4++)x.fillRect(-3.5,-52+s4*11+8,7,3);
x.translate(0,-52);
frond(-2.5);frond(-2.0);frond(-1.3);frond(-.6);frond(-.05);frond(.6);
x.fillStyle='#6b4423';ell(-4,2,3,3);ell(4,3,3,3);
x.restore();
}
function quill(a3,L3){
x.save();x.rotate(a3);
x.fillStyle='#0d47a1';x.beginPath();x.moveTo(-6,-4);
x.quadraticCurveTo(-L3,-L3*.1,-L3-5,L3*.32);
x.quadraticCurveTo(-L3+3,L3*.34,-6,4);x.closePath();x.fill();
x.restore();
}
function shoe(px,py){
x.save();x.translate(px,py);
var g3=x.createLinearGradient(0,-4,0,5);g3.addColorStop(0,'#ff5563');g3.addColorStop(1,'#b3121f');
x.fillStyle=g3;x.beginPath();x.moveTo(-6,-3);x.lineTo(4,-3);x.quadraticCurveTo(8,-3,8,1);x.quadraticCurveTo(8,5,3,5);x.lineTo(-6,5);x.quadraticCurveTo(-9,5,-9,1);x.quadraticCurveTo(-9,-3,-6,-3);x.fill();
x.fillStyle='#fff';x.fillRect(-6,-1,13,2);
x.fillStyle='#cfd8e3';x.fillRect(-8,3,15,2);
x.restore();
}
/* ============ KARAKTER ============ */
function drawChar(){
if(iframe>0&&Math.floor(frame/4)%2===0)return;
var spinning=!grounded||boostOn;
var sp=speed+(boostOn?4.5:0);
var lean=state==='play'?Math.min(.32,sp*.026+(boostOn?.1:0)):0;
var bob=(!spinning&&state==='play')?Math.abs(Math.sin(frame*runF))*3.4:0;
var sy=1,sx2=1;
if(spinning){if(vy<-4){sy=1.14;sx2=.9}else if(vy>3){sy=1.08;sx2=.94}}
else{sy=1-wob.p*.24;sx2=1+wob.p*.18}
if(state==='ready'){sy=1+Math.sin(frame*.05)*.025;sx2=1-Math.sin(frame*.05)*.02}
var jig=boostOn?Math.sin(frame*1.6)*1.3:0;
x.save();
x.translate(CX+jig,CY+bob-wob.p*4);
if(!spinning)x.rotate(lean);
x.scale(sx2,sy);
if(spinning){
if(boostOn){x.shadowColor='#ffd75e';x.shadowBlur=22}else{x.shadowColor='#58c7ff';x.shadowBlur=12}
x.globalAlpha=.22;x.fillStyle=boostOn?'#ffd75e':'#58c7ff';x.beginPath();x.arc(-4,0,17,0,7);x.fill();x.globalAlpha=1;
x.shadowBlur=0;
var g2=x.createRadialGradient(-4,-5,2,0,0,14);g2.addColorStop(0,'#8fd4ff');g2.addColorStop(.55,'#1a6ed6');g2.addColorStop(1,'#0b3f8f');
x.fillStyle=g2;x.beginPath();x.arc(0,0,13.5,0,7);x.fill();
x.save();x.rotate(rot);
for(var q2=0;q2<3;q2++){
x.rotate(2.094);x.fillStyle='#0d47a1';
x.beginPath();x.moveTo(4,-3);x.quadraticCurveTo(13,-6,15,3);x.quadraticCurveTo(10,6,4,4);x.closePath();x.fill();
}
x.restore();
x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=2.2;
x.beginPath();x.arc(0,0,9.5,rot*1.7,rot*1.7+1.1);x.stroke();
x.beginPath();x.arc(0,0,9.5,rot*1.7+3.14,rot*1.7+4.24);x.stroke();
x.strokeStyle=boostOn?'rgba(255,215,94,.5)':'rgba(88,199,255,.4)';x.lineWidth=1.5;
x.beginPath();x.arc(-1,0,17,-.8,.9);x.stroke();
x.beginPath();x.arc(1,0,19,2.4,4.1);x.stroke();
if(frame%9<5){x.fillStyle='#e82d4a';x.beginPath();x.arc(Math.cos(rot*2)*9,Math.sin(rot*2)*9,4.5,0,7);x.fill()}
}else{
var sway=state==='play'?Math.sin(frame*runF*.5)*.07:Math.sin(frame*.03)*.03;
quill(-.5-lean*.6-qwob.p*.4+sway,15);
quill(.05-lean*.5-qwob.p*.32-sway*.6,19);
quill(.6-lean*.4-qwob.p*.24+sway*.4,15);
var cg=x.createRadialGradient(-3,-6,2,0,0,15);cg.addColorStop(0,'#6fc6ff');cg.addColorStop(.5,'#1a6ed6');cg.addColorStop(1,'#0b3f8f');
x.fillStyle=cg;x.beginPath();x.arc(0,0,13.5,0,7);x.fill();
x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1.5;x.beginPath();x.arc(0,0,12.5,-2.4,-1.2);x.stroke();
x.fillStyle='#0d47a1';x.beginPath();x.moveTo(-6,-11);x.lineTo(-3,-16);x.lineTo(-.5,-11);x.closePath();x.fill();
x.fillStyle='#f2c99a';x.beginPath();x.moveTo(-5,-11.5);x.lineTo(-3,-14.3);x.lineTo(-1.5,-11.5);x.closePath();x.fill();
x.fillStyle='#f7dcc0';ell(3,7,6.5,5.2);
x.fillStyle='#f2c99a';ell(8.5,2,5,4.6);
x.fillStyle='#111';ell(12.6,-1.6,2.2,1.7);
x.strokeStyle='rgba(90,50,20,.4)';x.lineWidth=1;x.beginPath();x.moveTo(9,3.5);x.quadraticCurveTo(11,5,12.5,3.8);x.stroke();
var eyD=wob.p*5;
x.fillStyle='#fff';ell(3.5,-6+eyD,4.6,5.4);ell(8.5,-6+eyD,4,5);
if(eyeB>0){x.fillStyle='#1a6ed6';x.fillRect(-1.5,-11.5+eyD,16,5.5)}
else{
x.fillStyle='#0a2a4a';ell(4.5,-5.5+eyD,1.7,2.2);ell(9.3,-5.5+eyD,1.5,2);
x.fillStyle='#fff';ell(5,-6.5+eyD,.7,.9);ell(9.7,-6.5+eyD,.6,.8);
}
var ph2=frame*runF;
if(state==='play'&&speed>7.4){
x.fillStyle='rgba(232,45,74,.85)';ell(1,13,10,5.5);
x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=2;
x.beginPath();x.arc(1,13,6,ph2,ph2+1.6);x.stroke();
x.beginPath();x.arc(1,13,6,ph2+3.14,ph2+4.74);x.stroke();
}else if(state==='play'){
shoe(-4+Math.cos(ph2)*6,13+Math.sin(ph2)*1.5+Math.abs(Math.sin(frame*runF))*1.2);
shoe(5+Math.cos(ph2+3.14)*6,13+Math.sin(ph2+3.14)*1.5+Math.abs(Math.cos(frame*runF))*1.2);
}else{
var tapB=Math.abs(Math.sin(frame*.12))*2.5;
shoe(-5,14);shoe(6,14-tapB);
}
}
x.restore();
}

/* ============ TURRET + AIM + BEAM ============ */
function drawTurret(){
if(!laser||laser.fromBoss)return;
var ex=laser.ex,ey=laser.ph<2?laser.y:laser.lockY;
x.save();x.translate(ex,ey);
x.fillStyle='rgba(255,150,60,.8)';ell(-16,4,5+Math.sin(frame*.9)*2,3);
var hg=x.createLinearGradient(0,-14,0,14);hg.addColorStop(0,'#8a92a0');hg.addColorStop(1,'#3a4150');
x.fillStyle=hg;rr(-14,-13,28,26,7);x.fill();
x.strokeStyle='#20242c';x.lineWidth=2;x.stroke();
var lf=laser.ph===2;
x.fillStyle=lf?'#fff':'#ff2a3c';
x.shadowColor='#ff2a3c';x.shadowBlur=lf?12:4+(laser.ph===1?laser.t/50*8:0);
ell(-2,0,6,6);x.shadowBlur=0;
x.fillStyle='#4a505c';x.beginPath();x.moveTo(14,-6);x.lineTo(22,-12);x.lineTo(20,2);x.closePath();x.fill();
x.strokeStyle='#666';x.lineWidth=1.5;x.beginPath();x.moveTo(6,-13);x.lineTo(6,-19);x.stroke();
x.fillStyle=Math.sin(frame*.4)>0?'#ffd75e':'#7a5a10';ell(6,-21,2.2,2.2);
x.restore();
}
function drawAim(){
if(!laser||laser.ph!==1)return;
var fast=laser.t>=34;
var blink=fast?(Math.sin(frame*.9)>0):(Math.sin(frame*.28)>0);
var y=laser.y;
x.save();
x.globalAlpha=blink?(fast?.95:.7):.3;
x.strokeStyle='#ff2a3c';x.lineWidth=fast?2.5:1.5;
x.setLineDash([10,8]);x.lineDashOffset=-frame*(fast?2.4:.8);
x.beginPath();x.moveTo(laser.ex-10,y);x.lineTo(6,y);x.stroke();
x.setLineDash([]);
x.globalAlpha=blink?.4:.15;x.lineWidth=6;x.beginPath();x.moveTo(laser.ex-10,y);x.lineTo(6,y);x.stroke();
x.globalAlpha=blink?1:.35;
x.fillStyle='#ff2a3c';x.font='900 15px Arial';x.textAlign='center';
x.fillText('⚠',CX,y-26-(fast?Math.sin(frame*.8)*2:0));
x.textAlign='left';
x.restore();x.globalAlpha=1;
}
function drawBeam(){
if(!laser||laser.ph!==2)return;
var t=laser.t,D=16;
var fade=t<2?t/2:(t>D-3?(D-t)/3:1);
var y=laser.lockY,ex=laser.ex;
x.save();
function beamPath(lw,st,al){
x.globalAlpha=fade*al;
x.strokeStyle=st;x.lineWidth=lw;x.lineCap='round';
x.beginPath();x.moveTo(ex,y);
for(var bx2=ex-6;bx2>-8;bx2-=7){
var off=Math.sin(bx2*.045+frame*1.15)*5.5+Math.sin(bx2*.017-frame*.65)*3;
x.lineTo(bx2,y+off);
}
x.stroke();
}
beamPath(13,'rgba(255,60,40,.35)',1);
beamPath(7,'rgba(255,120,80,.6)',1);
beamPath(3.2,'#ff6a4a',1);
beamPath(1.4,'#fff',1);
x.globalAlpha=fade;
var mg=x.createRadialGradient(ex,y,2,ex,y,16);
mg.addColorStop(0,'#fff');mg.addColorStop(.4,'rgba(255,120,80,.8)');mg.addColorStop(1,'rgba(255,60,40,0)');
x.fillStyle=mg;ell(ex,y,16,16);
if(frame%2===0)parts.push({x:camX+4,y:y+(Math.random()-.5)*10,vx:-1-Math.random()*2,vy:(Math.random()-.5)*3,life:.5,c:'#ffb0a0',s:2});
x.restore();x.globalAlpha=1;
}

/* ============ BOSS + DANGER NOTIF ============ */
function hazBar(y0){
x.save();x.beginPath();x.rect(0,y0,W,16);x.clip();
x.fillStyle='#180208';x.fillRect(0,y0,W,16);
var off=(frame*3)%24;
for(var hx=-24;hx<W+24;hx+=24){
x.fillStyle=(Math.floor((hx+off)/24)%2)?'#e03040':'#111';
x.save();x.translate(hx+off,y0);x.transform(1,0,-.6,1,0,0);x.fillRect(0,0,12,16);x.restore();
}
x.restore();
}
function drawBoss(){
if(!boss)return;
var bx=boss.x,by=boss.y;
x.save();x.translate(bx,by);
if(boss.mode==='die')x.translate((Math.random()-.5)*4,(Math.random()-.5)*4);
/* turbine + api */
x.fillStyle='rgba(255,160,60,.7)';ell(0,26+Math.sin(frame*.9)*2,9,4);
x.fillStyle='#fff';ell(0,26,4,2);
/* sayap */
x.fillStyle='#4a505c';x.beginPath();x.moveTo(-44,-6);x.lineTo(-58,-14);x.lineTo(-52,4);x.closePath();x.fill();
x.beginPath();x.moveTo(44,-6);x.lineTo(58,-14);x.lineTo(52,4);x.closePath();x.fill();
/* badan */
var hg=x.createLinearGradient(0,-26,0,26);hg.addColorStop(0,'#aeb6c4');hg.addColorStop(.5,'#68707e');hg.addColorStop(1,'#3a4150');
x.fillStyle=hg;ell(0,0,46,26);
/* strip hazard badan */
x.save();x.beginPath();x.ellipse(0,10,44,12,0,0,7);x.clip();
for(var hz2=-4;hz2<9;hz2++){
x.fillStyle=hz2%2?'#e03040':'#1a1e26';
x.save();x.translate(-46+hz2*13+(frame%13),-6);x.transform(1,0,-.6,1,0,0);x.fillRect(0,0,7,26);x.restore();
}
x.restore();
x.strokeStyle='#20242c';x.lineWidth=2.5;x.beginPath();x.ellipse(0,0,46,26,0,0,7);x.stroke();
/* kubah kokpit */
var dg=x.createRadialGradient(-8,-14,3,0,-10,18);dg.addColorStop(0,'#ffd0d8');dg.addColorStop(.4,'#e03550');dg.addColorStop(1,'#701020');
x.fillStyle=dg;ell(0,-12,20,14);
/* mata marah ngejar player */
var eT=Math.atan2(CY-by,CX-bx);
var exx=Math.cos(eT)*3,eyy=Math.sin(eT)*2;
x.fillStyle='#fff';ell(-6,-14,5,5.5);ell(7,-14,4.5,5);
x.fillStyle='#111';ell(-6+exx,-14+eyy,2,2.5);ell(7+exx,-14+eyy,1.8,2.3);
x.strokeStyle='#3a1018';x.lineWidth=3;
x.beginPath();x.moveTo(-11,-20);x.lineTo(-2,-17);x.moveTo(12,-20);x.lineTo(3,-17);x.stroke();
/* meriam laser bawah */
x.fillStyle='#2a2e38';x.fillRect(-10,12,20,10);
var firing=laser&&laser.fromBoss&&laser.ph===2;
var aiming=laser&&laser.fromBoss&&laser.ph===1;
x.fillStyle=firing?'#fff':'#ff2a3c';
if(firing||aiming){x.shadowColor='#ff2a3c';x.shadowBlur=firing?12:6}
ell(0,20,5,4);x.shadowBlur=0;
/* antena kedip */
x.strokeStyle='#666';x.lineWidth=2;x.beginPath();x.moveTo(0,-24);x.lineTo(0,-34);x.stroke();
x.fillStyle=Math.sin(frame*.3)>0?'#ffd75e':'#7a5a10';ell(0,-36,3,3);
/* flash kena hit */
if(boss.flash>0){x.globalAlpha=boss.flash/12*.8;x.fillStyle='#fff';ell(0,0,46,26);x.globalAlpha=1}
x.restore();
}
function drawDanger(){
if(bossWarnT<=0)return;
x.fillStyle='rgba(150,10,20,'+(.14+.1*Math.abs(Math.sin(frame*.25)))+')';x.fillRect(0,0,W,H);
hazBar(0);hazBar(H-18);
x.textAlign='center';
var jx=(Math.random()-.5)*3,jy=(Math.random()-.5)*2;
x.font='900 27px Arial';
x.lineWidth=6;x.strokeStyle='rgba(20,0,5,.85)';x.strokeText('⚠ DANGER ⚠',W/2+jx,H/2-14+jy);
var tg=x.createLinearGradient(0,H/2-40,0,H/2-8);tg.addColorStop(0,'#ffb0b8');tg.addColorStop(.5,'#ff2a3c');tg.addColorStop(1,'#a01020');
x.fillStyle=tg;x.fillText('⚠ DANGER ⚠',W/2+jx,H/2-14+jy);
x.font='700 11px Arial';x.fillStyle='#ffd0d6';x.fillText('BOSS MENDEKAT — SIAPKAN DIRI!',W/2,H/2+8);
x.textAlign='left';
}

/* ============ DRAW ============ */
function draw(){
x.setTransform(DPR,0,0,DPR,0,0);
if(shake>0)x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake*.7);
/* langit */
var sky=x.createLinearGradient(0,0,0,240);
if(boostOn){sky.addColorStop(0,'#141a52');sky.addColorStop(.55,'#4a2a6e');sky.addColorStop(1,'#7a2a5a')}
else{sky.addColorStop(0,'#1f5fc4');sky.addColorStop(.55,'#5db3ec');sky.addColorStop(1,'#bfe8f5')}
x.fillStyle=sky;x.fillRect(0,0,W,H);
/* matahari */
var su=boostOn?30:26;
x.save();x.translate(334,44);x.rotate(frame*.003);
x.strokeStyle=boostOn?'rgba(255,190,120,.18)':'rgba(255,240,150,.16)';x.lineWidth=3;
for(var r3=0;r3<10;r3++){x.rotate(6.283/10);x.beginPath();x.moveTo(su+4,0);x.lineTo(su+18,0);x.stroke()}
x.restore();
var sg=x.createRadialGradient(334,44,4,334,44,su);
sg.addColorStop(0,boostOn?'#ffefd0':'#fff7cf');sg.addColorStop(.6,boostOn?'#ffa04a':'#ffd75e');sg.addColorStop(1,'rgba(255,215,94,0)');
x.fillStyle=sg;x.beginPath();x.arc(334,44,su,0,7);x.fill();
clouds.forEach(function(c){cloudC(c.x,c.y,c.w,.6)});
x.fillStyle='#27506e';x.beginPath();x.moveTo(0,H);
for(var px=0;px<=W;px+=10){var wx2=px+camX*.12;x.lineTo(px,190-Math.sin(wx2*.004)*26-Math.sin(wx2*.011+2)*9)}
x.lineTo(W,H);x.fill();
x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=3;x.stroke();
clouds2.forEach(function(c){cloudC(c.x,c.y,c.w,.85)});
x.fillStyle='#2f8a5a';x.beginPath();x.moveTo(0,H);
for(px=0;px<=W;px+=10){wx2=px+camX*.3;x.lineTo(px,208-Math.sin(wx2*.004+1)*20-Math.sin(wx2*.011+3)*8)}
x.lineTo(W,H);x.fill();
/* laut */
var wg2=x.createLinearGradient(0,192,0,236);wg2.addColorStop(0,'#4aa8d8');wg2.addColorStop(1,'#1d6fa8');
x.fillStyle=wg2;x.fillRect(0,192,W,60);
x.fillStyle='rgba(230,250,255,.5)';
for(var swx=Math.floor(camX*.2/34)*34;swx<camX*.2+W+34;swx+=34){
if(((swx*2654435761)>>>0)%5<2){x.fillRect(swx-camX*.2,198+((swx*97)%12),5,1.5)}
}
/* palem */
for(var t2=0;t2<4;t2++){var tw=((t2*340-camX*.75)%1400+1400)%1400-80;
if(tw>-60&&tw<464)palm(tw,gy(tw+camX*.75))}
/* tanah */
var dg=x.createLinearGradient(0,230,0,H);dg.addColorStop(0,'#8a5a2b');dg.addColorStop(1,'#4a2c12');
x.fillStyle=dg;x.beginPath();x.moveTo(0,H);
for(px=0;px<=W;px+=8){x.lineTo(px,gy(px+camX))}
x.lineTo(W,H);x.fill();
for(px=0;px<W;px+=16){
var g2b=gy(px+camX);
for(var row=0;row<2;row++){
var chk=(Math.floor((px+camX)/16)+row)%2;
x.fillStyle=chk?'#c89050':'#8a5a2b';
x.fillRect(px,g2b+5+row*7,16,7);
}
}
/* rumput */
var gg=x.createLinearGradient(0,226,0,240);gg.addColorStop(0,'#37b24d');gg.addColorStop(1,'#1f7a33');
x.fillStyle=gg;x.beginPath();x.moveTo(0,H);
for(px=0;px<=W;px+=6){x.lineTo(px,gy(px+camX)-1)}
x.lineTo(W,H);x.lineTo(0,H);x.fill();
x.strokeStyle='#2e9e44';x.lineWidth=1.5;
for(var bw=Math.floor((camX-20)/14)*14;bw<camX+W+20;bw+=14){
var bxx=bw-camX,byy=gy(bw)-1,swy=Math.sin(frame*.06+bw*.05)*2;
x.beginPath();x.moveTo(bxx,byy);x.quadraticCurveTo(bxx+swy,byy-4,bxx+swy*1.4,byy-6);x.stroke();
}
x.fillStyle='#3a2110';
for(var spx=Math.floor((camX-20)/26)*26;spx<camX+W+20;spx+=26){
x.fillRect(spx-camX,gy(spx)+24+(((spx*2654435761)>>>0)%16),2.5,2.5);
}
/* entitas */
var FLC=['#ff8ab5','#ffd75e','#ffffff'];
ents.forEach(function(e2){
var sx=e2.x-camX;if(sx<-60||sx>464)return;
if(e2.t==='flower'){
var fy2=gy(e2.x),sw2=Math.sin(frame*.05+e2.ph)*1.5;
x.strokeStyle='#2f8a5a';x.lineWidth=1.5;x.beginPath();x.moveTo(sx,fy2);x.quadraticCurveTo(sx+sw2,fy2-5,sx+sw2,fy2-9);x.stroke();
x.fillStyle=FLC[e2.col];
for(var p4=0;p4<5;p4++){var pa=p4/5*6.283+e2.ph;ell(sx+sw2+Math.cos(pa)*3,fy2-9+Math.sin(pa)*3,2,2)}
x.fillStyle='#7a4a10';ell(sx+sw2,fy2-9,1.6,1.6);
}else if(e2.t==='bush'){
var byy=gy(e2.x);
x.fillStyle='#256f3a';ell(sx,byy-6,13,8);ell(sx-8,byy-4,8,6);ell(sx+8,byy-4,8,6);
x.fillStyle='#2f9e4f';ell(sx-2,byy-8,8,6);ell(sx+6,byy-6,7,5);
x.fillStyle='#e8455a';ell(sx-6,byy-8,1.5,1.5);ell(sx+4,byy-6,1.5,1.5);ell(sx+9,byy-9,1.5,1.5);
}else if(e2.t==='sign'){
var sy3=gy(e2.x);
x.fillStyle='#8a6a3a';x.fillRect(sx-2,sy3-20,4,20);
rr(sx-22,sy3-32,44,15,3);x.fillStyle='#1f6ed6';x.fill();
x.strokeStyle='#fff';x.lineWidth=1.5;x.stroke();
x.fillStyle='#ffd75e';x.font='900 9px Arial';x.textAlign='center';x.fillText('DASH »',sx,sy3-21);x.textAlign='left';
}else if(e2.t==='ring'&&!e2.got){
var ey=gy(e2.x)+e2.y+Math.sin(frame*.08+e2.ph)*2;
x.fillStyle='rgba(0,0,0,.12)';ell(sx,gy(e2.x)+3,7,2.5);
var w=Math.abs(Math.sin(e2.ph))*10+3;
x.strokeStyle='#c9930a';x.lineWidth=5;x.beginPath();x.ellipse(sx,ey,w,11,0,0,7);x.stroke();
x.strokeStyle='#ffd75e';x.lineWidth=2.5;x.beginPath();x.ellipse(sx,ey,w,11,0,0,7);x.stroke();
x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=1.5;x.beginPath();x.ellipse(sx,ey,w,11,0,-2.2,-1.2);x.stroke();
if((frame+Math.floor(e2.ph*10))%80<14){
x.fillStyle='#fff';x.save();x.translate(sx+w+3,ey-5);x.rotate(frame*.1);
x.beginPath();x.moveTo(0,-4);x.lineTo(1.2,-1.2);x.lineTo(4,0);x.lineTo(1.2,1.2);x.lineTo(0,4);x.lineTo(-1.2,1.2);x.lineTo(-4,0);x.lineTo(-1.2,-1.2);x.closePath();x.fill();x.restore();
}
}else if(e2.t==='foe'){
var fy=gy(e2.x),bo=Math.sin(frame*.2+e2.ph)*1.5;
x.fillStyle='rgba(0,0,0,.18)';ell(sx,fy+2,13,3.5);
x.fillStyle='#222';ell(sx-7,fy-2,4,4);ell(sx+7,fy-2,4,4);
x.strokeStyle='#555';x.lineWidth=1.2;
x.beginPath();x.moveTo(sx-9,fy-2);x.lineTo(sx-5,fy-2);x.moveTo(sx+5,fy-2);x.lineTo(sx+9,fy-2);x.stroke();
var fg=x.createRadialGradient(sx-3,fy-16+bo,2,sx,fy-12+bo,12);
fg.addColorStop(0,'#ff8a8a');fg.addColorStop(.6,'#d62a2a');fg.addColorStop(1,'#8a1a1a');
x.fillStyle=fg;x.beginPath();x.arc(sx,fy-12+bo,11,0,7);x.fill();
x.fillStyle='#111';x.fillRect(sx-10,fy-16+bo,20,5);
x.fillStyle='#fff';ell(sx-4,fy-13.5+bo,2.6,2);ell(sx+4,fy-13.5+bo,2.6,2);
x.fillStyle='#d61f3e';x.fillRect(sx-7,fy-18.5+bo,5,1.5);x.fillRect(sx+2,fy-18.5+bo,5,1.5);
x.strokeStyle='#555';x.lineWidth=1.5;x.beginPath();x.moveTo(sx,fy-23+bo);x.quadraticCurveTo(sx+3,fy-27+bo,sx,fy-30+bo);x.stroke();
var blink2=Math.sin(frame*.25+e2.ph)>0;
x.fillStyle=blink2?'#ffd75e':'#7a5a10';x.beginPath();x.arc(sx,fy-30+bo,2.5,0,7);x.fill();
if(blink2){x.shadowColor='#ffd75e';x.shadowBlur=6;x.beginPath();x.arc(sx,fy-30+bo,2.5,0,7);x.fill();x.shadowBlur=0}
}else if(e2.t==='spike'){
var sy2=gy(e2.x);
x.save();x.beginPath();x.rect(sx-18,sy2-4,36,6);x.clip();
for(var hz=-2;hz<6;hz++){
x.fillStyle=hz%2?'#ffd75e':'#222';x.save();x.translate(sx-18+hz*9,sy2-4);x.transform(1,0,-.5,1,0,0);x.fillRect(0,0,7,6);x.restore();
}
x.restore();
x.fillStyle='#444';x.fillRect(sx-18,sy2-4,36,1.5);
for(var k2=-1;k2<=1;k2++){
var tx=sx+k2*10,mg2=x.createLinearGradient(0,sy2-17,0,sy2);
mg2.addColorStop(0,'#f2f5fa');mg2.addColorStop(.5,'#c9ccd6');mg2.addColorStop(1,'#8a8e9a');
x.fillStyle=mg2;x.beginPath();x.moveTo(tx-6,sy2);x.lineTo(tx+6,sy2);x.lineTo(tx,sy2-17);x.closePath();x.fill();
x.fillStyle='#fff';ell(tx,sy2-15,1.2,2);
}
}else if(e2.t==='spring'){
var sq2=e2.ph>0?Math.max(0,1-e2.ph):1;e2.ph=Math.max(0,e2.ph-.06);
var py2=gy(e2.x);
x.fillStyle='#333';x.fillRect(sx-12,py2-4,24,4);
x.fillStyle='#d3323c';x.fillRect(sx-11,py2-9+sq2*6,22,6);
x.strokeStyle='#f2f2f7';x.lineWidth=2;
for(var s2=0;s2<3;s2++){x.beginPath();x.moveTo(sx-9,py2-8+sq2*6-s2*2);x.lineTo(sx+9,py2-8+sq2*6-s2*2);x.stroke()}
x.fillStyle='#e04550';x.fillRect(sx-14,py2-22+sq2*10,28,6);
x.fillStyle='#fff';x.fillRect(sx-14,py2-22+sq2*10,28,1.5);
if(sq2>0&&sq2<.6){x.fillStyle='rgba(255,255,255,'+(sq2)+')';x.font='900 10px Arial';x.textAlign='center';x.fillText('↑',sx,py2-26);x.textAlign='left'}
}else if(e2.t==='pad'){
var pz=gy(e2.x);
x.fillStyle='#7a5205';x.fillRect(sx-16,pz-2,32,3);
x.fillStyle='#e09406';x.fillRect(sx-15,pz-9,30,7);
var off2=(frame*2)%14;
x.fillStyle='#ffd75e';
for(var ch=0;ch<3;ch++){
var cxp=sx-13+((ch*11+off2)%33);
if(cxp<sx+12){
x.beginPath();x.moveTo(cxp,pz-9);x.lineTo(cxp+4,pz-5.5);x.lineTo(cxp,pz-2);x.lineTo(cxp+2,pz-5.5);x.closePath();x.fill();
}}
if(!e2.used){x.shadowColor='#ffd75e';x.shadowBlur=8;x.fillStyle='rgba(255,215,94,.25)';x.fillRect(sx-15,pz-9,30,7);x.shadowBlur=0}
}
});
/* ring terlepas */
lostRings.forEach(function(r2){
var sx=r2.x-camX,w2=Math.abs(Math.sin(r2.ph))*9+3;
x.strokeStyle=r2.life<1?'rgba(255,215,94,'+(r2.life)+')':'#ffd75e';x.lineWidth=3;
x.beginPath();x.ellipse(sx,r2.y,w2,10,0,0,7);x.stroke();
});
/* afterimage + api boost */
trail.forEach(function(t4,i4){
x.globalAlpha=.08+.14*(i4/trail.length);x.fillStyle='#58c7ff';
x.beginPath();x.arc(t4.x-camX-(trail.length-i4)*5,t4.y,11,0,7);x.fill();
});
x.globalAlpha=1;
if(boostOn&&state==='play'){
for(var f4=0;f4<3;f4++){
x.globalAlpha=.35-.1*f4;
x.fillStyle=f4===0?'#ff9a3c':(f4===1?'#ffd75e':'#fff');
x.beginPath();x.ellipse(CX-12-f4*5,CY+2+Math.sin(frame*.9+f4)*2,10-f4*2.5,6-f4*1.5,0,0,7);x.fill();
}
x.globalAlpha=1;
}
/* BOSS (di belakang player biar keliatan di-stomp) */
drawBoss();
/* bayangan karakter */
var gch=gy(camX+CX),hh=Math.max(0,(gch-16)-CY);
x.fillStyle='rgba(0,0,0,'+Math.max(0,.28-hh/180)+')';ell(CX,gch+3,Math.max(4,12-hh*.03),3.5);
if(state==='play'||state==='ready')drawChar();
/* TURRET + AIM + BEAM (di atas semua biar jelas) */
drawTurret();
drawAim();
drawBeam();
/* partikel */
parts.forEach(function(p2){x.globalAlpha=Math.max(p2.life,0);x.fillStyle=p2.c;x.fillRect(p2.x-camX,p2.y,p2.s,p2.s)});
x.globalAlpha=1;
dusts.forEach(function(du){x.globalAlpha=du.t*.5;x.fillStyle='#cbb9a2';x.beginPath();x.arc(du.x-camX,du.y,du.r,0,7);x.fill()});
x.globalAlpha=1;
/* streak boost */
if(boostOn){
x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;
for(var s5=0;s5<9;s5++){
var ly3=14+((s5*47+((frame*3)%47))%(H-24));
var lx2=W-((frame*14+s5*83)%460);
x.globalAlpha=.15+.22*((s5%3)/3);
x.beginPath();x.moveTo(lx2,ly3);x.lineTo(lx2-46,ly3);x.stroke();
}
x.globalAlpha=1;
}
x.restore();
/* vignette */
var vg=x.createRadialGradient(W/2,H/2,140,W/2,H/2,290);
vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,boostOn?'rgba(20,0,40,.45)':'rgba(0,10,30,.28)');
x.fillStyle=vg;x.fillRect(0,0,W,H);
/* flash */
if(flash>0){x.fillStyle='rgba(255,80,80,'+(flash*.3)+')';x.fillRect(0,0,W,H)}
if(wflash>0){x.fillStyle='rgba(255,255,255,'+(wflash*.25)+')';x.fillRect(0,0,W,H)}
if(laser&&laser.ph===2){x.fillStyle='rgba(255,60,40,'+(.06+.04*Math.sin(frame*1.2))+')';x.fillRect(0,0,W,H)}
/* DANGER NOTIF */
drawDanger();
/* HUD boost */
var bx=10,by=10;
rr(bx-2,by-2,108,13,5);x.fillStyle='rgba(4,12,30,.65)';x.fill();
x.strokeStyle='rgba(120,200,255,.5)';x.lineWidth=1;x.stroke();
for(var s6=0;s6<10;s6++){
if(s6<boost/10){var mg3=x.createLinearGradient(0,by,0,by+9);mg3.addColorStop(0,'#ffe89a');mg3.addColorStop(1,'#ff9a3c');x.fillStyle=mg3}
else x.fillStyle='rgba(90,130,180,.25)';
x.fillRect(bx+1+s6*10.4,by+1,8.4,7);
}
x.font='bold 8px monospace';
if(boostOn){x.fillStyle='#ffd75e';x.fillText('BOOST!!',bx+Math.sin(frame*.6)*1.5,by+21)}
else if(boost>=25){x.fillStyle='rgba(255,255,255,'+(.55+.45*Math.sin(frame*.25))+')';x.fillText('BOOST READY!',bx,by+21)}
else{x.fillStyle='rgba(255,255,255,.55)';x.fillText('BOOST',bx,by+21)}
x.fillStyle='rgba(255,255,255,.7)';x.textAlign='right';x.fillText('SPD '+(speed+(boostOn?4.5:0)).toFixed(1),W-10,20);x.textAlign='left';
/* HP boss */
if(boss){
for(var hp3=0;hp3<3;hp3++){
x.save();x.translate(W/2-24+hp3*24,36);x.rotate(.7854);
if(hp3<boss.hp){x.fillStyle='#ff2a3c';if(boss.hp===1){x.shadowColor='#ff2a3c';x.shadowBlur=6+Math.sin(frame*.5)*4}}
else x.fillStyle='rgba(255,255,255,.15)';
x.fillRect(-5.5,-5.5,11,11);x.shadowBlur=0;x.restore();
}
x.font='bold 8px monospace';x.fillStyle='rgba(255,176,184,.9)';x.textAlign='center';x.fillText('BOSS',W/2,52);x.textAlign='left';
}
/* popup skor */
pops.forEach(function(p3){
x.globalAlpha=Math.max(0,p3.t);
x.font='900 12px Arial';x.textAlign='center';
var py3=p3.y-(1-p3.t)*16;
x.lineWidth=3;x.strokeStyle='rgba(10,20,50,.7)';x.strokeText(p3.txt,p3.sx,py3);
x.fillStyle=p3.c;x.fillText(p3.txt,p3.sx,py3);
});
x.globalAlpha=1;x.textAlign='left';
/* banner */
if(banner){
var bt=banner.t,k=Math.min(bt*3,1),al=bt>.8?(1-bt)/.2:1,sc=1+(1-k)*.8;
x.save();x.translate(W/2,92);x.scale(sc,sc);x.globalAlpha=al*k;
x.font='900 24px Arial';x.textAlign='center';
x.lineWidth=5;x.strokeStyle='rgba(10,20,50,.8)';x.strokeText(banner.txt,0,0);
var tg3=x.createLinearGradient(0,-20,0,8);tg3.addColorStop(0,'#fff3b0');tg3.addColorStop(.5,'#ffd75e');tg3.addColorStop(1,'#ff9a3c');
x.fillStyle=tg3;x.fillText(banner.txt,0,0);
x.restore();x.globalAlpha=1;x.textAlign='left';
}
/* overlay READY */
if(state==='ready'){
x.fillStyle='rgba(2,8,26,.55)';x.fillRect(0,0,W,H);
x.textAlign='center';
x.font='900 27px Arial';x.lineWidth=6;x.strokeStyle='rgba(8,16,40,.9)';x.strokeText('SPEEDY DASH',W/2,110);
var tg4=x.createLinearGradient(0,86,0,112);tg4.addColorStop(0,'#bfe9ff');tg4.addColorStop(.55,'#58c7ff');tg4.addColorStop(1,'#2f7fd6');
x.fillStyle=tg4;x.fillText('SPEEDY DASH',W/2,110);
x.font='700 10px Arial';x.fillStyle='#9fd8ff';x.fillText('RUN · SPIN · BOOST · DODGE LASER',W/2,128);
if(BEST>0){x.font='bold 11px monospace';x.fillStyle='#ffd75e';x.fillText('BEST: '+BEST,W/2,150)}
x.font='900 15px Arial';x.fillStyle='rgba(255,255,255,'+(.55+.45*Math.sin(frame*.09))+')';x.fillText('TAP UNTUK MULAI',W/2,178);
x.font='600 9px Arial';x.fillStyle='#7a9cc8';x.fillText('laser merah kedip cepat = LOMPPT! · 50 ring = BOSS',W/2,198);
x.textAlign='left';
}
/* overlay DEAD */
if(state==='dead'){
x.fillStyle='rgba(2,8,26,.5)';x.fillRect(0,0,W,H);
rr(52,84,300,116,14);x.fillStyle='rgba(8,18,46,.9)';x.fill();
x.strokeStyle='rgba(88,199,255,.45)';x.lineWidth=2;x.stroke();
x.textAlign='center';
x.font='900 25px Arial';
var dg3=x.createLinearGradient(0,100,0,124);dg3.addColorStop(0,'#ff8aa0');dg3.addColorStop(1,'#d61f3e');
x.fillStyle=dg3;x.fillText('GAME OVER',W/2,118);
x.font='bold 12px monospace';x.fillStyle='#eaf2ff';x.fillText('SCORE '+score+'   ·   RINGS '+rings,W/2,144);
if(bestNew){x.fillStyle='rgba(255,215,94,'+(.6+.4*Math.sin(frame*.2))+')';x.font='900 13px Arial';x.fillText('★ NEW BEST: '+best+' ★',W/2,164)}
else{x.fillStyle='#9fd8ff';x.font='bold 12px monospace';x.fillText('BEST: '+best,W/2,164)}
x.font='700 11px Arial';x.fillStyle='rgba(255,255,255,'+(.5+.5*Math.sin(frame*.1))+')';x.fillText('tap untuk main lagi',W/2,188);
x.textAlign='left';
}
}

/* ============ LOOP + AUTO-QUALITY ============ */
var perfA=0,perfN=0,perfDone=false,lastT=0;
function loop(t){
if(!perfDone&&perfN>60&&perfN<160)perfA+=(t-lastT);
if(!perfDone&&perfN===160){perfA/=100;if(perfA>22){DPR=1;cv.width=W;cv.height=H}perfDone=true}
perfN++;lastT=t;
update();draw();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
</script>`

// ============================================================
//  SIGNATURE & CERTIFICATE (dari contoh publik MessageBuilder V4.7)
//  Fungsi: bikin WA percaya pesan = AI sah → render inline tanpa unduh
// ============================================================
const SIG = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YcN55YRyad2+ZA=="
const CERT1 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg"
const CERT2 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZlXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYvNBkuLoZnQAq4j8yRekrQ=="

async function kirimForwardSigned(conn, chatId, html, judul) {
    const data = Buffer.from(JSON.stringify({
        __typename: 'GenAIUnifiedResponse',
        response_id: randomUUID(),
        sections: [{
            __typename: 'GenAIUnifiedResponseSection',
            view_model: {
                __typename: 'GenAISingleLayoutViewModel',
                primitive: {
                    __typename: 'GenAIaeacdsnwHtmlPrimitive',
                    payload: html,
                    trusted_sources: []
                }
            }
        }]
    })).toString('base64')

    return conn.relayMessage(chatId, {
        messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            botMetadata: {
                messageDisclaimerText: "",
                botResponseId: randomUUID(),
                verificationMetadata: {
                    proofs: [{
                        version: 1,
                        useCase: 1,
                        signature: SIG,
                        certificateChain: [CERT1, CERT2]
                    }]
                }
            }
        },
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,
                    submessages: [{
                        messageType: 2,
                        messageText: judul
                    }],
                    unifiedResponse: {
                        data
                    },
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedAiBotMessageInfo: {
                            botJid: "867051314767696@bot"
                        },
                        forwardOrigin: 4
                    }
                }
            }
        }
    }, {})
}

let handler = async (m, {
    conn
}) => {
    try {
        await kirimForwardSigned(conn, m.chat, DASH_HTML, '🌀 SPEEDY DASH v4')
    } catch (e) {
        console.error('[DASH]', e?.message || e)
        m.reply('❌ Gagal mengirim game: ' + (e?.message || e))
    }
}

handler.help = ['dash', 'sonic', 'speedy']
handler.tags = ['game']
handler.command = /^(dash|sonic|speedy|speeddash)$/i

export default handler