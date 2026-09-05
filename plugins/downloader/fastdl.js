import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.instagram.com/p/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/fastdl?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal mengambil media Instagram FastDL')
        
        let medias = Array.isArray(json.result) ? json.result : [json.result]
        if (!medias.length) throw new Error('Tidak ada media ditemukan')
        
        for (let i = 0; i < medias.length; i++) {
            let item = medias[i]
            let mediaUrl = typeof item === 'string' ? item : (item.url || item.download_url || item.download)
            if (!mediaUrl) continue
            
            let isVideo = /\.(mp4|mov|avi|webm)($|\?)/i.test(mediaUrl) || item.type === 'video'
            let caption = `⚡ *${global.botname || 'BOT'} - FASTDL INSTAGRAM*` + (medias.length > 1 ? ` (${i + 1}/${medias.length})` : '') + '\n\n' +
                `✨ *Request by:* ${m.pushName || 'User'}`
            
            if (isVideo) {
                await conn.sendMessage(m.chat, {
                    video: { url: mediaUrl },
                    caption: caption,
                    fileName: `fastdl_${Date.now()}.mp4`
                }, { quoted: m }).catch(async () => {
                    await conn.sendMessage(m.chat, {
                        image: { url: mediaUrl },
                        caption: caption
                    }, { quoted: m })
                })
            } else {
                await conn.sendMessage(m.chat, {
                    image: { url: mediaUrl },
                    caption: caption
                }, { quoted: m })
            }
        }
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['fastdl <url>']
handler.tags = ['downloader']
handler.command = /^(fastdl|fastig)$/i

handler.limit = true

export default handler
