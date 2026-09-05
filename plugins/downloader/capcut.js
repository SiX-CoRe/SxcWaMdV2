import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.capcut.com/t/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/capcut?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status) throw new Error(json.error || json.pesan || json.message || 'Gagal memproses video CapCut')
        
        let videoUrl = json.result?.video_url || 
                       json.result?.videoUrl || 
                       (Array.isArray(json.video) ? (json.video.find(v => v.kualitas === 'tinggi') || json.video[0])?.url : null) || 
                       json.video_url || 
                       json.url
                       
        if (!videoUrl) throw new Error('Link download video CapCut tidak ditemukan')
        
        let title = json.result?.title || json.judul || 'CapCut Video'
        let author = json.result?.author_name || json.author || '-'
        let caption = `🎬 *${global.botname || 'BOT'} - CAPCUT DOWNLOADER*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `👤 *Author:* ${author}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: caption,
            fileName: `${title.slice(0, 30) || 'capcut'}.mp4`
        }, { quoted: m }).catch(async () => {
            await conn.sendMessage(m.chat, {
                document: { url: videoUrl },
                fileName: `${title.slice(0, 30) || 'capcut'}.mp4`,
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
handler.help = ['capcut <url>', 'cc <url>', 'ccdl <url>']
handler.tags = ['downloader']
handler.command = /^(capcut|cc|ccdl)$/i

handler.limit = true

export default handler
