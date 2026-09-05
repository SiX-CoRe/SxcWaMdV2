import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🔊 *TEXT TO SPEECH (VOISER AI)*\n\nContoh:\n${usedPrefix + command} Halo selamat pagi dunia\n${usedPrefix + command} Ardi|Halo apa kabar? (Pilihan suara: Gadis, Ardi, Siti, Dimas, Tuti, Jajang)`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let model = 'Gadis';
        let voiceText = text;

        if (text.includes('|')) {
            let parts = text.split('|');
            model = parts[0].trim();
            voiceText = parts.slice(1).join('|').trim();
        }

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/tts?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: voiceText, model: model })
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || "Gagal membuat audio Text-to-Speech.");

        let audioUrl = json.result?.audio_url;
        if (!audioUrl) throw new Error("Audio URL tidak ditemukan.");

        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *TTS Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['tts <teks>', 'voiser <model>|<teks>'];
handler.tags = ['tools'];
handler.command = /^(tts|text2speech|voiser|gtts)$/i;

handler.limit = 1;
export default handler;
