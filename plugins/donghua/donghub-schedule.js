import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/donghua/donghub-schedule?apikey=${apiKey}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && json.result) {
            let schedule = json.result;
            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `📅 *${botName} - JADWAL RILIS DONGHUA*\n\n`;

            for (let day in schedule) {
                if (Array.isArray(schedule[day]) && schedule[day].length > 0) {
                    txt += `🗓️ *[ ${day.toUpperCase()} ]*\n`;
                    schedule[day].slice(0, 6).forEach((item) => {
                        txt += `• *${item.title}*\n  ⏰ ${item.releaseTime || '-'} | ${item.episode || '-'} | Slug: \`${item.slug}\`\n`;
                    });
                    txt += `\n`;
                }
            }

            txt += `💡 *Tips:* Ketik *${usedPrefix}donghub-detail <slug>* untuk melihat detail donghua.`;

            await m.reply(txt.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            m.reply(json.error || 'Gagal memuat jadwal rilis donghua.');
        }
    } catch (e) {
        console.error('[Donghub Schedule Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['donghub-schedule']
handler.tags = ['donghua']
handler.command = /^(donghub-schedule|donghubschedule|donghuaschedule|jadwaldonghua)$/i
handler.premium = false
handler.limit = 1;

export default handler;
