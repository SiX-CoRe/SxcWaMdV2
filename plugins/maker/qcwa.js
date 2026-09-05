import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`teksnya belum diisi\ncontoh: ${usedPrefix}${command} halo`)
    
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let pp
    try {
        let ppUrl = await conn.profilePictureUrl(who, 'image')
        let ppRes = await fetch(ppUrl)
        let ppBuffer = Buffer.from(await ppRes.arrayBuffer())
        pp = await uploadImage(ppBuffer)
    } catch {
        pp = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/avatar_contact.png'
    }
    
    let name = await conn.getName(who)
    let phoneNum = '+' + who.split('@')[0].replace(/[^0-9]/g, '')

    m.reply('mohon tunggu sebentar, sedang diproses')
    try {
        let url = `${global.web}/api/maker/qcwa?apikey=${global.apikey.jereapi}&text=${encodeURIComponent(text)}&username=${encodeURIComponent(name)}&pp=${encodeURIComponent(pp)}&phone=${encodeURIComponent(phoneNum)}`
        let res = await fetch(url)
        let buffer = await res.arrayBuffer()
        await conn.sendFile(m.chat, Buffer.from(buffer), 'qcwa.png', '*SXCWA-MD - MAKER*', m)
    } catch (e) {
        m.reply('server sedang error, coba lagi nanti')
    }
}
handler.help = ['qcwa']
handler.tags = ['maker']
handler.command = /^qcwa$/i
handler.limit = 1;
export default handler
