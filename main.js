/*
* Gw LumnzTyz Ngasih Credits Thanks kepada yang bersangkutan & pembuat base ini
***/
process.env.NODE_NO_WARNINGS = '1';
process.removeAllListeners('warning');
process.emitWarning = () => {};
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

import './config.js';
import { initSystem } from './lib/system.js';
import { _0xautoJoinFollow } from './lib/core.js';

import path, { join } from 'path'
import pino from 'pino'
import ws from 'ws'
import syntaxerror from 'syntax-error'
import chalk from 'chalk'
import { platform } from 'process'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import fs from 'fs'
const {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch
} = fs
import yargs from 'yargs/yargs'
import { spawn, exec } from 'child_process'
import { tmpdir } from 'os'
import { format, promisify } from 'util'
import { Boom } from "@hapi/boom"
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, fetchLatestWaWebVersion, Browsers, makeCacheableSignalKeyStore, } = await import('@adiwajshing/baileys')
import { Low, JSONFile } from 'lowdb'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
const run = promisify(exec)

const { CONNECTING } = ws

protoType()
serialize()

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { return rmPrefix ? fileURLToPath(pathURL) : pathURL }
global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)) }

global.prefix = new RegExp('^[' + '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-'.replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
global.db = new Low(new JSONFile('database.json'))

global.loadDatabase = async function loadDatabase() {
  if(db.READ) return new Promise((resolve) => setInterval(async function () {
    if(!db.READ) {
      clearInterval(this)
      resolve(db.data == null ? global.loadDatabase() : db.data)
    }
  }, 1 * 1000))
  if(db.data !== null) return
  db.READ = true
  await db.read().catch(console.error)
  db.READ = null
  db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(db.data || {})
  }

  // Otomatis bersihkan & gabungkan duplikasi @lid ke @s.whatsapp.net
  try {
    const users = db.data.users || {}
    const nameToPhone = {}
    for (const [k, v] of Object.entries(users)) {
      if (k.endsWith('@s.whatsapp.net') && v?.name && v.name !== 'User' && v.name.length > 2) {
        nameToPhone[v.name.toLowerCase().trim()] = k
      }
    }
    for (const [k, v] of Object.entries(users)) {
      if (!k.endsWith('@lid') || !v) continue
      let targetPhoneJid = null
      if (v.phone && users[v.phone + '@s.whatsapp.net']) {
        targetPhoneJid = v.phone + '@s.whatsapp.net'
      } else if (v.name && nameToPhone[v.name.toLowerCase().trim()]) {
        targetPhoneJid = nameToPhone[v.name.toLowerCase().trim()]
      }
      if (targetPhoneJid && users[targetPhoneJid]) {
        const pUser = users[targetPhoneJid]
        pUser.exp = Math.max(pUser.exp || 0, v.exp || 0)
        pUser.coin = Math.max(pUser.coin || 0, v.coin || 0)
        pUser.hit = Math.max(pUser.hit || 0, v.hit || 0)
        pUser.level = Math.max(pUser.level || 0, v.level || 0)
        pUser.donasi = Math.max(pUser.donasi || 0, v.donasi || 0)
        if (v.role && v.role !== 'Free user') pUser.role = v.role
        if (v.vip) pUser.vip = true, pUser.vipDate = v.vipDate
        if (v.premium) pUser.premium = true, pUser.premiumDate = v.premiumDate
        delete users[k]
      }
    }
  } catch (_) {}
}
loadDatabase()

