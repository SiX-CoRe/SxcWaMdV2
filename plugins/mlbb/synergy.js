import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`📌 *Format Penggunaan:*\n${usedPrefix + command} <nama_hero>\n\n*Contoh:*\n${usedPrefix + command} angela\n${usedPrefix + command} johnson,odette`);
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/mlbb/synergy?apikey=${apiKey}&allies=${encodeURIComponent(text || '')}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;
            const botName = (global.botname || 'BOT').toUpperCase();
            
            if (Array.isArray(resData)) {
                let txt = `⚡ *${botName} - MLBB HERO SYNERGY & COMBO*\n\n*Hero Tim Anda:* ${text}\n\n*Rekomendasi Partner Combo Terbaik:*\n\n`;
                resData.slice(0, 10).forEach((h, i) => {
                    txt += `${i + 1}. *${h.hero_name || h.name || '-'}*\n`;
                    if (h.roles) txt += `   • Role: ${Array.isArray(h.roles) ? h.roles.join(', ') : h.roles}\n`;
                    if (h.synergy_score || h.score) txt += `   • Sinergi: ${h.synergy_score || h.score}%\n`;
                    if (h.combo_guide || h.guide) txt += `   • Tips Combo: ${h.combo_guide || h.guide}\n`;
                    txt += `\n`;
                });
                await conn.sendMessage(m.chat, { text: txt.trim() }, { quoted: m });
            } else {
                let txt = `⚡ *${botName} - MLBB HERO SYNERGY*\n\n`;
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
            m.reply('❌ Gagal memproses data synergy: ' + (json.error || json.message || 'unknown error'));
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply('❌ Terjadi kesalahan pada server: ' + e.message);
    }
}
handler.help = ['synergy <hero>']
handler.tags = ['mlbb']
handler.command = /^(synergy|syn|mlsynergy|combo)$/i
handler.limit = 1;

export default handler;
