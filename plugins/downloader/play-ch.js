import axios from "axios";
import yts from "yt-search";

async function getYouTubeAudio(url) {
    const API_KEY = global.apikey?.jereapi;
    let errors = [];

    // 1. Coba endpoint /api/downloader/youtube
    try {
        const res = await axios.get(`${global.web}/api/downloader/youtube?apikey=${API_KEY}&url=${encodeURIComponent(url)}&format=mp3`, { timeout: 30000 });
        if (res.data?.status) {
            const data = res.data.result || res.data.data || res.data;
            const dl = data.download || data.url || data.downloadUrl || data.download_url;
            if (dl) {
                return {
                    title: data.title || "YouTube Audio",
                    author: data.channel || data.author || "YouTube",
                    duration: data.duration || "-",
                    thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${data.id || ''}/hqdefault.jpg`,
                    downloadUrl: dl
                };
            }
        }
    } catch (e) {
        errors.push(`youtube: ${e.message}`);
    }

    // 2. Fallback ke /api/downloader/ytmp3
    try {
        const res = await axios.get(`${global.web}/api/downloader/ytmp3?apikey=${API_KEY}&url=${encodeURIComponent(url)}`, { timeout: 30000 });
        if (res.data?.status) {
            const data = res.data.result || res.data;
            const dl = data.downloadUrl || data.download_url || data.download || data.url;
            if (dl) {
                return {
                    title: data.title || res.data.title || "YouTube Audio",
                    author: data.channel || data.author || "YouTube",
                    duration: data.duration || "-",
                    thumbnail: data.thumbnail || res.data.thumbnail || "https://i.ytimg.com/vi/default.jpg",
                    downloadUrl: dl
                };
            }
        }
    } catch (e) {
        errors.push(`ytmp3: ${e.message}`);
    }

    throw new Error(`Gagal mengambil audio dari YouTube. ${errors.join(" | ")}`);
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} Never Gonna Give You Up*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let videoUrl = text.trim()
        let title = text.trim()
        let author = 'YouTube'
        let duration = '-'
        let thumbnail = ''
        
        if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
            let search = await yts(text.trim())
            if (!search?.videos?.length) throw new Error('Lagu tidak ditemukan')
            let top = search.videos[0]
            videoUrl = top.url
            title = top.title
            author = top.author?.name || 'YouTube'
            duration = top.timestamp || '-'
            thumbnail = top.thumbnail
        }
        
        let audioData = await getYouTubeAudio(videoUrl)
        let audioRes = await axios.get(audioData.downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 120000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
        
        let safeTitle = (audioData.title || title).replace(/[\\/:*?"<>|]/g, '').trim() || 'playch_audio'
        
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
handler.help = ['playch <query/url>', 'musich <query/url>']
handler.tags = ['downloader']
handler.command = /^(playch|musich|musikch)$/i

handler.limit = true

export default handler
