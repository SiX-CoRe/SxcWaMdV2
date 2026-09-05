import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.threads.net/@user/post/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/threads?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status) throw new Error(json.error || json.detail || 'Gagal memproses link Threads')
        
        let mediaList = json.media || json.result || []
        if (!mediaList || mediaList.length === 0) throw new Error('Media tidak ditemukan di postingan Threads ini')
        
        let author = json.author?.username || json.user?.username || 'Threads User'
        let fullName = json.author?.full_name || json.user?.full_name || ''
        let postCaption = json.caption || json.post?.caption || '-'
        let likes = json.likes ?? json.post?.like_count ?? '-'
        
        let caption = `🧵 *${global.botname || 'BOT'} - THREADS DOWNLOADER*` + '\n\n' +
            `👤 *Author:* ${author} ${fullName ? '(' + fullName + ')' : ''}` + '\n' +
            `📝 *Caption:* ${postCaption}` + '\n' +
            `❤️ *Likes:* ${likes}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        for (let i = 0; i < mediaList.length; i++) {
            let item = mediaList[i]
            let mediaUrl = item.url || item.download_url || (typeof item === 'string' ? item : null)
            if (!mediaUrl) continue
            
            let isVideo = item.type === 'video' || /\.(mp4|mov|avi)($|\?)/i.test(mediaUrl)
            let itemCaption = mediaList.length > 1 ? `${caption}\n\n📌 *Media:* (${i + 1}/${mediaList.length})` : caption
            
            if (isVideo) {
                await conn.sendMessage(m.chat, {
                    video: { url: mediaUrl },
                    caption: itemCaption,
                    fileName: `threads_${Date.now()}.mp4`
                }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, {
                    image: { url: mediaUrl },
                    caption: itemCaption
                }, { quoted: m })
            }
        }
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['threads <url>', 'thdl <url>']
handler.tags = ['downloader']
handler.command = /^(threads|thdl|th)$/i

handler.limit = true

export default handler
