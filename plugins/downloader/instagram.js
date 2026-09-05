import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.instagram.com/reel/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let apiUrl = `${global.web}/api/downloader/instagram`
        let response = await axios.post(apiUrl, { apikey: apiKey, url: text.trim() }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        }).catch(async () => {
            // Fallback via GET
            return await axios.get(`${global.web}/api/downloader/instagram?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`, { timeout: 60000 })
        })
        
        let data = response?.data
        if (!data || !data.status || !data.result) {
            throw new Error(data?.error || data?.detail || 'Gagal mengambil data Instagram')
        }
        
        let urls = data.result.urls || (Array.isArray(data.result) ? data.result : [data.result])
        if (!urls || urls.length === 0) throw new Error('Tidak ada media ditemukan')
        
        for (let i = 0; i < urls.length; i++) {
            let item = urls[i]
            let itemUrl = typeof item === 'string' ? item : (item.url || item.downloadUrl || item.download)
            if (!itemUrl) continue
            
            let isVideo = /\.(mp4|mov|avi|webm)($|\?)/i.test(itemUrl) || (typeof item === 'object' && item.type === 'video')
            let caption = `📸 *${global.botname || 'BOT'} - INSTAGRAM DOWNLOADER*` + (urls.length > 1 ? ` (${i + 1}/${urls.length})` : '') + '\n\n' +
                `✨ *Request by:* ${m.pushName || 'User'}`
            
            if (isVideo) {
                await conn.sendMessage(m.chat, {
                    video: { url: itemUrl },
                    caption: caption,
                    fileName: `instagram_${Date.now()}.mp4`
                }, { quoted: m }).catch(async () => {
                    await conn.sendMessage(m.chat, {
                        image: { url: itemUrl },
                        caption: caption
                    }, { quoted: m })
                })
            } else {
                await conn.sendMessage(m.chat, {
                    image: { url: itemUrl },
                    caption: caption
                }, { quoted: m }).catch(async () => {
                    await conn.sendMessage(m.chat, {
                        video: { url: itemUrl },
                        caption: caption,
                        fileName: `instagram_${Date.now()}.mp4`
                    }, { quoted: m })
                })
            }
        }
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['instagram <url>', 'igdl <url>', 'ig <url>']
handler.tags = ['downloader']
handler.command = /^(instagram|igdl|ig|igvideo|igphoto|igreels)$/i

handler.limit = true

export default handler
