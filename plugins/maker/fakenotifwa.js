import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [username, chat, tanggal, jam] = text.split('|')
    if (!username || !chat || !tanggal || !jam) return m.reply(`teks belum lengkap\ncontoh: ${usedPrefix}${command} username|chat|tanggal|jam`)
    
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let pp = ''
    
    if (/image/.test(mime)) {
        let media = await q.download()
        pp = await uploadImage(media)
    } else {
        try {
            let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
            let target = m.quoted ? m.quoted.sender : who
            let ppUrl = await conn.profilePictureUrl(target, 'image')
            let ppRes = await fetch(ppUrl)
            let ppBuffer = Buffer.from(await ppRes.arrayBuffer())
            pp = await uploadImage(ppBuffer)
        } catch {
            pp = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/avatar_contact.png'
        }
    }
    
    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiUrl = `${global.web}/api/maker/fakenotifwa?apikey=${global.apikey.jereapi}&username=${encodeURIComponent(username)}&chat=${encodeURIComponent(chat)}&tanggal=${encodeURIComponent(tanggal)}&jam=${encodeURIComponent(jam)}&pp=${encodeURIComponent(pp)}`
        
        let res = await fetch(apiUrl)
        let buffer = await res.arrayBuffer()
        
        if (res.headers.get('content-type')?.includes('application/json')) {
            let json = JSON.parse(Buffer.from(buffer).toString())
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            return m.reply(json.message || json.error || 'Gagal memproses data')
        }

        await conn.sendFile(m.chat, Buffer.from(buffer), 'result.png', `*SXCWA-MD - MAKER*`, m)
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply('gagal mengirim atau memproses medianya')
    }
}
handler.help = ['fakenotifwa']
handler.tags = ['maker']
handler.command = /^fakenotifwa$/i
handler.limit = true;handler.limit = 1;
export default handler
