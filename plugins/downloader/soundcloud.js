import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://soundcloud.com/user/track*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/soundcloud?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses lagu SoundCloud')
        
        let resData = json.result
        let downloadUrl = resData.download_url || resData.download || resData.url
        if (!downloadUrl) throw new Error('Link unduhan SoundCloud tidak ditemukan')
        
        let title = resData.title || 'SoundCloud Track'
        let uploader = resData.uploader || resData.author || '-'
        let duration = resData.duration || '-'
        let views = resData.views || '-'
        let likes = resData.likes || '-'
        let size = resData.size || '-'
        
        let caption = `☁️ *${global.botname || 'BOT'} - SOUNDCLOUD DOWNLOADER*` + '\n\n' +
            `🎵 *Judul:* ${title}` + '\n' +
            `👤 *Uploader:* ${uploader}` + '\n' +
            `⏱️ *Durasi:* ${duration}` + '\n' +
            `📏 *Ukuran:* ${size}` + '\n' +
            `👁️ *Views:* ${views} | ❤️ *Likes:* ${likes}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })
        
        let audioRes = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 180000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
        
        let audioBuffer = Buffer.from(audioRes.data)
        let safeTitle = `${uploader} - ${title}`.replace(/[\\/:*?"<>|]/g, '').trim() || 'soundcloud_audio'
        let filename = `${safeTitle}.mp3`
        let sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(1)

        let sent = false

        // 1. Coba mode audio biasa jika <= 20MB
        if (audioBuffer.length <= 20 * 1024 * 1024) {
            try {
                await conn.sendMessage(m.chat, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: filename
                }, { quoted: m })
                sent = true
            } catch (errAudio) {
                console.warn('[Soundcloud] Gagal kirim mode audio, fallback dokumen:', errAudio.message)
            }
        }

        // 2. Fallback mode dokumen (sampai 100MB)
        if (!sent && audioBuffer.length <= 100 * 1024 * 1024) {
            try {
                await conn.sendMessage(m.chat, {
                    document: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: filename,
                    caption: caption
                }, { quoted: m })
                sent = true
            } catch (errDoc) {
                console.warn('[Soundcloud] Gagal kirim dokumen:', errDoc.message)
            }
        }

        // 3. Fallback direct link jika > 100MB
        if (!sent) {
            await conn.sendMessage(m.chat, {
                text: `${caption}\n\n⚠️ *Ukuran audio (${sizeMB} MB) terlalu besar untuk diunggah langsung ke WhatsApp.*\n📥 *Link Download Langsung:*\n${downloadUrl}`
            }, { quoted: m })
        }
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        console.error('[Soundcloud ERROR]', e)
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['soundcloud <url>', 'scdl <url>']
handler.tags = ['downloader']
handler.command = /^(soundcloud|scdl)$/i

handler.limit = true

export default handler
