import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.mediafire.com/file/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/mediafiredl?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses link MediaFire V2')
        
        let resData = json.result
        let downloadUrl = resData.download_url || resData.download || resData.url
        if (!downloadUrl) throw new Error('Link download file MediaFire tidak ditemukan')
        
        let filename = resData.filename || 'mediafire_file'
        let filesize = resData.filesize || resData.size || '-'
        let ext = resData.ext || 'bin'
        
        let caption = `📁 *${global.botname || 'BOT'} - MEDIAFIRE DOWNLOADER V2*` + '\n\n' +
            `📄 *Nama File:* ${filename}` + '\n' +
            `📏 *Ukuran:* ${filesize}` + '\n' +
            `🏷️ *Tipe:* ${ext.toUpperCase()}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            document: { url: downloadUrl },
            fileName: filename,
            mimetype: 'application/octet-stream',
            caption: caption
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['mediafiredl <url>', 'mfdl2 <url>']
handler.tags = ['downloader']
handler.command = /^(mediafiredl|mfdl2)$/i

handler.limit = true

export default handler
