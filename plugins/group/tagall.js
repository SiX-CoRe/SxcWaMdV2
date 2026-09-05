let handler = async (m, { conn, text, participants, groupMetadata, isAdmin, isOwner }) => {
    let users = (participants || []).map(u => u.id || u.jid).filter(Boolean);
    if (users.length === 0) return m.reply("❌ Gagal mendapatkan daftar anggota grup!");

    const groupName = groupMetadata?.subject || 'Grup WhatsApp';
    const message = text ? text.trim() : (m.quoted?.text ? m.quoted.text.trim() : 'Halo semuanya!');

    let caption = `📢 *TAG ALL - ${groupName.toUpperCase()}*\n\n` +
                  `💬 *Pesan:* ${message}\n` +
                  `👥 *Total Anggota:* ${users.length}\n` +
                  `👤 *Pengirim:* @${(m._normSender || m.sender).split('@')[0]}\n\n` +
                  `┌───❖ *DAFTAR ANGGOTA* ❖───\n`;

    for (let i = 0; i < users.length; i++) {
        caption += `│ ${i + 1}. @${users[i].split('@')[0]}\n`;
    }
    caption += `└─────────────────────────`;

    await conn.sendMessage(m.chat, { 
        text: caption, 
        mentions: users 
    }, { quoted: m });
};

handler.help = ['tagall <pesan>', 'everyone <pesan>'];
handler.tags = ['group'];
handler.command = /^(tagall|everyone|all)$/i;
handler.group = true;
handler.admin = true;

export default handler;
