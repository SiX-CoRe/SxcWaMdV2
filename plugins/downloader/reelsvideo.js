import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.instagram.com/reel/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/reelsvideo?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses video Instagram Reels')
        
        let videoUrl = json.result.download_url || json.result.video_url || json.result.url || json.result
        if (typeof videoUrl === 'object') videoUrl = videoUrl.url || videoUrl.download_url
        if (!videoUrl) throw new Error('Link video Reels tidak ditemukan')
        
        let caption = `🎬 *${global.botname || 'BOT'} - INSTAGRAM REELS DOWNLOADER*` + '\n\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `reels_${Date.now()}.mp4`
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['reelsvideo <url>', 'reelsdl <url>']
handler.tags = ['downloader']
handler.command = /^(reelsvideo|reelsdl)$/i

handler.limit = true

export default handler
