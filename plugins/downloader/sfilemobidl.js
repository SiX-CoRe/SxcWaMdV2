import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://sfile.mobi/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/sfilemobidl?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses file SFile')
        
        let resData = json.result
        let downloadUrl = resData.download_url || resData.download || resData.url
        if (!downloadUrl) throw new Error('Link unduhan file SFile tidak ditemukan')
        
        let fileName = resData.file_name || resData.filename || 'sfile_download'
        let size = resData.size_from_text || resData.size || '-'
        let author = resData.author_name || resData.uploader || '-'
        
        let caption = `📂 *${global.botname || 'BOT'} - SFILE DOWNLOADER V2*` + '\n\n' +
            `📄 *Nama File:* ${fileName}` + '\n' +
            `📏 *Ukuran:* ${size}` + '\n' +
            `👤 *Uploader:* ${author}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            document: { url: downloadUrl },
            fileName: fileName,
            mimetype: 'application/octet-stream',
            caption: caption
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['sfilemobidl <url>', 'sfile2 <url>']
handler.tags = ['downloader']
handler.command = /^(sfilemobidl|sfile2)$/i

handler.limit = true

export default handler
