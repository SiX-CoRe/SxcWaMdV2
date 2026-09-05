import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.threads.net/@user/post/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/threadsv2?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result || !json.result.length) {
            throw new Error(json.error || json.detail || 'Gagal memproses data postingan Threads V2')
        }
        
        let user = json.user || {}
        let post = json.post || {}
        let author = user.username || '-'
        let fullName = user.full_name || ''
        let postCaption = post.caption || '-'
        let likes = post.like_count ? post.like_count.toLocaleString() : '-'
        
        let caption = `🧵 *${global.botname || 'BOT'} - THREADS DOWNLOADER V2*` + '\n\n' +
            `👤 *Author:* ${author} ${fullName ? '(' + fullName + ')' : ''}` + '\n' +
            `📝 *Caption:* ${postCaption}` + '\n' +
            `❤️ *Likes:* ${likes}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        for (let i = 0; i < json.result.length; i++) {
            let item = json.result[i]
            let mediaUrl = item.url || item.download_url
            if (!mediaUrl) continue
            
            let isVideo = item.type === 'video' || /\.(mp4|mov|avi)($|\?)/i.test(mediaUrl)
            let itemCaption = json.result.length > 1 ? `${caption}\n\n📌 *Media:* (${i + 1}/${json.result.length})` : caption
            
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
handler.help = ['threadsv2 <url>', 'thdlv2 <url>']
handler.tags = ['downloader']
handler.command = /^(threadsv2|thdlv2)$/i

handler.limit = true

export default handler
