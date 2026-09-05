import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} http://xhslink.com/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/rednote?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses postingan RedNote/Xiaohongshu')
        
        let resData = json.result
        let title = resData.title || resData.description || 'RedNote Post'
        let author = resData.author || resData.nickname || '-'
        let caption = `📕 *${global.botname || 'BOT'} - REDNOTE DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `👤 *Author:* ${author}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        // Multi images
        if (resData.images && Array.isArray(resData.images) && resData.images.length > 0) {
            await m.reply(`📸 Menemukan *${resData.images.length}* foto RedNote, sedang mengirim...`)
            for (let i = 0; i < resData.images.length; i++) {
                let imgUrl = typeof resData.images[i] === 'string' ? resData.images[i] : resData.images[i].url
                if (imgUrl) {
                    await conn.sendMessage(m.chat, {
                        image: { url: imgUrl },
                        caption: `📸 *Foto ${i + 1}/${resData.images.length}*` + '\n' + `📝 ${title}`
                    }, { quoted: m })
                }
            }
            await m.react('✅').catch(() => {})
            return
        }
        
        let videoUrl = resData.video || resData.download_url || resData.url
        if (!videoUrl) throw new Error('Link media RedNote tidak ditemukan')
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `rednote_${Date.now()}.mp4`
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['rednote <url>', 'xhs <url>', 'xiaohongshu <url>']
handler.tags = ['downloader']
handler.command = /^(rednote|xhs|xiaohongshu)$/i

handler.limit = true

export default handler
