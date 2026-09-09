let handler = async (m, { conn }) => {
  const html = `
<style>
*{
  -webkit-tap-highlight-color:transparent;
  -webkit-user-select:none;
  user-select:none;
  -webkit-touch-callout:none
}

body{
  margin:0;
  background:#0a0a0f;
  font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color:#eee;
  touch-action:manipulation;
}

.wrap{
  width:100%;
  max-width:620px;
  margin:auto;
  padding:10px;
  box-sizing:border-box
}

.box{
  background:#12131c;
  border:1px solid #222536;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 12px 40px rgba(0,0,0,.9)
}

.head{
  padding:12px 16px;
  border-bottom:1px solid #222536;
  display:flex;
  justify-content:space-between;
  align-items:center;
  background:#181a26;
}

.title-group{
  display:flex;
  flex-direction:column;
}

.title{
  font-size:16px;
  font-weight:900;
  letter-spacing:1.5px;
  color:#f1c40f;
  text-transform:uppercase;
  text-shadow:0 0 10px rgba(241, 196, 15, 0.5);
}

.subtitle{
  font-size:8px;
  color:#e67e22;
  letter-spacing:1px;
  font-weight:bold;
}

.right-head{
  display:flex;
  align-items:center;
  gap:10px;
}

.sound-btn{
  background:#222536;
  border:1px solid #f1c40f;
  border-radius:8px;
  padding:4px 8px;
  font-size:12px;
  cursor:pointer;
  user-select:none;
}

.scorebox{
  display:flex;
  gap:10px;
  text-align:center;
}

.score-item{
  display:flex;
  flex-direction:column;
}

.score-label{
  font-size:8px;
  color:#a4b0be;
  font-weight:bold;
}

.score-val{
  font-size:13px;
  font-weight:bold;
  color:#2ecc71;
}

.content{
  padding:14px;
  background:#0c0d14;
}

.grid-container{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:8px;
  background:#050508;
  padding:10px;
  border-radius:12px;
  border:2px solid #222536;
  box-shadow:inset 0 0 15px rgba(0,0,0,0.8);
}

.slot-box{
  background:#181a26;
  border:2px solid #34495e;
  border-radius:10px;
  height:75px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:36px;
  box-shadow:0 4px 8px rgba(0,0,0,0.5);
  transition:border-color 0.2s, transform 0.1s;
}

.slot-box.win{
  border-color:#f1c40f;
  background:#2c3e50;
  animation:bounce 0.4s infinite alternate;
}

@keyframes bounce{
  from{ transform:scale(1); }
  to{ transform:scale(1.05); }
}

.bet-controls{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-top:14px;
  background:#181a26;
  padding:8px 12px;
  border-radius:10px;
  border:1px solid #222536;
}

.bet-label{
  font-size:11px;
  font-weight:bold;
  color:#a4b0be;
}

.bet-btn-group{
  display:flex;
  gap:6px;
}

.btn-bet{
  background:#222536;
  border:1px solid #34495e;
  border-radius:6px;
  color:#fff;
  padding:6px 10px;
  font-size:11px;
  font-weight:bold;
  cursor:pointer;
}

.btn-bet:active{
  background:#f1c40f;
  color:#000;
}

.btn-spin{
  width:100%;
  margin-top:12px;
  padding:14px;
  background:linear-gradient(180deg, #f1c40f, #e67e22);
  border:1px solid #f39c12;
  border-radius:10px;
  color:#000;
  font-size:16px;
  font-weight:900;
  letter-spacing:1px;
  cursor:pointer;
  box-shadow:0 4px 15px rgba(241, 196, 15, 0.3);
  transition:all 0.1s;
}

.btn-spin:active{
  transform:scale(0.98);
  background:#e67e22;
}

#status{
  text-align:center;
  margin-top:10px;
  font-size:11px;
  color:#a4b0be;
  font-weight:bold;
}
</style>

<body>

<div class="wrap">
  <div class="box">

    <div class="head">
      <div class="title-group">
        <div class="title">FRUIT SLOT 🎰</div>
        <div class="subtitle">CASINO MINI • 3X3 GRID</div>
      </div>

      <div class="right-head">
        <div class="scorebox">
          <div class="score-item">
            <div class="score-label">SALDO</div>
            <div class="score-val" id="balance">$10,000</div>
          </div>
        </div>
        <div class="sound-btn" id="btnSound">🔊</div>
      </div>
    </div>

    <div class="content">
      <div class="grid-container">
        <div class="slot-box" id="b0">🍒</div>
        <div class="slot-box" id="b1">🍋</div>
        <div class="slot-box" id="b2">🍉</div>
        <div class="slot-box" id="b3">🍇</div>
        <div class="slot-box" id="b4">🔔</div>
        <div class="slot-box" id="b5">🍎</div>
        <div class="slot-box" id="b6">🍓</div>
        <div class="slot-box" id="b7">💎</div>
        <div class="slot-box" id="b8">7️⃣</div>
      </div>

      <div class="bet-controls">
        <div class="bet-label">TARUHAN (BET): <span id="betText" style="color:#f1c40f;">$100</span></div>
        <div class="bet-btn-group">
          <div class="btn-bet" id="btnBetMinus">-50</div>
          <div class="btn-bet" id="btnBetPlus">+50</div>
          <div class="btn-bet" id="btnBetMax">MAX</div>
        </div>
      </div>

      <button class="btn-spin" id="btnSpin">🎰 PUTAR (SPIN)</button>

      <div id="status">Atur jumlah Bet lalu tekan PUTAR!</div>
    </div>

  </div>
</div>

<script>

var FRUITS = ['🍒', '🍋', '🍉', '🍇', '🔔', '🍎', '🍓', '💎', '7️⃣']

var balance = 10000
var bet = 100
var isSpinning = false
var soundOn = true
var audioCtx = null

var balanceEl = document.getElementById('balance')
var betTextEl = document.getElementById('betText')
var statusEl = document.getElementById('status')

var btnBetMinus = document.getElementById('btnBetMinus')
var btnBetPlus = document.getElementById('btnBetPlus')
var btnBetMax = document.getElementById('btnBetMax')
var btnSpin = document.getElementById('btnSpin')
var btnSound = document.getElementById('btnSound')

function getAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function playTone(freq, duration, type, volume) {
  if (!soundOn) return
  try {
    var audio = getAudio()
    var osc = audio.createOscillator()
    var gain = audio.createGain()
    osc.type = type || 'sine'
    osc.frequency.setValueAtTime(freq, audio.currentTime)
    gain.gain.setValueAtTime(0.0001, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(volume || 0.1, audio.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + (duration || 0.1))
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + (duration || 0.1) + 0.05)
  } catch(e){}
}

function spinSound() { playTone(400, 0.05, 'square', 0.05) }
function winSound() { 
  playTone(523, 0.1, 'sine', 0.15)
  setTimeout(function(){ playTone(659, 0.1, 'sine', 0.15) }, 80)
  setTimeout(function(){ playTone(783, 0.2, 'sine', 0.2) }, 160)
}
function jackpotSound() {
  playTone(880, 0.15, 'triangle', 0.2)
  setTimeout(function(){ playTone(1174, 0.3, 'triangle', 0.25) }, 120)
}

function formatMoney(num) {
  return '$' + num.toLocaleString()
}

function updateUI() {
  balanceEl.textContent = formatMoney(balance)
  betTextEl.textContent = formatMoney(bet)
}

function clearWinEffects() {
  for (var i = 0; i < 9; i++) {
    document.getElementById('b' + i).classList.remove('win')
  }
}

function getRandomFruit() {
  return FRUITS[Math.floor(Math.random() * FRUITS.length)]
}

function startSpin() {
  if (isSpinning) return
  if (balance < bet) {
    statusEl.textContent = '❌ Saldo tidak cukup!'
    return
  }

  isSpinning = true
  balance -= bet
  updateUI()
  clearWinEffects()
  statusEl.textContent = 'Memutar slot...'

  var intervals = []
  var results = new Array(9)

  for (var i = 0; i < 9; i++) {
    (function(index) {
      intervals[index] = setInterval(function() {
        var randomIcon = getRandomFruit()
        document.getElementById('b' + index).textContent = randomIcon
        spinSound()
      }, 60)

      setTimeout(function() {
        clearInterval(intervals[index])
        results[index] = getRandomFruit()
        document.getElementById('b' + index).textContent = results[index]

        if (index === 8) {
          isSpinning = false
          checkWin(results)
        }
      }, 600 + index * 120)
    })(i)
  }
}

function checkWin(res) {
  var lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Baris mendatar
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Kolom vertikal
    [0, 4, 8], [2, 4, 6]             // Diagonal
  ]

  var winAmount = 0
  var winningBoxes = {}

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var a = res[line[0]]
    var b = res[line[1]]
    var c = res[line[2]]

    if (a === b && b === c) {
      var multiplier = 5
      if (a === '💎') multiplier = 10
      if (a === '7️⃣') multiplier = 20

      winAmount += bet * multiplier
      winningBoxes[line[0]] = true
      winningBoxes[line[1]] = true
      winningBoxes[line[2]] = true
    }
  }

  if (winAmount > 0) {
    balance += winAmount
    updateUI()

    for (var boxIndex in winningBoxes) {
      document.getElementById('b' + boxIndex).classList.add('win')
    }

    if (winAmount >= bet * 10) {
      jackpotSound()
      statusEl.textContent = '🔥 JACKPOT BANJIR CUSH! MENANG ' + formatMoney(winAmount) + ' 🔥'
    } else {
      winSound()
      statusEl.textContent = '🎉 MENANG ' + formatMoney(winAmount) + '!'
    }
  } else {
    statusEl.textContent = 'Belum beruntung, coba lagi!'
  }
}

btnBetMinus.addEventListener('click', function() {
  if (isSpinning) return
  if (bet > 50) {
    bet -= 50
    updateUI()
  }
})

btnBetPlus.addEventListener('click', function() {
  if (isSpinning) return
  if (bet + 50 <= balance) {
    bet += 50
    updateUI()
  }
})

btnBetMax.addEventListener('click', function() {
  if (isSpinning) return
  bet = Math.max(50, Math.min(balance, 2000))
  updateUI()
})

btnSpin.addEventListener('click', startSpin)

btnSound.addEventListener('click', function() {
  soundOn = !soundOn
  btnSound.textContent = soundOn ? '🔊' : '🔇'
  btnSound.style.borderColor = soundOn ? '#f1c40f' : '#e74c3c'
})

updateUI()

</script>
</body>
`

  await conn.relayMessage(
    m.chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,

        botMetadata: {
          messageDisclaimerText: '',
          botResponseId: crypto.randomUUID()
        }
      },

      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,

            submessages: [
              {
                messageType: 2,
                messageText: 'FRUIT SLOT 🎰'
              }
            ],

            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: crypto.randomUUID(),

                  sections: [
                    {
                      view_model: {
                        primitive: {
                          __typename:
                            'GenAIaeacdsnwHtmlPrimitive',

                          payload: html,

                          trusted_sources: []
                        },

                        __typename:
                          'GenAISingleLayoutViewModel'
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
                botJid: '0@bot'
              },

              forwardOrigin: 4
            }
          }
        }
      }
    },
    {}
  )
}

handler.help = ['slot']
handler.tags = ['game']
handler.command = /^(slot|fruitslot)$/i

export default handler