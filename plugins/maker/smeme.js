import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [atas, bawah] = text.split('|')
    if (!atas) return m.reply(`contoh: ${usedPrefix}${command} teks atas|teks bawah\n(Sambil reply/kirim gambar)`)
    
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) return m.reply('Silakan reply gambarnya terlebih dahulu!')

    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        let media = await q.download()
        let urlImg = await uploadImage(media)
        let url = `${global.web}/api/maker/smeme?apikey=${global.apikey.jereapi}&atas=${encodeURIComponent(atas)}&bawah=${encodeURIComponent(bawah || '_')}&url=${encodeURIComponent(urlImg)}`
        
        let res = await fetch(url)
        let buffer = await res.arrayBuffer()
        await conn.sendFile(m.chat, Buffer.from(buffer), 'smeme.jpg', '*SXCWA-MD - MAKER*', m)
    } catch (e) {
        m.reply('server sedang error, coba lagi nanti')
    }
}
handler.help = ['smeme']
handler.tags = ['maker']
handler.command = /^smeme$/i
handler.limit = 1;
export default handler
