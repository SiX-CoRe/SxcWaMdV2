import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`teks belum diisi\ncontoh: ${usedPrefix}${command} text|username|background(nomor 1-10)`)
    
    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        let [qtext, username, background] = text.split('|')
        if (!username) return m.reply(`username belum diisi\ncontoh: ${usedPrefix}${command} text|username`)
        
        let url = `${global.web}/api/maker/quoteanime?apikey=${(global.apikey.jereapi)}&text=${encodeURIComponent(qtext)}&username=${encodeURIComponent(username)}`
        
        if (background) {
            url += `&background=${encodeURIComponent(background)}`
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
handler.help = ['quoteanime']
handler.tags = ['maker']
handler.command = /^quoteanime$/i
handler.limit = true;handler.limit = 1;
export default handler
