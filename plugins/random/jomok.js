/*
* Gw LumnzTyz Ngasih Credits Thanks jarexd
***/
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi || global.apikey || "jerexd" 
        let web = global.web || 'https://api.jere.my.id'
        let url = `${web}/api/random/jomok?apikey=${apiKey}`
        
        let res = await fetch(url)
        let contentType = res.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            let json = await res.json();
            throw new Error(json.error || json.message || 'API Error');
        }
        
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            
        let buffer = await res.arrayBuffer()
        
        await conn.sendFile(m.chat, Buffer.from(buffer), 'jomok.jpg', `*🎭 RANDOM JOMOK*\n\n> Source: ${global.botname || 'SXCWAMD'}`, m)
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply('❌ Terjadi kesalahan: ' + (e.message || e))
    }
}
handler.help = ['jomok']
handler.tags = ['random']
handler.command = /^jomok$/i
handler.premium = true

handler.limit = 1;
export default handler
