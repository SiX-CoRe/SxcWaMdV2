import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`teks belum diisi\ncontoh: ${usedPrefix}${command} nama | lobby`)
    
    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let [nama, lobby] = text.split('|').map(v => v.trim())
        if (!nama) return m.reply(`nama wajib diisi\ncontoh: ${usedPrefix}${command} nama | 5`)

        let url = `${global.web}/api/maker/fakelobbyff?apikey=${global.apikey.jereapi}&nama=${encodeURIComponent(nama)}`
        if (lobby) url += `&lobby=${encodeURIComponent(lobby)}`
        
        let res = await fetch(url)
        if (!res.ok) throw new Error('API error')
        
        let buffer = await res.arrayBuffer()
        
        await conn.sendFile(m.chat, Buffer.from(buffer), 'result.jpg', `*SXCWA-MD - MAKER*`, m)
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply('server sedang error, coba lagi nanti')
    }
}
handler.help = ['fakelobbyff <nama>|<lobby>']
handler.tags = ['maker']
handler.command = /^fakelobbyff$/i
handler.limit = true;handler.limit = 1;
export default handler
