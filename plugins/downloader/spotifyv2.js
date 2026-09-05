import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://open.spotify.com/track/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/spotifyv2?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.data) throw new Error(json.error || 'Gagal mengunduh lagu Spotify V2')
        
        let data = json.data
        let downloadUrl = data.downloadUrl || data.download || data.url
        if (!downloadUrl) throw new Error('Link unduhan lagu tidak ditemukan')
        
        let title = data.title || 'Spotify Track'
        let artist = data.artist || '-'
        let album = data.album || '-'
        let duration = data.duration || '-'
        let thumbnail = data.thumbnail || data.cover || ''
        
        let caption = `🟢 *${global.botname || 'BOT'} - SPOTIFY V2 DOWNLOADER*` + '\n\n' +
            `🎵 *Judul:* ${title}` + '\n' +
            `👤 *Artis:* ${artist}` + '\n' +
            `💿 *Album:* ${album}` + '\n' +
            `⏱️ *Durasi:* ${duration}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })
        
        let audioRes = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 120000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
        
        let safeTitle = `${artist} - ${title}`.replace(/[\\/:*?"<>|]/g, '').trim() || 'spotify_audio'
        
        await conn.sendMessage(m.chat, {
            audio: Buffer.from(audioRes.data),
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${safeTitle}.mp3`}, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['spotifyv2 <url>', 'spdlv2 <url>']
handler.tags = ['downloader']
handler.command = /^(spotifyv2|spdlv2)$/i

handler.limit = true

export default handler
