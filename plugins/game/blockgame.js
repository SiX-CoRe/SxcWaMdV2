
const htmlPayload = `<style>
* { -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; box-sizing: border-box; }
body { margin: 0; background: transparent; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #eee; touch-action: manipulation; cursor: pointer; }
.bb-wrap { width: 100%; max-width: 540px; margin: auto; padding: 12px; }
.bb-card { background: rgba(15, 18, 28, 0.88); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(0, 243, 255, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 243, 255, 0.15), 0 0 15px rgba(157, 78, 221, 0.2); }
.bb-header { padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, rgba(0,243,255,0.05), rgba(157,78,221,0.05)); }
.bb-sub { font-size: 10px; letter-spacing: 2px; color: #00f3ff; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 4px; }
.bb-title { font-size: 19px; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(0, 243, 255, 0.6); letter-spacing: 1px; }
.bb-stats { text-align: right; display: flex; align-items: center; gap: 12px; }
.bb-score { font-size: 20px; font-weight: 900; color: #00f3ff; text-shadow: 0 0 12px rgba(0, 243, 255, 0.8); transition: transform 0.15s ease-out; }
.bb-best { font-size: 10px; color: rgba(255, 255, 255, 0.5); font-weight: 600; margin-top: 1px; display: flex; align-items: center; justify-content: flex-end; gap: 3px; }
.bb-audio-btn { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; padding: 0; }
.bb-audio-btn:active { transform: scale(0.9); }
.bb-body { padding: 12px; position: relative; }
canvas#game { width: 100%; height: auto; background: #080b12; border: 1px solid rgba(0, 243, 255, 0.2); border-radius: 12px; display: block; box-shadow: inset 0 0 20px rgba(0,0,0,0.8); touch-action: none; }
.bb-status { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: rgba(255, 255, 255, 0.6); font-weight: 600; }
.svg-icon { display: inline-block; vertical-align: middle; }
</style>

<div class="bb-wrap">
  <div class="bb-card">
    <div class="bb-header">
      <div>
        <div class="bb-sub">
          <svg class="svg-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4m-2-2v4"></path><circle cx="17" cy="10" r="1" fill="#00f3ff"></circle><circle cx="15" cy="13" r="1" fill="#00f3ff"></circle></svg>
          LUMNZTYZ6X
        </div>
        <div class="bb-title">Block Blast Mini</div>
      </div>
      <div class="bb-stats">
        <button id="soundToggle" class="bb-audio-btn" title="Toggle Sound">
          <svg id="iconAudioOn" class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          <svg id="iconAudioOff" class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        </button>
        <div>
          <div id="score" class="bb-score">0000</div>
          <div id="best" class="bb-best">
            <svg class="svg-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
            <span id="bestText">BEST 0000</span>
          </div>
        </div>
      </div>
    </div>
    <div class="bb-body">
      <canvas id="game" width="540" height="660"></canvas>
      <div class="bb-status">
        <span id="comboStatus">Combo: 0x</span>
        <span id="linesStatus">Lines Cleared: 0</span>
      </div>
      <div style="font-size: 10px; color: rgba(0, 243, 255, 0.5); text-align: center; margin-top: 6px; font-weight: 600; letter-spacing: 1px;">WM: lumnztyz6x</div>
    </div>
  </div>
</div>

<script>
(function() {
  const c = document.getElementById('game');
  const ctx = c.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestTextEl = document.getElementById('bestText');
  const comboStatus = document.getElementById('comboStatus');
  const linesStatus = document.getElementById('linesStatus');
  const soundBtn = document.getElementById('soundToggle');
  const iconAudioOn = document.getElementById('iconAudioOn');
  const iconAudioOff = document.getElementById('iconAudioOff');

  const GRID_SIZE = 8;
  const CELL_SIZE = 54;
  const CELL_GAP = 4;
  const BOARD_W = GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * CELL_GAP;
  const BOARD_X = (c.width - BOARD_W) / 2;
  const BOARD_Y = 20;

  let audioCtx = null;
  let soundMuted = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  soundBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    soundMuted = !soundMuted;
    if (soundMuted) {
      iconAudioOn.style.display = 'none';
      iconAudioOff.style.display = 'inline-block';
    } else {
      iconAudioOn.style.display = 'inline-block';
      iconAudioOff.style.display = 'none';
    }
  });

  function playSound(type) {
    if (soundMuted) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      if (type === 'place') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'clear') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        osc.frequency.setValueAtTime(880, now + 0.16);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'combo') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'over') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.35);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch(err) {}
  }

  function loadBest() {
    let vals = [];
    try { let v = localStorage.getItem('bb_best'); if (v) vals.push(parseInt(v, 10)); } catch(e){}
    try { let v = sessionStorage.getItem('bb_best'); if (v) vals.push(parseInt(v, 10)); } catch(e){}
    try { let m = document.cookie.match(/(?:^|;\\s*)bb_best=(\\d+)/); if (m) vals.push(parseInt(m[1], 10)); } catch(e){}
    return vals.length ? Math.max(...vals.filter(v => !isNaN(v))) : 0;
  }

  function saveBest(val) {
    let s = String(Math.floor(val));
    try { localStorage.setItem('bb_best', s); } catch(e){}
    try { sessionStorage.setItem('bb_best', s); } catch(e){}
    try { document.cookie = 'bb_best=' + s + ';max-age=31536000;path=/'; } catch(e){}
    try {
      let rq = indexedDB.open('bb_db', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
      rq.onsuccess = () => { try { rq.result.transaction('kv', 'readwrite').objectStore('kv').put(s, 'bb_best'); } catch(e){} };
    } catch(e){}
  }

  function loadBestAsync(cb) {
    try {
      let rq = indexedDB.open('bb_db', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
      rq.onsuccess = () => {
        try {
          let gr = rq.result.transaction('kv', 'readonly').objectStore('kv').get('bb_best');
          gr.onsuccess = () => { if (gr.result) cb(parseInt(gr.result, 10)); };
        } catch(e){}
      };
    } catch(e){}
  }

  let bestScore = loadBest();
  loadBestAsync(v => {
    if (!isNaN(v) && v > bestScore) {
      bestScore = v;
      bestTextEl.textContent = 'BEST ' + String(Math.floor(bestScore)).padStart(4, '0');
    }
  });

  const PIECES = [
    { shape: [[1]], color: '#00f3ff' },
    { shape: [[1, 1]], color: '#4cc9f0' },
    { shape: [[1], [1]], color: '#4cc9f0' },
    { shape: [[1, 1, 1]], color: '#9d4edd' },
    { shape: [[1], [1], [1]], color: '#9d4edd' },
    { shape: [[1, 1, 1, 1]], color: '#ff007f' },
    { shape: [[1], [1], [1]], color: '#ff007f' },
    { shape: [[1, 1], [1, 1]], color: '#ffb703' },
    { shape: [[1, 0], [1, 1]], color: '#00ff87' },
    { shape: [[0, 1], [1, 1]], color: '#00ff87' },
    { shape: [[1, 1], [1, 0]], color: '#00ff87' },
    { shape: [[1, 1], [0, 1]], color: '#00ff87' },
    { shape: [[1, 0, 0], [1, 1, 1]], color: '#ff5e00' },
    { shape: [[0, 0, 1], [1, 1, 1]], color: '#ff5e00' },
    { shape: [[1, 1, 1], [1, 0, 0]], color: '#ff5e00' },
    { shape: [[1, 1, 1], [0, 0, 1]], color: '#ff5e00' },
    { shape: [[1, 1, 1], [0, 1, 0]], color: '#b5179e' },
    { shape: [[0, 1, 0], [1, 1, 1]], color: '#b5179e' },
    { shape: [[1, 0], [1, 1], [1, 0]], color: '#b5179e' },
    { shape: [[0, 1], [1, 1], [0, 1]], color: '#b5179e' },
    { shape: [[1, 1], [1, 0]], color: '#7209b7' },
    { shape: [[1, 1], [0, 1]], color: '#7209b7' }
  ];

  const STATE_PLAYING = 1;
  const STATE_GAMEOVER = 2;

  let gameState = STATE_PLAYING;
  let grid = [];
  let tray = [null, null, null];
  let score = 0, totalLines = 0, combo = 0;
  let draggedIndex = -1;
  let dragX = 0, dragY = 0;
  let isPointerDown = false;
  let particles = [];
  let floatingTexts = [];
  let clearingCells = [];
  let shake = 0;

  const TRAY_Y = 555;
  const TRAY_SLOTS = [
    { x: 90, y: TRAY_Y },
    { x: 270, y: TRAY_Y },
    { x: 450, y: TRAY_Y }
  ];

  function getRandomPiece() {
    let p = PIECES[Math.floor(Math.random() * PIECES.length)];
    return {
      shape: JSON.parse(JSON.stringify(p.shape)),
      color: p.color
    };
  }

  function spawnTrayPieces() {
    for (let i = 0; i < 3; i++) {
      if (tray[i] === null) {
        tray[i] = getRandomPiece();
      }
    }
  }

  function resetGame() {
    grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      grid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        grid[r][c] = null;
      }
    }
    tray = [null, null, null];
    spawnTrayPieces();
    score = 0;
    totalLines = 0;
    combo = 0;
    draggedIndex = -1;
    particles = [];
    floatingTexts = [];
    clearingCells = [];
    shake = 0;

    scoreEl.textContent = '0000';
    bestTextEl.textContent = 'BEST ' + String(Math.floor(bestScore)).padStart(4, '0');
    comboStatus.textContent = 'Combo: 0x';
    linesStatus.textContent = 'Lines Cleared: 0';
  }

  function canPlacePiece(piece, targetRow, targetCol) {
    if (!piece) return false;
    let rows = piece.shape.length;
    let cols = piece.shape[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (piece.shape[r][c] === 1) {
          let gr = targetRow + r;
          let gc = targetCol + c;
          if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
          if (grid[gr][gc] !== null) return false;
        }
      }
    }
    return true;
  }

  function checkGameOver() {
    for (let i = 0; i < 3; i++) {
      let piece = tray[i];
      if (piece) {
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (canPlacePiece(piece, r, c)) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  function addBurst(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      let angle = Math.random() * Math.PI * 2;
      let spd = Math.random() * 4 + 1;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1.0,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
  }

  function addFloatingText(str, x, y, color) {
    floatingTexts.push({
      text: str,
      x: x,
      y: y,
      vy: -1.2,
      life: 1.0,
      color: color
    });
  }

  function placePiece(pieceIndex, targetRow, targetCol) {
    let piece = tray[pieceIndex];
    let rows = piece.shape.length;
    let cols = piece.shape[0].length;
    let placedCellCount = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (piece.shape[r][c] === 1) {
          let gr = targetRow + r;
          let gc = targetCol + c;
          grid[gr][gc] = { color: piece.color };
          placedCellCount++;

          let cx = BOARD_X + gc * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
          let cy = BOARD_Y + gr * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
          addBurst(cx, cy, 4, piece.color);
        }
      }
    }

    playSound('place');
    score += placedCellCount * 10;
    tray[pieceIndex] = null;

    let fullRows = [];
    let fullCols = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      let full = true;
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === null) { full = false; break; }
      }
      if (full) fullRows.push(r);
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let full = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r][c] === null) { full = false; break; }
      }
      if (full) fullCols.push(c);
    }

    let clearedLineCount = fullRows.length + fullCols.length;

    if (clearedLineCount > 0) {
      combo++;
      totalLines += clearedLineCount;
      shake = 12;

      fullRows.forEach(r => {
        for (let c = 0; c < GRID_SIZE; c++) {
          let cx = BOARD_X + c * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
          let cy = BOARD_Y + r * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
          clearingCells.push({ r, c, color: grid[r][c] ? grid[r][c].color : '#00f3ff', life: 1.0 });
          addBurst(cx, cy, 6, '#ffffff');
          grid[r][c] = null;
        }
      });

      fullCols.forEach(c => {
        for (let r = 0; r < GRID_SIZE; r++) {
          let cx = BOARD_X + c * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
          let cy = BOARD_Y + r * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
          if (grid[r][c] !== null) {
            clearingCells.push({ r, c, color: grid[r][c].color, life: 1.0 });
            addBurst(cx, cy, 6, '#ffffff');
            grid[r][c] = null;
          }
        }
      });

      let lineBonus = clearedLineCount * 120 * combo;
      score += lineBonus;

      if (combo > 1) {
        playSound('combo');
        addFloatingText('COMBO x' + combo + '!', BOARD_X + BOARD_W / 2, BOARD_Y + 120, '#ff007f');
      } else {
        playSound('clear');
        addFloatingText('CLEAR +' + lineBonus, BOARD_X + BOARD_W / 2, BOARD_Y + 120, '#00f3ff');
      }

      comboStatus.textContent = 'Combo: ' + combo + 'x';
      linesStatus.textContent = 'Lines Cleared: ' + totalLines;
    } else {
      combo = 0;
      comboStatus.textContent = 'Combo: 0x';
    }

    if (score > bestScore) {
      bestScore = score;
      saveBest(bestScore);
    }

    scoreEl.textContent = String(Math.floor(score)).padStart(4, '0');
    bestTextEl.textContent = 'BEST ' + String(Math.floor(bestScore)).padStart(4, '0');

    if (tray[0] === null && tray[1] === null && tray[2] === null) {
      spawnTrayPieces();
    }

    if (checkGameOver()) {
      gameState = STATE_GAMEOVER;
      playSound('over');
      shake = 18;
    }
  }

  function getCanvasCoords(e) {
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function update(dt) {
    if (shake > 0) shake = Math.max(0, shake - 0.6 * dt);

    particles.forEach(pt => {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= 0.03 * dt;
    });
    particles = particles.filter(pt => pt.life > 0);

    floatingTexts.forEach(ft => {
      ft.y += ft.vy * dt;
      ft.life -= 0.02 * dt;
    });
    floatingTexts = floatingTexts.filter(ft => ft.life > 0);

    clearingCells.forEach(cc => cc.life -= 0.05 * dt);
    clearingCells = clearingCells.filter(cc => cc.life > 0);
  }

  function drawPieceShape(piece, startX, startY, scale, alpha = 1.0, isGhost = false, isValid = true) {
    let rows = piece.shape.length;
    let cols = piece.shape[0].length;
    let size = CELL_SIZE * scale;
    let gap = CELL_GAP * scale;

    ctx.save();
    ctx.globalAlpha = alpha;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (piece.shape[r][c] === 1) {
          let x = startX + c * (size + gap);
          let y = startY + r * (size + gap);

          if (isGhost) {
            ctx.fillStyle = isValid ? 'rgba(0, 243, 255, 0.45)' : 'rgba(255, 0, 85, 0.35)';
            ctx.fillRect(x, y, size, size);
            ctx.strokeStyle = isValid ? '#00f3ff' : '#ff0055';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, size, size);
          } else {
            ctx.shadowColor = piece.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = piece.color;
            ctx.fillRect(x, y, size, size);

            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fillRect(x + 3, y + 3, size - 6, size / 3);
          }
        }
      }
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    let bgGrad = ctx.createLinearGradient(0, 0, 0, c.height);
    bgGrad.addColorStop(0, '#060911');
    bgGrad.addColorStop(1, '#0e1322');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = 'rgba(15, 20, 32, 0.8)';
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(BOARD_X - 10, BOARD_Y - 10, BOARD_W + 20, BOARD_W + 20, 14);
    ctx.fill();
    ctx.stroke();

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let x = BOARD_X + c * (CELL_SIZE + CELL_GAP);
        let y = BOARD_Y + r * (CELL_SIZE + CELL_GAP);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

        if (grid[r][c] !== null) {
          ctx.save();
          ctx.shadowColor = grid[r][c].color;
          ctx.shadowBlur = 6;
          ctx.fillStyle = grid[r][c].color;
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE / 3);
          ctx.restore();
        }
      }
    }

    clearingCells.forEach(cc => {
      let x = BOARD_X + cc.c * (CELL_SIZE + CELL_GAP);
      let y = BOARD_Y + cc.r * (CELL_SIZE + CELL_GAP);
      ctx.save();
      ctx.globalAlpha = cc.life;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = cc.color;
      ctx.shadowBlur = 16;
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      ctx.restore();
    });

    if (draggedIndex !== -1 && tray[draggedIndex]) {
      let piece = tray[draggedIndex];
      let pieceW = piece.shape[0].length;
      let pieceH = piece.shape.length;

      let targetCenterX = dragX;
      let targetCenterY = dragY - 65;

      let piecePxW = pieceW * CELL_SIZE + (pieceW - 1) * CELL_GAP;
      let piecePxH = pieceH * CELL_SIZE + (pieceH - 1) * CELL_GAP;

      let tlX = targetCenterX - piecePxW / 2;
      let tlY = targetCenterY - piecePxH / 2;

      let col = Math.round((tlX - BOARD_X) / (CELL_SIZE + CELL_GAP));
      let row = Math.round((tlY - BOARD_Y) / (CELL_SIZE + CELL_GAP));

      let isValid = canPlacePiece(piece, row, col);

      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        let ghostX = BOARD_X + col * (CELL_SIZE + CELL_GAP);
        let ghostY = BOARD_Y + row * (CELL_SIZE + CELL_GAP);
        drawPieceShape(piece, ghostX, ghostY, 1.0, 0.7, true, isValid);
      }
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(BOARD_X - 10, TRAY_Y - 45, BOARD_W + 20, 130, 14);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      if (tray[i] && i !== draggedIndex) {
        let piece = tray[i];
        let pW = piece.shape[0].length;
        let pH = piece.shape.length;
        let scale = 0.55;

        let pPxW = (pW * CELL_SIZE + (pW - 1) * CELL_GAP) * scale;
        let pPxH = (pH * CELL_SIZE + (pH - 1) * CELL_GAP) * scale;

        let startX = TRAY_SLOTS[i].x - pPxW / 2;
        let startY = TRAY_SLOTS[i].y - pPxH / 2;

        drawPieceShape(piece, startX, startY, scale, 1.0);
      }
    }

    if (draggedIndex !== -1 && tray[draggedIndex]) {
      let piece = tray[draggedIndex];
      let pW = piece.shape[0].length;
      let pH = piece.shape.length;
      let pPxW = pW * CELL_SIZE + (pW - 1) * CELL_GAP;
      let pPxH = pH * CELL_SIZE + (pH - 1) * CELL_GAP;

      let startX = dragX - pPxW / 2;
      let startY = dragY - 65 - pPxH / 2;

      drawPieceShape(piece, startX, startY, 1.0, 0.95);
    }

    particles.forEach(pt => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 6;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      ctx.restore();
    });

    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 12;
      ctx.font = '900 24px "Segoe UI", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();

    if (gameState === STATE_GAMEOVER) {
      ctx.fillStyle = 'rgba(6, 9, 17, 0.8)';
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 20;
      ctx.font = '900 34px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ff0055';
      ctx.fillText('NO MORE MOVES!', c.width / 2, c.height / 2 - 35);

      ctx.shadowBlur = 0;
      ctx.font = '700 18px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('SCORE: ' + Math.floor(score), c.width / 2, c.height / 2 + 5);

      ctx.font = '600 13px "Segoe UI", sans-serif';
      ctx.fillStyle = '#00f3ff';
      ctx.fillText('TAP UNTUK MAIN LAGI', c.width / 2, c.height / 2 + 42);
      ctx.restore();
    }
  }

  function gameLoop(time) {
    update(1.0);
    draw();
    requestAnimationFrame(gameLoop);
  }

  function handlePointerDown(e) {
    initAudio();
    if (e.cancelable && e.type && e.type.startsWith('touch')) e.preventDefault();

    if (gameState === STATE_GAMEOVER) {
      gameState = STATE_PLAYING;
      resetGame();
      return;
    }

    const pos = getCanvasCoords(e);
    isPointerDown = true;
    dragX = pos.x;
    dragY = pos.y;

    for (let i = 0; i < 3; i++) {
      if (tray[i]) {
        let slot = TRAY_SLOTS[i];
        let dx = Math.abs(pos.x - slot.x);
        let dy = Math.abs(pos.y - slot.y);
        if (dx < 65 && dy < 65) {
          draggedIndex = i;
          break;
        }
      }
    }
  }

  function handlePointerMove(e) {
    if (!isPointerDown || draggedIndex === -1) return;
    if (e.cancelable && e.type && e.type.startsWith('touch')) e.preventDefault();
    const pos = getCanvasCoords(e);
    dragX = pos.x;
    dragY = pos.y;
  }

  function handlePointerUp(e) {
    if (!isPointerDown) return;
    if (e.cancelable && e.type && e.type.startsWith('touch')) e.preventDefault();

    if (draggedIndex !== -1 && tray[draggedIndex]) {
      let piece = tray[draggedIndex];
      let pW = piece.shape[0].length;
      let pH = piece.shape.length;

      let targetCenterX = dragX;
      let targetCenterY = dragY - 65;

      let pPxW = pW * CELL_SIZE + (pW - 1) * CELL_GAP;
      let pPxH = pH * CELL_SIZE + (pH - 1) * CELL_GAP;

      let tlX = targetCenterX - pPxW / 2;
      let tlY = targetCenterY - pPxH / 2;

      let col = Math.round((tlX - BOARD_X) / (CELL_SIZE + CELL_GAP));
      let row = Math.round((tlY - BOARD_Y) / (CELL_SIZE + CELL_GAP));

      if (canPlacePiece(piece, row, col)) {
        placePiece(draggedIndex, row, col);
      }
    }

    draggedIndex = -1;
    isPointerDown = false;
  }

  c.addEventListener('touchstart', handlePointerDown, { passive: false });
  c.addEventListener('touchmove', handlePointerMove, { passive: false });
  c.addEventListener('touchend', handlePointerUp, { passive: false });

  c.addEventListener('mousedown', handlePointerDown);
  window.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('mouseup', handlePointerUp);

  resetGame();
  requestAnimationFrame(gameLoop);
})();
</script>`;

