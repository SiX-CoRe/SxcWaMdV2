
'use strict'

const html = `
<style>
:root{
  --bg:#09070b;
  --panel:#151018;
  --panel2:#1c151f;
  --line:rgba(255,255,255,.12);
  --text:#fff;
  --muted:#a99faa;
  --pink:#ff6fae;
  --pink2:#ff9ac5;
  --cyan:#67e8f9;
  --green:#6ee7b7;
  --yellow:#fde68a;
  --danger:#fb7185;
}

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  -webkit-tap-highlight-color:transparent;
}

html,
body{
  width:100%;
  min-height:100vh;
  background:transparent;
  color:var(--text);
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;
  user-select:none;
}

body{
  overflow:hidden;
}

.game-wrap{
  width:100%;
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:10px;
}

.game{
  width:100%;
  max-width:520px;
}

.header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:8px;
}

.title{
  font-size:18px;
  font-weight:800;
  letter-spacing:-.3px;
}

.title span{
  color:var(--pink);
}

.subtitle{
  color:var(--muted);
  font-size:10px;
  margin-top:2px;
}

.header-actions{
  display:flex;
  gap:6px;
}

.icon-btn{
  width:36px;
  height:36px;
  border-radius:11px;
  border:1px solid var(--line);
  background:var(--panel);
  color:white;
  font-size:16px;
  cursor:pointer;
}

.layout{
  display:grid;
  grid-template-columns:1fr 94px;
  gap:8px;
  align-items:start;
}

.board-wrap{
  position:relative;
  width:100%;
  aspect-ratio:10/20;
  height: 500px; /* Fallback for older WebViews */
  max-height:620px;
  border-radius:14px;
  overflow:hidden;
  border:1px solid var(--line);
  background:#08070a;
  box-shadow:
    0 18px 50px rgba(0,0,0,.45),
    inset 0 0 40px rgba(255,105,170,.03);
}

@supports (aspect-ratio: 10/20) {
  .board-wrap { height: auto; }
}

canvas{
  width:100%;
  height:100%;
  display:block;
}

.side{
  display:flex;
  flex-direction:column;
  gap:8px;
}

.card{
  background:rgba(21,16,24,.96);
  border:1px solid var(--line);
  border-radius:12px;
  padding:9px;
}

.label{
  color:var(--muted);
  font-size:8px;
  text-transform:uppercase;
  letter-spacing:.8px;
  margin-bottom:4px;
}

.value{
  font-size:15px;
  font-weight:800;
}

.next-box, .hold-box{
  width:100%;
  aspect-ratio:1;
  height: 70px; /* Fallback */
  border-radius:9px;
  background:#0b090d;
  border:1px solid rgba(255,255,255,.08);
  overflow:hidden;
}

@supports (aspect-ratio: 1) {
  .next-box, .hold-box { height: auto; }
}

#nextCanvas, #holdCanvas{
  width:100%;
  height:100%;
}

.hold-info{
  color:var(--muted);
  font-size:8px;
  text-align:center;
  margin-top:4px;
}

.progress{
  margin-top:8px;
  height:4px;
  background:#211923;
  border-radius:5px;
  overflow:hidden;
}

.progress div{
  height:100%;
  width:0%;
  background:linear-gradient(
    90deg,
    var(--pink),
    var(--pink2)
  );
  transition:width:.15s linear;
}

.controls{
  display:grid;
  grid-template-columns:
    repeat(5,1fr);
  gap:7px;
  margin-top:9px;
}

.control{
  height:48px;
  border-radius:13px;
  border:1px solid var(--line);
  background:#151018;
  color:white;
  font-size:18px;
  font-weight:700;
  cursor:pointer;
  box-shadow:
    0 4px 0 rgba(0,0,0,.25);
  touch-action:none;
}

.control:active,
.control.active{
  transform:translateY(3px);
  background:#271c2b;
  box-shadow:none;
}

.control.drop{
  background:#211624;
  border-color:rgba(255,111,174,.25);
}

.control.rotate{
  background:#211c25;
}

.help{
  margin-top:7px;
  text-align:center;
  color:var(--muted);
  font-size:9px;
  line-height:1.4;
}

.overlay{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background:rgba(5,3,7,.68);
  backdrop-filter:blur(5px);
  opacity:0;
  pointer-events:none;
  transition:.2s ease;
}

.overlay.show{
  opacity:1;
  pointer-events:auto;
}

.panel{
  width:82%;
  max-width:280px;
  padding:22px 18px;
  border-radius:16px;
  background:#1b141f;
  border:1px solid rgba(255,255,255,.13);
  text-align:center;
  box-shadow:0 20px 60px rgba(0,0,0,.55);
  transform:scale(.92);
  transition:.25s cubic-bezier(.34,1.56,.64,1);
}

.overlay.show .panel{
  transform:scale(1);
}

.panel h2{
  font-size:23px;
  margin-bottom:5px;
}

.panel p{
  color:var(--muted);
  font-size:12px;
  line-height:1.5;
  margin-bottom:15px;
}

.panel-score{
  font-size:27px;
  font-weight:900;
  color:var(--pink2);
  margin:8px 0 16px;
}

.main-btn{
  width:100%;
  border:0;
  border-radius:22px;
  padding:11px 18px;
  background:var(--pink);
  color:#190914;
  font-weight:800;
  font-family:inherit;
  cursor:pointer;
}

.secondary-btn{
  margin-top:7px;
  width:100%;
  border:1px solid var(--line);
  border-radius:22px;
  padding:10px 18px;
  background:#151018;
  color:white;
  font-weight:700;
  font-family:inherit;
  cursor:pointer;
}

.badge{
  display:inline-block;
  margin-top:7px;
  padding:4px 8px;
  border-radius:20px;
  background:rgba(255,111,174,.08);
  color:var(--pink2);
  font-size:9px;
}

@media(max-width:390px){
  .game-wrap{
    padding:7px;
  }

  .layout{
    grid-template-columns:1fr 82px;
    gap:6px;
  }

  .controls{
    gap:5px;
  }

  .control{
    height:45px;
    font-size:17px;
  }

  .card{
    padding:7px;
  }
}
</style>

<div class="game-wrap">
  <div class="game">

    <div class="header">

      <div>
        <div class="title">
          🧱 <span>Sxc</span> Tetris
        </div>
        <div class="subtitle">
          Waku waku~ susun sampai penuh! ✨
        </div>
      </div>

      <div class="header-actions">
        <button
          class="icon-btn"
          id="pauseBtn">
          ⏸
        </button>
      </div>

    </div>

    <div class="layout">

      <div class="board-wrap">

        <canvas id="gameCanvas"></canvas>

        <div
          class="overlay"
          id="overlay">

          <div class="panel">

            <h2 id="overlayTitle">
              💥 Game Over
            </h2>

            <p id="overlayText">
              Permainan selesai!
            </p>

            <div
              class="panel-score"
              id="finalScore">
              0
            </div>

            <button
              class="main-btn"
              id="restartBtn">
              🔄 Main Lagi
            </button>

            <button
              class="secondary-btn"
              id="closeBtn">
              ✕ Tutup
            </button>

            <div
              class="badge"
              id="bestBadge">
              🏆 Best: 0
            </div>

          </div>

        </div>

      </div>

      <div class="side">

        <div class="card">
          <div class="label">Score</div>
          <div
            class="value"
            id="score">
            0
          </div>
        </div>

        <div class="card">
          <div class="label">Lines</div>
          <div
            class="value"
            id="lines">
            0
          </div>
        </div>

        <div class="card">
          <div class="label">Level</div>
          <div
            class="value"
            id="level">
            1
          </div>
        </div>

        <div class="card">

          <div class="label">
            Next
          </div>

          <div class="next-box">
            <canvas id="nextCanvas"></canvas>
          </div>

        </div>

        <div class="card">

          <div class="label">
            Hold
          </div>

          <div class="hold-box">
            <canvas id="holdCanvas"></canvas>
          </div>

          <div class="hold-info">
            tekan H
          </div>

        </div>

      </div>

    </div>

    <div class="progress">
      <div id="levelProgress"></div>
    </div>

    <div class="controls">

      <button
        class="control"
        id="leftBtn">
        ◀
      </button>

      <button
        class="control"
        id="downBtn">
        ▼
      </button>

      <button
        class="control rotate"
        id="rotateBtn">
        ↻
      </button>

      <button
        class="control"
        id="rightBtn">
        ▶
      </button>

      <button
        class="control drop"
        id="dropBtn">
        ⬇
      </button>

    </div>

    <div class="help">
      ◀ ▶ gerak · ▼ turun · ↻ rotate · ⬇ hard drop · H hold
    </div>

  </div>
</div>

<script>
(() => {

'use strict';

/* =========================================================
 * SOUND ENGINE (WEB AUDIO API)
 * ========================================================= */
const sfx = {
  ctx: null,
  
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playTone(freq, type, duration, vol = 0.05) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },

  move()     { this.playTone(300, 'sine', 0.05, 0.02); },
  rotate()   { this.playTone(450, 'sine', 0.1, 0.03); },
  hardDrop() { this.playTone(150, 'square', 0.15, 0.05); },
  lock()     { this.playTone(200, 'triangle', 0.1, 0.04); },
  hold()     { this.playTone(500, 'triangle', 0.1, 0.03); },
  clear() {
    this.playTone(600, 'sine', 0.2, 0.05);
    setTimeout(() => this.playTone(800, 'sine', 0.3, 0.05), 100);
  },
  over() {
    this.playTone(250, 'sawtooth', 0.3, 0.08);
    setTimeout(() => this.playTone(200, 'sawtooth', 0.4, 0.08), 300);
    setTimeout(() => this.playTone(150, 'sawtooth', 0.6, 0.08), 700);
  }
};

window.addEventListener('pointerdown', () => sfx.init(), { once: true });
window.addEventListener('keydown', () => sfx.init(), { once: true });

/* =========================================================
 * ELEMENTS
 * ========================================================= */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const progressEl = document.getElementById('levelProgress');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const finalScore = document.getElementById('finalScore');
const bestBadge = document.getElementById('bestBadge');
const restartBtn = document.getElementById('restartBtn');
const closeBtn = document.getElementById('closeBtn');
const pauseBtn = document.getElementById('pauseBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const downBtn = document.getElementById('downBtn');
const rotateBtn = document.getElementById('rotateBtn');
const dropBtn = document.getElementById('dropBtn');


/* =========================================================
 * BOARD
 * ========================================================= */

const COLS = 10;
const ROWS = 20;

let W = 300;
let H = 600;
let cell = 30;


/* =========================================================
 * COLORS
 * ========================================================= */

const COLORS = {
  I:'#67e8f9',
  O:'#fde68a',
  T:'#c084fc',
  S:'#6ee7b7',
  Z:'#fb7185',
  J:'#60a5fa',
  L:'#fb923c'
};


/* =========================================================
 * PIECES
 * ========================================================= */

const SHAPES = {
  I:[[1,1,1,1]],
  O:[[1,1],[1,1]],
  T:[[0,1,0],[1,1,1]],
  S:[[0,1,1],[1,1,0]],
  Z:[[1,1,0],[0,1,1]],
  J:[[1,0,0],[1,1,1]],
  L:[[0,0,1],[1,1,1]]
};

const TYPES = Object.keys(SHAPES);


/* =========================================================
 * GAME STATE
 * ========================================================= */

const game = {
  board:[],
  current:null,
  next:null,
  hold:null,
  holdUsed:false,
  score:0,
  lines:0,
  level:1,
  running:true,
  paused:false,
  last:0,
  dropTimer:0,
  clearRows:[],
  clearTimer:0,
  best:Number(localStorage.getItem('Sxc_tetris_best') || 0)
};


/* =========================================================
 * RESIZE
 * ========================================================= */

function resize(){
  const rect = canvas.getBoundingClientRect();
  W = Math.max(200, rect.width);
  H = Math.max(400, rect.height);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(W*dpr);
  canvas.height = Math.floor(H*dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cell = Math.min(W/COLS, H/ROWS);

  resizeSmallCanvas(nextCanvas, nextCtx);
  resizeSmallCanvas(holdCanvas, holdCtx);
}

function resizeSmallCanvas(c, cctx){
  const rect = c.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  c.width = Math.floor(Math.max(50, rect.width)*dpr);
  c.height = Math.floor(Math.max(50, rect.height)*dpr);

  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resize);


/* =========================================================
 * BOARD HELPERS
 * ========================================================= */

function createBoard(){
  return Array.from({length:ROWS}, () => Array(COLS).fill(null));
}

function cloneMatrix(matrix){
  return matrix.map(row => row.slice());
}

function randomType(){
  return TYPES[Math.floor(Math.random()*TYPES.length)];
}

function createPiece(type){
  const matrix = cloneMatrix(SHAPES[type]);
  return {
    type,
    matrix,
    x: Math.floor((COLS-matrix[0].length)/2),
    y: -1
  };
}


/* =========================================================
 * COLLISION
 * ========================================================= */

function collide(piece, board=game.board){
  const matrix = piece.matrix;
  for(let y=0; y<matrix.length; y++){
    for(let x=0; x<matrix[y].length; x++){
      if(!matrix[y][x]) continue;

      const bx = piece.x+x;
      const by = piece.y+y;

      if(bx<0 || bx>=COLS) return true;
      if(by>=ROWS) return true;
      if(by>=0 && board[by][bx]) return true;
    }
  }
  return false;
}


/* =========================================================
 * ROTATION
 * ========================================================= */

function rotateMatrix(matrix){
  const h = matrix.length;
  const w = matrix[0].length;
  const result = Array.from({length:w}, () => Array(h).fill(0));

  for(let y=0; y<h; y++){
    for(let x=0; x<w; x++){
      result[x][h-1-y] = matrix[y][x];
    }
  }
  return result;
}

function rotatePiece(){
  if(!game.running || game.paused || game.clearRows.length) return;

  const old = game.current.matrix;
  const oldX = game.current.x;

  game.current.matrix = rotateMatrix(old);
  const kicks = [0,-1,1,-2,2];
  let valid = false;

  for(const k of kicks){
    game.current.x = oldX+k;
    if(!collide(game.current)){
      valid = true;
      break;
    }
  }

  if(!valid){
    game.current.matrix = old;
    game.current.x = oldX;
  } else {
    vibrate(8);
    sfx.rotate();
  }
}


/* =========================================================
 * MOVEMENT
 * ========================================================= */

function move(dx){
  if(!game.running || game.paused || game.clearRows.length) return;

  game.current.x += dx;
  if(collide(game.current)){
    game.current.x -= dx;
  } else {
    vibrate(4);
    sfx.move();
  }
}

function softDrop(){
  if(!game.running || game.paused || game.clearRows.length) return;

  game.current.y++;
  if(collide(game.current)){
    game.current.y--;
    lockPiece();
  } else {
    game.score += 1;
  }

  game.dropTimer = 0;
  updateHUD();
}

function hardDrop(){
  if(!game.running || game.paused || game.clearRows.length) return;

  let distance = 0;
  while(true){
    game.current.y++;
    if(collide(game.current)){
      game.current.y--;
      break;
    }
    distance++;
  }

  game.score += distance*2;
  vibrate(15);
  sfx.hardDrop();
  lockPiece();
}


/* =========================================================
 * HOLD
 * ========================================================= */

function holdPiece(){
  if(!game.running || game.paused || game.holdUsed || game.clearRows.length) return;

  const currentType = game.current.type;

  if(game.hold){
    const swap = game.hold;
    game.hold = currentType;
    game.current = createPiece(swap);
  } else {
    game.hold = currentType;
    spawnNext();
  }

  game.holdUsed = true;
  vibrate(12);
  sfx.hold();
  drawSideCanvases();
}


/* =========================================================
 * SPAWN
 * ========================================================= */

function spawnNext(){
  const type = game.next || randomType();
  game.current = createPiece(type);
  game.next = randomType();
  game.holdUsed = false;

  if(collide(game.current)){
    endGame();
  }
  drawSideCanvases();
}


/* =========================================================
 * LOCK
 * ========================================================= */

function lockPiece(){
  const piece = game.current;

  for(let y=0; y<piece.matrix.length; y++){
    for(let x=0; x<piece.matrix[y].length; x++){
      if(!piece.matrix[y][x]) continue;

      const by = piece.y+y;
      const bx = piece.x+x;

      if(by>=0 && by<ROWS && bx>=0 && bx<COLS){
        game.board[by][bx] = piece.type;
      }
    }
  }
  
  sfx.lock();
  findLines();
}


/* =========================================================
 * LINE CLEAR
 * ========================================================= */

function findLines(){
  const rows = [];
  for(let y=0; y<ROWS; y++){
    if(game.board[y].every(Boolean)){
      rows.push(y);
    }
  }

  if(!rows.length){
    spawnNext();
    return;
  }

  game.clearRows = rows;
  game.clearTimer = 0;
  sfx.clear();
  vibrate(rows.length >= 4 ? 45 : 20);
}

function finishClear(){
  const count = game.clearRows.length;

  for(const row of game.clearRows){
    game.board.splice(row, 1);
    game.board.unshift(Array(COLS).fill(null));
  }

  const points = {1:100, 2:300, 3:500, 4:800}[count] || 0;
  game.score += points*game.level;
  game.lines += count;
  game.level = Math.floor(game.lines/10)+1;

  game.clearRows = [];
  game.clearTimer = 0;

  spawnNext();
  updateHUD();
}


/* =========================================================
 * DROP SPEED
 * ========================================================= */

function getDropInterval(){
  return Math.max(70, 900 - (game.level-1)*75);
}


/* =========================================================
 * UPDATE
 * ========================================================= */

function update(dt){
  if(!game.running || game.paused) return;

  if(game.clearRows.length){
    game.clearTimer += dt*1000;
    if(game.clearTimer > 180){
      finishClear();
    }
    return;
  }

  game.dropTimer += dt*1000;
  if(game.dropTimer >= getDropInterval()){
    game.dropTimer = 0;
    game.current.y++;
    if(collide(game.current)){
      game.current.y--;
      lockPiece();
    }
  }
}


/* =========================================================
 * GHOST PIECE
 * ========================================================= */

function getGhost(){
  const ghost = {
    type: game.current.type,
    matrix: game.current.matrix,
    x: game.current.x,
    y: game.current.y
  };

  while(true){
    ghost.y++;
    if(collide(ghost)){
      ghost.y--;
      break;
    }
  }
  return ghost;
}


/* =========================================================
 * DRAW BOARD
 * ========================================================= */

function draw(){
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawGrid();
  drawLocked();

  if(game.current && game.running){
    if(!game.clearRows.length){
      drawPiece(getGhost(), true);
      drawPiece(game.current, false);
    }
  }

  if(game.clearRows.length){
    drawClearFlash();
  }
}


/* =========================================================
 * BACKGROUND
 * ========================================================= */

function drawBackground(){
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, '#0b080e');
  gradient.addColorStop(1, '#08060a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function drawGrid(){
  ctx.strokeStyle = 'rgba(255,255,255,.045)';
  ctx.lineWidth = 1;

  for(let x=0; x<=COLS; x++){
    ctx.beginPath();
    ctx.moveTo(x*cell+.5, 0);
    ctx.lineTo(x*cell+.5, ROWS*cell);
    ctx.stroke();
  }
  for(let y=0; y<=ROWS; y++){
    ctx.beginPath();
    ctx.moveTo(0, y*cell+.5);
    ctx.lineTo(COLS*cell, y*cell+.5);
    ctx.stroke();
  }
}


/* =========================================================
 * BLOCK DRAWING (SAFE FIX FOR OLD WEBVIEWS)
 * ========================================================= */

function drawLocked(){
  for(let y=0; y<ROWS; y++){
    for(let x=0; x<COLS; x++){
      const type = game.board[y][x];
      if(type){
        drawBlock(ctx, x*cell, y*cell, cell, COLORS[type], false);
      }
    }
  }
}

function drawPiece(piece, ghost){
  for(let y=0; y<piece.matrix.length; y++){
    for(let x=0; x<piece.matrix[y].length; x++){
      if(!piece.matrix[y][x]) continue;

      const bx = piece.x+x;
      const by = piece.y+y;
      
      // Removed if(by < 0) continue; so blocks render smoothly from the very top
      drawBlock(ctx, bx*cell, by*cell, cell, COLORS[piece.type], ghost);
    }
  }
}

function drawBlock(c, x, y, size, color, ghost){
  const pad = Math.max(1, size*.055);
  const w = Math.max(0, size - pad*2); // Ensure positive values
  const h = w;

  if(w <= 0 || h <= 0) return;

  if(ghost){
    c.save();
    c.globalAlpha = .22;
    c.strokeStyle = color;
    c.lineWidth = 1.5;
    c.strokeRect(x+pad, y+pad, w, h);
    c.restore();
    return;
  }

  c.save();
  c.fillStyle = color;
  roundRect(c, x+pad, y+pad, w, h, Math.max(2, size*.12));
  c.fill();

  const innerW = Math.max(0, w - 4);
  if (innerW > 0) {
    c.fillStyle = 'rgba(255,255,255,.22)';
    c.fillRect(x+pad+2, y+pad+2, innerW, Math.max(1, size*.09));

    c.fillStyle = 'rgba(0,0,0,.18)';
    c.fillRect(x+pad+2, y+size-pad-4, innerW, 2);
  }
  
  c.restore();
}

// Fallback path generator for old canvas implementations (no crash)
function roundRect(c, x, y, w, h, r){
  if (w <= 0 || h <= 0) return;
  const radius = Math.max(0, Math.min(r, w/2, h/2));
  
  c.beginPath();
  if (c.roundRect) {
    c.roundRect(x, y, w, h, radius);
  } else {
    c.moveTo(x + radius, y);
    c.lineTo(x + w - radius, y);
    c.quadraticCurveTo(x + w, y, x + w, y + radius);
    c.lineTo(x + w, y + h - radius);
    c.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    c.lineTo(x + radius, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
  }
  c.closePath();
}


/* =========================================================
 * CLEAR ANIMATION
 * ========================================================= */

function drawClearFlash(){
  const progress = Math.min(1, game.clearTimer/180);
  ctx.save();
  ctx.globalAlpha = .2 + progress*.55;
  ctx.fillStyle = '#ffffff';

  for(const row of game.clearRows){
    ctx.fillRect(0, row*cell, COLS*cell, cell);
  }
  ctx.restore();
}


/* =========================================================
 * SIDE PREVIEW
 * ========================================================= */

function drawSideCanvases(){
  drawPreview(nextCtx, nextCanvas, game.next);
  drawPreview(holdCtx, holdCanvas, game.hold);
}

function drawPreview(c, canvasEl, type){
  const rect = canvasEl.getBoundingClientRect();
  const w = Math.max(50, rect.width);
  const h = Math.max(50, rect.height);

  c.clearRect(0, 0, w, h);
  if(!type) return;

  const matrix = SHAPES[type];
  const rows = matrix.length;
  const cols = matrix[0].length;
  const size = Math.min((w-14)/cols, (h-14)/rows);
  const ox = (w-cols*size)/2;
  const oy = (h-rows*size)/2;

  for(let y=0; y<rows; y++){
    for(let x=0; x<cols; x++){
      if(matrix[y][x]){
        drawBlock(c, ox+x*size, oy+y*size, size, COLORS[type], false);
      }
    }
  }
}


/* =========================================================
 * HUD
 * ========================================================= */

function updateHUD(){
  scoreEl.textContent = game.score.toLocaleString();
  linesEl.textContent = game.lines;
  levelEl.textContent = game.level;

  const progress = (game.lines%10)*10;
  progressEl.style.width = progress+'%';
}


/* =========================================================
 * GAME OVER
 * ========================================================= */

function endGame(){
  game.running = false;

  if(game.score > game.best){
    game.best = game.score;
    localStorage.setItem('Sxc_tetris_best', String(game.best));
    overlayTitle.textContent = '🏆 New Best!';
    overlayText.innerHTML = 'Waku waku! Kamu dapat rekor baru ✨';
  } else {
    overlayTitle.textContent = '💥 Game Over';
    overlayText.innerHTML = 'Baloknya sudah terlalu tinggi 😭';
  }

  finalScore.textContent = game.score.toLocaleString();
  bestBadge.textContent = '🏆 Best: ' + game.best.toLocaleString();

  overlay.classList.add('show');
  vibrate(80);
  sfx.over();
}


/* =========================================================
 * PAUSE
 * ========================================================= */

function togglePause(){
  if(!game.running) return;

  game.paused = !game.paused;
  pauseBtn.textContent = game.paused ? '▶' : '⏸';

  if(game.paused){
    overlayTitle.textContent = '⏸ Paused';
    overlayText.innerHTML = 'Istirahat dulu~ tekan lanjut kalau sudah siap 🥰';
    finalScore.textContent = game.score.toLocaleString();
    bestBadge.textContent = '🏆 Best: ' + game.best.toLocaleString();
    restartBtn.textContent = '▶ Lanjut';
    closeBtn.textContent = '🔄 Restart';
    overlay.classList.add('show');
  } else {
    overlay.classList.remove('show');
  }
}


/* =========================================================
 * RESET
 * ========================================================= */

function reset(){
  game.board = createBoard();
  game.score = 0;
  game.lines = 0;
  game.level = 1;
  game.running = true;
  game.paused = false;
  game.last = performance.now();
  game.dropTimer = 0;
  game.clearRows = [];
  game.clearTimer = 0;
  game.hold = null;
  game.holdUsed = false;
  game.next = randomType();
  
  spawnNext();
  
  pauseBtn.textContent = '⏸';
  overlay.classList.remove('show');
  restartBtn.textContent = '🔄 Main Lagi';
  closeBtn.textContent = '✕ Tutup';
  
  updateHUD();
  drawSideCanvases();
}


/* =========================================================
 * VIBRATION
 * ========================================================= */

function vibrate(ms){
  try{
    if(navigator.vibrate){
      navigator.vibrate(ms);
    }
  }catch(_){}
}


/* =========================================================
 * TOUCH CONTROLS
 * ========================================================= */

function bindButton(element, action){
  const down = e => {
    e.preventDefault();
    element.classList.add('active');
    action();
  };
  const up = e => {
    e.preventDefault();
    element.classList.remove('active');
  };
  
  element.addEventListener('pointerdown', down);
  element.addEventListener('pointerup', up);
  element.addEventListener('pointercancel', up);
  element.addEventListener('pointerleave', up);
}

bindButton(leftBtn, () => move(-1));
bindButton(rightBtn, () => move(1));
bindButton(downBtn, () => softDrop());
bindButton(rotateBtn, () => rotatePiece());
bindButton(dropBtn, () => hardDrop());


/* =========================================================
 * KEYBOARD
 * ========================================================= */

window.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  if(['arrowleft', 'arrowright', 'arrowdown', 'arrowup', ' ', 'h', 'p'].includes(key)){
    e.preventDefault();
  }

  if(key === 'arrowleft' || key === 'a') move(-1);
  else if(key === 'arrowright' || key === 'd') move(1);
  else if(key === 'arrowdown' || key === 's') softDrop();
  else if(key === 'arrowup' || key === 'w') rotatePiece();
  else if(key === ' ') hardDrop();
  else if(key === 'h') holdPiece();
  else if(key === 'p') togglePause();
});


/* =========================================================
 * BUTTONS
 * ========================================================= */

pauseBtn.addEventListener('click', togglePause);

restartBtn.addEventListener('click', () => {
  if(game.paused){
    game.paused = false;
    overlay.classList.remove('show');
    pauseBtn.textContent = '⏸';
    restartBtn.textContent = '🔄 Main Lagi';
    closeBtn.textContent = '✕ Tutup';
    return;
  }
  reset();
});

closeBtn.addEventListener('click', () => {
  if(game.paused){
    reset();
  } else {
    overlay.classList.remove('show');
  }
});


/* =========================================================
 * LOOP
 * ========================================================= */

function loop(timestamp){
  if(!game.last) game.last = timestamp;
  let dt = (timestamp-game.last)/1000;
  game.last = timestamp;
  dt = Math.min(.05, Math.max(0, dt));

  update(dt);
  draw();

  requestAnimationFrame(loop);
}


/* =========================================================
 * START
 * ========================================================= */

resize();
reset();
requestAnimationFrame(loop);

})();
</script>
`;


