import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://vt.tiktok.com/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/savett?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses video SaveTT')
        
        let resData = json.result
        let title = resData.title || '-'
        let author = resData.author || '-'
        let duration = resData.duration || '-'
        let caption = `🎵 *${global.botname || 'BOT'} - SAVETT TIKTOK DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `👤 *Author:* ${author}` + '\n' +
            `⏱️ *Durasi:* ${duration}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        if (resData.type === 'slide' || (resData.images && resData.images.length > 0)) {
            let images = resData.images || []
            await m.reply(`📸 Menemukan *${images.length}* foto slide, sedang mengirim...`)
            for (let i = 0; i < images.length; i++) {
                await conn.sendMessage(m.chat, {
                    image: { url: images[i] },
                    caption: `📸 *Slide ${i + 1}/${images.length}*` + '\n' + `📝 ${title}`
                }, { quoted: m })
            }
            if (resData.music) {
                await conn.sendMessage(m.chat, {
                    audio: { url: resData.music },
                    mimetype: 'audio/mpeg',
                    fileName: `${title.slice(0, 30) || 'tiktok_audio'}.mp3`
                }, { quoted: m }).catch(() => {})
            }
            await m.react('✅').catch(() => {})
            return
        }
        
        let videoUrl = resData.nowm || resData.video || resData.download_url || resData.url
        if (!videoUrl) throw new Error('Link video tidak ditemukan')
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `tiktok_${Date.now()}.mp4`
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['savett <url>', 'savetiktok <url>']
handler.tags = ['downloader']
handler.command = /^(savett|savetiktok)$/i

handler.limit = true

export default handler
