import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [nama, durasi] = text.split('|')
    if (!nama || !durasi) return m.reply(`teks belum lengkap\ncontoh: ${usedPrefix}${command} nama|01:23:45`)
    
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let url = ''
    
    if (/image/.test(mime)) {
        let media = await q.download()
        url = await uploadImage(media)
    } else {
        try {
            let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
            let target = m.quoted ? m.quoted.sender : who
            let ppUrl = await conn.profilePictureUrl(target, 'image')
            let ppRes = await fetch(ppUrl)
            let ppBuffer = Buffer.from(await ppRes.arrayBuffer())
            url = await uploadImage(ppBuffer)
        } catch {
            url = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/avatar_contact.png'
        }
    }
    
    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiUrl = `${global.web}/api/maker/fakecallios?apikey=${global.apikey.jereapi}&nama=${encodeURIComponent(nama)}&durasi=${encodeURIComponent(durasi)}`
        if (url) apiUrl += `&url=${encodeURIComponent(url)}`
        
        let res = await fetch(apiUrl)
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
handler.help = ['fakecallios']
handler.tags = ['maker']
handler.command = /^fakecallios$/i
handler.limit = true;handler.limit = 1;
export default handler
