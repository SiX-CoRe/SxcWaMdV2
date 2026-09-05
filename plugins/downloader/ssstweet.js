import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://x.com/user/status/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/ssstweet?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses tweet SSSTweet')
        
        let resData = json.result
        let medias = Array.isArray(resData) ? resData : (resData.media || [resData])
        if (!medias.length) throw new Error('Tidak ada media ditemukan')
        
        for (let i = 0; i < medias.length; i++) {
            let item = medias[i]
            let mediaUrl = typeof item === 'string' ? item : (item.url || item.download_url || item.download)
            if (!mediaUrl) continue
            
            let isVideo = item.type === 'video' || /\.(mp4|mov|avi)($|\?)/i.test(mediaUrl)
            let caption = `🐦 *${global.botname || 'BOT'} - SSSTWEET DOWNLOADER*` + (medias.length > 1 ? ` (${i + 1}/${medias.length})` : '') + '\n\n' +
                `✨ *Request by:* ${m.pushName || 'User'}`
            
            if (isVideo) {
                await conn.sendMessage(m.chat, {
                    video: { url: mediaUrl },
                    caption: caption,
                    fileName: `twitter_${Date.now()}.mp4`
                }, { quoted: m })
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
handler.help = ['ssstweet <url>', 'ssstwitter <url>']
handler.tags = ['downloader']
handler.command = /^(ssstweet|ssstwitter)$/i

handler.limit = true

export default handler
