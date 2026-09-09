
const htmlPayload = `<style>
* { -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; box-sizing: border-box; }
body { margin: 0; background: transparent; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #eee; touch-action: manipulation; cursor: pointer; }
.gd-wrap { width: 100%; max-width: 640px; margin: auto; padding: 12px; }
.gd-card { background: rgba(15, 18, 28, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(0, 243, 255, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 243, 255, 0.15), 0 0 15px rgba(157, 78, 221, 0.2); }
.gd-header { padding: 14px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, rgba(0,243,255,0.05), rgba(157,78,221,0.05)); }
.gd-sub { font-size: 10px; letter-spacing: 2px; color: #00f3ff; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 4px; }
.gd-title { font-size: 20px; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(0, 243, 255, 0.6); letter-spacing: 1px; }
.gd-stats { text-align: right; display: flex; align-items: center; gap: 14px; }
.gd-score { font-size: 20px; font-weight: 900; color: #00f3ff; text-shadow: 0 0 12px rgba(0, 243, 255, 0.8); transition: transform 0.15s ease-out; }
.gd-best { font-size: 10px; color: rgba(255, 255, 255, 0.5); font-weight: 600; margin-top: 1px; display: flex; align-items: center; justify-content: flex-end; gap: 3px; }
.gd-audio-btn { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; padding: 0; }
.gd-audio-btn:active { transform: scale(0.9); }
.gd-body { padding: 14px; position: relative; }
.gd-progress-wrap { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; margin-bottom: 10px; overflow: hidden; position: relative; }
.gd-progress-bar { width: 0%; height: 100%; background: linear-gradient(90deg, #00f3ff, #9d4edd); border-radius: 3px; box-shadow: 0 0 8px #00f3ff; transition: width 0.1s linear; }
canvas#game { width: 100%; height: auto; background: #080b12; border: 1px solid rgba(0, 243, 255, 0.2); border-radius: 12px; display: block; box-shadow: inset 0 0 20px rgba(0,0,0,0.8); }
.gd-status { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: rgba(255, 255, 255, 0.6); font-weight: 600; }
.svg-icon { display: inline-block; vertical-align: middle; }
</style>

<div class="gd-wrap">
  <div class="gd-card">
    <div class="gd-header">
      <div>
        <div class="gd-sub">
          <svg class="svg-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4m-2-2v4"></path><circle cx="17" cy="10" r="1" fill="#00f3ff"></circle><circle cx="15" cy="13" r="1" fill="#00f3ff"></circle></svg>
          LUMNZTYZ6X
        </div>
        <div class="gd-title">Geometry Dash Mini</div>
      </div>
      <div class="gd-stats">
        <button id="soundToggle" class="gd-audio-btn" title="Toggle Sound">
          <svg id="iconAudioOn" class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          <svg id="iconAudioOff" class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        </button>
        <div>
          <div id="score" class="gd-score">0000</div>
          <div id="best" class="gd-best">
            <svg class="svg-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
            <span id="bestText">BEST 0000</span>
          </div>
        </div>
      </div>
    </div>
    <div class="gd-body">
      <div class="gd-progress-wrap"><div id="progressBar" class="gd-progress-bar"></div></div>
      <canvas id="game" width="640" height="360"></canvas>
      <div class="gd-status">
        <span id="levelStatus">Level 1</span>
        <span id="speedStatus">Speed 5.2x</span>
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
  const progressBar = document.getElementById('progressBar');
  const levelStatus = document.getElementById('levelStatus');
  const speedStatus = document.getElementById('speedStatus');
  const soundBtn = document.getElementById('soundToggle');
  const iconAudioOn = document.getElementById('iconAudioOn');
  const iconAudioOff = document.getElementById('iconAudioOff');

  const GY = 290;
  const P_SIZE = 28;

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
      if (type === 'jump') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'double_jump') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.14);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'crash') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'level') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        osc.frequency.setValueAtTime(783, now + 0.16);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch(err) {}
  }

  function loadBest() {
    let vals = [];
    try { let v = localStorage.getItem('gd_best'); if (v) vals.push(parseInt(v, 10)); } catch(e){}
    try { let v = sessionStorage.getItem('gd_best'); if (v) vals.push(parseInt(v, 10)); } catch(e){}
    try { let m = document.cookie.match(/(?:^|;\\s*)gd_best=(\\d+)/); if (m) vals.push(parseInt(m[1], 10)); } catch(e){}
    return vals.length ? Math.max(...vals.filter(v => !isNaN(v))) : 0;
  }

  function saveBest(val) {
    let s = String(Math.floor(val));
    try { localStorage.setItem('gd_best', s); } catch(e){}
    try { sessionStorage.setItem('gd_best', s); } catch(e){}
    try { document.cookie = 'gd_best=' + s + ';max-age=31536000;path=/'; } catch(e){}
    try {
      let rq = indexedDB.open('gd_db', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
      rq.onsuccess = () => { try { rq.result.transaction('kv', 'readwrite').objectStore('kv').put(s, 'gd_best'); } catch(e){} };
    } catch(e){}
  }

  function loadBestAsync(cb) {
    try {
      let rq = indexedDB.open('gd_db', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
      rq.onsuccess = () => {
        try {
          let gr = rq.result.transaction('kv', 'readonly').objectStore('kv').get('gd_best');
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

  const STATE_PLAYING = 1;
  const STATE_GAMEOVER = 2;

  let gameState = STATE_PLAYING;
  let player, obstacles, particles, trail, bgStars;
  let score, speed, level, levelProgress;
  let spawnTimer, lastTime, shake, flash, runTime;
  let accentColor = '#00f3ff';
  let secondaryColor = '#9d4edd';

  const themeColors = [
    { primary: '#00f3ff', secondary: '#9d4edd' },
    { primary: '#ff007f', secondary: '#ffb703' },
    { primary: '#00ff87', secondary: '#60efff' },
    { primary: '#ff5e00', secondary: '#ff0055' }
  ];

  function resetGame() {
    player = {
      x: 90,
      y: GY - P_SIZE,
      w: P_SIZE,
      h: P_SIZE,
      vy: 0,
      rotation: 0,
      isGrounded: true,
      jumpCount: 0,
      maxJumps: 2
    };
    obstacles = [];
    particles = [];
    trail = [];
    bgStars = [];
    for (let i = 0; i < 28; i++) {
      bgStars.push({
        x: Math.random() * c.width,
        y: Math.random() * (GY - 30),
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.4 + 0.1,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
    score = 0;
    speed = 5.2;
    level = 1;
    levelProgress = 0;
    spawnTimer = 35;
    lastTime = 0;
    shake = 0;
    flash = 0;
    runTime = 0;

    let theme = themeColors[0];
    accentColor = theme.primary;
    secondaryColor = theme.secondary;

    scoreEl.textContent = '0000';
    bestTextEl.textContent = 'BEST ' + String(Math.floor(bestScore)).padStart(4, '0');
    speedStatus.textContent = 'Speed 5.2x';
    levelStatus.textContent = 'Level 1';
    progressBar.style.width = '0%';
  }

  function addBurst(x, y, count, color, maxSpd) {
    for (let i = 0; i < count; i++) {
      let angle = Math.random() * Math.PI * 2;
      let spd = (Math.random() * 0.8 + 0.2) * maxSpd;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 0.5,
        life: 1.0,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
  }

  function triggerJump() {
    initAudio();
    if (gameState === STATE_GAMEOVER) {
      resetGame();
      gameState = STATE_PLAYING;
      performJump();
      return;
    }

    if (gameState === STATE_PLAYING) {
      performJump();
    }
  }

  function performJump() {
    if (player.jumpCount < player.maxJumps) {
      player.vy = -11.5;
      player.isGrounded = false;
      player.jumpCount++;

      if (player.jumpCount === 1) {
        playSound('jump');
        addBurst(player.x + P_SIZE/2, player.y + P_SIZE, 8, accentColor, 4);
      } else {
        playSound('double_jump');
        addBurst(player.x + P_SIZE/2, player.y + P_SIZE/2, 14, '#ffffff', 5);
        addBurst(player.x + P_SIZE/2, player.y + P_SIZE/2, 10, secondaryColor, 4.5);
      }
    }
  }

  function spawnObstacles() {
    let rand = Math.random();
    let startX = c.width + 20;

    if (rand < 0.25) {
      obstacles.push({ type: 'spike', x: startX, y: GY - 28, w: 24, h: 28 });
      if (Math.random() < 0.5) {
        obstacles.push({ type: 'spike', x: startX + 24, y: GY - 28, w: 24, h: 28 });
      }
    } else if (rand < 0.45) {
      let h1 = 32, h2 = 64;
      obstacles.push({ type: 'block', x: startX, y: GY - h1, w: 48, h: h1 });
      obstacles.push({ type: 'block', x: startX + 58, y: GY - h2, w: 48, h: h2 });
      if (level >= 2) {
        obstacles.push({ type: 'spike', x: startX + 70, y: GY - h2 - 24, w: 24, h: 24 });
      }
    } else if (rand < 0.65) {
      obstacles.push({ type: 'spike', x: startX + 20, y: GY - 28, w: 24, h: 28 });
      obstacles.push({ type: 'block', x: startX + 70, y: GY - 75, w: 64, h: 24 });
      obstacles.push({ type: 'spike', x: startX + 90, y: GY - 99, w: 24, h: 24 });
    } else if (rand < 0.82) {
      obstacles.push({ type: 'block', x: startX, y: GY - 32, w: 40, h: 32 });
      obstacles.push({ type: 'spike_down', x: startX + 60, y: GY - 130, w: 26, h: 30 });
      obstacles.push({ type: 'block', x: startX + 110, y: GY - 32, w: 40, h: 32 });
    } else {
      obstacles.push({ type: 'spike', x: startX, y: GY - 28, w: 24, h: 28 });
      obstacles.push({ type: 'block', x: startX + 45, y: GY - 60, w: 50, h: 24 });
      obstacles.push({ type: 'spike', x: startX + 110, y: GY - 28, w: 24, h: 28 });
    }
  }

  function checkCollision(p, obs) {
    let px = p.x + 3, py = p.y + 3, pw = p.w - 6, ph = p.h - 6;

    if (obs.type === 'spike' || obs.type === 'spike_down') {
      return (px < obs.x + obs.w && px + pw > obs.x && py < obs.y + obs.h && py + ph > obs.y);
    } else if (obs.type === 'block') {
      return (px < obs.x + obs.w && px + pw > obs.x && py < obs.y + obs.h && py + ph > obs.y);
    }
    return false;
  }

  function update(dt) {
    runTime += dt;

    if (gameState === STATE_PLAYING) {
      player.vy += 0.72 * dt;
      player.y += player.vy * dt;

      if (!player.isGrounded) {
        player.rotation += 0.22 * dt;
        trail.push({ x: player.x, y: player.y, rotation: player.rotation });
        if (trail.length > 6) trail.shift();
      } else {
        trail.length = 0;
        let snap = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
        player.rotation += (snap - player.rotation) * 0.35 * dt;
      }

      if (player.y >= GY - P_SIZE) {
        if (!player.isGrounded) {
          addBurst(player.x + P_SIZE/2, GY, 5, '#ffffff', 2);
        }
        player.y = GY - P_SIZE;
        player.vy = 0;
        player.isGrounded = true;
        player.jumpCount = 0;
      }

      obstacles.forEach(obs => {
        if (obs.type === 'block') {
          let pBottom = player.y + player.h;
          let pPrevBottom = pBottom - player.vy * dt;
          if (player.x + player.w - 6 > obs.x && player.x + 6 < obs.x + obs.w) {
            if (pPrevBottom <= obs.y + 8 && pBottom >= obs.y && player.vy >= 0) {
              player.y = obs.y - player.h;
              player.vy = 0;
              player.isGrounded = true;
              player.jumpCount = 0;
            }
          }
        }
      });

      bgStars.forEach(s => {
        s.x -= s.speed * speed * 0.25 * dt;
        if (s.x < 0) s.x = c.width;
      });

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnObstacles();
        let minGap = Math.max(45, 85 - speed * 3.5);
        spawnTimer = minGap + Math.random() * 30;
      }

      obstacles.forEach(obs => obs.x -= speed * dt);
      obstacles = obstacles.filter(obs => obs.x > -120);

      particles.forEach(pt => {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 0.2 * dt;
        pt.life -= 0.035 * dt;
      });
      particles = particles.filter(pt => pt.life > 0);

      speed = Math.min(11.0, speed + 0.0016 * dt);
      score += dt * 0.7;

      levelProgress = (score % 250) / 250;
      let newLevel = Math.floor(score / 250) + 1;
      if (newLevel !== level) {
        level = newLevel;
        playSound('level');
        flash = 0.8;
        let theme = themeColors[(level - 1) % themeColors.length];
        accentColor = theme.primary;
        secondaryColor = theme.secondary;
      }

      progressBar.style.width = Math.min(100, (levelProgress * 100)).toFixed(1) + '%';
      levelStatus.textContent = 'Level ' + level;
      speedStatus.textContent = 'Speed ' + speed.toFixed(1) + 'x';

      if (score > bestScore) {
        bestScore = score;
        saveBest(bestScore);
      }

      scoreEl.textContent = String(Math.floor(score)).padStart(4, '0');
      bestTextEl.textContent = 'BEST ' + String(Math.floor(bestScore)).padStart(4, '0');

      for (const obs of obstacles) {
        if (checkCollision(player, obs)) {
          gameState = STATE_GAMEOVER;
          shake = 16;
          flash = 1.0;
          playSound('crash');
          addBurst(player.x + P_SIZE/2, player.y + P_SIZE/2, 28, accentColor, 6);
          addBurst(player.x + P_SIZE/2, player.y + P_SIZE/2, 20, '#ff0055', 5);
          break;
        }
      }
    }

    if (shake > 0) shake = Math.max(0, shake - 0.7 * dt);
    if (flash > 0) flash = Math.max(0, flash - 0.05 * dt);
  }

  function drawGrid() {
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    let gridOffset = (runTime * speed * 2) % 24;

    ctx.beginPath();
    for (let x = -gridOffset; x < c.width; x += 24) {
      ctx.moveTo(x, GY);
      ctx.lineTo(x - 20, c.height);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let y = GY; y < c.height; y += 14) {
      ctx.moveTo(0, y);
      ctx.lineTo(c.width, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
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

    bgStars.forEach(s => {
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = s.alpha * 0.5;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.globalAlpha = 1.0;

    let groundGrad = ctx.createLinearGradient(0, GY, 0, c.height);
    groundGrad.addColorStop(0, 'rgba(15, 20, 35, 0.95)');
    groundGrad.addColorStop(1, 'rgba(5, 8, 15, 1)');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GY, c.width, c.height - GY);

    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GY);
    ctx.lineTo(c.width, GY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    drawGrid();

    trail.forEach((t, idx) => {
      ctx.save();
      ctx.translate(t.x + P_SIZE/2, t.y + P_SIZE/2);
      ctx.rotate(t.rotation);
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.15 * (idx / trail.length);
      ctx.fillRect(-P_SIZE/2, -P_SIZE/2, P_SIZE, P_SIZE);
      ctx.restore();
    });

    if (gameState !== STATE_GAMEOVER) {
      ctx.save();
      ctx.translate(player.x + P_SIZE/2, player.y + P_SIZE/2);
      ctx.rotate(player.rotation);

      ctx.shadowColor = accentColor;
      ctx.shadowBlur = player.jumpCount === 2 ? 18 : 12;
      ctx.fillStyle = player.jumpCount === 2 ? '#ffffff' : accentColor;
      ctx.fillRect(-P_SIZE/2, -P_SIZE/2, P_SIZE, P_SIZE);

      ctx.fillStyle = '#060911';
      ctx.fillRect(-P_SIZE/2 + 4, -P_SIZE/2 + 4, P_SIZE - 8, P_SIZE - 8);

      ctx.fillStyle = secondaryColor;
      ctx.fillRect(-P_SIZE/2 + 8, -P_SIZE/2 + 8, P_SIZE - 16, P_SIZE - 16);

      ctx.restore();
    }

    obstacles.forEach(obs => {
      ctx.save();
      if (obs.type === 'spike') {
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.w / 2, obs.y);
        ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
        ctx.lineTo(obs.x, obs.y + obs.h);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (obs.type === 'spike_down') {
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y);
        ctx.lineTo(obs.x + obs.w, obs.y);
        ctx.lineTo(obs.x + obs.w / 2, obs.y + obs.h);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (obs.type === 'block') {
        ctx.shadowColor = secondaryColor;
        ctx.shadowBlur = 8;
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(obs.x + 2, obs.y + 2, obs.w - 4, obs.h - 4);
      }
      ctx.restore();
    });

    particles.forEach(pt => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 6;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      ctx.restore();
    });

    if (flash > 0) {
      ctx.fillStyle = 'rgba(255, 0, 85, ' + (flash * 0.35) + ')';
      ctx.fillRect(0, 0, c.width, c.height);
    }

    ctx.restore();

    if (gameState === STATE_GAMEOVER) {
      ctx.fillStyle = 'rgba(6, 9, 17, 0.75)';
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 18;
      ctx.font = '900 32px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ff0055';
      ctx.fillText('GAME OVER', c.width / 2, c.height / 2 - 25);

      ctx.shadowBlur = 0;
      ctx.font = '700 16px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('SCORE: ' + Math.floor(score), c.width / 2, c.height / 2 + 10);

      ctx.font = '600 13px "Segoe UI", sans-serif';
      ctx.fillStyle = accentColor;
      ctx.fillText('TAP ATAU TEKAN SPACE UNTUK MAIN LAGI', c.width / 2, c.height / 2 + 42);
      ctx.restore();
    }
  }

  function gameLoop(time) {
    if (!lastTime) lastTime = time;
    let dt = Math.min((time - lastTime) / 16.67, 2.0);
    lastTime = time;

    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
  }

  function handleInput(e) {
    if (e.target && e.target.closest && e.target.closest('#soundToggle')) return;
    if (e.cancelable && e.type && e.type.startsWith('touch')) e.preventDefault();
    triggerJump();
  }

  c.addEventListener('touchstart', handleInput, { passive: false });
  c.addEventListener('mousedown', handleInput);

  window.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      triggerJump();
    }
  });

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
									"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"
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
								messageText: "Geometry Dash Mini Game"
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

handler.help = ['geometrydash', 'gdmini', 'geometrygame'];
handler.tags = ['game'];
handler.category = 'game';
handler.description = 'Main game Geometry Dash Mini interaktif via Rich Message';
handler.command = ['geometrydash', 'gdmini', 'gd', 'geometrygame'];

export default handler;