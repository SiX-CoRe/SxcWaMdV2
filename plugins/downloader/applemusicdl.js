import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://music.apple.com/...*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/applemusicdl?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || json.message || 'Gagal mengunduh lagu Apple Music')
        
        let resData = json.result
        let downloadUrl = resData.url_dl || resData.download || resData.download_url || resData.url
        if (!downloadUrl) throw new Error('Link unduhan lagu Apple Music tidak ditemukan')
        
        let title = resData.title || resData.name || 'Apple Music Track'
        let artist = resData.artist || '-'
        let album = resData.album || '-'
        let duration = resData.duration || '-'
        
        let caption = `🍎 *${global.botname || 'BOT'} - APPLE MUSIC DOWNLOADER*` + '\n\n' +
            `🎵 *Judul:* ${title}` + '\n' +
            `👤 *Artis:* ${artist}` + '\n' +
            `💿 *Album:* ${album}` + '\n' +
            `⏱️ *Durasi:* ${duration}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })
        
        let audioRes = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 180000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
        
        let audioBuffer = Buffer.from(audioRes.data)
        let safeTitle = `${artist} - ${title}`.replace(/[\\/:*?"<>|]/g, '').trim() || 'applemusic_audio'
        let filename = `${safeTitle}.mp3`
        let sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(1)

        let sent = false

        // 1. Coba mode audio biasa (<= 20MB)
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
                console.warn('[AppleMusic] Gagal kirim mode audio, fallback dokumen:', errAudio.message)
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
                console.warn('[AppleMusic] Gagal kirim dokumen:', errDoc.message)
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
        console.error('[AppleMusic ERROR]', e)
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['applemusicdl <url>', 'applemusic <url>']
handler.tags = ['downloader']
handler.command = /^(applemusicdl|applemusic|aapl)$/i

handler.limit = true

export default handler
