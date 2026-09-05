import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://vt.tiktok.com/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/tiktok?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status) throw new Error(json.error || json.detail || 'Gagal memproses video TikTok')
        
        let raw = json.raw_data || json.data || {}
        let title = json.description || raw.title || '-'
        let author = raw.author?.nickname || raw.nickname || '-'
        let username = raw.author?.unique_id || raw.unique_id || '-'
        let duration = raw.duration ? `${raw.duration} detik` : '-'
        let views = raw.play_count ? raw.play_count.toLocaleString() : '-'
        let likes = raw.digg_count ? raw.digg_count.toLocaleString() : '-'
        let comments = raw.comment_count ? raw.comment_count.toLocaleString() : '-'
        let shares = raw.share_count ? raw.share_count.toLocaleString() : '-'
        let musicTitle = raw.music_info?.title || raw.music || '-'
        
        let caption = `🎵 *${global.botname || 'BOT'} - TIKTOK DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `👤 *Author:* ${author} (@${username})` + '\n' +
            `⏱️ *Durasi:* ${duration}` + '\n' +
            `👁️ *Views:* ${views} | ❤️ *Likes:* ${likes}` + '\n' +
            `💬 *Komentar:* ${comments} | 🔁 *Shares:* ${shares}` + '\n' +
            `🎶 *Musik:* ${musicTitle}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        // Photo slide / Images
        let images = raw.images || json.images || json.data?.images || json.result?.images
        if (images && Array.isArray(images) && images.length > 0) {
            await m.reply(`📸 Menemukan *${images.length}* foto slide, sedang mengirim...`)
            for (let i = 0; i < images.length; i++) {
                let imgUrl = typeof images[i] === 'string' ? images[i] : images[i].url
                if (imgUrl) {
                    await conn.sendMessage(m.chat, {
                        image: { url: imgUrl },
                        caption: `📸 *Slide ${i + 1}/${images.length}*` + '\n' + `📝 ${title}`
                    }, { quoted: m })
                }
            }
            let audioUrl = json.links?.find(l => l.label?.toLowerCase().includes('audio') || l.label?.toLowerCase().includes('mp3'))?.url || raw.music || raw.music_info?.play_url
            if (audioUrl) {
                await conn.sendMessage(m.chat, {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mpeg',
                    fileName: `${title.slice(0, 30) || 'tiktok_audio'}.mp3`
                }, { quoted: m }).catch(() => {})
            }
            await m.react('✅').catch(() => {})
            return
        }
        
        // Video
        let videoUrl = json.links?.find(l => l.label?.toLowerCase().includes('without') || l.label?.toLowerCase().includes('nowm'))?.url || 
                       raw.play || 
                       json.links?.[0]?.url || 
                       json.data?.play || 
                       json.result?.play
                       
        if (!videoUrl) throw new Error('Link video TikTok tidak ditemukan')
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `tiktok_${Date.now()}.mp4`
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['tt <url>', 'ttdl <url>']
handler.tags = ['downloader']
handler.command = /^(tt|ttdl)$/i

handler.limit = true

export default handler
