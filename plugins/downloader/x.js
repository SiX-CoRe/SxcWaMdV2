import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://x.com/user/status/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/x?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses tweet X/Twitter')
        
        let resData = json.result
        let author = resData.author_name || resData.author || '-'
        let username = resData.author_screen_name || resData.username || '-'
        let tweetText = resData.text || resData.description || '-'
        let likes = resData.likes ? resData.likes.toLocaleString() : '-'
        let retweets = resData.retweets ? resData.retweets.toLocaleString() : '-'
        
        let caption = `🐦 *${global.botname || 'BOT'} - X/TWITTER DOWNLOADER*` + '\n\n' +
            `👤 *Author:* ${author} (@${username})` + '\n' +
            `📝 *Tweet:* ${tweetText}` + '\n' +
            `❤️ *Likes:* ${likes} | 🔁 *Retweets:* ${retweets}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        let media = resData.media || resData.medias || []
        if (!media.length && resData.video_url) media = [{ type: 'video', url: resData.video_url }]
        if (!media.length && resData.image_url) media = [{ type: 'image', url: resData.image_url }]
        if (!media.length && (resData.url || resData.download_url)) media = [{ type: 'video', url: resData.url || resData.download_url }]
        
        if (!media.length) throw new Error('Tidak ada media ditemukan dalam tweet ini')
        
        for (let i = 0; i < media.length; i++) {
            let item = media[i]
            let mediaUrl = typeof item === 'string' ? item : (item.url || item.download_url)
            if (!mediaUrl) continue
            
            let isVideo = item.type === 'video' || /\.(mp4|mov|avi)($|\?)/i.test(mediaUrl)
            let itemCaption = media.length > 1 ? `${caption}\n\n📌 *Media:* (${i + 1}/${media.length})` : caption
            
            if (isVideo) {
                await conn.sendMessage(m.chat, {
                    video: { url: mediaUrl },
                    caption: itemCaption,
                    fileName: `twitter_${Date.now()}.mp4`
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
handler.help = ['x <url>', 'twitter <url>', 'twdl <url>']
handler.tags = ['downloader']
handler.command = /^(x|twitter|tw|xdl|twdl)$/i

handler.limit = true

export default handler
