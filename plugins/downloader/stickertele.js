import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://t.me/addstickers/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/stickertele?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.data) throw new Error(json.error || 'Gagal mengambil sticker Telegram')
        
        let data = json.data
        let stickers = data.stickers || []
        if (!stickers.length) throw new Error('Tidak ada stiker ditemukan dalam pack ini')
        
        await m.reply(`🏷️ *${global.botname || 'BOT'} - TELEGRAM STICKER DOWNLOADER*\n\n📦 Menemukan *${stickers.length}* stiker dari pack *${data.title || 'Telegram'}* (${data.type || 'Biasa'}). Mengirim 5 stiker pertama...`)
        
        for (let i = 0; i < Math.min(stickers.length, 5); i++) {
            let stUrl = stickers[i].url || stickers[i]
            if (!stUrl) continue
            await conn.sendMessage(m.chat, {
                image: { url: stUrl },
                caption: `🏷️ *Sticker ${i + 1}/${stickers.length}* ${stickers[i].emoji || ''}`
            }, { quoted: m }).catch(() => {})
        }
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['stickertele <url>', 'telesticker <url>']
handler.tags = ['downloader']
handler.command = /^(stickertele|telesticker|tgsticker)$/i

handler.limit = true

export default handler
