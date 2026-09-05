import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.youtube.com/watch?v=xxxx [mp4/mp3]*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let args = text.trim().split(' ')
        let targetUrl = args[0]
        let format = (args[1] || 'mp4').toLowerCase()
        
        let apiUrl = `${global.web}/api/downloader/ytmp4is?apikey=${apiKey}&url=${encodeURIComponent(targetUrl)}&format=${encodeURIComponent(format)}`
        let res = await fetch(apiUrl)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses unduhan YouTube IS')
        
        let resData = json.result
        let downloadUrl = resData.download || resData.download_url || resData.url
        if (!downloadUrl) throw new Error('Link download YouTube tidak ditemukan')
        
        let title = resData.title || 'YouTube Media'
        let caption = `🎬 *${global.botname || 'BOT'} - YTMP4IS DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `📺 *Kualitas:* ${resData.quality || '-'}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        if (resData.type === 'mp4' || format === 'mp4') {
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
handler.help = ['ytmp4is <url> [format]']
handler.tags = ['downloader']
handler.command = /^(ytmp4is|ytvis)$/i

handler.limit = true

export default handler
