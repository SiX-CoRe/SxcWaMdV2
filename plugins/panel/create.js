import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    let raw = (text || '').trim()
    let username = ''
    let password = ''
    let pkg = ''

    if (raw.includes(',') || raw.includes('|')) {
        let parts = raw.split(/[,|]/).map(v => v.trim())
        if (parts.length >= 3) {
            username = parts[0]
            password = parts[1]
            pkg = parts[2].toLowerCase()
        } else if (parts.length === 2) {
            username = parts[0]
            pkg = parts[1].toLowerCase()
        }
    } else if (args.length >= 3) {
        username = args[0]
        password = args[1]
        pkg = args[2].toLowerCase()
    } else if (args.length === 2) {
        username = args[0]
        pkg = args[1].toLowerCase()
    }

    const validPackages = ['1gb', '2gb', '3gb', '4gb', '5gb', '6gb', '7gb', '8gb', '9gb', '10gb', 'unli']

    if (!username || !pkg || !validPackages.includes(pkg)) {
        let txtHelp = `*🚀 PTERODACTYL PANEL CREATOR 🚀*\n\n`
        txtHelp += `📌 *Format Penggunaan:*\n`
        txtHelp += `• *${usedPrefix + command} <username> <password> <paket>*\n`
        txtHelp += `• *${usedPrefix + command} <username> <paket>* _(Password acak)_\n\n`
        txtHelp += `📦 *Pilihan Paket RAM:*\n`
        txtHelp += `> 1gb, 2gb, 3gb, 4gb, 5gb, 6gb, 7gb, 8gb, 9gb, 10gb, unli\n\n`
        txtHelp += `💡 *Contoh:*\n`
        txtHelp += `• *${usedPrefix + command} jerexd 123456 1gb*\n`
        txtHelp += `• *${usedPrefix + command} jerexd 123456 unli*\n`
        txtHelp += `• *${usedPrefix + command} jerexd unli*`
        return m.reply(txtHelp)
    }

    m.reply('⏳ *Sedang membuat server panel...* Mohon tunggu sebentar.')
    
    try {
        let apiKey = global.apikey?.jereapi
        let params = new URLSearchParams({
            apikey: apiKey,
            username: username,
            package: pkg
        })
        if (password) params.append('password', password)

        let url = `${global.web}/api/panel/create?${params.toString()}`
        let res = await fetch(url)
        let json = await res.json()

        if (json.status && json.data) {
            let d = json.data
            let cap = `╭───「 *🚀 PTERODACTYL PANEL CREATED* 」\n`
            cap += `│\n`
            cap += `│ 👤 *Username:* ${d.username}\n`
            cap += `│ 🔑 *Password:* ${d.password}\n`
            cap += `│ 🌐 *Login URL:* ${d.login_url}\n`
            cap += `│ 📦 *Paket:* ${d.package}\n`
            cap += `│ ⚡ *RAM:* ${d.ram}\n`
            cap += `│ 💾 *Disk:* ${d.disk}\n`
            cap += `│ 🖥️ *CPU:* ${d.cpu}\n`
            cap += `│ 🆔 *Server ID:* ${d.server_id}\n`
            cap += `╰───────────────────────────────\n\n`
            cap += `⚠️ *PENTING:*\n`
            cap += `_Simpan data akun di atas baik-baik. Jangan berikan password ke siapapun!_`

            await m.reply(cap.trim())
        } else {
            m.reply(`❌ *Gagal membuat panel!*\nAlasan: ${json.error || json.message || 'Server error atau kuota habis.'}`)
        }
    } catch (e) {
        console.error(e)
        m.reply(`❌ *Terjadi kesalahan pada server:*\n${e.message || e}`)
    }
}

handler.help = ['cpanel <user> <pw> <1gb-10gb/unli>', 'create <user> <pw> <paket>']
handler.tags = ['panel']
handler.command = /^(cpanel|createpanel|create|buatpanel|panel)$/i
handler.premium = true;

handler.limit = 1;
export default handler
