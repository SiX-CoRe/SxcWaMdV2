import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi;

        const cleanText = (text || '').trim();

        // If no input, fetch Bible book list
        if (!cleanText) {
            let url = `${global.web}/api/alkitab/alkitab?apikey=${apiKey}`;
            let res = await fetch(url);
            let json = await res.json();

            if (json.status && (json.result || json.data)) {
                let resData = json.result || json.data;
                if (Array.isArray(resData)) {
                    let oldTestament = resData.filter(b => b.perjanjian === 'Perjanjian Lama' || b.nomor <= 39);
                    let newTestament = resData.filter(b => b.perjanjian === 'Perjanjian Baru' || b.nomor > 39);

                    let card = `╭─「 ✝️ *DAFTAR KITAB ALKITAB* 」\n`;
                    card += `├ 📜 *Total Kitab:* ${resData.length}\n`;
                    card += `├ 💡 *Gunakan:* \`${usedPrefix + command} <kitab> <pasal> [ayat]\`\n`;
                    card += `├ 💡 *Contoh:* \`${usedPrefix + command} Yohanes 3 16\`\n`;
                    card += `├ 💡 *Contoh:* \`${usedPrefix + command} Kejadian 1\`\n`;
                    card += `╰────────────────────\n\n`;

                    card += `📖 *PERJANJIAN LAMA (${oldTestament.length} Kitab):*\n`;
                    for (let b of oldTestament.slice(0, 15)) {
                        card += `• ${b.nama || b.name} (${b.singkatan || b.abbr || '-'}) — ${b.total_pasal || b.chapter} Pasal\n`;
                    }
                    if (oldTestament.length > 15) card += `_...dan ${oldTestament.length - 15} kitab PL lainnya._\n`;

                    card += `\n✝️ *PERJANJIAN BARU (${newTestament.length} Kitab):*\n`;
                    for (let b of newTestament.slice(0, 15)) {
                        card += `• ${b.nama || b.name} (${b.singkatan || b.abbr || '-'}) — ${b.total_pasal || b.chapter} Pasal\n`;
                    }
                    if (newTestament.length > 15) card += `_...dan ${newTestament.length - 15} kitab PB lainnya._\n`;

                    await m.reply(card.trim());
                    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                    return;
                }
            }
            throw new Error(`Masukkan nama kitab dan pasal!\nContoh: *${usedPrefix + command} Yohanes 3 16*`);
        }

        // Support formats: "Yohanes 3:16", "Yohanes 3 16", "1 Korintus 13:4", "Kejadian 1"
        let match = cleanText.match(/^([1-3]?\s*[a-zA-Z\s-]+?)(?:\s+(\d+)(?:[:\s]+(\d+))?)?$/);
        let kitab = cleanText;
        let pasal = '';
        let ayat = '';

        if (match && match[2]) {
            kitab = match[1].trim();
            pasal = match[2].trim();
            ayat = match[3] ? match[3].trim() : '';
        }

        let url = `${global.web}/api/alkitab/alkitab?apikey=${apiKey}&kitab=${encodeURIComponent(kitab)}&pasal=${encodeURIComponent(pasal)}&ayat=${encodeURIComponent(ayat)}`;
        let res = await fetch(url);
        let json = await res.json();

        if (!json.status || (!json.result && !json.data)) {
            throw new Error(json.error || json.message || "Data Alkitab tidak ditemukan. Pastikan nama kitab dan nomor pasal benar.");
        }

        let resData = json.result || json.data;

        if (Array.isArray(resData)) {
            let card = `╭─「 ✝️ *DAFTAR KITAB* 」\n╰────────────────────\n\n`;
            for (let item of resData.slice(0, 30)) {
                let name = item.nama || item.name || '';
                let abbr = item.singkatan || item.abbr ? ` (${item.singkatan || item.abbr})` : '';
                let ch = item.total_pasal || item.chapter ? ` - ${item.total_pasal || item.chapter} Pasal` : '';
                card += `• *${name}*${abbr}${ch}\n`;
            }
            await m.reply(card.trim());
        } else if (typeof resData === 'object' && resData !== null) {
            let title = resData.ref || `${resData.kitab || kitab} ${resData.pasal || pasal}${ayat ? ':' + ayat : ''}`;
            let card = `╭─「 ✝️ *ALKITAB (BIBEL)* 」\n`;
            card += `├ 📖 *Referensi:* ${title}\n`;
            if (resData.perjanjian) card += `├ 📜 *Bagian:* ${resData.perjanjian}\n`;
            if (resData.total_ayat) card += `├ 🔢 *Total Ayat:* ${resData.total_ayat}\n`;
            card += `╰────────────────────\n\n`;

            if (Array.isArray(resData.verses) && resData.verses.length > 0) {
                if (ayat) {
                    let v = resData.verses.find(x => String(x.verse) === String(ayat)) || resData.verses[0];
                    card += `*Ayat ${v.verse}:*\n"${v.content}"\n`;
                } else {
                    for (let v of resData.verses) {
                        if (v.type === 'content' || v.verse) {
                            card += `*${v.verse}.* ${v.content}\n\n`;
                        }
                    }
                }
            } else if (resData.full_text) {
                card += `"${resData.full_text}"\n`;
            }

            let audioMp3 = resData.audio_mp3 || resData.audio_url || resData.audio;
            if (audioMp3 && typeof audioMp3 === 'string') {
                card += `\n🎧 *Audio Sabda MP3:* ${audioMp3}`;
            }
            if (resData.audio_tts && typeof resData.audio_tts === 'string') {
                card += `\n🔊 *Audio Narasi:* ${resData.audio_tts}`;
            }

            await m.reply(card.trim());
        } else {
            await m.reply(String(resData));
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ["alkitab", "alkitab <kitab> <pasal>", "alkitab <kitab> <pasal> <ayat>"];
handler.tags = ["alkitab"];
handler.command = /^alkitab$/i;

handler.limit = 1;
export default handler;
