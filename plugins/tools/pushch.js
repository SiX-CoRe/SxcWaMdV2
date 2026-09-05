let handler = async (m, { conn, args, text }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    let targetChannel = global.saluran || args[0];

    if (!targetChannel) return m.reply("⚠️ Target saluran / channel WhatsApp belum dikonfigurasi di config.js");

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        if (mime) {
            let media = await q.download();
            if (/image/.test(mime)) {
                await conn.sendMessage(targetChannel, { image: media, caption: text || '' });
            } else if (/video/.test(mime)) {
                await conn.sendMessage(targetChannel, { video: media, caption: text || '' });
            } else if (/audio/.test(mime)) {
                await conn.sendMessage(targetChannel, { audio: media, mimetype: 'audio/mp4' });
            } else {
                await conn.sendMessage(targetChannel, { document: media, mimetype: mime, fileName: 'file' });
            }
        } else if (text) {
            await conn.sendMessage(targetChannel, { text: text });
        } else {
            return m.reply("⚠️ Kirim / reply pesan atau media yang ingin dipush ke saluran!");
        }

        m.reply("✅ Pesan berhasil dipush ke saluran WhatsApp!");
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        m.reply(`❌ Gagal push ke saluran: ${e.message}`);
    }
};

handler.help = ['pushch <teks / reply media>'];
handler.tags = ['tools'];
handler.command = /^(pushch|pushsaluran|pushchannel)$/i;
handler.owner = true;

handler.limit = 1;
export default handler;
