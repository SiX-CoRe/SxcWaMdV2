import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://www.npmjs.com/package/axios*`)
    
    await m.react('⏳').catch(() => {})
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/downloader/npm?apikey=${apiKey}&url=${encodeURIComponent(text.trim())}&output_type=json`
        let res = await fetch(url)
        let json = await res.json()
        
        if (!json.status) throw new Error(json.error || json.detail || 'Gagal mengambil data paket NPM')
        
        let pkgName = json.name || json.data?.name || 'package'
        let pkgVersion = json.version || json.data?.version || 'latest'
        let tarballUrl = json.tarball || json.data?.tarball_url || json.data?.tarball || json.tarball_url
        
        if (!tarballUrl) throw new Error('URL tarball package tidak ditemukan')
        
        let fileName = json.file_name || `${pkgName}-${pkgVersion}.tgz`
        let caption = `📦 *${global.botname || 'BOT'} - NPM PACKAGE DOWNLOADER*` + '\n\n' +
            `📦 *Paket:* ${pkgName}` + '\n' +
            `🏷️ *Versi:* ${pkgVersion}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`
        
        await conn.sendMessage(m.chat, {
            document: { url: tarballUrl },
            fileName: fileName,
            mimetype: 'application/gzip',
            caption: caption
        }, { quoted: m })
        
        await m.react('✅').catch(() => {})
    } catch (e) {
        await m.react('❌').catch(() => {})
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`)
    }
}
handler.help = ['npmdl <url>']
handler.tags = ['downloader']
handler.command = /^(npmdl|npmdownloader)$/i

handler.limit = true

export default handler
