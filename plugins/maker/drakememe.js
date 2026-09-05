import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    try {
        let text = args.join(' ');
        if (!text) return m.reply(`⚠️ Format salah!\nContoh: ${usedPrefix + command} Belajar | Main Game`);
        
        let [atas, bawah] = text.split('|').map(v => v.trim());
        if (!atas || !bawah) return m.reply(`⚠️ Harus ada dua teks dipisah tanda '|'\nContoh: ${usedPrefix + command} Ngerjain PR | Tidur`);

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const apiUrl = `${global.web}/api/maker/drakememe?apikey=${global.apikey.jereapi}&text1=${encodeURIComponent(atas)}&text2=${encodeURIComponent(bawah)}`;

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

        await conn.sendFile(m.chat, Buffer.from(buffer), 'drakememe.png', `Drake Meme 😎`, m);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + (e.message || e));
    }
};

handler.help = ["drakememe <teks1>|<teks2>"];
handler.command = ["drakememe", "meme_drake"];
handler.tags = ["maker"];
handler.limit = true;
export default handler;
