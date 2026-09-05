import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [nama, tentang, telepon] = text.split('|')
    if (!nama || !tentang || !telepon) return m.reply(`teks belum lengkap\ncontoh: ${usedPrefix}${command} nama|tentang|telepon`)
    
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
            // Download PP via bot (has WA auth) then reupload to public CDN
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
        let apiUrl = `${global.web}/api/maker/fakewa?apikey=${global.apikey.jereapi}&nama=${encodeURIComponent(nama)}&tentang=${encodeURIComponent(tentang)}&telepon=${encodeURIComponent(telepon)}&pp=${encodeURIComponent(pp)}`
        
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
handler.help = ['fakewa']
handler.tags = ['maker']
handler.command = /^fakewa$/i
handler.limit = true;handler.limit = 1;
export default handler
