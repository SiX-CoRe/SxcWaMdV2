import fs from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import moment from 'moment-timezone'

/*============= WAKTU & TANGGAL =============*/
const wibh = moment.tz('Asia/Jakarta').format('HH')
const wibm = moment.tz('Asia/Jakarta').format('mm')
const wibs = moment.tz('Asia/Jakarta').format('ss')
global.wktuwib = `${wibh} H ${wibm} M ${wibs} S`
global.wktugeneral = `${wibh}:${wibm}:${wibs}`

const d = new Date(new Date() + 3600000)
const locale = 'id'
const weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
const week = d.toLocaleDateString(locale, { weekday: 'long' })
const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

/*============= FUNCTIONS =============*/
global.Func = (await import('./lib/function.js')).default

/*============= BOT CONFIGURATION =============*/
global.owner = ["628"]
global.costumpairing = "ABCDEFGH"
global.mods = []
global.prems = []
global.audioUrl = "https://j.top4top.io/m_3648lcp5h0.mp3"
global.readMore = readMore
global.linkch = "https://whatsapp.com/channel/0029Vb7XYjLKgsNyWrRHL10k"
global.tz = "Asia/Jakarta"
global.nomor = "628" // nomor bot
global.botname = 'SXCWA-MD'
global.botName = global.botname
global.ownername = 'lumnztyz6x'
global.saluran = '' // id ch
global.autoBackup = true // Auto backup SC setiap jam 12 malam (00:00 WIB)

/*============= STICKER CONFIG =============*/
global.stickerPack = {
    packname: 'bot wa sxcwamd by',
    author: 'lumnztyz6x',
    web: 'https://whatsapp.com/channel/0029Vb7XYjLKgsNyWrRHL10k'
}

/*============= API & LINKS =============*/
//========================================================================//
// ⚠️ BACA DULU WOY SEBELUM RUNNING! ⚠️
// Biar fitur bot lu jalan semua (kayak AI, Stalker, Maker, dll),
// lu WAJIB punya API Key dari JereAPI.
// 
// CARA DAPETIN API KEY:
// 1. Buka browser lu, pergi ke 👉 https://api.jerexd.my.id
// 2. Kalo belom punya akun, lu daftar (Register) dulu aja cuy.
// 3. Kalo udah, Login ke dalem dashboard.
// 4. Nanti di halaman utama (Dashboard), lu bakal liat "Apikey" lu.
// 5. Copy API Key lu yang panjang itu.
// 6. Paste di bawah sini, ganti tulisan "MASUKAN_API_KEY_KAMU_DISINI".
// 
// Contoh: jereapi: "jerexd_premium_xxxxxxx"
//========================================================================//

global.apikey = {
    jereapi: "" // <- PASTE API KEY LU DI SINI BANG
}
global.web = "https://api.jerexd.my.id"

/*============= MESSAGES =============*/
global.wait = 'waitttt uuyy...'
global.eror = 'Error bwangg'

/*============= CONTEXT INFO =============*/
const baseContext = {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: global.saluran,
        serverMessageId: 103,
        newsletterName: global.botname
    }
}

/*============= MENU REPLY =============*/
global.menu = {
    contextInfo: {
        ...baseContext
    }
}

/*============= CHANNEL REPLY =============*/
global.chnl = {
    contextInfo: {
        ...baseContext
    }
}

/*============= CUSTOM REPLY =============*/
global.replyCostum = async (text) => {
    return {
        text: text
    }
}

/*============= ANTILINK SETTINGS =============*/
global.antilinkSettings = new Map()

/*============= HOT RELOAD =============*/
const file = fileURLToPath(import.meta.url)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright("Update 'config.js'"))
    import(`${file}?update=${Date.now()}`)
})
