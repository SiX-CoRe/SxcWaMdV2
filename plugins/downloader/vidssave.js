import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://...*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/vidssave?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses VidsSave')
        
        let resData = json.result
        let videoUrl = resData.video || resData.download_url || resData.url || (Array.isArray(resData) ? resData[0]?.url : null)
        if (!videoUrl) throw new Error('Link video tidak ditemukan')
        
        let title = resData.title || 'VidsSave Video'
        let caption = `🎬 *${global.botname || 'BOT'} - VIDSSAVE DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `${title.slice(0, 30) || 'video'}.mp4`
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['vidssave <url>', 'vidssavedl <url>']
handler.tags = ['downloader']
handler.command = /^(vidssave|vidssavedl)$/i

handler.limit = true

export default handler
