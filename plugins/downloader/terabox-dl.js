import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://terabox.com/s/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/terabox-dl?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses file TeraBox')
        
        let resData = json.result
        let downloadUrl = resData.download_url || resData.fast_download_url || resData.url || resData.download
        if (!downloadUrl) throw new Error('Link unduhan file TeraBox tidak ditemukan')
        
        let filename = resData.filename || resData.file_name || 'terabox_download'
        let size = resData.size || '-'
        let caption = `📦 *${global.botname || 'BOT'} - TERABOX DOWNLOADER V2*` + '\n\n' +
            `📄 *Nama File:* ${filename}` + '\n' +
            `📏 *Ukuran:* ${size}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        let isVideo = /\.(mp4|mkv|mov|avi)($|\?)/i.test(filename) || /\.(mp4|mkv|mov|avi)($|\?)/i.test(downloadUrl)
        
        if (isVideo) {
            await conn.sendMessage(m.chat, {
                video: { url: downloadUrl },
                caption: caption,
                fileName: filename.endsWith('.mp4') ? filename : `${filename}.mp4`
            }, { quoted: m }).catch(async () => {
                await conn.sendMessage(m.chat, {
                    document: { url: downloadUrl },
                    fileName: filename,
                    mimetype: 'video/mp4',
                    caption: caption
                }, { quoted: m })
            })
        } else {
            await conn.sendMessage(m.chat, {
                document: { url: downloadUrl },
                fileName: filename,
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
handler.help = ['teraboxdl <url>', 'tbxdl <url>']
handler.tags = ['downloader']
handler.command = /^(teraboxdl|tbxdl)$/i

handler.limit = true

export default handler
