import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`teks belum diisi\ncontoh: ${usedPrefix}${command} query`)
    
    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let url = `${global.web}/api/maker/kalender?apikey=${(global.apikey.jereapi)}&q=${encodeURIComponent(text)}`
        
        let res = await fetch(url)
        let buffer = await res.arrayBuffer()
        
        try {
            await conn.sendFile(m.chat, Buffer.from(buffer), 'result', `*SXCWA-MD - MAKER*`, m)
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
handler.help = ['kalender']
handler.tags = ['maker']
handler.command = /^kalender$/i
handler.limit = true;handler.limit = 1;
export default handler
