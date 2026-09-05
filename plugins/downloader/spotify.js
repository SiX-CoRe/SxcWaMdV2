import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://open.spotify.com/track/xxxx* atau *${usedPrefix + command} Judul Lagu*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let isUrl = text.includes('open.spotify.com')
        let apiUrl = ''
        
        if (isUrl) {
            apiUrl = `${global.web}/api/downloader/spotify?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        } else {
            // Search track via API
            let sRes = await fetch(`${global.web}/api/search/spotify?apikey=${apiKey}&q=${encodeURIComponent(text.trim())}`)
            let sJson = await sRes.json()
            if (!sJson.status || !sJson.result || !sJson.result.length) {
                throw new Error('Lagu Spotify tidak ditemukan')
            }
            let firstTrack = sJson.result[0]
            let trackUrl = firstTrack.url || firstTrack.link || `https://open.spotify.com/track/${firstTrack.id}`
            apiUrl = `${global.web}/api/downloader/spotify?apikey=${apiKey}&url=${encodeURIComponent(trackUrl)}`
        }
        
        let res = await fetch(apiUrl)
        let json = await res.json()
        
        if (!json.status) throw new Error(json.error || json.message || 'Gagal mengunduh lagu Spotify')
        
        let track = json.result || json.data || json
        let downloadUrl = track.download || track.download_url || track.url || track.audio || track.link
        if (!downloadUrl) throw new Error('Link audio Spotify tidak ditemukan')
        
        let title = track.title || track.name || 'Spotify Track'
        let artist = track.artist || track.artists || '-'
        let album = track.album || '-'
        let duration = track.duration || '-'
        
        let caption = `🟢 *${global.botname || 'BOT'} - SPOTIFY DOWNLOADER*` + '\n\n' +
            `🎵 *Judul:* ${title}` + '\n' +
            `👤 *Artis:* ${artist}` + '\n' +
            `💿 *Album:* ${album}` + '\n' +
            `⏱️ *Durasi:* ${duration}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })
        
        const audioRes = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 180000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
        
        const audioBuffer = Buffer.from(audioRes.data)
        const safeTitle = `${artist} - ${title}`.replace(/[\\/:*?"<>|]/g, '').trim() || 'spotify_audio'
        const filename = `${safeTitle}.mp3`
        const sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(1)

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
                console.warn('[Spotify] Gagal kirim mode audio, fallback dokumen:', errAudio.message)
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
                console.warn('[Spotify] Gagal kirim dokumen:', errDoc.message)
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
        console.error('[Spotify ERROR]', e)
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['spotify <url/judul>', 'spdl <url/judul>']
handler.tags = ['downloader']
handler.command = /^(spotify|spdl)$/i

handler.limit = true

export default handler
