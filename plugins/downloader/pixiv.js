import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.pixiv.net/en/artworks/108000000*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/pixiv?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal mengambil karya seni Pixiv')
        
        let resData = json.result
        let title = resData.title || 'Pixiv Artwork'
        let author = resData.author?.name || '-'
        let views = resData.stats?.views ? resData.stats.views.toLocaleString() : '-'
        let bookmarks = resData.stats?.bookmarks ? resData.stats.bookmarks.toLocaleString() : '-'
        let likes = resData.stats?.likes ? resData.stats.likes.toLocaleString() : '-'
        let r18Type = resData.meta?.r18_type || 'Safe'
        let isAi = resData.meta?.is_ai ? 'Ya' : 'Bukan'
        
        let caption = `🎨 *${global.botname || 'BOT'} - PIXIV DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `👤 *Artist:* ${author}` + '\n' +
            `👁️ *Views:* ${views} | ❤️ *Likes:* ${likes} | 🔖 *Bookmarks:* ${bookmarks}` + '\n' +
            `🔞 *Rating:* ${r18Type} | 🤖 *AI:* ${isAi}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        let images = resData.images || []
        if (!images.length) throw new Error('Gambar tidak ditemukan pada postingan Pixiv ini')
        
        for (let i = 0; i < Math.min(images.length, 5); i++) {
            let img = images[i]
            let imgUrl = img.original_proxy || img.regular_proxy || img.original || img.regular || img
            let itemCaption = images.length > 1 ? `${caption}\n\n🖼️ *Halaman:* (${i + 1}/${images.length})` : caption
            
            await conn.sendMessage(m.chat, {
                image: { url: imgUrl },
                caption: itemCaption
            }, { quoted: m })
        }
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['pixiv <url/id>', 'pixivdl <url/id>']
handler.tags = ['downloader']
handler.command = /^(pixiv|pixivdl)$/i

handler.limit = true

export default handler
