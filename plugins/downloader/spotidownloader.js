import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://open.spotify.com/track/xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/spotidownloader?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses SpotiDownloader')
        
        let resData = json.result
        let downloadUrl = resData.download_url || resData.download || resData.url || resData.link
        if (!downloadUrl) throw new Error('Link unduhan audio tidak ditemukan')
        
        let title = resData.title || resData.name || 'Spotify Track'
        let artist = resData.artist || resData.artists || '-'
        let album = resData.album || '-'
        let duration = resData.duration || '-'
        let thumbnail = resData.thumbnail || resData.cover || ''
        
        let caption = `🟢 *${global.botname || 'BOT'} - SPOTIDOWNLOADER*` + '\n\n' +
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
        
        let safeTitle = `${artist} - ${title}`.replace(/[\\/:*?"<>|]/g, '').trim() || 'spotidownloader_audio'
        
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
handler.help = ['spotidownloader <url>', 'spdl2 <url>']
handler.tags = ['downloader']
handler.command = /^(spotidownloader|spdl2)$/i

handler.limit = true

export default handler
