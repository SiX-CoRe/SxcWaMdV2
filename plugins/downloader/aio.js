import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://...*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/aio?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status) throw new Error(json.error || 'Gagal memproses link AIO')
        
        let title = json.title || json.result?.title || 'AIO Media'
        let medias = json.medias || json.result?.medias || (json.url ? [{ url: json.url }] : [])
        if (!medias.length) throw new Error('Tidak ada media ditemukan')
        
        let first = medias[0]
        let mediaUrl = typeof first === 'string' ? first : (first.url || first.download_url)
        if (!mediaUrl) throw new Error('Link unduhan tidak valid')
        
        let isVideo = first.type === 'video' || /\.(mp4|mov|avi)($|\?)/i.test(mediaUrl) || medias.some(m => (m.type === 'video' || m.extension === 'mp4'))
        let caption = `🌐 *${global.botname || 'BOT'} - ALL IN ONE DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        if (isVideo) {
            await conn.sendMessage(m.chat, {
                video: { url: mediaUrl },
                caption: caption,
                fileName: `${title.slice(0, 30) || 'media'}.mp4`
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                image: { url: mediaUrl },
                caption: caption
            }, { quoted: m })
        }
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['aio <url>', 'aiodl <url>']
handler.tags = ['downloader']
handler.command = /^(aio|aiodl)$/i

handler.limit = true

export default handler
