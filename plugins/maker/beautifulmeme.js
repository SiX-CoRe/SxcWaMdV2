import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [image1, image2] = text.split('|')
    
    if (!image1 || !image2) {
        return m.reply(`Format salah!\nContoh penggunaan:\n${usedPrefix}${command} link_gambar1|link_gambar2`)
    }
    
    if (!image1.startsWith('http') || !image2.startsWith('http')) {
        return m.reply('Kedua parameter harus berupa link (URL) gambar yang valid (dimulai dengan http/https)!')
    }
    
    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let url = `${global.web}/api/maker/beautifulmeme?apikey=${global.apikey.jereapi}&image1=${encodeURIComponent(image1.trim())}&image2=${encodeURIComponent(image2.trim())}`
        
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
handler.help = ['beautifulmeme']
handler.tags = ['maker']
handler.command = /^beautifulmeme$/i
handler.limit = true;handler.limit = 1;
export default handler
