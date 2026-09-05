import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://terabox.com/s/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/terabox?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status) throw new Error(json.error || json.detail || 'Gagal memproses link TeraBox')
        
        let resData = json.data || json.result || {}
        let downloadUrl = resData.direct_link || resData.download_link || resData.url || resData.downloadUrl || resData.download
        if (!downloadUrl) throw new Error('Link unduhan file TeraBox tidak ditemukan')
        
        let fileName = resData.title || resData.filename || resData.file_name || 'terabox_download'
        let size = resData.size || resData.filesize || '-'
        let caption = `📦 *${global.botname || 'BOT'} - TERABOX DOWNLOADER*` + '\n\n' +
            `📄 *Nama File:* ${fileName}` + '\n' +
            `📏 *Ukuran:* ${size}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        let isVideo = /\.(mp4|mkv|mov|avi)($|\?)/i.test(fileName) || /\.(mp4|mkv|mov|avi)($|\?)/i.test(downloadUrl)
        
        if (isVideo) {
            await conn.sendMessage(m.chat, {
                video: { url: downloadUrl },
                caption: caption,
                fileName: fileName.endsWith('.mp4') ? fileName : `${fileName}.mp4`
            }, { quoted: m }).catch(async () => {
                await conn.sendMessage(m.chat, {
                    document: { url: downloadUrl },
                    fileName: fileName,
                    mimetype: 'video/mp4',
                    caption: caption
                }, { quoted: m })
            })
        } else {
            await conn.sendMessage(m.chat, {
                document: { url: downloadUrl },
                fileName: fileName,
                mimetype: 'application/octet-stream',
                caption: caption
            }, { quoted: m })
        }
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['terabox <url>', 'tbx <url>']
handler.tags = ['downloader']
handler.command = /^(terabox|tbx)$/i

handler.limit = true

export default handler
