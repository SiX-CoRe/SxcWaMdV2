import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://s.snackvideo.com/p/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/snackvideo?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses video SnackVideo')
        
        let resData = json.result
        let videoUrl = resData.video || resData.download_url || resData.url
        if (!videoUrl) throw new Error('Link video SnackVideo tidak ditemukan')
        
        let title = resData.title || resData.description || 'SnackVideo'
        let author = resData.author || '-'
        let likes = resData.likes ? resData.likes.toLocaleString() : '-'
        let comments = resData.comments ? resData.comments.toLocaleString() : '-'
        
        let caption = `🍿 *${global.botname || 'BOT'} - SNACKVIDEO DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `👤 *Author:* ${author}` + '\n' +
            `❤️ *Likes:* ${likes} | 💬 *Komentar:* ${comments}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `${title.slice(0, 30) || 'snackvideo'}.mp4`
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['snackvideo <url>', 'snackdl <url>']
handler.tags = ['downloader']
handler.command = /^(snackvideo|snackdl|snack)$/i

handler.limit = true

export default handler
