let handler = async (m, { conn, isAdmin, isOwner, usedPrefix, command }) => {
    let user = global.db?.data?.users?.[m._normSender || m.sender] || global.db?.data?.users?.[m.sender] || {};
    let isPrem = user.premium === true || isOwner;

    if (!isAdmin && !isOwner && !isPrem) {
        return m.reply(`🚫 *Akses Ditolak!*\n\nFitur ini hanya dapat digunakan oleh *Admin Grup*, *Owner Bot*, atau User dengan status *Premium*.\n\n> 🌐 _lumnztyz6x | sixcorecomunity_`);
    }

    if (!m.quoted) {
        return m.reply(`⚠️ *Format Salah!*\n\nReply (balas) pesan, gambar, video, audio, atau dokumen yang ingin dihapus, lalu ketik:\n👉 *${usedPrefix + command}*`);
    }

    try {
        let key = {
            remoteJid: m.chat,
            fromMe: m.quoted.fromMe,
            id: m.quoted.id,
            participant: m.quoted.sender
        };

        await conn.sendMessage(m.chat, { delete: key });
    } catch (e) {
        console.error('[Delete Error]', e);
        m.reply(`❌ *Gagal menghapus pesan!*\nPastikan bot adalah Admin di grup ini.`);
    }
};

handler.help = ['delete', 'del', 'hapus'];
handler.tags = ['group'];
handler.command = /^(delete|del|d|hapus)$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
