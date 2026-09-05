import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.facebook.com/watch?v=xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/facebook?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status) throw new Error(json.error || json.detail || 'Gagal memproses video Facebook')
        
        let videoUrl = json.video_hd || json.video_sd || json.result?.hd || json.result?.sd || json.result?.url || json.url
        if (!videoUrl) throw new Error('Link video Facebook tidak ditemukan')
        
        let title = json.title || json.result?.title || 'Facebook Video'
        let duration = json.duration || json.result?.duration || '-'
        let quality = json.video_hd ? 'HD (High Definition)' : 'SD (Standard Definition)'
        
        let caption = `📘 *${global.botname || 'BOT'} - FACEBOOK DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `📺 *Kualitas:* ${quality}` + '\n' +
            `⏱️ *Durasi:* ${duration}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `facebook_${Date.now()}.mp4`
        }, { quoted: m }).catch(async () => {
            await conn.sendMessage(m.chat, {
                document: { url: videoUrl },
                fileName: `facebook_${Date.now()}.mp4`,
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
handler.help = ['facebook <url>', 'fb <url>', 'fbdl <url>']
handler.tags = ['downloader']
handler.command = /^(facebook|fb|fbdl|fbvideo)$/i

handler.limit = true

export default handler
