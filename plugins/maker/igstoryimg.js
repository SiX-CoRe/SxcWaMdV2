import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!mime) return m.reply(`balas gambar pake perintah *${usedPrefix}${command} username|caption|like|timeStr*`)
    if (!/image/.test(mime)) return m.reply(`Tipe media tidak didukung!`)

    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let media = await q.download()
        let photo = await uploadImage(media)
        let pp = ''
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
        
        let [username, caption, like, timeStr] = text ? text.split('|') : []
        
        let url = new URL(`${global.web}/api/maker/igstoryimg`)
        url.searchParams.append('apikey', global.apikey.jereapi)
        url.searchParams.append('photo', photo)
        url.searchParams.append('pp', pp)
        if (username) url.searchParams.append('username', username)
        if (caption) url.searchParams.append('caption', caption)
        if (like) url.searchParams.append('like', like)
        if (timeStr) url.searchParams.append('timeStr', timeStr)
        
        let res = await fetch(url.toString())
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
handler.help = ['igstoryimg']
handler.tags = ['maker']
handler.command = /^igstoryimg$/i
handler.limit = true;handler.limit = 1;
export default handler