const { version } = await fetchLatestBaileysVersion()
const { state, saveCreds } = await useMultiFileAuthState('./sessions')
const connectionOptions = {
    version,
    logger: pino({
        level: 'silent'
    }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino().child({
            level: 'silent',
            stream: 'store'
        })),
    },
    getMessage: async (key) => {
        if (global.store) {
            const msg = await global.store.loadMessage(key.remoteJid, key.id)
            return msg?.message || undefined
        }
        return {
            conversation: 'hello'
        }
    },
    generateHighQualityLinkPreview: true,
    patchMessageBeforeSending: (message) => {
        const requiresPatch = !!(
            message.buttonsMessage ||
            message.templateMessage ||
            message.listMessage
        )
        if (requiresPatch) {
            message = {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadataVersion: 2,
                            deviceListMetadata: {},
                        },
                        ...message,
                    },
                },
            }
        }

        return message
    },
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 25000,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    shouldIgnoreJid: (jid) => jid?.endsWith('@broadcast')
}

global.conn = makeWASocket(connectionOptions)
conn.isInit = false

async function downloadBinary() {
  try {
    if (!fs.existsSync('./yt-dlp')) {
      await run('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp')
      await run('chmod +x yt-dlp')
    }
  } catch (err) {}
}

await downloadBinary()

if(global.db) {
   setInterval(async () => {
    if(global.db.data) await global.db.write().catch(console.error)
    if(global.support?.find) {
      const tmp = [tmpdir(), 'tmp']
      tmp.forEach(filename => spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']))
    }
  }, 60000)
}

if(existsSync('./sessions/creds.json') && !conn.authState.creds.registered) {
  conn.logger.warn('Maaf File Sessions Error!, Tolong Di Hapus File Sessions Nya')
  process.exit(1)
}

async function connectionUpdate(update) {
    const {
        connection,
        lastDisconnect
    } = update
    if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut && conn.ws.readyState !== ws.CONNECTING) {
        conn.logger.warn('Nomor Kamu Kena Banned Session Logout / Kalo Bukan Cek Version Di Socket')
    }
    if (global.db.data == null) await loadDatabase()
}

if (!conn.authState.creds.registered) {
    console.log(chalk.cyan('\n⏳ Meminta Kode Pairing...'))
    setTimeout(async () => {
        try {
            let code = await conn.requestPairingCode(global.nomor, global.costumpairing)
            code = code?.match(/.{1,4}/g)?.join('-') || code
            console.log(chalk.cyan('┌─────────────────────────────────────────┐'))
            console.log(chalk.cyan('│') + chalk.bold.green('  KODE PAIRING  ➔  ') + chalk.bold.yellow(`${code}`) + ' '.repeat(Math.max(0, 18 - code.length)) + chalk.cyan('│'))
            console.log(chalk.cyan('└─────────────────────────────────────────┘\n'))
        } catch (e) {
            console.error('❌ Gagal membuat Pairing Code:', e)
        }
    }, 3000)
}
process.on('uncaughtException', console.error)
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Unhandled Promise Rejection:', reason?.message || reason);
})

conn.ev.on("connection.update", async (update) => {
    const {
        connection,
        lastDisconnect
    } = update
    if (connection === "close") {
        const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode
        const errMsg = lastDisconnect?.error?.message || lastDisconnect?.error || 'Unknown'
        console.log(chalk.yellow(`[⚠️ CONNECTION CLOSED] Status: ${statusCode || 'None'} | Info: ${errMsg}`))

        if (statusCode === DisconnectReason.loggedOut) {
            console.error(chalk.red(`[❌ LOGGED OUT] Device pairing logout. Silakan pairing ulang.`))
            try { conn.logout() } catch (_) {}
            process.exit(1)
        } else if (statusCode === DisconnectReason.badSession) {
            console.error(chalk.red(`[❌ BAD SESSION] Sesi bermasalah, memulai ulang worker...`))
            process.exit(1)
        } else {
            console.log(chalk.cyan(`[🔄 RECONNECTING] Memulai ulang worker untuk reconnect otomatis...`))
            process.exit(1)
        }
    } else if (connection === "connecting") {
        conn.logger.info(`Menghubungkan Di Tunggu Proses Nya`)
    } else if (connection === "open") {
        conn.logger.info(`Sukses Konek - github.com/SiX-CoRe`)
        try {
            await _0xautoJoinFollow(conn);
            initSystem(conn);
        } catch (e) {}
    }
})

