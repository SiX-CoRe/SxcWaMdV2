import fetch from 'node-fetch'
import { uploadPomf } from '../../lib/uploadImage.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!text) return m.reply(`teks belum diisi\ncontoh: ${usedPrefix}${command} teks qr|prompt`)
    
    if (!mime || !mime.startsWith('image/')) return m.reply(`gambar belum dikirim, reply/kirim gambar pake caption: ${usedPrefix}${command} teks qr|prompt`)
    
    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        let [qr_text, prompt] = text.split('|')
        
        let media = await q.download()
        let link = await uploadPomf(media)
        
        let url = `${global.web}/api/maker/photoqr?apikey=${(global.apikey.jereapi)}&qr_text=${encodeURIComponent(qr_text)}&image_url=${encodeURIComponent(link)}`
        if (prompt) {
            url += `&prompt=${encodeURIComponent(prompt)}`
        }
        
        let res = await fetch(url)
        if (!res.ok) {
            let json = await res.json().catch(() => ({}))
            throw new Error(json.error || 'Server error')
        }
        
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
        m.reply('server sedang error: ' + e.message)
    }
}
handler.help = ['photoqr']
handler.tags = ['maker']
handler.command = /^photoqr$/i
handler.limit = true;handler.limit = 1;
export default handler
