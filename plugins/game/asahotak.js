import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
    conn.game = conn.game ? conn.game : {};
    conn['${g.name}'] = conn['${g.name}'] ? conn['${g.name}'] : {};
    let id = m.chat;

    if (id in conn['${g.name}'] || id in conn.game) {
        conn.reply(m.chat, `⚠️ Masih ada game *${conn.game[id] || '${g.name}'}* yang belum terjawab di chat ini!\nSelesaikan atau ketik *nyerah* terlebih dahulu.`, conn['${g.name}']?.[id]?.[0] || m);
        throw false;
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi || global.apiKey;
        
        const response = await fetch(`${global.web}/api/game/${g.name}?apikey=${apiKey}`);
        const json = await response.json();
        
        if (!json.status || !json.result) throw new Error(json.error || json.message || "Gagal mengambil soal game dari server");

        let p = json.result;

        let soalText = p.soal || p.pertanyaan || p.str || p.deskripsi || p.caption || "Tebak jawaban dari petunjuk berikut:";
        let answerData = p.jawaban !== undefined ? p.jawaban : (p.result !== undefined ? p.result : (p.nama || p.name || p.title || ''));
        let clueText = p.bantuan || p.clue || p.tipe || '';
        let mediaUrl = p.img || p.image || p.gambar || p.link || p.audio || p.url || null;
        let isAudio = 'null' === 'audio' || (mediaUrl && (mediaUrl.endsWith('.mp3') || mediaUrl.endsWith('.opus') || mediaUrl.endsWith('.m4a')));

        let text = `🎮 *${'ASAH OTAK'}*\n\n`;
        text += `📝 *Soal:* ${soalText}\n`;
        if (clueText) text += `💡 *Petunjuk:* ${clueText}\n`;
        text += `\n⏰ *Waktu:* 60 detik\n`;
        text += `🎁 *Hadiah:* +500 XP & +10 Koin\n\n`;
        text += `Balas (reply) pesan ini untuk menjawab!\n`;
        text += `Ketik *nyerah* untuk menyerah.`;

        let msgOptions = { text: text.trim() };
        if (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.startsWith('http')) {
            if (isAudio) {
                msgOptions = { audio: { url: mediaUrl }, mimetype: 'audio/mp4', ptt: false, caption: text.trim() };
            } else {
                try {
                    let imgRes = await fetch(mediaUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
                    if (imgRes.ok) {
                        let buffer = await imgRes.arrayBuffer();
                        msgOptions = { image: Buffer.from(buffer), caption: text.trim() };
                    } else {
                        msgOptions = { image: { url: mediaUrl }, caption: text.trim() };
                    }
                } catch (err) {
                    msgOptions = { image: { url: mediaUrl }, caption: text.trim() };
                }
            }
        }

        conn.game[id] = '${g.name}';
        conn['${g.name}'][id] = [
            await conn.sendMessage(m.chat, msgOptions, { quoted: m }),
            json,
            setTimeout(() => {
                if (conn['${g.name}'] && conn['${g.name}'][id]) {
                    let ansDisplay = Array.isArray(answerData) ? answerData.join(' / ') : answerData;
                    conn.reply(m.chat, `⏳ *WAKTU HABIS!*\n\nJawabannya adalah: *${ansDisplay}*`, conn['${g.name}'][id][0]);
                    delete conn['${g.name}'][id];
                    if (conn.game) delete conn.game[id];
                }
            }, 60000),
            answerData
        ];
        
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        console.error('[Game ${g.name} Error]', e);
        m.reply("❌ Error: " + (e.message || "Gagal memulai game"));
    }
}

handler.help = ['${g.name}']
handler.tags = ['game']
handler.command = /^${g.name}$/i
handler.limit = 1;

export default handler;
