import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text && command !== 'moviebox_trending') return m.reply(`Format salah!\n\nContoh: *${usedPrefix}${command} query*`)
    
    m.reply('Sedang memproses... Mohon tunggu.')
    try {
        let [type, page, perPage] = (text || '').split('|');
        let url = `${global.web}/api/movie/moviebox_trending?apikey=${global.apikey.jereapi}&type=${encodeURIComponent(type || '')}&page=${encodeURIComponent(page || '')}&perPage=${encodeURIComponent(perPage || '')}`
        
        let res = await fetch(url)
        let json = await res.json()
        
        if (json.status && json.result) {
            let resData = json.result;
            
            if (typeof resData === 'string' && (resData.startsWith('http'))) {
                try {
                    await conn.sendFile(m.chat, resData, 'result', `*SXCWA-MD - MOVIE*`, m)
                } catch (e) {
                    m.reply(resData)
                }
            } 
            
            else if (resData.url || resData.image || resData.video) {
                let mediaUrl = resData.url || resData.image || resData.video;
                try {
                    await conn.sendFile(m.chat, mediaUrl, 'result', `*SXCWA-MD - MOVIE*`, m)
                } catch (e) {
                    m.reply(mediaUrl)
                }
            }
            
            else {
                let txt = `*SXCWA-MD - MOVIE*\n\n`;
                for (let k in resData) {
                    if (typeof resData[k] !== 'object' && typeof resData[k] !== 'function') {
                        txt += `*${k}:* ${resData[k]}\n`;
                    }
                }
                m.reply(txt.toLowerCase())
            }
        } else {
            m.reply('Gagal memproses data. Cek kembali parameter atau limit API.')
        }
    } catch (e) {
        m.reply('Terjadi kesalahan pada server.')
    }
}
handler.help = ['moviebox_trending']
handler.tags = ['movie']
handler.command = /^movieboxtrending$/i


handler.premium = true

handler.limit = 1;
export default handler
