import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://pin.it/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/pinterest-downloader?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses unduhan Pinterest V2')
        
        let resData = json.result
        let mediaUrl = resData.url || resData.download_url || resData.image || resData.video || (typeof resData === 'string' ? resData : null)
        if (!mediaUrl) throw new Error('Link media tidak ditemukan')
        
        let isVideo = resData.type === 'video' || /\.(mp4|mov|avi)($|\?)/i.test(mediaUrl)
        let caption = `📌 *${global.botname || 'BOT'} - PINTEREST DOWNLOADER V2*` + '\n\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        if (isVideo) {
            await conn.sendMessage(m.chat, {
                video: { url: mediaUrl },
                caption: caption,
                fileName: `pinterest_${Date.now()}.mp4`
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
handler.help = ['pinterestdownloader <url>', 'pindl2 <url>']
handler.tags = ['downloader']
handler.command = /^(pinterestdownloader|pindl2)$/i

handler.limit = true

export default handler
