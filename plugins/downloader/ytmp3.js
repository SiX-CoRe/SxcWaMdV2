import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.youtube.com/watch?v=xxxx*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/ytmp3?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}`
        let res = await axios.get(url, { timeout: 60000 })
        let json = res.data
        
        if (!json.status) throw new Error(json.error || 'Gagal mengunduh audio YouTube')
        
        let audioUrl = json.downloadUrl || json.url || json.result?.downloadUrl || json.result?.url
        if (!audioUrl) throw new Error('Link audio YouTube tidak ditemukan')
        
        let title = json.title || json.result?.title || 'YouTube Audio'
        let channel = json.channel || json.author || 'YouTube'
        let duration = json.duration || '-'
        let thumbnail = json.thumbnail || `https://i.ytimg.com/vi/${json.id || ''}/hqdefault.jpg`
        
        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })
        
        let audioRes = await axios.get(audioUrl, {
            responseType: 'arraybuffer',
            timeout: 180000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
        
        let audioBuffer = Buffer.from(audioRes.data)
        let safeTitle = title.replace(/[\\/:*?"<>|]/g, '').trim() || 'audio'
        let caption = `🎵 *${global.botname || 'BOT'} - YTMP3 AUDIO DOWNLOADER*\n\n📌 *Judul:* ${title}\n👤 *Channel:* ${channel}\n⏱️ *Durasi:* ${duration}\n✨ *Request by:* ${m.pushName || 'User'}`
        let filename = `${safeTitle}.mp3`
        let sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(1)

        let sent = false

        // 1. Coba kirim format audio standar jika ukuran <= 20MB
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
                console.warn('[YTMP3] Gagal kirim mode audio, mencoba mode dokumen:', errAudio.message)
            }
        }

        // 2. Fallback mode dokumen jika mode audio gagal atau ukuran > 20MB (sampai 100MB)
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
                console.warn('[YTMP3] Gagal kirim mode dokumen:', errDoc.message)
            }
        }

        // 3. Jika ukuran > 100MB atau WhatsApp menolak upload media, kirim link direct
        if (!sent) {
            await conn.sendMessage(m.chat, {
                text: `${caption}\n\n⚠️ *Ukuran audio (${sizeMB} MB) terlalu besar untuk diunggah langsung ke WhatsApp.*\n📥 *Link Download Langsung:*\n${audioUrl}`
            }, { quoted: m })
        }
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        console.error('[YTMP3 ERROR]', e)
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['ytmp3 <url>', 'yta <url>']
handler.tags = ['downloader']
handler.command = /^(ytmp3|yta|ytmp3api)$/i

handler.limit = true

export default handler
