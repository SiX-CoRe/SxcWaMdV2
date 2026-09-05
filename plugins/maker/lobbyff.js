import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
            return m.reply("❌ API Key belum dikonfigurasi di config.js!");
        }

        if (!text) {
            return m.reply(`🎮 *Fake Lobby Free Fire*\n\nCara penggunaan:\n${usedPrefix + command} <nama>\n\nContoh:\n${usedPrefix + command} MincuKacung`);
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const apiUrl = `${global.web}/api/maker/fakelobbyff?apikey=${global.apikey.jereapi}&nama=${encodeURIComponent(text.trim())}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            let errJson = await response.json().catch(() => ({}));
            throw new Error(errJson.error || errJson.message || `Status HTTP ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        if (response.headers.get('content-type')?.includes('application/json')) {
            let errJson = JSON.parse(Buffer.from(buffer).toString());
            throw new Error(errJson.error || errJson.message || 'Gagal membuat fake lobby');
        }

        await conn.sendFile(m.chat, Buffer.from(buffer), 'lobbyff.jpg', `🎮 *Fake Lobby Free Fire*\n\n👤 Nama: ${text}\n✨ Request by: ${m.pushName || 'User'}`, m);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('LobbyFF Error:', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ Gagal membuat fake lobby: ${e.message || e}`);
    }
};

handler.help = ['lobbyff <nama>'];
handler.tags = ['maker'];
handler.command = /^(lobbyff)$/i;
handler.limit = true;
export default handler;