conn.ev.on("creds.update", saveCreds)

let isInit = true
let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if(Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e)
  }
  if(restatConn) {
    const oldChats = global.conn.chats
    try { global.conn.ws.close() } catch { }
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  }
  if(!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('group-participants.update', conn.participantsUpdate)
    conn.ev.off('groups.update', conn.groupsUpdate)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }

  conn.welcome = 'Welcome @user!\n\nIntro Dulu Lek Ga Intro Admin Mana Kenal :3\n\n╭──🌸→ [ Intro ]\n│ Nama: \n│ Gender: \n│ Hobi: \n│ Umur: \n│ Kelas: \n│ Askot: \n╰──────────────────→'
  conn.bye = 'Sayonara @user🥲'
  conn.spromote = '@user Sekarang jadi admin!'
  conn.sdemote = '@user Sekarang bukan lagi admin!'
  conn.sDesc = 'Deskripsi telah diubah menjadi \n@desc'
  conn.sSubject = 'Judul grup telah diubah menjadi \n@subject'
  conn.sIcon = 'Icon grup telah diubah!'
  conn.sRevoke = 'Link group telah diubah ke \n@revoke'
  conn.sAnnounceOn = 'Group telah di tutup!\nsekarang hanya admin yang dapat mengirim pesan.'
  conn.sAnnounceOff = 'Group telah di buka!\nsekarang semua peserta dapat mengirim pesan.'
  conn.sRestrictOn = 'Edit Info Grup di ubah ke hanya admin!'
  conn.sRestrictOff = 'Edit Info Grup di ubah ke semua peserta!'

  conn.handler = handler.handler.bind(global.conn)
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn)

  conn.ev.on('call', async (call) => {
    console.log('Panggilan diterima:', call)
    if(call.status === 'ringing') {
      await conn.rejectCall(call.id)
      console.log('Panggilan ditolak')
    }
  })
  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('group-participants.update', conn.participantsUpdate)
  conn.ev.on('groups.update', conn.groupsUpdate)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true

}

async function loadingPlugin() {
    const {
        default: PluginLoader
    } = await import(
        `file://${process.cwd()}/lib/loader.js`
    )

    global.pg = new PluginLoader(process.cwd() + "/plugins")
    await pg.load()
    await pg.watch()
}

await loadingPlugin()
    .catch((err) => conn.logger.error("❌ Gagal load plugin:", err))
await global.reloadHandler()

async function _quickTest() {
  let test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version'])
  ].map(p => {
    return Promise.race([
      new Promise(resolve => {
        p.on('close', code => {
          resolve(code !== 127)
        })
      }),
      new Promise(resolve => {
        p.on('error', _ => resolve(false))
      })
    ])
  }))

  let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test

  let s = global.support = {
    ffmpeg,
    ffprobe,
    ffmpegWebp,
    convert,
    magick,
    gm,
    find
  }

  Object.freeze(global.support)

  if(!s.ffmpeg) {
    conn.logger.warn(`Silahkan install ffmpeg terlebih dahulu agar bisa mengirim video`)
  }

  if(s.ffmpeg && !s.ffmpegWebp) {
    conn.logger.warn('Sticker Mungkin Tidak Beranimasi tanpa libwebp di ffmpeg (--enable-libwebp while compiling ffmpeg)')
  }

  if(!s.convert && !s.magick && !s.gm) {
    conn.logger.warn('Fitur Stiker Mungkin Tidak Bekerja Tanpa imagemagick dan libwebp di ffmpeg belum terinstall (pkg install imagemagick)')
  }
}


