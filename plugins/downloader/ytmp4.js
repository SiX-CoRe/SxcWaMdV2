import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.youtube.com/watch?v=xxxx [quality]*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let args = text.trim().split(' ')
        let targetUrl = args[0]
        let quality = args[1] || "720"
        
        let apiUrl = `${global.web}/api/downloader/ytmp4?apikey=${apiKey}&url=${encodeURIComponent(targetUrl)}&quality=${encodeURIComponent(quality)}`
        let res = await fetch(apiUrl)
        let json = await res.json()
        
        if (!json.status) throw new Error(json.error || 'Gagal mengunduh video YouTube')
        
        let videoUrl = json.downloadUrl || json.url || json.result?.downloadUrl || json.result?.url
        if (!videoUrl) throw new Error('Link video YouTube tidak ditemukan')
        
        let title = json.title || json.result?.title || 'YouTube Video'
        let caption = `🎬 *${global.botname || 'BOT'} - YOUTUBE MP4 DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `📺 *Kualitas:* ${quality}p` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `${title.slice(0, 30) || 'video'}.mp4`
        }, { quoted: m }).catch(async () => {
            await conn.sendMessage(m.chat, {
                document: { url: videoUrl },
                fileName: `${title.slice(0, 30) || 'video'}.mp4`,
                mimetype: 'video/mp4',
                caption: caption
            }, { quoted: m })
        })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['ytmp4 <url> [quality]', 'ytv <url>']
handler.tags = ['downloader']
handler.command = /^(ytmp4|ytv|ytmp4api)$/i

handler.limit = true

export default handler
