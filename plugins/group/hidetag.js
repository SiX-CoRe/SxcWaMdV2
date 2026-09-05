let handler = async (m, { conn, groupMetadata, text, participants }) => {
    const tag = participants || groupMetadata?.participants || [];
    if (tag.length === 0) return m.reply("❌ Gagal mendapatkan daftar anggota grup!");

    let input = text ? text.trim() : (m.quoted?.text ? m.quoted.text.trim() : '');
    if (!input) return m.reply('❌ Masukkan teks yang ingin di-hidetag atau reply pesan!');

    await conn.sendMessage(m.chat, {
        text: input,
        mentions: tag.map(a => a.jid || a.id).filter(Boolean)
    }, {
        quoted: m
    });
};

handler.help = ['hidetag <pesan>', 'h <pesan>'];
handler.tags = ['group'];
handler.command = /^(hidetag|h|ht)$/i;
handler.admin = true;
handler.group = true;

export default handler;