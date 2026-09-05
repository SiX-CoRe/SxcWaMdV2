import fetch from 'node-fetch'
import dgram from 'dgram'

function querySampServer(ip, port, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4')
        const startTime = Date.now()
        const ipParts = ip.split('.').map(Number)
        
        // Packet: 'SAMP' (4 bytes) + IP (4 bytes) + Port (2 bytes LE) + Opcode 'i' (1 byte)
        const packet = Buffer.alloc(11)
        packet.write('SAMP', 0, 4)
        packet[4] = ipParts[0]
        packet[5] = ipParts[1]
        packet[6] = ipParts[2]
        packet[7] = ipParts[3]
        packet.writeUInt16LE(port, 8)
        packet[10] = 0x69 // 'i' for info

        const timer = setTimeout(() => {
            try { socket.close() } catch (e) {}
            reject(new Error('Server Offline / Request Timeout'))
        }, timeout)

        socket.on('message', (msg) => {
            const ping = Date.now() - startTime
            clearTimeout(timer)
            try {
                if (msg.length < 11) throw new Error('Format paket respon tidak valid')
                let offset = 11
                const password = msg.readUInt8(offset); offset += 1
                const players = msg.readUInt16LE(offset); offset += 2
                const maxplayers = msg.readUInt16LE(offset); offset += 2
                
                const hostLen = msg.readUInt32LE(offset); offset += 4
                const hostname = msg.toString('utf-8', offset, offset + hostLen); offset += hostLen

                const gamemodeLen = msg.readUInt32LE(offset); offset += 4
                const gamemode = msg.toString('utf-8', offset, offset + gamemodeLen); offset += gamemodeLen

                const mapLen = msg.readUInt32LE(offset); offset += 4
                const mapname = msg.toString('utf-8', offset, offset + mapLen); offset += mapLen

                try { socket.close() } catch (e) {}
                resolve({
                    status: true,
                    ip,
                    port,
                    hostname,
                    players,
                    maxplayers,
                    gamemode,
                    mapname,
                    password: password === 1,
                    ping: `${ping} ms`
                })
            } catch (err) {
                try { socket.close() } catch (e) {}
                reject(err)
            }
        })

        socket.on('error', (err) => {
            clearTimeout(timer)
            try { socket.close() } catch (e) {}
            reject(err)
        })

        socket.send(packet, 0, packet.length, port, ip, (err) => {
            if (err) {
                clearTimeout(timer)
                try { socket.close() } catch (e) {}
                reject(err)
            }
        })
    })
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    // Check if user input is an IP or IP:PORT (e.g. 104.234.180.158:7777 or 104.234.180.158 7777)
    let ipMatch = (text || '').trim().match(/^([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})(?::|\s+)?([0-9]{1,5})?$/)
    
    if (ipMatch) {
        let targetIp = ipMatch[1]
        let targetPort = parseInt(ipMatch[2]) || 7777
        try {
            let res = await querySampServer(targetIp, targetPort)
            let txt = `🎮 *SA-MP SERVER STATUS*\n\n`
            txt += `• *Nama Server:* ${res.hostname}\n`
            txt += `• *IP Address:* ${res.ip}:${res.port}\n`
            txt += `• *Players Online:* ${res.players} / ${res.maxplayers}\n`
            txt += `• *Gamemode:* ${res.gamemode}\n`
            txt += `• *Map / Bahasa:* ${res.mapname}\n`
            txt += `• *Password:* ${res.password ? 'Ya (Private)' : 'Tidak (Publik)'}\n`
            txt += `• *Ping Latency:* ${res.ping}\n`

            await conn.sendMessage(m.chat, { text: txt.trim() }, { quoted: m })
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
            return
        } catch (err) {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            return m.reply(`❌ Gagal mengambil status server ${targetIp}:${targetPort} (${err.message})`)
        }
    }

    // Otherwise, fetch popular server list from JereAPI
    let limit = parseInt(text) || 10
    try {
        let apiKey = global.apikey?.jereapi
        let url = `${global.web}/api/samp/listserver?apikey=${apiKey}&limit=${limit}`
        let res = await fetch(url)
        let json = await res.json()
        
        if (json.status && json.data) {
            let resData = json.data
            if (Array.isArray(resData)) {
                if (resData.length === 0) return m.reply('❌ Tidak ada server SA-MP ditemukan.')
                let txt = `🎮 *SA-MP INDONESIA SERVER LIST*\n\n`
                resData.forEach((v, i) => {
                    txt += `${i + 1}. *${v.hostname || '-' }*\n`
                    txt += `   • Players: ${v.players_online || 0} / ${v.players_max || 0}\n`
                    txt += `   • IP: ${v.ip || '-'}:${v.port || 7777}\n`
                    txt += `   • Gamemode: ${v.gamemode || '-'}\n`
                    if (v.website && v.website !== '-') txt += `   • Web: ${v.website}\n`
                    txt += `\n`
                })
                txt += `_Gunakan *${usedPrefix + command} <ip:port>* untuk cek ping & realtime status server spesifik._`
                await conn.sendMessage(m.chat, { text: txt.trim() }, { quoted: m })
                await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
            } else {
                let txt = `🎮 *SA-MP SERVER DATA*\n\n`
                for (let k in resData) {
                    if (typeof resData[k] !== 'object' && typeof resData[k] !== 'function') {
                        txt += `• *${k}:* ${resData[k]}\n`
                    }
                }
                await conn.sendMessage(m.chat, { text: txt.trim() }, { quoted: m })
                await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
            }
        } else {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            m.reply('❌ Gagal memproses data server SA-MP: ' + (json.error || json.message || 'unknown error'))
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        console.error(e)
        m.reply('❌ Terjadi kesalahan pada server: ' + e.message)
    }
}

handler.help = ['listserver [limit]', 'samp [ip:port]']
handler.tags = ['samp']
handler.command = /^(listserver|samp|sampstatus|sampinfo)$/i

handler.limit = 1;
export default handler
