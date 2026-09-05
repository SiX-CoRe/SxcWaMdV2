import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args, text }) => {
    try {
        const input = (text || args.join(' ')).trim();
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let apiKey = global.apikey?.jereapi || global.apiKey;

        // If no argument, show list of Surahs
        if (!input) {
            const response = await fetch(`${global.web}/api/islami/quran?apikey=${apiKey}`);
            const json = await response.json();

            if (!json.status || !json.data) throw new Error(json.error || json.message || "Gagal memuat daftar surah");

            let resData = json.data;
            let card = `╭─「 📖 *AL-QUR'ANUL KARIM* 」\n`;
            card += `├ 📜 *Total Surah:* ${resData.length}\n`;
            card += `├ 💡 *Gunakan:* \`${usedPrefix + command} <nomor/nama surah>\`\n`;
            card += `├ 💡 *Contoh:* \`${usedPrefix + command} 1\` atau \`${usedPrefix + command} Al-Fatihah\`\n`;
            card += `├ 💡 *Ayat spesifik:* \`${usedPrefix + command} 2 255\` atau \`${usedPrefix + command} Al-Baqarah 255\`\n`;
            card += `╰────────────────────\n\n`;
            card += `📋 *DAFTAR SURAH:*\n`;

            for (let i = 0; i < Math.min(resData.length, 30); i++) {
                let s = resData[i];
                if (typeof s === 'object' && s !== null) {
                    card += `• *${s.nomor}. ${s.namaLatin}* (${s.nama}) — _${s.arti}_ (${s.jumlahAyat} Ayat)\n`;
                }
            }
            if (resData.length > 30) {
                card += `\n_...dan ${resData.length - 30} surah lainnya. Ketik nama/nomor surah untuk melihat detail._`;
            }

            await m.reply(card.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            return;
        }

        // Parse surah and optional specific ayat (e.g., "1 2", "al baqarah 255", "2:255", "al-baqarah:255")
        let targetSurah = input;
        let targetAyat = null;

        const colonMatch = input.match(/^(.*?):(\d+)$/);
        const spaceMatch = input.match(/^(.*?)\s+(\d+)$/);

        if (colonMatch) {
            targetSurah = colonMatch[1].trim();
            targetAyat = parseInt(colonMatch[2]);
        } else if (spaceMatch && isNaN(spaceMatch[1])) {
            targetSurah = spaceMatch[1].trim();
            targetAyat = parseInt(spaceMatch[2]);
        } else if (spaceMatch && !isNaN(spaceMatch[1])) {
            targetSurah = spaceMatch[1].trim();
            targetAyat = parseInt(spaceMatch[2]);
        }

        const response = await fetch(`${global.web}/api/islami/quran?apikey=${apiKey}&surah=${encodeURIComponent(targetSurah)}`);
        const json = await response.json();

        if (!json.status || !json.data) {
            throw new Error(json.error || json.message || `Surah "${targetSurah}" tidak ditemukan.`);
        }

        let resData = json.data;

        // If returned data is surah detail object
        if (typeof resData === 'object' && resData !== null && !Array.isArray(resData)) {
            let card = `╭─「 📖 *AL-QUR'ANUL KARIM* 」\n`;
            card += `├ 🏷️ *Surah:* ${resData.namaLatin || ''} (${resData.nama || ''})\n`;
            card += `├ 🔢 *Nomor:* ${resData.nomor || '-'}\n`;
            card += `├ 📜 *Arti:* ${resData.arti || '-'}\n`;
            card += `├ 📍 *Golongan:* ${resData.tempatTurun || '-'}\n`;
            card += `├ 🔢 *Jumlah Ayat:* ${resData.jumlahAyat || '-'}\n`;
            card += `╰────────────────────\n\n`;

            if (Array.isArray(resData.ayat) && resData.ayat.length > 0) {
                // Specific verse requested
                if (targetAyat) {
                    let matchedAyat = resData.ayat.find(a => a.nomorAyat === targetAyat);
                    if (matchedAyat) {
                        card += `۞ *Ayat ${matchedAyat.nomorAyat}*\n\n`;
                        card += `${matchedAyat.teksArab}\n\n`;
                        card += `_« ${matchedAyat.teksLatin} »_\n\n`;
                        card += `📌 *Artinya:*\n"${matchedAyat.teksIndonesia}"\n`;

                        let verseAudio = (matchedAyat.audio && typeof matchedAyat.audio === 'object')
                            ? Object.values(matchedAyat.audio).find(v => typeof v === 'string' && v.startsWith('http'))
                            : (typeof matchedAyat.audio === 'string' ? matchedAyat.audio : '');
                        
                        if (verseAudio) {
                            card += `\n🎧 *Audio Ayat:* ${verseAudio}\n`;
                        }
                    } else {
                        card += `⚠️ *Ayat ${targetAyat} tidak ditemukan.* Surah ini hanya memiliki ${resData.jumlahAyat} ayat.\n\n`;
                    }
                } else {
                    // Show first few verses (up to 7)
                    let limit = Math.min(resData.ayat.length, 7);
                    for (let i = 0; i < limit; i++) {
                        let ayat = resData.ayat[i];
                        card += `۞ *Ayat ${ayat.nomorAyat || i + 1}*\n`;
                        card += `${ayat.teksArab || ''}\n\n`;
                        card += `_« ${ayat.teksLatin || ''} »_\n\n`;
                        card += `📌 *Artinya:*\n"${ayat.teksIndonesia || ''}"\n\n`;
                        card += `──────────────\n\n`;
                    }

                    if (resData.ayat.length > limit) {
                        card += `_(Menampilkan ${limit} dari ${resData.jumlahAyat} ayat)_\n`;
                        card += `💡 *Untuk melihat ayat spesifik:* \`${usedPrefix + command} ${resData.nomor} <nomor_ayat>\`\n`;
                        card += `Contoh: \`${usedPrefix + command} ${resData.nomor} 10\`\n`;
                    }
                }
            }

            let audioUrl = '';
            if (resData.audioFull && typeof resData.audioFull === 'object') {
                audioUrl = resData.audioFull["05"] || resData.audioFull["01"] || resData.audioFull["02"] || Object.values(resData.audioFull).find(v => typeof v === 'string' && v.startsWith('http')) || '';
            } else if (typeof resData.audioFull === 'string') {
                audioUrl = resData.audioFull;
            }

            if (audioUrl) {
                card += `\n🎧 *Murottal Full Surah:* ${audioUrl}`;
            }

            await m.reply(card.trim());
        } else if (Array.isArray(resData)) {
            let card = `╭─「 📖 *DAFTAR SURAH* 」\n`;
            card += `├ Total: ${resData.length} Surah\n╰────────────────────\n\n`;
            for (let s of resData.slice(0, 30)) {
                card += `• *${s.nomor}. ${s.namaLatin}* (${s.nama}) — ${s.jumlahAyat} Ayat\n`;
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

handler.help = ["quran", "quran <surah>", "quran <surah> <ayat>"];
handler.command = ["quran", "alquran", "surah"];
handler.tags = ["islami"];
handler.limit = 1;

export default handler;
