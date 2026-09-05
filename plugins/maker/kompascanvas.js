import fetch from 'node-fetch'
import { uploadPomf } from '../../lib/uploadImage.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!text) return m.reply(`teks belum diisi\ncontoh: ${usedPrefix}${command} judul|isi`)
    
    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        let [judul, isi, photo] = text.split('|')
        let url = `${global.web}/api/maker/kompascanvas?apikey=${(global.apikey.jereapi)}&judul=${encodeURIComponent(judul)}&isi=${encodeURIComponent(isi || '')}`
        
        if (mime && mime.startsWith('image/')) {
            let media = await q.download()
            let link = await uploadPomf(media)
            url += `&photo=${encodeURIComponent(link)}`
        } else if (photo) {
            url += `&photo=${encodeURIComponent(photo)}`
        }
        
        let res = await fetch(url)
        let buffer = await res.arrayBuffer()
        
        try {
            await conn.sendFile(m.chat, Buffer.from(buffer), 'result.png', `*SXCWA-MD - MAKER*`, m)
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply('gagal mengirim atau memproses medianya')
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply('server sedang error, coba lagi nanti')
    }
}
handler.help = ['kompascanvas']
handler.tags = ['maker']
handler.command = /^kompascanvas$/i
handler.limit = true;handler.limit = 1;
export default handler
