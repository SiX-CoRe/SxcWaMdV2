let handler = async (m, { conn, usedPrefix, command, args }) => {
    try {
        let text = args.join(' ');
        if (!text) return m.reply(`⚠️ Masukkan teks atas dan bawah dipisah dengan '|'\nContoh: ${usedPrefix + command} atas | bawah`);
        
        let [atas, bawah] = text.split('|').map(v => v.trim());
        if (!bawah) {
            bawah = atas;
            atas = '_';
        }

        const q = m.quoted ? m.quoted : m;
        const mime = q?.msg?.mimetype || q?.mimetype || "";

        if (!/image/.test(mime)) {
            return m.reply(`⚠️ Reply gambar dengan caption ${usedPrefix + command} <teks atas> | <teks bawah>`);
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const media = await q.download();
        const imgUrl = await (await import('../../lib/uploadImage.js')).default(media);

        const url = `${global.web}/api/maker/smeme`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apikey: global.apikey.jereapi,
                atas: atas,
                bawah: bawah,
                url: imgUrl
            })
        });

        if (!response.ok) throw new Error("Gagal membuat sticker meme");

        const resultBuffer = Buffer.from(await response.arrayBuffer());

        const { sticker } = await import('../../lib/sticker.js');
        const stiker = await sticker(resultBuffer, false, global.stickerPack.packname, global.stickerPack.author);

        await conn.sendMessage(m.chat, {
            sticker: stiker
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};
handler.help = ["smeme <atas>|<bawah>"];
handler.command = ["smeme", "stickermeme"];
handler.tags = ["sticker"];
handler.limit = 1;
export default handler;
