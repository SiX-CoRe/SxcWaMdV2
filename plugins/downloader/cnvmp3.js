import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.youtube.com/watch?v=xxxx [mp3/mp4] [quality]*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let args = text.trim().split(' ')
        let targetUrl = args[0]
        let format = (args[1] || 'mp3').toLowerCase()
        let quality = args[2] || (format === 'mp4' ? '720' : '128')
        
        let apiUrl = `${global.web}/api/downloader/cnvmp3?apikey=${apiKey}&url=${encodeURIComponent(targetUrl)}&format=${encodeURIComponent(format)}&quality=${encodeURIComponent(quality)}`
        let res = await fetch(apiUrl)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || json.message || 'Gagal memproses konversi media CNV')
        
        let resData = json.result
        let downloadUrl = resData.download_url || resData.download || resData.url
        if (!downloadUrl) throw new Error('Link unduhan media tidak ditemukan')
        
        let title = resData.title || 'Converted Media'
        let caption = `🎵 *${global.botname || 'BOT'} - CNV MEDIA DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `📦 *Format:* ${format.toUpperCase()}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        if (format === 'mp4' || downloadUrl.includes('.mp4')) {
            await conn.sendMessage(m.chat, {
                video: { url: downloadUrl },
                caption: caption,
                fileName: `${title.slice(0, 30) || 'video'}.mp4`
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${title.slice(0, 30) || 'audio'}.mp3`
            }, { quoted: m })
        }
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['cnvmp3 <url> [format] [quality]']
handler.tags = ['downloader']
handler.command = /^(cnvmp3|cnvmp4)$/i

handler.limit = true

export default handler
