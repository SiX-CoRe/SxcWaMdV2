let handler = async (m, { conn }) => {
    if (!m.quoted) return m.reply("⚠️ Balas pesan sekali lihat (View Once)!");

    try {
        let q = m.quoted;
        let isViewOnce = q.viewOnce || q.msg?.viewOnce;

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh media sekali lihat.");

        let mime = (q.msg || q).mimetype || '';

        if (/image/.test(mime)) {
            await conn.sendMessage(m.chat, { image: media, caption: "🔓 *View Once Image Revealed*" }, { quoted: m });
        } else if (/video/.test(mime)) {
            await conn.sendMessage(m.chat, { video: media, caption: "🔓 *View Once Video Revealed*" }, { quoted: m });
        } else if (/audio/.test(mime)) {
            await conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mp4', ptt: true }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, { document: media, mimetype: mime, fileName: 'viewonce_file' }, { quoted: m });
        }
    } catch (e) {
        m.reply(`❌ Gagal membuka ViewOnce: ${e.message}`);
    }
};

handler.help = ['rvo (reply viewonce)', 'readviewonce (reply viewonce)'];
handler.tags = ['tools'];
handler.command = /^(rvo|readviewonce|antiviewonce)$/i;

handler.limit = 1;
export default handler;
