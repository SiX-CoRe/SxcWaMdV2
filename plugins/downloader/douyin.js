import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://v.douyin.com/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/douyin?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses video Douyin')
        
        let resData = json.result
        let title = resData.title || '-'
        let author = resData.author || '-'
        let caption = `🇨🇳 *${global.botname || 'BOT'} - DOUYIN DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `👤 *Author:* ${author}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        if (resData.images && Array.isArray(resData.images) && resData.images.length > 0) {
            await m.reply(`📸 Menemukan *${resData.images.length}* foto slide Douyin, sedang mengirim...`)
            for (let i = 0; i < resData.images.length; i++) {
                await conn.sendMessage(m.chat, {
                    image: { url: resData.images[i] },
                    caption: `📸 *Slide ${i + 1}/${resData.images.length}*` + '\n' + `📝 ${title}`
                }, { quoted: m })
            }
            if (resData.music) {
                await conn.sendMessage(m.chat, {
                    audio: { url: resData.music },
                    mimetype: 'audio/mpeg',
                    fileName: `${title.slice(0, 30) || 'douyin_audio'}.mp3`
                }, { quoted: m }).catch(() => {})
            }
            await m.react('✅').catch(() => {})
            return
        }
        
        let videoUrl = resData.video || resData.nowm || resData.download_url || resData.url
        if (!videoUrl) throw new Error('Link video Douyin tidak ditemukan')
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `douyin_${Date.now()}.mp4`
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['douyin <url>', 'douyindl <url>']
handler.tags = ['downloader']
handler.command = /^(douyin|douyindl)$/i

handler.limit = true

export default handler