/* =========================================================
 * WHATSAPP HANDLER
 * ========================================================= */

const handler = async (m, { conn }) => {
  try {
    await conn.relayMessage(
      m.chat,
      {
        messageContextInfo:{
          deviceListMetadata:{},
          deviceListMetadataVersion:2,
          botMetadata:{}
        },
        botForwardedMessage:{
          message:{
            richResponseMessage:{
              messageType:1,
              submessages:[
                {
                  messageType:2,
                  messageText: 'Sxc Tetris 🧱✨'
                }
              ],
              unifiedResponse:{
                data:Buffer.from(
                  JSON.stringify({
                    response_id: 'Sxc-tetris-2026',
                    sections:[
                      {
                        view_model:{
                          primitive:{
                            __typename: 'GenAIaeacdsnwHtmlPrimitive',
                            payload: html,
                            trusted_sources:[]
                          },
                          __typename: 'GenAISingleLayoutViewModel'
                        }
                      }
                    ]
                  })
                ).toString('base64')
              },
              contextInfo:{
                forwardingScore:1,
                isForwarded:true,
                forwardedAiBotMessageInfo:{
                  botJid: '867051314767696@bot'
                },
                forwardOrigin:4
              }
            }
          }
        }
      },
      {}
    );
  } catch(e){
    console.error('[TETRIS ERROR]', e);
    await m.reply('❌ Gagal mengirim game Tetris.');
  }
};

handler.help = ['tetris'];
handler.tags = ['game'];
handler.command = ['tetris'];
handler.limit = false;

export default handler;