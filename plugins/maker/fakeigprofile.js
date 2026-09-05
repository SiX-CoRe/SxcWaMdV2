import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`teks belum diisi\ncontoh: ${usedPrefix}${command} username|bio|pengikut|mengikuti|postingan`)
    let [username, bio, pengikut, mengikuti, postingan] = text.split('|')
    if (!username || !bio || !pengikut || !mengikuti || !postingan) return m.reply(`Format salah!\nContoh: ${usedPrefix}${command} username|bio|pengikut|mengikuti|postingan`)
    
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
        
        let url = new URL(`${global.web}/api/maker/fakeigprofile`)
        url.searchParams.append('apikey', global.apikey.jereapi)
        url.searchParams.append('pp', pp)
        url.searchParams.append('username', username)
        url.searchParams.append('bio', bio)
        url.searchParams.append('pengikut', pengikut)
        url.searchParams.append('mengikuti', mengikuti)
        url.searchParams.append('postingan', postingan)
        
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
handler.help = ['fakeigprofile']
handler.tags = ['maker']
handler.command = /^fakeigprofile$/i
handler.limit = true;handler.limit = 1;
export default handler
