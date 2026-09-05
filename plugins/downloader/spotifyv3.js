import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://open.spotify.com/track/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/spotifyv3?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses lagu Spotify V3')
        
        let meta = json.result.metadata || {}
        let links = json.result.links || {}
        let downloadUrl = links.download || links.url || links.mp3 || json.result.download_url || json.result.url
        
        if (!downloadUrl) throw new Error('Link download Spotify tidak ditemukan')
        
        let title = meta.name || meta.title || 'Spotify Track'
        let artist = meta.artist || '-'
        let album = meta.album || '-'
        let duration = meta.duration || '-'
        let thumbnail = meta.cover || meta.thumbnail || ''
        
        let caption = `🟢 *${global.botname || 'BOT'} - SPOTIFY V3 DOWNLOADER*` + '\n\n' +
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
handler.help = ['spotifyv3 <url>', 'spdlv3 <url>']
handler.tags = ['downloader']
handler.command = /^(spotifyv3|spdlv3)$/i

handler.limit = true

export default handler
