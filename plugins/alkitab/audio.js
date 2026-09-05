import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const cleanText = (text || '').trim();
    if (!cleanText) return m.reply(`⚠️ Masukkan nama kitab dan pasal!\n\nContoh: *${usedPrefix}${command} Yohanes 3*\nContoh: *${usedPrefix}${command} Kejadian 1*`);

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi;

        let match = cleanText.match(/^([1-3]?\s*[a-zA-Z\s-]+?)(?:\s+(\d+))?$/);
        let kitab = cleanText;
        let pasal = '1';

        if (match) {
            kitab = match[1].trim();
            pasal = match[2] ? match[2].trim() : '1';
        }

        let url = `${global.web}/api/alkitab/audio?apikey=${apiKey}&kitab=${encodeURIComponent(kitab)}&pasal=${encodeURIComponent(pasal)}`;
        let res = await fetch(url);
        let json = await res.json();

        if (json.status && (json.result || json.data || json.audio || json.audio_url)) {
            let resData = json.result || json.data || json;
            let audioUrl = (typeof resData === 'string' && resData.startsWith('http')) 
                ? resData 
                : (resData.audio_url || resData.audio || resData.audio_mp3 || resData.url || json.audio || json.audio_url);
            
            let ref = resData.ref || `${resData.kitab || kitab} Pasal ${resData.pasal || pasal}`;
            let perjanjian = resData.perjanjian || '';

            let card = `╭─「 🎧 *AUDIO ALKITAB (SABDA)* 」\n`;
            card += `├ 📖 *Kitab:* ${ref}\n`;
            if (perjanjian) card += `├ 📜 *Bagian:* ${perjanjian}\n`;
            card += `├ 🔗 *Link Audio:* ${audioUrl}\n`;
            card += `╰────────────────────\n\n`;
            card += `_Audio Alkitab Terjemahan Baru (TB) Sabda Bible._`;

            if (audioUrl && typeof audioUrl === 'string') {
                try {
                    await conn.sendFile(m.chat, audioUrl, `${kitab}_pasal_${pasal}.mp3`, card.trim(), m, null, { mimetype: 'audio/mp4' });
                } catch (e) {
                    await m.reply(card.trim());
                }
            } else {
                await m.reply(card.trim());
            }

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error(json.error || json.message || "Gagal mengambil audio Alkitab. Pastikan nama kitab dan nomor pasal benar.");
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ["audioalkitab <kitab> <pasal>"];
handler.tags = ["alkitab"];
handler.command = /^(audioalkitab|alkitabaudio|audio)$/i;

handler.limit = 1;
export default handler;
