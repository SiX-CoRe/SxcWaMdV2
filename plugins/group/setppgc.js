let handler = async (m, { conn }) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || q.mediaType || '';

        if (!/image/.test(mime)) {
            return m.reply('⚠️ *Kirim atau balas gambar dengan caption .setppgc* untuk mengganti foto profil grup!');
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar!");

        await conn.updateProfilePicture(m.chat, media);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        m.reply("✅ *Foto profil grup berhasil diperbarui!*");
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply(`❌ *Gagal mengganti foto profil grup:* ${e.message || e}`);
    }
};

handler.help = ['setppgc', 'setppgroup'];
handler.command = /^(setppgc|setppgroup)$/i;
handler.tags = ['group'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