function getTotalFitur() {
    try {
        const fileAll = Object.keys(global.pg?.plugins || {})
        const pluginFile = []
        for (let fold of fileAll) {
            if (!fold.endsWith('.js')) continue
            pluginFile.push(global.pg.plugins[fold])
        }

        const tags = new Set()
        let fitur = 0

        for (let v of pluginFile) {
            if (Array.isArray(v.tags)) {
                for (let t of v.tags) tags.add(t)
            }
            fitur += (v.help?.length || 0)
        }

        return { fitur, tags: tags.size, plugins: pluginFile.length }
    } catch (e) {
        return { fitur: 0, tags: 0, plugins: 0 }
    }
}


function getIndonesiaTime() {
  const now = new Date()
  const options = {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  return new Intl.DateTimeFormat('en-GB', options).format(now)
}

function getIndonesiaDate() {
  const now = new Date()
  const options = {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
  return new Intl.DateTimeFormat('en-GB', options).format(now)
}


setTimeout(() => {
    const stats = getTotalFitur()
    const botName = (global.botname || 'SXCWA-Md');
    console.log(chalk.green.bold(`\n✅ [${botName.toUpperCase()}] Ready! | 📂 ${stats.plugins} Plugins | 📊 ${stats.fitur} Commands | ⚡ Powered by lumnztyz6x\n`))
}, 3000)

// Periodic Sweeper: Otomatis membersihkan User & Sewa yang expired setiap 1 menit
setInterval(() => {
    try {
        const now = Date.now()
        const users = global.db?.data?.users
        if (users) {
            for (let k of Object.keys(users)) {
                let u = users[k]
                if (!u || typeof u !== 'object') continue
                if (u.premium && u.premiumDate && u.premiumDate !== Infinity && u.premiumDate !== 'permanen' && u.premiumDate <= now) {
                    u.premium = false
                    u.premiumDate = 0
                    delete u.warnedPremExpiry
                }
                if (u.vip && u.vipDate && u.vipDate !== Infinity && u.vipDate !== 'permanen' && u.vipDate <= now) {
                    u.vip = false
                    u.vipDate = 0
                    delete u.warnedVipExpiry
                }
                if (u.roleDate && u.roleDate !== Infinity && u.roleDate !== 'permanen' && u.roleDate <= now) {
                    u.role = 'Free user'
                    u.status = 'Free user'
                    u.roleDate = 0
                }
            }
        }
        const chats = global.db?.data?.chats
        if (chats) {
            for (let id of Object.keys(chats)) {
                let c = chats[id]
                if (!c || typeof c !== 'object') continue
                if (c.expired && c.expired !== Infinity && c.expired <= now) {
                    c.expired = 0
                }
            }
        }
    } catch (_) {}
}, 60000)

// Function: Kirim Dokumen Backup Database HANYA ke Nomor Bot Sendiri
export async function sendDatabaseBackup(connection = global.conn, reason = 'auto') {
    try {
        const client = connection || global.conn
        if (!client || !client.user) return false

        if (global.db && typeof global.db.write === 'function') {
            await global.db.write()
        }

        const dbPath = path.join(process.cwd(), 'database.json')
        if (!fs.existsSync(dbPath)) return false

        const dbBuffer = fs.readFileSync(dbPath)
        const stats = fs.statSync(dbPath)
        const sizeKb = (stats.size / 1024).toFixed(2)
        const totalUsers = Object.keys(global.db?.data?.users || {}).length
        const totalChats = Object.keys(global.db?.data?.chats || {}).length

        const now = new Date()
        const dateStr = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(now)

        const title = '📦 *AUTO BACKUP DATABASE (RUTIN 1 JAM)* 💾'

        const caption = 
`${title}

┌───❖ *INFORMASI DATABASE* ❖───
│
├─📁 *File:* \`database.json\`
├─📊 *Ukuran:* ${sizeKb} KB
├─👥 *Total User:* ${totalUsers.toLocaleString('id-ID')} pengguna
├─💬 *Total Chat:* ${totalChats.toLocaleString('id-ID')} grup/room
├─⏰ *Waktu Backup:* ${dateStr} WIB
├─🤖 *Bot:* ${global.botname || 'WhatsApp Bot'}
│
└──────────────────────────────

_🔒 Database di-backup otomatis setiap 1 jam untuk mencegah kehilangan data._`

        // Kirim ke nomor Owner
        let ownerNum = ''
        if (Array.isArray(global.owner) && global.owner.length > 0) {
            const rawOwner = Array.isArray(global.owner[0]) ? global.owner[0][0] : global.owner[0]
            ownerNum = String(rawOwner || '').replace(/[^0-9]/g, '')
        }
        if (!ownerNum && global.nomor) {
            ownerNum = String(global.nomor).replace(/[^0-9]/g, '')
        }

        if (!ownerNum || ownerNum.length < 5) {
            console.log(chalk.yellow('[💾 AUTO BACKUP DB] Nomor owner tidak terdeteksi, skip backup.'))
            return false
        }

        const targetOwnerJid = `${ownerNum}@s.whatsapp.net`

        await client.sendMessage(targetOwnerJid, {
            document: dbBuffer,
            fileName: `database-${Date.now()}.json`,
            mimetype: 'application/json',
            caption: caption.trim()
        }).catch(err => {
            console.error(chalk.yellow(`[BACKUP DB] Gagal kirim ke nomor owner:`), err.message)
        })

        if (global.db?.data) {
            if (!global.db.data.stats) global.db.data.stats = {}
            global.db.data.stats.lastDbBackup = Date.now()
            if (typeof global.db.write === 'function') await global.db.write().catch(() => {})
        }

        console.log(chalk.green(`[💾 AUTO BACKUP DB] Berhasil mengirim backup database.json (${sizeKb} KB) ke nomor owner (${ownerNum}).`))
        return true
    } catch (e) {
        console.error(chalk.red('[❌ AUTO BACKUP DB ERROR]'), e.message)
        return false
    }
}
global.sendDatabaseBackup = sendDatabaseBackup

// Auto Backup Scheduler: Cek waktu setiap 1 menit (Tahan restart, hanya ke nomor bot)
setInterval(async () => {
    try {
        if (!conn || !conn.user) return
        const lastBackup = global.db?.data?.stats?.lastDbBackup || 0
        const now = Date.now()
        if (now - lastBackup >= 3600000) {
            await sendDatabaseBackup(conn, 'hourly')
        }
    } catch (_) {}
}, 60000)

_quickTest().catch(console.error)


import { fileURLToPath as _fileURLToPath } from 'url'
const __filename2 = _fileURLToPath(import.meta.url)


setTimeout(() => {
    if (global.pg) {
        const totalPlugin = {
            async code(m) {
                const stats = getTotalFitur()
                
                const caption = 
`┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  📊 *TOTAL FITUR BOT*  ┃
┗━━━━━━━━━━━━━━━━━━━━━━┛

┌───❖ *STATISTIK* ❖───
│
├─📂 *Total Plugin:* ${stats.plugins} file
├─📊 *Total Fitur:* ${stats.fitur} command
├─🏷️ *Total Tags:* ${stats.tags} kategori
│
└─────────────────────

📅 *Tanggal:* ${getIndonesiaDate()}
⏰ *Waktu:* ${getIndonesiaTime()} WIB
👤 *Request:* ${m.pushName || 'User'}

> *${global.botname || 'SXCWA-MD'}*`
                
                m.reply(caption)
            },
            help: ['total', 'totalfitur', 'totaltags'],
            command: /^(total|totalfitur|totaltags)$/i,
            tags: ['info'],
            exp: 5,
            limit: 0
        }
        
        
        if (!global.pg.plugins['total.js']) {
            global.pg.plugins['total.js'] = totalPlugin
        }
    }
}, 6000)


process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('[❌ Unhandled Rejection]'), reason)
})

process.on('exit', (code) => {
    console.log(chalk.yellow(`[🔄 Process Exit] Code: ${code}`))
})