const handler = async (m, { conn, sock }) => {
	const client = conn || sock;

	await client.relayMessage(
		m.chat,
		{
			messageContextInfo: {
				deviceListMetadata: {},
				deviceListMetadataVersion: 2,
				botMetadata: {
					messageDisclaimerText: "",
					botResponseId: "b2e40280-433c-45d8-9c1a-270bec558860",
					verificationMetadata: {
						proofs: [
							{
								version: 1,
								useCase: 1,
								signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YeN55YRyad2+ZA==",
								certificateChain: [
									"TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg",
									"TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZLXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYbNBkuLoZnQAq4j8yRekrQ=="
								]
							}
						]
					}
				}
			},
			botForwardedMessage: {
				message: {
					richResponseMessage: {
						messageType: 1,
						submessages: [
							{
								messageType: 2,
								messageText: "Block Blast Mini Game"
							}
						],
						unifiedResponse: {
							data: Buffer.from(JSON.stringify({
								"response_id": "4db57b2c-8393-484d-8b9a-8e6d1a14b349",
								"sections": [
									{
										"view_model": {
											"primitive": {
												"__typename": "GenAIaeacdsnwHtmlPrimitive",
												"payload": htmlPayload,
												"trusted_sources": [
													"lumnztyz.dev"
												]
											},
											"__typename": "GenAISingleLayoutViewModel"
										}
									}
								]
							})).toString('base64')
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
		},
		{}
	);
};

handler.help = ['blockblast', 'blockgame', 'blockpuzzle'];
handler.tags = ['game'];
handler.category = 'game';
handler.description = 'Main game Block Blast Mini interaktif via Rich Message';
handler.command = ['blockblast', 'blockgame', 'blockpuzzle', 'block'];

export default handler;