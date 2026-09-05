import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.mediafire.com/file/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/mediafire?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status) throw new Error(json.error || json.detail || 'Gagal memproses link MediaFire')
        
        let downloadUrl = json.download || json.download_url || json.url || json.result?.download_url || json.result?.url
        if (!downloadUrl) throw new Error('Link download file MediaFire tidak ditemukan')
        
        let filename = json.filename || json.result?.filename || 'mediafire_file'
        let filesize = json.filesize || json.size || json.result?.filesize || '-'
        let ext = json.ext || json.result?.ext || 'bin'
        
        let caption = `📁 *${global.botname || 'BOT'} - MEDIAFIRE DOWNLOADER*` + '\n\n' +
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
handler.help = ['mediafire <url>', 'mfdl <url>']
handler.tags = ['downloader']
handler.command = /^(mediafire|mfdl)$/i

handler.limit = true

export default handler
