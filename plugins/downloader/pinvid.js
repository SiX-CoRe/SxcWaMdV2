import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://pin.it/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/pinvid?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses video Pinterest')
        
        let videoUrl = json.result.video_url || json.result.url || json.result.download_url || (typeof json.result === 'string' ? json.result : null)
        if (!videoUrl) throw new Error('Link video Pinterest tidak ditemukan')
        
        let caption = `📌 *${global.botname || 'BOT'} - PINTEREST VIDEO DOWNLOADER*` + '\n\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `pinvid_${Date.now()}.mp4`
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['pinvid <url>', 'pinvideosearch <url>']
handler.tags = ['downloader']
handler.command = /^(pinvid|pinvideosearch)$/i

handler.limit = true

export default handler
