import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`teks belum diisi\ncontoh: ${usedPrefix}${command} Rin|Katanya...`)
    if (!text.includes('|')) return m.reply(`format salah, gunakan pemisah |\ncontoh: ${usedPrefix}${command} Rin|Katanya...`)
    
    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let url = `${global.web}/api/maker/timpateks?apikey=${(global.apikey.jereapi)}&text=${encodeURIComponent(text)}`
        
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
handler.help = ['timpateks']
handler.tags = ['maker']
handler.command = /^timpateks$/i
handler.limit = true;handler.limit = 1;
export default handler
