import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/donghua/donghub-genres?apikey=${apiKey}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && json.result) {
            let list = json.result;
            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `🐉 *${botName} - DAFTAR GENRE DONGHUA*\n\n`;
            txt += `Berikut seluruh genre donghua yang tersedia:\n\n`;

            list.forEach((g, idx) => {
                txt += `• *${g.name || g.slug}* (Slug: \`${g.slug}\`)\n`;
            });

            txt += `\n💡 *Tips:* Ketik *${usedPrefix}donghub-genre <slug>* untuk melihat donghua pada genre tersebut.`;

            await m.reply(txt.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            m.reply(json.error || 'Gagal memuat daftar genre donghua.');
        }
    } catch (e) {
        console.error('[Donghub Genres Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['donghub-genres']
handler.tags = ['donghua']
handler.command = /^(donghub-genres|donghubgenres|donghuagenres|listgenredonghua)$/i
handler.premium = false
handler.limit = 1;

export default handler;
