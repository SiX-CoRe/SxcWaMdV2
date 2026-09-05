let handler = async (m, { conn, usedPrefix, command }) => {
    let vid;
    if (m.quoted && (m.quoted.mtype === "videoMessage" || m.quoted.msg?.mimetype?.includes('video'))) {
        vid = await m.quoted.download();
    } else if (m.mtype === "videoMessage") {
        vid = await m.download();
    }

    if (!vid) {
        return m.reply(`📹 *VIDEO TO PTV (PUSH TO VIDEO / VIDEO NOTE)*\n\nKirim atau balas video dengan perintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        await conn.sendMessage(m.chat, {
            video: vid,
            ptv: true
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        m.reply(`❌ Gagal membuat PTV: ${e.message}`);
    }
};

handler.help = ['ptv (reply video)', 'videonote (reply video)'];
handler.tags = ['tools'];
handler.command = /^(ptv|videonote|toptv)$/i;

handler.limit = 1;
export default handler;
