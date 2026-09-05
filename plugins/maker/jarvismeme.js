import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    try {
        let text = args.join(' ');
        if (!text) return m.reply(`⚠️ Masukkan teks untuk meme Jarvis!\nContoh: ${usedPrefix + command} Jarvis, hapus sejarah internet saya`);

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const apiUrl = `${global.web}/api/maker/jarvismeme?apikey=${global.apikey.jereapi}&text=${encodeURIComponent(text)}`;

        let res = await fetch(apiUrl);
        if (!res.ok) {
            let errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.message || errJson.error || `HTTP ${res.status}`);
        }

        let buffer = await res.arrayBuffer();
        if (res.headers.get('content-type')?.includes('application/json')) {
            let errJson = JSON.parse(Buffer.from(buffer).toString());
            throw new Error(errJson.message || errJson.error || 'Gagal memproses meme');
        }

        await conn.sendFile(m.chat, Buffer.from(buffer), 'jarvismeme.png', `Jarvis, laksanakan! 🤖`, m);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + (e.message || e));
    }
};

handler.help = ["jarvismeme <teks>"];
handler.command = ["jarvismeme", "meme_jarvis"];
handler.tags = ["maker"];
handler.limit = true;
export default handler;
