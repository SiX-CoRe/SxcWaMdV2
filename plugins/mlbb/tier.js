import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/mlbb/tier?apikey=${apiKey}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;
            const botName = (global.botname || 'BOT').toUpperCase();
            
            if (Array.isArray(resData)) {
                let list = resData;
                let filterText = (text || '').toLowerCase().trim();
                if (filterText) {
                    list = list.filter(h => 
                        (h.hero_name && h.hero_name.toLowerCase().includes(filterText)) ||
                        (Array.isArray(h.roles) ? h.roles.some(r => r.toLowerCase().includes(filterText)) : String(h.roles || '').toLowerCase().includes(filterText)) ||
                        (Array.isArray(h.lanes) ? h.lanes.some(l => l.toLowerCase().includes(filterText)) : String(h.lanes || '').toLowerCase().includes(filterText))
                    );
                }

                if (list.length === 0) {
                    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                    return m.reply(`Hero atau role "${text}" tidak ditemukan dalam tier list.`);
                }

                let txt = `🏆 *${botName} - MLBB HERO TIERS (META TERKINI)*\n\n`;
                if (filterText) txt += `🔍 Filter Pencarian: *${text}*\n\n`;
                list.slice(0, 30).forEach((h, i) => {
                    let roles = Array.isArray(h.roles) ? h.roles.join(', ') : (h.roles || '-');
                    let lanes = Array.isArray(h.lanes) ? h.lanes.join(', ') : (h.lanes || '-');
                    txt += `${i + 1}. *${h.hero_name || '-'}*\n   • Role: ${roles} | Lane: ${lanes}\n`;
                });
                if (list.length > 30) {
                    txt += `\n_...dan ${list.length - 30} hero lainnya. Gunakan filter untuk hasil lebih spesifik._`;
                }
                await conn.sendMessage(m.chat, { text: txt.trim() }, { quoted: m });
            } else {
                let txt = `🏆 *${botName} - MLBB HERO TIERS*\n\n`;
                for (let k in resData) {
                    if (typeof resData[k] !== 'function') {
                        let val = resData[k];
                        if (typeof val === 'object' && val !== null) {
                            val = Array.isArray(val) ? val.join(', ') : JSON.stringify(val);
                        }
                        txt += `• *${k}:* ${val}\n`;
                    }
                }
                await conn.sendMessage(m.chat, { text: txt.trim() }, { quoted: m });
            }
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply('❌ Gagal memproses data tier MLBB: ' + (json.error || json.message || 'unknown error'));
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply('❌ Terjadi kesalahan pada server: ' + e.message);
    }
}
handler.help = ['tier [hero]']
handler.tags = ['mlbb']
handler.command = /^(tier|mltier|herotier)$/i
handler.limit = 1;

export default handler;
