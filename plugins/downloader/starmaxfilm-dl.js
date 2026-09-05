import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://starmaxfilm...*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/starmaxfilm-dl?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses film Starmax')
        
        let resData = json.result
        let downloadList = resData.downloads || []
        let downloadUrl = (downloadList.length > 0 ? downloadList[0].url : null) || resData.download_url || resData.url
        if (!downloadUrl) throw new Error('Link unduhan film Starmax tidak ditemukan')
        
        let title = resData.title || 'Starmax Movie'
        let rating = resData.rating || '-'
        let quality = (downloadList.length > 0 ? downloadList[0].resolution : null) || resData.quality || '-'
        let provider = (downloadList.length > 0 ? downloadList[0].provider : null) || '-'
        
        let caption = `🎥 *${global.botname || 'BOT'} - STARMAX FILM DOWNLOADER*` + '\n\n' +
            `🎬 *Judul:* ${title}` + '\n' +
            `⭐ *Rating:* ${rating}` + '\n' +
            `📺 *Kualitas:* ${quality}` + '\n' +
            `🌐 *Server:* ${provider}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            video: { url: downloadUrl },
            caption: caption,
            fileName: `${title.slice(0, 30) || 'film'}.mp4`
        }, { quoted: m }).catch(async () => {
            await conn.sendMessage(m.chat, {
                document: { url: downloadUrl },
                fileName: `${title.slice(0, 30) || 'film'}.mp4`,
                mimetype: 'video/mp4',
                caption: caption
            }, { quoted: m })
        })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['starmaxfilmdl <url>', 'starmaxfilm <url>']
handler.tags = ['downloader']
handler.command = /^(starmaxfilmdl|starmaxfilm)$/i

handler.limit = true

export default handler
