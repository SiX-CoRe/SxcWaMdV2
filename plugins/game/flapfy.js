import { randomUUID } from 'crypto';

const handler = async (m, { conn }) => {
  const responseId = randomUUID();

  const html = `
<style>
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow: hidden;
    background: transparent;
    font-family: Arial, sans-serif;
    touch-action: none;
  }
  .flappyWrap {
    width: 100%;
    padding: 6px;
    margin: 0;
    overflow: hidden;
    border: 2px solid rgba(255,255,255,.7);
    border-radius: 18px;
    background: linear-gradient(145deg, #58b9e8, #2386bd);
    box-shadow: 0 0 0 1px rgba(0,0,0,.12), 0 4px 15px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.4);
  }
  .flappyHeader {
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.45);
    border-radius: 13px 13px 9px 9px;
    margin-bottom: 5px;
    background: linear-gradient(180deg, #69c8f1, #3297ca);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 2px 5px rgba(0,0,0,.15);
  }
  .flappyHeaderTitle {
    color: #fff;
    font: bold 22px Arial, sans-serif;
    letter-spacing: 2px;
    text-shadow: 0 2px 0 #17658d, 0 3px 5px rgba(0,0,0,.35);
  }
  .flappyHeaderTitle span {
    color: #ffd447;
  }
  .flappyHeaderBird {
    position: absolute;
    font-size: 19px;
    text-shadow: 0 2px 2px rgba(0,0,0,.25);
  }
  .flappyHeaderBird.left {
    left: 12px;
  }
  .flappyHeaderBird.right {
    right: 12px;
    transform: scaleX(-1);
  }
  .flappyGame {
    position: relative;
    width: 100%;
    height: 210px;
    overflow: hidden;
    border: 2px solid rgba(255,255,255,.75);
    border-radius: 14px;
    background: #8fd8ff;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 2px 7px rgba(0,0,0,.2);
  }
  #flappyCanvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  .flappyScore {
    position: absolute;
    top: 9px;
    left: 0;
    right: 0;
    z-index: 5;
    text-align: center;
    color: #fff;
    font: bold 25px Arial, sans-serif;
    text-shadow: 0 2px 3px rgba(0,0,0,.3);
    pointer-events: none;
  }
  .flappyBest {
    position: absolute;
    top: 39px;
    left: 0;
    right: 0;
    z-index: 5;
    text-align: center;
    color: rgba(255,255,255,.95);
    font: bold 10px monospace;
    text-shadow: 0 1px 2px rgba(0,0,0,.3);
    pointer-events: none;
  }
  .flappyStart {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: rgba(72,177,224,.18);
  }
  .flappyStart.hide {
    display: none;
  }
  .flappyTitle {
    color: #fff;
    font: bold 25px Arial, sans-serif;
    text-shadow: 0 2px 4px rgba(0,0,0,.35);
    margin-bottom: 7px;
  }
  .flappyText {
    color: #fff;
    font: bold 11px monospace;
    text-shadow: 0 1px 3px rgba(0,0,0,.4);
  }
  .flappyOver {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: rgba(24,74,100,.48);
  }
  .flappyOver.show {
    display: flex;
  }
  .flappyOverTitle {
    color: #fff;
    font: bold 22px Arial, sans-serif;
    text-shadow: 0 2px 4px rgba(0,0,0,.5);
    margin-bottom: 5px;
  }
  .flappyFinal {
    color: #fff;
    font: bold 12px monospace;
    text-shadow: 0 1px 3px rgba(0,0,0,.5);
  }
  .flappyRestart {
    margin-top: 10px;
    padding: 7px 17px;
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 7px;
    background: #fff;
    color: #4b9ac4;
    font: bold 11px Arial, sans-serif;
    box-shadow: 0 2px 5px rgba(0,0,0,.15);
  }
  .flappyHint {
    position: absolute;
    z-index: 4;
    bottom: 6px;
    left: 0;
    right: 0;
    text-align: center;
    color: rgba(255,255,255,.78);
    font: bold 9px monospace;
    text-shadow: 0 1px 2px rgba(0,0,0,.25);
    pointer-events: none;
  }
  .flappyFooter {
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-top: 5px;
    padding: 0 9px;
    border: 1px solid rgba(255,255,255,.42);
    border-radius: 9px;
    background: rgba(24,111,157,.55);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.2);
  }
  .flappySound {
    color: #fff;
    font-size: 17px;
    text-shadow: 0 2px 3px rgba(0,0,0,.3);
  }
  .flappyFooterText {
    color: #fff;
    font: bold 9px monospace;
    text-shadow: 0 1px 2px rgba(0,0,0,.3);
  }
  .flappyFooterBest {
    color: #ffe66a;
    font: bold 10px monospace;
    text-shadow: 0 1px 2px rgba(0,0,0,.3);
  }
</style>

<div class="flappyWrap">
  <div class="flappyHeader">
    <div class="flappyHeaderBird left">🐤</div>
    <div class="flappyHeaderTitle">FLAPPY <span>BIRD</span></div>
    <div class="flappyHeaderBird right">🐤</div>
  </div>

  <div class="flappyGame" id="flappyGame">
    <div class="flappyScore" id="flappyScore">0</div>
    <div class="flappyBest">BEST <span id="flappyBestValue">0</span></div>
    <canvas id="flappyCanvas"></canvas>
    <div class="flappyHint">TAP / SPACE TO FLY</div>

    <div class="flappyStart" id="flappyStart">
      <div class="flappyTitle">FLAPPY BIRD</div>
      <div class="flappyText">TAP TO START</div>
    </div>

    <div class="flappyOver" id="flappyOver">
      <div class="flappyOverTitle">GAME OVER</div>
      <div class="flappyFinal">SCORE <span id="flappyFinalScore">0</span></div>
      <button class="flappyRestart" id="flappyRestart">PLAY AGAIN</button>
    </div>
  </div>

  <div class="flappyFooter">
    <div class="flappySound">🔊</div>
    <div class="flappyFooterText">TAP TO FLY</div>
    <div class="flappyFooterBest">BEST <span id="flappyFooterBest">0</span></div>
  </div>
</div>

<script>
  (function() {
    const canvas = document.getElementById('flappyCanvas');
    const ctx = canvas.getContext('2d');
    const game = document.getElementById('flappyGame');

    const scoreEl = document.getElementById('flappyScore');
    const bestEl = document.getElementById('flappyBestValue');
    const footerBestEl = document.getElementById('flappyFooterBest');

    const startEl = document.getElementById('flappyStart');
    const overEl = document.getElementById('flappyOver');
    const finalEl = document.getElementById('flappyFinalScore');
    const restartEl = document.getElementById('flappyRestart');

    let W = 0, H = 0, DPR = 1;
    let running = false, gameOver = false;
    let score = 0, best = 0;
    let speed = 2.7, last = 0;
    let spawnTimer = 0, frame = 0;
    let pipes = [], clouds = [], particles = [];
    let audioCtx = null;
    const groundHeight = 22;

    const bird = { x: 0, y: 0, w: 30, h: 24, vy: 0, rotation: 0, wing: 0 };

    try {
      best = parseInt(localStorage.getItem('flappy_bird_best') || '0');
      if (!Number.isFinite(best)) best = 0;
    } catch(e) { best = 0; }

    function initAudio() {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playFlapSound() {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + .07);
      
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.07, now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .075);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + .08);
    }

    function playGameOverSound() {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + .42);
      
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.12, now + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .45);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + .46);
    }

    function playScoreSound() {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(1080, now + .09);
      
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.055, now + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .11);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + .12);
    }

    function resize() {
      const r = game.getBoundingClientRect();
      W = r.width; H = r.height;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      
      bird.x = W * .22;
      if (!running) bird.y = H * .45;
      draw();
    }

    function makeCloud(x, y, w, speed) {
      return { x, y, w, h: w * .42, speed, alpha: .72 + Math.random() * .16 };
    }

    function resetClouds() {
      clouds = [
        makeCloud(W * .08, 25, 55, .20),
        makeCloud(W * .48, 55, 70, .14),
        makeCloud(W * .86, 22, 50, .22)
      ];
    }

    function reset() {
      score = 0; speed = 2.7; spawnTimer = 65; frame = 0;
      pipes = []; particles = [];
      resetClouds();
      
      bird.x = W * .22; bird.y = H * .45;
      bird.vy = 0; bird.rotation = 0; bird.wing = 0;
      
      gameOver = false; running = true;
      startEl.classList.add('hide');
      overEl.classList.remove('show');
      
      updateUI();
      last = performance.now();
      requestAnimationFrame(loop);
    }

    function updateUI() {
      const currentScore = Math.floor(score);
      scoreEl.textContent = String(currentScore);
      bestEl.textContent = String(Math.floor(best));
      footerBestEl.textContent = String(Math.floor(best));
    }

    function flap() {
      initAudio();
      if (!running || gameOver) {
        reset();
        playFlapSound();
        return;
      }
      bird.vy = -7.4;
      playFlapSound();
      createParticles(bird.x - 2, bird.y + 12, 5);
    }

    function createParticles(px, py, count) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: px, y: py,
          vx: -Math.random() * 1.5,
          vy: (Math.random() - .5) * 1.8,
          life: 1, size: 1 + Math.random() * 2
        });
      }
    }

    function createPipe() {
      const playableTop = 35;
      const playableBottom = H - groundHeight - 18;
      const gap = Math.max(72, 88 - score * .12);
      const minTop = playableTop + 18;
      const maxTop = playableBottom - gap - 18;
      const topHeight = minTop + Math.random() * Math.max(10, maxTop - minTop);
      
      pipes.push({ x: W + 18, w: 34, top: topHeight, gap: gap, passed: false });
    }

    function hit(a, b) {
      return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
    }

    function pipeCollision(p) {
      const birdBox = { x: bird.x + 5, y: bird.y + 4, w: bird.w - 9, h: bird.h - 7 };
      const bottomY = p.top + p.gap;
      const topPipe = { x: p.x, y: 0, w: p.w, h: p.top };
      const bottomPipe = { x: p.x, y: bottomY, w: p.w, h: H - groundHeight - bottomY };
      
      return hit(birdBox, topPipe) || hit(birdBox, bottomPipe);
    }

    function drawSky() {
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, '#79cdf4');
      gradient.addColorStop(.55, '#9fdef7');
      gradient.addColorStop(1, '#c9f0ff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    }

    function drawCloud(c) {
      const { x, y, w, h } = c;
      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(80,160,190,.12)';
      ctx.shadowBlur = 5; ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.moveTo(x + w * .10, y + h * .66);
      ctx.bezierCurveTo(x + w * .02, y + h * .54, x + w * .07, y + h * .30, x + w * .27, y + h * .31);
      ctx.bezierCurveTo(x + w * .30, y + h * .06, x + w * .45, y, x + w * .56, y + h * .10);
      ctx.bezierCurveTo(x + w * .67, y + h * .05, x + w * .78, y + h * .17, x + w * .78, y + h * .34);
      ctx.bezierCurveTo(x + w * .96, y + h * .30, x + w, y + h * .48, x + w * .94, y + h * .63);
      ctx.bezierCurveTo(x + w * .91, y + h * .75, x + w * .76, y + h * .76, x + w * .62, y + h * .76);
      ctx.lineTo(x + w * .22, y + h * .76);
      ctx.bezierCurveTo(x + w * .12, y + h * .76, x + w * .07, y + h * .72, x + w * .10, y + h * .66);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawPipe(p) {
      const { x, w, top, gap } = p;
      const bottomY = top + gap;
      
      ctx.fillStyle = 'rgba(0,0,0,.12)';
      ctx.fillRect(x + 2, 0, w, top);
      ctx.fillRect(x + 2, bottomY, w, H - groundHeight - bottomY);
      
      const gradient = ctx.createLinearGradient(x, 0, x + w, 0);
      gradient.addColorStop(0, '#2f9e55');
      gradient.addColorStop(.45, '#64c96d');
      gradient.addColorStop(1, '#247b46');
      ctx.fillStyle = gradient;
      
      ctx.fillRect(x, 0, w, top);
      ctx.fillRect(x, bottomY, w, H - groundHeight - bottomY);
      
      ctx.fillStyle = '#3da95a';
      ctx.fillRect(x - 4, top - 10, w + 8, 10);
      ctx.fillRect(x - 4, bottomY, w + 8, 10);
      
      ctx.fillStyle = 'rgba(255,255,255,.2)';
      ctx.fillRect(x + 5, 0, 4, Math.max(0, top - 4));
      ctx.fillRect(x + 5, bottomY + 10, 4, Math.max(0, H - groundHeight - bottomY - 10));
    }

    function drawBird() {
      ctx.save();
      ctx.translate(bird.x + bird.w / 2, bird.y + bird.h / 2);
      ctx.rotate(bird.rotation);
      
      // Ekor
      ctx.fillStyle = '#e7a72f';
      ctx.beginPath();
      ctx.moveTo(-14, -2); ctx.lineTo(-23, -8); ctx.lineTo(-19, 3);
      ctx.lineTo(-24, 8); ctx.lineTo(-13, 6);
      ctx.fill();
      
      // Badan
      ctx.fillStyle = '#ffd447';
      ctx.beginPath();
      ctx.ellipse(0, 1, 15, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Perut
      ctx.fillStyle = '#ffe99b';
      ctx.beginPath();
      ctx.ellipse(3, 5, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Sayap
      const wingY = Math.sin(bird.wing) * 4;
      ctx.fillStyle = '#eab02e';
      ctx.beginPath();
      ctx.ellipse(-2, 5 + wingY * .25, 9, 5, -.25, 0, Math.PI * 2);
      ctx.fill();
      
      // Mata & Pupil
      ctx.fillStyle = '#ffd447'; ctx.beginPath(); ctx.arc(9, -5, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(13, -8, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#252525'; ctx.beginPath(); ctx.arc(14, -8, 2, 0, Math.PI * 2); ctx.fill();
      
      // Paruh
      ctx.fillStyle = '#f08a24';
      ctx.beginPath();
      ctx.moveTo(17, -3); ctx.lineTo(28, 1); ctx.lineTo(17, 5); ctx.closePath(); ctx.fill();
      
      ctx.strokeStyle = '#c96a1a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(18, 1); ctx.lineTo(27, 1); ctx.stroke();
      
      ctx.restore();
    }

    function drawGround() {
      const gy = H - groundHeight;
      ctx.fillStyle = '#7fcf57'; ctx.fillRect(0, gy, W, 5);
      ctx.fillStyle = '#d6b45c'; ctx.fillRect(0, gy + 5, W, groundHeight - 5);
      
      const offset = -(frame * speed) % 24;
      for (let x = offset; x < W; x += 24) {
        ctx.fillStyle = '#b99346';
        ctx.fillRect(x, gy + 10, 13, 2);
        ctx.fillRect(x + 8, gy + 17, 8, 2);
      }
    }

    function drawParticles() {
      particles.forEach(p => {
        ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, p.life) + ')';
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    }

    function draw() {
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      drawSky();
      clouds.forEach(drawCloud);
      pipes.forEach(drawPipe);
      drawGround();
      drawBird();
      drawParticles();
    }

    function finish() {
      if (gameOver) return;
      gameOver = true; running = false;
      playGameOverSound();
      
      if (Math.floor(score) > best) {
        best = Math.floor(score);
        try { localStorage.setItem('flappy_bird_best', String(best)); } catch(e) {}
      }
      
      finalEl.textContent = String(Math.floor(score));
      overEl.classList.add('show');
      updateUI();
    }

    function update(dt) {
      if (gameOver) return;
      frame++;
      bird.wing += dt * .35;
      bird.vy += .42 * dt;
      bird.y += bird.vy * dt;
      bird.rotation = Math.max(-.45, Math.min(1.15, bird.vy * .055));
      
      if (bird.y < 0) { bird.y = 0; bird.vy = 0; }
      if (bird.y + bird.h >= H - groundHeight) { bird.y = H - groundHeight - bird.h; finish(); return; }
      
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        createPipe();
        spawnTimer = 72 + Math.random() * 22;
      }
      
      pipes.forEach(p => {
        p.x -= speed * dt;
        if (!p.passed && p.x + p.w < bird.x) {
          p.passed = true;
          score++;
          playScoreSound();
          createParticles(bird.x, bird.y, 8);
        }
        if (pipeCollision(p)) finish();
      });
      
      pipes = pipes.filter(p => p.x > -55);
      
      clouds.forEach(c => {
        c.x -= c.speed * dt;
        if (c.x + c.w < -20) {
          c.w = 42 + Math.random() * 38;
          c.h = c.w * .42;
          c.x = W + 20 + Math.random() * 90;
          c.y = 18 + Math.random() * 65;
          c.speed = .12 + Math.random() * .13;
          c.alpha = .72 + Math.random() * .16;
        }
      });
      
      particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= .045 * dt; });
      particles = particles.filter(p => p.life > 0);
      
      speed += .0008 * dt;
      if (speed > 4.4) speed = 4.4;
      updateUI();
    }

    function loop(t) {
      if (!running) return;
      if (!last) last = t;
      const dt = Math.min((t - last) / 16.67, 2);
      last = t;
      update(dt);
      draw();
      if (running) requestAnimationFrame(loop);
    }

    canvas.addEventListener('pointerdown', e => { e.preventDefault(); flap(); });
    startEl.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); reset(); playFlapSound(); });
    restartEl.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); reset(); playFlapSound(); });
    
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); }
    });

    window.addEventListener('resize', resize);
    resize();
  })();
</script>
  `;

  try {
    await conn.relayMessage(
      m.chat,
      {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
          botMetadata: {
            messageDisclaimerText: "",
            botResponseId: responseId
          }
        },
        botForwardedMessage: {
          message: {
            richResponseMessage: {
              messageType: 1,
              submessages: [
                {
                  messageType: 2,
                  messageText: "Flappy Bird"
                }
              ],
              unifiedResponse: {
                data: Buffer.from(
                  JSON.stringify({
                    response_id: responseId,
                    sections: [
                      {
                        view_model: {
                          primitive: {
                            __typename: "GenAIaeacdsnwHtmlPrimitive",
                            payload: html,
                            trusted_sources: []
                          },
                          __typename: "GenAISingleLayoutViewModel"
                        }
                      }
                    ]
                  })
                ).toString('base64')
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
      {
        messageId: responseId
      }
    );
  } catch (err) {
    console.error(err);
    await m.reply('❌ Gagal mengirim game.');
  }
};

handler.help = ['flappy'];
handler.tags = ['game'];
handler.command = /^(flappy|flappybird)$/i;
handler.limit = false;

export default handler;